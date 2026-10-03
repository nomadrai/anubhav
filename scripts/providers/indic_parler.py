"""Optional, local-only adapter for ``ai4bharat/indic-parler-tts``.

The heavyweight TTS stack is deliberately imported only when generation is
requested.  A model directory is mandatory and every ``from_pretrained`` call
uses ``local_files_only=True``; this module never downloads weights or calls a
runtime service.
"""

from __future__ import annotations

import importlib
import importlib.util
import hashlib
import json
import re
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Any, Callable

from .base import AudioProvider, AudioProviderError, GeneratedAudio

TTS_CONFIG_PATH = Path(__file__).resolve().parents[1] / "config" / "tts.json"
TTS_CONFIG = json.loads(TTS_CONFIG_PATH.read_text(encoding="utf-8"))
DEFAULT_MODEL_ID = TTS_CONFIG["modelId"]
DEFAULT_MODEL_REVISION = TTS_CONFIG["modelRevision"]
DEFAULT_TOKENIZER_ID = TTS_CONFIG["descriptionTokenizerId"]
DEFAULT_TOKENIZER_REVISION = TTS_CONFIG["descriptionTokenizerRevision"]
DEFAULT_DESCRIPTION = (
    "A clear, calm narrator speaks at a moderate pace with a neutral tone. "
    "The recording is close, clean, and free of background noise."
)
REQUIRED_DEPENDENCIES = ("torch", "transformers", "parler_tts", "soundfile")
SUPPORTED_LANGUAGES = frozenset(("en", "hi"))


class IndicParlerError(AudioProviderError):
    """The optional local provider is unavailable or cannot generate safely."""


@dataclass(frozen=True)
class IndicParlerConfig:
    model_id: str = DEFAULT_MODEL_ID
    model_revision: str | None = None
    model_dir: Path | None = None
    description: str = DEFAULT_DESCRIPTION
    device: str = "cpu"
    seed: int = 0
    description_tokenizer_dir: Path | None = None
    description_tokenizer_id: str = DEFAULT_TOKENIZER_ID
    description_tokenizer_revision: str = DEFAULT_TOKENIZER_REVISION
    do_sample: bool = False
    max_new_tokens: int = 2048

    def validate(self) -> None:
        if not isinstance(self.model_id, str) or not self.model_id.strip():
            raise IndicParlerError("model id must be a non-empty string")
        if not isinstance(self.model_revision, str) or not self.model_revision.strip():
            raise IndicParlerError(
                "a model revision is required; pass an immutable local model revision "
                "with --model-revision"
            )
        if not isinstance(self.description, str) or not self.description.strip():
            raise IndicParlerError("voice description must be a non-empty string")
        if type(self.seed) is not int or not 0 <= self.seed < 2**32:
            raise IndicParlerError("generation seed must be an integer from zero through 2**32-1")
        if not re.fullmatch(r"[0-9a-f]{40}", self.description_tokenizer_revision):
            raise IndicParlerError("description tokenizer revision must be an immutable 40-character commit")
        if not self.description_tokenizer_id.strip():
            raise IndicParlerError("description tokenizer id is required")
        if type(self.do_sample) is not bool:
            raise IndicParlerError("do_sample must be a boolean")
        if type(self.max_new_tokens) is not int or not 1 <= self.max_new_tokens <= 4096:
            raise IndicParlerError("max_new_tokens must be an integer from one through 4096")

    def generation_dict(self, *, resolved_device: str | None = None) -> dict[str, Any]:
        """Return only stable, non-machine-path generation inputs."""

        return {
            "modelId": self.model_id,
            "modelRevision": self.model_revision,
            "voiceDescription": self.description,
            "device": resolved_device or self.device,
            "seed": self.seed,
            "descriptionTokenizer": {
                "id": self.description_tokenizer_id,
                "revision": self.description_tokenizer_revision,
            },
            "generation": {"doSample": self.do_sample, "maxNewTokens": self.max_new_tokens},
        }


