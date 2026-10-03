"""Build-time objective speech checks. No metric is a human listening review."""
from __future__ import annotations

import hashlib
import math
import re
import threading
import unicodedata
from pathlib import Path
from time import perf_counter


def stable_seed(language: str, track_id: str, text: str, attempt: int = 0, base: int = 0) -> int:
    payload = f"{base}\0{language}\0{track_id}\0{text.strip()}\0{attempt}"
    return int.from_bytes(hashlib.sha256(payload.encode()).digest()[:4], "big")


def token_cap(text: str, config: dict) -> int:
    seconds = len(text.split()) * config["secondsPerWordAllowance"] + config["durationPaddingSeconds"]
    # DAC emits 44,100 / 512 frames per second plus nine delayed codebooks.
    return min(config["maximumTokens"], max(config["minimumTokens"], math.ceil(seconds * 44100 / 512) + 9))


NUMBER_WORDS = {
    "en": {"0": "zero", "1": "one", "2": "two", "5": "five", "10": "ten", "20": "twenty", "25": "twenty five", "50": "fifty", "75": "seventy five", "100": "one hundred"},
    "hi": {"0": "शून्य", "1": "एक", "2": "दो", "5": "पाँच", "10": "दस", "20": "बीस", "25": "पच्चीस", "50": "पचास", "75": "पचहत्तर", "100": "सौ"},
}


def normalized_transcript(text: str, language: str = "en", *, spoken_numbers: bool = True) -> str:
    # Normalize only explicit numerical spelling, not synonyms or wrong quantities.
    value = unicodedata.normalize("NFKC", text).casefold()
    if spoken_numbers:
        value = "".join(str(unicodedata.digit(ch)) if ch.isdecimal() else ch for ch in value)
        value = value.replace("%", " प्रतिशत " if language == "hi" else " percent ")
        value = re.sub(r"(?<![\w.])\d+(?![\w.])", lambda match: NUMBER_WORDS[language].get(match[0], match[0]), value)
    value = "".join(ch if unicodedata.category(ch)[0] in "LMN" else " " for ch in value)
    return " ".join(value.split())


def character_error_rate(reference: str, hypothesis: str, language: str = "en", *, spoken_numbers: bool = True) -> float:
    reference, hypothesis = normalized_transcript(reference, language, spoken_numbers=spoken_numbers), normalized_transcript(hypothesis, language, spoken_numbers=spoken_numbers)
    if not reference:
        raise ValueError("CER reference must be nonempty")
    previous = list(range(len(hypothesis) + 1))
    for i, a in enumerate(reference, 1):
        row = [i]
        for j, b in enumerate(hypothesis, 1):
            row.append(min(row[-1]+1, previous[j]+1, previous[j-1]+(a != b)))
        previous = row
    return previous[-1] / len(reference)


def assess_transcript(reference: str, hypothesis: str, language: str) -> dict:
    def protected_quantities(text):
        normalized = normalized_transcript(text, language)
        # Ignore one/two in ordinary grammar; protect the lesson's percentages.
        result = []
        for number, word in NUMBER_WORDS[language].items():
            if int(number) < 5:
                continue
            result.extend([number] * len(re.findall(r"(?<![\w\u0900-\u097f])" + re.escape(word) + r"(?![\w\u0900-\u097f])", normalized)))
        return sorted(result)
    return {"cer": character_error_rate(reference, hypothesis, language),
            "rawCer": character_error_rate(reference, hypothesis, language, spoken_numbers=False),
            "quantitiesMatch": protected_quantities(reference) == protected_quantities(hypothesis),
            "normalizationVersion": 2,
            "normalization": "NFKC-casefold; explicit number/% spelling; punctuation/space; codepoint CER; marks retained; protected quantities checked"}


