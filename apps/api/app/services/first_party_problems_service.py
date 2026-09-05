import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.services.sandbox_service import get_sandbox_service, ExecutionStatus

logger = logging.getLogger("proofhire.first_party_problems")


class FirstPartyProblemsService:
    """
    Manages First-Party ProofHire Coding Problems, test suites,
    confidentiality boundaries, and sandbox submission lifecycles.
    """

    def __init__(self):
        # In-memory storage for first-party coding challenges
        self.problems: List[Dict[str, Any]] = [
            {
                "id": "fp_prob_two_sum",
                "slug": "two-sum-invariant-deductions",
                "title": "Two Sum - Invariant Deductions",
                "description": (
                    "Given an array of integers `nums` and an integer `target`, return the indices "
                    "of the two numbers such that they add up to `target`.\n\n"
                    "You may assume that each input would have exactly one solution, and you may not use "
                    "the same element twice. You can return the answer in any order."
                ),
                "difficulty": "EASY",
                "topics": ["Arrays", "Hashing", "Two Pointers"],
                "constraints": [
                    "2 <= nums.length <= 10^4",
                    "-10^9 <= nums[i] <= 10^9",
                    "-10^9 <= target <= 10^9",
                    "Only one valid answer exists.",
                    "Time Complexity: O(n) required",
                    "Space Complexity: O(n) auxiliary"
                ],
                "examples": [
                    {
                        "input": "nums = [2,7,11,15], target = 9",
                        "output": "[0,1]",
                        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
                    },
                    {
                        "input": "nums = [3,2,4], target = 6",
                        "output": "[1,2]",
                        "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]."
                    }
                ],
                "hidden_test_cases": [
                    {"input": "[3,3]\n6", "expected_output": "[0,1]"},
                    {"input": "[-1,-2,-3,-4,-5]\n-8", "expected_output": "[2,4]"},
                    {"input": "[0,4,3,0]\n0", "expected_output": "[0,3]"},
                    {"input": "[-1000000000,1000000000]\n0", "expected_output": "[0,1]"}
                ],
                "time_limit": 1.0,
                "memory_limit": 256,
                "starter_code": {
                    "python": "def twoSum(nums: list[int], target: int) -> list[int]:\n    # Implement O(n) single-pass hash map\n    pass\n",
                    "typescript": "function twoSum(nums: number[], target: number): number[] {\n    // Implement O(n) lookup\n    return [];\n}\n",
                    "rust": "impl Solution {\n    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n        vec![]\n    }\n}\n"
                },
                "is_active": True,
                "created_at": "2024-11-01T00:00:00Z"
            },
            {
                "id": "fp_prob_topo_sort",
                "slug": "topological-build-dependency-order",
                "title": "Topological Build Dependency Order",
                "description": (
                    "There are a total of `numTasks` build targets you have to complete, labeled from `0` to `numTasks - 1`. "
                    "You are given an array `prerequisites` where `prerequisites[i] = [a_i, b_i]` indicates that you must "
                    "finish build target `b_i` before target `a_i`.\n\n"
                    "Return the valid compilation ordering of tasks to finish all builds. If there are multiple valid orders, "
                    "return any of them. If it is impossible to finish all tasks due to cyclic dependencies, return an empty array `[]`."
                ),
                "difficulty": "MEDIUM",
                "topics": ["Graphs", "Topological Sort", "Algorithms"],
                "constraints": [
                    "1 <= numTasks <= 2000",
                    "0 <= prerequisites.length <= 5000",
                    "prerequisites[i].length == 2",
                    "0 <= a_i, b_i < numTasks",
                    "a_i != b_i",
                    "All pairs [a_i, b_i] are distinct."
                ],
                "examples": [
                    {
                        "input": "numTasks = 2, prerequisites = [[1,0]]",
                        "output": "[0,1]",
                        "explanation": "There are 2 tasks. Target 1 depends on 0, so the ordering is [0, 1]."
                    },
                    {
                        "input": "numTasks = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]",
                        "output": "[0,1,2,3]",
                        "explanation": "Target 3 requires both 1 and 2, which require 0. Both [0,1,2,3] and [0,2,1,3] are valid."
                    }
                ],
                "hidden_test_cases": [
                    {"input": "2\n[[1,0],[0,1]]", "expected_output": "[]"},
                    {"input": "3\n[[0,1],[1,2],[2,0]]", "expected_output": "[]"},
                    {"input": "1\n[]", "expected_output": "[0]"},
                    {"input": "3\n[[1,0],[2,1]]", "expected_output": "[0,1,2]"}
                ],
                "time_limit": 2.0,
                "memory_limit": 256,
                "starter_code": {
                    "python": "def findOrder(numTasks: int, prerequisites: list[list[int]]) -> list[int]:\n    # Kahn's Algorithm / In-degree BFS\n    pass\n",
                    "typescript": "function findOrder(numTasks: number, prerequisites: number[][]): number[] {\n    return [];\n}\n",
                    "rust": "impl Solution {\n    pub fn find_order(num_tasks: i32, prerequisites: Vec<Vec<i32>>) -> Vec<i32> {\n        vec![]\n    }\n}\n"
                },
                "is_active": True,
                "created_at": "2024-11-05T00:00:00Z"
            },
            {
                "id": "fp_prob_sliding_window",
                "slug": "monotonic-event-log-sliding-window",
                "title": "Monotonic Event Log Sliding Window",
                "description": (
                    "You are given an array of integers `latency` representing telemetry log timestamps, and a sliding window "
                    "size `k` that moves from the leftmost edge to the rightmost edge of the log stream.\n\n"
                    "You can only see the `k` numbers in the current inspection window. Each time the window shifts right by "
                    "one index, find the maximum latency spike in the window. Return the max values for all consecutive windows."
                ),
                "difficulty": "MEDIUM",
                "topics": ["Arrays", "Sliding Window", "Monotonic Queue"],
                "constraints": [
                    "1 <= latency.length <= 10^5",
                    "-10^4 <= latency[i] <= 10^4",
                    "1 <= k <= latency.length",
                    "Time Complexity: O(n) required"
                ],
                "examples": [
                    {
                        "input": "latency = [1,3,-1,-3,5,3,6,7], k = 3",
                        "output": "[3,3,5,5,6,7]",
                        "explanation": "Window [1,3,-1] -> 3; [3,-1,-3] -> 3; [-1,-3,5] -> 5; [-3,5,3] -> 5; [5,3,6] -> 6; [3,6,7] -> 7."
                    }
                ],
                "hidden_test_cases": [
                    {"input": "[1]\n1", "expected_output": "[1]"},
                    {"input": "[9,11]\n2", "expected_output": "[11]"},
                    {"input": "[4,-2]\n2", "expected_output": "[4]"},
                    {"input": "[7,2,4]\n2", "expected_output": "[7,4]"}
                ],
                "time_limit": 2.0,
                "memory_limit": 256,
                "starter_code": {
                    "python": "def maxSlidingWindow(latency: list[int], k: int) -> list[int]:\n    # Monotonic decreasing deque O(n)\n    pass\n",
                    "typescript": "function maxSlidingWindow(latency: number[], k: number): number[] {\n    return [];\n}\n"
                },
                "is_active": True,
                "created_at": "2024-11-10T00:00:00Z"
            },
            {
                "id": "fp_prob_raft_compaction",
                "slug": "distributed-raft-log-compaction",
                "title": "Distributed Raft Log Compaction",
                "description": (
                    "A distributed Raft node has `n` log segment snapshots to compact into an immutable state checkpoint. "
                    "Each segment has an index, an execution state payload size `entries[i]`, and a consensus score `value[i]`.\n\n"
                    "Given a maximum memory compaction envelope `capacity`, determine the maximum aggregate consensus score "
                    "achievable by choosing a subset of segment snapshots without exceeding `capacity`."
                ),
                "difficulty": "HARD",
                "topics": ["Dynamic Programming", "Distributed Systems", "Algorithms"],
                "constraints": [
                    "1 <= entries.length <= 1000",
                    "1 <= entries[i] <= 10^4",
                    "1 <= capacity <= 10^4",
                    "Memory limit: 512 MB"
                ],
                "examples": [
                    {
                        "input": "entries = [10, 20, 30], values = [60, 100, 120], capacity = 50",
                        "output": "220",
                        "explanation": "Selecting segment 1 (20) and segment 2 (30) yields value 100 + 120 = 220 within 50 capacity."
                    }
                ],
                "hidden_test_cases": [
                    {"input": "[10,20]\n[60,100]\n30", "expected_output": "160"},
                    {"input": "[5,10,15]\n[30,50,90]\n20", "expected_output": "120"}
                ],
                "time_limit": 2.0,
                "memory_limit": 512,
                "starter_code": {
                    "python": "def raftLogCompaction(entries: list[int], values: list[int], capacity: int) -> int:\n    # 0/1 Knapsack DP with space optimization\n    pass\n",
                    "typescript": "function raftLogCompaction(entries: number[], values: number[], capacity: number): number {\n    return 0;\n}\n"
                },
                "is_active": True,
                "created_at": "2024-11-15T00:00:00Z"
            }
        ]

        # In-memory store of submissions
        self.submissions: List[Dict[str, Any]] = []

    def list_problems(
        self,
        difficulty: Optional[str] = None,
        topic: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Lists all active first-party coding problems with candidate confidentiality enforced
        (hidden test cases stripped).
        """
        results = []
        for p in self.problems:
            if not p.get("is_active", True):
                continue
            if difficulty and p["difficulty"].upper() != difficulty.upper():
                continue
            if topic:
                topics_lower = [t.lower() for t in p.get("topics", [])]
                if topic.lower() not in topics_lower:
                    continue
            if search:
                s = search.lower()
                title_match = s in p["title"].lower()
                desc_match = s in p["description"].lower()
                topic_match = any(s in t.lower() for t in p.get("topics", []))
                if not (title_match or desc_match or topic_match):
                    continue

            # Produce clean candidate view
            clean_item = {
                "id": p["id"],
                "slug": p["slug"],
                "title": p["title"],
                "difficulty": p["difficulty"],
                "topics": p["topics"],
                "constraints": p["constraints"],
                "time_limit": p["time_limit"],
                "memory_limit": p["memory_limit"],
                "starter_code": p["starter_code"],
                "examples": p["examples"],
                "created_at": p["created_at"],
                "total_hidden_test_cases": len(p.get("hidden_test_cases", []))
            }
            results.append(clean_item)
        return results

    def get_problem(self, id_or_slug: str, is_candidate_view: bool = True) -> Optional[Dict[str, Any]]:
        """
        Retrieves a problem by ID or slug.
        If is_candidate_view is True, hidden_test_cases are stripped to prevent test cheating.
        """
        p = next(
            (item for item in self.problems if item["id"] == id_or_slug or item["slug"] == id_or_slug),
            None
        )
        if not p:
            return None

        data = dict(p)
        if is_candidate_view:
            data.pop("hidden_test_cases", None)
            data["total_hidden_test_cases"] = len(p.get("hidden_test_cases", []))
        return data

    def submit_solution(
        self,
        username: str,
        problem_id_or_slug: str,
        language: str,
        code: str
    ) -> Dict[str, Any]:
        """
        Submits candidate solution for first-party evaluation.
        Uses get_sandbox_service().
        If sandbox is not configured, returns status 'NOT CONFIGURED' and avoids host execution.
        """
        problem = self.get_problem(problem_id_or_slug, is_candidate_view=False)
        if not problem:
            raise ValueError(f"Problem '{problem_id_or_slug}' not found.")

        sub_id = f"fp_sub_{uuid.uuid4().hex[:8]}"
        sandbox = get_sandbox_service()

        test_cases = problem.get("hidden_test_cases", [])
        time_limit = float(problem.get("time_limit", 2.0))
        memory_limit = int(problem.get("memory_limit", 256))

        # Execute in sandbox (or receive NOT CONFIGURED from NullSandboxAdapter)
        exec_res = sandbox.execute_solution(
            language=language,
            code=code,
            test_cases=test_cases,
            time_limit=time_limit,
            memory_limit=memory_limit
        )

        submission_record = {
            "id": sub_id,
            "problem_id": problem["id"],
            "problem_slug": problem["slug"],
            "problem_title": problem["title"],
            "difficulty": problem["difficulty"],
            "topics": problem["topics"],
            "candidate_username": username,
            "language": language,
            "code": code,
            "execution_status": exec_res.status,
            "is_sandbox_configured": exec_res.is_configured,
            "sandbox_provider": exec_res.sandbox_provider,
            "tests_passed": exec_res.tests_passed,
            "total_tests": exec_res.total_tests,
            "runtime_ms": exec_res.runtime_ms,
            "memory_kb": exec_res.memory_kb,
            "compile_output": exec_res.compile_output,
            "message": exec_res.message,
            "test_results": [
                {
                    "test_index": t.test_index,
                    "status": t.status,
                    "runtime_ms": t.runtime_ms,
                    "memory_kb": t.memory_kb,
                    "error_message": t.error_message
                }
                for t in exec_res.test_results
            ],
            "submitted_at": datetime.now(timezone.utc).isoformat()
        }

        self.submissions.insert(0, submission_record)
        return submission_record

    def get_submission(self, submission_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a previously stored submission record."""
        return next((s for s in self.submissions if s["id"] == submission_id), None)


first_party_problems_service = FirstPartyProblemsService()
