#!/usr/bin/env python3
"""Standalone model-card reproduction. Does NOT import the app's TTS provider.

Default mode passes no generation overrides. Other modes change one variable.
All model/tokenizer loads are pinned/local-only; WAVs and metrics stay ignored.
"""
import argparse
import hashlib
import json
import os
import threading
from pathlib import Path
from time import perf_counter

os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model-dir", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--threads", type=int, default=4)
    parser.add_argument("--mode", choices=("default", "greedy", "eager"), default="default")
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    if any(args.output_dir.iterdir()):
        parser.error("output folder must be empty")
    import numpy as np
    import psutil
    import soundfile as sf
    import torch
    from parler_tts import ParlerTTSForConditionalGeneration
    from transformers import AutoTokenizer

    config = json.loads((Path(__file__).parent / "config/tts.json").read_text())
    torch.set_num_threads(args.threads)
    torch.set_num_interop_threads(1)
    started = perf_counter()
    extra = {"attn_implementation": "eager"} if args.mode == "eager" else {}
    model = ParlerTTSForConditionalGeneration.from_pretrained(
        str(args.model_dir), local_files_only=True, revision=config["modelRevision"], **extra
    ).to("cpu")
    tokenizer = AutoTokenizer.from_pretrained(str(args.model_dir), local_files_only=True, revision=config["modelRevision"])
    description_tokenizer = AutoTokenizer.from_pretrained(
        "google/flan-t5-large", revision=config["descriptionTokenizerRevision"], local_files_only=True)
    report = {"mode": args.mode, "threads": args.threads, "seed": 0,
              "modelRevision": config["modelRevision"], "tokenizerRevision": config["descriptionTokenizerRevision"],
              "generationConfig": model.generation_config.to_dict(), "modelLoadSeconds": perf_counter()-started,
              "torch": torch.__version__, "dtype": str(next(model.parameters()).dtype), "clips": []}
    for language, prompt, description in (
        ("en", "Hey, how are you doing today?", "A female speaker with a British accent delivers a slightly expressive and animated speech with a moderate speed and pitch. The recording is of very high quality, with the speaker's voice sounding clear and very close up."),
        ("hi", "अरे, तुम आज कैसे हो?", "Divya's voice is monotone yet slightly fast in delivery, with a very close recording that almost has no background noise."),
    ):
        torch.manual_seed(0)
        # Same two-tokenizer and attention-mask arguments as the model card.
        description_inputs = description_tokenizer(description, return_tensors="pt").to("cpu")
        prompt_inputs = tokenizer(prompt, return_tensors="pt").to("cpu")
        peak = [psutil.Process().memory_info().rss]
        stop = threading.Event()
        def sample_rss():
            while not stop.wait(0.02):
                peak[0] = max(peak[0], psutil.Process().memory_info().rss)
        sampler = threading.Thread(target=sample_rss, daemon=True)
        sampler.start()
        started = perf_counter()
        overrides = {"do_sample": False} if args.mode == "greedy" else {}
        print(f"START {args.mode} {args.threads} threads {language}", flush=True)
        try:
            generation = model.generate(
                input_ids=description_inputs.input_ids,
                attention_mask=description_inputs.attention_mask,
                prompt_input_ids=prompt_inputs.input_ids,
                prompt_attention_mask=prompt_inputs.attention_mask,
                **overrides,
            )
            samples = generation.cpu().numpy().squeeze()
        finally:
            elapsed = perf_counter() - started
            stop.set()
            sampler.join()
        rate = model.config.sampling_rate
        output = args.output_dir / f"{language}.wav"
        sf.write(output, samples, rate)
        rms = float(np.sqrt(np.mean(samples.astype(np.float64)**2)))
        row = {"language": language, "text": prompt, "description": description,
               "wallSeconds": elapsed, "durationSeconds": len(samples)/rate,
               "rmsDbfs": float(20*np.log10(max(rms, 1e-12))), "peak": float(np.max(np.abs(samples))),
               "silenceSampleRatio": float(np.mean(np.abs(samples)<0.001)), "peakRssBytes": peak[0],
               "sha256": hashlib.sha256(output.read_bytes()).hexdigest()}
        report["clips"].append(row)
        (args.output_dir / "metrics.json").write_text(json.dumps(report, indent=2, ensure_ascii=False)+"\n")
        print(json.dumps(row, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
