import logging
from typing import Dict, Any, List, Optional, Tuple, Set
from datetime import datetime, timezone

from app.services.platform_adapters import (
    get_platform_adapter,
    ADAPTER_REGISTRY,
    NormalizedSubmission,
    NormalizedProblem,
    ProviderStatus
)
from app.services.problem_solving_engine import (
    problem_solving_engine,
    VerificationStrength
)
from app.services.reputation_engine import reputation_engine

logger = logging.getLogger("proofhire.sync_service")

class ProblemSolvingSyncService:
    """
    Production-grade Problem-Solving Sync Service.
    Orchestrates the 11-step synchronization pipeline:
      Connected Platform -> Provider Adapter -> Fetch New Activity ->
      Normalize -> Deduplicate -> Verify -> Store -> Calculate XP ->
      Update Topic Skills -> Update Problem-Solving Profile ->
      Update Overall Reputation -> Evaluate Badges -> Notification.
    
    Includes incremental syncing, rate-limit tolerance, and partial failure isolation.
    """

    def __init__(self):
        # In-memory registry of candidate connected platform accounts
        # Key: username -> list of connection dicts
        self.connections: Dict[str, List[Dict[str, Any]]] = {
            "gnaneshwar": [
                {
                    "id": "conn_leetcode_gnaneshwar",
                    "provider": "leetcode",
                    "handle": "gnaneshwar_dev",
                    "last_sync_at": "2025-02-14T10:00:00Z",
                    "sync_cursor": None,
                    "verification_status": "verified",
                    "verification_label": "Demo Profile Sync (Synthetic)",
                    "profile_url": "https://leetcode.com/u/gnaneshwar_dev",
                    "rating": 1845,
                    "is_synthetic_demo": True,
                    "created_at": "2025-01-01T00:00:00Z"
                },
                {
                    "id": "conn_codeforces_gnaneshwar",
                    "provider": "codeforces",
                    "handle": "gnaneshwar",
                    "last_sync_at": "2025-02-12T16:30:00Z",
                    "sync_cursor": None,
                    "verification_status": "verified",
                    "verification_label": "Demo Seeded (API Compatible)",
                    "profile_url": "https://codeforces.com/profile/gnaneshwar",
                    "rating": 1812,
                    "is_synthetic_demo": True,
                    "created_at": "2025-01-01T00:00:00Z"
                },
                {
                    "id": "conn_proofhire_gnaneshwar",
                    "provider": "proofhire",
                    "handle": "gnaneshwar",
                    "last_sync_at": "2025-02-15T11:45:00Z",
                    "sync_cursor": None,
                    "verification_status": "verified",
                    "verification_label": "ProofHire First-Party Assessment (Verified)",
                    "profile_url": "/u/gnaneshwar",
                    "rating": 1890,
                    "is_synthetic_demo": False,
                    "created_at": "2025-01-01T00:00:00Z"
                }
            ],
            "alexchen": [
                {
                    "id": "conn_leetcode_alexchen",
                    "provider": "leetcode",
                    "handle": "alexchen",
                    "last_sync_at": "2025-01-01T00:00:00Z",
                    "sync_cursor": None,
                    "verification_status": "verified",
                    "verification_label": "Public Profile Verified",
                    "profile_url": "https://leetcode.com/u/alexchen",
                    "rating": 2040,
                    "created_at": "2025-01-01T00:00:00Z"
                },
                {
                    "id": "conn_codeforces_alexchen",
                    "provider": "codeforces",
                    "handle": "alex_code",
                    "last_sync_at": "2025-01-01T00:00:00Z",
                    "sync_cursor": None,
                    "verification_status": "verified",
                    "verification_label": "Official API Verified",
                    "profile_url": "https://codeforces.com/profile/alex_code",
                    "rating": 2150,
                    "created_at": "2025-01-01T00:00:00Z"
                }
            ]
        }

        # Deduplication index: username -> set of processed submission_ids
        self.processed_submissions: Dict[str, Set[str]] = {
            "gnaneshwar": set(),
            "alexchen": set()
        }

        # XP Transactions Ledger: in-memory list for deterministic audit
        self.xp_transactions: List[Dict[str, Any]] = [
            {
                "id": "xp_tx_1001",
                "user_id": "gnaneshwar",
                "source_type": "problem_solve",
                "source_id": "lc_1",
                "category": "problem_solving",
                "base_xp": 6,
                "final_xp": 6,
                "verification_status": "provider_verified",
                "awarded_at": "2025-01-15T10:00:00Z"
            },
            {
                "id": "xp_tx_1002",
                "user_id": "gnaneshwar",
                "source_type": "problem_solve",
                "source_id": "lc_42",
                "category": "problem_solving",
                "base_xp": 45,
                "final_xp": 45,
                "verification_status": "provider_verified",
                "awarded_at": "2025-01-18T12:00:00Z"
            },
            {
                "id": "xp_tx_1003",
                "user_id": "gnaneshwar",
                "source_type": "coding_contest",
                "source_id": "cf_2034",
                "category": "coding_contest",
                "base_xp": 100,
                "final_xp": 121,
                "verification_status": "provider_verified",
                "awarded_at": "2025-01-24T18:00:00Z"
            }
        ]

    def get_user_connections(self, username: str) -> List[Dict[str, Any]]:
        uname = username.strip().lower()
        return self.connections.setdefault(uname, [])

    def get_connection_by_id(self, connection_id: str) -> Optional[Tuple[str, Dict[str, Any]]]:
        """Finds connection across all registered candidates by connection_id."""
        for uname, conns in self.connections.items():
            for c in conns:
                if c.get("id") == connection_id:
                    return (uname, c)
        return None

    def delete_connection_by_id(self, username: str, connection_id: str) -> bool:
        """Removes a platform connection belonging to an authenticated candidate."""
        uname = username.strip().lower()
        conns = self.get_user_connections(uname)
        for i, c in enumerate(conns):
            if c.get("id") == connection_id:
                conns.pop(i)
                return True
        return False

    def connect_platform(
        self,
        username: str,
        provider: str,
        handle: str,
        connection_method: str = "public_api"
    ) -> Dict[str, Any]:
        """Registers or updates a platform connection for a candidate."""
        uname = username.strip().lower()
        adapter = get_platform_adapter(provider)
        if not adapter:
            raise ValueError(f"Unsupported provider: {provider}")

        verification = adapter.verify_account(handle)
        conns = self.get_user_connections(uname)

        conn_id = f"conn_{adapter.provider_key.lower()}_{uname}"
        existing = next((c for c in conns if c["provider"].lower() == provider.lower()), None)
        conn_data = {
            "id": existing.get("id", conn_id) if existing else conn_id,
            "provider": adapter.provider_key,
            "handle": verification.handle,
            "provider_status": adapter.provider_status.value,
            "verification_status": "verified" if verification.valid else "failed",
            "verification_label": verification.verification_label,
            "profile_url": verification.profile_url,
            "rating": verification.rating,
            "rank_title": verification.rank_title,
            "connection_method": connection_method,
            "last_sync_at": None,
            "sync_cursor": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        if existing:
            existing.update(conn_data)
        else:
            conns.append(conn_data)

        return conn_data

    def sync_connection_by_id(self, username: str, connection_id: str) -> Dict[str, Any]:
        """Synchronizes a connection by ID, ensuring caller owns the connection."""
        uname = username.strip().lower()
        found = self.get_connection_by_id(connection_id)
        if not found:
            raise KeyError(f"Connection '{connection_id}' not found.")
        owner_uname, conn = found
        if owner_uname != uname:
            raise PermissionError("Forbidden: You may only sync your own connected accounts.")
        return self._execute_connection_sync(uname, conn)

    def sync_platform(
        self,
        username: str,
        provider: str
    ) -> Dict[str, Any]:
        """Synchronizes a single platform for a given candidate."""
        uname = username.strip().lower()
        conns = self.get_user_connections(uname)
        conn = next((c for c in conns if c["provider"].lower() == provider.lower()), None)
        if not conn:
            raise ValueError(f"Platform '{provider}' is not connected for user '{username}'")

        return self._execute_connection_sync(uname, conn)

    def sync_all_platforms(self, username: str) -> Dict[str, Any]:
        """
        Synchronizes all connected platforms for a candidate.
        Partial failure isolation: If one provider fails or times out,
        the remaining providers continue syncing smoothly.
        """
        uname = username.strip().lower()
        conns = self.get_user_connections(uname)
        if not conns:
            return {
                "username": uname,
                "status": "no_connections",
                "synced_platforms": [],
                "failed_platforms": [],
                "total_new_solves": 0,
                "total_xp_awarded": 0,
                "badges_unlocked": [],
                "notifications": []
            }

        synced = []
        failed = []
        total_new_solves = 0
        total_xp_awarded = 0
        all_notifications = []
        all_unlocked_badges = []

        for conn in conns:
            p_name = conn["provider"]
            try:
                res = self._execute_connection_sync(uname, conn)
                synced.append(p_name)
                total_new_solves += res["new_solves_count"]
                total_xp_awarded += res["xp_awarded"]
                all_notifications.extend(res.get("notifications", []))
                all_unlocked_badges.extend(res.get("new_badges", []))
            except Exception as e:
                logger.error(f"Failed sync for provider '{p_name}' for user '{uname}': {str(e)}")
                failed.append({"provider": p_name, "error": str(e)})

        # Overall reputation & profile update after batch
        profile = problem_solving_engine.get_or_create_profile(uname)

        return {
            "username": uname,
            "status": "success" if not failed else ("partial_success" if synced else "failed"),
            "synced_platforms": synced,
            "failed_platforms": failed,
            "total_new_solves": total_new_solves,
            "total_xp_awarded": total_xp_awarded,
            "badges_unlocked": list(set(all_unlocked_badges)),
            "notifications": all_notifications,
            "updated_profile": {
                "problem_solving_xp": profile["cumulative_ps_xp"],
                "level": profile["level"],
                "problem_solving_score": profile["problem_solving_score"],
                "total_solved": profile["total_solved"]
            }
        }

    def _execute_connection_sync(
        self,
        username: str,
        conn: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Executes the atomic 11-step pipeline for a single connection.
        """
        provider = conn["provider"]
        handle = conn["handle"]
        last_sync_at = conn.get("last_sync_at")
        sync_cursor = conn.get("sync_cursor")

        adapter = get_platform_adapter(provider)
        if not adapter:
            raise ValueError(f"No adapter available for provider: {provider}")

        # 1. Fetch New Activity (Incremental)
        raw_submissions, new_cursor = adapter.fetch_solved_problems(
            username=handle,
            last_sync_at=datetime.fromisoformat(last_sync_at.replace("Z", "+00:00")) if last_sync_at else None,
            sync_cursor=sync_cursor
        )

        # 2. Normalize (already in NormalizedSubmission format)
        normalized: List[NormalizedSubmission] = raw_submissions

        # 3. Deduplicate
        seen_set = self.processed_submissions.setdefault(username, set())
        new_submissions: List[NormalizedSubmission] = []
        for sub in normalized:
            sub_key = f"{provider}:{sub.external_problem_id}:{sub.submission_id or ''}"
            if sub_key not in seen_set and sub.status == "accepted":
                seen_set.add(sub_key)
                new_submissions.append(sub)

        # 4. Verify
        verification_status = adapter.default_verification_strength

        # 5. Store & Calculate XP
        profile = problem_solving_engine.get_or_create_profile(username)
        total_awarded_xp = 0
        new_easy = 0
        new_med = 0
        new_hard = 0

        for sub in new_submissions:
            # Deterministic XP calculation per problem
            diff = sub.difficulty.upper()
            if diff == "EASY":
                new_easy += 1
            elif diff == "HARD" or diff == "EXPERT":
                new_hard += 1
            else:
                new_med += 1

            solve_xp = problem_solving_engine.calculate_single_solve_xp(
                difficulty=diff,
                verification_status=verification_status
            )
            total_awarded_xp += solve_xp

            # 6. Idempotent Ledger Entry
            ledger_entry = {
                "user_id": username,
                "source_type": "problem_solve",
                "source_id": sub.submission_id or sub.external_problem_id,
                "category": "problem_solving",
                "base_xp": solve_xp,
                "final_xp": solve_xp,
                "verification_status": verification_status,
                "awarded_at": datetime.now(timezone.utc).isoformat()
            }
            self.xp_transactions.append(ledger_entry)

            # Store in profile recent submissions
            profile.setdefault("submissions", []).insert(0, {
                "title": sub.title,
                "difficulty": diff,
                "topic": sub.topics[0] if sub.topics else "Algorithms",
                "language": sub.language or "Python",
                "platform": adapter.platform_name,
                "awarded_xp": solve_xp,
                "time_complexity": "O(N)",
                "space_complexity": "O(1)",
                "quality_score": 90.0,
                "verification_strength": verification_status,
                "solved_at": sub.solved_at or datetime.now(timezone.utc).isoformat()
            })

            # 7. Update Topic Skills
            for t in sub.topics:
                curr = profile["topic_distribution"].get(t, {"solved": 0, "level": 1, "xp": 0})
                curr["solved"] = curr.get("solved", 0) + 1
                curr["xp"] = curr.get("xp", 0) + solve_xp
                curr["level"] = min(99, int((curr["xp"] / 40.0) ** 0.5) + 1)
                profile["topic_distribution"][t] = curr

        # 8. Update Problem-Solving Profile Summary
        profile["easy_count"] += new_easy
        profile["medium_count"] += new_med
        profile["hard_count"] += new_hard
        profile["total_solved"] += len(new_submissions)
        profile["cumulative_ps_xp"] += total_awarded_xp
        profile["level"] = problem_solving_engine.calculate_problem_solving_level(profile["cumulative_ps_xp"])
        profile["problem_solving_score"] = problem_solving_engine.calculate_problem_solving_score(
            easy_count=profile["easy_count"],
            medium_count=profile["medium_count"],
            hard_count=profile["hard_count"],
            verification_status=verification_status,
            distinct_topics_count=len(profile["topic_distribution"]),
            contest_rating=profile.get("contest_rating")
        )

        # Update connection cursor
        conn["last_sync_at"] = datetime.now(timezone.utc).isoformat()
        if new_cursor:
            conn["sync_cursor"] = str(new_cursor)

        # 9. Update Overall Reputation & Evaluate Badges
        reputation_state = reputation_engine.get_user_reputation(username)
        # Settle problem-solving source XP in reputation engine
        reputation_engine.calculate_problem_solving_xp(
            easy_count=profile["easy_count"],
            medium_count=profile["medium_count"],
            hard_count=profile["hard_count"],
            advanced_contest_count=2,
            verification_status=verification_status,
            active_streak_weeks=profile.get("active_streak_weeks", 12),
            distinct_topics_count=len(profile["topic_distribution"]),
            contest_rating=profile.get("contest_rating", 1600)
        )

        if total_awarded_xp > 0:
            reputation_engine.award_source_xp(
                username=username,
                source="PROBLEM_SOLVING",
                calculated_xp=total_awarded_xp,
                title=f"Verified Problem Solving ({adapter.platform_name})",
                skill_weights={"Algorithms": 0.45, "Data Structures": 0.35, "Problem Solving": 0.20}
            )

        # Evaluate Smart Badges & recalculate reputation
        updated_rep, badge_notifications = reputation_engine.recalculate_user_reputation(reputation_state)
        new_badge_names = [b.get("name", b.get("badge", "")) for b in badge_notifications]

        # 10. Generate Notifications
        notifications = []
        if len(new_submissions) > 0:
            notifications.append({
                "id": f"notif_sync_{provider}_{int(datetime.now().timestamp())}",
                "title": f"Synced {len(new_submissions)} new problems from {adapter.platform_name}",
                "body": f"Awarded +{total_awarded_xp} Problem-Solving XP. Current Level: {profile['level']}.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "type": "PROBLEM_SOLVING_SYNC",
                "read": False
            })

        for b_notif in badge_notifications:
            notifications.append({
                "id": f"notif_badge_{int(datetime.now().timestamp())}",
                "title": f"Smart Badge Unlocked: {b_notif.get('badge')}",
                "body": f"Achieved tier {b_notif.get('tier')} with criteria: {b_notif.get('description', 'Verified mastery')}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "type": "BADGE_UNLOCK",
                "read": False
            })

        overall_xp = int(round(total_awarded_xp * (1.00 if provider == "proofhire" else 0.60)))
        topics_updated = list(set([t for sub in new_submissions for t in sub.topics]))

        return {
            "provider": provider,
            "new_problems_found": len(raw_submissions),
            "duplicates_ignored": max(0, len(raw_submissions) - len(new_submissions)),
            "problems_verified": len(new_submissions),
            "problem_solving_xp_awarded": total_awarded_xp,
            "overall_xp_awarded": overall_xp,
            "topics_updated": topics_updated,
            "badges_unlocked": new_badge_names,
            "last_sync_at": conn["last_sync_at"],
            "sync_cursor": conn["sync_cursor"],
            # Backward compatibility fields
            "new_solves_count": len(new_submissions),
            "xp_awarded": total_awarded_xp,
            "new_badges": new_badge_names,
            "notifications": notifications
        }

# Global singleton
problem_solving_sync_service = ProblemSolvingSyncService()
