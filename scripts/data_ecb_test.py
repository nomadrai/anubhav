"""Offline regression tests for the ECB importer; numbers below are synthetic test inputs."""
import json
import math
import tempfile
import unittest
from pathlib import Path

from scripts.data_ecb import NAMESPACE, SOURCE_URL, observations, prepare, review


def xml(days: str) -> bytes:
    return (f'<gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01" xmlns="{NAMESPACE}">'
            '<gesmes:Sender><gesmes:name>European Central Bank</gesmes:name></gesmes:Sender>'
            f'<Cube>{days}</Cube></gesmes:Envelope>').encode()


def day(when: str, value: str = "1.25", currency: str = "USD") -> str:
    return f'<Cube time="{when}"><Cube currency="{currency}" rate="{value}"/></Cube>'


class EcbDataTests(unittest.TestCase):
    def test_sorts_observed_days_without_inventing_calendar_rows(self):
        result = observations(xml(day("2020-01-06", "1.20") + day("2020-01-02")), "2020-01-02", "2020-01-06")
        self.assertEqual(result, [("2020-01-02", "1.25"), ("2020-01-06", "1.20")])
        measured = review(result)
        self.assertEqual(measured["absentCalendarDates"], ["2020-01-03", "2020-01-04", "2020-01-05"])
        self.assertAlmostEqual(measured["maxDrawdown"], -0.04)
        self.assertEqual(measured["barCount"], 2)

    def test_missing_currency_fails_instead_of_silently_shortening_window(self):
        with self.assertRaisesRegex(ValueError, "Missing or duplicate USD"):
            observations(xml(day("2020-01-02") + day("2020-01-03", currency="JPY")), "2020-01-02", "2020-01-03")

    def test_missing_requested_boundary_fails(self):
        with self.assertRaisesRegex(ValueError, "boundary"):
            observations(xml(day("2020-01-02") + day("2020-01-03")), "2020-01-01", "2020-01-03")

    def test_duplicate_dates_fail(self):
        with self.assertRaisesRegex(ValueError, "Duplicate observation date"):
            observations(xml(day("2020-01-02") * 2 + day("2020-01-03")), "2020-01-02", "2020-01-03")

    def test_duplicate_currency_fails(self):
        raw = xml('<Cube time="2020-01-02"><Cube currency="USD" rate="1"/><Cube currency="USD" rate="2"/></Cube>' + day("2020-01-03"))
        with self.assertRaisesRegex(ValueError, "Missing or duplicate USD"):
            observations(raw, "2020-01-02", "2020-01-03")

    def test_nonfinite_nonpositive_missing_or_invalid_numbers_fail(self):
        for value in ("NaN", "Infinity", "0", "-1", "", "not-a-number"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                observations(xml(day("2020-01-02", value) + day("2020-01-03")), "2020-01-02", "2020-01-03")

    def test_wrong_publisher_and_xml_entities_fail(self):
        raw = xml(day("2020-01-02") + day("2020-01-03"))
        with self.assertRaisesRegex(ValueError, "publisher"):
            observations(raw.replace(b"European Central Bank", b"Test publisher"), "2020-01-02", "2020-01-03")
        with self.assertRaisesRegex(ValueError, "XML declarations"):
            observations(b'<!DOCTYPE foo>' + raw, "2020-01-02", "2020-01-03")

    def test_corrupt_snapshot_fails_before_preparation(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / "eurofxref-hist.xml").write_bytes(b"corrupt")
            (root / "acquisition.json").write_text(json.dumps({"url": SOURCE_URL, "finalUrl": SOURCE_URL, "status": 200, "sha256": "0" * 64, "bytes": 7}))
            with self.assertRaisesRegex(ValueError, "hash/length"):
                prepare(root, root / "output")
            self.assertFalse((root / "output").exists())

    def test_committed_episodes_have_recomputable_numeric_and_date_evidence(self):
        root = Path(__file__).resolve().parent.parent / "src/data/episodes"
        for identifier, count in (("historical-crash", 76), ("historical-choppy", 42)):
            episode = json.loads((root / f"{identifier}.json").read_text())
            measured = review([(bar["date"], str(bar["close"])) for bar in episode["bars"]])
            self.assertEqual(measured, episode["provenance"]["validation"])
            self.assertEqual(measured["barCount"], count)
            for key, value in episode["stats"].items():
                self.assertTrue(math.isclose(measured[key], value, abs_tol=1e-12))
            self.assertFalse(episode["isPlaceholder"])
            self.assertFalse(episode["intradayAvailable"])
            self.assertFalse(episode["provenance"]["review"]["humanApproved"])
            self.assertFalse(episode["provenance"]["review"]["nativeSpeakerReviewed"])


if __name__ == "__main__":
    unittest.main()
