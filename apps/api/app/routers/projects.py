import asyncio
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from app.services.evaluation_engine import evaluation_engine, EvaluationStatusStage

router = APIRouter(tags=["Projects & AI Evaluation"])

# In-memory store for projects and their active evaluation tasks
PROJECTS_STORE: Dict[str, Dict[str, Any]] = {}
EVALUATIONS_STORE: Dict[str, Dict[str, Any]] = {}

# -------------------------------------------------------------
# Pydantic Schemas
# -------------------------------------------------------------
class ProjectSubmissionRequest(BaseModel):
    # Step 1 — Basic Details
    title: str = Field(..., min_length=2)
    description: str = Field(..., min_length=10)
    category: str = Field(default="Full-Stack Engineering")
    project_type: str = Field(default="Production Application")
    start_date: Optional[str] = "2024-09-01"
    completion_date: Optional[str] = "2025-01-15"

    # Step 2 — Technical Information
    repo_url: str = Field(..., description="GitHub repository URL")
    demo_url: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    architecture: Optional[str] = "Distributed service oriented architecture"

    # Step 3 — Contribution
    is_team: bool = Field(default=False)
    team_members: Optional[List[str]] = Field(default_factory=list)
    role: str = Field(default="Lead Full-Stack Engineer")
    responsibilities: Optional[str] = "Core architecture, API contracts, and frontend rendering pipeline."

    # Step 4 — Evidence
    screenshots: Optional[List[str]] = Field(default_factory=list)
    documentation: Optional[str] = "Comprehensive architecture documentation in README.md"
    supporting_files: Optional[List[str]] = Field(default_factory=list)

class ProjectResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    project_type: str
    start_date: Optional[str]
    completion_date: Optional[str]
    repo_url: str
    demo_url: Optional[str]
    technologies: List[str]
    architecture: Optional[str]
    is_team: bool
    team_members: List[str]
    role: str
    responsibilities: Optional[str]
    screenshots: List[str]
    documentation: Optional[str]
    supporting_files: List[str]
    status: str
    created_at: str
    evaluation_id: Optional[str] = None
    grade: Optional[str] = None
    score: Optional[float] = None
    xp_earned: Optional[int] = None

class EvaluationStatusResponse(BaseModel):
    project_id: str
    evaluation_id: str
    stage: str
    progress: int
    is_complete: bool
    log_message: str
    evaluation_result: Optional[Dict[str, Any]] = None

# Seed initial projects so /projects/[id] has rich data immediately
def seed_initial_projects():
    if "proj_proofhire" not in PROJECTS_STORE:
        proofhire_eval = {
            "grade": "A",
            "score": 86.0,
            "xp_earned": 620,
            "skills_detected": ["React", "Next.js", "TypeScript", "PostgreSQL", "REST APIs"],
            "breakdown": {
                "technical_complexity": 91.0,
                "code_quality": 84.0,
                "innovation": 87.0,
                "industry_relevance": 90.0,
                "documentation": 76.0,
                "completion": 93.0,
                "collaboration": 82.0
            },
            "weights": {
                "technical_complexity": 0.25,
                "code_quality": 0.20,
                "innovation": 0.15,
                "industry_relevance": 0.15,
                "documentation": 0.10,
                "completion": 0.10,
                "collaboration": 0.05
            },
            "why_this_grade": (
                "The ProofHire codebase showcases high architectural discipline, type-safe API boundaries, and clear modular structure. "
                "The code achieves Grade A with strong AST integrity and high performance across asynchronous data ingestion, "
                "with minor room for extended automated integration coverage."
            ),
            "strengths": [
                "Robust type boundaries with zero-tolerance for implicit any casts across frontend and API layers.",
                "High-performance client-side rendering pipeline with optimized tree-shaking and component memoization.",
                "Well-isolated service architecture with clean dependency injection and clear schema models.",
                "Consistent cryptographic hashing and AST verification integration."
            ],
            "areas_for_improvement": [
                "Increase unit test assertion density for boundary error conditions and transient network partitions.",
                "Expand inline API schema documentation and automated OpenAPI client SDK generation.",
                "Add automated benchmark regression profiling into CI workflow."
            ],
            "industry_skills_demonstrated": [
                "Production React 19 Server Components Architecture",
                "Full-Stack TypeScript Contract Enforcement",
                "Relational Database Schema Normalization & Query Tuning",
                "FastAPI Asynchronous Request Pipelines",
                "Cryptographic Signature Hashing & Verification"
            ],
            "recommended_next_skills": [
                "Distributed Caching with Redis & Cache Invalidation",
                "Zero-Knowledge Proofs & zk-SNARKs Verification",
                "Real-time Distributed Event Streaming (Apache Kafka / Redpanda)",
                "eBPF Observability & Linux Kernel Performance Profiling"
            ],
            "badges_earned": [
                {"badge_name": "Frontend Developer — Gold", "tier": "Gold", "category": "Architecture"},
                {"badge_name": "React Developer — Gold", "tier": "Gold", "category": "Ecosystem Mastery"},
                {"badge_name": "Team Collaborator — Silver", "tier": "Silver", "category": "Collaboration"}
            ],
            "verified_at": "2025-01-20T10:00:00Z"
        }

        PROJECTS_STORE["proj_proofhire"] = {
            "id": "proj_proofhire",
            "title": "ProofHire",
            "description": "AI-powered skill verification platform eliminating unverified resume claims through compiler-level AST audits, GPG commit attribution, and Polygon blockchain credential anchoring.",
            "category": "Full-Stack & Systems",
            "project_type": "Production Platform",
            "start_date": "2024-09-01",
            "completion_date": "2025-01-15",
            "repo_url": "https://github.com/proofhire/proofhire-core",
            "demo_url": "https://proofhire.network",
            "technologies": ["React", "FastAPI", "PostgreSQL", "Gemini", "Next.js", "TypeScript"],
            "architecture": "Next.js 14 App Router client with asynchronous FastAPI evaluator microservice and Polygon state contract integration.",
            "is_team": True,
            "team_members": ["alexchen", "dkalu"],
            "role": "Lead Full-Stack Engineer",
            "responsibilities": "Designed core verification pipeline, AST scoring engine, and high-density UI layout.",
            "screenshots": [
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=350&fit=crop",
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=350&fit=crop"
            ],
            "documentation": "Full architectural diagrams, AST schema definitions, and API documentation.",
            "supporting_files": ["proofhire-ast-spec.json", "merkle-verification.sol"],
            "status": "EVALUATED",
            "created_at": "2025-01-15T12:00:00Z",
            "evaluation_id": "eval_proofhire",
            "grade": "A",
            "score": 86.0,
            "xp_earned": 620
        }

        EVALUATIONS_STORE["proj_proofhire"] = {
            "project_id": "proj_proofhire",
            "evaluation_id": "eval_proofhire",
            "stage": EvaluationStatusStage.COMPLETE,
            "progress": 100,
            "is_complete": True,
            "log_message": "Audit complete. Assigned Grade A (86.0/100) with +620 XP.",
            "evaluation_result": proofhire_eval
        }

