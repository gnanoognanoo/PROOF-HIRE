from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.reputation_engine import (
    reputation_engine, 
    ProfessionalReputationGrade,
    REPUTATION_GRADE_TITLE
)
from datetime import datetime

router = APIRouter(prefix="/reputation", tags=["Reputation Engine"])

# In-memory user reputation store
USER_REPUTATION_STORE: Dict[str, Dict[str, Any]] = {}

def get_or_create_user_reputation(username: str) -> Dict[str, Any]:
    uname = username.lower()
    if uname not in USER_REPUTATION_STORE:
        # Initialize default calibrated state for GNANESHWAR R
        USER_REPUTATION_STORE[uname] = {
            "username": username,
            "cumulative_xp": 8420,
            "level": 37,
            "professional_reputation_grade": ProfessionalReputationGrade.B,
            "grade_system_title": REPUTATION_GRADE_TITLE,
            "target_level_xp": 8800,
            "xp_to_next_level": 380,
            "collaboration_score": 86,
            "verified_projects_count": 6,
            "skills": {
                "React": {"cumulative_xp": 2200, "level": 34, "score": 88, "verified_projects": 5, "grade": "A"},
                "TypeScript": {"cumulative_xp": 1600, "level": 29, "score": 82, "verified_projects": 4, "grade": "A"},
                "Python": {"cumulative_xp": 1400, "level": 27, "score": 80, "verified_projects": 3, "grade": "A"},
                "FastAPI": {"cumulative_xp": 1050, "level": 23, "score": 76, "verified_projects": 3, "grade": "B"},
                "Git": {"cumulative_xp": 1850, "level": 31, "score": 84, "verified_projects": 6, "grade": "A"},
            },
            "badges": [
                "Frontend Developer — Gold",
                "React Developer — Gold",
                "Team Collaborator — Silver",
                "Python Developer — Silver"
            ],
            "notifications": []
        }
    return USER_REPUTATION_STORE[uname]

# -------------------------------------------------------------
# Schemas
# -------------------------------------------------------------
class AwardXpRequest(BaseModel):
    username: str
    source_type: str = Field(..., description="PROJECT | CERTIFICATE | COLLABORATION | ASSESSMENT | ACHIEVEMENT")
    source_title: str
    grade: Optional[str] = "B"
    complexity_score: Optional[float] = 85.0
    is_verified: Optional[bool] = True
    contribution_percentage: Optional[float] = 100.0
    completion_quality: Optional[float] = 90.0
    score: Optional[float] = 90.0
    percentile: Optional[float] = 95.0
    tier: Optional[str] = "GLOBAL"
    team_size: Optional[int] = 4
    skill_weights: Optional[Dict[str, float]] = Field(
        default_factory=lambda: {"React": 0.40, "TypeScript": 0.25, "FastAPI": 0.20, "Git": 0.15}
    )

class AwardXpResponse(BaseModel):
    awarded_xp: int
    new_cumulative_xp: int
    old_level: int
    new_level: int
    professional_reputation_grade: str
    grade_system_title: str
    target_level_xp: int
    xp_to_next_level: int
    skill_xp_distributed: Dict[str, int]
    newly_unlocked_badges: List[Dict[str, str]]
    notifications: List[Dict[str, str]]

# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------
@router.get("/user/{username}")
async def get_user_reputation(username: str):
    rep = get_or_create_user_reputation(username)
    
    # Recalculate level & grade
    level, grade, current_xp, next_target = reputation_engine.calculate_level_from_xp(rep["cumulative_xp"])
    rep["level"] = level
    rep["professional_reputation_grade"] = grade
    rep["grade_system_title"] = REPUTATION_GRADE_TITLE
    rep["target_level_xp"] = next_target
    rep["xp_to_next_level"] = max(0, next_target - current_xp)

    # Recalculate skill levels
    for s_name, s_data in rep.get("skills", {}).items():
        s_data["level"] = reputation_engine.calculate_skill_level(s_data.get("cumulative_xp", 0))

    return rep

