"""Evidence-contract tests. Offline tests do not claim to re-fetch destinations."""
import json
import unittest
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


class ResourceEvidenceTests(unittest.TestCase):
    def test_verified_resources_are_exact_official_destinations_with_session_evidence(self):
        resources = json.loads((ROOT / 'src/content/resources.json').read_text())
        checks = (ROOT / 'docs/RESOURCE_CHECKS.md').read_text()
        expected = {'https://scores.sebi.gov.in/',
                    'https://investor.sebi.gov.in/Investor-support.html',
                    'https://investor.sebi.gov.in/spot-any-scam.html',
                    'https://cybercrime.gov.in/'}
        self.assertEqual({r['url'] for r in resources}, expected)
        for resource in resources:
            self.assertTrue(resource['verified'])
            self.assertEqual(resource['status'], 'agent-checked')
            self.assertEqual(urlsplit(resource['url']).scheme, 'https')
            self.assertEqual(resource['automatedCheck']['finalUrl'], resource['url'])
            self.assertEqual(resource['automatedCheck']['status'], 200)
            self.assertRegex(resource['automatedCheck']['sha256'], r'^[a-f0-9]{64}$')
            self.assertEqual(resource['checkedOn'], resource['automatedCheck']['fetchedAt'][:10])
            self.assertIn(resource['automatedCheck']['sha256'], checks)
            self.assertIn(resource['url'], checks)
            self.assertTrue(resource['label']['en'])
            self.assertTrue(resource['label']['hi'])
            self.assertFalse(resource['humanReview']['humanApproved'])
            self.assertFalse(resource['humanReview']['nativeSpeakerReviewed'])
            self.assertIn(resource['id'], resource['evidence']['record'])


if __name__ == '__main__':
    unittest.main()
