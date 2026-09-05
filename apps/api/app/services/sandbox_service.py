import os
import json
import logging
import urllib.request
import urllib.error
from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass, field, asdict
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger("proofhire.sandbox_service")


class ExecutionStatus(str, Enum):
    """
    Execution status of untrusted candidate code.
    If Judge0 or secure sandbox is not configured, status MUST be NOT CONFIGURED.
    """
    NOT_CONFIGURED = "NOT CONFIGURED"
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    ACCEPTED = "ACCEPTED"
    WRONG_ANSWER = "WRONG_ANSWER"
    TIME_LIMIT_EXCEEDED = "TIME_LIMIT_EXCEEDED"
    MEMORY_LIMIT_EXCEEDED = "MEMORY_LIMIT_EXCEEDED"
    COMPILATION_ERROR = "COMPILATION_ERROR"
    RUNTIME_ERROR = "RUNTIME_ERROR"


@dataclass
class TestCaseResult:
    """Individual test case verification result."""
    test_index: int
    status: str  # ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR
    input_snippet: str
    expected_output_snippet: str
    actual_output_snippet: Optional[str] = None
    runtime_ms: Optional[float] = None
    memory_kb: Optional[int] = None
    error_message: Optional[str] = None


@dataclass
class SandboxExecutionResult:
    """Consolidated sandbox execution telemetry."""
    status: str = ExecutionStatus.NOT_CONFIGURED.value
    tests_passed: int = 0
    total_tests: int = 0
    runtime_ms: Optional[float] = None
    memory_kb: Optional[int] = None
    compile_output: Optional[str] = None
    test_results: List[TestCaseResult] = field(default_factory=list)
    sandbox_provider: str = "null_sandbox"
    is_configured: bool = False
    message: str = (
        "Secure sandbox execution environment is not configured. "
        "Direct host execution is strictly disabled for security. "
        "Set JUDGE0_URL to enable sandboxed compilation."
    )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status,
            "tests_passed": self.tests_passed,
            "total_tests": self.total_tests,
            "runtime_ms": self.runtime_ms,
            "memory_kb": self.memory_kb,
            "compile_output": self.compile_output,
            "sandbox_provider": self.sandbox_provider,
            "is_configured": self.is_configured,
            "message": self.message,
            "test_results": [asdict(t) for t in self.test_results]
        }


class CodeSandboxInterface(ABC):
    """Abstract interface defining the contract for sandboxed code execution."""

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns whether a secure external sandbox environment is available."""
        pass

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Returns health, provider identity, and configuration state of the sandbox."""
        pass

    @abstractmethod
    def execute_solution(
        self,
        language: str,
        code: str,
        test_cases: List[Dict[str, str]],
        time_limit: float = 2.0,
        memory_limit: int = 256
    ) -> SandboxExecutionResult:
        """
        Executes untrusted code against test cases in an isolated sandbox.
        MUST NEVER execute code directly on host when sandbox is not configured.
        """
        pass


class NullSandboxAdapter(CodeSandboxInterface):
    """
    Default adapter active when no secure sandbox (e.g. Judge0) is configured.
    Guarantees that untrusted code is NEVER executed on the FastAPI / Cloud Run host.
    Always returns execution status: 'NOT CONFIGURED'.
    """

    def is_configured(self) -> bool:
        return False

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_configured": False,
            "provider": "null_sandbox",
            "execution_status": ExecutionStatus.NOT_CONFIGURED.value,
            "message": (
                "ProofHire Secure Sandbox is currently NOT CONFIGURED. "
                "Untrusted code execution is disabled on the application host. "
                "To enable sandboxed execution, configure JUDGE0_URL in the server environment."
            ),
            "supported_languages": ["python", "typescript", "javascript", "rust", "cpp", "java", "go"],
            "direct_host_execution_allowed": False
        }

    def execute_solution(
        self,
        language: str,
        code: str,
        test_cases: List[Dict[str, str]],
        time_limit: float = 2.0,
        memory_limit: int = 256
    ) -> SandboxExecutionResult:
        """
        Refuses host execution and returns NOT CONFIGURED.
        Does not fake execution.
        """
        logger.warning(
            "Untrusted code execution requested for language '%s', "
            "but sandbox is NOT CONFIGURED. Refusing host execution.",
            language
        )
        return SandboxExecutionResult(
            status=ExecutionStatus.NOT_CONFIGURED.value,
            tests_passed=0,
            total_tests=len(test_cases),
            runtime_ms=None,
            memory_kb=None,
            compile_output=None,
            test_results=[],
            sandbox_provider="null_sandbox",
            is_configured=False,
            message=(
                "Sandbox environment is NOT CONFIGURED. "
                "Untrusted code cannot be executed directly on the application host. "
                "Please configure JUDGE0_URL to enable real-time sandboxed grading."
            )
        )