class _TransformersBackend:
    """Thin wrapper around the lazily imported model objects."""

    def __init__(
        self,
        *,
        torch_module: Any,
        model: Any,
        prompt_tokenizer: Any,
        description_tokenizer: Any,
        description: str,
        device: str,
        seed: int,
        do_sample: bool,
        max_new_tokens: int,
    ) -> None:
        self.torch = torch_module
        self.model = model
        self.prompt_tokenizer = prompt_tokenizer
        self.description_tokenizer = description_tokenizer
        self.description = description
        self.device = device
        self.seed = seed
        self.do_sample = do_sample
        self.max_new_tokens = max_new_tokens

    def synthesize(self, spoken_text: str, *, language: str) -> tuple[Any, int]:
        # Greedy generation plus a fixed seed makes the requested build path
        # deterministic where the selected backend/device is deterministic.
        self.torch.manual_seed(self.seed)
        if hasattr(self.torch, "cuda") and self.torch.cuda.is_available():
            self.torch.cuda.manual_seed_all(self.seed)

        description_inputs = self.description_tokenizer(
            self.description, return_tensors="pt"
        ).to(self.device)
        prompt_inputs = self.prompt_tokenizer(
            spoken_text, return_tensors="pt"
        ).to(self.device)
        inference_mode = getattr(self.torch, "inference_mode", None)
        context = inference_mode() if inference_mode else self.torch.no_grad()
        with context:
            generation = self.model.generate(
                input_ids=description_inputs.input_ids,
                attention_mask=description_inputs.attention_mask,
                prompt_input_ids=prompt_inputs.input_ids,
                prompt_attention_mask=prompt_inputs.attention_mask,
                do_sample=self.do_sample,
                max_new_tokens=self.max_new_tokens,
            )
        audio = generation.detach().cpu().numpy().squeeze()
        sample_rate = getattr(getattr(self.model, "config", None), "sampling_rate", None)
        if not isinstance(sample_rate, int) or sample_rate <= 0:
            raise IndicParlerError(
                "local model did not expose a positive integer sampling rate"
            )
        return audio, sample_rate


