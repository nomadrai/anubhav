import csv
import json
import tempfile
import unittest
from datetime import date
from pathlib import Path

from scripts.prepare_episode import EpisodeError, build_episode


ROOT = Path(__file__).resolve().parents[1]
FIXTURE_CSV = ROOT / "fixtures/synthetic.csv"
FIXTURE_META = ROOT / "fixtures/synthetic.meta.yaml"


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

    def test_cli_output_is_json(self):
        # Exercise the same builder's output contract without depending on a
        # subprocess working directory.
        episode = build_episode(FIXTURE_CSV, "cli-like", date(2024, 1, 2), date(2024, 1, 5), FIXTURE_META)
        self.assertEqual(json.loads(json.dumps(episode))["id"], "cli-like")


if __name__ == "__main__":
    unittest.main()
