import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.reputation_engine import reputation_engine
from app.services.problem_solving_engine import problem_solving_engine

class TestProblemSolvingSmartBadges(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_problem_solver_badge_rules(self):
        """
        Verify Problem Solver smart badge:
        Bronze: 50 verified problems, 10+ medium
        Silver: 150 verified problems, 50+ medium, 10+ hard, Score >= 60
        Gold:   300 verified problems, 100+ medium, 25+ hard, Score >= 80
        """
        # 1. Under-qualified (49 problems) -> No badge
        p_none = {"total_solved": 49, "medium_count": 12, "hard_count": 0, "problem_solving_score": 50}
        badges, _ = reputation_engine.evaluate_problem_solving_badges(p_none, [])
        self.assertIsNone(next((b for b in badges if b["badge_name"] == "Problem Solver"), None))

        # 2. Bronze Qualification
        p_bronze = {"total_solved": 55, "medium_count": 12, "hard_count": 2, "problem_solving_score": 45}
        badges, notifs = reputation_engine.evaluate_problem_solving_badges(p_bronze, [])
        b_bronze = next((b for b in badges if b["badge_name"] == "Problem Solver"), None)
        self.assertIsNotNone(b_bronze)
        self.assertEqual(b_bronze["tier"], "Bronze")
        self.assertEqual(b_bronze["full_title"], "Problem Solver — Bronze")
        self.assertTrue(any("Problem Solver — Bronze unlocked" in n["title"] for n in notifs))

        # 3. Silver Disqualification (150 problems, 50 medium, 10 hard, but score 58 < 60) -> Stays Bronze
        p_silver_fail = {"total_solved": 160, "medium_count": 55, "hard_count": 12, "problem_solving_score": 58}
        badges, _ = reputation_engine.evaluate_problem_solving_badges(p_silver_fail, [])
        b_tier = next((b for b in badges if b["badge_name"] == "Problem Solver"), None)
        self.assertEqual(b_tier["tier"], "Bronze")

        # 4. Silver Qualification
        p_silver = {"total_solved": 160, "medium_count": 55, "hard_count": 12, "problem_solving_score": 68}
        badges, notifs = reputation_engine.evaluate_problem_solving_badges(p_silver, [])
        b_silver = next((b for b in badges if b["badge_name"] == "Problem Solver"), None)
        self.assertIsNotNone(b_silver)
        self.assertEqual(b_silver["tier"], "Silver")
        self.assertTrue(any("Problem Solver — Silver unlocked" in n["title"] for n in notifs))

        # 5. Gold Qualification (327 problems, 142 medium, 41 hard, score 84 >= 80)
        p_gold = {"total_solved": 327, "medium_count": 142, "hard_count": 41, "problem_solving_score": 84}
        badges, notifs = reputation_engine.evaluate_problem_solving_badges(p_gold, [])
        b_gold = next((b for b in badges if b["badge_name"] == "Problem Solver"), None)
        self.assertIsNotNone(b_gold)
        self.assertEqual(b_gold["tier"], "Gold")
        self.assertEqual(b_gold["full_title"], "Problem Solver — Gold")
        self.assertTrue(any("Problem Solver — Gold unlocked" in n["title"] for n in notifs))

    def test_algorithmic_thinking_badge_rules(self):
        """
        Verify Algorithmic Thinking smart badge:
        Bronze: Verified activity across at least 4 algorithm categories
        Silver: At least 6 categories, minimum topic score 60 in 4 categories
        Gold:   At least 8 categories, 4 advanced topics >= 75
        """
        # 1. Under-qualified (3 categories) -> No badge
        p_none = {
            "topic_distribution": {
                "Arrays": {"solved": 10, "score": 80},
                "Strings": {"solved": 5, "score": 70},
                "Sorting": {"solved": 3, "score": 65}
            }
        }
        badges, _ = reputation_engine.evaluate_problem_solving_badges(p_none, [])
        self.assertIsNone(next((b for b in badges if b["badge_name"] == "Algorithmic Thinking"), None))

        # 2. Bronze Qualification (4 categories)
        p_bronze = {
            "topic_distribution": {
                "Arrays": {"solved": 10, "score": 50},
                "Strings": {"solved": 5, "score": 45},
                "Sorting": {"solved": 3, "score": 40},
                "Math": {"solved": 2, "score": 30}
            }
        }
        badges, notifs = reputation_engine.evaluate_problem_solving_badges(p_bronze, [])
        b_bronze = next((b for b in badges if b["badge_name"] == "Algorithmic Thinking"), None)
        self.assertIsNotNone(b_bronze)
        self.assertEqual(b_bronze["tier"], "Bronze")
        self.assertTrue(any("Algorithmic Thinking — Bronze unlocked" in n["title"] for n in notifs))

        # 3. Silver Qualification (6 categories, 4 with score >= 60)
        p_silver = {
            "topic_distribution": {
                "Arrays": {"solved": 30, "score": 85},
                "Trees": {"solved": 20, "score": 75},
                "Graphs": {"solved": 15, "score": 65},
                "Dynamic Programming": {"solved": 12, "score": 62},
                "Sorting": {"solved": 5, "score": 50},
                "Strings": {"solved": 4, "score": 45}
            }
        }
        badges, notifs = reputation_engine.evaluate_problem_solving_badges(p_silver, [])
        b_silver = next((b for b in badges if b["badge_name"] == "Algorithmic Thinking"), None)
        self.assertIsNotNone(b_silver)
        self.assertEqual(b_silver["tier"], "Silver")
        self.assertTrue(any("Algorithmic Thinking — Silver unlocked" in n["title"] for n in notifs))

        # 4. Gold Qualification (8 categories, 4 advanced topics >= 75)
        p_gold = {
            "topic_distribution": {
                "Dynamic Programming": {"solved": 48, "score": 76},
                "Trees": {"solved": 68, "score": 87},
                "Graphs": {"solved": 54, "score": 83},
                "Algorithms": {"solved": 94, "score": 91},
                "Arrays": {"solved": 112, "score": 91},
                "SQL": {"solved": 45, "score": 72},
                "Sorting": {"solved": 25, "score": 78},
                "Greedy": {"solved": 20, "score": 80}
            }
        }
        badges, notifs = reputation_engine.evaluate_problem_solving_badges(p_gold, [])
        b_gold = next((b for b in badges if b["badge_name"] == "Algorithmic Thinking"), None)
        self.assertIsNotNone(b_gold)
        self.assertEqual(b_gold["tier"], "Gold")
        self.assertEqual(b_gold["full_title"], "Algorithmic Thinking — Gold")
        self.assertTrue(any("Algorithmic Thinking — Gold unlocked" in n["title"] for n in notifs))

    def test_competitive_programmer_badge_rules(self):
        """
        Verify Competitive Programmer smart badge:
        Bronze: 5 verified contests
        Silver: 15 verified contests, at least one Top 25% finish
        Gold:   30 verified contests, at least one Top 10% finish
        """
        # 1. Bronze (5 contests)
        p_bronze = {
            "contests_participated": 6,
            "recent_contests": [
                {"contest_name": f"Round {i}", "percentile": 45.0, "rank": 450, "total_participants": 1000}
                for i in range(6)
            ]
        }
        badges, notifs = reputation_engine.evaluate_problem_solving_badges(p_bronze, [])
        b_bronze = next((b for b in badges if b["badge_name"] == "Competitive Programmer"), None)
        self.assertIsNotNone(b_bronze)
        self.assertEqual(b_bronze["tier"], "Bronze")
        self.assertTrue(any("Competitive Programmer — Bronze unlocked" in n["title"] for n in notifs))

        # 2. Silver Disqualification (16 contests, but best finish is Top 40% -> stays Bronze)
        p_silver_fail = {
            "contests_participated": 16,
            "recent_contests": [
                {"contest_name": f"Round {i}", "percentile": 40.0, "rank": 400, "total_participants": 1000}
                for i in range(16)
            ]
        }
        badges, _ = reputation_engine.evaluate_problem_solving_badges(p_silver_fail, [])
        b_fail = next((b for b in badges if b["badge_name"] == "Competitive Programmer"), None)
        self.assertEqual(b_fail["tier"], "Bronze")

        # 3. Silver Qualification (18 contests, with Top 1.3% finish)
        p_silver = {
            "contests_participated": 18,
            "recent_contests": [
                {"contest_name": "LeetCode Weekly 431", "percentile": 99.85, "rank": 42, "total_participants": 28400},
                {"contest_name": "Codeforces Round 982", "percentile": 98.70, "rank": 185, "total_participants": 14200}
            ]
        }
        badges, notifs = reputation_engine.evaluate_problem_solving_badges(p_silver, [])
        b_silver = next((b for b in badges if b["badge_name"] == "Competitive Programmer"), None)
        self.assertIsNotNone(b_silver)
        self.assertEqual(b_silver["tier"], "Silver")
        self.assertTrue(any("Competitive Programmer — Silver unlocked" in n["title"] for n in notifs))

        # 4. Gold Qualification (32 contests, Top 10% finish)
        p_gold = {
            "contests_participated": 32,
            "top_percentile": 98.5,
            "recent_contests": [
                {"contest_name": "Codeforces Round 990", "percentile": 99.2, "rank": 18, "total_participants": 2400}
            ]
        }
        badges, notifs = reputation_engine.evaluate_problem_solving_badges(p_gold, [])
        b_gold = next((b for b in badges if b["badge_name"] == "Competitive Programmer"), None)
        self.assertIsNotNone(b_gold)
        self.assertEqual(b_gold["tier"], "Gold")
        self.assertEqual(b_gold["full_title"], "Competitive Programmer — Gold")
        self.assertTrue(any("Competitive Programmer — Gold unlocked" in n["title"] for n in notifs))

    def test_consistent_solver_badge_rules(self):
        """
        Verify Consistent Solver smart badge:
        Bronze: 4 active weeks out of last 6
        Silver: 8 active weeks out of last 10
        Gold:   10 active weeks out of last 12
        """
        # 1. Bronze (4 of 6 weeks)
        p_bronze = {"active_weeks_last_6": 4, "active_weeks_last_10": 4, "active_weeks_last_12": 4}
        badges, notifs = reputation_engine.evaluate_problem_solving_badges(p_bronze, [])
        b_bronze = next((b for b in badges if b["badge_name"] == "Consistent Solver"), None)
        self.assertIsNotNone(b_bronze)
        self.assertEqual(b_bronze["tier"], "Bronze")
        self.assertTrue(any("Consistent Solver — Bronze unlocked" in n["title"] for n in notifs))

        # 2. Silver (8 of 10 weeks)
        p_silver = {"active_weeks_last_6": 5, "active_weeks_last_10": 8, "active_weeks_last_12": 8}
        badges, notifs = reputation_engine.evaluate_problem_solving_badges(p_silver, [])
        b_silver = next((b for b in badges if b["badge_name"] == "Consistent Solver"), None)
        self.assertIsNotNone(b_silver)
        self.assertEqual(b_silver["tier"], "Silver")
        self.assertTrue(any("Consistent Solver — Silver unlocked" in n["title"] for n in notifs))

        # 3. Gold (10 of 12 weeks)
        p_gold = {"active_weeks_last_6": 6, "active_weeks_last_10": 9, "active_weeks_last_12": 10}
        badges, notifs = reputation_engine.evaluate_problem_solving_badges(p_gold, [])
        b_gold = next((b for b in badges if b["badge_name"] == "Consistent Solver"), None)
        self.assertIsNotNone(b_gold)
        self.assertEqual(b_gold["tier"], "Gold")
        self.assertEqual(b_gold["full_title"], "Consistent Solver — Gold")
        self.assertTrue(any("Consistent Solver — Gold unlocked" in n["title"] for n in notifs))

    def test_api_badge_endpoints(self):
        """Verify REST API returns smart badge definitions and candidate unlocks."""
        # 1. GET /problem-solving/badges
        res = self.client.get("/problem-solving/badges")
        self.assertEqual(res.status_code, 200)
        defs = res.json()
        self.assertIn("Problem Solver", defs)
        self.assertIn("Algorithmic Thinking", defs)
        self.assertIn("Competitive Programmer", defs)
        self.assertIn("Consistent Solver", defs)

        # 2. GET /problem-solving/u/{username}/badges
        res_u = self.client.get("/problem-solving/u/gnaneshwar/badges")
        self.assertEqual(res_u.status_code, 200)
        data = res_u.json()
        self.assertEqual(data["username"], "gnaneshwar")
        self.assertIn("badges", data)
        self.assertGreaterEqual(data["total_unlocked"], 1)

if __name__ == "__main__":
    unittest.main()
