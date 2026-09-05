import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class AssessmentEngine:
    """
    Core engine for recruiter assessment creation, objective question auto-scoring,
    answer confidentiality enforcement, and candidate submission tracking.
    """

    def __init__(self):
        # In-memory store of recruiter assessments
        self.assessments: List[Dict[str, Any]] = [
            {
                "id": "as_tech_mcq_react",
                "title": "React 19 & TypeScript Production Architecture MCQ",
                "assessment_type": "Technical MCQ",
                "job_title": "Staff Frontend & Compiler Architect",
                "company": "Acme Technologies",
                "duration_minutes": 45,
                "passing_score_pct": 80,
                "show_correct_answers": False,
                "instructions": "This assessment evaluates your proficiency with React 19 Server Components, memoization boundaries, and TypeScript compiler AST type checks. Complete all questions within the 45-minute countdown.",
                "created_at": "2024-11-10T10:00:00Z",
                "questions": [
                    {
                        "id": "q1",
                        "question_text": "Which React 19 hook allows you to handle form actions with automatic pending states and optimistic updates?",
                        "question_type": "single_choice",
                        "options": ["useOptimistic", "useActionState", "useTransition", "useFormStatus"],
                        "correct_answers": ["useActionState"],
                        "explanation": "useActionState accepts an action handler and returns [state, formAction, isPending], handling both optimistic updates and pending transitions.",
                        "points": 10
                    },
                    {
                        "id": "q2",
                        "question_text": "Select all statements that correctly describe React Server Components (RSC):",
                        "question_type": "multiple_choice",
                        "options": [
                            "Server Components execute only on the server and zero bundle bytes are shipped to the client",
                            "Server Components can directly utilize useState and useEffect hooks",
                            "Server Components can access backend resources like databases and file systems directly",
                            "Server Components stream HTML and serialization payloads progressively to the browser"
                        ],
                        "correct_answers": [
                            "Server Components execute only on the server and zero bundle bytes are shipped to the client",
                            "Server Components can access backend resources like databases and file systems directly",
                            "Server Components stream HTML and serialization payloads progressively to the browser"
                        ],
                        "explanation": "RSCs cannot use useState or useEffect; those are strictly client-side hooks requiring 'use client'.",
                        "points": 10
                    },
                    {
                        "id": "q3",
                        "question_text": "What is the primary benefit of TypeScript's `satisfies` operator over type annotation `as` or standard declaration `:`?",
                        "question_type": "short_answer",
                        "options": [],
                        "correct_answers": ["type inference", "preserves literal types", "catches excess properties"],
                        "explanation": "The satisfies operator validates that an expression matches a type while preserving the most specific literal type inferred for each property.",
                        "points": 10
                    },
                    {
                        "id": "q4",
                        "question_text": "In a distributed Next.js edge deployment, what cache header is recommended for stale-while-revalidate caching?",
                        "question_type": "single_choice",
                        "options": [
                            "Cache-Control: public, s-maxage=60, stale-while-revalidate=300",
                            "Pragma: no-cache",
                            "Cache-Control: private, max-age=0",
                            "Age: 3600"
                        ],
                        "correct_answers": ["Cache-Control: public, s-maxage=60, stale-while-revalidate=300"],
                        "explanation": "s-maxage dictates CDN edge freshness while stale-while-revalidate enables non-blocking background revalidation.",
                        "points": 10
                    }
                ]
            },
            {
                "id": "as_aptitude_logic",
                "title": "Engineering Logic & Algorithmic Deductions",
                "assessment_type": "Aptitude Test",
                "job_title": "Senior Distributed Systems Engineer",
                "company": "Acme Technologies",
                "duration_minutes": 30,
                "passing_score_pct": 75,
                "show_correct_answers": False,
                "instructions": "Logical deduction, invariant reasoning, and computational throughput puzzles. Calculator allowed. Answer all items before the timer expires.",
                "created_at": "2024-11-12T14:30:00Z",
                "questions": [
                    {
                        "id": "q1_apt",
                        "question_text": "In a cluster of 5 nodes with Paxos consensus, what is the minimum quorum size required to guarantee linearizability across network partitions?",
                        "question_type": "single_choice",
                        "options": ["2 nodes", "3 nodes", "4 nodes", "5 nodes"],
                        "correct_answers": ["3 nodes"],
                        "explanation": "Majority quorum requires floor(N/2) + 1. For N=5, quorum is 3.",
                        "points": 10
                    },
                    {
                        "id": "q2_apt",
                        "question_text": "A network link has 10Gbps bandwidth and 20ms RTT. What is the Bandwidth-Delay Product (BDP) in Megabytes?",
                        "question_type": "single_choice",
                        "options": ["12.5 MB", "25 MB", "50 MB", "200 MB"],
                        "correct_answers": ["25 MB"],
                        "explanation": "BDP = 10,000,000,000 bps * 0.02s = 200,000,000 bits = 25,000,000 Bytes = 25 MB.",
                        "points": 10
                    },
                    {
                        "id": "q3_apt",
                        "question_text": "Select all conditions necessary for a deadlock to occur in concurrent thread scheduling:",
                        "question_type": "multiple_choice",
                        "options": [
                            "Mutual Exclusion",
                            "Hold and Wait",
                            "No Preemption",
                            "Circular Wait"
                        ],
                        "correct_answers": [
                            "Mutual Exclusion",
                            "Hold and Wait",
                            "No Preemption",
                            "Circular Wait"
                        ],
                        "explanation": "The Coffman conditions require all 4 conditions simultaneously for deadlock.",
                        "points": 10
                    }
                ]
            },
            {
                "id": "as_custom_systems",
                "title": "Linux eBPF & Kernel Socket Benchmark",
                "assessment_type": "Custom Assessment",
                "job_title": "Core Infrastructure Lead",
                "company": "Acme Technologies",
                "duration_minutes": 60,
                "passing_score_pct": 85,
                "show_correct_answers": False,
                "instructions": "Low-level system verification testing kernel probe safety, ring buffer zero-copy reads, and verifier bounds enforcement.",
                "created_at": "2024-11-14T09:00:00Z",
                "questions": [
                    {
                        "id": "q1_ebpf",
                        "question_text": "Why does the Linux eBPF verifier reject pointer arithmetic on BPF_PROG_TYPE_SOCKET_FILTER context pointers?",
                        "question_type": "single_choice",
                        "options": [
                            "To prevent arbitrary memory offsets from dereferencing unmapped kernel space",
                            "Because sockets do not use byte buffers",
                            "eBPF does not permit any pointer access",
                            "Due to x86 register starvation"
                        ],
                        "correct_answers": ["To prevent arbitrary memory offsets from dereferencing unmapped kernel space"],
                        "explanation": "The verifier checks pointer bounds to ensure eBPF programs cannot compromise kernel stability.",
                        "points": 10
                    }
                ]
            }
        ]

        # In-memory candidate submissions
        self.submissions: List[Dict[str, Any]] = [
            {
                "id": "sub_gnaneshwar_1",
                "assessment_id": "as_tech_mcq_react",
                "candidate_username": "gnaneshwar",
                "candidate_name": "GNANESHWAR R",
                "candidate_avatar": "https://avatars.githubusercontent.com/u/7891234?v=4",
                "score": 36,
                "total_points": 40,
                "percentage": 90.0,
                "status": "PASSED",
                "completion_time_seconds": 2100,
                "completion_time_formatted": "35m 00s",
                "submitted_at": "2024-11-20T11:15:00Z",
                "answers": {
                    "q1": ["useActionState"],
                    "q2": [
                        "Server Components execute only on the server and zero bundle bytes are shipped to the client",
                        "Server Components can access backend resources like databases and file systems directly",
                        "Server Components stream HTML and serialization payloads progressively to the browser"
                    ],
                    "q3": "type inference and preserves literal types without widening",
                    "q4": ["Cache-Control: public, s-maxage=60, stale-while-revalidate=300"]
                }
            },
            {
                "id": "sub_alex_1",
                "assessment_id": "as_tech_mcq_react",
                "candidate_username": "alexchen",
                "candidate_name": "Alex Chen",
                "candidate_avatar": "https://avatars.githubusercontent.com/u/1024025?v=4",
                "score": 38,
                "total_points": 40,
                "percentage": 95.0,
                "status": "PASSED",
                "completion_time_seconds": 1840,
                "completion_time_formatted": "30m 40s",
                "submitted_at": "2024-11-19T14:20:00Z",
                "answers": {
                    "q1": ["useActionState"],
                    "q2": [
                        "Server Components execute only on the server and zero bundle bytes are shipped to the client",
                        "Server Components can access backend resources like databases and file systems directly",
                        "Server Components stream HTML and serialization payloads progressively to the browser"
                    ],
                    "q3": "Preserves literal types while enforcing type inference boundaries and catching excess properties",
                    "q4": ["Cache-Control: public, s-maxage=60, stale-while-revalidate=300"]
                }
            },
            {
                "id": "sub_elena_1",
                "assessment_id": "as_custom_systems",
                "candidate_username": "erostova",
                "candidate_name": "Elena Rostova",
                "candidate_avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
                "score": 10,
                "total_points": 10,
                "percentage": 100.0,
                "status": "PASSED",
                "completion_time_seconds": 1320,
                "completion_time_formatted": "22m 00s",
                "submitted_at": "2024-11-19T16:45:00Z",
                "answers": {
                    "q1_ebpf": ["To prevent arbitrary memory offsets from dereferencing unmapped kernel space"]
                }
            }
        ]

    # -------------------------------------------------------------
    # Recruiter Assessment Creation
    # -------------------------------------------------------------
    def create_assessment(
        self,
        title: str,
        assessment_type: str,
        job_title: str,
        duration_minutes: int,
        passing_score_pct: int,
        questions: List[Dict[str, Any]],
        instructions: Optional[str] = None,
        company: str = "Acme Technologies",
        show_correct_answers: bool = False
    ) -> Dict[str, Any]:
        """Creates and stores a recruiter assessment."""
        new_id = f"as_{assessment_type.lower().replace(' ', '_')[:4]}_{uuid.uuid4().hex[:6]}"
        
        # Format questions with IDs and normalized points
        formatted_questions = []
        for idx, q in enumerate(questions):
            q_id = q.get("id") or f"q_{idx+1}"
            formatted_questions.append({
                "id": q_id,
                "question_text": q["question_text"],
                "question_type": q.get("question_type", "single_choice"), # single_choice, multiple_choice, short_answer
                "options": q.get("options", []),
                "correct_answers": q.get("correct_answers", []),
                "explanation": q.get("explanation", ""),
                "points": int(q.get("points", 10))
            })

        new_assessment = {
            "id": new_id,
            "title": title,
            "assessment_type": assessment_type,
            "job_title": job_title,
            "company": company,
            "duration_minutes": duration_minutes,
            "passing_score_pct": passing_score_pct,
            "show_correct_answers": show_correct_answers,
            "instructions": instructions or f"Complete all questions within the allocated {duration_minutes} minutes.",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "questions": formatted_questions
        }

        self.assessments.insert(0, new_assessment)
        return new_assessment

    def list_assessments(self) -> List[Dict[str, Any]]:
        """Returns all recruiter assessments with submission counts."""
        result = []
        for a in self.assessments:
            item = dict(a)
            sub_count = len([s for s in self.submissions if s["assessment_id"] == a["id"]])
            item["submissions_count"] = sub_count
            result.append(item)
        return result

    def get_assessment(self, assessment_id: str, is_candidate_view: bool = False) -> Optional[Dict[str, Any]]:
        """Retrieves assessment. If candidate view and show_correct_answers is False, strips answers and explanations."""
        a = next((item for item in self.assessments if item["id"] == assessment_id), None)
        if not a:
            return None

        data = dict(a)
        if is_candidate_view and not a.get("show_correct_answers", False):
            # Strip correct_answers and explanation for test integrity
            censored_questions = []
            for q in a["questions"]:
                cq = dict(q)
                cq.pop("correct_answers", None)
                cq.pop("explanation", None)
                censored_questions.append(cq)
            data["questions"] = censored_questions

        return data

    def toggle_show_correct_answers(self, assessment_id: str) -> Dict[str, Any]:
        """Toggles whether candidates can view correct answers on their result page."""
        a = next((item for item in self.assessments if item["id"] == assessment_id), None)
        if not a:
            raise ValueError("Assessment not found")
        a["show_correct_answers"] = not a.get("show_correct_answers", False)
        return {"assessment_id": assessment_id, "show_correct_answers": a["show_correct_answers"]}

    # -------------------------------------------------------------
    # Candidate Assessment Submission & Automated Scoring
    # -------------------------------------------------------------
    def score_submission(
        self,
        assessment_id: str,
        candidate_username: str,
        candidate_name: str,
        candidate_avatar: str,
        answers: Dict[str, Any],
        completion_time_seconds: int
    ) -> Dict[str, Any]:
        """
        Automatically scores objective questions (single-choice and multiple-choice)
        and evaluates short-answer keywords/lengths.
        """
        assessment = next((a for a in self.assessments if a["id"] == assessment_id), None)
        if not assessment:
            raise ValueError(f"Assessment {assessment_id} not found")

        total_points = sum(q.get("points", 10) for q in assessment["questions"])
        earned_points = 0
        scored_questions = []

        for q in assessment["questions"]:
            q_id = q["id"]
            q_type = q.get("question_type", "single_choice")
            q_points = q.get("points", 10)
            correct = q.get("correct_answers", [])
            cand_ans = answers.get(q_id)

            is_correct = False
            points_awarded = 0

            if q_type == "single_choice":
                # Exact match
                ans_str = cand_ans[0] if isinstance(cand_ans, list) and cand_ans else str(cand_ans or "")
                if correct and ans_str.strip().lower() == correct[0].strip().lower():
                    is_correct = True
                    points_awarded = q_points

            elif q_type == "multiple_choice":
                # Exact set match or partial credit
                ans_list = cand_ans if isinstance(cand_ans, list) else [str(cand_ans)] if cand_ans else []
                correct_set = {c.strip().lower() for c in correct}
                cand_set = {str(a).strip().lower() for a in ans_list}

                if correct_set and cand_set == correct_set:
                    is_correct = True
                    points_awarded = q_points
                elif correct_set:
                    # Partial credit: correct matches minus false positives
                    intersection = len(correct_set.intersection(cand_set))
                    false_pos = len(cand_set - correct_set)
                    ratio = max(0.0, (intersection - false_pos) / len(correct_set))
                    points_awarded = int(round(ratio * q_points))
                    if ratio >= 0.7:
                        is_correct = True

            elif q_type == "short_answer":
                # Keyword density and length validation
                ans_text = str(cand_ans or "").strip().lower()
                if ans_text and len(ans_text) >= 10:
                    matched_keywords = sum(1 for kw in correct if kw.lower() in ans_text)
                    if matched_keywords > 0 or len(ans_text) > 30:
                        is_correct = True
                        points_awarded = q_points
                    else:
                        points_awarded = int(q_points * 0.5)

            earned_points += points_awarded
            scored_questions.append({
                "question_id": q_id,
                "question_text": q["question_text"],
                "question_type": q_type,
                "candidate_answer": cand_ans,
                "is_correct": is_correct,
                "points_awarded": points_awarded,
                "max_points": q_points,
                "correct_answers": correct,
                "explanation": q.get("explanation", "")
            })

        percentage = round((earned_points / max(1, total_points)) * 100.0, 1)
        passed = percentage >= assessment["passing_score_pct"]
        status = "PASSED" if passed else "FAILED"

        minutes = completion_time_seconds // 60
        seconds = completion_time_seconds % 60
        completion_time_formatted = f"{minutes}m {seconds:02d}s"

        sub_id = f"sub_{uuid.uuid4().hex[:8]}"
        submission_record = {
            "id": sub_id,
            "assessment_id": assessment_id,
            "assessment_title": assessment["title"],
            "assessment_type": assessment["assessment_type"],
            "company": assessment["company"],
            "job_title": assessment["job_title"],
            "passing_score_pct": assessment["passing_score_pct"],
            "candidate_username": candidate_username,
            "candidate_name": candidate_name,
            "candidate_avatar": candidate_avatar,
            "score": earned_points,
            "total_points": total_points,
            "percentage": percentage,
            "status": status,
            "completion_time_seconds": completion_time_seconds,
            "completion_time_formatted": completion_time_formatted,
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "answers": answers,
            "scored_questions": scored_questions,
            "show_correct_answers": assessment.get("show_correct_answers", False)
        }

        self.submissions.insert(0, submission_record)
        return submission_record

    def get_submission_result(self, submission_id: str, is_candidate: bool = True) -> Optional[Dict[str, Any]]:
        """Retrieves submission result with answer privacy enforced for candidates."""
        sub = next((s for s in self.submissions if s["id"] == submission_id), None)
        if not sub:
            return None

        assessment = next((a for a in self.assessments if a["id"] == sub["assessment_id"]), None)
        show_answers = assessment.get("show_correct_answers", False) if assessment else False

        data = dict(sub)
        data["show_correct_answers"] = show_answers

        if is_candidate and not show_answers:
            # Mask correct_answers and explanations from scored_questions
            masked_questions = []
            for q in sub.get("scored_questions", []):
                mq = dict(q)
                mq["correct_answers"] = None
                mq["explanation"] = None
                masked_questions.append(mq)
            data["scored_questions"] = masked_questions

        return data

    def get_assessment_submissions(self, assessment_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns recruiter view of submissions with candidate details, scores, and completion time."""
        if assessment_id:
            return [s for s in self.submissions if s["assessment_id"] == assessment_id]
        return list(self.submissions)

assessment_engine = AssessmentEngine()
