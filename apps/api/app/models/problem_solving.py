from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class CodingProvider(str, Enum):
    LEETCODE = "leetcode"
    SKILLRACK = "skillrack"
    HACKERRANK = "hackerrank"
    CODECHEF = "codechef"
    CODEFORCES = "codeforces"
    GEEKSFORGEEKS = "geeksforgeeks"
    PROOFHIRE = "proofhire"

class ConnectionMethod(str, Enum):
    OAUTH = "oauth"
    PUBLIC_API = "public_api"
    PROFILE_VERIFICATION = "profile_verification"
    MANUAL_IMPORT = "manual_import"
    ADMIN_VERIFIED = "admin_verified"

class ConnectionVerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    FAILED = "failed"
    REVOKED = "revoked"

class NormalizedDifficulty(str, Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"
    EXPERT = "EXPERT"
    UNKNOWN = "UNKNOWN"

class SolveStatus(str, Enum):
    ACCEPTED = "accepted"
    FAILED = "failed"
    IMPORTED = "imported"
    PENDING_VERIFICATION = "pending_verification"
    REJECTED = "rejected"

class SolveVerificationStatus(str, Enum):
    PROVIDER_VERIFIED = "provider_verified"
    PROFILE_VERIFIED = "profile_verified"
    ADMIN_VERIFIED = "admin_verified"
    USER_REPORTED = "user_reported"
    UNVERIFIED = "unverified"

class XpSourceType(str, Enum):
    PROJECT = "project"
    CERTIFICATE = "certificate"
    COLLABORATION = "collaboration"
    ASSESSMENT = "assessment"
    PROBLEM_SOLVE = "problem_solve"
    CODING_CONTEST = "coding_contest"
    ACHIEVEMENT = "achievement"


# 1. Platform Connections
class ProblemSolvingConnectionSchema(BaseModel):
    id: str
    user_id: str
    provider: CodingProvider
    external_user_id: Optional[str] = None
    username: str
    profile_url: Optional[str] = None
    connection_method: ConnectionMethod
    verification_status: ConnectionVerificationStatus = ConnectionVerificationStatus.PENDING
    last_sync_at: Optional[datetime] = None
    sync_cursor: Optional[str] = None
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# 2. Problem Catalog
class ProblemCatalogSchema(BaseModel):
    id: str
    provider: CodingProvider
    external_problem_id: str
    slug: Optional[str] = None
    title: str
    problem_url: Optional[str] = None
    difficulty_raw: Optional[str] = None
    difficulty_normalized: NormalizedDifficulty = NormalizedDifficulty.UNKNOWN
    topics: List[str] = Field(default_factory=list)
    canonical_fingerprint: Optional[str] = None
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# 3. Problem Solve Events
class ProblemSolveEventSchema(BaseModel):
    id: str
    user_id: str
    connection_id: Optional[str] = None
    problem_id: str
    submission_id: Optional[str] = None
    status: SolveStatus = SolveStatus.PENDING_VERIFICATION
    language: Optional[str] = None
    solved_at: Optional[datetime] = None
    runtime_ms: Optional[float] = None
    memory_kb: Optional[float] = None
    source_code_hash: Optional[str] = None
    verification_status: SolveVerificationStatus = SolveVerificationStatus.UNVERIFIED
    verification_confidence: float = Field(0.0, ge=0.0, le=1.0)
    quality_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    base_xp: int = 0
    skill_xp: int = 0
    overall_xp: int = 0
    xp_awarded: bool = False
    raw_metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# 4. Coding Contests & Participations
class CodingContestSchema(BaseModel):
    id: str
    provider: CodingProvider
    external_contest_id: str
    title: str
    contest_url: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ContestParticipationSchema(BaseModel):
    id: str
    user_id: str
    connection_id: Optional[str] = None
    contest_id: str
    rank: Optional[int] = None
    total_participants: Optional[int] = None
    percentile: Optional[float] = None
    rating_before: Optional[int] = None
    rating_after: Optional[int] = None
    rating_delta: Optional[int] = None
    problems_attempted: int = 0
    problems_solved: int = 0
    xp_awarded: bool = False
    verification_status: SolveVerificationStatus = SolveVerificationStatus.UNVERIFIED
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# 5. Topic Performance
class UserProblemTopicSchema(BaseModel):
    id: str
    user_id: str
    topic: str
    verified_solved_count: int = 0
    easy_count: int = 0
    medium_count: int = 0
    hard_count: int = 0
    expert_count: int = 0
    topic_xp: int = 0
    topic_level: int = 1
    topic_score: float = 0.0
    last_activity_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# 6. Problem-Solving Profile Summary
class ProblemSolvingProfileSummarySchema(BaseModel):
    user_id: str
    verified_solved_count: int = 0
    easy_solved: int = 0
    medium_solved: int = 0
    hard_solved: int = 0
    expert_solved: int = 0
    problem_solving_xp: int = 0
    problem_solving_level: int = 1
    problem_solving_score: float = 0.0
    contest_score: float = 0.0
    consistency_score: float = 0.0
    breadth_score: float = 0.0
    advanced_problem_score: float = 0.0
    active_weeks_last_12: int = 0
    last_activity_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# 7. XP Transactions Ledger
class XpTransactionSchema(BaseModel):
    id: str
    user_id: str
    source_type: XpSourceType
    source_id: str
    category: str
    base_xp: int = 0
    modifier_json: Dict[str, Any] = Field(default_factory=dict)
    final_xp: int = 0
    verification_status: str = "verified"
    awarded_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
