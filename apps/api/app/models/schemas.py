from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime

class GradeTier(str, Enum):
    O = "O" # Outstanding (Top 1.5%)
    A = "A" # Distinction (Top 7%)
    B = "B" # Proficient (Top 25%)
    C = "C" # Competent
    D = "D" # Basic
    E = "E" # Unverified

class EvaluationMetric(BaseModel):
    architecture: float = Field(..., ge=0, le=100)
    test_coverage: float = Field(..., ge=0, le=100)
    code_quality: float = Field(..., ge=0, le=100)
    doc_clarity: float = Field(..., ge=0, le=100)

class ContributorAttributionSchema(BaseModel):
    contributor_name: str
    github_handle: str
    role_description: Optional[str] = None
    lines_of_code: int
    percentage: float
    is_verified_gpg: bool = True

class ProjectSchema(BaseModel):
    id: str
    title: str
    slug: str
    category: str
    description: str
    repo_url: str
    primary_stack: List[str]
    grade: GradeTier
    score: float
    metrics: EvaluationMetric
    sha256_hash: str
    polygon_tx_hash: Optional[str] = None
    merkle_root: Optional[str] = None
    commit_count: int
    loc_count: int
    gemini_review_note: str
    attributions: List[ContributorAttributionSchema] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SkillMatrixItem(BaseModel):
    skill_name: str
    grade: GradeTier
    score: int
    xp: int

class CandidateProfile(BaseModel):
    id: str
    username: str
    full_name: str
    title: str
    bio: str
    avatar_url: str
    level: int
    total_xp: int
    ai_quality_index: float
    verified_repos_count: int
    github_username: str
    polygon_wallet_address: Optional[str] = None
    location: str
    availability: str
    is_identity_verified: bool = True
    skills: List[SkillMatrixItem] = []
    projects: List[ProjectSchema] = []

class RepoEvaluationRequest(BaseModel):
    repo_url: str
    branch: Optional[str] = "main"
    commit_hash: Optional[str] = None

class RepoEvaluationResponse(BaseModel):
    evaluation_id: str
    status: str
    project: ProjectSchema
    ast_invariants_cleared: bool
    summary: str

class RecruiterFilterQuery(BaseModel):
    query: Optional[str] = None
    grades: Optional[List[GradeTier]] = None
    languages: Optional[List[str]] = None
    min_xp: Optional[int] = 0
    ast_clean_only: Optional[bool] = False
    availability: Optional[str] = None

# Phase 1: Problem-Solving Reputation Engine Schemas
from app.models.problem_solving import (
    CodingProvider,
    ConnectionMethod,
    ConnectionVerificationStatus,
    NormalizedDifficulty,
    SolveStatus,
    SolveVerificationStatus,
    XpSourceType,
    ProblemSolvingConnectionSchema,
    ProblemCatalogSchema,
    ProblemSolveEventSchema,
    CodingContestSchema,
    ContestParticipationSchema,
    UserProblemTopicSchema,
    ProblemSolvingProfileSummarySchema,
    XpTransactionSchema
)
