from fastapi import APIRouter, HTTPException
from app.models.schemas import RepoEvaluationRequest, RepoEvaluationResponse, ProjectSchema, EvaluationMetric, ContributorAttributionSchema
from app.services.gemini_service import gemini_service
from app.services.github_service import github_service
from app.services.polygon_service import polygon_service
import uuid

router = APIRouter(prefix="/projects", tags=["AI Evaluation"])

@router.post("/evaluate", response_model=RepoEvaluationResponse)
async def evaluate_repository(payload: RepoEvaluationRequest):
    if not payload.repo_url:
        raise HTTPException(status_code=400, detail="Repository URL is required")

    # 1. Analyze Git Tree & contributions
    git_data = await github_service.analyze_repo(payload.repo_url)
    
    # 2. Run Gemini 1.5 AST static invariant evaluation
    eval_result = await gemini_service.evaluate_repository(payload.repo_url)

    # 3. Anchor proof on Polygon simulation
    sha256_root = polygon_service.generate_sha256_merkle(
        payload.repo_url,
        git_data["commit_hash"],
        eval_result["score"]
    )
    
    anchor_res = await polygon_service.anchor_proof_onchain(
        developer_address="0x892aF7B6E67a84e313B11D445218d6e3c041B320",
        project_id=git_data["repo_name"],
        sha256_root=sha256_root,
        grade=eval_result["grade"],
        score=eval_result["score"],
        xp_earned=1450
    )

    project = ProjectSchema(
        id=f"proj_{uuid.uuid4().hex[:8]}",
        title=f"{git_data['repo_name'].replace('-', ' ').title()} — Automated AI Audit",
        slug=git_data["repo_name"],
        category="Systems Engineering",
        description=f"Verified repository {payload.repo_url} on branch {payload.branch}.",
        repo_url=payload.repo_url,
        primary_stack=["Rust", "Go", "Distributed Systems"],
        grade=eval_result["grade"],
        score=eval_result["score"],
        metrics=EvaluationMetric(**eval_result["metrics"]),
        sha256_hash=sha256_root,
        polygon_tx_hash=anchor_res["polygon_tx_hash"],
        merkle_root=anchor_res["merkle_root"],
        commit_count=git_data["commit_count"],
        loc_count=git_data["loc_count"],
        gemini_review_note=eval_result["review_note"],
        attributions=[ContributorAttributionSchema(**a) for a in git_data["attributions"]]
    )

    return RepoEvaluationResponse(
        evaluation_id=f"eval_{uuid.uuid4().hex[:6]}",
        status="COMPLETED",
        project=project,
        ast_invariants_cleared=eval_result.get("ast_invariants_cleared", True),
        summary=f"Audit completed: assigned Grade {eval_result['grade']} ({eval_result['score']}%). SHA-256 anchored to Polygon block #{anchor_res['block_height']}."
    )