@router.post("/award-xp", response_model=AwardXpResponse)
async def award_xp(payload: AwardXpRequest):
    rep = get_or_create_user_reputation(payload.username)
    old_level = rep["level"]

    # 1. Deterministically calculate XP based on source type and calibrated modifiers
    awarded_xp = reputation_engine.calculate_source_xp(
        source_type=payload.source_type,
        grade=payload.grade,
        complexity_score=payload.complexity_score,
        is_verified=payload.is_verified,
        contribution_percentage=payload.contribution_percentage,
        completion_quality=payload.completion_quality,
        score=payload.score,
        percentile=payload.percentile,
        tier=payload.tier,
        team_size=payload.team_size
    )

    # 2. Add to cumulative XP
    rep["cumulative_xp"] += awarded_xp

    # If it was a project, increment verified projects count
    if payload.source_type.upper().startswith("PROJECT"):
        rep["verified_projects_count"] = rep.get("verified_projects_count", 6) + 1

    # 3. Recalculate level and Professional Reputation Grade
    new_level, new_grade, cur_xp, next_target = reputation_engine.calculate_level_from_xp(rep["cumulative_xp"])
    rep["level"] = new_level
    rep["professional_reputation_grade"] = new_grade
    rep["grade_system_title"] = REPUTATION_GRADE_TITLE
    rep["target_level_xp"] = next_target
    rep["xp_to_next_level"] = max(0, next_target - cur_xp)

    # 4. Distribute XP to skills
    skill_xp_distributed = {}
    if payload.skill_weights:
        distributed = reputation_engine.distribute_skill_xp(awarded_xp, payload.skill_weights)
        skill_xp_distributed = distributed
        for skill_name, sxp in distributed.items():
            if skill_name not in rep["skills"]:
                rep["skills"][skill_name] = {
                    "cumulative_xp": 0,
                    "level": 1,
                    "score": 75,
                    "verified_projects": 0,
                    "grade": payload.grade or "B"
                }
            rep["skills"][skill_name]["cumulative_xp"] += sxp
            rep["skills"][skill_name]["level"] = reputation_engine.calculate_skill_level(rep["skills"][skill_name]["cumulative_xp"])
            rep["skills"][skill_name]["verified_projects"] += 1
            # Update skill grade if newly awarded grade is stronger
            if payload.grade:
                rep["skills"][skill_name]["grade"] = payload.grade

    # 5. Evaluate Badge Rules
    verified_projects_by_skill = {k: v.get("verified_projects", 0) for k, v in rep["skills"].items()}
    skill_levels = {k: v.get("level", 1) for k, v in rep["skills"].items()}
    skill_grades = {k: v.get("grade", "B") for k, v in rep["skills"].items()}

    active_badges, new_notifications = reputation_engine.evaluate_badges(
        current_badges=rep["badges"],
        verified_projects_by_skill=verified_projects_by_skill,
        skill_levels=skill_levels,
        skill_grades=skill_grades,
        total_verified_projects=rep.get("verified_projects_count", 6)
    )

    # Update active badges and queue notifications
    for b in active_badges:
        if b["full_title"] not in rep["badges"]:
            rep["badges"].append(b["full_title"])

    for notif in new_notifications:
        rep.setdefault("notifications", []).append(notif)

    return AwardXpResponse(
        awarded_xp=awarded_xp,
        new_cumulative_xp=rep["cumulative_xp"],
        old_level=old_level,
        new_level=new_level,
        professional_reputation_grade=new_grade,
        grade_system_title=REPUTATION_GRADE_TITLE,
        target_level_xp=next_target,
        xp_to_next_level=rep["xp_to_next_level"],
        skill_xp_distributed=skill_xp_distributed,
        newly_unlocked_badges=new_notifications,
        notifications=rep["notifications"]
    )

@router.post("/recalculate/{username}")
async def recalculate_user(username: str):
    rep = get_or_create_user_reputation(username)
    updated_state, new_notifications = reputation_engine.recalculate_user_reputation(rep)
    return {
        "status": "recalculated",
        "user": updated_state,
        "new_notifications": new_notifications
    }

@router.get("/badges")
async def list_badge_definitions():
    return reputation_engine.BADGE_DEFINITIONS

@router.post("/notifications/dismiss")
async def dismiss_notifications(username: str):
    rep = get_or_create_user_reputation(username)
    rep["notifications"] = []
    return {"status": "cleared", "remaining": 0}
