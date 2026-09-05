from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.assessment_engine import assessment_engine

router = APIRouter(tags=["Recruiter Assessments"])

class QuestionItem(BaseModel):
    id: Optional[str] = None
    question_text: str
    question_type: str = "single_choice" # single_choice, multiple_choice, short_answer
    options: List[str] = []
    correct_answers: List[str] = []
    explanation: Optional[str] = None
    points: int = 10

class CreateAssessmentPayload(BaseModel):
    title: str
    assessment_type: str # Aptitude Test, Technical MCQ, Custom Assessment
    job_title: str
    company: Optional[str] = "Acme Technologies"
    duration_minutes: int
    passing_score_pct: int
    instructions: Optional[str] = None
    questions: List[QuestionItem]
    show_correct_answers: bool = False

class SubmitAssessmentPayload(BaseModel):
    candidate_username: str
    candidate_name: str
    candidate_avatar: Optional[str] = "https://avatars.githubusercontent.com/u/1024025?v=4"
    answers: Dict[str, Any] # question_id -> response (str or list of str)
    completion_time_seconds: int

@router.post("/recruiter/assessments/create")
async def create_assessment(payload: CreateAssessmentPayload):
    """Recruiter creates a new Aptitude, Technical MCQ, or Custom assessment."""
    try:
        new_assessment = assessment_engine.create_assessment(
            title=payload.title,
            assessment_type=payload.assessment_type,
            job_title=payload.job_title,
            duration_minutes=payload.duration_minutes,
            passing_score_pct=payload.passing_score_pct,
            questions=[q.model_dump() for q in payload.questions],
            instructions=payload.instructions,
            company=payload.company or "Acme Technologies",
            show_correct_answers=payload.show_correct_answers
        )
        return new_assessment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/recruiter/assessments")
async def list_recruiter_assessments():
    """Lists all recruiter assessments with submission counts."""
    return {"assessments": assessment_engine.list_assessments()}

@router.get("/recruiter/assessments/{id}")
async def get_assessment_for_recruiter(id: str):
    """Retrieves full assessment definition including correct answers."""
    a = assessment_engine.get_assessment(id, is_candidate_view=False)
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return a

@router.get("/recruiter/assessments/{id}/submissions")
async def get_assessment_submissions(id: str):
    """Recruiter views candidate submissions with scores, percentages, and completion time."""
    subs = assessment_engine.get_assessment_submissions(id)
    return {"submissions": subs, "total": len(subs)}

@router.post("/recruiter/assessments/{id}/toggle-answers")
async def toggle_answers(id: str):
    """Toggles whether candidates can view correct answers."""
    try:
        res = assessment_engine.toggle_show_correct_answers(id)
        return res
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/assessments/{id}")
async def get_candidate_assessment(id: str):
    """Candidate views assessment. Correct answers and explanations are masked."""
    a = assessment_engine.get_assessment(id, is_candidate_view=True)
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return a

@router.post("/assessments/{id}/submit")
async def submit_assessment(id: str, payload: SubmitAssessmentPayload):
    """Candidate submits assessment; objective questions are scored automatically."""
    try:
        result = assessment_engine.score_submission(
            assessment_id=id,
            candidate_username=payload.candidate_username,
            candidate_name=payload.candidate_name,
            candidate_avatar=payload.candidate_avatar or "https://avatars.githubusercontent.com/u/1024025?v=4",
            answers=payload.answers,
            completion_time_seconds=payload.completion_time_seconds
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/assessments/{id}/result/{submission_id}")
async def get_submission_result(id: str, submission_id: str, as_recruiter: bool = False):
    """Retrieves result page. Answers remain confidential unless recruiter enabled."""
    result = assessment_engine.get_submission_result(submission_id, is_candidate=not as_recruiter)
    if not result:
        raise HTTPException(status_code=404, detail="Submission result not found")
    return result
