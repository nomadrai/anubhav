"""Offline acquisition regression tests. Test response values below are invented."""
from __future__ import annotations

import copy
import contextlib
import hashlib
import io
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts import acquire_eia_candidates as acquisition

ROOT = Path(__file__).resolve().parents[2]


def response_bytes(spec: dict[str, str]) -> bytes:
    rows = [
        {"period": period, "value": value, "series": "RWTC", "units": "$/BBL",
         "product": "EPCWTI", "duoarea": "YCUOK", "process": "PF4"}
        for period, value in ((spec["start"], "100.00"), (spec["end"], "90.00"))
    ]
    return json.dumps({"response": {"total": "2", "frequency": "daily", "data": rows}}).encode()


class AcquireCandidateTest(unittest.TestCase):
    def test_reduces_source_fields_without_imputation(self) -> None:
        spec = acquisition.SPECS[0]
        rows = acquisition.rows_from_snapshot(spec, response_bytes(spec))
        self.assertEqual(rows, [{"date": spec["start"], "close": "100.00"},
                                {"date": spec["end"], "close": "90.00"}])

    def test_fails_closed_on_missing_nonfinite_nonpositive_or_nonnumeric_values(self) -> None:
        spec = acquisition.SPECS[0]
        for value in (None, "", " ", ".", "0", "-1", "NaN", "Infinity", "text"):
            with self.subTest(value=value):
                document = json.loads(response_bytes(spec))
                document["response"]["data"][0]["value"] = value
                with self.assertRaises(ValueError):
                    acquisition.rows_from_snapshot(spec, json.dumps(document).encode())

    def test_rejects_wrong_series_units_frequency_and_pagination(self) -> None:
        spec = acquisition.SPECS[0]
        original = json.loads(response_bytes(spec))
        for key in ("series", "units", "product", "duoarea", "process"):
            with self.subTest(key=key):
                document = copy.deepcopy(original)
                document["response"]["data"][0][key] = "wrong"
                with self.assertRaises(ValueError):
                    acquisition.rows_from_snapshot(spec, json.dumps(document).encode())
        for key, value in (("total", "3"), ("frequency", "monthly")):
            document = copy.deepcopy(original)
            document["response"][key] = value
            with self.assertRaises(ValueError):
                acquisition.rows_from_snapshot(spec, json.dumps(document).encode())

    def test_rejects_duplicate_reversed_invalid_and_out_of_range_dates(self) -> None:
        spec = acquisition.SPECS[0]
        for dates in ((spec["start"], spec["start"]), (spec["end"], spec["start"]),
                      ("2018-02-30", spec["end"]), ("2017-12-31", spec["end"]),
                      ("2018-01-03", spec["end"])):
            with self.subTest(dates=dates):
                document = json.loads(response_bytes(spec))
                for row, period in zip(document["response"]["data"], dates):
                    row["period"] = period
                with self.assertRaises(ValueError):
                    acquisition.rows_from_snapshot(spec, json.dumps(document).encode())

    def test_offline_reproduction_preserves_receipt_hash_timestamp_and_unapproved_status(self) -> None:
        spec = acquisition.SPECS[0]
        with tempfile.TemporaryDirectory() as directory:
            output_root = Path(directory)
            (output_root / "raw").mkdir()
            raw = response_bytes(spec)
            raw_path = output_root / "raw" / f"{spec['id']}.source.json"
            raw_path.write_bytes(raw)
            receipt = {"requestUrl": acquisition.request_url(spec),
                       "rawInputSha256": hashlib.sha256(raw).hexdigest(),
                       "retrievedAt": "2026-10-03T06:11:09Z"}
            acquisition.write_json(output_root / f"{spec['id']}.acquisition.json", receipt)
            with patch.object(acquisition, "urlopen", side_effect=AssertionError("offline fetched")):
                path = acquisition.acquire(spec, output_root, offline=True)
                first = path.read_bytes()
                acquisition.acquire(spec, output_root, offline=True)
                self.assertEqual(path.read_bytes(), first)
            candidate = json.loads(first)
            self.assertFalse(candidate["humanApproved"])
            self.assertFalse(candidate["isPlaceholder"])
            self.assertFalse(candidate["intradayAvailable"])
            self.assertEqual(candidate["hindiStatus"], "draft")
            audit = candidate["provenance"]["acquisition"]
            self.assertEqual(audit["retrievedAt"], receipt["retrievedAt"])
            self.assertEqual(audit["rawInputPath"], str(raw_path.resolve()))
            self.assertEqual(audit["preparedInputPath"], str((output_root / "inputs" / f"{spec['id']}.csv").resolve()))
            self.assertEqual(audit["preparedInputSha256"], candidate["provenance"]["inputSha256"])
            raw_path.write_bytes(raw + b" ")
            with self.assertRaisesRegex(ValueError, "does not match"):
                acquisition.acquire(spec, output_root, offline=True)

    def test_rejects_runtime_output_directory(self) -> None:
        with contextlib.redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit) as caught:
                acquisition.main(["--offline", "--output-root", str(ROOT / "src/candidates")])
        self.assertEqual(caught.exception.code, 2)

    def test_price_files_are_git_ignored_and_resources_have_evidence_not_human_approval(self) -> None:
        for directory in ("raw", "inputs"):
            path = f"data/candidates/{directory}/example.json"
            result = subprocess.run(["git", "check-ignore", path], cwd=ROOT, capture_output=True)
            self.assertEqual(result.returncode, 0, path)
        for directory in ("metadata", "episodes"):
            path = f"data/candidates/{directory}/example.json"
            result = subprocess.run(["git", "check-ignore", path], cwd=ROOT, capture_output=True)
            self.assertNotEqual(result.returncode, 0, path)
        resources = json.loads((ROOT / "src/content/resources.json").read_text())
        for resource in resources:
            self.assertIs(resource["humanReview"]["humanApproved"], False)
            self.assertIs(resource["humanReview"]["nativeSpeakerReviewed"], False)
            self.assertEqual(resource["automatedCheck"]["status"], 200)
            if resource["verified"]:
                self.assertEqual(resource["status"], "agent-checked")
                self.assertTrue(resource["evidence"]["record"].startswith("docs/RESOURCE_CHECKS.md#"))
                self.assertEqual(resource["automatedCheck"]["finalUrl"], resource["url"])
                self.assertEqual(resource["checkedOn"], "2026-10-03")


if __name__ == "__main__":
    unittest.main()
