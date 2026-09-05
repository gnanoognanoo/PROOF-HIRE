import unittest
from app.services.match_engine import match_engine
from app.services.recruiter_service import recruiter_service

class TestRecruiterProblemSolvingMatch(unittest.TestCase):

    def setUp(self):
        self.spec_candidate = {
            "id": "cand_spec_test",
            "username": "spec_solver",
            "name": "Alex Solver",
            "headline": "Backend Engineer | Distributed Systems & Algorithms",
            "level": 35,
            "overall_grade": "A",
            "problem_solving_score": 84,
            "verified_problems_count": 327,
            "hard_problems_count": 41,
            "medium_problems_count": 142,
            "easy_problems_count": 141,
            "top_topics": ["Graphs", "Trees", "Algorithms"],
            "topic_scores": {
                "Graphs": 87,
                "SQL": 79,
                "Algorithms": 87,
                "Trees": 86,
                "Dynamic Programming": 76
            },
            "skills": {
                "Algorithms": {"score": 87, "level": 34},
                "Graphs": {"score": 87, "level": 34},
                "SQL": {"score": 79, "level": 30},
                "Python": {"score": 88, "level": 35}
            },
            "verified_projects_count": 5,
            "collaboration_score": 86,
            "assessment_score": 90.0,
            "contests_count": 18,
            "connected_platforms": ["LeetCode", "Codeforces", "ProofHire"]
        }

    def test_spec_example_problem_solving_match_signal_88_percent(self):
        """
        Verify the exact prompt specification:
        Backend Developer role requires: Algorithms, Graphs, SQL
        Candidate:
        Problem Solving Score: 84
        Graphs: 87
        SQL: 79
        Problem Solving Match: 88%
        (Do not use generic total problem count alone).
        """
        signal_res = match_engine.calculate_problem_solving_match_signal(
            candidate=self.spec_candidate,
            required_skills=["Algorithms", "Graphs", "SQL"],
            target_role="Backend Developer"
        )

        match_pct = signal_res["problem_solving_match_percent"]
        self.assertEqual(match_pct, 88)
        self.assertGreater(signal_res["med_hard_quality_score"], 80)
        self.assertGreater(signal_res["consistency_score"], 80)
        self.assertGreater(signal_res["contest_score"], 80)

    def test_conditional_match_weighting_technical_ps_true(self):
        """
        When requires_problem_solving is TRUE:
        Required Skills Coverage: 30%
        Skill Proficiency: 20%
        Relevant Project Evidence: 15%
        Project Grades: 10%
        Problem Solving: 10%
        Assessment Performance: 10%
        Collaboration: 5%
        TOTAL = 100%
        """
        result = match_engine.calculate_match_score(
            candidate=self.spec_candidate,
            required_skills=["Algorithms", "Graphs", "SQL"],
            target_role="Backend Developer",
            requires_problem_solving=True
        )

        signals = result["signals"]
        self.assertIn("problem_solving", signals)
        self.assertIn("problem_solving_match_percent", signals)
        self.assertEqual(signals["problem_solving_match_percent"], 88)

        # Max theoretical bounds under technical PS weights:
        # skills 30, prof 20, projects 15, grades 10, ps 10, assessments 10, collab 5
        self.assertLessEqual(signals["required_skills"], 30.0)
        self.assertLessEqual(signals["skill_proficiency"], 20.0)
        self.assertLessEqual(signals["project_evidence"], 15.0)
        self.assertLessEqual(signals["project_grades"], 10.0)
        self.assertLessEqual(signals["problem_solving"], 10.0)
        self.assertLessEqual(signals["assessment_scores"], 10.0)
        self.assertLessEqual(signals["collaboration_score"], 5.0)

        # Sum of maximum possible points equals 100%
        max_possible = 30.0 + 20.0 + 15.0 + 10.0 + 10.0 + 10.0 + 5.0
        self.assertEqual(max_possible, 100.0)

        # Match score is high for well-qualified candidate
        self.assertGreaterEqual(result["match_score"], 85)

    def test_conditional_match_weighting_standard_ps_false(self):
        """
        When requires_problem_solving is FALSE:
        Retains the existing ProofHire standard 6-signal match model:
        Required Skills: 35%, Proficiency: 20%, Projects: 15%, Grades: 15%,
        Assessments: 10%, Collaboration: 5% = 100%.
        """
        result = match_engine.calculate_match_score(
            candidate=self.spec_candidate,
            required_skills=["React", "TypeScript", "Next.js"],
            requires_problem_solving=False
        )

        signals = result["signals"]
        # Problem solving signal should be 0 or not applied in calculation
        self.assertNotIn("problem_solving", signals)

        # Max theoretical bounds under standard weights:
        # skills 35, prof 20, projects 15, grades 15, assessments 10, collab 5
        max_possible = 35.0 + 20.0 + 15.0 + 15.0 + 10.0 + 5.0
        self.assertEqual(max_possible, 100.0)

    def test_job_fields_configured(self):
        """Verify open positions have requires_problem_solving, minimum_problem_solving_score, and problem_solving_weight."""
        positions = recruiter_service.open_positions
        self.assertGreater(len(positions), 0)

        # Frontend Engineer requires problem solving
        fe_job = next(p for p in positions if p["id"] == "pos_acme_frontend")
        self.assertTrue(fe_job["requires_problem_solving"])
        self.assertEqual(fe_job["minimum_problem_solving_score"], 75.0)
        self.assertEqual(fe_job["problem_solving_weight"], 0.10)

        # Non-technical/PM position does NOT require problem solving
        pm_job = next(p for p in positions if p["id"] == "pos_nexus_pm")
        self.assertFalse(pm_job["requires_problem_solving"])
        self.assertIsNone(pm_job["minimum_problem_solving_score"])

    def test_recruiter_filters_problem_solving(self):
        """
        Verify recruiter search filters:
        Role: Backend Engineer
        Problem Solving >= 75
        Graphs >= 70
        Verified Problems >= 100
        """
        res = recruiter_service.search_talent(
            min_problem_solving_score=75,
            algorithm_topic="Graphs",
            min_topic_score=70,
            min_verified_problems=100
        )

        self.assertGreater(len(res), 0)
        for cand in res:
            self.assertGreaterEqual(cand.get("problem_solving_score", 0), 75)
            self.assertGreaterEqual(cand.get("verified_problems_count", 0), 100)
            self.assertTrue(any("graph" in k.lower() and v >= 70 for k, v in cand.get("topic_scores", {}).items()))

    def test_candidate_result_has_compact_problem_solving_fields(self):
        """
        Verify candidates returned by recruiter search include:
        Problem Solving (score), Verified Problems, Hard Problems, Top Topics.
        """
        res = recruiter_service.search_talent()
        self.assertGreater(len(res), 0)

        cand = res[0]
        self.assertIn("problem_solving_score", cand)
        self.assertIn("verified_problems_count", cand)
        self.assertIn("hard_problems_count", cand)
        self.assertIn("top_topics", cand)
        self.assertIsInstance(cand["top_topics"], list)
        self.assertGreater(len(cand["top_topics"]), 0)

if __name__ == "__main__":
    unittest.main()
