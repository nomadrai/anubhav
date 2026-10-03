#!/usr/bin/env python3
"""Summarize actual public speech build evidence; never mark absent work passed."""
import json
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'artifacts/audio-build'


def main():
    manifest = json.loads((ROOT / 'public/audio/manifest.json').read_text())
    audition = json.loads((CACHE / 'auditions.json').read_text())
    report = json.loads((CACHE / 'build-report.json').read_text())
    evidence = [json.loads(path.read_text()) for path in CACHE.glob('*/quality.json')]
    attempts = [row for row in evidence if not row['id'].startswith('audition.')]
    selected = {track['inputSha256']: track for track in manifest['tracks']}
    used = [row for row in attempts if row['inputSha256'] in selected]
    out = ['# Actual audio build evidence — 2026-10-03', '',
           '**Automated checks only: no human listened and no native Hindi review occurred.**', '',
           f"Manifest: schema {manifest['schemaVersion']}, complete={str(manifest['complete']).lower()}, **{len(manifest['tracks'])}/58** required tracks. Failed: `{manifest.get('failedTracks', [])}`.", '',
           '## Controlled voice choice', '',
           'Same exact three Hindi selections, description changes speaker name only; per-text/ID/attempt seed identical between voices. Select all-three-pass first, then lowest mean CER, then lowest mean synthesis time. English uses the selected voice but is individually gated, not subjectively auditioned.', '',
           '| Voice | Passing clips | Mean CER | Mean synthesis s |', '|---|---:|---:|---:|']
    for candidate in audition['candidates']:
        out.append(f"| {candidate['speaker']} | {candidate['passedClips']}/3 | {candidate['meanCer']:.6f} | {candidate['meanTtsSeconds']:.2f} |")
    out += ['', f"Selected: **{audition['selected']}**. This is not a naturalness/pronunciation/listening endorsement.", '',
            '| Voice / clip | Exact spoken text | Wall s | Audio s | RMS dBFS | Peak | Peak RSS bytes | CER |',
            '|---|---|---:|---:|---:|---:|---:|---:|']
    for candidate in audition['candidates']:
        for row in candidate['clips']:
            out.append(f"| {row['speaker']} / {row['id']} | {row['spokenText']} | {row['ttsWallSeconds']:.2f} | {row['durationSeconds']:.5f} | {row['rmsDbfs']:.2f} | {row['peak']:.5f} | {row['peakRssBytes']} | {row['asr']['cer']:.6f} |")
    out += ['', '## Complete-set measurements', '',
        '- CPU float32, four intra-op/one inter-op threads; fixed-seed sampling, exact pinned model/tokenizers/Transformers. Shared workstation, no warmup or isolated benchmark claim.',
        '- TTS wall uses perf_counter around tokenize/inference/WAV write; excludes model load, ASR and encoding. Peak RSS sampled with psutil every 20ms, including already-loaded TTS/ASR memory. Full attempt evidence stays ignored, original experiment untouched.',
        f"- Unique production generation attempts retained: **{len(attempts)}**; cumulative actual synthesis time **{sum(r['ttsWallSeconds'] for r in attempts):.2f}s**. This includes rejected/redundant initial numeric-format attempts, not just chosen output.",
        f"- Selected tracks: {len(used)}; synthesis range **{min(r['ttsWallSeconds'] for r in used):.2f}–{max(r['ttsWallSeconds'] for r in used):.2f}s**, median **{statistics.median(r['ttsWallSeconds'] for r in used):.2f}s**; total **{sum(r['ttsWallSeconds'] for r in used):.2f}s**.",
        f"- All production attempts max synthesis **{max(r['ttsWallSeconds'] for r in attempts):.2f}s**; attempts above 90s: **{sum(r['ttsWallSeconds']>90 for r in attempts)}**. No free GPU job was needed/run; optional exact instructions are in GPU_AUDIO.md.",
        f"- Highest sampled process RSS across production attempts: **{max(r['peakRssBytes'] for r in attempts)} bytes**.",
        f"- Final Opus assets: **{sum(t['bytes'] for t in manifest['tracks'])} bytes**, **{sum(t['durationSeconds'] for t in manifest['tracks']):.5f}s** audio. Manifest: {(ROOT/'public/audio/manifest.json').stat().st_size} bytes. No model, raw data or WAV is shipped.",
        '- Mono, target 24kbps variable-bitrate Opus; loudnorm targets −18 LUFS/−2dB true peak/LRA7. Targets are not asserted achieved per-clip measurements. Final byte/duration/finite/clipping evidence is in each manifest entry.', '',
        '## Per-track gate and timing record', '',
        '| Language / ID | Seed attempt | TTS wall s | Audio s | Steps / cap | RMS dBFS | CER normalized (raw) |',
        '|---|---:|---:|---:|---|---:|---|']
    for row in sorted(used, key=lambda r:(r['language'],r['id'])):
        out.append(f"| {row['language']} / {row['id']} | {row['attempt']} | {row['ttsWallSeconds']:.2f} | {row['durationSeconds']:.5f} | {row['generatedSteps']} / {row['maxNewTokens']} | {row['rmsDbfs']:.2f} | {row['asr']['cer']:.6f} ({row['asr'].get('rawCer',row['asr']['cer']):.6f}) |")
    out += ['', 'All included tracks have all-codebook natural EOS before cap, finite mono signal, plausible duration, signal/clipping checks, no cross-text duplicate WAV hash, passed CER and protected-quantity evidence. Asset/text hashes and exact transcripts are retained in manifest and cache. No gate pass means human-reviewed.', '',
            '## Rejected attempts and corrected assessments', '',
            'Initial raw-CER percentage failures are preserved in `build-report-pre-number-normalization.json`. Reassessment normalizes explicit digits/% without relaxing thresholds; `previousAssessment` preserves old decisions. An ASR quantity mismatch is a new explicit failure, not silently waved away. Cached input reuse avoids resynthesizing correct numeric-format cases.', '',
            '| Language / ID | Attempt | Disposition | Transcript / reason |', '|---|---:|---|---|']
    for row in sorted(attempts, key=lambda r:(r['language'],r['id'],r['attempt'])):
        if not row['passed'] or row.get('asr',{}).get('previousAssessment',{}).get('status') == 'failed':
            reason = row.get('asr',{}).get('transcript') or ', '.join(row['failures'])
            out.append(f"| {row['language']} / {row['id']} | {row['attempt']} | {'Passed corrected assessment' if row['passed'] else 'Rejected: '+', '.join(row['failures'])} | {reason.replace('|','/')} |")
    beam_path = CACHE / 'asr-number-beam5.json'
    if beam_path.exists():
        beam = json.loads(beam_path.read_text())
        out += ['', '## Parked Hindi five-percent blocker', '',
            'All three fixed-seed attempts for `hi:DRAWDOWN_5` had plausible signal/natural EOS but could not establish the exact protected number. A separate offline one-variable ASR diagnostic changed greedy ASR to five beams on the SAME three WAVs; it did not change TTS or add synthesis attempts. All three still failed exact quantity confirmation. Results below are diagnostic only, not alternate approvals.', '',
            '| Attempt | Beam-5 transcript | CER | Quantity confirmed | ASR wall s | Peak RSS bytes |',
            '|---:|---|---:|---|---:|---:|']
        for row in sorted(beam, key=lambda r:r['attempt']):
            out.append(f"| {row['attempt']} | {row['transcript']} | {row['cer']:.6f} | {row['quantitiesMatch']} | {row['wallSeconds']:.2f} | {row['peakRssBytes']} |")
        out += ['', 'This does not establish whether the defect is TTS pronunciation or ASR recognition. A targeted native-Hindi listening check or independently justified recognizer/voice intervention is needed. Do not mark the number correct by fuzzy substitution or keep changing seeds. The incomplete manifest deliberately disables journey playback and blocks release; the rest of the text journey remains usable.', '']
    out += ['', '## Reproduction and honest limits', '',
        'Use AUDIO_PIPELINE.md for explicit cache preparation and offline generation. Run `node scripts/check-audio.mjs`, content/release checks, a fresh build and production browser tests; the synthesis script alone does not establish playback/offline success.',
        'Whisper-small is a fallible recognizer, especially Hindi. Nonzero CER can reflect TTS or ASR errors; exact negation/prosody and cultural clarity still require listening/native review. Captions remain authoritative. No full-set success is claimed if `complete` is false. Any failed tracks remain excluded and the gate stays red.', '']
    (ROOT / 'docs/AUDIO_BUILD.md').write_text('\n'.join(out))
    # Public-text-only metrics snapshot can be versioned without raw WAVs/weights.
    (ROOT / 'docs/AUDIO_BUILD_EVIDENCE.json').write_text(json.dumps({'auditions': audition, 'build': report, 'attempts': evidence, 'beam5NumberDiagnostic': json.loads(beam_path.read_text()) if beam_path.exists() else []}, ensure_ascii=False, indent=2)+'\n')


if __name__ == '__main__':
    main()
