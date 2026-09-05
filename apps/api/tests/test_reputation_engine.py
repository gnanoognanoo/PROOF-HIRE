import unittest
from app.services.reputation_engine import (
    reputation_engine,
    ProfessionalReputationGrade,
    REPUTATION_GRADE_TITLE
)

class TestReputationEngine(unittest.TestCase):

    def test_base_xp_constants(self):
        """Verify exact base XP values required by specification."""
        self.assertEqual(reputation_engine.BASE_XP["O"], 700)
        self.assertEqual(reputation_engine.BASE_XP["A"], 550)
        self.assertEqual(reputation_engine.BASE_XP["B"], 400)
        self.assertEqual(reputation_engine.BASE_XP["C"], 300)
        self.assertEqual(reputation_engine.BASE_XP["D"], 180)
        self.assertEqual(reputation_engine.BASE_XP["E"], 100)

    def test_project_xp_modifiers(self):
        """Test deterministic application of all 4 modifiers."""
        # Baseline: Grade B, standard inputs
        xp_b = reputation_engine.calculate_project_xp(
            grade="B",
            complexity_score=85.0,
            is_verified=True,
            contribution_percentage=100.0,
            completion_quality=90.0
        )
        self.assertIsInstance(xp_b, int)
        self.assertGreater(xp_b, 400)  # Modifiers scale up base 400

        # Verification status modifier test: verified should give higher XP than unverified
        xp_verified = reputation_engine.calculate_project_xp("A", 85.0, is_verified=True, contribution_percentage=100.0, completion_quality=90.0)
        xp_unverified = reputation_engine.calculate_project_xp("A", 85.0, is_verified=False, contribution_percentage=100.0, completion_quality=90.0)
        self.assertGreater(xp_verified, xp_unverified)

        # Contribution percentage modifier: 100% solo should give higher XP than 30% team
        xp_solo = reputation_engine.calculate_project_xp("A", 85.0, is_verified=True, contribution_percentage=100.0, completion_quality=90.0)
        xp_collab = reputation_engine.calculate_project_xp("A", 85.0, is_verified=True, contribution_percentage=30.0, completion_quality=90.0)
        self.assertGreater(xp_solo, xp_collab)

        # Complexity modifier: 95 complexity should give higher XP than 50 complexity
        xp_high_comp = reputation_engine.calculate_project_xp("O", 95.0, is_verified=True, contribution_percentage=100.0, completion_quality=90.0)
        xp_low_comp = reputation_engine.calculate_project_xp("O", 50.0, is_verified=True, contribution_percentage=100.0, completion_quality=90.0)
        self.assertGreater(xp_high_comp, xp_low_comp)

        # Completion quality modifier: 95 quality should give higher XP than 60 quality
        xp_high_qual = reputation_engine.calculate_project_xp("O", 90.0, is_verified=True, contribution_percentage=100.0, completion_quality=95.0)
        xp_low_qual = reputation_engine.calculate_project_xp("O", 90.0, is_verified=True, contribution_percentage=100.0, completion_quality=60.0)
        self.assertGreater(xp_high_qual, xp_low_qual)

    def test_level_and_professional_reputation_grade(self):
        """Verify MVP Grade Tiers E through O for Levels 1–51+ and explicit naming."""
        self.assertEqual(REPUTATION_GRADE_TITLE, "Professional Reputation Grade")

        # Levels 1–10: Grade Tier E
        for lvl in [1, 5, 10]:
            self.assertEqual(reputation_engine.get_grade_for_level(lvl), ProfessionalReputationGrade.E)

        # Levels 11–20: Grade Tier D
        for lvl in [11, 15, 20]:
            self.assertEqual(reputation_engine.get_grade_for_level(lvl), ProfessionalReputationGrade.D)

        # Levels 21–30: Grade Tier C
        for lvl in [21, 25, 30]:
            self.assertEqual(reputation_engine.get_grade_for_level(lvl), ProfessionalReputationGrade.C)

        # Levels 31–40: Grade Tier B
        for lvl in [31, 35, 37, 40]:
            self.assertEqual(reputation_engine.get_grade_for_level(lvl), ProfessionalReputationGrade.B)

        # Levels 41–50: Grade Tier A
        for lvl in [41, 45, 50]:
            self.assertEqual(reputation_engine.get_grade_for_level(lvl), ProfessionalReputationGrade.A)

        # Levels 51+: Grade Tier O
        for lvl in [51, 60, 100]:
            self.assertEqual(reputation_engine.get_grade_for_level(lvl), ProfessionalReputationGrade.O)

        # Test XP to Level calculation
        lvl_zero, grade_zero, _, _ = reputation_engine.calculate_level_from_xp(0)
        self.assertEqual(lvl_zero, 1)
        self.assertEqual(grade_zero, ProfessionalReputationGrade.E)

        lvl_37, grade_37, _, _ = reputation_engine.calculate_level_from_xp(8420)
        self.assertEqual(lvl_37, 37)
        self.assertEqual(grade_37, ProfessionalReputationGrade.B)

        lvl_51, grade_51, _, _ = reputation_engine.calculate_level_from_xp(17000)
        self.assertGreaterEqual(lvl_51, 51)
        self.assertEqual(grade_51, ProfessionalReputationGrade.O)

    def test_skill_xp_distribution_prompt_example(self):
        """
        Verify exact prompt example:
        Project earns 600 XP.
        React relevance: 40% -> 240 XP
        TypeScript: 25% -> 150 XP
        API Development: 20% -> 120 XP
        Git: 15% -> 90 XP
        """
        earned_xp = 600
        weights = {
            "React": 0.40,
            "TypeScript": 0.25,
            "API Development": 0.20,
            "Git": 0.15
        }
        distributed = reputation_engine.distribute_skill_xp(earned_xp, weights)
        self.assertEqual(distributed["React"], 240)
        self.assertEqual(distributed["TypeScript"], 150)
        self.assertEqual(distributed["API Development"], 120)
        self.assertEqual(distributed["Git"], 90)
        self.assertEqual(sum(distributed.values()), 600)

    def test_all_10_badge_definitions_exist(self):
        """Verify that all 10 initial badges exist with Bronze, Silver, Gold tiers."""
        expected_badges = [
            "Frontend Developer",
            "Backend Developer",
            "Full Stack Developer",
            "AI Developer",
            "Python Developer",
            "React Developer",
            "Open Source Contributor",
            "Team Collaborator",
            "Project Leader",
            "Consistent Builder"
        ]
        self.assertEqual(len(reputation_engine.BADGE_DEFINITIONS), 10)
        for b in expected_badges:
            self.assertIn(b, reputation_engine.BADGE_DEFINITIONS)
            badge_def = reputation_engine.BADGE_DEFINITIONS[b]
            self.assertIn("Bronze", badge_def["rules"])
            self.assertIn("Silver", badge_def["rules"])
            self.assertIn("Gold", badge_def["rules"])

    def test_react_developer_badge_rules(self):
        """
        Verify React Developer badge criteria from prompt:
        Bronze: 2 verified React projects, React level >= 10
        Silver: 4 verified React projects, React level >= 20, Average relevant grade >= B
        Gold:   6 verified React projects, React level >= 30, Average relevant grade >= A
        """
        # 1. Bronze qualification test
        active, notifs = reputation_engine.evaluate_badges(
            current_badges=[],
            verified_projects_by_skill={"React": 2},
            skill_levels={"React": 10},
            skill_grades={"React": "C"},
            total_verified_projects=2
        )
        react_badge = next((b for b in active if b["badge_name"] == "React Developer"), None)
        self.assertIsNotNone(react_badge)
        self.assertEqual(react_badge["tier"], "Bronze")
        self.assertIn("React Developer — Bronze unlocked", [n["title"] for n in notifs])

        # 2. Silver qualification test
        active_silver, notifs_silver = reputation_engine.evaluate_badges(
            current_badges=[],
            verified_projects_by_skill={"React": 4},
            skill_levels={"React": 22},
            skill_grades={"React": "B"},
            total_verified_projects=4
        )
        react_silver = next((b for b in active_silver if b["badge_name"] == "React Developer"), None)
        self.assertIsNotNone(react_silver)
        self.assertEqual(react_silver["tier"], "Silver")
        self.assertIn("React Developer — Silver unlocked", [n["title"] for n in notifs_silver])

        # 3. Gold qualification test
        active_gold, notifs_gold = reputation_engine.evaluate_badges(
            current_badges=[],
            verified_projects_by_skill={"React": 6},
            skill_levels={"React": 34},
            skill_grades={"React": "A"},
            total_verified_projects=6
        )
        react_gold = next((b for b in active_gold if b["badge_name"] == "React Developer"), None)
        self.assertIsNotNone(react_gold)
        self.assertEqual(react_gold["tier"], "Gold")
        self.assertIn("React Developer — Gold unlocked", [n["title"] for n in notifs_gold])

    def test_five_xp_sources(self):
        """Verify deterministic calculation across all 5 XP sources."""
        sources = ["PROJECT", "CERTIFICATE", "COLLABORATION", "ASSESSMENT", "ACHIEVEMENT"]
        for s in sources:
            xp = reputation_engine.calculate_source_xp(s, grade="A", complexity_score=90.0, is_verified=True)
            self.assertIsInstance(xp, int)
            self.assertGreater(xp, 0)

    def test_recalculate_user_reputation_flow(self):
        """Verify full recalculation service on XP change."""
        user_state = {
            "cumulative_xp": 2800,  # ~Level 21 -> Grade C
            "level": 1,
            "skills": {
                "React": {"cumulative_xp": 1200, "level": 1, "score": 85, "verified_projects": 4, "grade": "B"}
            },
            "badges": [],
            "notifications": []
        }
        updated, notifs = reputation_engine.recalculate_user_reputation(user_state)
        self.assertEqual(updated["level"], 21)
        self.assertEqual(updated["professional_reputation_grade"], ProfessionalReputationGrade.C)
        self.assertGreater(updated["skills"]["React"]["level"], 10)
        # Verify notification created
        self.assertGreater(len(updated["badges"]), 0)

if __name__ == "__main__":
    unittest.main()