class Judge0SandboxAdapter(CodeSandboxInterface):
    """
    Adapter for Judge0 sandbox API (self-hosted or hosted Judge0 instance).
    Executes code in isolated Docker/cgroup sandboxes.
    """

    LANGUAGE_MAP = {
        "python": 71,       # Python (3.8.1)
        "python3": 71,
        "javascript": 63,   # JavaScript (Node.js 12.14.0)
        "typescript": 74,   # TypeScript (3.7.4)
        "cpp": 54,          # C++ (GCC 9.2.0)
        "c++": 54,
        "rust": 73,         # Rust (1.40.0)
        "java": 62,         # Java (OpenJDK 13.0.1)
        "go": 60            # Go (1.13.5)
    }

    def __init__(self, base_url: str, api_key: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key or ""

    def is_configured(self) -> bool:
        return bool(self.base_url and self.base_url.strip())

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_configured": True,
            "provider": "judge0",
            "endpoint": self.base_url,
            "execution_status": "READY",
            "message": "Judge0 secure container sandbox connected and ready.",
            "supported_languages": list(self.LANGUAGE_MAP.keys()),
            "direct_host_execution_allowed": False
        }

    def execute_solution(
        self,
        language: str,
        code: str,
        test_cases: List[Dict[str, str]],
        time_limit: float = 2.0,
        memory_limit: int = 256
    ) -> SandboxExecutionResult:
        """Dispatches solution to Judge0 submission endpoint."""
        lang_id = self.LANGUAGE_MAP.get(language.lower())
        if not lang_id:
            return SandboxExecutionResult(
                status=ExecutionStatus.COMPILATION_ERROR.value,
                tests_passed=0,
                total_tests=len(test_cases),
                compile_output=f"Unsupported language '{language}'. Supported: {list(self.LANGUAGE_MAP.keys())}",
                sandbox_provider="judge0",
                is_configured=True,
                message="Unsupported execution language."
            )

        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-Auth-Token"] = self.api_key
            headers["X-RapidAPI-Key"] = self.api_key

        test_results: List[TestCaseResult] = []
        tests_passed = 0
        total_runtime = 0.0
        max_memory = 0
        final_status = ExecutionStatus.ACCEPTED.value

        for idx, tc in enumerate(test_cases):
            tc_input = tc.get("input", "")
            tc_expected = tc.get("expected_output", "").strip()

            payload = {
                "language_id": lang_id,
                "source_code": code,
                "stdin": tc_input,
                "expected_output": tc_expected,
                "cpu_time_limit": time_limit,
                "memory_limit": memory_limit * 1024  # KB
            }

            try:
                req = urllib.request.Request(
                    f"{self.base_url}/submissions?wait=true",
                    data=json.dumps(payload).encode("utf-8"),
                    headers=headers,
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read().decode("utf-8"))

                judge_status_id = data.get("status", {}).get("id", 0)
                stdout = (data.get("stdout") or "").strip()
                stderr = data.get("stderr") or ""
                time_s = float(data.get("time") or 0.0)
                mem_kb = int(data.get("memory") or 0)

                total_runtime += time_s * 1000
                max_memory = max(max_memory, mem_kb)

                if judge_status_id == 3:  # Accepted
                    test_status = ExecutionStatus.ACCEPTED.value
                    tests_passed += 1
                elif judge_status_id == 4:  # Wrong Answer
                    test_status = ExecutionStatus.WRONG_ANSWER.value
                    if final_status == ExecutionStatus.ACCEPTED.value:
                        final_status = ExecutionStatus.WRONG_ANSWER.value
                elif judge_status_id == 5:  # Time Limit Exceeded
                    test_status = ExecutionStatus.TIME_LIMIT_EXCEEDED.value
                    final_status = ExecutionStatus.TIME_LIMIT_EXCEEDED.value
                elif judge_status_id == 6:  # Compilation Error
                    return SandboxExecutionResult(
                        status=ExecutionStatus.COMPILATION_ERROR.value,
                        tests_passed=0,
                        total_tests=len(test_cases),
                        compile_output=data.get("compile_output") or stderr,
                        sandbox_provider="judge0",
                        is_configured=True,
                        message="Compilation failed."
                    )
                else:  # Runtime Error or others
                    test_status = ExecutionStatus.RUNTIME_ERROR.value
                    final_status = ExecutionStatus.RUNTIME_ERROR.value

                test_results.append(
                    TestCaseResult(
                        test_index=idx + 1,
                        status=test_status,
                        input_snippet=tc_input[:100],
                        expected_output_snippet=tc_expected[:100],
                        actual_output_snippet=stdout[:100],
                        runtime_ms=round(time_s * 1000, 2),
                        memory_kb=mem_kb,
                        error_message=stderr[:200] if stderr else None
                    )
                )

            except Exception as e:
                logger.error("Error communicating with Judge0 sandbox: %s", str(e))
                return SandboxExecutionResult(
                    status=ExecutionStatus.RUNTIME_ERROR.value,
                    tests_passed=tests_passed,
                    total_tests=len(test_cases),
                    test_results=test_results,
                    sandbox_provider="judge0",
                    is_configured=True,
                    message=f"Judge0 execution connection error: {str(e)}"
                )

        return SandboxExecutionResult(
            status=final_status,
            tests_passed=tests_passed,
            total_tests=len(test_cases),
            runtime_ms=round(total_runtime, 2),
            memory_kb=max_memory,
            compile_output=None,
            test_results=test_results,
            sandbox_provider="judge0",
            is_configured=True,
            message="Sandbox evaluation completed."
        )


def get_sandbox_service() -> CodeSandboxInterface:
    """
    Factory function returning the active sandbox implementation.
    If settings.JUDGE0_URL is empty, returns NullSandboxAdapter.
    """
    judge0_url = getattr(settings, "JUDGE0_URL", "")
    if judge0_url and judge0_url.strip():
        api_key = getattr(settings, "JUDGE0_API_KEY", "")
        return Judge0SandboxAdapter(base_url=judge0_url, api_key=api_key)
    return NullSandboxAdapter()


# Singleton instance
sandbox_service = get_sandbox_service()
