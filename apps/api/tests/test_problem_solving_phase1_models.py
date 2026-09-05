import unittest
from datetime import datetime
import os
from pydantic import ValidationError
from app.models.problem_solving import (
    CodingProvider,
    ConnectionMethod,
    ConnectionVerificationStatus,
    NormalizedDifficulty,
    SolveStatus,
    SolveVerificationStatus,
    XpSourceType,
    ProblemSolvingConnectionSchema,
    ProblemCatalogSchema,
    ProblemSolveEventSchema,
    CodingContestSchema,
    ContestParticipationSchema,
    UserProblemTopicSchema,
    ProblemSolvingProfileSummarySchema,
    XpTransactionSchema
)

class TestProblemSolvingPhase1Models(unittest.TestCase):

    def test_platform_connection_schema(self):
        """Test valid and invalid platform connection schemas."""
        conn = ProblemSolvingConnectionSchema(
            id="conn-123",
            user_id="user-456",
            provider=CodingProvider.LEETCODE,
            username="testuser",
            connection_method=ConnectionMethod.PUBLIC_API,
            verification_status=ConnectionVerificationStatus.VERIFIED,
            metadata_json={"reputation_badges": ["Knight"]}
        )
        self.assertEqual(conn.provider, "leetcode")
        self.assertEqual(conn.verification_status, "verified")

        # Invalid provider should raise ValidationError
        with self.assertRaises(ValidationError):
            ProblemSolvingConnectionSchema(
                id="conn-123",
                user_id="user-456",
                provider="unsupported_platform",
                username="testuser",
                connection_method="oauth"
            )

    def test_problem_catalog_schema(self):
        """Test problem catalog normalization."""
        problem = ProblemCatalogSchema(
            id="prob-1",
            provider=CodingProvider.CODEFORCES,
            external_problem_id="158A",
            title="Next Round",
            difficulty_normalized=NormalizedDifficulty.EASY,
            topics=["implementation", "arrays"]
        )
        self.assertEqual(problem.difficulty_normalized, "EASY")
        self.assertIn("implementation", problem.topics)

    def test_problem_solve_event_idempotency_fields(self):
        """Test solve event with confidence bounds and XP award state."""
        event = ProblemSolveEventSchema(
            id="solve-101",
            user_id="user-456",
            problem_id="prob-1",
            submission_id="sub-9999",
            status=SolveStatus.ACCEPTED,
            verification_status=SolveVerificationStatus.PROVIDER_VERIFIED,
            verification_confidence=0.95,
            quality_score=92.5,
            base_xp=25,
            skill_xp=30,
            overall_xp=30,
            xp_awarded=True
        )
        self.assertTrue(event.xp_awarded)
        self.assertEqual(event.verification_confidence, 0.95)

        # Out-of-range confidence must fail
        with self.assertRaises(ValidationError):
            ProblemSolveEventSchema(
                id="solve-bad",
                user_id="user-456",
                problem_id="prob-1",
                status=SolveStatus.ACCEPTED,
                verification_confidence=1.5
            )

    def test_contest_participation_schema(self):
        """Test contest participation tracking."""
        part = ContestParticipationSchema(
            id="part-1",
            user_id="user-456",
            contest_id="contest-789",
            rank=42,
            total_participants=10000,
            percentile=99.58,
            rating_before=1650,
            rating_after=1720,
            rating_delta=70,
            problems_attempted=4,
            problems_solved=4,
            xp_awarded=True,
            verification_status=SolveVerificationStatus.PROVIDER_VERIFIED
        )
        self.assertEqual(part.rank, 42)
        self.assertEqual(part.rating_delta, 70)

    def test_user_problem_topic_schema(self):
        """Test user problem topic metrics."""
        topic = UserProblemTopicSchema(
            id="upt-1",
            user_id="user-456",
            topic="Dynamic Programming",
            verified_solved_count=35,
            medium_count=20,
            hard_count=15,
            topic_xp=1150,
            topic_level=20,
            topic_score=88.5
        )
        self.assertEqual(topic.topic, "Dynamic Programming")
        self.assertEqual(topic.topic_level, 20)

    def test_problem_solving_profile_summary_schema(self):
        """Test problem-solving profile summary schema."""
        summary = ProblemSolvingProfileSummarySchema(
            user_id="user-456",
            verified_solved_count=150,
            easy_solved=50,
            medium_solved=80,
            hard_solved=20,
            problem_solving_xp=2800,
            problem_solving_level=31,
            problem_solving_score=89.5,
            contest_score=92.0,
            consistency_score=95.0,
            breadth_score=86.0,
            active_weeks_last_12=11
        )
        self.assertEqual(summary.problem_solving_level, 31)
        self.assertEqual(summary.active_weeks_last_12, 11)

    def test_xp_transaction_ledger_schema(self):
        """Test immutable idempotent XP transaction model."""
        tx = XpTransactionSchema(
            id="tx-1001",
            user_id="user-456",
            source_type=XpSourceType.PROBLEM_SOLVE,
            source_id="sub-9999",
            category="algorithms",
            base_xp=25,
            modifier_json={"verification_multiplier": 1.20, "streak_multiplier": 1.05},
            final_xp=31,
            verification_status="verified"
        )
        self.assertEqual(tx.source_type, "problem_solve")
        self.assertEqual(tx.final_xp, 31)
        self.assertEqual(tx.category, "algorithms")

    def test_migration_file_exists_and_contains_all_tables(self):
        """Ensure migration 20250104_problem_solving_phase1.sql contains all required tables and constraints."""
        migration_path = os.path.join(
            os.path.dirname(__file__),
            "..", "..", "..", "supabase", "migrations", "20250104_problem_solving_phase1.sql"
        )
        self.assertTrue(os.path.exists(migration_path))
        with open(migration_path, "r", encoding="utf-8") as f:
            content = f.read()

        required_tables = [
            "problem_solving_connections",
            "problem_catalog",
            "problem_solve_events",
            "coding_contests",
            "contest_participations",
            "user_problem_topics",
            "problem_solving_profiles",
            "xp_transactions"
        ]
        for table in required_tables:
            self.assertIn(table, content)

        # Check critical idempotency constraints
        self.assertIn("uq_connection_user_provider_username", content)
        self.assertIn("uq_solve_event_submission", content)
        self.assertIn("uq_xp_transaction_idempotency", content)
        self.assertIn("ENABLE ROW LEVEL SECURITY", content)
