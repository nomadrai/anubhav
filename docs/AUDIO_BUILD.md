# Actual audio build evidence — 2026-10-03

**Automated checks only: no human listened and no native Hindi review occurred.**

Manifest: schema 2, complete=false, **57/58** required tracks. Failed: `['hi:DRAWDOWN_5']`.

## Controlled voice choice

Same exact three Hindi selections, description changes speaker name only; per-text/ID/attempt seed identical between voices. Select all-three-pass first, then lowest mean CER, then lowest mean synthesis time. English uses the selected voice but is individually gated, not subjectively auditioned.

| Voice | Passing clips | Mean CER | Mean synthesis s |
|---|---:|---:|---:|
| Rohit | 3/3 | 0.212874 | 29.97 |
| Divya | 3/3 | 0.165522 | 33.20 |

Selected: **Divya**. This is not a naturalness/pronunciation/listening endorsement.

| Voice / clip | Exact spoken text | Wall s | Audio s | RMS dBFS | Peak | Peak RSS bytes | CER |
|---|---|---:|---:|---:|---:|---:|---:|
| Rohit / audition.short | स्थिति आपके चुनाव से बंद हुई। | 14.46 | 2.75156 | -22.37 | 0.67133 | 5868199936 | 0.321429 |
| Rohit / audition.medium | रास्ता देखें। हर विराम पर आप जारी रख सकते हैं या बाहर निकल सकते हैं। | 31.09 | 5.30576 | -21.20 | 0.94308 | 6227800064 | 0.045455 |
| Rohit / audition.number-term | रास्ता शुरुआत से दस प्रतिशत नीचे है। यह एपिसोड सीखने का उदाहरण है। एक एपिसोड भविष्य नहीं बताता। | 44.37 | 7.80190 | -23.64 | 0.50336 | 6512910336 | 0.271739 |
| Divya / audition.short | स्थिति आपके चुनाव से बंद हुई। | 17.73 | 3.20435 | -36.84 | 0.12888 | 5988270080 | 0.214286 |
| Divya / audition.medium | रास्ता देखें। हर विराम पर आप जारी रख सकते हैं या बाहर निकल सकते हैं। | 32.07 | 5.30576 | -31.86 | 0.16571 | 6246871040 | 0.075758 |
| Divya / audition.number-term | रास्ता शुरुआत से दस प्रतिशत नीचे है। यह एपिसोड सीखने का उदाहरण है। एक एपिसोड भविष्य नहीं बताता। | 49.81 | 8.62621 | -36.64 | 0.11813 | 6621675520 | 0.206522 |

## Complete-set measurements

- CPU float32, four intra-op/one inter-op threads; fixed-seed sampling, exact pinned model/tokenizers/Transformers. Shared workstation, no warmup or isolated benchmark claim.
- TTS wall uses perf_counter around tokenize/inference/WAV write; excludes model load, ASR and encoding. Peak RSS sampled with psutil every 20ms, including already-loaded TTS/ASR memory. Full attempt evidence stays ignored, original experiment untouched.
- Unique production generation attempts retained: **70**; cumulative actual synthesis time **2038.90s**. This includes rejected/redundant initial numeric-format attempts, not just chosen output.
- Selected tracks: 57; synthesis range **12.50–62.45s**, median **30.40s**; total **1802.31s**.
- All production attempts max synthesis **62.45s**; attempts above 90s: **0**. No free GPU job was needed/run; optional exact instructions are in GPU_AUDIO.md.
- Highest sampled process RSS across production attempts: **7029870592 bytes**.
- Final Opus assets: **937707 bytes**, **313.60900s** audio. Manifest: 130577 bytes. No model, raw data or WAV is shipped.
- Mono, target 24kbps variable-bitrate Opus; loudnorm targets −18 LUFS/−2dB true peak/LRA7. Targets are not asserted achieved per-clip measurements. Final byte/duration/finite/clipping evidence is in each manifest entry.

## Per-track gate and timing record

