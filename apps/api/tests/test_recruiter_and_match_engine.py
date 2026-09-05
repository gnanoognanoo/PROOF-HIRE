import unittest
from app.services.match_engine import match_engine
from app.services.recruiter_service import recruiter_service

class TestRecruiterAndMatchEngine(unittest.TestCase):

    def test_deterministic_match_score_calculation(self):
        """
        Verify the 6-signal deterministic match scoring:
        Required skills (35%), Skill proficiency (20%), Project evidence (15%),
        Project grades (15%), Assessment scores (10%), Collaboration score (5%).
        """
        candidate = {
            "id": "cand_alexchen",
            "username": "alexchen",
            "name": "Alex Chen",
            "headline": "Frontend Developer | React • Next.js • TypeScript",
            "level": 38,
            "overall_grade": "B",
            "skills": {
                "React": {"score": 88, "level": 34},
                "TypeScript": {"score": 84, "level": 32},
                "Next.js": {"score": 81, "level": 30}
            },
            "verified_projects_count": 5,
            "collaboration_score": 86,
            "assessment_score": 92.4
        }

        # Match against exact skillset
        result = match_engine.calculate_match_score(
            candidate=candidate,
            required_skills=["React", "TypeScript", "Next.js"],
            target_role="Frontend Developer"
        )

        score = result["match_score"]
        # Score should be ~92% as specified in prompt example
        self.assertGreaterEqual(score, 90)
        self.assertLessEqual(score, 95)
        
        # Check signal breakdowns
        signals = result["signals"]
        self.assertIn("required_skills", signals)
        self.assertIn("skill_proficiency", signals)
        self.assertIn("project_evidence", signals)
        self.assertIn("project_grades", signals)
        self.assertIn("assessment_scores", signals)
        self.assertIn("collaboration_score", signals)
        
        # Verify AI explanation is generated without modifying score
        self.assertIn("why_this_candidate_matches", result)
        self.assertIn("Alex Chen", result["why_this_candidate_matches"])

    def test_missing_skills_strictly_lower_score(self):
        """Verify that a candidate lacking required skills receives a lower score mathematically."""
        candidate = {
            "id": "cand_marcus",
            "name": "Marcus",
            "skills": {"Rust": {"score": 80}},
            "verified_projects_count": 2,
            "overall_grade": "C",
            "assessment_score": 75.0,
            "collaboration_score": 70
        }

        result = match_engine.calculate_match_score(
            candidate=candidate,
            required_skills=["React", "TypeScript", "Next.js", "GraphQL"]
        )

        self.assertLess(result["match_score"], 60)
        self.assertEqual(len(result["missing_skills"]), 4)

    def test_talent_search_filters(self):
        """Verify talent search filtering by role, skills, min level, and grade."""
        # 1. Search by skill
        react_res = recruiter_service.search_talent(skills=["React"])
        self.assertTrue(all(any("react" in s["skill_name"].lower() for s in c["top_skills"]) for c in react_res))

        # 2. Search by minimum level
        lvl_res = recruiter_service.search_talent(min_level=35)
        self.assertTrue(all(c["level"] >= 35 for c in lvl_res))

        # 3. Search by role
        fe_res = recruiter_service.search_talent(role="Frontend Developer")
        self.assertGreaterEqual(len(fe_res), 1)

    def test_candidate_detail_dossier_all_ten_sections(self):
        """
        Verify recruiters can see all 10 required sections:
        1. Professional Summary
        2. Skill Reputation
        3. Verified Projects
        4. Project Grades
        5. GitHub Evidence
        6. Collaboration History
        7. Certificates
        8. Assessment Results
        9. Badges
        10. Verification History
        """
        dossier = recruiter_service.get_candidate_detail("alexchen")
        self.assertIsNotNone(dossier)

        # 1. Professional Summary
        self.assertIn("headline", dossier)
        self.assertIn("bio", dossier)
        self.assertIn("availability", dossier)
        self.assertIn("location", dossier)

        # 2. Skill Reputation
        self.assertIn("top_skills", dossier)
        self.assertIn("level", dossier)

        # 3. Verified Projects
        self.assertIn("verified_projects", dossier)

        # 4. Project Grades
        self.assertIn("overall_grade", dossier)

        # 5. GitHub Evidence
        self.assertIn("github_stats", dossier)
        self.assertIn("commits", dossier["github_stats"])

        # 6. Collaboration History
        self.assertIn("collaboration_history", dossier)
        self.assertIn("collaboration_score", dossier)

        # 7. Certificates
        self.assertIn("certificates", dossier)

        # 8. Assessment Results
        self.assertIn("assessments", dossier)

        # 9. Badges
        self.assertIn("badges", dossier)

        # 10. Verification History
        self.assertIn("verification_history", dossier)

    def test_recruiter_dashboard_compact_metrics(self):
        """Verify recruiter dashboard provides compact metrics."""
        dashboard = recruiter_service.get_dashboard_data()
        metrics = dashboard["metrics"]

        self.assertIn("open_positions", metrics)
        self.assertIn("saved_candidates", metrics)
        self.assertIn("assessments_sent", metrics)
        self.assertIn("upcoming_interviews", metrics)

        self.assertGreaterEqual(metrics["open_positions"], 1)
        self.assertIn("recommended_candidates", dashboard)
        self.assertIn("recent_applications", dashboard)
        self.assertIn("upcoming_interviews", dashboard)

if __name__ == "__main__":
    unittest.main()
