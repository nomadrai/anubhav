#!/usr/bin/env python3
"""Explicitly fetch EIA research candidates, or reproduce existing snapshots offline.

Raw data and derived price-bearing files stay git-ignored pending rights review.
prepare_episode.py remains unchanged and network-free. No new dependencies.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import math
import re
import subprocess
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
API_BASE = "https://api.eia.gov/v2/petroleum/pri/spt/data/"
TERMS_URL = "https://www.eia.gov/about/copyrights_reuse.php"
NOTES_URL = "https://www.eia.gov/dnav/pet/TblDefs/pet_pri_spt_tbldef2.asp"
SPECS = (
    {"id": "candidate-rwtc-2018-choppy", "scenario": "choppy", "start": "2018-01-02", "end": "2018-02-28"},
    {"id": "candidate-rwtc-2020-crash", "scenario": "crash", "start": "2020-02-20", "end": "2020-04-17"},
)
LICENCE_NOTE = (
    "Redistribution unresolved: EIA's general reuse page permits use and distribution "
    "of government data, but its spot-price notes identify Refinitiv, an LSEG business, "
    "as the upstream source and the reuse page excludes protected third-party material. "
    "TODO(human): obtain dataset-specific rights/attribution confirmation. "
    "Keep raw snapshots and normalized price inputs out of git; candidate episode JSON remains non-runtime research data with this unresolved note."
)


def digest(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def provenance_path(path: Path) -> str:
    resolved = path.resolve()
    try:
        return resolved.relative_to(ROOT).as_posix()
    except ValueError:
        return str(resolved)


def request_url(spec: dict[str, str]) -> str:
    # DEMO_KEY is EIA's public demonstration credential, not a private account key.
    return API_BASE + "?" + urlencode([
        ("api_key", "DEMO_KEY"), ("frequency", "daily"), ("data[0]", "value"),
        ("facets[series][]", "RWTC"), ("start", spec["start"]), ("end", spec["end"]),
        ("sort[0][column]", "period"), ("sort[0][direction]", "asc"),
    ])


def rows_from_snapshot(spec: dict[str, str], raw: bytes) -> list[dict[str, str]]:
    document = json.loads(raw)
    response = document.get("response", {})
    rows = response.get("data")
    if response.get("frequency") != "daily" or not isinstance(rows, list) or len(rows) < 2:
        raise ValueError("expected at least two daily EIA rows")
    if int(response.get("total", -1)) != len(rows):
        raise ValueError("incomplete/paginated source response: total differs from row count")
    cleaned = []
    for row in rows:
        if not isinstance(row, dict) or any(row.get(key) != expected for key, expected in (
            ("series", "RWTC"), ("units", "$/BBL"), ("product", "EPCWTI"),
            ("duoarea", "YCUOK"), ("process", "PF4"),
        )):
            raise ValueError("unexpected EIA series, units, location, product, or process")
        period, value = row.get("period"), row.get("value")
        if not isinstance(period, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", period):
            raise ValueError("invalid source observation date")
        date.fromisoformat(period)
        if not spec["start"] <= period <= spec["end"]:
            raise ValueError("source observation outside requested dates")
        if not isinstance(value, str) or not value.strip():
            raise ValueError("missing source value; no filling or silent removal allowed")
        numeric = float(value)
        if not math.isfinite(numeric) or numeric <= 0:
            raise ValueError("non-positive/non-finite source value; no clipping allowed")
        cleaned.append({"date": period, "close": value})
    dates = [row["date"] for row in cleaned]
    if dates != sorted(set(dates)):
        raise ValueError("source dates must be sorted and unique")
    if dates[0] != spec["start"] or dates[-1] != spec["end"]:
        raise ValueError("requested boundary observations missing")
    return cleaned


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")


def acquire(spec: dict[str, str], output_root: Path, offline: bool) -> Path:
    candidate_id = spec["id"]
    url = request_url(spec)
    raw_path = output_root / "raw" / f"{candidate_id}.source.json"
    receipt_path = output_root / f"{candidate_id}.acquisition.json"
    if offline:
        # Preserve each original timestamp; never invent a new retrieval on rebuild.
        receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
        raw = raw_path.read_bytes()
        if receipt["requestUrl"] != url or receipt["rawInputSha256"] != digest(raw):
            raise ValueError("raw snapshot or request does not match acquisition receipt")
    else:
        request = Request(url, headers={"User-Agent": "offline-candidate-research/1.0", "Accept": "application/json"})
        with urlopen(request, timeout=30) as response:
            if response.status != 200 or response.url != url:
                raise ValueError("unexpected HTTP status or redirect")
            raw = response.read(1_000_001)
            if len(raw) > 1_000_000:
                raise ValueError("response exceeds one megabyte research limit")
            receipt = {
                "candidateId": candidate_id,
                "scenario": spec["scenario"],
                "requestUrl": url,
                "httpStatus": response.status,
                "finalUrl": response.url,
                "retrievedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
                "contentType": response.headers.get("Content-Type"),
                "rawInputSha256": digest(raw),
                "rawInputBytes": len(raw),
                "rawInputPath": provenance_path(raw_path),
            }
    rows = rows_from_snapshot(spec, raw)
    for directory in ("raw", "inputs", "metadata", "episodes"):
        (output_root / directory).mkdir(parents=True, exist_ok=True)
    if not offline:
        raw_path.write_bytes(raw)
    csv_path = output_root / "inputs" / f"{candidate_id}.csv"
    text = io.StringIO(newline="")
    writer = csv.DictWriter(text, fieldnames=("date", "close"), lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    csv_path.write_bytes(text.getvalue().encode("utf-8"))
    metadata = {
        "expectedDates": [row["date"] for row in rows],
        "intradayAvailable": False,
        "isPlaceholder": False,
        "provenance": {
            "sourceName": "U.S. Energy Information Administration; upstream Refinitiv, an LSEG business",
            "sourceUrl": url,
            "retrievedOn": receipt["retrievedAt"][:10],
            "licenceNote": LICENCE_NOTE,
        },
        "reveal": {
            "periodText": {
                "en": f"Observed daily values: {spec['start']} to {spec['end']}. Not a forecast.",
                "hi": "TODO(human): draft Hindi period text and native-speaker review required.",
            },
            "whatHappenedText": {
                "en": "TODO(human): review the historical path, selection bias, and neutral reveal copy before use.",
                "hi": "TODO(human): draft Hindi explanation and native-speaker review required.",
            },
        },
    }
    meta_path = output_root / "metadata" / f"{candidate_id}.meta.yaml"
    # JSON is a YAML subset, accepted by the existing PyYAML-based offline CLI.
    write_json(meta_path, metadata)
    episode_path = output_root / "episodes" / f"{candidate_id}.episode.json"
    subprocess.run([
        sys.executable, str(ROOT / "scripts/prepare_episode.py"),
        "--csv", str(csv_path), "--id", candidate_id,
        "--start", spec["start"], "--end", spec["end"],
        "--meta", str(meta_path), "--output", str(episode_path),
    ], check=True, capture_output=True, text=True)
    episode = json.loads(episode_path.read_text(encoding="utf-8"))
    receipt.update({
        "rawInputPath": provenance_path(raw_path),
        "preparedInputPath": provenance_path(csv_path),
        "preparedInputSha256": digest(csv_path.read_bytes()),
        "rowCount": len(rows),
        "requestedDateRange": {"start": spec["start"], "end": spec["end"]},
        "observedDateRange": {"start": rows[0]["date"], "end": rows[-1]["date"]},
        "sourceIdentifier": {
            "publisher": "U.S. Energy Information Administration",
            "upstreamSource": "Refinitiv, an LSEG business (per EIA definitions page)",
            "apiDataset": "petroleum/pri/spt", "series": "RWTC",
            "seriesDescription": "Cushing, OK WTI Spot Price FOB (Dollars per Barrel)",
            "frequency": "daily", "units": "$/BBL", "product": "EPCWTI",
            "process": "PF4", "location": "YCUOK",
        },
        "licenceNote": LICENCE_NOTE,
        "termsUrl": TERMS_URL,
        "definitionsUrl": NOTES_URL,
        "transformations": [
            "period -> date and value -> close; retain original observation order and values",
            "No scaling, imputation, resampling, adjustment, calendar inference, or OHLC fabrication",
            "expectedDates lists returned observations only; not an independently verified session calendar",
        ],
        "timeZone": "TODO(human): exact observation time/timezone not established",
        "adjustment": "No adjustment applied; spot-price observations, not a total-return security series",
        "candidateStatus": "candidate-not-approved",
        "humanApproved": False,
        "hindiStatus": "draft",
        "distribution": "raw snapshots and normalized price inputs are git-ignored; candidate JSON is non-runtime research data and remains unapproved",
    })
    write_json(receipt_path, receipt)
    episode.update({"candidateStatus": "candidate-not-approved", "humanApproved": False, "hindiStatus": "draft"})
    episode["provenance"].update({"acquisition": receipt})
    write_json(episode_path, episode)
    return episode_path


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-root", type=Path, default=ROOT / "data/candidates")
    parser.add_argument("--offline", action="store_true", help="read raw snapshots and their receipts; never fetch")
    args = parser.parse_args(argv)
    output_root = args.output_root.resolve()
    if any(output_root.is_relative_to(ROOT / directory) for directory in ("src", "public", "dist")):
        parser.error("candidates must remain outside runtime source/public/build directories")
    try:
        for spec in SPECS:
            print(acquire(spec, output_root, args.offline))
    except (OSError, ValueError, KeyError, TypeError, subprocess.CalledProcessError) as exc:
        parser.exit(2, f"candidate acquisition failed: {exc}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
