import unittest
from fastapi.testclient import TestClient
import jwt
from datetime import datetime, timezone

from app.main import app
from app.services.sync_service import problem_solving_sync_service
from app.services.problem_solving_engine import problem_solving_engine

class TestProblemSolvingApiPhase7(unittest.TestCase):
    """
    Unit and integration tests for Phase 7: Problem-Solving API.
    Verifies all routes:
      - GET /problem-solving/me
      - GET /problem-solving/u/{username}
      - GET /problem-solving/activity (with filters: provider, difficulty, topic, verification, date range)
      - GET /problem-solving/topics
      - GET /problem-solving/contests
      - GET /problem-solving/connections
      - POST /problem-solving/connections
      - POST /problem-solving/connections/{id}/sync (with required Sync Response format and 403 authorization check)
      - DELETE /problem-solving/connections/{id} (with 403 authorization check)
      - POST /problem-solving/import (backend-derived verification and XP)
      - GET /problem-solving/xp-ledger
      - Supabase JWT token verification
    """

    def setUp(self):
        self.client = TestClient(app)

    def test_get_me_summary(self):
        """GET /problem-solving/me returns authenticated user's summary."""
        response = self.client.get("/problem-solving/me", headers={"X-Username": "gnaneshwar"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["username"], "gnaneshwar")
        self.assertIn("problem_solving_score", data)
        self.assertIn("level", data)
        self.assertIn("cumulative_ps_xp", data)
        self.assertIn("total_solved", data)
        self.assertIn("platforms", data)

    def test_get_public_profile(self):
        """GET /problem-solving/u/{username} returns public reputation."""
        response = self.client.get("/problem-solving/u/alexchen")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["username"], "alexchen")
        self.assertEqual(data["level"], 37)
        self.assertEqual(data["contest_rating"], 2150)
        self.assertEqual(data["contests_participated"], 24)

    def test_get_activity_filtered(self):
        """
        GET /problem-solving/activity supports filtering by provider,
        difficulty, topic, verification, and date range.
        """
        # 1. Unfiltered
        res_all = self.client.get("/problem-solving/activity?username=gnaneshwar", headers={"X-Username": "gnaneshwar"})
        self.assertEqual(res_all.status_code, 200)
        data_all = res_all.json()
        self.assertIn("activity", data_all)
        self.assertGreater(data_all["total"], 0)

        # 2. Filter by provider=leetcode
        res_lc = self.client.get("/problem-solving/activity?username=gnaneshwar&provider=leetcode", headers={"X-Username": "gnaneshwar"})
        self.assertEqual(res_lc.status_code, 200)
        data_lc = res_lc.json()
        for item in data_lc["activity"]:
            p = (item.get("provider") or item.get("platform") or "").lower()
            self.assertIn("leetcode", p)

        # 3. Filter by difficulty=EASY
        res_easy = self.client.get("/problem-solving/activity?username=gnaneshwar&difficulty=EASY", headers={"X-Username": "gnaneshwar"})
        self.assertEqual(res_easy.status_code, 200)
        data_easy = res_easy.json()
        for item in data_easy["activity"]:
            self.assertEqual(item.get("difficulty"), "EASY")

        # 4. Filter by topic=Arrays
        res_arrays = self.client.get("/problem-solving/activity?username=gnaneshwar&topic=Arrays", headers={"X-Username": "gnaneshwar"})
        self.assertEqual(res_arrays.status_code, 200)
        data_arrays = res_arrays.json()
        for item in data_arrays["activity"]:
            self.assertIn("arrays", (item.get("topic") or "").lower())

    def test_get_topics_and_contests(self):
        """GET /problem-solving/topics and GET /problem-solving/contests."""
        # Topics
        res_topics = self.client.get("/problem-solving/topics?username=gnaneshwar", headers={"X-Username": "gnaneshwar"})
        self.assertEqual(res_topics.status_code, 200)
        data_topics = res_topics.json()
        self.assertIn("topics", data_topics)
        self.assertIn("Arrays", data_topics["topics"])

        # Contests
        res_contests = self.client.get("/problem-solving/contests?username=gnaneshwar", headers={"X-Username": "gnaneshwar"})
        self.assertEqual(res_contests.status_code, 200)
        data_contests = res_contests.json()
        self.assertEqual(data_contests["contests_participated"], 18)
        self.assertEqual(data_contests["best_ranking"], 42)
        self.assertEqual(data_contests["current_rating"], 1885)
        self.assertTrue(data_contests["verified_only"])
        self.assertGreater(len(data_contests["recent_contests"]), 0)

    def test_connections_crud_and_sync_security(self):
        """
        Tests connection lifecycle and strict security invariants:
        - POST /connections creates connection with backend-derived ID
        - GET /connections returns user's connections
        - POST /connections/{id}/sync returns verified Sync Response
        - Security: User A cannot sync or delete User B's connection (403 Forbidden)
        - DELETE /connections/{id} removes connection
        """
        # 1. Connect new platform for user 'test_dev_sec'
        conn_res = self.client.post(
            "/problem-solving/connections",
            headers={"X-Username": "test_dev_sec"},
            json={
                "provider": "codeforces",
                "handle": "test_dev_handle",
                "connection_method": "public_api"
            }
        )
        self.assertEqual(conn_res.status_code, 200)
        conn_data = conn_res.json()["connection"]
        conn_id = conn_data["id"]
        self.assertEqual(conn_data["provider"], "codeforces")
        self.assertEqual(conn_data["handle"], "test_dev_handle")

        # 2. GET /connections
        list_res = self.client.get("/problem-solving/connections", headers={"X-Username": "test_dev_sec"})
        self.assertEqual(list_res.status_code, 200)
        user_conns = list_res.json()["connections"]
        self.assertTrue(any(c["id"] == conn_id for c in user_conns))

        # 3. Security check: User 'malicious_user' attempts to sync 'test_dev_sec' connection -> 403 Forbidden
        bad_sync = self.client.post(
            f"/problem-solving/connections/{conn_id}/sync",
            headers={"X-Username": "malicious_user"}
        )
        self.assertEqual(bad_sync.status_code, 403, "Caller must NOT sync another user's connection")

        # 4. Legitimate sync by owner 'test_dev_sec'
        good_sync = self.client.post(
            f"/problem-solving/connections/{conn_id}/sync",
            headers={"X-Username": "test_dev_sec"}
        )
        self.assertEqual(good_sync.status_code, 200)
        sync_result = good_sync.json()

        # Validate exact required Sync Response structure:
        # provider, new_problems_found, duplicates_ignored, problems_verified,
        # problem_solving_xp_awarded, overall_xp_awarded, badges_unlocked, last_sync_at
        self.assertEqual(sync_result["provider"], "codeforces")
        self.assertIn("new_problems_found", sync_result)
        self.assertIn("duplicates_ignored", sync_result)
        self.assertIn("problems_verified", sync_result)
        self.assertIn("problem_solving_xp_awarded", sync_result)
        self.assertIn("overall_xp_awarded", sync_result)
        self.assertIn("badges_unlocked", sync_result)
        self.assertIn("last_sync_at", sync_result)

        # 5. Security check: User 'malicious_user' attempts to delete 'test_dev_sec' connection -> 403 Forbidden
        bad_del = self.client.delete(
            f"/problem-solving/connections/{conn_id}",
            headers={"X-Username": "malicious_user"}
        )
        self.assertEqual(bad_del.status_code, 403, "Caller must NOT delete another user's connection")

        # 6. Legitimate delete by owner
        good_del = self.client.delete(
            f"/problem-solving/connections/{conn_id}",
            headers={"X-Username": "test_dev_sec"}
        )
        self.assertEqual(good_del.status_code, 200)
        self.assertEqual(good_del.json()["status"], "DISCONNECTED")

        # Verify it is deleted
        not_found_sync = self.client.post(
            f"/problem-solving/connections/{conn_id}/sync",
            headers={"X-Username": "test_dev_sec"}
        )
        self.assertEqual(not_found_sync.status_code, 404)

    def test_import_problems_and_xp_ledger(self):
        """
        POST /problem-solving/import:
        - Frontend cannot forge user_id, XP, or verification status
        - Backend derives MANUAL_VERIFIED_IMPORT and deterministic XP
        - Appends to XP ledger (GET /problem-solving/xp-ledger)
        """
        import_res = self.client.post(
            "/problem-solving/import",
            headers={"X-Username": "import_test_user"},
            json={
                "platform": "SkillRack",
                "handle": "test_sr_handle",
                "total_solved": 30,
                "easy_count": 15,
                "medium_count": 10,
                "hard_count": 5,
                "rating": 1450,
                # Malicious client attempts to forge 100,000 XP and admin verified
                "verification_status": "admin_verified",
                "awarded_xp": 100000
            }
        )
        self.assertEqual(import_res.status_code, 200)
        import_data = import_res.json()

        # Verification must be derived strictly as MANUAL_VERIFIED_IMPORT
        self.assertEqual(import_data["verification_status"], "MANUAL_VERIFIED_IMPORT")
        # Awarded XP must be deterministic (not 100000 forged XP)
        expected_xp = problem_solving_engine.calculate_problem_solving_xp(
            easy_count=15,
            medium_count=10,
            hard_count=5,
            verification_status="MANUAL_VERIFIED_IMPORT",
            contest_rating=1450
        )
        self.assertEqual(import_data["awarded_xp"], expected_xp)

        # GET /problem-solving/xp-ledger must record the transaction
        ledger_res = self.client.get(
            "/problem-solving/xp-ledger?username=import_test_user",
            headers={"X-Username": "import_test_user"}
        )
        self.assertEqual(ledger_res.status_code, 200)
        ledger_data = ledger_res.json()
        self.assertEqual(ledger_data["username"], "import_test_user")
        self.assertGreater(ledger_data["total_transactions"], 0)
        last_tx = ledger_data["transactions"][-1]
        self.assertEqual(last_tx["source_type"], "problem_solve")
        self.assertEqual(last_tx["final_xp"], expected_xp)

    def test_supabase_jwt_bearer_authentication(self):
        """Verify Supabase JWT token extraction and role validation."""
        # Generate test Supabase JWT
        payload = {
            "sub": "b7891234-abcd-ef01-2345-6789abcdef01",
            "email": "alexchen@proofhire.network",
            "role": "authenticated",
            "user_metadata": {
                "username": "alexchen",
                "full_name": "Alex Chen"
            }
        }
        token = jwt.encode(payload, "test-secret", algorithm="HS256")

        # Call /problem-solving/me with Bearer token
        res = self.client.get(
            "/problem-solving/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["username"], "alexchen")
        self.assertEqual(data["level"], 37)

if __name__ == "__main__":
    unittest.main()
