import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid

from app.services.problem_solving_engine import (
    problem_solving_engine,
    VerificationStrength,
    BASE_PROBLEM_XP,
    VERIFICATION_MODIFIERS,
    EXTERNAL_PLATFORM_OVERALL_RATIO
)
from app.services.reputation_engine import reputation_engine
from app.services.sync_service import problem_solving_sync_service

logger = logging.getLogger("proofhire.admin_problem_solving")


class AdminProblemSolvingService:
    """
    Service managing ProofHire Admin Problem-Solving Verification:
      - 5 Operational Queue Sections:
        1. Pending Imports
        2. Suspicious Activity
        3. Failed Verification
        4. Duplicate Detection
        5. Provider Sync Errors
      - 5 Administrative Actions:
        * View Evidence
        * Approve (Strictly triggers deterministic XP engine; Admin CANNOT type arbitrary XP)
        * Reject
        * Mark Duplicate
        * Request Additional Evidence
      - Complete, immutable audit logging with before/after state, reasoning, and deterministic payouts.
    """

    def __init__(self):
        self.queue_items: List[Dict[str, Any]] = []
        self.audit_records: List[Dict[str, Any]] = []
        self._seed_initial_queue()
        self._seed_initial_audits()

    def _seed_initial_queue(self):
        """Seeds realistic operational verification items across the 5 required sections."""
        self.queue_items = [
            # -------------------------------------------------------------
            # 1. PENDING IMPORTS
            # -------------------------------------------------------------
            {
                "id": "q_imp_001",
                "section": "pending_imports",
                "candidate_username": "sarah_lin",
                "provider": "skillrack",
                "problem_title": "Multi-Threaded Work-Stealing Queue Simulation",
                "problem_slug": "skillrack-multi-threaded-work-stealing-queue",
                "external_problem_id": "SR-9042",
                "difficulty": "HARD",
                "topics": ["Concurrency", "Data Structures", "Operating Systems"],
                "source_code": "import java.util.concurrent.ConcurrentLinkedDeque;\n\npublic class WorkStealingPool {\n    // Institutional SkillRack Code Export Verified by Department\n}",
                "source_code_hash": "sha256_e8293bc9f7831d45",
                "status": "PENDING_REVIEW",
                "severity": "MEDIUM",
                "evidence_json": {
                    "import_type": "institutional_csv_batch",
                    "institution_name": "PSG College of Technology",
                    "faculty_verifier": "Dr. R. Sundaram (CSE Dept)",
                    "external_profile_url": "https://skillrack.com/profile/sarah_lin_psg",
                    "execution_time_ms": 42.4,
                    "memory_kb": 14200.0,
                    "submitted_at": "2025-01-04T09:12:00Z"
                },
                "admin_notes": None,
                "reviewed_by": None,
                "reviewed_at": None,
                "created_at": "2025-01-04T10:00:00Z"
            },
            {
                "id": "q_imp_002",
                "section": "pending_imports",
                "candidate_username": "marcus_vance",
                "provider": "hackerrank",
                "problem_title": "Matrix Determinant via LU Decomposition",
                "problem_slug": "hackerrank-matrix-determinant-lu",
                "external_problem_id": "HR-MAT-441",
                "difficulty": "MEDIUM",
                "topics": ["Linear Algebra", "Algorithms"],
                "source_code": "def lu_decomposition(matrix, n):\n    # LU factorization implementation\n    pass",
                "source_code_hash": "sha256_44ab92d8f9108c92",
                "status": "PENDING_REVIEW",
                "severity": "LOW",
                "evidence_json": {
                    "import_type": "manual_import_with_certificate",
                    "certificate_url": "https://www.hackerrank.com/certificates/c782bfa910d",
                    "external_profile_url": "https://www.hackerrank.com/marcus_vance",
                    "submitted_at": "2025-01-03T14:20:00Z"
                },
                "admin_notes": None,
                "reviewed_by": None,
                "reviewed_at": None,
                "created_at": "2025-01-03T15:00:00Z"
            },
            {
                "id": "q_imp_003",
                "section": "pending_imports",
                "candidate_username": "priya_sharma",
                "provider": "geeksforgeeks",
                "problem_title": "Alien Dictionary Topological Sort",
                "problem_slug": "gfg-alien-dictionary-order",
                "external_problem_id": "GFG-7102",
                "difficulty": "HARD",
                "topics": ["Graphs", "Topological Sort", "Strings"],
                "source_code": "class Solution:\n    def findOrder(self, alien_dict, N, K):\n        adj = {i: set() for i in range(K)}\n        # Graph construction",
                "source_code_hash": "sha256_9934ca11204d88e1",
                "status": "PENDING_REVIEW",
                "severity": "MEDIUM",
                "evidence_json": {
                    "import_type": "browser_profile_sync",
                    "external_profile_url": "https://auth.geeksforgeeks.org/user/priya_sharma_99",
                    "submitted_at": "2025-01-04T11:45:00Z"
                },
                "admin_notes": None,
                "reviewed_by": None,
                "reviewed_at": None,
                "created_at": "2025-01-04T12:00:00Z"
            },

            # -------------------------------------------------------------
            # 2. SUSPICIOUS ACTIVITY
            # -------------------------------------------------------------
            {
                "id": "q_susp_001",
                "section": "suspicious_activity",
                "candidate_username": "dev_velocity_bot",
                "provider": "leetcode",
                "problem_title": "Trapping Rain Water II (3D Grid)",
                "problem_slug": "trapping-rain-water-ii",
                "external_problem_id": "LC-407",
                "difficulty": "HARD",
                "topics": ["Heap (Priority Queue)", "Breadth-First Search", "Matrix"],
                "source_code": "import heapq\nclass Solution:\n    def trapRainWater(self, heightMap):\n        # 3D trapping rain water\n        pass",
                "source_code_hash": "sha256_susp_9901844",
                "status": "PENDING_REVIEW",
                "severity": "CRITICAL",
                "evidence_json": {
                    "flag_reason": "SOLVE_VELOCITY_ANOMALY",
                    "details": "Candidate solved 8 Hard problems in 3 minutes 42 seconds. Human typing velocity physically impossible.",
                    "ip_address": "194.26.29.11",
                    "user_agent": "python-requests/2.31.0",
                    "submission_delta_seconds": 22.4,
                    "historical_solves_prior_24h": 46
                },
                "admin_notes": "Flagged by Automated Anomaly Heuristics (Rule #A9: Burst Velocity > 5 Hard/hr)",
                "reviewed_by": None,
                "reviewed_at": None,
                "created_at": "2025-01-04T08:15:00Z"
            },
            {
                "id": "q_susp_002",
                "section": "suspicious_activity",
                "candidate_username": "kavita_r",
                "provider": "codeforces",
                "problem_title": "Prefix-Suffix Palindrome (Hard version)",
                "problem_slug": "cf-1326-d2",
                "external_problem_id": "CF-1326D2",
                "difficulty": "EXPERT",
                "topics": ["String Algorithms", "KMP Algorithm", "Hashing"],
                "source_code": "#include <bits/stdc++.h>\nusing namespace std;\n// Identical AST pattern",
                "source_code_hash": "sha256_clone_a882001",
                "status": "PENDING_REVIEW",
                "severity": "HIGH",
                "evidence_json": {
                    "flag_reason": "CODE_COLLISION_ACROSS_CANDIDATES",
                    "details": "Submitted source code matches exact byte-for-byte SHA256 hash previously submitted by user 'tourist_clone_04'.",
                    "matched_user": "tourist_clone_04",
                    "similarity_score": 100.0,
                    "codeforces_submission_id": "CF-SUB-219488102"
                },
                "admin_notes": "Anti-Cheat Plagiarism Engine Match",
                "reviewed_by": None,
                "reviewed_at": None,
                "created_at": "2025-01-03T19:40:00Z"
            },

            # -------------------------------------------------------------
            # 3. FAILED VERIFICATION
            # -------------------------------------------------------------
            {
                "id": "q_fail_001",
                "section": "failed_verification",
                "candidate_username": "vikram_nair",
                "provider": "codeforces",
                "problem_title": "Profile Verification: Handle Not Found",
                "problem_slug": "cf-profile-vikram_cf_legend",
                "external_problem_id": "CF-USER-vikram_cf_legend",
                "difficulty": "UNKNOWN",
                "topics": ["Telemetry Sync"],
                "source_code": None,
                "source_code_hash": None,
                "status": "PENDING_REVIEW",
                "severity": "MEDIUM",
                "evidence_json": {
                    "failure_type": "HTTP_400_HANDLE_NOT_FOUND",
                    "claimed_handle": "vikram_cf_legend",
                    "endpoint_queried": "https://codeforces.com/api/user.info?handles=vikram_cf_legend",
                    "raw_response": "{\"status\":\"FAILED\",\"comment\":\"handles: User with handle vikram_cf_legend not found\"}",
                    "attempts": 3
                },
                "admin_notes": "Connection rejected by provider API. Candidate may have misspelled handle or changed username.",
                "reviewed_by": None,
                "reviewed_at": None,
                "created_at": "2025-01-04T07:30:00Z"
            },
            {
                "id": "q_fail_002",
                "section": "failed_verification",
                "candidate_username": "elena_rostova",
                "provider": "leetcode",
                "problem_title": "Profile Sync: Private Profile Restrictions",
                "problem_slug": "lc-profile-elena_dev",
                "external_problem_id": "LC-USER-elena_dev",
                "difficulty": "UNKNOWN",
                "topics": ["Telemetry Sync"],
                "source_code": None,
                "source_code_hash": None,
                "status": "PENDING_REVIEW",
                "severity": "LOW",
                "evidence_json": {
                    "failure_type": "PRIVATE_PROFILE_OR_PAYWALL",
                    "claimed_handle": "elena_dev",
                    "endpoint_queried": "https://leetcode.com/u/elena_dev",
                    "details": "User submission calendar is set to Private on LeetCode. Automated scraper cannot verify solved problem count without public visibility."
                },
                "admin_notes": "Candidate must set LeetCode profile privacy to Public.",
                "reviewed_by": None,
                "reviewed_at": None,
                "created_at": "2025-01-04T06:10:00Z"
            },

            # -------------------------------------------------------------
            # 4. DUPLICATE DETECTION
            # -------------------------------------------------------------
            {
                "id": "q_dup_001",
                "section": "duplicate_detection",
                "candidate_username": "alexchen",
                "provider": "hackerrank",
                "problem_title": "Two Sum (Claimed on LeetCode & HackerRank)",
                "problem_slug": "two-sum",
                "external_problem_id": "HR-TWO-SUM-01",
                "difficulty": "EASY",
                "topics": ["Arrays", "Hashing"],
                "source_code": "class Solution:\n    def twoSum(self, nums, target):\n        lookup = {}\n        for i, n in enumerate(nums):\n            if target - n in lookup: return [lookup[target-n], i]\n            lookup[n] = i",
                "source_code_hash": "sha256_twosum_canonical",
                "status": "PENDING_REVIEW",
                "severity": "HIGH",
                "evidence_json": {
                    "canonical_fingerprint": "canon_two_sum_hash_indices",
                    "existing_verified_solve_id": "solve_lc_two_sum_alexchen",
                    "existing_platform": "leetcode",
                    "duplicate_claim_platform": "hackerrank",
                    "details": "Candidate already earned verified solve XP for 'Two Sum' via LeetCode connection. Submitting the identical canonical algorithm on HackerRank would double-count Base XP."
                },
                "admin_notes": "Cross-platform duplicate detected by ProofHire Deduplication Engine.",
                "reviewed_by": None,
                "reviewed_at": None,
                "created_at": "2025-01-04T11:00:00Z"
            },
            {
                "id": "q_dup_002",
                "section": "duplicate_detection",
                "candidate_username": "rahul_verma",
                "provider": "codechef",
                "problem_title": "Valid Parentheses (Cross-Platform Cluster)",
                "problem_slug": "valid-parentheses",
                "external_problem_id": "CC-PAR-09",
                "difficulty": "EASY",
                "topics": ["Stack", "Strings"],
                "source_code": "def isValid(s: str) -> bool:\n    stack = []\n    # stack check\n    return not stack",
                "source_code_hash": "sha256_par_dup_hash",
                "status": "PENDING_REVIEW",
                "severity": "MEDIUM",
                "evidence_json": {
                    "canonical_fingerprint": "canon_valid_parentheses_stack",
                    "existing_verified_solve_id": "solve_gfg_valid_par_rahul",
                    "existing_platform": "geeksforgeeks",
                    "duplicate_claim_platform": "codechef"
                },
                "admin_notes": "Identical canonical problem solved on both GFG and CodeChef.",
                "reviewed_by": None,
                "reviewed_at": None,
                "created_at": "2025-01-03T16:20:00Z"
            },

            # -------------------------------------------------------------
            # 5. PROVIDER SYNC ERRORS
            # -------------------------------------------------------------
            {
                "id": "q_sync_001",
                "section": "provider_sync_errors",
                "candidate_username": "gnaneshwar",
                "provider": "codeforces",
                "problem_title": "Codeforces REST API Rate Limit Exceeded (HTTP 429)",
                "problem_slug": "sync-err-cf-429",
                "external_problem_id": "SYNC-CF-RATE-LIMIT",
                "difficulty": "UNKNOWN",
                "topics": ["System Health"],
                "source_code": None,
                "source_code_hash": None,
                "status": "PENDING_REVIEW",
                "severity": "HIGH",
                "evidence_json": {
                    "error_type": "HTTP_429_TOO_MANY_REQUESTS",
                    "retry_after_seconds": 60,
                    "target_url": "https://codeforces.com/api/user.status?handle=gnaneshwar&from=1&count=50",
                    "failure_timestamp": "2025-01-04T12:30:00Z",
                    "can_retry": True
                },
                "admin_notes": "Upstream Codeforces API rate limit tripped during scheduled batch sync.",
                "reviewed_by": None,
                "reviewed_at": None,
                "created_at": "2025-01-04T12:30:00Z"
            },
            {
                "id": "q_sync_002",
                "section": "provider_sync_errors",
                "candidate_username": "alexchen",
                "provider": "codechef",
                "problem_title": "CodeChef Session Gateway Timeout (HTTP 504)",
                "problem_slug": "sync-err-cc-504",
                "external_problem_id": "SYNC-CC-504",
                "difficulty": "UNKNOWN",
                "topics": ["System Health"],
                "source_code": None,
                "source_code_hash": None,
                "status": "PENDING_REVIEW",
                "severity": "MEDIUM",
                "evidence_json": {
                    "error_type": "HTTP_504_GATEWAY_TIMEOUT",
                    "target_url": "https://www.codechef.com/users/alexchen",
                    "failure_timestamp": "2025-01-04T11:15:00Z",
                    "can_retry": True
                },
                "admin_notes": "Third-party platform maintenance window caused sync drop.",
                "reviewed_by": None,
                "reviewed_at": None,
                "created_at": "2025-01-04T11:15:00Z"
            }
        ]

    def _seed_initial_audits(self):
        """Seeds historical audit ledger logs demonstrating complete traceability."""
        self.audit_records = [
            {
                "id": "aud_001",
                "admin_id": "admin_gnaneshwar",
                "admin_name": "Gnaneshwar (Lead Security Auditor)",
                "action": "APPROVE",
                "target_type": "solve_event",
                "target_id": "q_imp_prior_001",
                "candidate_username": "david_kim",
                "previous_status": "PENDING_REVIEW",
                "new_status": "APPROVED",
                "reasoning": "Verified official SkillRack PDF transcript with cryptographic institution seal from College of Engineering Guindy.",
                "evidence_reviewed": {
                    "provider": "skillrack",
                    "problem": "AVL Tree Height-Balanced Rebalancing",
                    "difficulty": "MEDIUM",
                    "transcript_hash": "sha256_ceg_ce_9981"
                },
                "deterministic_skill_xp": 16,
                "deterministic_overall_xp": 10,
                "reputation_ratio": 0.90,
                "created_at": "2025-01-03T18:00:00Z"
            },
            {
                "id": "aud_002",
                "admin_id": "admin_gnaneshwar",
                "admin_name": "Gnaneshwar (Lead Security Auditor)",
                "action": "REJECT",
                "target_type": "solve_event",
                "target_id": "q_susp_prior_002",
                "candidate_username": "fake_coder_x",
                "previous_status": "PENDING_REVIEW",
                "new_status": "REJECTED",
                "reasoning": "Unsolicited manual HTML modification detected in submitted LeetCode submission screenshot. Inspecting DOM revealed client-side element edit.",
                "evidence_reviewed": {
                    "provider": "leetcode",
                    "problem": "N-Queens II",
                    "difficulty": "HARD",
                    "screenshot_tamper_score": 98.4
                },
                "deterministic_skill_xp": 0,
                "deterministic_overall_xp": 0,
                "reputation_ratio": 0.0,
                "created_at": "2025-01-03T17:15:00Z"
            },
            {
                "id": "aud_003",
                "admin_id": "admin_gnaneshwar",
                "admin_name": "Gnaneshwar (Lead Security Auditor)",
                "action": "MARK_DUPLICATE",
                "target_type": "duplicate_cluster",
                "target_id": "q_dup_prior_003",
                "candidate_username": "rajesh_kumar",
                "previous_status": "PENDING_REVIEW",
                "new_status": "DUPLICATE",
                "reasoning": "Marked duplicate against existing LeetCode solve for 'Binary Search'. Awarded 0 XP to protect ledger from double-counting.",
                "evidence_reviewed": {
                    "canonical_problem": "binary-search",
                    "primary_solve_id": "lc_704_rajesh"
                },
                "deterministic_skill_xp": 0,
                "deterministic_overall_xp": 0,
                "reputation_ratio": 0.0,
                "created_at": "2025-01-03T15:40:00Z"
            }
        ]

    # =============================================================
    # Operational Queue Retrieval & Filtering
    # =============================================================

    def list_queue(
        self,
        section: Optional[str] = None,
        status: Optional[str] = None,
        provider: Optional[str] = None,
        severity: Optional[str] = None,
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        """Lists verification queue items filtered by section, status, severity, and search."""
        results = []
        for item in self.queue_items:
            if section and section != "all" and item["section"].lower() != section.lower():
                continue
            if status and status != "all" and item["status"].lower() != status.lower():
                continue
            if provider and provider != "all" and item["provider"].lower() != provider.lower():
                continue
            if severity and severity != "all" and item["severity"].lower() != severity.lower():
                continue
            if search:
                s = search.lower()
                user_match = s in item["candidate_username"].lower()
                title_match = s in item["problem_title"].lower()
                topic_match = any(s in t.lower() for t in item.get("topics", []))
                if not (user_match or title_match or topic_match):
                    continue
            results.append(item)

        # Section counts
        counts = {
            "all": len(self.queue_items),
            "pending_imports": len([i for i in self.queue_items if i["section"] == "pending_imports" and i["status"] == "PENDING_REVIEW"]),
            "suspicious_activity": len([i for i in self.queue_items if i["section"] == "suspicious_activity" and i["status"] == "PENDING_REVIEW"]),
            "failed_verification": len([i for i in self.queue_items if i["section"] == "failed_verification" and i["status"] == "PENDING_REVIEW"]),
            "duplicate_detection": len([i for i in self.queue_items if i["section"] == "duplicate_detection" and i["status"] == "PENDING_REVIEW"]),
            "provider_sync_errors": len([i for i in self.queue_items if i["section"] == "provider_sync_errors" and i["status"] == "PENDING_REVIEW"]),
            "total_pending": len([i for i in self.queue_items if i["status"] == "PENDING_REVIEW"]),
            "resolved": len([i for i in self.queue_items if i["status"] in ("APPROVED", "REJECTED", "DUPLICATE", "RESOLVED")])
        }

        return {
            "items": results,
            "total": len(results),
            "section_counts": counts
        }

    def get_item(self, item_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves complete evidence and metadata for an individual queue item."""
        return next((i for i in self.queue_items if i["id"] == item_id), None)

    # =============================================================
    # Administrative Actions (Strict Deterministic Guarantees)
    # =============================================================

    def approve_item(
        self,
        item_id: str,
        reasoning: str,
        admin_id: str = "admin_sys",
        admin_name: str = "ProofHire Security Administrator"
    ) -> Dict[str, Any]:
        """
        Approves a verification item.
        CRITICAL INVARIANT: Admin must NEVER manually type arbitrary XP.
        Approval triggers the normal deterministic XP engine:
          Base XP (Easy: 6, Medium: 18, Hard: 45, Expert: 70) * 0.90 (Admin Verified Modifier)
        """
        item = self.get_item(item_id)
        if not item:
            raise ValueError(f"Queue item '{item_id}' not found.")

        if not reasoning or len(reasoning.strip()) < 5:
            raise ValueError("Approval requires documented audit reasoning (minimum 5 characters).")

        prev_status = item["status"]

        # Calculate deterministic XP via problem_solving_engine
        raw_diff = item["difficulty"].upper()
        if raw_diff not in ("EASY", "MEDIUM", "HARD", "EXPERT"):
            raw_diff = "MEDIUM"  # Safe canonical default for unclassified

        base_xp = BASE_PROBLEM_XP.get(raw_diff, 18)
        # Admin verified modifier is strictly 0.90
        admin_modifier = VERIFICATION_MODIFIERS.get(VerificationStrength.ADMIN_VERIFIED, 0.90)
        deterministic_skill_xp = int(round(base_xp * admin_modifier))
        # Overall Professional XP ratio is 60% for external platform solves
        deterministic_overall_xp = int(round(deterministic_skill_xp * EXTERNAL_PLATFORM_OVERALL_RATIO))

        # Update candidate problem-solving profile
        username = item["candidate_username"]
        ps_profile = problem_solving_engine.get_or_create_profile(username)
        ps_profile["cumulative_ps_xp"] += deterministic_skill_xp
        if raw_diff == "EASY":
            ps_profile["easy_count"] += 1
        elif raw_diff == "MEDIUM":
            ps_profile["medium_count"] += 1
        elif raw_diff == "HARD":
            ps_profile["hard_count"] += 1
        elif raw_diff == "EXPERT":
            ps_profile["expert_count"] += 1

        ps_profile["total_solved"] += 1
        ps_profile["level"] = problem_solving_engine.calculate_problem_solving_level(ps_profile["cumulative_ps_xp"])
        ps_profile["problem_solving_score"] = problem_solving_engine.calculate_problem_solving_score(
            easy_count=ps_profile["easy_count"],
            medium_count=ps_profile["medium_count"],
            hard_count=ps_profile["hard_count"],
            verification_status=VerificationStrength.ADMIN_VERIFIED,
            distinct_topics_count=len(ps_profile.get("topic_distribution", {})),
            contest_rating=ps_profile.get("contest_rating")
        )

        # Update topic distributions
        for t in item.get("topics", ["Algorithms"]):
            t_data = ps_profile.setdefault("topic_distribution", {}).setdefault(t, {"solved": 0, "level": 1, "xp": 0})
            t_data["solved"] = t_data.get("solved", 0) + 1
            t_data["xp"] = t_data.get("xp", 0) + deterministic_skill_xp
            t_data["level"] = min(99, int((t_data["xp"] / 40.0) ** 0.5) + 1)

        # Award deterministic overall XP in reputation engine
        rep_result = reputation_engine.award_source_xp(
            username=username,
            source="PROBLEM_SOLVING",
            calculated_xp=deterministic_overall_xp,
            title=f"Admin Verified Solve: {item['problem_title']} ({item['provider'].title()})",
            skill_weights={"Problem Solving": 0.60, "Algorithms": 0.40}
        )

        # Update Queue Item
        item["status"] = "APPROVED"
        item["reviewed_by"] = admin_name
        item["reviewed_at"] = datetime.now(timezone.utc).isoformat()
        item["admin_notes"] = reasoning

        # Record Immutable Audit Entry
        audit_entry = {
            "id": f"aud_{uuid.uuid4().hex[:8]}",
            "admin_id": admin_id,
            "admin_name": admin_name,
            "action": "APPROVE",
            "target_type": "solve_event",
            "target_id": item_id,
            "candidate_username": username,
            "previous_status": prev_status,
            "new_status": "APPROVED",
            "reasoning": reasoning.strip(),
            "evidence_reviewed": {
                "problem_title": item["problem_title"],
                "provider": item["provider"],
                "difficulty": raw_diff,
                "topics": item.get("topics", []),
                "source_code_hash": item.get("source_code_hash"),
                "evidence_snapshot": item.get("evidence_json")
            },
            "deterministic_skill_xp": deterministic_skill_xp,
            "deterministic_overall_xp": deterministic_overall_xp,
            "reputation_ratio": admin_modifier,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.audit_records.insert(0, audit_entry)

        logger.info(
            f"Admin '{admin_name}' approved item '{item_id}' for '{username}'. "
            f"Awarded deterministic XP: {deterministic_skill_xp} skill XP, {deterministic_overall_xp} overall XP."
        )

        return {
            "item_id": item_id,
            "status": "APPROVED",
            "deterministic_skill_xp": deterministic_skill_xp,
            "deterministic_overall_xp": deterministic_overall_xp,
            "reputation_ratio": admin_modifier,
            "profile_level": ps_profile["level"],
            "profile_score": ps_profile["problem_solving_score"],
            "audit_id": audit_entry["id"],
            "reputation_update": rep_result
        }

    def reject_item(
        self,
        item_id: str,
        reasoning: str,
        admin_id: str = "admin_sys",
        admin_name: str = "ProofHire Security Administrator"
    ) -> Dict[str, Any]:
        """
        Rejects a verification item.
        Awards strictly 0 XP and logs audit record.
        """
        item = self.get_item(item_id)
        if not item:
            raise ValueError(f"Queue item '{item_id}' not found.")

        if not reasoning or len(reasoning.strip()) < 5:
            raise ValueError("Rejection requires documented audit reasoning (minimum 5 characters).")

        prev_status = item["status"]
        item["status"] = "REJECTED"
        item["reviewed_by"] = admin_name
        item["reviewed_at"] = datetime.now(timezone.utc).isoformat()
        item["admin_notes"] = reasoning

        audit_entry = {
            "id": f"aud_{uuid.uuid4().hex[:8]}",
            "admin_id": admin_id,
            "admin_name": admin_name,
            "action": "REJECT",
            "target_type": "solve_event",
            "target_id": item_id,
            "candidate_username": item["candidate_username"],
            "previous_status": prev_status,
            "new_status": "REJECTED",
            "reasoning": reasoning.strip(),
            "evidence_reviewed": {
                "problem_title": item["problem_title"],
                "provider": item["provider"],
                "difficulty": item["difficulty"],
                "evidence_snapshot": item.get("evidence_json")
            },
            "deterministic_skill_xp": 0,
            "deterministic_overall_xp": 0,
            "reputation_ratio": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.audit_records.insert(0, audit_entry)

        return {
            "item_id": item_id,
            "status": "REJECTED",
            "deterministic_skill_xp": 0,
            "audit_id": audit_entry["id"]
        }

    def mark_duplicate(
        self,
        item_id: str,
        canonical_id: str,
        reasoning: str,
        admin_id: str = "admin_sys",
        admin_name: str = "ProofHire Security Administrator"
    ) -> Dict[str, Any]:
        """
        Marks an item as duplicate against a canonical problem/solve.
        Awards strictly 0 XP to prevent XP farming and double-counting.
        """
        item = self.get_item(item_id)
        if not item:
            raise ValueError(f"Queue item '{item_id}' not found.")

        if not reasoning or len(reasoning.strip()) < 5:
            raise ValueError("Marking duplicate requires documented audit reasoning.")

        prev_status = item["status"]
        item["status"] = "DUPLICATE"
        item["duplicate_of_id"] = canonical_id
        item["reviewed_by"] = admin_name
        item["reviewed_at"] = datetime.now(timezone.utc).isoformat()
        item["admin_notes"] = f"Marked duplicate of {canonical_id}. Reason: {reasoning}"

        audit_entry = {
            "id": f"aud_{uuid.uuid4().hex[:8]}",
            "admin_id": admin_id,
            "admin_name": admin_name,
            "action": "MARK_DUPLICATE",
            "target_type": "duplicate_cluster",
            "target_id": item_id,
            "candidate_username": item["candidate_username"],
            "previous_status": prev_status,
            "new_status": "DUPLICATE",
            "reasoning": reasoning.strip(),
            "evidence_reviewed": {
                "canonical_reference": canonical_id,
                "problem_title": item["problem_title"],
                "provider": item["provider"]
            },
            "deterministic_skill_xp": 0,
            "deterministic_overall_xp": 0,
            "reputation_ratio": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.audit_records.insert(0, audit_entry)

        return {
            "item_id": item_id,
            "status": "DUPLICATE",
            "canonical_id": canonical_id,
            "deterministic_skill_xp": 0,
            "audit_id": audit_entry["id"]
        }

    def request_additional_evidence(
        self,
        item_id: str,
        requested_items: List[str],
        notes: str,
        admin_id: str = "admin_sys",
        admin_name: str = "ProofHire Security Administrator"
    ) -> Dict[str, Any]:
        """
        Requests additional evidence from the candidate (e.g. video capture, transcript).
        """
        item = self.get_item(item_id)
        if not item:
            raise ValueError(f"Queue item '{item_id}' not found.")

        if not requested_items:
            raise ValueError("Must specify at least one required evidence item.")

        prev_status = item["status"]
        item["status"] = "MORE_EVIDENCE_REQUESTED"
        item["reviewed_by"] = admin_name
        item["reviewed_at"] = datetime.now(timezone.utc).isoformat()
        item.setdefault("evidence_json", {})["requested_evidence"] = requested_items
        item.setdefault("evidence_json", {})["admin_notes"] = notes
        item["admin_notes"] = notes

        audit_entry = {
            "id": f"aud_{uuid.uuid4().hex[:8]}",
            "admin_id": admin_id,
            "admin_name": admin_name,
            "action": "REQUEST_EVIDENCE",
            "target_type": "solve_event",
            "target_id": item_id,
            "candidate_username": item["candidate_username"],
            "previous_status": prev_status,
            "new_status": "MORE_EVIDENCE_REQUESTED",
            "reasoning": notes.strip(),
            "evidence_reviewed": {
                "requested_items": requested_items,
                "problem_title": item["problem_title"],
                "provider": item["provider"]
            },
            "deterministic_skill_xp": 0,
            "deterministic_overall_xp": 0,
            "reputation_ratio": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.audit_records.insert(0, audit_entry)

        return {
            "item_id": item_id,
            "status": "MORE_EVIDENCE_REQUESTED",
            "requested_items": requested_items,
            "audit_id": audit_entry["id"]
        }

    def retry_sync(
        self,
        error_id: str,
        admin_id: str = "admin_sys",
        admin_name: str = "ProofHire Security Administrator"
    ) -> Dict[str, Any]:
        """Retries a failed provider sync operation."""
        item = self.get_item(error_id)
        if not item:
            raise ValueError(f"Sync error item '{error_id}' not found.")

        username = item["candidate_username"]
        provider = item["provider"]

        # Attempt platform sync
        sync_result = problem_solving_sync_service.sync_platform(username, provider)

        prev_status = item["status"]
        item["status"] = "RESOLVED"
        item["reviewed_by"] = admin_name
        item["reviewed_at"] = datetime.now(timezone.utc).isoformat()
        item["admin_notes"] = f"Admin re-triggered sync successfully: {sync_result.get('problems_verified', 0)} problems verified."

        audit_entry = {
            "id": f"aud_{uuid.uuid4().hex[:8]}",
            "admin_id": admin_id,
            "admin_name": admin_name,
            "action": "RETRY_SYNC",
            "target_type": "sync_error",
            "target_id": error_id,
            "candidate_username": username,
            "previous_status": prev_status,
            "new_status": "RESOLVED",
            "reasoning": "Admin manually triggered sync retry after external rate-limit cooloff.",
            "evidence_reviewed": {
                "sync_output": sync_result,
                "provider": provider
            },
            "deterministic_skill_xp": sync_result.get("problem_solving_xp_awarded", 0),
            "deterministic_overall_xp": sync_result.get("overall_xp_awarded", 0),
            "reputation_ratio": 0.90,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.audit_records.insert(0, audit_entry)

        return {
            "item_id": error_id,
            "status": "RESOLVED",
            "sync_result": sync_result,
            "audit_id": audit_entry["id"]
        }

    # =============================================================
    # Audit Trail History
    # =============================================================

    def get_audit_trail(
        self,
        limit: int = 50,
        offset: int = 0,
        action_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """Returns paginated immutable audit logs for regulatory and compliance review."""
        filtered = self.audit_records
        if action_filter and action_filter != "all":
            filtered = [a for a in filtered if a["action"].upper() == action_filter.upper()]

        total = len(filtered)
        paged = filtered[offset : offset + limit]

        return {
            "audits": paged,
            "total": total,
            "limit": limit,
            "offset": offset
        }


# Singleton instance
admin_problem_solving_service = AdminProblemSolvingService()
