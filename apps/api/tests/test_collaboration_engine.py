import unittest
import asyncio
from app.services.github_service import github_service
from app.services.collaboration_service import collaboration_service
from app.services.reputation_engine import reputation_engine

class TestGitHubAndCollaborationEngine(unittest.TestCase):

    def test_github_repository_metadata_retrieval(self):
        """Verify repository metadata extraction has all required fields."""
        repo = asyncio.run(github_service.get_repository_details("proofhire/proofhire-engine"))
        
        self.assertEqual(repo["name"], "proofhire-engine")
        self.assertIn("description", repo)
        self.assertIn("primary_language", repo)
        self.assertIn("languages", repo)
        self.assertIn("TypeScript", repo["languages"])
        self.assertIn("contributors", repo)
        self.assertGreaterEqual(len(repo["contributors"]), 3)
        self.assertIn("recent_commits", repo)
        self.assertIn("pull_requests", repo)
        self.assertIn("created_at", repo)
        self.assertIn("updated_at", repo)
        self.assertGreater(repo["stars"], 0)
        self.assertGreater(repo["forks"], 0)

    def test_multi_signal_contribution_scoring_model(self):
        """
        Verify the 5-signal contribution scoring model:
        Commit (30%), Files (20%), PR (20%), Consistency (15%), Task (15%).
        """
        contributor = {
            "name": "Gnaneshwar",
            "login": "gnaneshwar-dev",
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
        }
        repo_totals = {
            "commits_count": 512,
            "total_loc": 55000,
            "prs_count": 86
        }

        eval_res = github_service.calculate_contributor_signals(contributor, repo_totals)
        signals = eval_res["signals"]

        # Check weights and max values
        self.assertEqual(signals["commit_activity"]["max"], 30)
        self.assertEqual(signals["files_changed"]["max"], 20)
        self.assertEqual(signals["pull_request_participation"]["max"], 20)
        self.assertEqual(signals["development_consistency"]["max"], 15)
        self.assertEqual(signals["task_role_evidence"]["max"], 15)

        # Ensure raw score is high and verified confidence is HIGH
        self.assertGreaterEqual(eval_res["raw_score"], 80)
        self.assertEqual(eval_res["verification_confidence"]["level"], "HIGH")
        self.assertGreaterEqual(eval_res["verification_confidence"]["percentage"], 90.0)

    def test_team_contribution_normalization_sums_to_100(self):
        """Verify normalized contribution percentages across a team strictly sum to 100%."""
        repo = asyncio.run(github_service.get_repository_details("proofhire/proofhire-engine"))
        team_results = github_service.audit_team_contributions(repo["contributors"])

        self.assertGreaterEqual(len(team_results), 3)
        total_pct = sum(m["contribution_percentage"] for m in team_results)
        self.assertAlmostEqual(total_pct, 100.0, places=1)

    def test_discover_developers_filtering(self):
        """Verify developer directory filtering by skill, level, availability, and location."""
        # 1. Skill filter
        react_devs = collaboration_service.discover_developers(skill="React")
        self.assertTrue(all("React" in d["top_skills"] for d in react_devs))

        # 2. Min level filter
        senior_devs = collaboration_service.discover_developers(min_level=35)
        self.assertTrue(all(d["level"] >= 35 for d in senior_devs))

        # 3. Availability filter
        open_devs = collaboration_service.discover_developers(availability="Open to Collaborations")
        self.assertTrue(all("Open to Collaborations" in d["availability"] for d in open_devs))

        # 4. Location filter
        bangalore_devs = collaboration_service.discover_developers(location="Bangalore")
        self.assertTrue(all("Bangalore" in d["location"] for d in bangalore_devs))

    def test_collaboration_workspace_tasks_mutation(self):
        """Verify task tracking with Todo, In Progress, and Completed states."""
        ws_id = "collab_proofhire"
        # Add new task
        new_task = collaboration_service.add_or_update_task(ws_id, {
            "title": "Automated AST Benchmarking",
            "status": "todo",
            "assignee": "Gnaneshwar",
            "priority": "Urgent"
        })
        self.assertEqual(new_task["status"], "todo")

        # Move to in_progress
        updated_task = collaboration_service.add_or_update_task(ws_id, {
            "id": new_task["id"],
            "title": "Automated AST Benchmarking",
            "status": "in_progress"
        })
        self.assertEqual(updated_task["status"], "in_progress")

        # Move to completed
        completed_task = collaboration_service.add_or_update_task(ws_id, {
            "id": new_task["id"],
            "title": "Automated AST Benchmarking",
            "status": "completed"
        })
        self.assertEqual(completed_task["status"], "completed")

    def test_project_completion_individual_xp_allocation(self):
        """
        Verify the prompt's exact project completion example:
        Project XP pool: 800 XP
        Gnaneshwar: 45% contribution -> +360 collaboration XP
        Arun: 35% -> +280 XP
        Priya: 20% -> +160 XP
        """
        ws_id = "collab_proofhire"
        result = asyncio.run(collaboration_service.complete_project_and_allocate_xp(ws_id, custom_xp_pool=800))

        self.assertEqual(result["total_xp_pool"], 800)
        allocations = {a["name"].lower(): a for a in result["allocations"]}

        # Check Gnaneshwar: 45% -> 360 XP
        gnan = next(v for k, v in allocations.items() if "gnaneshwar" in k)
        self.assertEqual(gnan["contribution_percentage"], 45.0)
        self.assertEqual(gnan["awarded_xp"], 360)

        # Check Arun: 35% -> 280 XP
        arun = next(v for k, v in allocations.items() if "arun" in k)
        self.assertEqual(arun["contribution_percentage"], 35.0)
        self.assertEqual(arun["awarded_xp"], 280)

        # Check Priya: 20% -> 160 XP
        priya = next(v for k, v in allocations.items() if "priya" in k)
        self.assertEqual(priya["contribution_percentage"], 20.0)
        self.assertEqual(priya["awarded_xp"], 160)

        # Total sum of XP equals pool
        self.assertEqual(gnan["awarded_xp"] + arun["awarded_xp"] + priya["awarded_xp"], 800)

if __name__ == "__main__":
    unittest.main()
