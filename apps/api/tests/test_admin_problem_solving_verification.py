import unittest
from fastapi.testclient import TestClient

from app.main import app
from app.services.admin_problem_solving_service import (
    admin_problem_solving_service,
    AdminProblemSolvingService
)
from app.services.problem_solving_engine import (
    problem_solving_engine,
    VerificationStrength,
    BASE_PROBLEM_XP,
    VERIFICATION_MODIFIERS
)


class TestAdminProblemSolvingVerification(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        # Create a clean test instance of AdminProblemSolvingService
        self.service = AdminProblemSolvingService()

    def test_admin_queue_contains_all_5_sections(self):
        """Validates that all 5 required operational sections exist and contain items."""
        res = self.service.list_queue()
        counts = res["section_counts"]

        self.assertIn("pending_imports", counts)
        self.assertIn("suspicious_activity", counts)
        self.assertIn("failed_verification", counts)
        self.assertIn("duplicate_detection", counts)
        self.assertIn("provider_sync_errors", counts)

        self.assertGreater(counts["pending_imports"], 0)
        self.assertGreater(counts["suspicious_activity"], 0)
        self.assertGreater(counts["failed_verification"], 0)
        self.assertGreater(counts["duplicate_detection"], 0)
        self.assertGreater(counts["provider_sync_errors"], 0)

    def test_admin_approval_is_strictly_deterministic_and_rejects_arbitrary_xp(self):
        """
        CRITICAL TEST: Admin must NEVER manually type arbitrary XP.
        Approval must strictly invoke the normal deterministic engine:
          Base XP * 0.90 (Admin Verified Modifier)
        """
        # Pick pending import item q_imp_001 (HARD problem: 45 Base XP)
        item = self.service.get_item("q_imp_001")
        self.assertIsNotNone(item)
        self.assertEqual(item["difficulty"], "HARD")

        expected_base_xp = BASE_PROBLEM_XP["HARD"]  # 45
        expected_admin_modifier = VERIFICATION_MODIFIERS[VerificationStrength.ADMIN_VERIFIED]  # 0.90
        expected_skill_xp = int(round(expected_base_xp * expected_admin_modifier))  # 41
        expected_overall_xp = int(round(expected_skill_xp * 0.60))  # 25

        approve_res = self.service.approve_item(
            item_id="q_imp_001",
            reasoning="Verified valid institutional CSE department transcript with seal.",
            admin_id="admin_test_01",
            admin_name="Auditor Jane Doe"
        )

        self.assertEqual(approve_res["status"], "APPROVED")
        self.assertEqual(approve_res["deterministic_skill_xp"], expected_skill_xp)
        self.assertEqual(approve_res["deterministic_overall_xp"], expected_overall_xp)
        self.assertEqual(approve_res["reputation_ratio"], 0.90)

        # Verify audit log recorded deterministic calculation
        audit = next((a for a in self.service.audit_records if a["id"] == approve_res["audit_id"]), None)
        self.assertIsNotNone(audit)
        self.assertEqual(audit["action"], "APPROVE")
        self.assertEqual(audit["candidate_username"], "sarah_lin")
        self.assertEqual(audit["deterministic_skill_xp"], expected_skill_xp)
        self.assertEqual(audit["deterministic_overall_xp"], expected_overall_xp)

    def test_admin_reject_awards_zero_xp_and_preserves_audit(self):
        """Validates that rejecting an item awards strictly 0 XP and logs audit reason."""
        reject_res = self.service.reject_item(
            item_id="q_susp_001",
            reasoning="Burst velocity physically impossible. User agent indicates scripted bot.",
            admin_id="admin_test_01",
            admin_name="Auditor Jane Doe"
        )

        self.assertEqual(reject_res["status"], "REJECTED")
        self.assertEqual(reject_res["deterministic_skill_xp"], 0)

        audit = next((a for a in self.service.audit_records if a["id"] == reject_res["audit_id"]), None)
        self.assertIsNotNone(audit)
        self.assertEqual(audit["action"], "REJECT")
        self.assertEqual(audit["deterministic_skill_xp"], 0)
        self.assertEqual(audit["deterministic_overall_xp"], 0)

    def test_admin_mark_duplicate_awards_zero_xp_and_links_canonical(self):
        """Validates that marking an item as duplicate sets 0 XP and saves canonical link."""
        dup_res = self.service.mark_duplicate(
            item_id="q_dup_001",
            canonical_id="lc_two_sum_canon_01",
            reasoning="Identical algorithm already verified on LeetCode; prevents cross-platform XP farming.",
            admin_id="admin_test_01",
            admin_name="Auditor Jane Doe"
        )

        self.assertEqual(dup_res["status"], "DUPLICATE")
        self.assertEqual(dup_res["deterministic_skill_xp"], 0)
        self.assertEqual(dup_res["canonical_id"], "lc_two_sum_canon_01")

        item = self.service.get_item("q_dup_001")
        self.assertEqual(item["status"], "DUPLICATE")
        self.assertEqual(item["duplicate_of_id"], "lc_two_sum_canon_01")

    def test_admin_request_evidence_requires_details_and_updates_status(self):
        """Validates requesting additional evidence sets status to MORE_EVIDENCE_REQUESTED."""
        req_res = self.service.request_additional_evidence(
            item_id="q_imp_002",
            requested_items=["Official University Transcript", "Live Screen Recording"],
            notes="Please provide video recording navigating to the problem submission on HackerRank.",
            admin_id="admin_test_01",
            admin_name="Auditor Jane Doe"
        )

        self.assertEqual(req_res["status"], "MORE_EVIDENCE_REQUESTED")
        self.assertIn("Official University Transcript", req_res["requested_items"])

        item = self.service.get_item("q_imp_002")
        self.assertEqual(item["status"], "MORE_EVIDENCE_REQUESTED")

    def test_admin_api_endpoints_integration(self):
        """Integration test on FastAPI routes for /problem-solving/admin/*."""
        # 1. GET Queue
        res = self.client.get("/problem-solving/admin/queue")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("items", data)
        self.assertIn("section_counts", data)

        # 2. Filter Queue by Section
        res_filtered = self.client.get("/problem-solving/admin/queue?section=suspicious_activity")
        self.assertEqual(res_filtered.status_code, 200)
        for item in res_filtered.json()["items"]:
            self.assertEqual(item["section"], "suspicious_activity")

        # 3. GET Single Item
        res_item = self.client.get("/problem-solving/admin/queue/q_imp_003")
        self.assertEqual(res_item.status_code, 200)
        item_data = res_item.json()
        self.assertEqual(item_data["id"], "q_imp_003")
        self.assertIn("evidence_json", item_data)

        # 4. POST Actions: Approve (deterministic XP, no manual XP accepted)
        approve_resp = self.client.post("/problem-solving/admin/actions/approve", json={
            "item_id": "q_imp_003",
            "reasoning": "Inspected profile URL and cross-referenced with public submission timeline.",
            "admin_name": "Senior Verification Officer"
        })
        self.assertEqual(approve_resp.status_code, 200)
        approve_json = approve_resp.json()
        self.assertEqual(approve_json["status"], "APPROVED")
        expected_hard_skill = int(round(45 * 0.90))  # 40 (Python round-to-even)
        expected_hard_overall = int(round(expected_hard_skill * 0.60))  # 24
        self.assertEqual(approve_json["deterministic_skill_xp"], expected_hard_skill)
        self.assertEqual(approve_json["deterministic_overall_xp"], expected_hard_overall)

        # 5. GET Audit Trail
        audit_resp = self.client.get("/problem-solving/admin/audits")
        self.assertEqual(audit_resp.status_code, 200)
        audits = audit_resp.json()["audits"]
        self.assertGreater(len(audits), 0)


if __name__ == "__main__":
    unittest.main()
