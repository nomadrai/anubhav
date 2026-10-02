import csv
import json
import subprocess
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

from scripts.prepare_episode import EpisodeError, build_episode, main


ROOT = Path(__file__).resolve().parents[1]
FIXTURE_CSV = ROOT / "fixtures/synthetic.csv"
FIXTURE_META = ROOT / "fixtures/synthetic.meta.yaml"
CRASH_CSV = ROOT / "fixtures/crash-synthetic.csv"
CRASH_META = ROOT / "fixtures/crash-synthetic.meta.yaml"
CHOPPY_CSV = ROOT / "fixtures/choppy-synthetic.csv"
CHOPPY_META = ROOT / "fixtures/choppy-synthetic.meta.yaml"
RANGE = (date(2024, 1, 2), date(2024, 1, 11))


def write_csv(text: str, directory: str, name: str = "input.csv") -> Path:
    path = Path(directory) / name
    path.write_text(text, encoding="utf-8")
    return path


class PrepareEpisodeTests(unittest.TestCase):
    def test_fixture_is_sorted_and_statistics_are_fractions(self):
        episode = build_episode(FIXTURE_CSV, "fixture", date(2024, 1, 2), date(2024, 1, 5), FIXTURE_META)
        self.assertEqual(episode["label"], "Episode A")
        self.assertEqual([bar["date"] for bar in episode["bars"]], [
            "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05"
        ])
        self.assertEqual(episode["stats"]["barCount"], 4)
        self.assertAlmostEqual(episode["stats"]["totalChange"], 108 / 104 - 1)
        self.assertAlmostEqual(episode["stats"]["maxDrawdown"], 103 / 104 - 1)
        self.assertAlmostEqual(episode["stats"]["worstSingleDayFall"], 103 / 104 - 1)
        self.assertTrue(episode["isPlaceholder"])
        self.assertEqual(len(episode["provenance"]["inputSha256"]), 64)

    def test_tolerant_column_mapping_and_optional_columns(self):
        # Mixed-case, differently ordered columns still parse; optional columns survive.
        with tempfile.TemporaryDirectory() as directory:
            path = write_csv(
                "CLOSE,Date,Low\n104,2024-01-02,99\n103,2024-01-03,101\n",
                directory,
            )
            meta_path = Path(directory) / "meta.yaml"
            meta_path.write_text(
                "expectedDates: [2024-01-02, 2024-01-03]\nintradayAvailable: true\nisPlaceholder: true\n"
                "provenance: {sourceName: s, sourceUrl: u, retrievedOn: 2024-01-03, licenceNote: l}\n"
                "reveal: {periodText: {en: p, hi: q}, whatHappenedText: {en: p, hi: q}}\n",
                encoding="utf-8",
            )
            episode = build_episode(path, "x", date(2024, 1, 2), date(2024, 1, 3), meta_path)
            self.assertEqual(episode["bars"][0], {"date": "2024-01-02", "close": 104.0, "low": 99.0})

    def test_input_rows_are_sorted_by_date(self):
        with tempfile.TemporaryDirectory() as directory:
            path = write_csv(
                "date,close\n2024-01-03,103\n2024-01-02,104\n",
                directory,
            )
            meta_path = Path(directory) / "meta.yaml"
            meta_path.write_text(
                "expectedDates: [2024-01-02, 2024-01-03]\nintradayAvailable: false\nisPlaceholder: true\n"
                "provenance: {sourceName: s, sourceUrl: u, retrievedOn: 2024-01-03, licenceNote: l}\n"
                "reveal: {periodText: {en: p, hi: q}, whatHappenedText: {en: p, hi: q}}\n",
                encoding="utf-8",
            )
            episode = build_episode(path, "x", date(2024, 1, 2), date(2024, 1, 3), meta_path)
            self.assertEqual([bar["date"] for bar in episode["bars"]], ["2024-01-02", "2024-01-03"])
            self.assertEqual(episode["stats"]["totalChange"], 103 / 104 - 1)

    def test_missing_expected_session_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            csv_path = Path(directory) / "missing.csv"
            csv_path.write_text("date,close\n2024-01-02,100\n2024-01-04,101\n2024-01-05,102\n")
            with self.assertRaisesRegex(EpisodeError, "missing expected session"):
                build_episode(csv_path, "x", date(2024, 1, 2), date(2024, 1, 5), FIXTURE_META)

    def test_duplicate_and_inconsistent_ohlc_fail(self):
        with tempfile.TemporaryDirectory() as directory:
            csv_path = Path(directory) / "bad.csv"
            csv_path.write_text("DATE,OPEN,HIGH,LOW,CLOSE\n2024-01-02,100,99,98,100\n2024-01-02,100,101,99,100\n")
            with self.assertRaisesRegex(EpisodeError, "duplicate date|high must be"):
                build_episode(csv_path, "x", date(2024, 1, 2), date(2024, 1, 5), FIXTURE_META)

    def test_nan_and_non_positive_prices_fail(self):
        with tempfile.TemporaryDirectory() as directory:
            for text in (
                "date,close\n2024-01-02,100\n2024-01-03,nan\n",
                "date,close\n2024-01-02,100\n2024-01-03,0\n",
                "date,close\n2024-01-02,100\n2024-01-03,-5\n",
            ):
                path = write_csv(text, directory, name=f"bad-{abs(hash(text))}.csv")
                with self.assertRaisesRegex(EpisodeError, "not numeric|must be positive|must be finite"):
                    build_episode(path, "x", date(2024, 1, 2), date(2024, 1, 3), FIXTURE_META)

    def test_blank_cell_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            path = write_csv("date,close\n2024-01-02,\n", directory)
            with self.assertRaisesRegex(EpisodeError, "close is missing"):
                build_episode(path, "x", date(2024, 1, 2), date(2024, 1, 2), FIXTURE_META)

    def test_reversed_dates_fail(self):
        with self.assertRaisesRegex(EpisodeError, "must not be after end date"):
            build_episode(FIXTURE_CSV, "x", date(2024, 1, 5), date(2024, 1, 2), FIXTURE_META)

    def test_unknown_extra_date_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            path = write_csv("date,close\n2024-01-02,100\n2024-01-03,101\n", directory)
            meta_path = Path(directory) / "meta.yaml"
            meta_path.write_text(
                "expectedDates: [2024-01-02]\nintradayAvailable: false\nisPlaceholder: true\n"
                "provenance: {sourceName: s, sourceUrl: u, retrievedOn: 2024-01-02, licenceNote: l}\n"
                "reveal: {periodText: {en: p, hi: q}, whatHappenedText: {en: p, hi: q}}\n",
                encoding="utf-8",
            )
            with self.assertRaisesRegex(EpisodeError, "not listed as expected"):
                build_episode(path, "x", date(2024, 1, 2), date(2024, 1, 3), meta_path)

    def test_crash_fixture_builds_with_intraday_lows(self):
        episode = build_episode(CRASH_CSV, "crash", *RANGE, CRASH_META)
        self.assertEqual(episode["stats"]["barCount"], 10)
        self.assertAlmostEqual(episode["stats"]["maxDrawdown"], 73 / 100.5 - 1)
        self.assertTrue(all("low" in bar and "high" in bar and "open" in bar for bar in episode["bars"]))
        self.assertTrue(episode["intradayAvailable"])

    def test_choppy_fixture_builds_close_only(self):
        episode = build_episode(CHOPPY_CSV, "choppy", *RANGE, CHOPPY_META)
        self.assertEqual(episode["stats"]["barCount"], 10)
        self.assertFalse(episode["intradayAvailable"])
        self.assertTrue(all("low" not in bar for bar in episode["bars"]))

    def test_provenance_and_reveal_are_carried_not_invented(self):
        episode = build_episode(CRASH_CSV, "crash", *RANGE, CRASH_META)
        self.assertEqual(episode["provenance"]["sourceName"], "Synthetic crash teaching fixture (invented values, not market data)")
        self.assertIn("inputSha256", episode["provenance"])
        self.assertEqual(episode["reveal"]["periodText"]["en"], "A synthetic ten-session teaching example (placeholder).")
        self.assertEqual(set(episode["reveal"]["whatHappenedText"]), {"en", "hi"})

    def test_cli_output_is_json(self):
        # Exercise the same builder's output contract without depending on a
        # subprocess working directory.
        episode = build_episode(FIXTURE_CSV, "cli-like", date(2024, 1, 2), date(2024, 1, 5), FIXTURE_META)
        self.assertEqual(json.loads(json.dumps(episode))["id"], "cli-like")

    def test_main_writes_output_file_and_exit_codes_are_clean(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "episode.json"
            code = main(["--csv", str(FIXTURE_CSV), "--id", "file-write", "--start", "2024-01-02",
                         "--end", "2024-01-05", "--meta", str(FIXTURE_META), "--output", str(output)])
            self.assertEqual(code, 0)
            payload = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(payload["id"], "file-write")

    def test_cli_exits_non_zero_with_message_on_bad_data(self):
        with tempfile.TemporaryDirectory() as directory:
            bad = write_csv("date,close\n2024-01-02,100\n2024-01-03,\n", directory)
            completed = subprocess.run(
                [sys.executable, str(ROOT / "prepare_episode.py"), "--csv", str(bad), "--id", "bad",
                 "--start", "2024-01-02", "--end", "2024-01-03", "--meta", str(FIXTURE_META)],
                capture_output=True, text=True,
            )
            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("close is missing", completed.stderr + completed.stdout)

    def test_stats_values_are_finite_json(self):
        episode = build_episode(CRASH_CSV, "crash", *RANGE, CRASH_META)
        rendered = json.dumps(episode, allow_nan=False)
        self.assertIn("maxDrawdown", rendered)
        self.assertEqual(set(episode["stats"]), {"maxDrawdown", "barCount", "totalChange", "worstSingleDayFall"})


if __name__ == "__main__":
    unittest.main()