| Language / ID | Seed attempt | TTS wall s | Audio s | Steps / cap | RMS dBFS | CER normalized (raw) |
|---|---:|---:|---:|---|---:|---|
| en / DRAWDOWN_10 | 1 | 21.91 | 3.51782 | 312 / 750 | -33.39 | 0.000000 (0.282051) |
| en / DRAWDOWN_20 | 1 | 14.03 | 2.60063 | 233 / 750 | -35.56 | 0.000000 (0.333333) |
| en / DRAWDOWN_5 | 1 | 17.51 | 3.05342 | 272 / 750 | -34.66 | 0.000000 (0.300000) |
| en / ENTRY | 1 | 16.28 | 3.06503 | 273 / 690 | -37.17 | 0.000000 (0.000000) |
| en / EPISODE_END | 1 | 12.87 | 2.38005 | 214 / 630 | -25.11 | 0.000000 (0.000000) |
| en / FORCED_EXIT | 1 | 20.33 | 3.85451 | 341 / 690 | -34.92 | 0.020833 (0.020833) |
| en / MARGIN_WARNING | 1 | 22.63 | 4.27247 | 377 / 811 | -32.78 | 0.000000 (0.000000) |
| en / UNLEVERAGED_SURVIVED | 1 | 24.00 | 4.43501 | 391 / 871 | -30.77 | 0.000000 (0.000000) |
| en / USER_EXIT | 1 | 15.75 | 2.98376 | 266 / 690 | -32.18 | 0.000000 (0.000000) |
| en / debrief.main | 1 | 20.88 | 3.75002 | 332 / 811 | -34.04 | 0.000000 (0.000000) |
| en / glossary.compounding | 1 | 49.52 | 8.39401 | 732 / 1413 | -33.69 | 0.000000 (0.000000) |
| en / glossary.diversification | 1 | 54.85 | 9.19510 | 801 / 1353 | -36.10 | 0.000000 (0.000000) |
| en / glossary.drawdown | 1 | 32.36 | 4.92263 | 433 / 991 | -35.29 | 0.000000 (0.000000) |
| en / glossary.fees | 1 | 43.10 | 7.56971 | 661 / 1233 | -37.27 | 0.000000 (0.000000) |
| en / glossary.forcedExit | 1 | 31.08 | 5.65406 | 496 / 1172 | -34.21 | 0.000000 (0.000000) |
| en / glossary.leverage | 1 | 41.31 | 6.79184 | 594 / 1172 | -33.94 | 0.000000 (0.000000) |
| en / glossary.margin | 1 | 37.31 | 5.72372 | 502 / 931 | -34.50 | 0.000000 (0.000000) |
| en / glossary.recovery | 1 | 49.36 | 8.31274 | 725 / 1413 | -33.15 | 0.000000 (0.000000) |
| en / glossary.volatility | 1 | 32.20 | 5.45669 | 479 / 991 | -36.11 | 0.000000 (0.000000) |
| en / intro.main | 1 | 46.56 | 7.98766 | 697 / 1474 | -34.54 | 0.018182 (0.018182) |
| en / language.greeting | 1 | 14.46 | 2.72834 | 244 / 630 | -37.48 | 0.000000 (0.000000) |
| en / nextsteps.main | 1 | 34.68 | 6.21134 | 544 / 1052 | -33.14 | 0.149425 (0.149425) |
| en / postcheck.main | 1 | 26.85 | 4.56272 | 402 / 871 | -35.83 | 0.000000 (0.000000) |
| en / prediction.main | 1 | 22.08 | 3.91256 | 346 / 931 | -34.83 | 0.000000 (0.000000) |
| en / replay.main | 1 | 24.15 | 4.44662 | 392 / 811 | -33.44 | 0.000000 (0.000000) |
| en / result.main | 1 | 17.69 | 3.35528 | 298 / 690 | -26.41 | 0.150000 (0.150000) |
| en / reveal.main | 1 | 32.41 | 5.90948 | 518 / 1052 | -33.59 | 0.040541 (0.040541) |
| en / run.main | 1 | 30.40 | 5.60762 | 492 / 931 | -37.66 | 0.094340 (0.094340) |
| en / setup.main | 1 | 54.67 | 8.13859 | 710 / 1293 | -34.18 | 0.000000 (0.000000) |
| hi / DRAWDOWN_10 | 2 | 17.37 | 3.11147 | 277 / 690 | -32.90 | 0.228571 (0.228571) |
| hi / DRAWDOWN_20 | 2 | 16.65 | 3.11147 | 277 / 690 | -33.73 | 0.194444 (0.194444) |
| hi / ENTRY | 1 | 12.50 | 2.42649 | 218 / 690 | -36.50 | 0.258065 (0.258065) |
| hi / EPISODE_END | 1 | 17.28 | 3.01859 | 269 / 690 | -34.56 | 0.161290 (0.161290) |
| hi / FORCED_EXIT | 1 | 31.44 | 5.51474 | 484 / 1052 | -35.75 | 0.122807 (0.122807) |
| hi / MARGIN_WARNING | 1 | 27.94 | 5.18966 | 456 / 811 | -34.02 | 0.121951 (0.121951) |
| hi / UNLEVERAGED_SURVIVED | 1 | 24.14 | 4.50467 | 397 / 1052 | -34.28 | 0.118644 (0.118644) |
| hi / USER_EXIT | 2 | 15.24 | 2.78639 | 249 / 630 | -37.15 | 0.250000 (0.250000) |
| hi / debrief.main | 1 | 33.14 | 6.07202 | 532 / 1172 | -33.66 | 0.149254 (0.149254) |
| hi / glossary.compounding | 1 | 62.45 | 10.37932 | 903 / 1715 | -35.07 | 0.263158 (0.263158) |
| hi / glossary.diversification | 1 | 54.90 | 9.06739 | 790 / 1655 | -37.57 | 0.267857 (0.267857) |
| hi / glossary.drawdown | 1 | 31.56 | 5.65406 | 496 / 1052 | -33.38 | 0.245283 (0.245283) |
| hi / glossary.fees | 1 | 46.90 | 7.81351 | 682 / 1413 | -34.79 | 0.151163 (0.151163) |
| hi / glossary.forcedExit | 1 | 36.25 | 6.65252 | 582 / 1293 | -34.13 | 0.105263 (0.105263) |
| hi / glossary.leverage | 1 | 59.30 | 10.22839 | 890 / 1775 | -33.92 | 0.100917 (0.100917) |
| hi / glossary.margin | 1 | 31.79 | 5.82821 | 511 / 1233 | -33.74 | 0.223881 (0.223881) |
| hi / glossary.recovery | 1 | 52.23 | 8.85841 | 772 / 1594 | -36.08 | 0.156863 (0.156863) |
| hi / glossary.volatility | 1 | 33.23 | 6.08363 | 533 / 1112 | -32.02 | 0.171429 (0.171429) |
| hi / intro.main | 1 | 56.91 | 9.46213 | 824 / 1594 | -34.98 | 0.176471 (0.176471) |
| hi / language.greeting | 1 | 16.22 | 3.07664 | 274 / 750 | -35.54 | 0.135135 (0.135135) |
| hi / nextsteps.main | 1 | 40.67 | 6.95438 | 608 / 1293 | -35.18 | 0.093023 (0.093023) |
| hi / postcheck.main | 1 | 30.69 | 5.51474 | 484 / 1112 | -37.03 | 0.127273 (0.127273) |
| hi / prediction.main | 1 | 23.87 | 4.35374 | 384 / 931 | -33.65 | 0.083333 (0.083333) |
| hi / replay.main | 1 | 22.55 | 4.24925 | 375 / 811 | -33.44 | 0.093023 (0.093023) |
| hi / result.main | 1 | 25.69 | 4.53950 | 400 / 811 | -36.30 | 0.200000 (0.200000) |
| hi / reveal.main | 1 | 29.25 | 5.32898 | 468 / 931 | -35.35 | 0.196429 (0.196429) |
| hi / run.main | 2 | 30.30 | 5.43347 | 477 / 1172 | -33.43 | 0.136364 (0.136364) |
| hi / setup.main | 1 | 60.62 | 9.60145 | 836 / 1594 | -33.79 | 0.141414 (0.141414) |

