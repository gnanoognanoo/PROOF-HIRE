from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.interview_service import interview_service

router = APIRouter(tags=["Interviews & Notifications"])

class InviteInterviewPayload(BaseModel):
    candidate_username: str
    candidate_name: str
    job_title: str
    date: str
    time: str
    duration: str = "45 minutes"
    message: str = "We'd like to invite you for a technical interview huddle."
    company: Optional[str] = "Acme Technologies"
    interviewer: Optional[str] = "Sarah Lin (VP of Engineering)"
    candidate_avatar: Optional[str] = None

class RespondInterviewPayload(BaseModel):
    candidate_username: str
    action: str # ACCEPT or DECLINE

@router.post("/recruiter/interviews/invite")
async def invite_to_interview(payload: InviteInterviewPayload):
    """
    Recruiter invites candidate to interview.
    Generates/stores Jitsi Meet meeting room and dispatches candidate notification.
    """
    try:
        res = interview_service.invite_to_interview(
            candidate_username=payload.candidate_username,
            candidate_name=payload.candidate_name,
            job_title=payload.job_title,
            date=payload.date,
            time=payload.time,
            duration=payload.duration,
            message=payload.message,
            candidate_avatar=payload.candidate_avatar,
            company=payload.company or "Acme Technologies",
            interviewer=payload.interviewer or "Sarah Lin (VP of Engineering)"
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/recruiter/interviews")
async def get_upcoming_interviews():
    """Returns upcoming interviews for recruiter dashboard."""
    interviews = interview_service.get_upcoming_interviews()
    return {"interviews": interviews, "total": len(interviews)}

@router.get("/candidates/{username}/notifications")
async def get_candidate_notifications(username: str):
    """Retrieves notifications for candidate including interview invitations."""
    notifs = interview_service.get_candidate_notifications(username)
    return {"notifications": notifs, "total": len(notifs)}

@router.post("/candidates/interviews/{id}/respond")
async def respond_to_interview(id: str, payload: RespondInterviewPayload):
    """Candidate responds to interview invitation (ACCEPT or DECLINE)."""
    try:
        res = interview_service.respond_to_interview(
            interview_id=id,
            candidate_username=payload.candidate_username,
            action=payload.action
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
