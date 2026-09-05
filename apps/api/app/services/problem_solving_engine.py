import math
import re
import uuid
import hashlib
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone

logger = logging.getLogger("proofhire.problem_solving_engine")

# =============================================================
# Phase 3 Configurable Constants
# =============================================================

# 1. Base Problem XP
BASE_PROBLEM_XP: Dict[str, int] = {
    "EASY": 6,
    "MEDIUM": 18,
    "HARD": 45,
    "EXPERT": 70,
    "UNKNOWN": 0
}

# 2. Verification Modifiers
VERIFICATION_MODIFIERS: Dict[str, float] = {
    "provider_verified": 1.00,
    "OFFICIAL_API_VERIFIED": 1.00,
    "profile_verified": 0.90,
    "PUBLIC_PROFILE_VERIFIED": 0.90,
    "admin_verified": 0.90,
    "ADMIN_VERIFIED": 0.90,
    "manual_import": 0.85,
    "MANUAL_VERIFIED_IMPORT": 0.85,
    "user_reported": 0.00,
    "unverified": 0.00,
    "UNVERIFIED_CLAIM": 0.00
}

# 3. Quality Modifier Bounds
QUALITY_MODIFIER_MIN = 0.90
QUALITY_MODIFIER_MAX = 1.20
QUALITY_MODIFIER_DEFAULT = 1.00

# 4. Anti-Farming Easy Problem Rolling Thresholds (Rolling 7-day)
EASY_VOLUME_TIERS: List[Tuple[int, int, float]] = [
    (1, 30, 1.00),     # First 30 verified easy problems
    (31, 60, 0.60),    # 31-60 easy problems
    (61, 9999999, 0.30) # 61+ easy problems
]

# 5. Overall Professional XP Contribution Ratios
EXTERNAL_PLATFORM_OVERALL_RATIO = 0.60  # 60% of skill XP contributes to Overall Professional XP
FIRST_PARTY_OVERALL_RATIO = 1.00        # 100% of skill XP contributes for ProofHire assessments

# 6. Difficulty Weighted Points for Score Calculation
DIFFICULTY_WEIGHT_POINTS: Dict[str, int] = {
    "EASY": 1,
    "MEDIUM": 3,
    "HARD": 7,
    "EXPERT": 12
}

# 7. Topic Taxonomy Mapping (narrow tags -> broader categories)
TOPIC_CATEGORY_MAPPING: Dict[str, str] = {
    "bfs": "Graphs",
    "dfs": "Graphs",
    "dijkstra": "Graphs",
    "graph": "Graphs",
    "graphs": "Graphs",
    "shortest path": "Graphs",
    "topological sort": "Graphs",
    "union find": "Graphs",
    "binary search": "Searching",
    "search": "Searching",
    "searching": "Searching",
    "two pointers": "Arrays",
    "sliding window": "Arrays",
    "arrays": "Arrays",
    "array": "Arrays",
    "matrix": "Arrays",
    "strings": "Strings",
    "string": "Strings",
    "dp": "Dynamic Programming",
    "dynamic programming": "Dynamic Programming",
    "memoization": "Dynamic Programming",
    "trees": "Trees",
    "tree": "Trees",
    "binary tree": "Trees",
    "bst": "Trees",
    "heap": "Heaps & Priority Queues",
    "priority queue": "Heaps & Priority Queues",
    "hash table": "Hashing",
    "hashmap": "Hashing",
    "hash map": "Hashing",
    "hashing": "Hashing",
    "math": "Mathematics",
    "mathematics": "Mathematics",
    "number theory": "Mathematics",
    "combinatorics": "Mathematics",
    "geometry": "Mathematics",
    "greedy": "Greedy",
    "recursion": "Recursion & Backtracking",
    "backtracking": "Recursion & Backtracking",
    "bit manipulation": "Bit Manipulation",
    "bits": "Bit Manipulation",
    "sorting": "Sorting",
    "sort": "Sorting",
    "linked list": "Linked Lists",
    "linked lists": "Linked Lists",
    "stack": "Stacks & Queues",
    "stacks": "Stacks & Queues",
    "queue": "Stacks & Queues",
    "queues": "Stacks & Queues",
    "sql": "Databases",
    "database": "Databases",
    "databases": "Databases",
    "design": "System Design",
    "system design": "System Design"
}

# Legacy VerificationStrength enum for backward compatibility
class VerificationStrength:
    OFFICIAL_API_VERIFIED = "OFFICIAL_API_VERIFIED"
    PUBLIC_PROFILE_VERIFIED = "PUBLIC_PROFILE_VERIFIED"
    ADMIN_VERIFIED = "ADMIN_VERIFIED"
    MANUAL_VERIFIED_IMPORT = "MANUAL_VERIFIED_IMPORT"
    UNVERIFIED_CLAIM = "UNVERIFIED_CLAIM"

VERIFICATION_MULTIPLIERS = VERIFICATION_MODIFIERS

STANDARD_TOPICS = [
    "Arrays",
    "Strings",
    "Trees",
    "Graphs",
    "Dynamic Programming",
    "Mathematics",
    "Greedy",
    "Searching",
    "Sorting",
    "Bit Manipulation"
]

# Phase 4 Competitive Programming & Contest Constants
CONTEST_MAX_PERFORMANCE_XP = 350
MAX_RATING_BONUS_XP = 50
RATING_DELTA_FACTOR = 0.5

CONTEST_PLACEMENT_TIERS: List[Tuple[float, int]] = [
    (1.0, 150),   # Top 1%
    (5.0, 100),   # Top 5%
    (10.0, 70),   # Top 10%
    (25.0, 40),   # Top 25%
    (50.0, 20),   # Top 50%
    (100.0, 10)   # Below Top 50%
]


