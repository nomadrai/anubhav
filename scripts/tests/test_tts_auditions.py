"""Audition/tokenizer regressions: no model, credentials, network, or real speech required."""
import copy
import json
import tempfile
import unittest
from contextlib import nullcontext
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from scripts.audition_audio import cache_tokenizer, checked_output_dir, load_config, narration_clips, quality_warnings
from scripts.providers.indic_parler import (
    DEFAULT_TOKENIZER_ID, DEFAULT_TOKENIZER_REVISION, IndicParlerError,
    IndicParlerProvider, TTS_CONFIG_PATH, _TransformersBackend,
)
from scripts.generate_audio import generation_input_sha256


class TokenizerChecks(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.model = self.root / "model"
        self.model.mkdir()
        (self.model / "config.json").write_text(json.dumps({"text_encoder": {"_name_or_path": DEFAULT_TOKENIZER_ID}}))
        (self.model / "model.safetensors").write_bytes(b"test-fixture-not-weights")
        self.tokenizer_dir = self.root / "description"
        self.tokenizer_dir.mkdir()
        (self.tokenizer_dir / "tokenizer.json").write_text('{}')
        self.tokenizer = MagicMock()
        self.hub = SimpleNamespace(snapshot_download=MagicMock(return_value=str(self.tokenizer_dir)))
        self.torch = SimpleNamespace(cuda=SimpleNamespace(is_available=lambda: False))
        self.modules = {
            "torch": self.torch, "transformers": SimpleNamespace(AutoTokenizer=self.tokenizer),
            "parler_tts": SimpleNamespace(), "soundfile": SimpleNamespace(), "huggingface_hub": self.hub,
        }
        self.provider = IndicParlerProvider(model_dir=self.model, model_revision="a" * 40, dependency_finder=lambda _: True)

    def test_check_loads_both_tokenizers_at_pinned_revisions_without_network(self):
        with patch("scripts.providers.indic_parler.importlib.import_module", side_effect=self.modules.__getitem__):
            result = self.provider.check_requirements()
        self.assertTrue(result["ready"])
        self.hub.snapshot_download.assert_called_once_with(
            repo_id=DEFAULT_TOKENIZER_ID, revision=DEFAULT_TOKENIZER_REVISION, local_files_only=True)
        calls = self.tokenizer.from_pretrained.call_args_list
        self.assertEqual(len(calls), 2)
        self.assertEqual(calls[0].kwargs["revision"], DEFAULT_TOKENIZER_REVISION)
        self.assertEqual(calls[1].kwargs["revision"], "a" * 40)
        self.assertTrue(all(call.kwargs["local_files_only"] for call in calls))
        self.assertTrue(all(call.kwargs["trust_remote_code"] is False for call in calls))
        self.assertIn("description/tokenizer.json", self.provider.generation_config()["tokenizerFileSha256"])

    def test_missing_cache_fails_check_not_just_generation(self):
        self.hub.snapshot_download.side_effect = OSError("cache missing")
        with patch("scripts.providers.indic_parler.importlib.import_module", side_effect=self.modules.__getitem__):
            with self.assertRaisesRegex(IndicParlerError, "pinned tokenizer unavailable offline"):
                self.provider.check_requirements()

    def test_broken_native_import_is_not_reported_ready(self):
        def load(name):
            if name == "parler_tts":
                raise OSError("libcudart.so.13 missing")
            return self.modules[name]
        with patch("scripts.providers.indic_parler.importlib.import_module", side_effect=load):
            with self.assertRaisesRegex(IndicParlerError, "prerequisite import failed"):
                self.provider.check_requirements()

    def test_model_config_cannot_silently_choose_another_description_tokenizer(self):
        (self.model / "config.json").write_text(json.dumps({"text_encoder": {"_name_or_path": "unapproved/model"}}))
        with patch("scripts.providers.indic_parler.importlib.import_module", side_effect=self.modules.__getitem__):
            with self.assertRaisesRegex(IndicParlerError, "not pinned tokenizer"):
                self.provider.check_requirements()

    def test_explicit_directory_remains_offline_and_revision_is_hashed(self):
        self.provider = IndicParlerProvider(model_dir=self.model, model_revision="a" * 40,
            description_tokenizer_dir=self.tokenizer_dir, dependency_finder=lambda _: True)
        with patch("scripts.providers.indic_parler.importlib.import_module", side_effect=self.modules.__getitem__):
            self.provider.check_requirements()
        self.hub.snapshot_download.assert_not_called()
        first = generation_input_sha256("शब्द", language="hi", provider=self.provider)
        other = IndicParlerProvider(model_dir=self.model, model_revision="a" * 40,
            description_tokenizer_revision="b" * 40)
        self.assertNotEqual(first, generation_input_sha256("शब्द", language="hi", provider=other))

    def test_unpinned_tokenizer_revision_rejected(self):
        provider = IndicParlerProvider(model_dir=self.model, model_revision="a" * 40,
            description_tokenizer_revision="main")
        with self.assertRaisesRegex(IndicParlerError, "immutable"):
            provider.check_requirements()


class AuditionConfigChecks(unittest.TestCase):
    def test_exactly_six_clips_use_real_spoken_text_and_only_names_differ(self):
        config = load_config(TTS_CONFIG_PATH)
        clips = narration_clips(config)
        self.assertEqual(len(clips) * len(config["audition"]["speakers"]), 6)
        self.assertEqual(config["generation"]["doSample"], False)
        self.assertEqual(config["generation"]["seed"], 0)
        self.assertIn("दस प्रतिशत", clips[2]["spokenText"])
        self.assertIn("एपिसोड", clips[2]["spokenText"])
        self.assertTrue(all(set(clip["contentStatuses"]) == {"agent-checked"} for clip in clips))
        descriptions = [config["voiceDescriptionTemplate"].format(speaker=name) for name in config["audition"]["speakers"]]
        self.assertEqual(descriptions[0].replace("Rohit", "Divya"), descriptions[1])

    def test_sampling_changes_input_hash_and_description_switch_reuses_model(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            (path / "config.json").write_text('{}')
            backend = SimpleNamespace(description="")
            factory = MagicMock(return_value=backend)
            provider = IndicParlerProvider(model_dir=path, model_revision="a" * 40, backend_factory=factory)
            provider.prepare()
            provider.set_voice_description("Rohit speaks calmly.")
            first = generation_input_sha256("शब्द", language="hi", provider=provider)
            provider.set_voice_description("Divya speaks calmly.")
            provider.prepare()
            factory.assert_called_once()
            self.assertEqual(backend.description, "Divya speaks calmly.")
            self.assertNotEqual(first, generation_input_sha256("शब्द", language="hi", provider=provider))
            sampled = IndicParlerProvider(model_dir=path, model_revision="a" * 40, do_sample=True)
            greedy = IndicParlerProvider(model_dir=path, model_revision="a" * 40, do_sample=False)
            self.assertNotEqual(generation_input_sha256("शब्द", language="hi", provider=sampled),
                                generation_input_sha256("शब्द", language="hi", provider=greedy))

    def test_backend_forwards_do_sample_and_resets_seed_per_clip(self):
        torch = MagicMock()
        torch.cuda.is_available.return_value = False
        torch.inference_mode.return_value = nullcontext()
        model = MagicMock()
        model.config.sampling_rate = 44100
        backend = _TransformersBackend(torch_module=torch, model=model, prompt_tokenizer=MagicMock(),
            description_tokenizer=MagicMock(), description="Rohit speaks calmly.", device="cpu", seed=0,
            do_sample=False, max_new_tokens=2048)
        backend.synthesize("शब्द", language="hi")
        self.assertFalse(model.generate.call_args.kwargs["do_sample"])
        self.assertEqual(model.generate.call_args.kwargs["max_new_tokens"], 2048)
        backend.do_sample = True
        backend.synthesize("शब्द", language="hi")
        self.assertTrue(model.generate.call_args.kwargs["do_sample"])
        self.assertEqual(torch.manual_seed.call_count, 2)
        torch.manual_seed.assert_called_with(0)

    def test_cache_operation_is_pinned_and_never_downloads_weights(self):
        hub = SimpleNamespace(snapshot_download=MagicMock(return_value="/tmp/tokenizer-fixture"))
        transformers = SimpleNamespace(AutoTokenizer=MagicMock())
        with patch.dict("sys.modules", {"huggingface_hub": hub, "transformers": transformers}):
            cache_tokenizer(load_config(TTS_CONFIG_PATH))
        kwargs = hub.snapshot_download.call_args.kwargs
        self.assertEqual(kwargs["revision"], DEFAULT_TOKENIZER_REVISION)
        self.assertFalse(kwargs["token"])
        self.assertNotIn("model.safetensors", kwargs["allow_patterns"])
        self.assertNotIn("pytorch_model.bin", kwargs["allow_patterns"])
        self.assertTrue(transformers.AutoTokenizer.from_pretrained.call_args.kwargs["local_files_only"])

    def test_no_overwrites_or_runtime_output(self):
        from scripts.audition_audio import ROOT
        with self.assertRaisesRegex(ValueError, "gitignored"):
            checked_output_dir(ROOT / "public/audio/auditions")
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            (path / "old.wav").write_bytes(b"keep")
            with self.assertRaisesRegex(ValueError, "never overwritten"):
                checked_output_dir(path)
            self.assertEqual((path / "old.wav").read_bytes(), b"keep")

    def test_low_signal_and_length_limit_are_flagged_without_approval(self):
        model_config = {"audio_encoder": {"hop_length": 512, "sampling_rate": 44100}}
        self.assertEqual(len(quality_warnings({"rms": 0.0001, "durationSeconds": 23.68}, model_config, 2048)), 2)
        self.assertEqual(quality_warnings({"rms": 0.1, "durationSeconds": 3}, model_config, 2048), [])

    def test_config_rejects_extra_clips_and_floating_revision(self):
        original = load_config(TTS_CONFIG_PATH)
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "config.json"
            for bad in ("clips", "revision"):
                config = copy.deepcopy(original)
                if bad == "clips":
                    config["audition"]["clips"].append(config["audition"]["clips"][0])
                else:
                    config["descriptionTokenizerRevision"] = "main"
                file.write_text(json.dumps(config))
                with self.assertRaises(ValueError):
                    load_config(file)


if __name__ == "__main__":
    unittest.main()
