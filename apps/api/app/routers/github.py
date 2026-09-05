from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from app.services.github_service import github_service

router = APIRouter(prefix="/github", tags=["GitHub Verification"])

class ConnectGitHubRequest(BaseModel):
    username: str
    github_username: str
    name: Optional[str] = None
    code: Optional[str] = None

class VerifyContributionRequest(BaseModel):
    repo_url: str
    contributors: Optional[List[Dict[str, Any]]] = None

@router.get("/oauth/url")
async def get_oauth_url(username: str = Query(..., description="ProofHire username")):
    """Returns the authorization URL for GitHub OAuth."""
    url = github_service.get_oauth_authorize_url(username)
    return {"url": url, "username": username}

@router.post("/oauth/callback")
async def handle_oauth_callback(payload: ConnectGitHubRequest):
    """Connects or authenticates user GitHub account."""
    profile = github_service.connect_account(
        username=payload.username,
        github_username=payload.github_username,
        name=payload.name
    )
    return {
        "status": "connected",
        "message": f"GitHub account @{payload.github_username} successfully linked.",
        "profile": profile
    }

@router.get("/status")
async def get_github_status(username: str = Query(..., description="ProofHire username")):
    """Retrieves connection status and profile of user's GitHub account."""
    status = github_service.get_account_status(username)
    return status

@router.post("/disconnect")
async def disconnect_github(username: str = Query(..., description="ProofHire username")):
    """Disconnects linked GitHub account."""
    success = github_service.disconnect_account(username)
    return {"status": "disconnected" if success else "not_found", "username": username}

@router.get("/repos")
async def list_repositories(username: str = Query("alexchen", description="ProofHire username")):
    """Lists accessible project repositories for user."""
    repos = await github_service.list_user_repositories(username)
    return {"repositories": repos, "count": len(repos)}

@router.get("/repos/{owner}/{repo}")
async def get_repository_details(owner: str, repo: str):
    """Retrieves in-depth repository signals, languages, commits, PRs, and contributors."""
    identifier = f"{owner}/{repo}"
    details = await github_service.get_repository_details(identifier)
    return details

@router.post("/verify-contribution")
async def verify_contribution(payload: VerifyContributionRequest):
    """
    Runs the deterministic 5-signal contribution scoring model:
    Commit activity (30%), File changes (20%), PR participation (20%),
    Consistency (15%), Task evidence (15%).
    Generates normalized Contribution Score, Contribution %, and Verification Confidence.
    """
    repo_details = await github_service.get_repository_details(payload.repo_url)
    contributors = payload.contributors or repo_details.get("contributors", [])
    
    audited = github_service.audit_team_contributions(contributors)
    return {
        "repo_name": repo_details.get("name"),
        "full_name": repo_details.get("full_name"),
        "primary_language": repo_details.get("primary_language"),
        "total_commits": repo_details.get("commits_count"),
        "contributions": audited
    }