seed_initial_projects()

# Background evaluation task
async def run_evaluation_task(project_id: str):
    project = PROJECTS_STORE.get(project_id)
    if not project:
        return

    async def on_progress(stage: str, progress: int, message: str):
        EVALUATIONS_STORE[project_id] = {
            "project_id": project_id,
            "evaluation_id": project.get("evaluation_id", f"eval_{uuid.uuid4().hex[:6]}"),
            "stage": stage,
            "progress": progress,
            "is_complete": stage == EvaluationStatusStage.COMPLETE,
            "log_message": message,
            "evaluation_result": None
        }

    try:
        eval_result = await evaluation_engine.run_pipeline_with_progress(project, on_progress)
        
        # Update evaluation store
        EVALUATIONS_STORE[project_id]["is_complete"] = True
        EVALUATIONS_STORE[project_id]["evaluation_result"] = eval_result
        
        # Update project record
        project["status"] = "EVALUATED"
        project["grade"] = eval_result["grade"]
        project["score"] = eval_result["score"]
        project["xp_earned"] = eval_result["xp_earned"]

        # Automatically invoke Reputation Engine to award project XP and evaluate badges
        try:
            from app.routers.reputation import get_or_create_user_reputation
            from app.services.reputation_engine import reputation_engine
            author = project.get("team_members", ["alexchen"])[0] if project.get("team_members") else "alexchen"
            user_rep = get_or_create_user_reputation(author)
            awarded_xp = eval_result["xp_earned"]
            user_rep["cumulative_xp"] += awarded_xp
            user_rep["verified_projects_count"] = user_rep.get("verified_projects_count", 6) + 1

            # Skill XP distribution
            techs = eval_result.get("skills_detected", ["React", "TypeScript", "FastAPI", "Git"])
            weights = {t: 1.0 / len(techs) for t in techs}
            dist = reputation_engine.distribute_skill_xp(awarded_xp, weights)
            for s_name, s_xp in dist.items():
                if s_name not in user_rep["skills"]:
                    user_rep["skills"][s_name] = {
                        "cumulative_xp": 0,
                        "level": 1,
                        "score": int(eval_result["score"]),
                        "verified_projects": 0,
                        "grade": eval_result["grade"]
                    }
                user_rep["skills"][s_name]["cumulative_xp"] += s_xp
                user_rep["skills"][s_name]["verified_projects"] += 1

            reputation_engine.recalculate_user_reputation(user_rep)
        except Exception as rep_err:
            print(f"Reputation update note: {rep_err}")
    except Exception as e:
        EVALUATIONS_STORE[project_id] = {
            "project_id": project_id,
            "evaluation_id": project.get("evaluation_id", "eval_failed"),
            "stage": "Error during evaluation",
            "progress": 100,
            "is_complete": True,
            "log_message": f"Evaluation halted: {str(e)}",
            "evaluation_result": None
        }

# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------
@router.post("/projects", response_model=ProjectResponse)
async def create_project(payload: ProjectSubmissionRequest):
    project_id = f"proj_{uuid.uuid4().hex[:8]}"
    eval_id = f"eval_{uuid.uuid4().hex[:6]}"

    project_data = {
        "id": project_id,
        "title": payload.title,
        "description": payload.description,
        "category": payload.category,
        "project_type": payload.project_type,
        "start_date": payload.start_date,
        "completion_date": payload.completion_date,
        "repo_url": payload.repo_url,
        "demo_url": payload.demo_url,
        "technologies": payload.technologies,
        "architecture": payload.architecture,
        "is_team": payload.is_team,
        "team_members": payload.team_members or [],
        "role": payload.role,
        "responsibilities": payload.responsibilities,
        "screenshots": payload.screenshots or [],
        "documentation": payload.documentation,
        "supporting_files": payload.supporting_files or [],
        "status": "PENDING_EVALUATION",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "evaluation_id": eval_id,
        "grade": None,
        "score": None,
        "xp_earned": None
    }

    PROJECTS_STORE[project_id] = project_data

    # Initialize empty evaluation state
    EVALUATIONS_STORE[project_id] = {
        "project_id": project_id,
        "evaluation_id": eval_id,
        "stage": EvaluationStatusStage.PREPARING,
        "progress": 0,
        "is_complete": False,
        "log_message": "Ready to begin compiler and AST evaluation.",
        "evaluation_result": None
    }

    return ProjectResponse(**project_data)

@router.get("/projects", response_model=List[ProjectResponse])
async def list_projects():
    return [ProjectResponse(**p) for p in PROJECTS_STORE.values()]

@router.get("/projects/{id}", response_model=ProjectResponse)
async def get_project(id: str):
    project = PROJECTS_STORE.get(id)
    if not project:
        # Check if requested id matches without prefix or variations
        match = next((p for k, p in PROJECTS_STORE.items() if k == id or p["title"].lower() == id.lower()), None)
        if match:
            project = match
        else:
            raise HTTPException(status_code=404, detail=f"Project '{id}' not found")
    return ProjectResponse(**project)

@router.post("/projects/{id}/evaluate", response_model=EvaluationStatusResponse)
async def trigger_project_evaluation(id: str, background_tasks: BackgroundTasks):
    project = PROJECTS_STORE.get(id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{id}' not found")

    project["status"] = "EVALUATING"
    
    # Reset evaluation store
    EVALUATIONS_STORE[id] = {
        "project_id": id,
        "evaluation_id": project.get("evaluation_id", f"eval_{uuid.uuid4().hex[:6]}"),
        "stage": EvaluationStatusStage.PREPARING,
        "progress": 10,
        "is_complete": False,
        "log_message": "Starting evaluation worker.",
        "evaluation_result": None
    }

    # Queue background task
    background_tasks.add_task(run_evaluation_task, id)

    return EvaluationStatusResponse(**EVALUATIONS_STORE[id])

@router.get("/projects/{id}/evaluation", response_model=EvaluationStatusResponse)
async def get_project_evaluation(id: str):
    evaluation = EVALUATIONS_STORE.get(id)
    if not evaluation:
        # Check if project exists and has completed evaluation
        project = PROJECTS_STORE.get(id)
        if project and project.get("grade"):
            # Synthetic result from project
            return EvaluationStatusResponse(
                project_id=id,
                evaluation_id=project.get("evaluation_id", "eval_synth"),
                stage=EvaluationStatusStage.COMPLETE,
                progress=100,
                is_complete=True,
                log_message="Audit complete.",
                evaluation_result={
                    "grade": project["grade"],
                    "score": project["score"],
                    "xp_earned": project["xp_earned"],
                    "skills_detected": project.get("technologies", []),
                    "breakdown": {
                        "technical_complexity": 91.0,
                        "code_quality": 84.0,
                        "innovation": 87.0,
                        "industry_relevance": 90.0,
                        "documentation": 76.0,
                        "completion": 93.0,
                        "collaboration": 82.0
                    },
                    "why_this_grade": "Evaluated with high architectural discipline.",
                    "strengths": ["High code quality", "Solid component design"],
                    "areas_for_improvement": ["Extend integration test coverage"],
                    "industry_skills_demonstrated": project.get("technologies", []),
                    "recommended_next_skills": ["Redis Caching", "Docker"]
                }
            )
        raise HTTPException(status_code=404, detail=f"Evaluation for project '{id}' not found")

    return EvaluationStatusResponse(**evaluation)
