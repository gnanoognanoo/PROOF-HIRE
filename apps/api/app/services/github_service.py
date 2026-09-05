import hashlib
import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class GitHubAuditService:
    def __init__(self):
        # In-memory store for connected GitHub accounts: username -> github profile
        self.connected_accounts: Dict[str, Dict[str, Any]] = {
            "alexchen": {
                "username": "alexchen",
                "github_username": "alexchen",
                "name": "Alex Chen",
                "avatar_url": "https://avatars.githubusercontent.com/u/1024025?v=4",
                "bio": "Staff Distributed Systems Engineer. Raft, LSM-trees, Tokio, Linux kernel.",
                "public_repos": 48,
                "followers": 1820,
                "following": 320,
                "connected_at": "2024-01-15T10:00:00Z",
                "is_connected": True
            },
            "gnaneshwar": {
                "username": "gnaneshwar",
                "github_username": "gnaneshwar-dev",
                "name": "Gnaneshwar",
                "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces",
                "bio": "Full-Stack Architect & Core Engine Designer. Rust, TypeScript, Distributed Verification.",
                "public_repos": 34,
                "followers": 940,
                "following": 180,
                "connected_at": "2024-02-01T12:00:00Z",
                "is_connected": True
            }
        }

        # Curated repository database for realistic multi-signal audits
        self.mock_repos: Dict[str, Dict[str, Any]] = {
            "proofhire/proofhire-engine": {
                "name": "proofhire-engine",
                "full_name": "proofhire/proofhire-engine",
                "owner": "proofhire",
                "description": "Cryptographic Skill-Verification, Compiler-Level AST Audits, and Hiring Reputation Network.",
                "primary_language": "TypeScript",
                "languages": {
                    "TypeScript": {"bytes": 482000, "percentage": 58.4},
                    "Python": {"bytes": 224000, "percentage": 27.1},
                    "Solidity": {"bytes": 82000, "percentage": 9.9},
                    "Shell": {"bytes": 38000, "percentage": 4.6}
                },
                "created_at": "2024-01-10T08:30:00Z",
                "updated_at": "2024-11-20T17:45:00Z",
                "stars": 428,
                "forks": 64,
                "open_issues": 12,
                "default_branch": "main",
                "commits_count": 512,
                "pull_requests_count": 86,
                "contributors": [
                    {
                        "login": "gnaneshwar-dev",
                        "name": "Gnaneshwar",
                        "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces",
                        "role": "Lead Architect",
                        "commits": 230,
                        "additions": 28400,
                        "deletions": 6200,
                        "prs_opened": 42,
                        "prs_merged": 39,
                        "reviews_conducted": 34,
                        "active_weeks": 22,
                        "total_weeks": 24,
                        "tasks_completed": 18,
                        "total_assigned_tasks": 20,
                        "is_gpg_verified": True
                    },
                    {
                        "login": "arun-kumar",
                        "name": "Arun Kumar",
                        "avatar_url": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces",
                        "role": "Full-Stack Engineer",
                        "commits": 178,
                        "additions": 19200,
                        "deletions": 4800,
                        "prs_opened": 28,
                        "prs_merged": 26,
                        "reviews_conducted": 22,
                        "active_weeks": 19,
                        "total_weeks": 24,
                        "tasks_completed": 14,
                        "total_assigned_tasks": 16,
                        "is_gpg_verified": True
                    },
                    {
                        "login": "priya-sharma",
                        "name": "Priya Sharma",
                        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
                        "role": "Smart Contract & Systems Engineer",
                        "commits": 104,
                        "additions": 9800,
                        "deletions": 2100,
                        "prs_opened": 16,
                        "prs_merged": 15,
                        "reviews_conducted": 18,
                        "active_weeks": 14,
                        "total_weeks": 24,
                        "tasks_completed": 8,
                        "total_assigned_tasks": 9,
                        "is_gpg_verified": True
                    }
                ],
                "recent_commits": [
                    {"sha": "c7a8109d", "message": "feat(engine): deterministic reputation and 5-source XP calculation", "author": "Gnaneshwar", "date": "2024-11-20T16:30:00Z", "verified": True},
                    {"sha": "b4e9215f", "message": "feat(api): connect GitHub OAuth and repository audit pipeline", "author": "Arun Kumar", "date": "2024-11-19T14:15:00Z", "verified": True},
                    {"sha": "a1d3084c", "message": "feat(contracts): anchor verified reputation state to Polygon PoS", "author": "Priya Sharma", "date": "2024-11-18T11:20:00Z", "verified": True},
                    {"sha": "9e5c702a", "message": "refactor(ast): AST visitor for type check assertions", "author": "Gnaneshwar", "date": "2024-11-16T09:40:00Z", "verified": True}
                ],
                "pull_requests": [
                    {"id": 86, "title": "feat(reputation): multi-signal contribution scoring model", "author": "Gnaneshwar", "status": "MERGED", "created_at": "2024-11-19", "comments": 8},
                    {"id": 85, "title": "feat(collaboration): 6-tab workspace and real-time task tracker", "author": "Arun Kumar", "status": "MERGED", "created_at": "2024-11-17", "comments": 6},
                    {"id": 84, "title": "feat(polygon): proof registry gas optimization", "author": "Priya Sharma", "status": "MERGED", "created_at": "2024-11-15", "comments": 4}
                ]
            },
            "alexchen/hyper-raft": {
                "name": "hyper-raft",
                "full_name": "alexchen/hyper-raft",
                "owner": "alexchen",
                "description": "High-Throughput Raft Consensus Engine in Rust with lock-free pipelines and zero-allocation io_uring.",
                "primary_language": "Rust",
                "languages": {
                    "Rust": {"bytes": 620000, "percentage": 88.5},
                    "C": {"bytes": 45000, "percentage": 6.4},
                    "Shell": {"bytes": 35500, "percentage": 5.1}
                },
                "created_at": "2023-08-14T11:00:00Z",
                "updated_at": "2024-10-22T19:30:00Z",
                "stars": 924,
                "forks": 142,
                "open_issues": 8,
                "default_branch": "main",
                "commits_count": 384,
                "pull_requests_count": 62,
                "contributors": [
                    {
                        "login": "alexchen",
                        "name": "Alex Chen",
                        "avatar_url": "https://avatars.githubusercontent.com/u/1024025?v=4",
                        "role": "Lead Architect",
                        "commits": 298,
                        "additions": 34200,
                        "deletions": 5800,
                        "prs_opened": 46,
                        "prs_merged": 45,
                        "reviews_conducted": 28,
                        "active_weeks": 36,
                        "total_weeks": 40,
                        "tasks_completed": 24,
                        "total_assigned_tasks": 25,
                        "is_gpg_verified": True
                    },
                    {
                        "login": "sarahlin",
                        "name": "Sarah Lin",
                        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
                        "role": "Network Systems Engineer",
                        "commits": 56,
                        "additions": 6800,
                        "deletions": 1200,
                        "prs_opened": 10,
                        "prs_merged": 9,
                        "reviews_conducted": 14,
                        "active_weeks": 16,
                        "total_weeks": 40,
                        "tasks_completed": 8,
                        "total_assigned_tasks": 9,
                        "is_gpg_verified": True
                    },
                    {
                        "login": "marcusbell",
                        "name": "Marcus Bell",
                        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
                        "role": "Performance Engineer",
                        "commits": 30,
                        "additions": 3400,
                        "deletions": 650,
                        "prs_opened": 6,
                        "prs_merged": 6,
                        "reviews_conducted": 10,
                        "active_weeks": 10,
                        "total_weeks": 40,
                        "tasks_completed": 5,
                        "total_assigned_tasks": 6,
                        "is_gpg_verified": True
                    }
                ],
                "recent_commits": [
                    {"sha": "7f8b912a", "message": "perf(io_uring): lock-free batching ring buffer", "author": "Alex Chen", "date": "2024-10-22T18:00:00Z", "verified": True},
                    {"sha": "3a4b5c6d", "message": "feat(grpc): protobuf transport protocol integration", "author": "Sarah Lin", "date": "2024-10-18T14:30:00Z", "verified": True}
                ],
                "pull_requests": [
                    {"id": 62, "title": "perf(storage): zero-copy WAL flush optimization", "author": "Alex Chen", "status": "MERGED", "created_at": "2024-10-20", "comments": 7}
                ]
            }
        }

    # -------------------------------------------------------------
    # GitHub Account Connection & OAuth Simulation
    # -------------------------------------------------------------
    def get_oauth_authorize_url(self, username: str, redirect_uri: str = "http://localhost:3000/collaborate") -> str:
        """Returns the GitHub OAuth authorize URL."""
        return f"https://github.com/login/oauth/authorize?client_id=proofhire_github_oauth&scope=repo,read:user,user:email&state={username}"

    def connect_account(self, username: str, github_username: str, name: Optional[str] = None) -> Dict[str, Any]:
        """Connects or updates a GitHub account profile for a ProofHire user."""
        profile = {
            "username": username.lower(),
            "github_username": github_username,
            "name": name or github_username.replace("-", " ").title(),
            "avatar_url": f"https://avatars.githubusercontent.com/u/{abs(hash(github_username)) % 10000000}?v=4",
            "bio": "Verified ProofHire Developer with cryptographic Git attributions.",
            "public_repos": 24,
            "followers": 410,
            "following": 120,
            "connected_at": datetime.now(timezone.utc).isoformat(),
            "is_connected": True
        }
        self.connected_accounts[username.lower()] = profile
        return profile

    def disconnect_account(self, username: str) -> bool:
        """Disconnects user's GitHub account."""
        uname = username.lower()
        if uname in self.connected_accounts:
            self.connected_accounts[uname]["is_connected"] = False
            return True
        return False

    def get_account_status(self, username: str) -> Dict[str, Any]:
        """Returns connected GitHub account details or default disconnected state."""
        uname = username.lower()
        if uname in self.connected_accounts and self.connected_accounts[uname].get("is_connected"):
            return self.connected_accounts[uname]
        return {
            "username": username,
            "github_username": None,
            "is_connected": False,
            "connected_at": None
        }

    # -------------------------------------------------------------
    # Repository Retrieval & Metadata Ingestion
    # -------------------------------------------------------------
    async def get_repository_details(self, repo_identifier: str) -> Dict[str, Any]:
        """
        Retrieves complete repository details:
        Repository name, description, primary language, languages breakdown,
        contributors, commits, pull requests, creation date, last update, stars, forks.
        """
        # Clean identifier (handle both https://github.com/owner/repo or owner/repo)
        clean = re.sub(r"^https?://github\.com/", "", repo_identifier).rstrip("/")
        
        if clean in self.mock_repos:
            return self.mock_repos[clean]

        # Generate deterministic synthetic data for any newly passed repository
        parts = clean.split("/")
        owner = parts[-2] if len(parts) >= 2 else "developer"
        name = parts[-1] if len(parts) >= 1 else "repository"
        sha = hashlib.sha256(clean.encode()).hexdigest()

        return {
            "name": name,
            "full_name": f"{owner}/{name}",
            "owner": owner,
            "description": f"Engineered system repository for {name} with AST verification and GPG commit signatures.",
            "primary_language": "TypeScript",
            "languages": {
                "TypeScript": {"bytes": 320000, "percentage": 71.0},
                "Python": {"bytes": 95000, "percentage": 21.0},
                "Shell": {"bytes": 36000, "percentage": 8.0}
            },
            "created_at": "2024-03-01T09:00:00Z",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "stars": int(sha[:3], 16) % 350 + 40,
            "forks": int(sha[3:5], 16) % 60 + 10,
            "open_issues": 4,
            "default_branch": "main",
            "commits_count": int(sha[5:8], 16) % 300 + 150,
            "pull_requests_count": 32,
            "contributors": [
                {
                    "login": owner,
                    "name": owner.title(),
                    "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces",
                    "role": "Lead Architect",
                    "commits": 140,
                    "additions": 16400,
                    "deletions": 3200,
                    "prs_opened": 22,
                    "prs_merged": 20,
                    "reviews_conducted": 18,
                    "active_weeks": 16,
                    "total_weeks": 18,
                    "tasks_completed": 12,
                    "total_assigned_tasks": 14,
                    "is_gpg_verified": True
                }
            ],
            "recent_commits": [
                {"sha": sha[:8], "message": "feat: core module implementation", "author": owner.title(), "date": "2024-11-15T12:00:00Z", "verified": True}
            ],
            "pull_requests": [
                {"id": 1, "title": "feat: initial system architecture", "author": owner.title(), "status": "MERGED", "created_at": "2024-03-05", "comments": 3}
            ]
        }

    async def list_user_repositories(self, username: str) -> List[Dict[str, Any]]:
        """Returns all public/accessible project repositories for a user."""
        repos = list(self.mock_repos.values())
        return repos

    # -------------------------------------------------------------
    # Multi-Signal Contribution Scoring Model
    # -------------------------------------------------------------
    def calculate_contributor_signals(
        self,
        contributor_data: Dict[str, Any],
        repo_totals: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Evaluates a single contributor against the repository using the 5 signals:
        1. Commit Activity (30%): Commits volume relative to team activity
        2. Meaningful File Changes (20%): Additions/deletions in substantive source code
        3. Pull Request Participation (20%): PRs authored, merged, and peer reviews conducted
        4. Development Consistency (15%): Active cadence over the project duration
        5. Task / Role Evidence (15%): Completed workspace tasks and architectural scope

        Generates:
        - raw_contribution_score (0-100)
        - signal_breakdown (points per category)
        - verification_confidence (HIGH / MEDIUM / LOW, confidence percentage)
        """
        total_commits = max(1, repo_totals.get("commits_count", 100))
        total_loc = max(1, repo_totals.get("total_loc", 20000))
        total_prs = max(1, repo_totals.get("prs_count", 30))
        total_weeks = max(1, contributor_data.get("total_weeks", 20))
        total_tasks = max(1, contributor_data.get("total_assigned_tasks", 10))

        # 1. Commit Activity Signal (30 max points)
        c_count = contributor_data.get("commits", 0)
        commit_ratio = min(1.0, c_count / (total_commits * 0.5)) # 50% of repo commits = max score
        commit_signal = round(commit_ratio * 30.0, 1)

        # 2. Meaningful File Changes Signal (20 max points)
        additions = contributor_data.get("additions", 0)
        deletions = contributor_data.get("deletions", 0)
        net_impact = additions + (deletions * 0.3)
        loc_ratio = min(1.0, net_impact / (total_loc * 0.45))
        files_signal = round(loc_ratio * 20.0, 1)

        # 3. Pull Request Participation Signal (20 max points)
        prs_opened = contributor_data.get("prs_opened", 0)
        prs_merged = contributor_data.get("prs_merged", 0)
        reviews = contributor_data.get("reviews_conducted", 0)
        # Weigh merged PRs high (1.5x) and reviews (0.5x)
        pr_score_val = (prs_opened * 1.0) + (prs_merged * 1.5) + (reviews * 0.5)
        max_pr_threshold = max(5.0, total_prs * 0.6)
        pr_ratio = min(1.0, pr_score_val / max_pr_threshold)
        pr_signal = round(pr_ratio * 20.0, 1)

        # 4. Development Consistency Signal (15 max points)
        active_weeks = contributor_data.get("active_weeks", 0)
        consistency_ratio = min(1.0, active_weeks / (total_weeks * 0.8))
        consistency_signal = round(consistency_ratio * 15.0, 1)

        # 5. Task / Role Evidence Signal (15 max points)
        tasks_done = contributor_data.get("tasks_completed", 0)
        task_completion_ratio = min(1.0, tasks_done / total_tasks)
        task_signal = round(task_completion_ratio * 15.0, 1)

        # Overall Raw Score (0 - 100)
        raw_score = round(commit_signal + files_signal + pr_signal + consistency_signal + task_signal, 1)
        raw_score = max(5.0, min(100.0, raw_score))

        # Verification Confidence Calculation:
        # Boosted by GPG verification, active weeks, reviews conducted, and clean commit history
        confidence_base = 75.0
        if contributor_data.get("is_gpg_verified", False):
            confidence_base += 15.0
        if active_weeks >= 10:
            confidence_base += 5.0
        if prs_merged >= 5:
            confidence_base += 4.0
        confidence_pct = min(99.0, round(confidence_base, 1))

        if confidence_pct >= 90.0:
            confidence_level = "HIGH"
        elif confidence_pct >= 75.0:
            confidence_level = "MEDIUM"
        else:
            confidence_level = "LOW"

        return {
            "name": contributor_data.get("name", "Contributor"),
            "login": contributor_data.get("login", "dev"),
            "role": contributor_data.get("role", "Engineer"),
            "raw_score": raw_score,
            "signals": {
                "commit_activity": {"points": commit_signal, "max": 30, "weight_pct": 30},
                "files_changed": {"points": files_signal, "max": 20, "weight_pct": 20},
                "pull_request_participation": {"points": pr_signal, "max": 20, "weight_pct": 20},
                "development_consistency": {"points": consistency_signal, "max": 15, "weight_pct": 15},
                "task_role_evidence": {"points": task_signal, "max": 15, "weight_pct": 15}
            },
            "verification_confidence": {
                "level": confidence_level,
                "percentage": confidence_pct,
                "gpg_verified": contributor_data.get("is_gpg_verified", True),
                "active_weeks": active_weeks,
                "tasks_completed": tasks_done
            }
        }

    def audit_team_contributions(
        self,
        contributors: List[Dict[str, Any]],
        repo_totals: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Audits all team contributors, computes their raw multi-signal scores,
        and normalizes their contribution percentages so the team sum equals 100%.
        """
        if not contributors:
            return []

        if not repo_totals:
            total_commits = sum(c.get("commits", 10) for c in contributors)
            total_loc = sum(c.get("additions", 1000) for c in contributors)
            total_prs = sum(c.get("prs_opened", 5) for c in contributors)
            repo_totals = {
                "commits_count": max(1, total_commits),
                "total_loc": max(1, total_loc),
                "prs_count": max(1, total_prs)
            }

        evaluated = []
        for c in contributors:
            sig = self.calculate_contributor_signals(c, repo_totals)
            evaluated.append(sig)

        # Normalize contribution percentages
        sum_raw = sum(e["raw_score"] for e in evaluated)
        if sum_raw <= 0:
            sum_raw = 1.0

        results = []
        for e in evaluated:
            norm_pct = round((e["raw_score"] / sum_raw) * 100.0, 1)
            results.append({
                "name": e["name"],
                "login": e["login"],
                "role": e["role"],
                "contribution_score": int(round(e["raw_score"])),
                "contribution_percentage": norm_pct,
                "verification_confidence": e["verification_confidence"],
                "signals": e["signals"]
            })

        # Ensure exact 100% rounding sum
        total_norm = sum(r["contribution_percentage"] for r in results)
        diff = round(100.0 - total_norm, 1)
        if diff != 0.0 and len(results) > 0:
            results[0]["contribution_percentage"] = round(results[0]["contribution_percentage"] + diff, 1)

        return results

    # Legacy method wrapper for backward compatibility with project analyzer
    async def analyze_repo(self, repo_url: str) -> Dict[str, Any]:
        """Wrapper maintaining compatibility with existing project evaluation."""
        details = await self.get_repository_details(repo_url)
        audited = self.audit_team_contributions(details.get("contributors", []))
        
        attributions = []
        for a in audited:
            attributions.append({
                "contributor_name": a["name"],
                "github_handle": a["login"],
                "role_description": a["role"],
                "lines_of_code": int(a["contribution_percentage"] * 184),
                "percentage": a["contribution_percentage"],
                "is_verified_gpg": a["verification_confidence"]["gpg_verified"]
            })

        return {
            "owner": details.get("owner", "developer"),
            "repo_name": details.get("name", "repo"),
            "commit_hash": hashlib.sha256(repo_url.encode()).hexdigest()[:40],
            "commit_count": details.get("commits_count", 384),
            "loc_count": 18400,
            "attributions": attributions
        }

github_service = GitHubAuditService()
