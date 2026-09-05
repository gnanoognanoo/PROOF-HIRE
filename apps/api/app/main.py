from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import (
    candidates, evaluation, recruiter, assessments, blockchain, projects, reputation, github, collaborations, credentials, recruiter_assessments, interviews
)

app = FastAPI(
    title="ProofHire API",
    version="1.0.0",
    description="Cryptographic Skill-Verification and Hiring Network API powered by Gemini 1.5 and Polygon PoS."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Project submission & AI evaluation routes
app.include_router(projects.router)
app.include_router(projects.router, prefix="/api/v1")

# Core Deterministic Reputation & Badge Engine routes
app.include_router(reputation.router)
app.include_router(reputation.router, prefix="/api/v1")

# GitHub Verification & Contribution Engine routes
app.include_router(github.router)
app.include_router(github.router, prefix="/api/v1")

# Collaboration Workspace & Discovery routes
app.include_router(collaborations.router)
app.include_router(collaborations.router, prefix="/api/v1")

# Cryptographic Credential Verification routes
app.include_router(credentials.router)
app.include_router(credentials.router, prefix="/api/v1")

# Recruiter & Deterministic Match Engine routes
app.include_router(recruiter.router)
app.include_router(recruiter.router, prefix="/api/v1")

# Recruiter Assessments & Candidate Testing routes
app.include_router(recruiter_assessments.router)
app.include_router(recruiter_assessments.router, prefix="/api/v1")

# Interviews & Candidate Notifications routes
app.include_router(interviews.router)
app.include_router(interviews.router, prefix="/api/v1")

app.include_router(candidates.router, prefix="/api/v1")
app.include_router(evaluation.router, prefix="/api/v1")
app.include_router(assessments.router, prefix="/api/v1")
app.include_router(blockchain.router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {
        "status": "operational",
        "service": "ProofHire Verification Engine",
        "version": "1.0.0",
        "gemini_active": bool(settings.GEMINI_API_KEY),
        "polygon_synced": True
    }