All included tracks have all-codebook natural EOS before cap, finite mono signal, plausible duration, signal/clipping checks, no cross-text duplicate WAV hash, passed CER and protected-quantity evidence. Asset/text hashes and exact transcripts are retained in manifest and cache. No gate pass means human-reviewed.

## Rejected attempts and corrected assessments

Initial raw-CER percentage failures are preserved in `build-report-pre-number-normalization.json`. Reassessment normalizes explicit digits/% without relaxing thresholds; `previousAssessment` preserves old decisions. An ASR quantity mismatch is a new explicit failure, not silently waved away. Cached input reuse avoids resynthesizing correct numeric-format cases.

| Language / ID | Attempt | Disposition | Transcript / reason |
|---|---:|---|---|
| en / DRAWDOWN_10 | 1 | Passed corrected assessment | The path is 10% below its start. |
| en / DRAWDOWN_10 | 2 | Rejected: asr-character-error-rate | The path is 10% below its start. |
| en / DRAWDOWN_10 | 3 | Rejected: asr-character-error-rate | The path is 10% below its start. |
| en / DRAWDOWN_20 | 1 | Passed corrected assessment | The path is 20% below its start. |
| en / DRAWDOWN_20 | 2 | Rejected: asr-character-error-rate | The path is 20% below its start. |
| en / DRAWDOWN_20 | 3 | Rejected: asr-character-error-rate | The park is 20% below its start. |
| en / DRAWDOWN_5 | 1 | Passed corrected assessment | The path is 5% below its start. |
| en / DRAWDOWN_5 | 2 | Rejected: asr-character-error-rate | The path is 5% below its start. |
| en / DRAWDOWN_5 | 3 | Rejected: asr-character-error-rate | The path is 5% below its start. |
| hi / DRAWDOWN_10 | 1 | Rejected: asr-character-error-rate | रास्ता शुर्वाद सी देस्प्रतिष्ट्नी चिहें |
| hi / DRAWDOWN_20 | 1 | Rejected: asr-character-error-rate | रास्ता शुर्वाद सी बीस्प्रतिषक नीचे हैं |
| hi / DRAWDOWN_5 | 1 | Rejected: asr-character-error-rate | रास्ता शुर्वाद से पाज्प्रतिषत निचे हैं |
| hi / DRAWDOWN_5 | 2 | Rejected: asr-character-error-rate | जास्ता शुर्वाद से पाज प्रतिषत नीचे हैं |
| hi / DRAWDOWN_5 | 3 | Rejected: asr-character-error-rate | रास्ता शुर्वाद सी पाज्प्रतिषत नीचे हैं |
| hi / USER_EXIT | 1 | Rejected: asr-character-error-rate | स्तिती आपके चनाफसी बन दूई |
| hi / run.main | 1 | Rejected: asr-character-error-rate | रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, रास्ता दिखें, � |

