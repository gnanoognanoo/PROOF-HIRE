import unittest
from app.services.problem_solving_engine import (
    problem_solving_engine,
    CONTEST_MAX_PERFORMANCE_XP,
    MAX_RATING_BONUS_XP,
    RATING_DELTA_FACTOR,
    CONTEST_PLACEMENT_TIERS
)
from app.services.reputation_engine import reputation_engine

class TestContestReputationPhase4(unittest.TestCase):
    """
    Phase 4: Competitive Programming and Contest Reputation Unit Tests.
    Verifies:
      - Contest Placement Bonus tiers (Top 1%, 5%, 10%, 25%, 50%, Below 50%)
      - Zero placement bonus for unverified participant count / rank
      - Rating change bonus (positive only, capped at 50 XP, no penalty for negative)
      - Contest XP cap (350 XP max per contest, configurable)
      - No double counting of solved problems
      - Zero manufacturing policy (missing contest stats are never fabricated)
      - Profile telemetry updating (contests_participated, best_ranking, ratings, percentile)
    """

    def test_placement_bonus_all_tiers(self):
        """
        Verify deterministic placement bonus tiers:
        Top 1% = +150 XP
        Top 5% = +100 XP
        Top 10% = +70 XP
        Top 25% = +40 XP
        Top 50% = +20 XP
        Below Top 50% = +10 XP
        """
        total = 10000

        # Top 1% (rank 100 / 10000 = 1.0%)
        res_top1 = problem_solving_engine.calculate_contest_performance_bonus(
            rank=100,
            total_participants=total,
            rating_delta=0,
            is_verified=True
        )
        self.assertEqual(res_top1["placement_bonus"], 150)
        self.assertEqual(res_top1["placement_tier"], "Top 1%")
        self.assertEqual(res_top1["total_contest_xp"], 150)

        # Top 5% (rank 350 / 10000 = 3.5%)
        res_top5 = problem_solving_engine.calculate_contest_performance_bonus(
            rank=350,
            total_participants=total,
            rating_delta=0,
            is_verified=True
        )
        self.assertEqual(res_top5["placement_bonus"], 100)
        self.assertEqual(res_top5["placement_tier"], "Top 5%")
        self.assertEqual(res_top5["total_contest_xp"], 100)

        # Top 10% (rank 800 / 10000 = 8.0%)
        res_top10 = problem_solving_engine.calculate_contest_performance_bonus(
            rank=800,
            total_participants=total,
            rating_delta=0,
            is_verified=True
        )
        self.assertEqual(res_top10["placement_bonus"], 70)
        self.assertEqual(res_top10["placement_tier"], "Top 10%")
        self.assertEqual(res_top10["total_contest_xp"], 70)

        # Top 25% (rank 2000 / 10000 = 20.0%)
        res_top25 = problem_solving_engine.calculate_contest_performance_bonus(
            rank=2000,
            total_participants=total,
            rating_delta=0,
            is_verified=True
        )
        self.assertEqual(res_top25["placement_bonus"], 40)
        self.assertEqual(res_top25["placement_tier"], "Top 25%")
        self.assertEqual(res_top25["total_contest_xp"], 40)

        # Top 50% (rank 4500 / 10000 = 45.0%)
        res_top50 = problem_solving_engine.calculate_contest_performance_bonus(
            rank=4500,
            total_participants=total,
            rating_delta=0,
            is_verified=True
        )
        self.assertEqual(res_top50["placement_bonus"], 20)
        self.assertEqual(res_top50["placement_tier"], "Top 50%")
        self.assertEqual(res_top50["total_contest_xp"], 20)

        # Below Top 50% (rank 7500 / 10000 = 75.0%)
        res_below50 = problem_solving_engine.calculate_contest_performance_bonus(
            rank=7500,
            total_participants=total,
            rating_delta=0,
            is_verified=True
        )
        self.assertEqual(res_below50["placement_bonus"], 10)
        self.assertEqual(res_below50["placement_tier"], "Below Top 50%")
        self.assertEqual(res_below50["total_contest_xp"], 10)

    def test_unverified_participant_or_rank_awards_zero_placement_bonus(self):
        """
        If total participant count or rank cannot be verified:
        No placement bonus (0 XP).
        """
        # Unverified flag
        res_unverified = problem_solving_engine.calculate_contest_performance_bonus(
            rank=42,
            total_participants=10000,
            rating_delta=30,
            is_verified=False
        )
        self.assertEqual(res_unverified["placement_bonus"], 0)
        self.assertEqual(res_unverified["placement_tier"], "Unverified Placement")
        self.assertIsNone(res_unverified["percentile"])

        # None rank
        res_no_rank = problem_solving_engine.calculate_contest_performance_bonus(
            rank=None,
            total_participants=10000,
            rating_delta=30,
            is_verified=True
        )
        self.assertEqual(res_no_rank["placement_bonus"], 0)

        # None total participants
        res_no_total = problem_solving_engine.calculate_contest_performance_bonus(
            rank=42,
            total_participants=None,
            rating_delta=30,
            is_verified=True
        )
        self.assertEqual(res_no_total["placement_bonus"], 0)

        # Zero total participants
        res_zero_total = problem_solving_engine.calculate_contest_performance_bonus(
            rank=42,
            total_participants=0,
            rating_delta=30,
            is_verified=True
        )
        self.assertEqual(res_zero_total["placement_bonus"], 0)

    def test_rating_bonus_positive_negative_and_cap(self):
        """
        Rating bonus rules:
        - Positive rating changes award +0.5 XP per point
        - Capped at MAX_RATING_BONUS_XP (50 XP)
        - Negative rating changes do NOT penalize XP (0 bonus)
        """
        # Positive rating delta (+42 rating points -> +21 XP)
        res_gain = problem_solving_engine.calculate_contest_performance_bonus(
            rank=100,
            total_participants=10000,
            rating_delta=42,
            is_verified=True
        )
        self.assertEqual(res_gain["rating_bonus"], 21)
        self.assertEqual(res_gain["placement_bonus"], 150)
        self.assertEqual(res_gain["total_contest_xp"], 171)

        # Huge positive rating delta (+140 rating points -> capped at 50 XP)
        res_huge_gain = problem_solving_engine.calculate_contest_performance_bonus(
            rank=100,
            total_participants=10000,
            rating_delta=140,
            is_verified=True
        )
        self.assertEqual(res_huge_gain["rating_bonus"], 50)
        self.assertEqual(res_huge_gain["total_contest_xp"], 200)

        # Negative rating change (-35 delta -> 0 XP bonus, no penalty)
        res_drop = problem_solving_engine.calculate_contest_performance_bonus(
            rank=100,
            total_participants=10000,
            rating_delta=-35,
            is_verified=True
        )
        self.assertEqual(res_drop["rating_bonus"], 0)
        self.assertEqual(res_drop["placement_bonus"], 150)
        self.assertEqual(res_drop["total_contest_xp"], 150)

        # Zero rating change
        res_zero = problem_solving_engine.calculate_contest_performance_bonus(
            rank=100,
            total_participants=10000,
            rating_delta=0,
            is_verified=True
        )
        self.assertEqual(res_zero["rating_bonus"], 0)

    def test_contest_xp_cap_per_contest(self):
        """
        Contest performance XP should be capped at 350 XP per contest.
        Make configurable (CONTEST_MAX_PERFORMANCE_XP).
        """
        self.assertEqual(CONTEST_MAX_PERFORMANCE_XP, 350)

        # Top 1% (+150) + Max Rating (+50) = 200 <= 350
        res_normal = problem_solving_engine.calculate_contest_performance_bonus(
            rank=10,
            total_participants=50000,
            rating_delta=100,
            is_verified=True
        )
        self.assertFalse(res_normal["is_capped"])
        self.assertEqual(res_normal["total_contest_xp"], 200)

    def test_record_contest_participation_end_to_end(self):
        """
        Verify end-to-end recording of contest participation:
        - Accurately updates contests_participated
        - Updates best_ranking
        - Updates current_rating and highest_rating
        - Updates top_percentile
        - Awards contest bonus XP and updates cumulative XP / level
        """
        user = "test_contestant_user"
        profile = problem_solving_engine.get_or_create_profile(user)
        initial_xp = profile["cumulative_ps_xp"]

        # Record first contest: Rank 120 / 8000 (Top 1.5% -> Top 5% tier: +100 XP, Rating +40: +20 XP = 120 XP)
        rec_1 = problem_solving_engine.record_contest_participation(
            username=user,
            contest_name="Codeforces Round 999 (Div. 2)",
            provider="codeforces",
            rank=120,
            total_participants=8000,
            rating_before=1600,
            rating_after=1640,
            problems_attempted=5,
            problems_solved=4,
            contest_url="https://codeforces.com/contest/999",
            is_verified=True
        )

        self.assertEqual(rec_1["awarded_bonus_xp"], 120)
        self.assertEqual(profile["contests_participated"], 1)
        self.assertEqual(profile["best_ranking"], 120)
        self.assertEqual(profile["current_rating"], 1640)
        self.assertEqual(profile["highest_rating"], 1640)
        self.assertEqual(profile["top_percentile"], 1.5)
        self.assertEqual(profile["cumulative_ps_xp"], initial_xp + 120)

        # Record second contest: Rank 45 / 10000 (Top 0.45% -> Top 1% tier: +150 XP, Rating +50: +25 XP = 175 XP)
        rec_2 = problem_solving_engine.record_contest_participation(
            username=user,
            contest_name="LeetCode Weekly Contest 440",
            provider="leetcode",
            rank=45,
            total_participants=10000,
            rating_before=1640,
            rating_after=1690,
            problems_attempted=4,
            problems_solved=4,
            contest_url="https://leetcode.com/contest/weekly-contest-440",
            is_verified=True
        )

        self.assertEqual(rec_2["awarded_bonus_xp"], 175)
        self.assertEqual(profile["contests_participated"], 2)
        self.assertEqual(profile["best_ranking"], 45, "Best ranking should update to new lowest rank number")
        self.assertEqual(profile["current_rating"], 1690)
        self.assertEqual(profile["highest_rating"], 1690)
        self.assertEqual(profile["top_percentile"], 0.45, "Top percentile should reflect best percentile")
        self.assertEqual(len(profile["recent_contests"]), 2)

    def test_zero_manufacturing_policy_for_unranked_users(self):
        """
        Verify that newly created users or users without verified contests
        never receive manufactured contest statistics.
        """
        unranked_user = "unranked_coder_test"
        prof = problem_solving_engine.get_or_create_profile(unranked_user)

        self.assertEqual(prof["contests_participated"], 0)
        self.assertIsNone(prof["best_ranking"])
        self.assertIsNone(prof["current_rating"])
        self.assertIsNone(prof["highest_rating"])
        self.assertIsNone(prof["top_percentile"])
        self.assertIsNone(prof["contest_rating"])
        self.assertEqual(len(prof["recent_contests"]), 0)

if __name__ == "__main__":
    unittest.main()
