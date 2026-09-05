import unittest
from app.services.problem_solving_engine import (
    problem_solving_engine,
    BASE_PROBLEM_XP,
    VERIFICATION_MODIFIERS,
    EASY_VOLUME_TIERS,
    VerificationStrength
)
from app.services.reputation_engine import (
    reputation_engine,
    SourceType
)
from app.services.match_engine import match_engine
from app.services.platform_adapters import get_platform_adapter

class TestProblemSolvingEngine(unittest.TestCase):

    def test_difficulty_base_xp(self):
        """Verify Phase 3 deterministic base XP for difficulty tiers."""
        self.assertEqual(problem_solving_engine.DIFFICULTY_BASE_XP["EASY"], 6)
        self.assertEqual(problem_solving_engine.DIFFICULTY_BASE_XP["MEDIUM"], 18)
        self.assertEqual(problem_solving_engine.DIFFICULTY_BASE_XP["HARD"], 45)
        self.assertEqual(problem_solving_engine.DIFFICULTY_BASE_XP["EXPERT"], 70)
        self.assertEqual(problem_solving_engine.DIFFICULTY_BASE_XP["UNKNOWN"], 0)

    def test_single_solve_xp_and_verification_modifiers(self):
        """Verify XP for individual solves under Phase 3 verification states."""
        # Hard problem on official verified API (1.00) vs unverified (0.00)
        xp_official = problem_solving_engine.calculate_single_solve_xp(
            difficulty="HARD",
            verification_status="provider_verified"
        )
        xp_profile = problem_solving_engine.calculate_single_solve_xp(
            difficulty="HARD",
            verification_status="profile_verified"
        )
        xp_unverified = problem_solving_engine.calculate_single_solve_xp(
            difficulty="HARD",
            verification_status="unverified"
        )
        
        self.assertEqual(xp_official, 45)
        self.assertEqual(xp_profile, int(round(45 * 0.90)))
        self.assertEqual(xp_unverified, 0, "Unverified solves must award 0 public reputation XP")

    def test_anti_farming_easy_problem_modifier(self):
        """
        Verify rolling 7-day volume reduction on Easy problems:
        1-30: 1.00
        31-60: 0.60
        61+: 0.30
        Medium/Hard/Expert should NOT use this reduction.
        """
        # Easy problem at count 15
        xp_easy_early = problem_solving_engine.calculate_final_problem_xp(
            difficulty="EASY",
            verification_status="provider_verified",
            rolling_easy_count=15
        )
        self.assertEqual(xp_easy_early["volume_modifier"], 1.00)
        self.assertEqual(xp_easy_early["skill_xp"], 6)

        # Easy problem at count 45
        xp_easy_mid = problem_solving_engine.calculate_final_problem_xp(
            difficulty="EASY",
            verification_status="provider_verified",
            rolling_easy_count=45
        )
        self.assertEqual(xp_easy_mid["volume_modifier"], 0.60)
        self.assertEqual(xp_easy_mid["skill_xp"], int(round(6 * 0.60)))

        # Easy problem at count 80
        xp_easy_late = problem_solving_engine.calculate_final_problem_xp(
            difficulty="EASY",
            verification_status="provider_verified",
            rolling_easy_count=80
        )
        self.assertEqual(xp_easy_late["volume_modifier"], 0.30)
        self.assertEqual(xp_easy_late["skill_xp"], int(round(6 * 0.30)))

        # Medium problem at count 80 should NOT receive easy volume reduction
        xp_medium = problem_solving_engine.calculate_final_problem_xp(
            difficulty="MEDIUM",
            verification_status="provider_verified",
            rolling_easy_count=80
        )
        self.assertEqual(xp_medium["volume_modifier"], 1.00)
        self.assertEqual(xp_medium["skill_xp"], 18)

    def test_quality_modifier_with_and_without_code(self):
        """
        Verify quality modifier applies 0.90-1.20 only when legitimate source code is present,
        and defaults to 1.00 for external platforms where source code is unavailable.
        """
        # External platform without code
        xp_no_code = problem_solving_engine.calculate_final_problem_xp(
            difficulty="HARD",
            verification_status="provider_verified",
            has_source_code=False,
            quality_score=None
        )
        self.assertEqual(xp_no_code["quality_modifier"], 1.00)
        self.assertEqual(xp_no_code["skill_xp"], 45)

        # With poor accepted code (score = 0)
        xp_poor_code = problem_solving_engine.calculate_final_problem_xp(
            difficulty="HARD",
            verification_status="provider_verified",
            has_source_code=True,
            quality_score=0.0
        )
        self.assertEqual(xp_poor_code["quality_modifier"], 0.90)
        self.assertEqual(xp_poor_code["skill_xp"], int(round(45 * 0.90)))

        # With highly optimized code (score = 100)
        xp_optimized_code = problem_solving_engine.calculate_final_problem_xp(
            difficulty="HARD",
            verification_status="provider_verified",
            has_source_code=True,
            quality_score=100.0
        )
        self.assertEqual(xp_optimized_code["quality_modifier"], 1.20)
        self.assertEqual(xp_optimized_code["skill_xp"], int(round(45 * 1.20)))

    def test_duplicate_canonical_problem_modifier(self):
        """
        Verify that duplicate solves of the same canonical problem award 0 duplicate XP.
        """
        user = "dup_test_user"
        fp = problem_solving_engine.generate_canonical_fingerprint("leetcode", "1", "Two Sum")
        self.assertFalse(problem_solving_engine.is_problem_duplicate(user, fp))

        # First solve awards XP
        xp_1 = problem_solving_engine.calculate_final_problem_xp(
            difficulty="EASY",
            verification_status="provider_verified",
            is_duplicate=False
        )
        self.assertEqual(xp_1["duplicate_modifier"], 1.00)
        self.assertEqual(xp_1["skill_xp"], 6)

        # Mark awarded
        problem_solving_engine.mark_problem_awarded(user, fp)
        self.assertTrue(problem_solving_engine.is_problem_duplicate(user, fp))

        # Second solve from another platform awards 0 XP
        xp_2 = problem_solving_engine.calculate_final_problem_xp(
            difficulty="EASY",
            verification_status="provider_verified",
            is_duplicate=True
        )
        self.assertEqual(xp_2["duplicate_modifier"], 0.00)
        self.assertEqual(xp_2["skill_xp"], 0)
        self.assertEqual(xp_2["overall_professional_xp"], 0)

    def test_overall_professional_xp_ratio(self):
        """
        Verify 60% ratio for external coding platforms vs 100% for first-party assessments.
        Example from prompt: Problem earns 20 XP -> Skill XP: +20, Overall Professional XP: +12.
        """
        # External platform (60%)
        xp_ext = problem_solving_engine.calculate_final_problem_xp(
            difficulty="MEDIUM",
            verification_status="provider_verified",
            is_first_party=False
        )
        self.assertEqual(xp_ext["skill_xp"], 18)
        self.assertEqual(xp_ext["overall_professional_xp"], int(round(18 * 0.60)))

        # First-party ProofHire assessment (100%)
        xp_ph = problem_solving_engine.calculate_final_problem_xp(
            difficulty="MEDIUM",
            verification_status="provider_verified",
            is_first_party=True
        )
        self.assertEqual(xp_ph["skill_xp"], 18)
        self.assertEqual(xp_ph["overall_professional_xp"], 18)

    def test_topic_xp_proportional_distribution(self):
        """
        Verify that topic XP maps narrow tags to broad categories and distributes proportionally.
        BFS, DFS, Dijkstra -> Graphs -> 100% XP to Graphs (avoiding duplicate independent awards).
        """
        # Multiple tags mapping to same broad category
        dist_1 = problem_solving_engine.distribute_problem_topic_xp(
            topics=["Graphs", "BFS", "Shortest Path"],
            total_skill_xp=30
        )
        self.assertIn("Graphs", dist_1)
        self.assertEqual(dist_1["Graphs"], 30, "Single broad category receives 100% of XP")

        # Tags mapping to two distinct categories
        dist_2 = problem_solving_engine.distribute_problem_topic_xp(
            topics=["BFS", "Dynamic Programming"],
            total_skill_xp=30
        )
        self.assertIn("Graphs", dist_2)
        self.assertIn("Dynamic Programming", dist_2)
        self.assertEqual(dist_2["Graphs"] + dist_2["Dynamic Programming"], 30)
        self.assertEqual(dist_2["Graphs"], 15)
        self.assertEqual(dist_2["Dynamic Programming"], 15)

    def test_problem_solving_level_progression(self):
        """Verify quadratic level progression formula based purely on problem_solving_xp."""
        lvl_0 = problem_solving_engine.calculate_problem_solving_level(0)
        self.assertEqual(lvl_0, 1)

        lvl_mid = problem_solving_engine.calculate_problem_solving_level(1750)
        self.assertEqual(lvl_mid, 25)

        lvl_high = problem_solving_engine.calculate_problem_solving_level(3830)
        self.assertEqual(lvl_high, 36)

    def test_5_signal_problem_solving_score_and_breakdown(self):
        """
        Verify the 5-signal 0-100 score:
        45% Solve Strength, 20% Advanced Ability, 15% Topic Breadth,
        10% Contest Performance, 10% Consistency.
        """
        # Test candidate matching prompt example:
        # Verified Solves: 327 (Easy: 141, Medium: 142, Hard: 41, Expert: 3)
        res = problem_solving_engine.calculate_problem_solving_score_v3(
            easy_count=141,
            medium_count=142,
            hard_count=41,
            expert_count=3,
            topic_distribution={
                "Arrays": {"solved": 91},
                "Trees": {"solved": 87},
                "Graphs": {"solved": 83},
                "Dynamic Programming": {"solved": 76},
                "Searching": {"solved": 30},
                "Mathematics": {"solved": 25},
                "Sorting": {"solved": 15},
                "Bit Manipulation": {"solved": 10}
            },
            contest_percentile=92.0,
            active_weeks_last_12=10
        )

        score = res["problem_solving_score"]
        self.assertEqual(score, 84, "Problem solving score should match calibrated canonical example")
        self.assertEqual(res["problem_solving_level"], 29, "Level should match calibrated canonical example")
        self.assertEqual(res["verified_solves"]["total"], 327)
        self.assertEqual(res["consistency"], "10 / 12 active weeks")

        # Check breakdown
        bd = res["score_breakdown"]
        self.assertIn("verified_solve_strength", bd)
        self.assertIn("advanced_problem_ability", bd)
        self.assertIn("topic_breadth", bd)
        self.assertIn("contest_performance", bd)
        self.assertIn("consistency", bd)
        self.assertEqual(bd["verified_solve_strength"]["max"], 45.0)
        self.assertEqual(bd["advanced_problem_ability"]["max"], 20.0)
        self.assertEqual(bd["topic_breadth"]["max"], 15.0)
        self.assertEqual(bd["contest_performance"]["max"], 10.0)
        self.assertEqual(bd["consistency"]["max"], 10.0)

        # Verify explanation
        self.assertIn("explanation", res)
        self.assertIn(f"Problem Solving Score of {score}/100", res["explanation"])

    def test_thousands_of_easy_problems_cannot_saturate_score(self):
        """
        Verify that solving thousands of easy questions cannot yield a 100 score
        due to the saturating curve and 0 advanced problem points.
        """
        res_easy_farmer = problem_solving_engine.calculate_problem_solving_score_v3(
            easy_count=3000,
            medium_count=0,
            hard_count=0,
            expert_count=0,
            topic_distribution={"Arrays": {"solved": 3000}},
            contest_percentile=None,
            active_weeks_last_12=12
        )
        # Without Medium/Hard/Expert solves and with only 1 topic, score must be strictly capped
        self.assertLess(res_easy_farmer["problem_solving_score"], 70)
        self.assertEqual(res_easy_farmer["score_breakdown"]["advanced_problem_ability"]["points"], 0.0)