class IndicParlerProvider(AudioProvider):
    """Generate English/Hindi WAV files from a user-provided local checkpoint."""

    name = "indic_parler"

    def __init__(
        self,
        *,
        model_id: str = DEFAULT_MODEL_ID,
        model_revision: str | None = None,
        model_dir: Path | str | None = None,
        description: str = DEFAULT_DESCRIPTION,
        device: str = "cpu",
        seed: int = 0,
        description_tokenizer_dir: Path | str | None = None,
        description_tokenizer_id: str = DEFAULT_TOKENIZER_ID,
        description_tokenizer_revision: str = DEFAULT_TOKENIZER_REVISION,
        do_sample: bool = False,
        max_new_tokens: int = 2048,
        backend_factory: Callable[[], Any] | None = None,
        wav_writer: Callable[[Path, Any, int], None] | None = None,
        dependency_finder: Callable[[str], Any] | None = None,
    ) -> None:
        self.config = IndicParlerConfig(
            model_id=model_id,
            model_revision=model_revision,
            model_dir=Path(model_dir).expanduser() if model_dir is not None else None,
            description=description,
            device=device,
            seed=seed,
            description_tokenizer_id=description_tokenizer_id,
            description_tokenizer_revision=description_tokenizer_revision,
            do_sample=do_sample,
            max_new_tokens=max_new_tokens,
            description_tokenizer_dir=(
                Path(description_tokenizer_dir).expanduser()
                if description_tokenizer_dir is not None
                else None
            ),
        )
        self._backend_factory = backend_factory
        self._wav_writer = wav_writer or _write_wav
        self._dependency_finder = dependency_finder or importlib.util.find_spec
        self._backend: Any | None = None
        self._resolved_device: str | None = None
        self._tokenizers: tuple[Any, Any] | None = None
        self._tokenizer_hashes: dict[str, str] = {}

    def _resolved_model_dir(self) -> Path:
        if self.config.model_dir is None:
            raise IndicParlerError(
                "a local --model-dir is required; refusing to download or resolve a "
                "remote model"
            )
        model_dir = self.config.model_dir.resolve()
        if not model_dir.exists() or not model_dir.is_dir():
            raise IndicParlerError(
                f"local model directory does not exist or is not a directory: {model_dir}"
            )
        if not (model_dir / "config.json").is_file():
            raise IndicParlerError(
                f"local model directory has no config.json: {model_dir}; "
                "model access is incomplete"
            )
        return model_dir

    def _missing_dependencies(self) -> list[str]:
        missing = []
        for module_name in REQUIRED_DEPENDENCIES:
            try:
                available = self._dependency_finder(module_name) is not None
            except (ImportError, AttributeError, ValueError):
                available = False
            if not available:
                missing.append(module_name)
        return missing

    def check_requirements(self) -> dict[str, Any]:
        self.config.validate()
        model_dir = self._resolved_model_dir()
        if self._backend_factory is None:
            missing = self._missing_dependencies()
            if missing:
                raise IndicParlerError(
                    "missing optional offline audio dependencies: "
                    + ", ".join(missing)
                    + "; install the documented audio extras locally, then retry"
                )
            weight_files = tuple(model_dir.glob("*.safetensors")) + tuple(
                model_dir.glob("*.bin")
            )
            if not weight_files:
                raise IndicParlerError(
                    f"local model directory has no supported weight file: {model_dir}; "
                    "gated model access is incomplete"
                )
        if self.config.description_tokenizer_dir is not None:
            tokenizer_dir = self.config.description_tokenizer_dir.resolve()
            if not tokenizer_dir.is_dir():
                raise IndicParlerError(
                    "description tokenizer directory does not exist: "
                    f"{tokenizer_dir}"
                )
        if self._backend_factory is None:
            # find_spec alone misses broken native wheels, e.g. CUDA torchaudio on CPU.
            try:
                for name in REQUIRED_DEPENDENCIES:
                    importlib.import_module(name)
                torch = importlib.import_module("torch")
                self._resolved_device = _resolve_device(torch, self.config.device)
                self._load_tokenizers()
            except IndicParlerError:
                raise
            except Exception as exc:
                raise IndicParlerError(f"offline TTS prerequisite import failed ({type(exc).__name__}): {exc}") from exc
        return {
            "provider": self.name,
            "ready": True,
            "modelId": self.config.model_id,
            "modelRevision": self.config.model_revision,
            "modelSource": "local-only",
            "modelDir": str(model_dir),
            "generationConfig": self.generation_config(),
        }

    def _load_tokenizers(self) -> tuple[Any, Any]:
        if self._tokenizers is not None:
            return self._tokenizers
        model_dir = self._resolved_model_dir()
        try:
            model_config = json.loads((model_dir / "config.json").read_text(encoding="utf-8"))
            configured_id = model_config.get("text_encoder", {}).get("_name_or_path")
            if configured_id != self.config.description_tokenizer_id:
                raise IndicParlerError(f"model text_encoder identifies {configured_id!r}, not pinned tokenizer {self.config.description_tokenizer_id!r}")
            tokenizer_class = importlib.import_module("transformers").AutoTokenizer
            tokenizer_dir = self.config.description_tokenizer_dir
            if tokenizer_dir is None:
                hub = importlib.import_module("huggingface_hub")
                tokenizer_dir = Path(hub.snapshot_download(
                    repo_id=self.config.description_tokenizer_id,
                    revision=self.config.description_tokenizer_revision,
                    local_files_only=True,
                ))
            description = tokenizer_class.from_pretrained(
                str(tokenizer_dir), revision=self.config.description_tokenizer_revision,
                local_files_only=True, trust_remote_code=False,
            )
            prompt = tokenizer_class.from_pretrained(
                str(model_dir), revision=self.config.model_revision,
                local_files_only=True, trust_remote_code=False,
            )
            for directory, prefix in ((model_dir, "prompt"), (tokenizer_dir, "description")):
                for name in ("tokenizer.json", "tokenizer.model", "spiece.model", "tokenizer_config.json", "special_tokens_map.json"):
                    file = directory / name
                    if file.is_file():
                        self._tokenizer_hashes[f"{prefix}/{name}"] = hashlib.sha256(file.read_bytes()).hexdigest()
            self._tokenizers = (prompt, description)
            return self._tokenizers
        except IndicParlerError:
            raise
        except Exception as exc:
            raise IndicParlerError(
                "pinned tokenizer unavailable offline; run scripts/audition_audio.py --cache-tokenizer once online "
                f"or supply --description-tokenizer-dir ({type(exc).__name__}: {exc})"
            ) from exc

    def generation_config(self) -> dict[str, Any]:
        config = self.config.generation_dict(resolved_device=self._resolved_device)
        if self._tokenizer_hashes:
            config["tokenizerFileSha256"] = dict(self._tokenizer_hashes)
        return config

    def prepare(self) -> None:
        """Load once outside per-clip timing; no speech or network request."""
        self._get_backend()

    def set_voice_description(self, description: str) -> None:
        config = replace(self.config, description=description)
        config.validate()
        self.config = config
        if self._backend is not None:
            self._backend.description = description

    def provenance(self) -> dict[str, Any]:
        model_dir = (
            str(self.config.model_dir.resolve())
            if self.config.model_dir is not None
            else None
        )
        return {
            "modelId": self.config.model_id,
            "modelRevision": self.config.model_revision,
            "modelSource": "local-only",
            "modelDir": model_dir,
            "config": self.generation_config(),
        }

    def dry_run(
        self,
        spoken_text: str,
        *,
        language: str,
        content_sha256: str,
    ) -> dict[str, Any]:
        result = super().dry_run(
            spoken_text, language=language, content_sha256=content_sha256
        )
        result.update(
            {
                "provider": self.name,
                "modelId": self.config.model_id,
                "modelRevision": self.config.model_revision,
                "generationConfig": self.generation_config(),
                "offlineOnly": True,
            }
        )
        return result

    def _load_backend(self) -> Any:
        self.check_requirements()
        try:
            torch = importlib.import_module("torch")
            parler_tts = importlib.import_module("parler_tts")
            importlib.import_module("transformers")
        except (ImportError, OSError) as exc:
            raise IndicParlerError(
                "offline TTS dependencies could not be imported; no audio was generated"
            ) from exc

        try:
            model_class = parler_tts.ParlerTTSForConditionalGeneration
            model_dir = self._resolved_model_dir()
            model = model_class.from_pretrained(
                str(model_dir),
                revision=self.config.model_revision,
                local_files_only=True,
            )
            resolved_device = _resolve_device(torch, self.config.device)
            self._resolved_device = resolved_device
            model = model.to(resolved_device)
            if hasattr(model, "eval"):
                model.eval()
            prompt_tokenizer, description_tokenizer = self._load_tokenizers()
        except IndicParlerError:
            raise
        except Exception as exc:  # transformers uses several exception types
            raise IndicParlerError(
                "local Indic Parler model access failed; check gated access, files, "
                "revision, and tokenizer caches. Network access is disabled."
            ) from exc
        return _TransformersBackend(
            torch_module=torch,
            model=model,
            prompt_tokenizer=prompt_tokenizer,
            description_tokenizer=description_tokenizer,
            description=self.config.description,
            device=self._resolved_device or self.config.device,
            seed=self.config.seed,
            do_sample=self.config.do_sample,
            max_new_tokens=self.config.max_new_tokens,
        )

    def _get_backend(self) -> Any:
        if self._backend is None:
            if self._backend_factory is not None:
                self.config.validate()
                self._resolved_model_dir()
                self._backend = self._backend_factory()
            else:
                self._backend = self._load_backend()
        return self._backend

    def generate(
        self,
        spoken_text: str,
        *,
        language: str,
        content_sha256: str,
        output_wav: Path | None = None,
    ) -> GeneratedAudio:
        if language not in SUPPORTED_LANGUAGES:
            raise IndicParlerError(
                f"Indic Parler audio is not enabled for language {language!r}; "
                "only en and hi are enabled in this app's track contract"
            )
        if not spoken_text.strip():
            raise IndicParlerError("cannot synthesize empty spoken text")
        if output_wav is None:
            raise IndicParlerError("a temporary output WAV path is required")
        wav_path = Path(output_wav).resolve()
        wav_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            samples, sample_rate = self._get_backend().synthesize(
                spoken_text, language=language
            )
            if not isinstance(sample_rate, int) or sample_rate <= 0:
                raise IndicParlerError("provider returned an invalid WAV sample rate")
            self._wav_writer(wav_path, samples, sample_rate)
        except IndicParlerError:
            raise
        except Exception as exc:
            raise IndicParlerError(
                "local model generation failed; no audio asset was approved"
            ) from exc
        if not wav_path.is_file() or wav_path.stat().st_size == 0:
            raise IndicParlerError("the provider did not produce a non-empty WAV file")
        return GeneratedAudio(
            wav_path=wav_path,
            sample_rate=sample_rate,
            provenance=self.provenance(),
        )


def _resolve_device(torch: Any, requested: str) -> str:
    if requested == "auto":
        return "cuda:0" if torch.cuda.is_available() else "cpu"
    if requested == "cpu":
        return requested
    if re.fullmatch(r"cuda(?::\d+)?", requested) and torch.cuda.is_available():
        return requested
    raise IndicParlerError(
        f"unsupported device {requested!r}; use cpu, cuda[:N], or auto"
    )


def _write_wav(path: Path, samples: Any, sample_rate: int) -> None:
    try:
        soundfile = importlib.import_module("soundfile")
        soundfile.write(str(path), samples, sample_rate, format="WAV", subtype="PCM_16")
    except (ImportError, OSError, RuntimeError) as exc:
        raise IndicParlerError(
            "soundfile is required to write the provider WAV; no audio was generated"
        ) from exc
