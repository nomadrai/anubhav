#!/usr/bin/env python3
"""Explicit ECB acquisition, then network-free preparation of two teaching windows.

By default, verify preserved bytes/receipt and rebuild offline. --fetch is an
explicit network action. No date calendar, price interpolation or causal story.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import math
import subprocess
import sys
import xml.etree.ElementTree as ET
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

import yaml

ROOT = Path(__file__).resolve().parent.parent
SOURCE_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml"
TERMS_URL = "https://www.ecb.europa.eu/services/disclaimer/html/index.en.html"
DEFINITIONS_URL = "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html"
SERIES = "EXR.D.USD.EUR.SP00.A"
NAMESPACE = "http://www.ecb.int/vocabulary/2002-08-01/eurofxref"
TERMS_QUOTE = "When such information is distributed or reproduced, it must appear accurately and the ECB must be cited as the source."
MODIFICATION_QUOTE = "If the information is modified by the user (e.g. by seasonal adjustment of statistical data or calculation of growth rates) this must be stated explicitly."
WINDOWS = (
    ("historical-crash", "2008-07-15", "2008-10-28", "crash", "Episode A"),
    ("historical-choppy", "2019-01-02", "2019-02-28", "choppy", "Episode B"),
)
SOURCE_LABEL = {
    "en": "Source: European Central Bank. Relative changes calculated for this lesson.",
    "hi": "स्रोत: यूरोपीय केंद्रीय बैंक। इस पाठ के लिए सापेक्ष बदलाव की गणना की गई है।",
}


def digest(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")


def fetch_snapshot(root: Path) -> None:
    root.mkdir(parents=True, exist_ok=True)
    request = Request(SOURCE_URL, headers={"User-Agent": "offline-learning-data-preparation/1.0"})
    with urlopen(request, timeout=60) as response:
        if response.status != 200 or response.url != SOURCE_URL:
            raise ValueError("Unexpected source response status or redirect; inspect before reuse")
        raw = response.read(16 * 1024 * 1024 + 1)
        if len(raw) > 16 * 1024 * 1024:
            raise ValueError("Source exceeds acquisition size limit")
        receipt = {
            "url": SOURCE_URL, "finalUrl": response.url, "status": response.status,
            "fetchedAt": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
            "contentType": response.headers.get("Content-Type"),
            "bytes": len(raw), "sha256": digest(raw),
        }
    # Validate the exact requested windows before replacing a preserved snapshot.
    for _, start, end, _, _ in WINDOWS:
        observations(raw, start, end)
    (root / "eurofxref-hist.xml").write_bytes(raw)
    write_json(root / "acquisition.json", receipt)


def observations(raw: bytes, start: str, end: str) -> list[tuple[str, str]]:
    """Preserve all USD observations inside a window; fail on any malformed row."""
    if date.fromisoformat(start) > date.fromisoformat(end):
        raise ValueError("Reversed window")
    if b"<!DOCTYPE" in raw.upper() or b"<!ENTITY" in raw.upper():
        raise ValueError("External/custom XML declarations are not accepted")
    tree = ET.fromstring(raw)
    publisher = tree.find("{http://www.gesmes.org/xml/2002-08-01}Sender/{http://www.gesmes.org/xml/2002-08-01}name")
    if publisher is None or publisher.text != "European Central Bank":
        raise ValueError("Unexpected XML publisher")
    rows: list[tuple[str, str]] = []
    seen: set[str] = set()
    for node in tree.iter(f"{{{NAMESPACE}}}Cube"):
        day = node.get("time")
        if day is None:
            continue
        if date.fromisoformat(day).isoformat() != day:
            raise ValueError("Non-ISO observation date")
        if not start <= day <= end:
            continue
        if day in seen:
            raise ValueError(f"Duplicate observation date: {day}")
        seen.add(day)
        values = [child.get("rate") for child in node if child.get("currency") == "USD"]
        if len(values) != 1 or values[0] is None or not values[0].strip():
            raise ValueError(f"Missing or duplicate USD observation: {day}")
        raw_value = values[0]
        value = float(raw_value)
        if not math.isfinite(value) or value <= 0:
            raise ValueError(f"Nonfinite/nonpositive observation: {day}")
        rows.append((day, raw_value))
    rows.sort()
    if len(rows) < 2 or rows[0][0] != start or rows[-1][0] != end:
        raise ValueError("Requested boundary observation is absent")
    return rows


def review(rows: list[tuple[str, str]]) -> dict[str, Any]:
    values = [float(value) for _, value in rows]
    peak = values[0]
    drawdown = 0.0
    for value in values:
        peak = max(peak, value)
        drawdown = min(drawdown, value / peak - 1)
    changes = [b / a - 1 for a, b in zip(values, values[1:])]
    observed = {day for day, _ in rows}
    cursor = date.fromisoformat(rows[0][0])
    last = date.fromisoformat(rows[-1][0])
    absent = []
    while cursor <= last:
        if cursor.isoformat() not in observed:
            absent.append(cursor.isoformat())
        cursor += timedelta(days=1)
    return {
        "barCount": len(rows), "firstDate": rows[0][0], "lastDate": rows[-1][0],
        "firstValue": values[0], "lastValue": values[-1], "minimum": min(values), "maximum": max(values),
        "totalChange": values[-1] / values[0] - 1, "maxDrawdown": drawdown,
        "worstSingleDayFall": min(0.0, *changes),
        "upSteps": sum(change > 0 for change in changes), "downSteps": sum(change < 0 for change in changes),
        "unchangedSteps": sum(change == 0 for change in changes),
        "missingValueCount": 0, "duplicateDateCount": 0, "nonpositiveValueCount": 0,
        "absentCalendarDates": absent,
        "calendarNote": "Absent dates are only dates not returned by the source. No holiday/weekend/missing-session classification or fill is performed.",
    }


def prepare(raw_root: Path, output_root: Path) -> list[dict[str, Any]]:
    raw = (raw_root / "eurofxref-hist.xml").read_bytes()
    receipt = json.loads((raw_root / "acquisition.json").read_text(encoding="utf-8"))
    if receipt["url"] != SOURCE_URL or receipt["finalUrl"] != SOURCE_URL or receipt["status"] != 200:
        raise ValueError("Receipt does not identify the approved source response")
    if receipt["sha256"] != digest(raw) or receipt["bytes"] != len(raw):
        raise ValueError("Snapshot hash/length does not match acquisition receipt")
    fetched = datetime.fromisoformat(receipt["fetchedAt"].replace("Z", "+00:00"))
    if fetched.utcoffset() != timedelta(0):
        raise ValueError("Acquisition timestamp must be UTC")
    retrieved_on = fetched.date().isoformat()
    output_root.mkdir(parents=True, exist_ok=True)
    reports = []
    for episode_id, start, end, scenario, label in WINDOWS:
        rows = observations(raw, start, end)
        summary = review(rows)
        stream = io.StringIO(newline="")
        writer = csv.writer(stream, lineterminator="\n")
        writer.writerow(["date", "close"])
        writer.writerows(rows)
        csv_path = raw_root / f"{episode_id}.csv"
        csv_path.write_text(stream.getvalue(), encoding="utf-8")
        total = abs(summary["totalChange"] * 100)
        fall = abs(summary["maxDrawdown"] * 100)
        if summary["totalChange"] < 0:
            result_en = f"The last observation was {total:.2f}% below the first."
            result_hi = f"अंतिम दर्ज मान पहले मान से {total:.2f}% नीचे था।"
        else:
            result_en = f"The last observation was {total:.2f}% above the first."
            result_hi = f"अंतिम दर्ज मान पहले मान से {total:.2f}% ऊपर था।"
        reveal = {
            "periodText": {
                "en": f"{start} to {end}: {len(rows)} daily observations.",
                "hi": f"{start} से {end}: {len(rows)} दैनिक दर्ज मान।",
            },
            "whatHappenedText": {
                "en": f"{result_en} The largest fall from an earlier high was {fall:.2f}%. This selected past path is not a forecast.",
                "hi": f"{result_hi} पहले के किसी ऊँचे मान से सबसे बड़ी गिरावट {fall:.2f}% थी। चुना गया यह पुराना रास्ता भविष्य का अनुमान नहीं है।",
            },
        }
        meta = {
            "expectedDates": [day for day, _ in rows], "intradayAvailable": False, "isPlaceholder": False,
            "provenance": {
                "sourceName": "European Central Bank — euro foreign exchange reference rates, USD per EUR",
                "sourceUrl": SOURCE_URL, "retrievedOn": retrieved_on,
                "licenceNote": f"ECB copyright/reuse conditions ({TERMS_URL}), checked 2026-10-03. {TERMS_QUOTE} {MODIFICATION_QUOTE} Source observations are unchanged; relative changes and teaching simulation are app calculations, not ECB outputs. No endorsement.",
            },
            "reveal": reveal,
        }
        meta_path = raw_root / f"{episode_id}.meta.yaml"
        meta_path.write_text(yaml.safe_dump(meta, allow_unicode=True, sort_keys=False), encoding="utf-8")
        episode_path = output_root / f"{episode_id}.json"
        # This CLI is deliberately offline; only fetch_snapshot has network I/O.
        subprocess.run([
            sys.executable, str(ROOT / "scripts/prepare_episode.py"), "--csv", str(csv_path),
            "--id", episode_id, "--start", start, "--end", end, "--meta", str(meta_path),
            "--output", str(episode_path),
        ], check=True)
        episode = json.loads(episode_path.read_text(encoding="utf-8"))
        for key in ("barCount", "totalChange", "maxDrawdown", "worstSingleDayFall"):
            if not math.isclose(episode["stats"][key], summary[key], abs_tol=1e-12):
                raise ValueError(f"Independent statistic mismatch: {episode_id}.{key}")
        if episode["bars"] != [{"date": day, "close": float(value)} for day, value in rows]:
            raise ValueError("Prepared observations differ from source")
        episode.update({"label": label, "scenario": scenario, "status": "agent-checked", "sourceLabel": SOURCE_LABEL})
        episode["provenance"].update({
            "seriesId": SERIES, "units": "USD per EUR", "sourceDefinitionsUrl": DEFINITIONS_URL,
            "termsUrl": TERMS_URL, "termsCheckedOn": "2026-10-03", "termsQuote": TERMS_QUOTE,
            "modificationQuote": MODIFICATION_QUOTE, "acquisition": receipt,
            "transformation": "TIME->date, source USD rate->internal close field, unchanged numeric observations. close is not a market closing price. Ratios/stats and virtual-money outcomes are app calculations.",
            "observationTiming": "Publisher currently describes daily central-bank concertation normally around 14:10 CET and publication around 16:00 CET. XML supplies dates, not timestamps; historical per-row time is not asserted.",
            "calendar": {"basis": "Exactly the observed XML date keys; not an independently verified session calendar", "dates": [day for day, _ in rows]},
            "selection": "Retrospectively selected contrasting teaching windows, not representative/random samples. crash/choppy are internal teaching labels, not publisher classifications. Not equity prices or an Indian market sample.",
            "review": {"status": "agent-checked", "checkedOn": "2026-10-03", "evidence": "docs/DATA_REVIEW.md", "humanApproved": False, "nativeSpeakerReviewed": False,
                "contentSha256": {f"{field}.{language}": digest(text.encode())
                    for field, values in (("reveal.periodText", reveal["periodText"]), ("reveal.whatHappenedText", reveal["whatHappenedText"]), ("sourceLabel", SOURCE_LABEL))
                    for language, text in values.items()}},
            "validation": summary,
        })
        write_json(episode_path, episode)
        reports.append({"id": episode_id, "episodeSha256": digest(episode_path.read_bytes()), "inputSha256": episode["provenance"]["inputSha256"], **summary})
    write_json(raw_root / "validation.json", reports)
    return reports


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fetch", action="store_true", help="Explicitly download official ECB XML before offline preparation")
    parser.add_argument("--raw-root", type=Path, default=ROOT / "data-raw/ecb")
    parser.add_argument("--output-root", type=Path, default=ROOT / "src/data/episodes")
    args = parser.parse_args()
    if args.fetch:
        fetch_snapshot(args.raw_root)
    for report in prepare(args.raw_root, args.output_root):
        print(f"{report['id']}: {report['barCount']} observations, {report['firstDate']}..{report['lastDate']}, total={report['totalChange']:.12f}, drawdown={report['maxDrawdown']:.12f}")


if __name__ == "__main__":
    main()
