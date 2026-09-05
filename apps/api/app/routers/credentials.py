import base64
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from pydantic import BaseModel, Field
from app.services.credential_service import (
    credential_service,
    VerificationLevel,
    CredentialStatus
)

router = APIRouter(prefix="/credentials", tags=["Credential Verification"])

class IssueCredentialRequest(BaseModel):
    owner_id: str
    owner_username: Optional[str] = None
    credential_type: str
    issuer: str
    entity_id: str
    file_base64: str = Field(..., description="Base64-encoded bytes of evidence file")
    file_name: Optional[str] = "evidence.pdf"
    verification_level: Optional[str] = VerificationLevel.PLATFORM_VERIFIED
    custom_credential_id: Optional[str] = None

class VerifyDocumentRequest(BaseModel):
    file_base64: str = Field(..., description="Base64-encoded bytes of document to verify")

class RevokeCredentialRequest(BaseModel):
    reason: str

@router.get("/{credential_id}")
async def get_credential(credential_id: str):
    """
    Retrieves full verified credential record for the verification page.
    Returns status, credential type, owner, issued date, blockchain tx,
    document integrity, issuer, and verification level.
    """
    rec = credential_service.get_credential(credential_id)
    if not rec:
        raise HTTPException(
            status_code=404, 
            detail=f"Credential '{credential_id}' not found on Polygon registry."
        )
    return rec

@router.post("/issue")
async def issue_credential(payload: IssueCredentialRequest):
    """
    Issues and anchors a new credential record to Polygon:
    Calculates SHA-256 hash, stores in Supabase Storage, and registers on-chain.
    """
    try:
        file_bytes = base64.b64decode(payload.file_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 encoding for file evidence.")

    rec = credential_service.issue_credential(
        owner_id=payload.owner_id,
        credential_type=payload.credential_type,
        issuer=payload.issuer,
        entity_id=payload.entity_id,
        file_bytes=file_bytes,
        file_name=payload.file_name or "evidence.pdf",
        verification_level=payload.verification_level or VerificationLevel.PLATFORM_VERIFIED,
        owner_username=payload.owner_username,
        custom_credential_id=payload.custom_credential_id
    )
    return rec

@router.post("/{credential_id}/verify-document")
async def verify_document_integrity(credential_id: str, payload: VerifyDocumentRequest):
    """
    Recomputes SHA-256 hash of an uploaded document and compares it with
    the on-chain anchored hash to prove non-alteration.
    """
    try:
        file_bytes = base64.b64decode(payload.file_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 encoding for document.")

    res = credential_service.verify_document_integrity(credential_id, file_bytes)
    if not res.get("is_found"):
        raise HTTPException(status_code=404, detail=res["message"])
    return res

@router.post("/{credential_id}/revoke")
async def revoke_credential(credential_id: str, payload: RevokeCredentialRequest):
    """Revokes an issued credential with an explicit reason."""
    try:
        res = credential_service.revoke_credential(credential_id, payload.reason)
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/owner/{owner_username}")
async def list_owner_credentials(owner_username: str):
    """Lists all verified credentials anchored for a given candidate."""
    creds = credential_service.list_owner_credentials(owner_username)
    return {"credentials": creds, "total": len(creds)}