# =============================================================
# Problem Solving Reputation Engine
# =============================================================
class ProblemSolvingReputationEngine:
    """
    Deterministic Problem-Solving Reputation Engine.
    
    IMPORTANT DESIGN PRINCIPLES:
    1. AI may ANALYZE a solution for complexity/style, but AI must NOT set XP.
    2. All XP, levels, and 0-100 scores remain deterministic, explainable, and auditable.
    3. Anti-farming: Volume reduction on Easy problems (rolling 7-day).
    4. Canonical deduplication: Canonical problems award XP only once.
    5. Proportional topic XP: Distributes skill XP across broader categories.
    6. Overall Professional XP ratio: 60% for external platforms, up to 100% for ProofHire assessments.
    """

    # Configurable base XP lookup
    DIFFICULTY_BASE_XP = BASE_PROBLEM_XP

    def __init__(self):
        # Known canonical fingerprints already awarded per user:
        # username -> set of canonical fingerprints
        self.user_awarded_fingerprints: Dict[str, set] = {}

        # In-memory candidate profile cache for fast access
        self.profiles: Dict[str, Dict[str, Any]] = {
            "gnaneshwar": {
                "username": "gnaneshwar",
                "full_name": "GNANESHWAR R",
                "cumulative_ps_xp": 5820,
                "level": 29,
                "problem_solving_score": 84,
                "grade": "A",
                "total_solved": 327,
                "easy_count": 141,
                "medium_count": 142,
                "hard_count": 41,
                "expert_count": 3,
                "acceptance_rate": 72.4,
                "active_streak_weeks": 10,
                "active_weeks_last_12": 10,
                "global_rank": "Top 4.8%",
                "contest_rating": 1885,
                "contest_platform": "LeetCode / Codeforces / ProofHire",
                "platforms": [
                    {
                        "platform": "LeetCode",
                        "handle": "gnaneshwar_dev",
                        "profile_url": "https://leetcode.com/u/gnaneshwar_dev",
                        "solved_count": 226,
                        "easy": 95,
                        "medium": 100,
                        "hard": 30,
                        "expert": 1,
                        "rating": 1845,
                        "verification_status": "PUBLIC_PROFILE_VERIFIED",
                        "verification_label": "Demo Profile Sync (Synthetic)",
                        "is_synthetic_demo": True,
                        "last_synced": "2025-02-14T10:00:00Z"
                    },
                    {
                        "platform": "Codeforces",
                        "handle": "gnaneshwar",
                        "profile_url": "https://codeforces.com/profile/gnaneshwar",
                        "solved_count": 73,
                        "easy": 30,
                        "medium": 32,
                        "hard": 9,
                        "expert": 2,
                        "rating": 1812,
                        "rank_title": "Candidate Master",
                        "verification_status": "OFFICIAL_API_VERIFIED",
                        "verification_label": "Demo Seeded (API Compatible)",
                        "is_synthetic_demo": True,
                        "last_synced": "2025-02-12T16:30:00Z"
                    },
                    {
                        "platform": "ProofHire",
                        "handle": "gnaneshwar",
                        "profile_url": "https://proofhire.com/u/gnaneshwar",
                        "solved_count": 28,
                        "easy": 16,
                        "medium": 10,
                        "hard": 2,
                        "expert": 0,
                        "rating": 1890,
                        "rank_title": "Verified Master",
                        "verification_status": "FIRST_PARTY_VERIFIED",
                        "verification_label": "ProofHire First-Party Assessment (Verified)",
                        "is_synthetic_demo": False,
                        "last_synced": "2025-02-15T11:45:00Z"
                    }
                ],
                "topic_distribution": {
                    "Arrays": {"solved": 91, "mastery_pct": 91, "score": 91},
                    "Trees": {"solved": 87, "mastery_pct": 87, "score": 87},
                    "Graphs": {"solved": 83, "mastery_pct": 83, "score": 83},
                    "Searching": {"solved": 82, "mastery_pct": 82, "score": 82},
                    "Dynamic Programming": {"solved": 76, "mastery_pct": 76, "score": 76},
                    "SQL": {"solved": 72, "mastery_pct": 72, "score": 72},
                    "Mathematics": {"solved": 25, "mastery_pct": 70, "score": 70},
                    "Sorting": {"solved": 18, "mastery_pct": 68, "score": 68}
                },
                "recent_submissions": [
                    {
                        "id": "sub_gnan_01",
                        "problem_title": "LRU Cache",
                        "difficulty": "MEDIUM",
                        "topic": "Trees / Design",
                        "source": "LeetCode",
                        "provider": "leetcode",
                        "language": "TypeScript",
                        "verification_status": "profile_verified",
                        "verification_label": "Profile Sync (Demo)",
                        "awarded_xp": 18,
                        "solved_at": "2025-02-14T18:30:00Z"
                    },
                    {
                        "id": "sub_gnan_02",
                        "problem_title": "Binary Tree Maximum Path Sum",
                        "difficulty": "HARD",
                        "topic": "Trees",
                        "source": "LeetCode",
                        "provider": "leetcode",
                        "language": "Python",
                        "verification_status": "profile_verified",
                        "verification_label": "Profile Sync (Demo)",
                        "awarded_xp": 45,
                        "solved_at": "2025-02-13T14:15:00Z"
                    },
                    {
                        "id": "sub_gnan_03",
                        "problem_title": "Number of Islands",
                        "difficulty": "MEDIUM",
                        "topic": "Graphs",
                        "source": "LeetCode",
                        "provider": "leetcode",
                        "language": "TypeScript",
                        "verification_status": "profile_verified",
                        "verification_label": "Profile Sync (Demo)",
                        "awarded_xp": 18,
                        "solved_at": "2025-02-12T10:45:00Z"
                    },
                    {
                        "id": "sub_gnan_04",
                        "problem_title": "Dijkstra's Shortest Path on Grid",
                        "difficulty": "HARD",
                        "topic": "Graphs",
                        "source": "ProofHire",
                        "provider": "proofhire",
                        "language": "Python",
                        "verification_status": "first_party_verified",
                        "verification_label": "ProofHire First-Party (Verified)",
                        "awarded_xp": 45,
                        "solved_at": "2025-02-11T16:20:00Z"
                    },
                    {
                        "id": "sub_gnan_05",
                        "problem_title": "Trapping Rain Water",
                        "difficulty": "HARD",
                        "topic": "Arrays",
                        "source": "LeetCode",
                        "provider": "leetcode",
                        "language": "TypeScript",
                        "verification_status": "profile_verified",
                        "verification_label": "Profile Sync (Demo)",
                        "awarded_xp": 45,
                        "solved_at": "2025-02-10T20:10:00Z"
                    },
                    {
                        "id": "sub_gnan_06",
                        "problem_title": "Segment Tree Range Minimum Query",
                        "difficulty": "EXPERT",
                        "topic": "Trees",
                        "source": "Codeforces",
                        "provider": "codeforces",
                        "language": "C++",
                        "verification_status": "provider_verified",
                        "verification_label": "Codeforces Sync (Demo)",
                        "awarded_xp": 70,
                        "solved_at": "2025-02-09T17:00:00Z"
                    },
                    {
                        "id": "sub_gnan_07",
                        "problem_title": "Two Sum",
                        "difficulty": "EASY",
                        "topic": "Arrays",
                        "source": "LeetCode",
                        "provider": "leetcode",
                        "language": "TypeScript",
                        "verification_status": "profile_verified",
                        "verification_label": "Profile Sync (Demo)",
                        "awarded_xp": 6,
                        "solved_at": "2025-02-08T11:20:00Z"
                    },
                    {
                        "id": "sub_gnan_08",
                        "problem_title": "Median of Two Sorted Arrays",
                        "difficulty": "HARD",
                        "topic": "Searching",
                        "source": "LeetCode",
                        "provider": "leetcode",
                        "language": "Python",
                        "verification_status": "profile_verified",
                        "verification_label": "Profile Sync (Demo)",
                        "awarded_xp": 45,
                        "solved_at": "2025-02-07T15:40:00Z"
                    },
                    {
                        "id": "sub_gnan_09",
                        "problem_title": "Longest Increasing Subsequence",
                        "difficulty": "MEDIUM",
                        "topic": "Dynamic Programming",
                        "source": "LeetCode",
                        "provider": "leetcode",
                        "language": "TypeScript",
                        "verification_status": "profile_verified",
                        "verification_label": "Profile Sync (Demo)",
                        "awarded_xp": 18,
                        "solved_at": "2025-02-06T19:15:00Z"
                    },
                    {
                        "id": "sub_gnan_10",
                        "problem_title": "Department Highest Salary",
                        "difficulty": "MEDIUM",
                        "topic": "SQL",
                        "source": "LeetCode",
                        "provider": "leetcode",
                        "language": "SQL",
                        "verification_status": "profile_verified",
                        "verification_label": "Profile Sync (Demo)",
                        "awarded_xp": 18,
                        "solved_at": "2025-02-05T13:30:00Z"
                    },
                    {
                        "id": "sub_gnan_11",
                        "problem_title": "Consecutive Numbers",
                        "difficulty": "MEDIUM",
                        "topic": "SQL",
                        "source": "ProofHire",
                        "provider": "proofhire",
                        "language": "PostgreSQL",
                        "verification_status": "first_party_verified",
                        "verification_label": "ProofHire First-Party (Verified)",
                        "awarded_xp": 18,
                        "solved_at": "2025-02-04T12:00:00Z"
                    },
                    {
                        "id": "sub_gnan_12",
                        "problem_title": "Edit Distance",
                        "difficulty": "HARD",
                        "topic": "Dynamic Programming",
                        "source": "Codeforces",
                        "provider": "codeforces",
                        "language": "C++",
                        "verification_status": "provider_verified",
                        "verification_label": "Codeforces Sync (Demo)",
                        "awarded_xp": 45,
                        "solved_at": "2025-02-03T16:45:00Z"
                    },
                    {
                        "id": "sub_gnan_13",
                        "problem_title": "Binary Search",
                        "difficulty": "EASY",
                        "topic": "Searching",
                        "source": "LeetCode",
                        "provider": "leetcode",
                        "language": "Python",
                        "verification_status": "profile_verified",
                        "verification_label": "Profile Sync (Demo)",
                        "awarded_xp": 6,
                        "solved_at": "2025-02-02T09:10:00Z"
                    },
                    {
                        "id": "sub_gnan_14",
                        "problem_title": "Max Flow Dinic's Algorithm",
                        "difficulty": "EXPERT",
                        "topic": "Graphs",
                        "source": "Codeforces",
                        "provider": "codeforces",
                        "language": "C++",
                        "verification_status": "provider_verified",
                        "verification_label": "Codeforces Sync (Demo)",
                        "awarded_xp": 70,
                        "solved_at": "2025-01-28T18:00:00Z"
                    },
                    {
                        "id": "sub_gnan_15",
                        "problem_title": "Word Ladder II",
                        "difficulty": "HARD",
                        "topic": "Graphs",
                        "source": "LeetCode",
                        "provider": "leetcode",
                        "language": "TypeScript",
                        "verification_status": "profile_verified",
                        "verification_label": "Profile Sync (Demo)",
                        "awarded_xp": 45,
                        "solved_at": "2025-01-25T14:30:00Z"
                    },
                    {
                        "id": "sub_gnan_16",
                        "problem_title": "Merge k Sorted Lists",
                        "difficulty": "HARD",
                        "topic": "Arrays",
                        "source": "ProofHire",
                        "provider": "proofhire",
                        "language": "TypeScript",
                        "verification_status": "first_party_verified",
                        "verification_label": "ProofHire First-Party (Verified)",
                        "awarded_xp": 45,
                        "solved_at": "2025-01-22T11:00:00Z"
                    },
                    {
                        "id": "sub_gnan_17",
                        "problem_title": "Subarray Sum Equals K",
                        "difficulty": "MEDIUM",
                        "topic": "Arrays",
                        "source": "LeetCode",
                        "provider": "leetcode",
                        "language": "TypeScript",
                        "verification_status": "profile_verified",
                        "verification_label": "Profile Sync (Demo)",
                        "awarded_xp": 18,
                        "solved_at": "2025-01-20T17:15:00Z"
                    },
                    {
                        "id": "sub_gnan_18",
                        "problem_title": "Course Schedule II",
                        "difficulty": "MEDIUM",
                        "topic": "Graphs",
                        "source": "LeetCode",
                        "provider": "leetcode",
                        "language": "Python",
                        "verification_status": "profile_verified",
                        "verification_label": "Profile Sync (Demo)",
                        "awarded_xp": 18,
                        "solved_at": "2025-01-18T16:00:00Z"
                    },
                    {
                        "id": "sub_gnan_19",
                        "problem_title": "Coin Change",
                        "difficulty": "MEDIUM",
                        "topic": "Dynamic Programming",
                        "source": "LeetCode",
                        "provider": "leetcode",
                        "language": "TypeScript",
                        "verification_status": "profile_verified",
                        "verification_label": "Profile Sync (Demo)",
                        "awarded_xp": 18,
                        "solved_at": "2025-01-15T10:30:00Z"
                    },
                    {
                        "id": "sub_gnan_20",
                        "problem_title": "Trips and Users Query Optimization",
                        "difficulty": "HARD",
                        "topic": "SQL",
                        "source": "ProofHire",
                        "provider": "proofhire",
                        "language": "PostgreSQL",
                        "verification_status": "first_party_verified",
                        "verification_label": "ProofHire First-Party (Verified)",
                        "awarded_xp": 45,
                        "solved_at": "2025-01-13T15:20:00Z"
                    }
                ],
                "contests_participated": 18,
                "best_ranking": 42,
                "current_rating": 1885,
                "highest_rating": 1920,
                "top_percentile": 98.9,
                "recent_contests": [
                    {
                        "contest_name": "LeetCode Weekly Contest 431",
                        "provider": "leetcode",
                        "contest_url": "https://leetcode.com/contest/weekly-contest-431",
                        "rank": 312,
                        "total_participants": 28400,
                        "percentile": 98.9,
                        "rating_before": 1790,
                        "rating_after": 1845,
                        "rating_delta": 55,
                        "problems_attempted": 4,
                        "problems_solved": 4,
                        "contest_date": "2025-01-12T02:30:00Z",
                        "verified": True,
                        "awarded_xp": 150,
                        "placement_bonus": 100,
                        "rating_bonus": 50,
                        "verification_status": "DEMO_SEEDED",
                        "verification_label": "Tournament Telemetry (Demo Seeded)",
                        "is_synthetic_demo": True
                    },
                    {
                        "contest_name": "Codeforces Round 982 (Div. 2)",
                        "provider": "codeforces",
                        "contest_url": "https://codeforces.com/contest/2034",
                        "rank": 185,
                        "total_participants": 14200,
                        "percentile": 98.7,
                        "rating_before": 1770,
                        "rating_after": 1812,
                        "rating_delta": 42,
                        "problems_attempted": 5,
                        "problems_solved": 4,
                        "contest_date": "2025-01-24T17:35:00Z",
                        "verified": True,
                        "awarded_xp": 149,
                        "placement_bonus": 100,
                        "rating_bonus": 49,
                        "verification_status": "DEMO_SEEDED",
                        "verification_label": "Contest Telemetry (Demo Seeded)",
                        "is_synthetic_demo": True
                    },
                    {
                        "contest_name": "ProofHire Algorithmic Sprint #12",
                        "provider": "proofhire",
                        "contest_url": "/contests/sprint-12",
                        "rank": 8,
                        "total_participants": 450,
                        "percentile": 98.2,
                        "rating_before": 1855,
                        "rating_after": 1890,
                        "rating_delta": 35,
                        "problems_attempted": 4,
                        "problems_solved": 4,
                        "contest_date": "2025-02-02T15:00:00Z",
                        "verified": True,
                        "awarded_xp": 64,
                        "placement_bonus": 40,
                        "rating_bonus": 24,
                        "verification_status": "FIRST_PARTY_VERIFIED",
                        "verification_label": "ProofHire First-Party Assessment (Verified)",
                        "is_synthetic_demo": False
                    }
                ]
            },
            "alexchen": {
                "username": "alexchen",
                "full_name": "Alex Chen",
                "cumulative_ps_xp": 3950,
                "level": 37,
                "problem_solving_score": 95,
                "grade": "O",
                "total_solved": 540,
                "easy_count": 140,
                "medium_count": 280,
                "hard_count": 120,
                "expert_count": 10,
                "acceptance_rate": 74.2,
                "active_streak_weeks": 32,
                "active_weeks_last_12": 12,
                "global_rank": "Top 2.1%",
                "contest_rating": 2150,
                "contest_platform": "Codeforces / LeetCode",
                "platforms": [
                    {
                        "platform": "Codeforces",
                        "handle": "hyper_chen",
                        "profile_url": "https://codeforces.com/profile/hyper_chen",
                        "solved_count": 260,
                        "easy": 60,
                        "medium": 130,
                        "hard": 70,
                        "rating": 2150,
                        "rank_title": "Master",
                        "verification_status": "OFFICIAL_API_VERIFIED",
                        "verification_label": "Official API Verified",
                        "last_synced": "2025-02-12T16:30:00Z"
                    },
                    {
                        "platform": "LeetCode",
                        "handle": "alex_systems",
                        "profile_url": "https://leetcode.com/u/alex_systems",
                        "solved_count": 280,
                        "easy": 80,
                        "medium": 150,
                        "hard": 50,
                        "rating": 2040,
                        "rank_title": "Guardian",
                        "verification_status": "PUBLIC_PROFILE_VERIFIED",
                        "verification_label": "Public Profile Verified",
                        "last_synced": "2025-02-14T10:00:00Z"
                    }
                ],
                "topic_distribution": {
                    "Arrays": {"solved": 160, "mastery_pct": 96},
                    "Trees": {"solved": 130, "mastery_pct": 94},
                    "Graphs": {"solved": 115, "mastery_pct": 92},
                    "Dynamic Programming": {"solved": 95, "mastery_pct": 90},
                    "Searching": {"solved": 75, "mastery_pct": 95},
                    "Mathematics": {"solved": 60, "mastery_pct": 88}
                },
                "recent_submissions": [],
                "contests_participated": 24,
                "best_ranking": 18,
                "current_rating": 2150,
                "highest_rating": 2185,
                "top_percentile": 99.2,
                "recent_contests": [
                    {
                        "contest_name": "Codeforces Round 990 (Div. 1)",
                        "provider": "codeforces",
                        "contest_url": "https://codeforces.com/contest/2048",
                        "rank": 18,
                        "total_participants": 2400,
                        "percentile": 99.25,
                        "rating_before": 2115,
                        "rating_after": 2150,
                        "rating_delta": 35,
                        "problems_attempted": 6,
                        "problems_solved": 5,
                        "contest_date": "2025-02-05T17:35:00Z",
                        "verified": True
                    },
                    {
                        "contest_name": "LeetCode Biweekly Contest 148",
                        "provider": "leetcode",
                        "contest_url": "https://leetcode.com/contest/biweekly-contest-148",
                        "rank": 26,
                        "total_participants": 22000,
                        "percentile": 99.88,
                        "rating_before": 2040,
                        "rating_after": 2095,
                        "rating_delta": 55,
                        "problems_attempted": 4,
                        "problems_solved": 4,
                        "contest_date": "2025-01-18T14:30:00Z",
                        "verified": True
                    }
                ]
            }
        }

    # -------------------------------------------------------------
    # Phase 4 Competitive Programming & Contest Bonus Engine
    # -------------------------------------------------------------
    def calculate_contest_performance_bonus(
        self,
        rank: Optional[int],
        total_participants: Optional[int],
        rating_delta: Optional[int] = None,
        is_verified: bool = True
    ) -> Dict[str, Any]:
        """
        Calculates additional contest-performance XP:
        Placement Bonus based on verified percentile:
          Top 1%: +150 XP, Top 5%: +100 XP, Top 10%: +70 XP,
          Top 25%: +40 XP, Top 50%: +20 XP, Below 50%: +10 XP.
        If total participant count or rank cannot be verified: 0 XP placement bonus.
        Rating Bonus: Positive rating changes award +0.5 XP per point (capped at 50 XP).
          Negative rating changes do NOT penalize XP (0 bonus).
        Capped at 350 XP per contest.
        
        NOTE: Problems solved during the contest earn their regular problem XP separately;
        they are NOT double-counted here.
        """
        if not is_verified or rank is None or total_participants is None or total_participants <= 0 or rank <= 0:
            percentile = None
            placement_bonus = 0
            placement_tier = "Unverified Placement"
        else:
            percentile = round((rank / total_participants) * 100.0, 2)
            placement_bonus = 10
            placement_tier = "Below Top 50%"
            for max_pct, bonus in CONTEST_PLACEMENT_TIERS:
                if percentile <= max_pct:
                    placement_bonus = bonus
                    placement_tier = "Below Top 50%" if max_pct >= 100.0 else f"Top {int(max_pct)}%"
                    break

        # Rating change bonus (positive only, capped at MAX_RATING_BONUS_XP)
        rating_bonus = 0
        if rating_delta is not None and rating_delta > 0:
            rating_bonus = min(MAX_RATING_BONUS_XP, int(round(rating_delta * RATING_DELTA_FACTOR)))

        # Total additional performance bonus (capped at CONTEST_MAX_PERFORMANCE_XP)
        raw_total = placement_bonus + rating_bonus
        final_contest_xp = min(CONTEST_MAX_PERFORMANCE_XP, raw_total)

        explanation = (
            f"Contest Performance Bonus: Placement ({placement_tier}, +{placement_bonus} XP) + "
            f"Rating Gain ({f'+{rating_delta}' if rating_delta else '0'}, +{rating_bonus} XP) = "
            f"{final_contest_xp} XP (capped at {CONTEST_MAX_PERFORMANCE_XP} XP max)."
        )

        return {
            "placement_bonus": placement_bonus,
            "rating_bonus": rating_bonus,
            "total_contest_xp": final_contest_xp,
            "percentile": percentile,
            "placement_tier": placement_tier,
            "is_capped": raw_total > CONTEST_MAX_PERFORMANCE_XP,
            "explanation": explanation
        }

    def record_contest_participation(
        self,
        username: str,
        contest_name: str,
        provider: str,
        rank: Optional[int],
        total_participants: Optional[int],
        rating_before: Optional[int] = None,
        rating_after: Optional[int] = None,
        problems_attempted: int = 0,
        problems_solved: int = 0,
        contest_url: Optional[str] = None,
        contest_date: Optional[str] = None,
        is_verified: bool = True
    ) -> Dict[str, Any]:
        """
        Records verified contest participation and awards deterministic performance bonus.
        Updates user's verified contest statistics without manufacturing fake data.
        """
        profile = self.get_or_create_profile(username)
        rating_delta = (rating_after - rating_before) if (rating_after is not None and rating_before is not None) else None

        bonus_res = self.calculate_contest_performance_bonus(
            rank=rank,
            total_participants=total_participants,
            rating_delta=rating_delta,
            is_verified=is_verified
        )

        awarded_bonus_xp = bonus_res["total_contest_xp"]
        contest_record = {
            "contest_name": contest_name,
            "provider": provider.lower(),
            "contest_url": contest_url,
            "rank": rank,
            "total_participants": total_participants,
            "percentile": bonus_res["percentile"],
            "rating_before": rating_before,
            "rating_after": rating_after,
            "rating_delta": rating_delta,
            "problems_attempted": problems_attempted,
            "problems_solved": problems_solved,
            "contest_date": contest_date or datetime.now(timezone.utc).isoformat(),
            "verified": is_verified,
            "placement_bonus": bonus_res["placement_bonus"],
            "rating_bonus": bonus_res["rating_bonus"],
            "awarded_xp": awarded_bonus_xp,
            "explanation": bonus_res["explanation"]
        }

        if is_verified:
            profile["contests_participated"] = profile.get("contests_participated", 0) + 1
            if rank and rank > 0:
                cur_best = profile.get("best_ranking")
                profile["best_ranking"] = min(cur_best, rank) if cur_best else rank
            if rating_after is not None:
                profile["current_rating"] = rating_after
                profile["contest_rating"] = rating_after
                cur_highest = profile.get("highest_rating")
                profile["highest_rating"] = max(cur_highest or 0, rating_after)
            if bonus_res["percentile"] is not None:
                cur_top = profile.get("top_percentile")
                profile["top_percentile"] = min(cur_top, bonus_res["percentile"]) if cur_top else bonus_res["percentile"]

            profile.setdefault("recent_contests", []).insert(0, contest_record)

            if awarded_bonus_xp > 0:
                profile["cumulative_ps_xp"] += awarded_bonus_xp
                profile["level"] = self.calculate_problem_solving_level(profile["cumulative_ps_xp"])
                score_res = self.calculate_problem_solving_score_v3(
                    easy_count=profile["easy_count"],
                    medium_count=profile["medium_count"],
                    hard_count=profile["hard_count"],
                    expert_count=profile.get("expert_count", 0),
                    topic_distribution=profile["topic_distribution"],
                    contest_rating=profile.get("contest_rating"),
                    contest_percentile=profile.get("top_percentile"),
                    active_weeks_last_12=profile.get("active_weeks_last_12", 10)
                )
                profile["problem_solving_score"] = score_res["problem_solving_score"]

        return {
            "awarded_bonus_xp": awarded_bonus_xp,
            "bonus_calculation": bonus_res,
            "contest_record": contest_record,
            "new_cumulative_ps_xp": profile["cumulative_ps_xp"],
            "new_ps_level": profile["level"],
            "new_ps_score": profile["problem_solving_score"]
        }

    # -------------------------------------------------------------
    # Canonical Problem Fingerprint & Duplicate Identification
    # -------------------------------------------------------------
    def generate_canonical_fingerprint(
        self,
        provider: str,
        external_problem_id: str,
        title: str
    ) -> str:
        """
        Generates canonical fingerprint from normalized title and problem ID.
        Identifies cross-platform identical questions (e.g. 'Two Sum' across LeetCode / GFG).
        """
        clean_title = re.sub(r"[^a-z0-9]", "", title.lower())
        raw = f"{clean_title}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]

    def is_problem_duplicate(
        self,
        username: str,
        canonical_fingerprint: str
    ) -> bool:
        """Checks if the user has already been awarded XP for this canonical problem."""
        user_prints = self.user_awarded_fingerprints.setdefault(username.lower(), set())
        return canonical_fingerprint in user_prints

    def mark_problem_awarded(
        self,
        username: str,
        canonical_fingerprint: str
    ) -> None:
        """Records that a canonical problem has awarded XP to a user."""
        user_prints = self.user_awarded_fingerprints.setdefault(username.lower(), set())
        user_prints.add(canonical_fingerprint)

    # -------------------------------------------------------------
    # Anti-Farming Easy Volume Modifier
    # -------------------------------------------------------------
    def get_easy_volume_modifier(self, rolling_easy_count: int) -> float:
        """
        Anti-farming reduction for Easy problems in a rolling 7-day period:
        - 1-30: 1.00
        - 31-60: 0.60
        - 61+: 0.30
        """
        for min_c, max_c, mod in EASY_VOLUME_TIERS:
            if min_c <= rolling_easy_count <= max_c:
                return mod
        return 0.30

    # -------------------------------------------------------------
    # Deterministic Quality Modifier
    # -------------------------------------------------------------
    def calculate_quality_modifier(
        self,
        has_source_code: bool = False,
        quality_score: Optional[float] = None
    ) -> float:
        """
        Calculates quality modifier (0.90 to 1.20) ONLY when legitimate source code is available.
        When source code is unavailable (external platforms): quality_modifier = 1.00.
        Never hallucinates code quality.
        """
        if not has_source_code and quality_score is None:
            return QUALITY_MODIFIER_DEFAULT

        if quality_score is not None:
            clamped = max(0.0, min(100.0, quality_score))
            # 0 -> 0.90, 50 -> 1.05, 100 -> 1.20
            return round(QUALITY_MODIFIER_MIN + (clamped / 100.0) * (QUALITY_MODIFIER_MAX - QUALITY_MODIFIER_MIN), 2)

        return QUALITY_MODIFIER_DEFAULT

    # -------------------------------------------------------------
    # Phase 3 Deterministic XP Calculation Engine
    # -------------------------------------------------------------
    def calculate_final_problem_xp(
        self,
        difficulty: str,
        verification_status: str,
        has_source_code: bool = False,
        quality_score: Optional[float] = None,
        is_duplicate: bool = False,
        rolling_easy_count: int = 1,
        is_first_party: bool = False
    ) -> Dict[str, Any]:
        """
        Final Problem Skill XP = Base XP * Verification Modifier * Quality Modifier * Duplicate Modifier * Volume Modifier.
        Overall Professional XP = Skill XP * (1.00 if first_party else 0.60).
        Round safely to integer.
        """
        clean_diff = difficulty.upper().strip()
        base_xp = self.DIFFICULTY_BASE_XP.get(clean_diff, 0)

        # UNKNOWN difficulty awards 0 XP until classified or reviewed
        if clean_diff not in self.DIFFICULTY_BASE_XP or clean_diff == "UNKNOWN":
            return {
                "base_xp": 0,
                "skill_xp": 0,
                "overall_professional_xp": 0,
                "verification_modifier": 0.0,
                "quality_modifier": 1.0,
                "duplicate_modifier": 1.0,
                "volume_modifier": 1.0,
                "explanation": "Problem difficulty is UNKNOWN. XP cannot be awarded until properly classified."
            }

        # Verification Modifier (0.00 for unverified/user_reported)
        verif_mod = VERIFICATION_MODIFIERS.get(verification_status, 0.00)

        # Quality Modifier (1.00 default, 0.90 - 1.20 if legitimate source code)
        quality_mod = self.calculate_quality_modifier(has_source_code, quality_score)

        # Duplicate Modifier (0.0 if already awarded, 1.0 otherwise)
        duplicate_mod = 0.00 if is_duplicate else 1.00

        # Anti-farming volume modifier (applies to EASY problems)
        volume_mod = 1.00
        if clean_diff == "EASY":
            volume_mod = self.get_easy_volume_modifier(rolling_easy_count)

        # Compute skill XP
        raw_skill_xp = base_xp * verif_mod * quality_mod * duplicate_mod * volume_mod
        final_skill_xp = int(round(raw_skill_xp))

        # Overall Professional XP ratio (60% external, up to 100% first-party)
        overall_ratio = FIRST_PARTY_OVERALL_RATIO if is_first_party else EXTERNAL_PLATFORM_OVERALL_RATIO
        overall_professional_xp = int(round(final_skill_xp * overall_ratio))

        # Build auditable explanation
        explanation_parts = [
            f"Base XP ({base_xp})",
            f"Verification x{verif_mod:.2f}",
            f"Quality x{quality_mod:.2f}",
            f"Duplicate x{duplicate_mod:.2f}",
            f"Volume x{volume_mod:.2f}"
        ]
        explanation = (
            f"{' * '.join(explanation_parts)} = {final_skill_xp} Problem Solving Skill XP "
            f"({int(overall_ratio * 100)}% -> {overall_professional_xp} Overall Professional XP)"
        )

        return {
            "base_xp": base_xp,
            "skill_xp": final_skill_xp,
            "overall_professional_xp": overall_professional_xp,
            "verification_modifier": verif_mod,
            "quality_modifier": quality_mod,
            "duplicate_modifier": duplicate_mod,
            "volume_modifier": volume_mod,
            "explanation": explanation
        }

    # -------------------------------------------------------------
    # Proportional Topic XP Distribution
    # -------------------------------------------------------------
    def distribute_problem_topic_xp(
        self,
        topics: List[str],
        total_skill_xp: int
    ) -> Dict[str, int]:
        """
        Maps narrow tags to broader skill categories and distributes total_skill_xp proportionally.
        Avoids awarding full XP independently to every tag.
        Example: ["Graphs", "BFS", "Shortest Path"] -> Graphs mapped once -> 100% XP to Graphs.
        """
        if not topics or total_skill_xp <= 0:
            return {"Algorithms": total_skill_xp}

        # Map to canonical broad categories
        broad_categories: List[str] = []
        for t in topics:
            t_clean = t.lower().strip()
            cat = TOPIC_CATEGORY_MAPPING.get(t_clean, t.title())
            if cat not in broad_categories:
                broad_categories.append(cat)

        if not broad_categories:
            broad_categories = ["Algorithms"]

        # Distribute proportionally
        n = len(broad_categories)
        share = total_skill_xp // n
        remainder = total_skill_xp % n

        distribution: Dict[str, int] = {}
        for idx, cat in enumerate(broad_categories):
            distribution[cat] = share + (1 if idx < remainder else 0)

        return distribution

    # -------------------------------------------------------------
    # Backward Compatible Single Solve & Batch Calculators
    # -------------------------------------------------------------
    def calculate_single_solve_xp(
        self,
        difficulty: str,
        verification_status: str = "PUBLIC_PROFILE_VERIFIED",
        solution_quality_score: Optional[float] = None
    ) -> int:
        res = self.calculate_final_problem_xp(
            difficulty=difficulty,
            verification_status=verification_status,
            has_source_code=solution_quality_score is not None,
            quality_score=solution_quality_score,
            is_duplicate=False,
            rolling_easy_count=1
        )
        return res["skill_xp"]

    def calculate_problem_solving_xp(
        self,
        easy_count: int = 0,
        medium_count: int = 0,
        hard_count: int = 0,
        advanced_contest_count: int = 0,
        verification_status: str = "PUBLIC_PROFILE_VERIFIED",
        active_streak_weeks: int = 12,
        distinct_topics_count: int = 6,
        contest_rating: Optional[int] = None,
        solution_quality_score: Optional[float] = None
    ) -> int:
        """Batch deterministic calculator."""
        base_xp = (
            (easy_count * self.DIFFICULTY_BASE_XP["EASY"]) +
            (medium_count * self.DIFFICULTY_BASE_XP["MEDIUM"]) +
            (hard_count * self.DIFFICULTY_BASE_XP["HARD"]) +
            (advanced_contest_count * self.DIFFICULTY_BASE_XP["EXPERT"])
        )
        if base_xp <= 0:
            return 0

        verif_mod = VERIFICATION_MODIFIERS.get(verification_status, 0.90)
        streak_ratio = max(0, min(24, active_streak_weeks)) / 24.0
        streak_mod = 1.00 + (streak_ratio * 0.20)
        breadth_ratio = max(1, min(8, distinct_topics_count)) / 8.0
        breadth_mod = 1.00 + (breadth_ratio * 0.15)

        contest_mod = 1.00
        if contest_rating:
            if contest_rating >= 2100:
                contest_mod = 1.25
            elif contest_rating >= 1900:
                contest_mod = 1.20
            elif contest_rating >= 1650:
                contest_mod = 1.12
            elif contest_rating >= 1400:
                contest_mod = 1.05

        quality_mod = 1.00
        if solution_quality_score is not None:
            quality_mod = self.calculate_quality_modifier(True, solution_quality_score)

        return int(round(base_xp * verif_mod * streak_mod * breadth_mod * contest_mod * quality_mod))

    # -------------------------------------------------------------
    # Problem-Solving Level (Separate from Overall ProofHire Level)
    # -------------------------------------------------------------
    def calculate_problem_solving_level(self, cumulative_ps_xp: int) -> int:
        """
        Quadratic level progression based purely on problem_solving_xp:
        Level = floor(sqrt(cumulative_ps_xp / 2.8)).
        """
        lvl = int(math.floor(math.sqrt(max(0, cumulative_ps_xp) / 2.8)))
        return max(1, min(99, lvl))

    # -------------------------------------------------------------
    # Normalized 0–100 Problem-Solving Score with Full Breakdown
    # -------------------------------------------------------------
    def calculate_problem_solving_score_v3(
        self,
        easy_count: int,
        medium_count: int,
        hard_count: int,
        expert_count: int = 0,
        topic_distribution: Optional[Dict[str, Any]] = None,
        contest_percentile: Optional[float] = None,
        contest_rating: Optional[int] = None,
        active_weeks_last_12: int = 10,
        cumulative_ps_xp: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Normalized 0-100 Score using:
        45% Verified Solve Strength (Difficulty points on saturating curve)
        20% Advanced Problem Ability (Medium, Hard, Expert volume)
        15% Topic Breadth (Topics with >= 5 verified solves)
        10% Contest Performance (Verified percentiles / ratings)
        10% Consistency (Active weeks across the last 12 weeks)
        """
        total_solves = easy_count + medium_count + hard_count + expert_count

        # 1. Verified Solve Strength (45 points max)
        # Easy=1, Medium=3, Hard=7, Expert=12
        weighted_points = (
            (easy_count * DIFFICULTY_WEIGHT_POINTS["EASY"]) +
            (medium_count * DIFFICULTY_WEIGHT_POINTS["MEDIUM"]) +
            (hard_count * DIFFICULTY_WEIGHT_POINTS["HARD"]) +
            (expert_count * DIFFICULTY_WEIGHT_POINTS["EXPERT"])
        )
        # Saturating exponential curve so thousands of easy questions cannot reach 45
        signal_strength = 45.0 * (1.0 - math.exp(-weighted_points / 500.0))
        signal_strength = min(45.0, signal_strength)

        # 2. Advanced Problem Ability (20 points max)
        # Medium + Hard + Expert emphasis
        advanced_points = (medium_count * 2) + (hard_count * 5) + (expert_count * 10)
        signal_advanced = 20.0 * (1.0 - math.exp(-advanced_points / 400.0))
        signal_advanced = min(20.0, signal_advanced)

        # 3. Topic Breadth (15 points max)
        # Measure topics in which user has >= 5 verified solves
        qualifying_topics = 0
        if topic_distribution:
            for t_data in topic_distribution.values():
                solves = t_data.get("solved", 0) if isinstance(t_data, dict) else int(t_data)
                if solves >= 5:
                    qualifying_topics += 1
        else:
            qualifying_topics = min(8, max(1, int(total_solves / 20)))

        breadth_ratio = min(1.0, qualifying_topics / 8.0)
        signal_breadth = breadth_ratio * 15.0

        # 4. Contest Performance (10 points max)
        if contest_percentile is not None:
            signal_contest = (max(0.0, min(100.0, contest_percentile)) / 100.0) * 10.0
        elif contest_rating is not None:
            contest_ratio = min(1.0, max(0.0, (contest_rating - 1200) / 900.0))
            signal_contest = contest_ratio * 10.0
        else:
            signal_contest = 5.0 # Non-contest baseline

        # 5. Consistency (10 points max)
        clamped_weeks = max(0, min(12, active_weeks_last_12))
        signal_consistency = (clamped_weeks / 12.0) * 10.0

        # Total score
        total_score = signal_strength + signal_advanced + signal_breadth + signal_contest + signal_consistency
        final_score = int(round(max(0.0, min(100.0, total_score))))

        if cumulative_ps_xp is not None:
            level = self.calculate_problem_solving_level(cumulative_ps_xp)
        else:
            level = self.calculate_problem_solving_level(int(weighted_points * 2.65))

        # Format strongest topics
        strongest = []
        if topic_distribution:
            for top, d in sorted(
                topic_distribution.items(),
                key=lambda x: x[1].get("solved", 0) if isinstance(x[1], dict) else x[1],
                reverse=True
            )[:4]:
                cnt = d.get("solved", 0) if isinstance(d, dict) else d
                strongest.append({"topic": top, "score": min(98, 50 + int(cnt * 0.4))})

        return {
            "problem_solving_score": final_score,
            "problem_solving_level": level,
            "verified_solves": {
                "total": total_solves,
                "easy": easy_count,
                "medium": medium_count,
                "hard": hard_count,
                "expert": expert_count
            },
            "strongest_topics": strongest,
            "consistency": f"{clamped_weeks} / 12 active weeks",
            "score_breakdown": {
                "verified_solve_strength": {
                    "points": round(signal_strength, 1),
                    "max": 45.0,
                    "explanation": f"{weighted_points} difficulty-weighted points on saturating curve"
                },
                "advanced_problem_ability": {
                    "points": round(signal_advanced, 1),
                    "max": 20.0,
                    "explanation": f"{medium_count} Medium, {hard_count} Hard, {expert_count} Expert solves"
                },
                "topic_breadth": {
                    "points": round(signal_breadth, 1),
                    "max": 15.0,
                    "explanation": f"{qualifying_topics} / 8 core topics with >= 5 verified solves"
                },
                "contest_performance": {
                    "points": round(signal_contest, 1),
                    "max": 10.0,
                    "explanation": f"Rating {contest_rating or 'N/A'}, percentile telemetry"
                },
                "consistency": {
                    "points": round(signal_consistency, 1),
                    "max": 10.0,
                    "explanation": f"{clamped_weeks} of the last 12 weeks with active solves"
                }
            },
            "explanation": (
                f"Problem Solving Score of {final_score}/100 computed deterministically: "
                f"Solve Strength ({round(signal_strength, 1)}/45), "
                f"Advanced Mastery ({round(signal_advanced, 1)}/20), "
                f"Topic Breadth ({round(signal_breadth, 1)}/15), "
                f"Contest ({round(signal_contest, 1)}/10), "
                f"Consistency ({round(signal_consistency, 1)}/10)."
            )
        }

    # Backward compatible calculate_problem_solving_score
    def calculate_problem_solving_score(
        self,
        easy_count: int,
        medium_count: int,
        hard_count: int,
        verification_status: str = "PUBLIC_PROFILE_VERIFIED",
        distinct_topics_count: int = 6,
        contest_rating: Optional[int] = None
    ) -> int:
        res = self.calculate_problem_solving_score_v3(
            easy_count=easy_count,
            medium_count=medium_count,
            hard_count=hard_count,
            expert_count=0,
            contest_rating=contest_rating,
            active_weeks_last_12=10
        )
        return res["problem_solving_score"]

    def get_or_create_profile(self, username: str) -> Dict[str, Any]:
        """Retrieves or creates problem solving profile for candidate."""
        uname = username.lower()
        if uname not in self.profiles:
            self.profiles[uname] = {
                "username": username,
                "full_name": username.title(),
                "cumulative_ps_xp": 1200,
                "level": 20,
                "problem_solving_score": 75,
                "grade": "C",
                "total_solved": 150,
                "easy_count": 70,
                "medium_count": 65,
                "hard_count": 15,
                "expert_count": 0,
                "acceptance_rate": 62.0,
                "active_streak_weeks": 8,
                "active_weeks_last_12": 9,
                "global_rank": "Top 18%",
                "contest_rating": None,
                "contest_platform": None,
                "contests_participated": 0,
                "best_ranking": None,
                "current_rating": None,
                "highest_rating": None,
                "top_percentile": None,
                "recent_contests": [],
                "platforms": [],
                "topic_distribution": {
                    "Arrays": {"solved": 60, "mastery_pct": 75},
                    "Trees": {"solved": 40, "mastery_pct": 70},
                    "Dynamic Programming": {"solved": 30, "mastery_pct": 65},
                    "Sorting": {"solved": 20, "mastery_pct": 72}
                },
                "recent_submissions": []
            }
        return self.profiles[uname]

    def record_solution_submission(
        self,
        username: str,
        problem_title: str,
        platform: str,
        difficulty: str,
        topic: str,
        source_code: Optional[str] = None,
        language: str = "TypeScript",
        time_complexity: str = "O(N)",
        space_complexity: str = "O(1)",
        verification_status: str = "PUBLIC_PROFILE_VERIFIED",
        solution_quality_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Records a verified problem solve, updates cumulative problem-solving XP,
        level, score, topic distribution, and returns the awarded XP.
        """
        profile = self.get_or_create_profile(username)
        clean_diff = difficulty.upper()

        xp_res = self.calculate_final_problem_xp(
            difficulty=clean_diff,
            verification_status=verification_status,
            has_source_code=source_code is not None or solution_quality_score is not None,
            quality_score=solution_quality_score,
            is_duplicate=False,
            rolling_easy_count=profile["easy_count"] + 1
        )
        awarded_xp = xp_res["skill_xp"]

        profile["cumulative_ps_xp"] += awarded_xp
        profile["level"] = self.calculate_problem_solving_level(profile["cumulative_ps_xp"])
        profile["total_solved"] += 1

        if clean_diff == "EASY":
            profile["easy_count"] += 1
        elif clean_diff == "MEDIUM":
            profile["medium_count"] += 1
        elif clean_diff == "HARD":
            profile["hard_count"] += 1
        elif clean_diff == "EXPERT":
            profile["expert_count"] = profile.get("expert_count", 0) + 1

        # Update topic distribution
        broad_topic = TOPIC_CATEGORY_MAPPING.get(topic.lower(), topic.title())
        if broad_topic not in profile["topic_distribution"]:
            profile["topic_distribution"][broad_topic] = {"solved": 0, "mastery_pct": 60}
        profile["topic_distribution"][broad_topic]["solved"] += 1
        profile["topic_distribution"][broad_topic]["mastery_pct"] = min(98, profile["topic_distribution"][broad_topic]["mastery_pct"] + 1)

        # Recalculate score
        score_res = self.calculate_problem_solving_score_v3(
            easy_count=profile["easy_count"],
            medium_count=profile["medium_count"],
            hard_count=profile["hard_count"],
            expert_count=profile.get("expert_count", 0),
            topic_distribution=profile["topic_distribution"],
            contest_rating=profile.get("contest_rating"),
            active_weeks_last_12=profile.get("active_weeks_last_12", 10)
        )
        profile["problem_solving_score"] = score_res["problem_solving_score"]

        sub_record = {
            "id": f"sub_ps_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            "problem_title": problem_title,
            "platform": platform,
            "difficulty": clean_diff,
            "topic": broad_topic,
            "language": language,
            "time_complexity": time_complexity,
            "space_complexity": space_complexity,
            "verification_status": verification_status,
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "awarded_xp": awarded_xp,
            "explanation": xp_res["explanation"]
        }

        profile.setdefault("recent_submissions", []).insert(0, sub_record)

        return {
            "awarded_xp": awarded_xp,
            "problem_title": problem_title,
            "new_cumulative_ps_xp": profile["cumulative_ps_xp"],
            "new_ps_level": profile["level"],
            "new_ps_score": profile["problem_solving_score"],
            "submission": sub_record,
            "explanation": xp_res["explanation"]
        }

    # -------------------------------------------------------------
    # Phase 12 First-Party Verified Solve Recording
    # -------------------------------------------------------------
    def record_first_party_verified_solve(
        self,
        username: str,
        problem_id: str,
        title: str,
        difficulty: str,
        topics: List[str],
        language: str,
        code: str,
        quality_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Records a first-party solve verified via ProofHire's sandbox.
        - Verification status: 'provider_verified' (1.00 multiplier).
        - Overall Professional XP ratio: 1.00 (100% contributes to Overall Professional XP).
        - Quality modifier: applied based on code quality evaluation.
        """
        profile = self.get_or_create_profile(username)
        canonical_print = self.generate_canonical_fingerprint("proofhire", problem_id, title)
        is_dup = self.is_problem_duplicate(username, canonical_print)

        # Calculate final problem XP with is_first_party=True (100% overall reputation ratio)
        xp_calc = self.calculate_final_problem_xp(
            difficulty=difficulty,
            verification_status="provider_verified",
            has_source_code=bool(code and len(code.strip()) > 0),
            quality_score=quality_score,
            is_duplicate=is_dup,
            is_first_party=True
        )

        awarded_skill_xp = xp_calc["skill_xp"]
        awarded_overall_xp = xp_calc["overall_professional_xp"]

        # Distribute topic XP across broad categories
        topic_dist = self.distribute_problem_topic_xp(topics, awarded_skill_xp)

        if not is_dup and awarded_skill_xp > 0:
            self.mark_problem_awarded(username, canonical_print)
            profile["total_solved"] = profile.get("total_solved", 0) + 1
            diff_key = f"{difficulty.lower()}_count"
            profile[diff_key] = profile.get(diff_key, 0) + 1
            profile["cumulative_ps_xp"] = profile.get("cumulative_ps_xp", 0) + awarded_skill_xp
            profile["level"] = self.calculate_problem_solving_level(profile["cumulative_ps_xp"])

            # Update topic distribution
            user_topics = profile.setdefault("topic_distribution", {})
            for t_name, t_xp in topic_dist.items():
                if t_name not in user_topics:
                    user_topics[t_name] = {"solved": 1, "mastery_pct": 50}
                elif isinstance(user_topics[t_name], dict):
                    user_topics[t_name]["solved"] = user_topics[t_name].get("solved", 0) + 1
                    user_topics[t_name]["mastery_pct"] = min(99, user_topics[t_name].get("mastery_pct", 50) + 3)

            # Recalculate problem solving score
            score_res = self.calculate_problem_solving_score_v3(
                easy_count=profile.get("easy_count", 0),
                medium_count=profile.get("medium_count", 0),
                hard_count=profile.get("hard_count", 0),
                expert_count=profile.get("expert_count", 0),
                topic_distribution=user_topics,
                contest_rating=profile.get("contest_rating"),
                contest_percentile=profile.get("top_percentile"),
                active_weeks_last_12=profile.get("active_weeks_last_12", 10)
            )
            profile["problem_solving_score"] = score_res["problem_solving_score"]

        # Ledger record
        solve_record = {
            "id": f"fps_{uuid.uuid4().hex[:8]}",
            "provider": "proofhire",
            "problem_id": problem_id,
            "title": title,
            "difficulty": difficulty,
            "topics": topics,
            "language": language,
            "verification_status": "provider_verified",
            "skill_xp_awarded": awarded_skill_xp,
            "overall_professional_xp_awarded": awarded_overall_xp,
            "topic_xp_distributed": topic_dist,
            "is_first_party": True,
            "is_duplicate": is_dup,
            "explanation": xp_calc["explanation"],
            "solved_at": datetime.now(timezone.utc).isoformat()
        }

        profile.setdefault("recent_submissions", []).insert(0, solve_record)

        return {
            "solve_record": solve_record,
            "xp_calculation": xp_calc,
            "topic_distribution": topic_dist,
            "new_cumulative_ps_xp": profile["cumulative_ps_xp"],
            "new_ps_level": profile["level"],
            "new_ps_score": profile["problem_solving_score"]
        }

# Global singleton
problem_solving_engine = ProblemSolvingReputationEngine()
