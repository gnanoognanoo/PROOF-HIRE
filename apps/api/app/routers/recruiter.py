from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.recruiter_service import recruiter_service

router = APIRouter(prefix="/recruiter", tags=["Recruiter Experience"])

class TalentSearchPayload(BaseModel):
    query: Optional[str] = None
    role: Optional[str] = None
    skills: Optional[List[str]] = None
    min_skill_level: Optional[int] = None
    overall_grade: Optional[str] = None
    min_level: Optional[int] = None
    badges: Optional[List[str]] = None
    min_verified_projects: Optional[int] = None
    min_collaboration_score: Optional[int] = None
    location: Optional[str] = None
    availability: Optional[str] = None
    education: Optional[str] = None
    min_problem_solving_score: Optional[int] = None
    min_verified_problems: Optional[int] = None
    min_medium_problems: Optional[int] = None
    min_hard_problems: Optional[int] = None
    coding_platform: Optional[str] = None
    algorithm_topic: Optional[str] = None
    min_topic_score: Optional[int] = None
    requires_contest_experience: Optional[bool] = None
    requires_problem_solving: Optional[bool] = None
    job_id: Optional[str] = None

class SaveCandidatePayload(BaseModel):
    username: str

class SendAssessmentPayload(BaseModel):
    username: str
    assessment_name: Optional[str] = "Standardized Systems Engineering Benchmark"

class InviteInterviewPayload(BaseModel):
    username: str
    role_title: str
    date_time: Optional[str] = "Tomorrow, 2:00 PM PST"

@router.get("/dashboard")
async def get_recruiter_dashboard():
    """
    Returns compact metrics:
    Open Positions, Saved Candidates, Assessments Sent, Upcoming Interviews,
    Recommended Candidates, Recent Applications, and Upcoming Interviews.
    """
    data = recruiter_service.get_dashboard_data()
    return data

@router.post("/talent/search")
async def search_talent(payload: TalentSearchPayload):
    """
    Searches candidates using professional filters (including Phase 11 problem solving
    reputation filters) and computes deterministic job match scores.
    """
    results = recruiter_service.search_talent(
        query=payload.query,
        role=payload.role,
        skills=payload.skills,
        min_skill_level=payload.min_skill_level,
        overall_grade=payload.overall_grade,
        min_level=payload.min_level,
        badges=payload.badges,
        min_verified_projects=payload.min_verified_projects,
        min_collaboration_score=payload.min_collaboration_score,
        location=payload.location,
        availability=payload.availability,
        education=payload.education,
        min_problem_solving_score=payload.min_problem_solving_score,
        min_verified_problems=payload.min_verified_problems,
        min_medium_problems=payload.min_medium_problems,
        min_hard_problems=payload.min_hard_problems,
        coding_platform=payload.coding_platform,
        algorithm_topic=payload.algorithm_topic,
        min_topic_score=payload.min_topic_score,
        requires_contest_experience=payload.requires_contest_experience,
        requires_problem_solving=payload.requires_problem_solving,
        job_id=payload.job_id
    )
    return {"candidates": results, "total": len(results)}

@router.get("/candidate/{username}")
async def get_candidate_detail(username: str):
    """
    Returns full recruiter candidate dossier across 10 sections:
    Professional Summary, Skill Reputation, Verified Projects, Project Grades,
    GitHub Evidence, Collaboration History, Certificates, Assessment Results,
    Badges, and Verification History.
    """
    dossier = recruiter_service.get_candidate_detail(username)
    if not dossier:
        raise HTTPException(status_code=404, detail=f"Candidate {username} not found.")
    return dossier

@router.post("/save-candidate")
async def toggle_save_candidate(payload: SaveCandidatePayload):
    """Toggles bookmark/saved state for a candidate."""
    res = recruiter_service.toggle_save_candidate(payload.username)
    return res

@router.post("/send-assessment")
async def send_assessment(payload: SendAssessmentPayload):
    """Dispatches standardized assessment challenge to candidate."""
    res = recruiter_service.send_assessment(payload.username, payload.assessment_name)
    return res

@router.post("/invite-interview")
async def invite_to_interview(payload: InviteInterviewPayload):
    """Schedules a Jitsi video interview huddle."""
    res = recruiter_service.invite_to_interview(
        username=payload.username,
        role_title=payload.role_title,
        date_time=payload.date_time
    )
    return res
