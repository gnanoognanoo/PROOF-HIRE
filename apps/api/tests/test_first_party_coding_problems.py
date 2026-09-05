import unittest
from app.services.sandbox_service import (
    NullSandboxAdapter,
    Judge0SandboxAdapter,
    ExecutionStatus,
    get_sandbox_service
)
from app.services.first_party_problems_service import first_party_problems_service
from app.services.assessment_engine import assessment_engine
from app.services.problem_solving_engine import problem_solving_engine


class TestFirstPartyCodingProblems(unittest.TestCase):
    """
    Test suite for Phase 12: First-Party ProofHire Problem Solving.
    Verifies sandbox isolation, NOT CONFIGURED status safety, metadata schemas,
    confidentiality boundaries, and deterministic XP calculation.
    """

    def test_sandbox_unconfigured_safety(self):
        """Verify NullSandboxAdapter returns NOT CONFIGURED and refuses host execution."""
        null_sandbox = NullSandboxAdapter()
        self.assertFalse(null_sandbox.is_configured())

        status_info = null_sandbox.get_status()
        self.assertEqual(status_info["execution_status"], "NOT CONFIGURED")
        self.assertFalse(status_info["is_configured"])
        self.assertFalse(status_info["direct_host_execution_allowed"])

        # Execute test solution
        exec_res = null_sandbox.execute_solution(
            language="python",
            code="import os; os.system('echo dangerous')",
            test_cases=[{"input": "1", "expected_output": "1"}]
        )
        self.assertEqual(exec_res.status, ExecutionStatus.NOT_CONFIGURED.value)
        self.assertFalse(exec_res.is_configured)
        self.assertEqual(exec_res.tests_passed, 0)
        self.assertIn("NOT CONFIGURED", exec_res.message)

    def test_problem_metadata_completeness(self):
        """Verify all seed problems have all required metadata fields."""
        problems = first_party_problems_service.problems
        self.assertGreaterEqual(len(problems), 4)

        for p in problems:
            self.assertIn("title", p)
            self.assertIn("description", p)
            self.assertIn("difficulty", p)
            self.assertIn(p["difficulty"], ["EASY", "MEDIUM", "HARD", "EXPERT"])
            self.assertIn("topics", p)
            self.assertIsInstance(p["topics"], list)
            self.assertGreater(len(p["topics"]), 0)
            self.assertIn("constraints", p)
            self.assertIsInstance(p["constraints"], list)
            self.assertIn("examples", p)
            self.assertIsInstance(p["examples"], list)
            self.assertGreater(len(p["examples"]), 0)
            self.assertIn("hidden_test_cases", p)
            self.assertIsInstance(p["hidden_test_cases"], list)
            self.assertGreater(len(p["hidden_test_cases"]), 0)
            self.assertIn("time_limit", p)
            self.assertIsInstance(p["time_limit"], (int, float))
            self.assertIn("memory_limit", p)
            self.assertIsInstance(p["memory_limit"], int)

    def test_candidate_view_confidentiality(self):
        """Verify candidate-facing problem view strips hidden test cases while preserving examples."""
        # Candidate view
        p_cand = first_party_problems_service.get_problem("two-sum-invariant-deductions", is_candidate_view=True)
        self.assertIsNotNone(p_cand)
        self.assertNotIn("hidden_test_cases", p_cand)
        self.assertIn("examples", p_cand)
        self.assertIn("constraints", p_cand)
        self.assertGreater(p_cand["total_hidden_test_cases"], 0)

        # Internal / server view
        p_internal = first_party_problems_service.get_problem("two-sum-invariant-deductions", is_candidate_view=False)
        self.assertIn("hidden_test_cases", p_internal)

    def test_submission_lifecycle_not_configured(self):
        """Verify submitting solution returns NOT CONFIGURED when Judge0 is unconfigured."""
        sub = first_party_problems_service.submit_solution(
            username="alexchen",
            problem_id_or_slug="topological-build-dependency-order",
            language="python",
            code="def findOrder(numTasks, prerequisites): return [0, 1]"
        )
        self.assertEqual(sub["execution_status"], "NOT CONFIGURED")
        self.assertFalse(sub["is_sandbox_configured"])
        self.assertEqual(sub["tests_passed"], 0)
        self.assertIn("NOT CONFIGURED", sub["message"])

    def test_first_party_xp_full_reputation_ratio(self):
        """
        Verify first-party verified solves award 100% of skill XP to Overall Professional XP
        (compared to 60% for external third-party platforms).
        """
        # Hard problem (45 Base XP) with provider_verified (1.00x) and quality modifier 1.10
        xp_first_party = problem_solving_engine.calculate_final_problem_xp(
            difficulty="HARD",
            verification_status="provider_verified",
            has_source_code=True,
            quality_score=70.0,
            is_first_party=True
        )

        xp_external = problem_solving_engine.calculate_final_problem_xp(
            difficulty="HARD",
            verification_status="provider_verified",
            has_source_code=True,
            quality_score=70.0,
            is_first_party=False
        )

        # Base 45 * 1.00 * 1.11 = 50 Skill XP
        self.assertEqual(xp_first_party["skill_xp"], xp_external["skill_xp"])
        # First-party: 100% of skill XP goes to Overall Professional XP
        self.assertEqual(xp_first_party["overall_professional_xp"], xp_first_party["skill_xp"])
        # External: only 60% goes to Overall Professional XP
        expected_external = int(round(xp_external["skill_xp"] * 0.60))
        self.assertEqual(xp_external["overall_professional_xp"], expected_external)
        self.assertGreater(xp_first_party["overall_professional_xp"], xp_external["overall_professional_xp"])

    def test_record_first_party_verified_solve_lifecycle(self):
        """Verify record_first_party_verified_solve awards XP and updates user profile."""
        res = problem_solving_engine.record_first_party_verified_solve(
            username="davidkalu",
            problem_id="fp_prob_topo_sort",
            title="Topological Build Dependency Order",
            difficulty="MEDIUM",
            topics=["Graphs", "Topological Sort"],
            language="python",
            code="def findOrder(n, p): return [0, 1]",
            quality_score=85.0
        )
        self.assertIn("solve_record", res)
        self.assertEqual(res["solve_record"]["provider"], "proofhire")
        self.assertTrue(res["solve_record"]["is_first_party"])
        # 18 base * 1.00 verif * 1.16 quality = 21 Skill XP
        self.assertGreater(res["solve_record"]["skill_xp_awarded"], 0)
        # 100% ratio: skill XP equals overall professional XP
        self.assertEqual(
            res["solve_record"]["overall_professional_xp_awarded"],
            res["solve_record"]["skill_xp_awarded"]
        )

    def test_assessment_engine_coding_question(self):
        """Verify assessment_engine supports coding questions and confidential test cases."""
        as_def = assessment_engine.get_assessment("as_coding_algorithms", is_candidate_view=True)
        self.assertIsNotNone(as_def)
        q_coding = next(q for q in as_def["questions"] if q["question_type"] == "coding")
        self.assertNotIn("hidden_test_cases", q_coding)
        self.assertIn("examples", q_coding)
        self.assertIn("constraints", q_coding)

        # Candidate submission scored with NullSandboxAdapter
        sub = assessment_engine.score_submission(
            assessment_id="as_coding_algorithms",
            candidate_username="alexchen",
            candidate_name="Alex Chen",
            candidate_avatar="https://example.com/avatar.png",
            answers={
                "q1_code_topo": {"language": "python", "code": "def findOrder(): pass"},
                "q2_code_theory": ["O(V + E)"]
            },
            completion_time_seconds=900
        )
        self.assertEqual(sub["status"], "FAILED")  # 10/60 points because coding sandbox is NOT CONFIGURED
        scored_coding = next(q for q in sub["scored_questions"] if q["question_type"] == "coding")
        self.assertFalse(scored_coding["is_correct"])
        self.assertEqual(scored_coding["points_awarded"], 0)
        self.assertEqual(scored_coding["execution_details"]["status"], "NOT CONFIGURED")


if __name__ == "__main__":
    unittest.main()