def signal_metrics(wav: Path) -> dict:
    import numpy as np
    import soundfile as sf
    samples, rate = sf.read(wav, dtype="float64", always_2d=True)
    if samples.size == 0 or not np.isfinite(samples).all():
        return {"finite": False, "durationSeconds": 0}
    rms = float(np.sqrt(np.mean(samples**2)))
    return {"finite": True, "sampleRate": rate, "channels": samples.shape[1],
            "durationSeconds": len(samples)/rate, "rmsDbfs": float(20*np.log10(max(rms, 1e-12))),
            "peak": float(np.max(np.abs(samples))), "silenceRatio": float(np.mean(np.abs(samples)<0.001)),
            "clippedRatio": float(np.mean(np.abs(samples)>=0.999)),
            "wavSha256": hashlib.sha256(wav.read_bytes()).hexdigest()}


def signal_failures(metrics: dict, text: str, termination: dict, config: dict, prior_hashes: dict) -> list[str]:
    failures = []
    if termination.get("eos") is not True or termination.get("hitTokenLimit") is not False:
        failures.append("missing-natural-eos-or-token-limit")
    if not metrics.get("finite"):
        return failures + ["empty-or-nonfinite-signal"]
    if metrics["channels"] != 1:
        failures.append("not-mono")
    quality = config["quality"]
    for field, threshold, direction in (("rmsDbfs", "minimumRmsDbfs", "min"), ("peak", "minimumPeak", "min"),
                                        ("silenceRatio", "maximumSilenceRatio", "max"), ("clippedRatio", "maximumClippedRatio", "max")):
        if (metrics[field] < quality[threshold]) if direction == "min" else (metrics[field] > quality[threshold]):
            failures.append(field)
    words = len(text.split())
    if not max(0.35, words*0.10) <= metrics["durationSeconds"] <= min(30.0, words*1.2+4):
        failures.append("implausible-duration")
    old_text = prior_hashes.get(metrics["wavSha256"])
    if old_text is not None and old_text != text:
        failures.append("duplicate-audio-for-different-text")
    return failures


class Measure:
    """perf_counter wall time and psutil peak resident bytes sampled every 20ms."""
    def __enter__(self):
        import psutil
        self.process = psutil.Process()
        self.peak = self.process.memory_info().rss
        self.stop = threading.Event()
        self.started = perf_counter()
        def sample():
            while not self.stop.wait(0.02):
                self.peak = max(self.peak, self.process.memory_info().rss)
        self.worker = threading.Thread(target=sample, daemon=True)
        self.worker.start()
        return self

    def __exit__(self, *_):
        self.seconds = perf_counter()-self.started
        self.peak = max(self.peak, self.process.memory_info().rss)
        self.stop.set()
        self.worker.join()


class OfflineAsr:
    def __init__(self, config: dict):
        import torch
        from transformers import WhisperProcessor, WhisperForConditionalGeneration
        self.torch = torch
        self.config = config
        options = {"revision": config["revision"], "local_files_only": True, "trust_remote_code": False}
        self.processor = WhisperProcessor.from_pretrained(config["modelId"], **options)
        self.model = WhisperForConditionalGeneration.from_pretrained(config["modelId"], **options).to("cpu").eval()

    def transcribe(self, wav: Path, language: str, reference: str) -> dict:
        import soundfile as sf
        from scipy.signal import resample_poly
        audio, rate = sf.read(wav, dtype="float32")
        divisor = math.gcd(rate, 16000)
        audio = resample_poly(audio, 16000//divisor, rate//divisor)
        if len(audio) > 30*16000:
            raise ValueError("ASR diagnostic is limited to thirty-second clips")
        inputs = self.processor(audio, sampling_rate=16000, return_tensors="pt", return_attention_mask=True)
        with self.torch.inference_mode():
            ids = self.model.generate(inputs.input_features, attention_mask=inputs.attention_mask,
                                      language="hindi" if language == "hi" else "english", task="transcribe",
                                      do_sample=False, max_new_tokens=256)
        text = self.processor.batch_decode(ids, skip_special_tokens=True)[0].strip()
        return {"transcript": text, **assess_transcript(reference, text, language),
                "modelId": self.config["modelId"], "revision": self.config["revision"]}