## Parked Hindi five-percent blocker

All three fixed-seed attempts for `hi:DRAWDOWN_5` had plausible signal/natural EOS but could not establish the exact protected number. A separate offline one-variable ASR diagnostic changed greedy ASR to five beams on the SAME three WAVs; it did not change TTS or add synthesis attempts. All three still failed exact quantity confirmation. Results below are diagnostic only, not alternate approvals.

| Attempt | Beam-5 transcript | CER | Quantity confirmed | ASR wall s | Peak RSS bytes |
|---:|---|---:|---|---:|---:|
| 1 | रास्ता शुर्वाद से पाच प्रतिषत नीचे हैं। | 0.189189 | False | 6.00 | 2107113472 |
| 2 | जास्ता शुर्वाद से पाज प्रतिषत नीचे हैं। | 0.243243 | False | 5.87 | 2129096704 |
| 3 | रास्ता शुर्वाद सी पाज्प्रतिषत नीचे हैं। | 0.270270 | False | 6.01 | 2132144128 |

This does not establish whether the defect is TTS pronunciation or ASR recognition. A targeted native-Hindi listening check or independently justified recognizer/voice intervention is needed. Do not mark the number correct by fuzzy substitution or keep changing seeds. The incomplete manifest deliberately disables journey playback and blocks release; the rest of the text journey remains usable.


## Reproduction and honest limits

Use AUDIO_PIPELINE.md for explicit cache preparation and offline generation. Run `node scripts/check-audio.mjs`, content/release checks, a fresh build and production browser tests; the synthesis script alone does not establish playback/offline success.
Whisper-small is a fallible recognizer, especially Hindi. Nonzero CER can reflect TTS or ASR errors; exact negation/prosody and cultural clarity still require listening/native review. Captions remain authoritative. No full-set success is claimed if `complete` is false. Any failed tracks remain excluded and the gate stays red.
