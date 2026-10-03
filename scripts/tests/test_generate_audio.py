import hashlib
import tempfile
import unittest
from pathlib import Path

from scripts.generate_audio import (
    AudioCliError,
    build_dry_run_plan,
    convert_wav_to_opus,
    generate_audio_assets,
    generation_input_sha256,
)
from scripts.providers.indic_parler import IndicParlerError, IndicParlerProvider
from scripts.providers.stub import StubProvider


class FakeBackend:
    def synthesize(self, spoken_text: str, *, language: str):
        return ([0.0, 0.1, -0.1], 16_000)


def fake_wav_writer(path: Path, samples, sample_rate: int) -> None:
    path.write_bytes(f"fake-wav:{sample_rate}:{samples}".encode("utf-8"))


def fake_ffmpeg_runner(command, **kwargs):
    Path(command[-1]).write_bytes(b"fake-ogg-opus")


class GenerateAudioTests(unittest.TestCase):
    def test_stub_plan_has_hashes_and_no_manifest(self):
        episode = {
            "id": "x",
            "reveal": {
                "periodText": {"en": "English period", "hi": "हिंदी अवधि"},
                "whatHappenedText": {"en": "English event", "hi": "हिंदी घटना"},
            },
        }
        plan = build_dry_run_plan(episode, StubProvider())
        self.assertEqual(plan["kind"], "audio-dry-run-plan")
        self.assertFalse(plan["manifestGenerated"])
        self.assertFalse(plan["assetsGenerated"])
        self.assertEqual(len(plan["tracks"]), 4)
        self.assertEqual(
            plan["tracks"][0]["contentSha256"],
            hashlib.sha256(b"English period").hexdigest(),
        )

    def test_indic_dry_run_does_not_check_or_download_model(self):
        provider = IndicParlerProvider(
            model_revision="local-commit",
            model_dir="/does/not/exist",
        )
        episode = {
            "id": "x",
            "reveal": {
                "periodText": {"en": "English period", "hi": "हिंदी अवधि"},
                "whatHappenedText": {"en": "English event", "hi": "हिंदी घटना"},
            },
        }
        plan = build_dry_run_plan(episode, provider)
        self.assertEqual(plan["provider"], "indic_parler")
        self.assertEqual(plan["tracks"][0]["modelId"], "ai4bharat/indic-parler-tts")
        self.assertEqual(plan["tracks"][0]["modelRevision"], "local-commit")
        self.assertTrue(plan["tracks"][0]["offlineOnly"])

    def test_missing_model_and_optional_dependencies_fail_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            model_dir = Path(directory) / "model"
            model_dir.mkdir()
            (model_dir / "config.json").write_text("{}", encoding="utf-8")
            provider = IndicParlerProvider(
                model_revision="local-commit",
                model_dir=model_dir,
                dependency_finder=lambda name: None,
            )
            with self.assertRaisesRegex(IndicParlerError, "missing optional offline audio dependencies"):
                provider.check_requirements()

        provider = IndicParlerProvider(model_revision="local-commit", model_dir="missing")
        with self.assertRaisesRegex(IndicParlerError, "local model directory"):
            provider.check_requirements()

    def test_fake_provider_generates_manifest_without_heavy_dependencies(self):
        episode = {
            "id": "episode-a",
            "reveal": {
                "periodText": {"en": "English period", "hi": "हिंदी अवधि"},
                "whatHappenedText": {"en": "English event", "hi": "हिंदी घटना"},
            },
        }
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            model_dir = root / "model"
            model_dir.mkdir()
            (model_dir / "config.json").write_text("{}", encoding="utf-8")
            output_dir = root / "audio"
            provider = IndicParlerProvider(
                model_revision="local-commit",
                model_dir=model_dir,
                backend_factory=FakeBackend,
                wav_writer=fake_wav_writer,
            )
            manifest = generate_audio_assets(
                episode,
                provider,
                output_dir,
                ffmpeg="fake-ffmpeg",
                runner=fake_ffmpeg_runner,
                executable_finder=lambda name: "/usr/bin/fake-ffmpeg",
            )
            self.assertTrue((output_dir / "manifest.json").is_file())
            self.assertEqual(manifest["schemaVersion"], 1)
            self.assertEqual(len(manifest["entries"]), 4)
            self.assertEqual(manifest["provenance"]["modelId"], "ai4bharat/indic-parler-tts")
            self.assertEqual(manifest["provenance"]["modelRevision"], "local-commit")
            self.assertEqual(manifest["provenance"]["modelSource"], "local-only")
            self.assertTrue(all(entry["path"].endswith(".opus") for entry in manifest["entries"]))
            self.assertTrue(all((output_dir / entry["path"]).is_file() for entry in manifest["entries"]))
            self.assertEqual(
                manifest["entries"][0]["contentSha256"],
                hashlib.sha256("English period".encode("utf-8")).hexdigest(),
            )
            first_hash = generation_input_sha256(
                "English period", language="en", provider=provider
            )
            second_hash = generation_input_sha256(
                "English period", language="en", provider=provider
            )
            self.assertEqual(first_hash, second_hash)
            self.assertNotEqual(first_hash, manifest["entries"][1]["inputSha256"])

    def test_output_id_and_model_paths_are_safe(self):
        episode = {
            "id": "../escape",
            "reveal": {
                "periodText": {"en": "English period", "hi": "हिंदी अवधि"},
                "whatHappenedText": {"en": "English event", "hi": "हिंदी घटना"},
            },
        }
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            model_dir = root / "model"
            model_dir.mkdir()
            (model_dir / "config.json").write_text("{}", encoding="utf-8")
            provider = IndicParlerProvider(
                model_revision="local-commit",
                model_dir=model_dir,
                backend_factory=FakeBackend,
                wav_writer=fake_wav_writer,
            )
            with self.assertRaisesRegex(AudioCliError, "episode id"):
                generate_audio_assets(episode, provider, root / "audio")

    def test_ffmpeg_is_required_and_contract_is_explicit(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            wav = root / "input.wav"
            wav.write_bytes(b"wav")
            with self.assertRaisesRegex(AudioCliError, "ffmpeg executable"):
                convert_wav_to_opus(
                    wav,
                    root / "out.opus",
                    executable_finder=lambda name: None,
                )

            def runner(command, **kwargs):
                self.assertIn("-ac", command)
                self.assertIn("1", command)
                self.assertIn("-b:a", command)
                self.assertIn("24k", command)
                Path(command[-1]).write_bytes(b"opus")

            output = convert_wav_to_opus(
                wav,
                root / "out.opus",
                executable_finder=lambda name: "/usr/bin/fake-ffmpeg",
                runner=runner,
            )
            self.assertTrue(output.is_file())


if __name__ == "__main__":
    unittest.main()
