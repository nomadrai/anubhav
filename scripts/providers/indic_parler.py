"""Optional, local-only adapter for ``ai4bharat/indic-parler-tts``.

The heavyweight TTS stack is deliberately imported only when generation is
requested.  A model directory is mandatory and every ``from_pretrained`` call
uses ``local_files_only=True``; this module never downloads weights or calls a
runtime service.
"""

from __future__ import annotations

import importlib
import importlib.util
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

from .base import AudioProvider, AudioProviderError, GeneratedAudio

DEFAULT_MODEL_ID = "ai4bharat/indic-parler-tts"
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
        if not isinstance(self.seed, int):
            raise IndicParlerError("generation seed must be an integer")

    def generation_dict(self, *, resolved_device: str | None = None) -> dict[str, Any]:
        """Return only stable, non-machine-path generation inputs."""

        return {
            "modelId": self.model_id,
            "modelRevision": self.model_revision,
            "voiceDescription": self.description,
            "device": resolved_device or self.device,
            "seed": self.seed,
            "generation": {"doSample": False},
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
    ) -> None:
        self.torch = torch_module
        self.model = model
        self.prompt_tokenizer = prompt_tokenizer
        self.description_tokenizer = description_tokenizer
        self.description = description
        self.device = device
        self.seed = seed

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
                do_sample=False,
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
        return {
            "provider": self.name,
            "ready": True,
            "modelId": self.config.model_id,
            "modelRevision": self.config.model_revision,
            "modelSource": "local-only",
            "modelDir": str(model_dir),
            "generationConfig": self.generation_config(),
        }

    def generation_config(self) -> dict[str, Any]:
        return self.config.generation_dict(resolved_device=self._resolved_device)

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
            transformers = importlib.import_module("transformers")
        except (ImportError, OSError) as exc:
            raise IndicParlerError(
                "offline TTS dependencies could not be imported; no audio was generated"
            ) from exc

        try:
            model_class = parler_tts.ParlerTTSForConditionalGeneration
            tokenizer_class = transformers.AutoTokenizer
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
            prompt_tokenizer = tokenizer_class.from_pretrained(
                str(model_dir),
                revision=self.config.model_revision,
                local_files_only=True,
            )

            tokenizer_dir = self.config.description_tokenizer_dir
            if tokenizer_dir is None:
                text_encoder = getattr(getattr(model, "config", None), "text_encoder", None)
                text_encoder_name = getattr(text_encoder, "_name_or_path", None)
                if not text_encoder_name:
                    raise IndicParlerError(
                        "local model config does not identify a description tokenizer; "
                        "pass --description-tokenizer-dir"
                    )
                tokenizer_source = text_encoder_name
            else:
                tokenizer_source = str(tokenizer_dir.resolve())
            # The text encoder can be a separate cached repository, so the
            # model checkpoint revision must not be passed as its revision.
            description_tokenizer = tokenizer_class.from_pretrained(
                tokenizer_source,
                local_files_only=True,
            )
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
                "only en and hi are in this app's reviewed track contract"
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
    if requested == "cpu" or requested.startswith("cuda"):
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
