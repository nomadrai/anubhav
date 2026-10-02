import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from scripts.generate_audio import StubProvider, build_dry_run_plan


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


if __name__ == "__main__":
    unittest.main()
