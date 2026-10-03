import json
import unittest
from pathlib import Path
from scripts.audio_quality import stable_seed, token_cap, character_error_rate, normalized_transcript, signal_failures, assess_transcript
from scripts.providers.indic_parler import TokenTrace, IndicParlerProvider, IndicParlerError

CONFIG = json.loads((Path(__file__).parents[1] / 'config/tts-production.json').read_text())


class Tokens:
    def __init__(self, values): self.values = values
    def detach(self): return self
    def cpu(self): return self
    def reshape(self, *_): return self
    def tolist(self): return self.values


class AudioQualityTests(unittest.TestCase):
    def test_seed_is_stable_but_changes_with_every_relevant_input(self):
        seed = stable_seed('hi', 'track', 'शब्द', 0)
        self.assertEqual(seed, stable_seed('hi', 'track', 'शब्द', 0))
        self.assertEqual(seed, stable_seed('hi', 'track', ' शब्द ', 0))
        for values in [('en', 'track', 'शब्द', 0), ('hi', 'other', 'शब्द', 0), ('hi', 'track', 'बोल', 0), ('hi', 'track', 'शब्द', 1)]:
            self.assertNotEqual(seed, stable_seed(*values))
        self.assertTrue(0 <= seed < 2**32)

    def test_token_caps_are_bounded_and_text_dependent(self):
        self.assertGreaterEqual(token_cap('शब्द', CONFIG), CONFIG['minimumTokens'])
        self.assertLess(token_cap('a b', CONFIG), token_cap('a '*20, CONFIG))
        self.assertEqual(token_cap('a '*1000, CONFIG), CONFIG['maximumTokens'])

    def test_cer_handles_case_punctuation_and_retains_hindi_marks(self):
        self.assertEqual(character_error_rate('Hello, there!', 'hello there'), 0)
        self.assertEqual(character_error_rate('स्थिति बंद हुई।', 'स्थिति बंद हुई'), 0)
        self.assertGreater(character_error_rate('पाँच', 'पाच'), 0)
        self.assertGreater(character_error_rate('दस प्रतिशत', 'बीस प्रतिशत'), 0)
        self.assertEqual(character_error_rate('abc', ''), 1)
        with self.assertRaises(ValueError): character_error_rate('', 'speech')
        self.assertIn('़', normalized_transcript('ज़्यादा'))

    def test_asr_number_format_is_not_confused_with_wrong_quantity(self):
        reference = 'The path is five percent below its start.'
        exact = assess_transcript(reference, 'The path is 5% below its start.', 'en')
        self.assertEqual(exact['cer'], 0)
        self.assertEqual(exact['rawCer'], 0.3)
        self.assertTrue(exact['quantitiesMatch'])
        wrong = assess_transcript(reference, 'The path is 20% below its start.', 'en')
        self.assertFalse(wrong['quantitiesMatch'])
        hindi = assess_transcript('दस प्रतिशत नीचे है।', '१०% नीचे है।', 'hi')
        self.assertEqual(hindi['cer'], 0)
        self.assertTrue(hindi['quantitiesMatch'])
        self.assertFalse(assess_transcript('दस प्रतिशत नीचे है।', 'बीस प्रतिशत नीचे है।', 'hi')['quantitiesMatch'])
        self.assertNotEqual(character_error_rate('two point five', '2.5'), 0)

    def test_trace_ignores_initial_delayed_pad_tokens(self):
        trace = TokenTrace(1024, 9)
        trace.put(Tokens([1024]*9))
        trace.put(Tokens([4]*9))
        self.assertFalse(trace.result(100)['eos'])
        trace.put(Tokens([1024]*9))
        self.assertTrue(trace.result(100)['eos'])
        self.assertEqual(trace.result(100)['generatedSteps'], 2)
        self.assertFalse(trace.result(2)['eos'])
        self.assertTrue(trace.result(2)['hitTokenLimit'])

    def metrics(self):
        return {'finite': True, 'channels': 1, 'durationSeconds': 2, 'rmsDbfs': -22, 'peak': 0.4, 'silenceRatio': .1, 'clippedRatio': 0, 'wavSha256': 'a'*64}

    def test_good_signal_and_natural_eos_pass(self):
        self.assertEqual(signal_failures(self.metrics(), 'some words', {'eos': True, 'hitTokenLimit': False}, CONFIG, {}), [])

    def test_silence_clipping_limit_duration_and_cross_text_duplicates_fail(self):
        end = {'eos': True, 'hitTokenLimit': False}
        for field, value, expected in [('rmsDbfs', -78, 'rmsDbfs'), ('peak', .001, 'peak'), ('silenceRatio', .99, 'silenceRatio'), ('clippedRatio', .01, 'clippedRatio'), ('durationSeconds', 30, 'implausible-duration')]:
            with self.subTest(field=field):
                metrics = {**self.metrics(), field: value}
                self.assertIn(expected, signal_failures(metrics, 'some words', end, CONFIG, {}))
        self.assertIn('missing-natural-eos-or-token-limit', signal_failures(self.metrics(), 'some words', {}, CONFIG, {}))
        self.assertIn('duplicate-audio-for-different-text', signal_failures(self.metrics(), 'some words', end, CONFIG, {'a'*64: 'different'}))
        self.assertEqual(signal_failures(self.metrics(), 'some words', end, CONFIG, {'a'*64: 'some words'}), [])
        self.assertIn('empty-or-nonfinite-signal', signal_failures({'finite': False}, 'text', end, CONFIG, {}))

    def test_provider_defaults_to_checkpoint_sampling_and_settings_are_validated(self):
        provider = IndicParlerProvider(model_revision='a'*40)
        self.assertTrue(provider.config.do_sample)
        provider.set_generation_settings(seed=4, max_new_tokens=600)
        self.assertEqual(provider.config.seed, 4)
        self.assertEqual(provider.config.max_new_tokens, 600)
        with self.assertRaises(IndicParlerError): provider.set_generation_settings(seed=-1, max_new_tokens=600)


if __name__ == '__main__':
    unittest.main()
