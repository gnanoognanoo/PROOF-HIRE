from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from app.services.collaboration_service import collaboration_service

router = APIRouter(prefix="/collaborations", tags=["Collaboration Engine"])

class CreateWorkspaceRequest(BaseModel):
    name: str
    tagline: Optional[str] = "Collaborative development initiative"
    repo_url: Optional[str] = "https://github.com/proofhire/new-repo"
    repo_name: Optional[str] = "new-repo"
    primary_stack: Optional[List[str]] = Field(default_factory=lambda: ["TypeScript", "Next.js"])
    target_completion_date: Optional[str] = "2024-12-31"
    xp_pool: Optional[int] = 800
    description: Optional[str] = ""

class TaskMutationRequest(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = ""
    status: str = Field("todo", description="todo | in_progress | completed")
    assignee: Optional[str] = "Unassigned"
    assignee_avatar: Optional[str] = None
    priority: Optional[str] = "Medium"
    tags: Optional[List[str]] = Field(default_factory=lambda: ["Feature"])

class InviteDeveloperRequest(BaseModel):
    username: str
    role: Optional[str] = "Collaborating Engineer"
    name: Optional[str] = None

class CompleteProjectRequest(BaseModel):
    custom_xp_pool: Optional[int] = None

@router.get("")
async def list_collaborations():
    """Lists all active and completed collaboration workspaces."""
    return collaboration_service.list_collaborations()

@router.post("")
async def create_collaboration(payload: CreateWorkspaceRequest):
    """Creates a new collaboration workspace."""
    workspace = collaboration_service.create_workspace(payload.dict())
    return workspace

@router.get("/discover")
async def discover_developers(
    skill: Optional[str] = Query(None, description="Filter by skill, e.g. React, Rust, Go"),
    min_level: Optional[int] = Query(None, description="Minimum reputation level"),
    max_level: Optional[int] = Query(None, description="Maximum reputation level"),
    availability: Optional[str] = Query(None, description="Filter by availability"),
    location: Optional[str] = Query(None, description="Filter by location"),
    badge: Optional[str] = Query(None, description="Filter by badge name"),
    search: Optional[str] = Query(None, description="Keyword search")
):
    """
    Search and filter developers for collaboration invitations.
    Returns: Name, Headline, Level, Top skills, Badges, Current availability, Location.
    """
    results = collaboration_service.discover_developers(
        skill=skill,
        min_level=min_level,
        max_level=max_level,
        availability=availability,
        location=location,
        badge=badge,
        search=search
    )
    return {"developers": results, "total": len(results)}

@router.get("/{workspace_id}")
async def get_collaboration_workspace(workspace_id: str):
    """Retrieves full collaboration workspace with 6 tabs data, members, and task boards."""
    ws = collaboration_service.get_workspace(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail=f"Collaboration workspace {workspace_id} not found.")
    return ws

@router.post("/{workspace_id}/tasks")
async def add_or_update_task(workspace_id: str, payload: TaskMutationRequest):
    """Adds a task or updates existing task status (todo -> in_progress -> completed)."""
    try:
        task = collaboration_service.add_or_update_task(workspace_id, payload.dict())
        return task
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{workspace_id}/invite")
async def invite_developer(workspace_id: str, payload: InviteDeveloperRequest):
    """Invites a developer from Discover into the workspace."""
    try:
        res = collaboration_service.invite_developer(workspace_id, payload.dict())
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{workspace_id}/complete")
async def complete_collaboration_project(workspace_id: str, payload: CompleteProjectRequest):
    """
    Executes completion workflow:
    1. Runs GitHub multi-signal contribution analysis.
    2. Determines normalized contribution percentages.
    3. AI project evaluation & Project XP Pool (e.g. 800 XP).
    4. Distributes individual XP:
       - Gnaneshwar: 45% -> 360 XP
       - Arun: 35% -> 280 XP
       - Priya: 20% -> 160 XP
    5. Updates reputation state, levels, and unlocks badges.
    """
    try:
        result = await collaboration_service.complete_project_and_allocate_xp(
            workspace_id=workspace_id,
            custom_xp_pool=payload.custom_xp_pool
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
