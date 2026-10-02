#!/usr/bin/env python3
"""Validate a dated OHLC CSV and build a Phase 1 episode JSON document.

The metadata schema is documented in scripts/README.md.  This module has no
market-calendar knowledge: every expected session must be listed explicitly in
that metadata.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
import sys
from datetime import date
from pathlib import Path
from typing import Any, Iterable

try:
    import yaml
except ImportError as exc:  # pragma: no cover - exercised in environments without deps
    raise SystemExit("PyYAML is required; install dependencies with: python -m pip install -r scripts/requirements.txt") from exc


class EpisodeError(ValueError):
    """A user-correctable input or metadata error."""


NEUTRAL_LABEL = "Episode A"
_ID_PATTERN = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]*")


def _error(message: str) -> EpisodeError:
    return EpisodeError(message)


def _validate_episode_id(value: Any) -> str:
    if not isinstance(value, str) or not value.strip():
        raise _error("--id must be a non-empty string")
    episode_id = value.strip()
    if not _ID_PATTERN.fullmatch(episode_id):
        raise _error("--id must be a stable identifier using letters, digits, '.', '_' or '-'")
    return episode_id


def _parse_date(value: Any, field: str) -> date:
    # PyYAML turns an unquoted ISO YAML scalar into datetime.date. Do not accept
    # datetime values: they would silently introduce a time into a session key.
    if type(value) is date:
        return value
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value.strip()):
        raise _error(f"{field} must be an ISO date in YYYY-MM-DD form; got {value!r}")
    try:
        return date.fromisoformat(value.strip())
    except ValueError as exc:
        raise _error(f"{field} is not a valid calendar date: {value!r}") from exc


def _nonempty_string(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise _error(f"{field} must be a non-empty string")
    return value.strip()


def _normalise_column(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.strip().lower())


def _as_expected_dates(meta: dict[str, Any]) -> list[date]:
    has_expected = "expectedDates" in meta
    has_calendar = "calendar" in meta
    if has_expected == has_calendar:
        raise _error("metadata must specify exactly one of expectedDates or explicit calendar")

    raw: Any
    if has_expected:
        raw = meta["expectedDates"]
    else:
        raw = meta["calendar"]
        if not isinstance(raw, dict):
            raise _error("metadata calendar must be an object with an explicit dates list")
        # `dates` is the documented spelling; the aliases make migration less
        # surprising while still requiring an explicit date list.
        for key in ("dates", "expectedDates", "sessions"):
            if key in raw:
                raw = raw[key]
                break
        else:
            raise _error("metadata calendar must contain an explicit dates list")
    if not isinstance(raw, list) or not raw:
        raise _error("expectedDates/calendar dates must be a non-empty list")

    parsed = [_parse_date(item, "expected session date") for item in raw]
    if len(set(parsed)) != len(parsed):
        raise _error("expected session dates contain duplicates")
    return sorted(parsed)


def _validate_metadata(meta: Any) -> tuple[list[date], dict[str, Any], bool, dict[str, dict[str, str]]]:
    if not isinstance(meta, dict):
        raise _error("metadata YAML root must be a mapping")
    expected = _as_expected_dates(meta)

    if "isPlaceholder" not in meta or type(meta["isPlaceholder"]) is not bool:
        raise _error("metadata must include required boolean isPlaceholder")
    is_placeholder = meta["isPlaceholder"]

    if "intradayAvailable" not in meta or type(meta["intradayAvailable"]) is not bool:
        raise _error("metadata must include required boolean intradayAvailable")
    intraday = meta["intradayAvailable"]

    provenance = meta.get("provenance")
    if not isinstance(provenance, dict):
        raise _error("metadata must include a provenance mapping; market provenance is never fabricated")
    clean_provenance: dict[str, str] = {}
    for field in ("sourceName", "sourceUrl", "retrievedOn", "licenceNote"):
        value = provenance.get(field)
        if field == "retrievedOn":
            clean_provenance[field] = _parse_date(value, "provenance.retrievedOn").isoformat()
        else:
            clean_provenance[field] = _nonempty_string(value, f"provenance.{field}")

    reveal = meta.get("reveal")
    if not isinstance(reveal, dict):
        raise _error("metadata must include reveal.periodText and reveal.whatHappenedText")
    clean_reveal: dict[str, dict[str, str]] = {}
    for field in ("periodText", "whatHappenedText"):
        value = reveal.get(field)
        if not isinstance(value, dict):
            raise _error(f"reveal.{field} must be an object with en and hi strings")
        clean_reveal[field] = {
            lang: _nonempty_string(value.get(lang), f"reveal.{field}.{lang}")
            for lang in ("en", "hi")
        }
    return expected, clean_provenance, intraday, clean_reveal


def _read_number(raw: Any, field: str, row_number: int) -> float:
    if raw is None or not str(raw).strip():
        raise _error(f"CSV row {row_number}: {field} is missing")
    try:
        value = float(str(raw).strip())
    except (TypeError, ValueError) as exc:
        raise _error(f"CSV row {row_number}: {field} is not numeric: {raw!r}") from exc
    if not math.isfinite(value):
        raise _error(f"CSV row {row_number}: {field} must be finite, got {raw!r}")
    if value <= 0:
        raise _error(f"CSV row {row_number}: {field} must be positive, got {raw!r}")
    return value


def _read_bars(csv_path: Path, start: date, end: date) -> tuple[list[dict[str, float | str]], str]:
    try:
        raw_bytes = csv_path.read_bytes()
    except OSError as exc:
        raise _error(f"cannot read CSV {csv_path}: {exc}") from exc
    digest = hashlib.sha256(raw_bytes).hexdigest()
    try:
        text = raw_bytes.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise _error(f"CSV must be UTF-8: {exc}") from exc

    try:
        reader = csv.DictReader(text.splitlines(), strict=True)
        raw_fields = reader.fieldnames
    except csv.Error as exc:
        raise _error(f"cannot parse CSV header: {exc}") from exc
    if not raw_fields or any(field is None or not field.strip() for field in raw_fields):
        raise _error("CSV must have a non-empty header")
    names: dict[str, str] = {}
    for field in raw_fields:
        normal = _normalise_column(field)
        if normal in names:
            raise _error(f"CSV has duplicate column names (case-insensitive): {field!r}")
        names[normal] = field
    required = {"date", "close"}
    missing = sorted(required - names.keys())
    if missing:
        raise _error(f"CSV is missing required column(s): {', '.join(missing)}")
    optional = [name for name in ("open", "high", "low") if name in names]

    bars: list[dict[str, float | str]] = []
    seen: set[date] = set()
    try:
        rows = enumerate(reader, start=2)
        for row_number, row in rows:
            if None in row and any(str(value).strip() for value in row[None] or []):
                raise _error(f"CSV row {row_number}: too many columns")
            for field in raw_fields:
                if row.get(field) is None or not str(row.get(field)).strip():
                    raise _error(f"CSV row {row_number}: {field} is missing")
            date_raw = row.get(names["date"])
            if date_raw is None or not str(date_raw).strip():
                raise _error(f"CSV row {row_number}: date is missing")
            row_date = _parse_date(str(date_raw).strip(), f"CSV row {row_number} date")
            if row_date < start or row_date > end:
                raise _error(f"CSV row {row_number}: date {row_date} is outside requested range {start}..{end}")
            if row_date in seen:
                raise _error(f"CSV row {row_number}: duplicate date {row_date}")
            seen.add(row_date)
            bar: dict[str, float | str] = {"date": row_date.isoformat(), "close": _read_number(row.get(names["close"]), "close", row_number)}
            for field in optional:
                bar[field] = _read_number(row.get(names[field]), field, row_number)

            close = float(bar["close"])
            opening = float(bar["open"]) if "open" in bar else None
            high = float(bar["high"]) if "high" in bar else None
            low = float(bar["low"]) if "low" in bar else None
            if high is not None and high < close:
                raise _error(f"CSV row {row_number}: high must be >= close")
            if low is not None and low > close:
                raise _error(f"CSV row {row_number}: low must be <= close")
            if high is not None and low is not None and high < low:
                raise _error(f"CSV row {row_number}: high must be >= low")
            if opening is not None:
                if high is not None and opening > high:
                    raise _error(f"CSV row {row_number}: open must be <= high")
                if low is not None and opening < low:
                    raise _error(f"CSV row {row_number}: open must be >= low")
            bars.append(bar)
    except csv.Error as exc:
        raise _error(f"cannot parse CSV row: {exc}") from exc
    return sorted(bars, key=lambda bar: str(bar["date"])), digest


def _stats(bars: list[dict[str, float | str]]) -> dict[str, float | int]:
    if len(bars) < 2:
        raise _error("episode must contain at least two bars")
    closes = [float(bar["close"]) for bar in bars]
    first = closes[0]
    peak = first
    max_drawdown = 0.0
    worst_day = 0.0
    for previous, current in zip(closes, closes[1:]):
        daily_change = current / previous - 1.0
        worst_day = min(worst_day, daily_change)
        peak = max(peak, current)
        max_drawdown = min(max_drawdown, current / peak - 1.0)
    stats: dict[str, float | int] = {
        "maxDrawdown": max_drawdown,
        "barCount": len(closes),
        "totalChange": closes[-1] / first - 1.0,
        "worstSingleDayFall": worst_day,
    }
    if any(not math.isfinite(float(value)) for value in stats.values()):
        raise _error("episode price ratios produce non-finite statistics; use a safer numeric range")
    return stats


def build_episode(csv_path: Path, episode_id: str, start: date, end: date, meta_path: Path) -> dict[str, Any]:
    episode_id = _validate_episode_id(episode_id)
    if start > end:
        raise _error(f"start date {start} must not be after end date {end}")
    try:
        meta_raw = yaml.safe_load(meta_path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise _error(f"cannot read metadata {meta_path}: {exc}") from exc
    except yaml.YAMLError as exc:
        raise _error(f"invalid metadata YAML: {exc}") from exc
    expected, provenance, intraday, reveal = _validate_metadata(meta_raw)
    expected_in_range = [item for item in expected if start <= item <= end]
    if not expected_in_range:
        raise _error(f"metadata has no expected sessions in requested range {start}..{end}")

    bars, input_sha256 = _read_bars(csv_path, start, end)
    actual = {date.fromisoformat(str(bar["date"])) for bar in bars}
    expected_set = set(expected_in_range)
    missing = sorted(expected_set - actual)
    unexpected = sorted(actual - expected_set)
    if missing:
        raise _error("CSV is missing expected session(s): " + ", ".join(item.isoformat() for item in missing))
    if unexpected:
        raise _error("CSV contains date(s) not listed as expected sessions: " + ", ".join(item.isoformat() for item in unexpected))
    if not bars:
        raise _error("CSV contains no bars in requested range")
    if len(bars) < 2:
        raise _error(f"episode must contain at least two bars; found {len(bars)}")

    has_low = all("low" in bar for bar in bars)
    if intraday != has_low:
        expected = "true when every bar has a low" if intraday else "false when no bar has a low"
        raise _error(
            "metadata intradayAvailable does not match CSV low-column presence "
            f"(intradayAvailable={str(intraday).lower()}, {expected})"
        )

    output_provenance = {key: provenance[key] for key in ("sourceName", "sourceUrl", "retrievedOn", "licenceNote")}
    output_provenance["inputSha256"] = input_sha256
    return {
        "id": episode_id,
        "label": NEUTRAL_LABEL,
        "bars": bars,
        "intradayAvailable": intraday,
        "reveal": reveal,
        "stats": _stats(bars),
        "provenance": output_provenance,
        "isPlaceholder": meta_raw["isPlaceholder"],
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Validate an explicit-session OHLC CSV and prepare a Phase 1 episode JSON.")
    parser.add_argument("--csv", required=True, type=Path, help="input UTF-8 CSV")
    parser.add_argument("--id", required=True, help="episode identifier")
    parser.add_argument("--start", required=True, help="inclusive start date (YYYY-MM-DD)")
    parser.add_argument("--end", required=True, help="inclusive end date (YYYY-MM-DD)")
    parser.add_argument("--meta", required=True, type=Path, help="metadata YAML with explicit expected sessions and provenance")
    parser.add_argument("--output", type=Path, help="write JSON here instead of stdout")
    return parser


def main(argv: Iterable[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        start = _parse_date(args.start, "--start")
        end = _parse_date(args.end, "--end")
        episode_id = _validate_episode_id(args.id)
        episode = build_episode(args.csv, episode_id, start, end, args.meta)
        rendered = json.dumps(episode, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
        if args.output:
            try:
                args.output.write_text(rendered, encoding="utf-8")
            except OSError as exc:
                raise _error(f"cannot write output {args.output}: {exc}") from exc
        else:
            sys.stdout.write(rendered)
        return 0
    except EpisodeError as exc:
        parser.error(str(exc))
    return 2  # pragma: no cover


if __name__ == "__main__":
    raise SystemExit(main())
