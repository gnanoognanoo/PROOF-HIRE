import unittest
from app.services.assessment_engine import assessment_engine
from app.services.interview_service import interview_service

class TestAssessmentsAndInterviews(unittest.TestCase):

    def test_recruiter_create_assessments_all_three_types(self):
        """
        Verify recruiters can create:
        1. Aptitude Test
        2. Technical MCQ
        3. Custom Assessment
        With fields: Title, Job, Duration, Passing score, Questions (Single-choice, Multiple-choice, Short answer).
        """
        # 1. Aptitude Test
        apt = assessment_engine.create_assessment(
            title="Spatial & Numerical Aptitude Evaluation",
            assessment_type="Aptitude Test",
            job_title="Associate Infrastructure Engineer",
            duration_minutes=30,
            passing_score_pct=70,
            questions=[
                {
                    "question_text": "If 4 servers handle 1,200 req/s, how many servers handle 3,600 req/s?",
                    "question_type": "single_choice",
                    "options": ["8", "12", "16", "24"],
                    "correct_answers": ["12"],
                    "points": 10
                }
            ]
        )
        self.assertEqual(apt["assessment_type"], "Aptitude Test")
        self.assertEqual(apt["duration_minutes"], 30)
        self.assertEqual(apt["passing_score_pct"], 70)
        self.assertEqual(len(apt["questions"]), 1)

        # 2. Technical MCQ
        mcq = assessment_engine.create_assessment(
            title="TypeScript Compiler AST Mastery",
            assessment_type="Technical MCQ",
            job_title="Staff Frontend Engineer",
            duration_minutes=45,
            passing_score_pct=80,
            questions=[
                {
                    "question_text": "Which AST node represents a function declaration?",
                    "question_type": "single_choice",
                    "options": ["FunctionDeclaration", "VariableStatement", "Identifier"],
                    "correct_answers": ["FunctionDeclaration"],
                    "points": 10
                },
                {
                    "question_text": "Select all immutable JavaScript primitives:",
                    "question_type": "multiple_choice",
                    "options": ["string", "number", "symbol", "object"],
                    "correct_answers": ["string", "number", "symbol"],
                    "points": 10
                }
            ]
        )
        self.assertEqual(mcq["assessment_type"], "Technical MCQ")
        self.assertEqual(len(mcq["questions"]), 2)

        # 3. Custom Assessment
        custom = assessment_engine.create_assessment(
            title="Distributed Raft Leader Election Invariants",
            assessment_type="Custom Assessment",
            job_title="Principal Systems Engineer",
            duration_minutes=60,
            passing_score_pct=85,
            questions=[
                {
                    "question_text": "Describe how Pre-Vote phase prevents disruptive elections in Raft partitions:",
                    "question_type": "short_answer",
                    "options": [],
                    "correct_answers": ["quorum", "lease", "term"],
                    "points": 20
                }
            ]
        )
        self.assertEqual(custom["assessment_type"], "Custom Assessment")
        self.assertEqual(custom["questions"][0]["question_type"], "short_answer")

    def test_automated_objective_scoring(self):
        """
        Verify automatic scoring of objective questions (single-choice and multiple-choice)
        and computation of Score, Percentage, Status (PASSED/FAILED), and Completion time.
        """
        assessment = assessment_engine.create_assessment(
            title="Auto-Scoring Test Assessment",
            assessment_type="Technical MCQ",
            job_title="Core Engineer",
            duration_minutes=20,
            passing_score_pct=75,
            questions=[
                {
                    "id": "q1",
                    "question_text": "What is 2 + 2?",
                    "question_type": "single_choice",
                    "options": ["3", "4", "5"],
                    "correct_answers": ["4"],
                    "points": 10
                },
                {
                    "id": "q2",
                    "question_text": "Select primes:",
                    "question_type": "multiple_choice",
                    "options": ["2", "3", "4", "5"],
                    "correct_answers": ["2", "3", "5"],
                    "points": 10
                }
            ]
        )

        # Candidate submits 100% correct answers
        sub_passed = assessment_engine.score_submission(
            assessment_id=assessment["id"],
            candidate_username="alexchen",
            candidate_name="Alex Chen",
            candidate_avatar="https://avatars.githubusercontent.com/u/1024025?v=4",
            answers={"q1": ["4"], "q2": ["2", "3", "5"]},
            completion_time_seconds=340 # 5m 40s
        )

        self.assertEqual(sub_passed["score"], 20)
        self.assertEqual(sub_passed["total_points"], 20)
        self.assertEqual(sub_passed["percentage"], 100.0)
        self.assertEqual(sub_passed["status"], "PASSED")
        self.assertEqual(sub_passed["completion_time_formatted"], "5m 40s")

        # Candidate submits wrong answers
        sub_failed = assessment_engine.score_submission(
            assessment_id=assessment["id"],
            candidate_username="otherdev",
            candidate_name="Other Dev",
            candidate_avatar="",
            answers={"q1": ["3"], "q2": ["4"]},
            completion_time_seconds=610
        )
        self.assertEqual(sub_failed["score"], 0)
        self.assertEqual(sub_failed["percentage"], 0.0)
        self.assertEqual(sub_failed["status"], "FAILED")

    def test_do_not_show_correct_answers_unless_recruiter_enables(self):
        """
        Verify that candidate result does NOT display correct answers
        unless recruiter explicitly enables it.
        """
        assessment = assessment_engine.create_assessment(
            title="Confidential Answers Exam",
            assessment_type="Technical MCQ",
            job_title="Security Lead",
            duration_minutes=30,
            passing_score_pct=80,
            show_correct_answers=False,
            questions=[
                {
                    "id": "q_secret",
                    "question_text": "What is the AES block size?",
                    "question_type": "single_choice",
                    "options": ["64 bits", "128 bits", "256 bits"],
                    "correct_answers": ["128 bits"],
                    "explanation": "AES always specifies a block size of 128 bits regardless of key length.",
                    "points": 10
                }
            ]
        )

        sub = assessment_engine.score_submission(
            assessment_id=assessment["id"],
            candidate_username="alexchen",
            candidate_name="Alex Chen",
            candidate_avatar="",
            answers={"q_secret": ["128 bits"]},
            completion_time_seconds=120
        )

        # 1. Candidate view when show_correct_answers is False
        cand_result = assessment_engine.get_submission_result(sub["id"], is_candidate=True)
        self.assertFalse(cand_result["show_correct_answers"])
        q0 = cand_result["scored_questions"][0]
        self.assertIsNone(q0["correct_answers"])
        self.assertIsNone(q0["explanation"])

        # 2. Recruiter toggles show_correct_answers to True
        assessment_engine.toggle_show_correct_answers(assessment["id"])

        # 3. Candidate view now reveals correct answers
        cand_result_unlocked = assessment_engine.get_submission_result(sub["id"], is_candidate=True)
        self.assertTrue(cand_result_unlocked["show_correct_answers"])
        q0_unlocked = cand_result_unlocked["scored_questions"][0]
        self.assertEqual(q0_unlocked["correct_answers"], ["128 bits"])
        self.assertIn("AES always specifies", q0_unlocked["explanation"])

    def test_interview_invitation_and_jitsi_generation(self):
        """
        Verify:
        1. Recruiter invites candidate to interview with: Candidate, Job, Date, Time, Duration, Message.
        2. Jitsi Meet room is generated and stored.
        3. Candidate notification contains 'Interview invitation from Acme Technologies'.
        4. Candidate can Accept or Decline.
        5. Recruiter dashboard shows upcoming interviews.
        """
        res = interview_service.invite_to_interview(
            candidate_username="alexchen",
            candidate_name="Alex Chen",
            job_title="Staff Frontend & Compiler Architect",
            date="2024-11-25",
            time="2:00 PM PST",
            duration="45 minutes",
            message="We loved your ProofHire compiler benchmark score.",
            company="Acme Technologies"
        )

        self.assertIn("interview", res)
        interview = res["interview"]
        self.assertEqual(interview["candidate_username"], "alexchen")
        self.assertEqual(interview["job_title"], "Staff Frontend & Compiler Architect")
        self.assertEqual(interview["duration"], "45 minutes")
        self.assertEqual(interview["status"], "PENDING")

        # Verify Jitsi Meet room generation
        self.assertTrue(interview["jitsi_url"].startswith("https://meet.jit.si/proofhire-acme-"))
        self.assertIn("alexchen", interview["jitsi_url"])

        # Verify candidate notification
        notifs = interview_service.get_candidate_notifications("alexchen")
        self.assertGreaterEqual(len(notifs), 1)
        latest_notif = notifs[0]
        self.assertEqual(latest_notif["title"], "Interview invitation from Acme Technologies")
        self.assertEqual(latest_notif["job_title"], "Staff Frontend & Compiler Architect")

        # Candidate accepts interview
        accept_res = interview_service.respond_to_interview(
            interview_id=interview["id"],
            candidate_username="alexchen",
            action="ACCEPT"
        )
        self.assertEqual(accept_res["status"], "ACCEPTED")

        # Recruiter upcoming interviews includes this interview
        upcoming = interview_service.get_upcoming_interviews()
        interview_ids = [i["id"] for i in upcoming]
        self.assertIn(interview["id"], interview_ids)

        # Test Decline on a new interview
        res_dec = interview_service.invite_to_interview(
            candidate_username="dev2",
            candidate_name="Dev Two",
            job_title="Backend Lead",
            date="2024-11-26",
            time="11:00 AM PST",
            duration="30 minutes",
            message="Initial sync"
        )
        dec_interview_id = res_dec["interview"]["id"]
        dec_res = interview_service.respond_to_interview(
            interview_id=dec_interview_id,
            candidate_username="dev2",
            action="DECLINE"
        )
        self.assertEqual(dec_res["status"], "DECLINED")
