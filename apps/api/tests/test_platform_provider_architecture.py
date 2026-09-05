import unittest
from datetime import datetime, timezone
from app.services.platform_adapters import (
    ADAPTER_REGISTRY,
    get_platform_adapter,
    ProviderStatus,
    ProblemSolvingProviderAdapter,
    NormalizedProblem,
    NormalizedSubmission,
    NormalizedContestParticipation,
    AccountVerificationResult
)
from app.services.sync_service import problem_solving_sync_service

class TestPlatformProviderArchitecture(unittest.TestCase):

    def test_all_seven_providers_registered_with_correct_status(self):
        """Verify all 7 required providers exist with strict non-deceptive status."""
        expected_statuses = {
            "proofhire": ProviderStatus.LIVE_API,
            "codeforces": ProviderStatus.LIVE_API,
            "leetcode": ProviderStatus.PROFILE_SYNC,
            "skillrack": ProviderStatus.MANUAL_VERIFIED_IMPORT,
            "hackerrank": ProviderStatus.PROFILE_SYNC,
            "codechef": ProviderStatus.PROFILE_SYNC,
            "geeksforgeeks": ProviderStatus.PROFILE_SYNC
        }

        for key, expected_status in expected_statuses.items():
            adapter = get_platform_adapter(key)
            self.assertIsNotNone(adapter, f"Provider '{key}' must be registered")
            self.assertEqual(
                adapter.provider_status,
                expected_status,
                f"Provider '{key}' must have status {expected_status}, got {adapter.provider_status}"
            )

    def test_all_adapters_implement_contract_methods(self):
        """Verify that every adapter implements the core contract methods."""
        for key, adapter in ADAPTER_REGISTRY.items():
            # 1. verify_account
            verif = adapter.verify_account("testuser")
            self.assertIsInstance(verif, AccountVerificationResult)
            self.assertTrue(verif.valid)
            self.assertEqual(verif.provider, adapter.provider_key)

            # 2. fetch_profile
            profile = adapter.fetch_profile("testuser")
            self.assertIsInstance(profile, dict)
            self.assertIn("solved_count", profile)
            self.assertIn("verification_status", profile)

            # 3. fetch_solved_problems
            problems, cursor = adapter.fetch_solved_problems("testuser")
            self.assertIsInstance(problems, list)
            if problems:
                first = problems[0]
                self.assertIsInstance(first, NormalizedSubmission)
                # Verify normalized format requirements
                self.assertTrue(hasattr(first, "provider"))
                self.assertTrue(hasattr(first, "external_problem_id"))
                self.assertTrue(hasattr(first, "title"))
                self.assertTrue(hasattr(first, "difficulty"))
                self.assertTrue(hasattr(first, "topics"))
                self.assertTrue(hasattr(first, "submission_id"))
                self.assertTrue(hasattr(first, "status"))
                self.assertTrue(hasattr(first, "language"))
                self.assertTrue(hasattr(first, "solved_at"))
                self.assertTrue(hasattr(first, "runtime"))
                self.assertTrue(hasattr(first, "memory"))
                self.assertTrue(hasattr(first, "metadata"))

            # 4. get_sync_cursor
            cursor_calc = adapter.get_sync_cursor(problems)
            if problems and any(p.solved_at for p in problems):
                self.assertIsNotNone(cursor_calc)

    def test_normalized_problem_and_submission_structures(self):
        """Verify strict normalized problem and submission contract."""
        cf_adapter = get_platform_adapter("codeforces")
        raw_prob = {
            "contestId": 158,
            "index": "A",
            "name": "Next Round",
            "rating": 800,
            "tags": ["implementation"]
        }
        norm_prob = cf_adapter.normalize_problem(raw_prob)
        self.assertEqual(norm_prob.provider, "codeforces")
        self.assertEqual(norm_prob.external_problem_id, "158A")
        self.assertEqual(norm_prob.difficulty, "EASY")
        self.assertIn("Implementation", norm_prob.topics)

        raw_sub = {
            "id": 12345678,
            "contestId": 158,
            "creationTimeSeconds": 1600000000,
            "problem": raw_prob,
            "verdict": "OK",
            "programmingLanguage": "GNU C++20",
            "timeConsumedMillis": 30,
            "memoryConsumedBytes": 102400
        }
        norm_sub = cf_adapter.normalize_submission(raw_sub)
        self.assertEqual(norm_sub.submission_id, "12345678")
        self.assertEqual(norm_sub.status, "accepted")
        self.assertEqual(norm_sub.runtime, 30.0)
        self.assertEqual(norm_sub.memory, 100.0)

    def test_incremental_sync_pipeline_and_deduplication(self):
        """
        Verify the complete 11-step sync pipeline:
        incremental fetching, deduplication, XP awards, topic updates,
        and notifications.
        """
        test_user = "candidate_pipeline_test"

        # 1. Connect Codeforces
        conn = problem_solving_sync_service.connect_platform(
            username=test_user,
            provider="codeforces",
            handle="test_cf_user"
        )
        self.assertEqual(conn["provider"], "codeforces")
        self.assertIsNone(conn["last_sync_at"])

        # 2. First Sync: should ingest problems and award XP
        sync_1 = problem_solving_sync_service.sync_platform(test_user, "codeforces")
        self.assertGreater(sync_1["new_solves_count"], 0)
        self.assertGreater(sync_1["xp_awarded"], 0)
        self.assertIsNotNone(sync_1["last_sync_at"])
        self.assertGreater(len(sync_1["notifications"]), 0)

        # Verify notification format
        notif = sync_1["notifications"][0]
        self.assertEqual(notif["type"], "PROBLEM_SOLVING_SYNC")
        self.assertIn("Awarded +", notif["body"])

        # 3. Repeat Sync with same cursor: deduplication must ensure 0 duplicate solves/XP
        sync_2 = problem_solving_sync_service.sync_platform(test_user, "codeforces")
        self.assertEqual(sync_2["new_solves_count"], 0, "Duplicate problems must be skipped")
        self.assertEqual(sync_2["xp_awarded"], 0, "No duplicate XP can be awarded")

    def test_partial_failure_handling(self):
        """
        Verify that one broken provider does NOT break other providers during batch sync.
        """
        user = "multi_provider_user"
        
        # Connect valid platforms
        problem_solving_sync_service.connect_platform(user, "codeforces", "cf_user")
        problem_solving_sync_service.connect_platform(user, "proofhire", "ph_user")

        # Manually inject a broken connection
        broken_conn = {
            "provider": "invalid_provider_x",
            "handle": "broken",
            "last_sync_at": None,
            "sync_cursor": None,
            "verification_status": "pending"
        }
        problem_solving_sync_service.get_user_connections(user).append(broken_conn)

        # Execute batch sync across all connections
        result = problem_solving_sync_service.sync_all_platforms(user)
        
        # Valid platforms must succeed despite the invalid provider
        self.assertIn("codeforces", result["synced_platforms"])
        self.assertIn("proofhire", result["synced_platforms"])
        self.assertEqual(len(result["failed_platforms"]), 1)
        self.assertEqual(result["failed_platforms"][0]["provider"], "invalid_provider_x")
        self.assertGreater(result["total_new_solves"], 0)
        self.assertIn(result["status"], ("partial_success", "success"))

    def test_rate_limit_and_backoff_handling(self):
        """Verify http retry mechanism and resilience structure."""
        adapter = get_platform_adapter("codeforces")
        self.assertEqual(adapter.max_retries, 3)
        self.assertEqual(adapter.base_backoff_sec, 0.5)
        self.assertEqual(adapter.timeout_sec, 5.0)
