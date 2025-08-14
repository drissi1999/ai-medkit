# app/api/medical.py
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.deps.auth import get_current_user, get_db_session, CurrentUser
from app.services.stt_service import transcribe_bytes

router = APIRouter()

class STTResponse(BaseModel):
    model: str
    transcript: str
    language: Optional[str] = None

class NoteRequest(BaseModel):
    transcript: str
    language: Optional[str] = "en"

class NoteDraft(BaseModel):
    soap: dict

@router.post("/stt", response_model=STTResponse)
async def stt_endpoint(
    audio: UploadFile = File(..., description="audio/webm|wav|m4a"),
    language: Optional[str] = Form(None),
    user: CurrentUser = Depends(get_current_user),
):
    """
    Transcribe audio → text (Whisper-style via HF pipeline).
    Requires Bearer token; current_user enforced for RLS elsewhere.
    """
    data = await audio.read()
    if not data:
        raise HTTPException(400, "Empty audio")
    text = await transcribe_bytes(data, language)
    return STTResponse(model="transformers:asr", transcript=text, language=language)

def _naive_soap(transcript: str, lang: str) -> dict:
    # Minimal rules-based SOAP scaffold. Replace with LLM later.
    lines = [ln.strip("-•: ").strip() for ln in transcript.splitlines() if ln.strip()]
    subj = [ln for ln in lines if any(k in ln.lower() for k in ["pain", "douleur", "mal", "symptom", "symptôme"])]
    obj  = [ln for ln in lines if any(k in ln.lower() for k in ["bp", "hr", "temp", "tension", "examen"])]
    assess = ["Differential Dx (draft): …"]
    plan = ["Tests: …", "Rx: …", "Follow-up: …"]
    return {
        "subjective": subj or lines[:3],
        "objective": obj or lines[3:6],
        "assessment": assess,
        "plan": plan,
    }

@router.post("/note-from-transcript", response_model=NoteDraft)
async def note_from_transcript(
    body: NoteRequest,
    user: CurrentUser = Depends(get_current_user),
    session = Depends(get_db_session)  # RLS-ready session if you need DB writes
):
    """
    Build a draft SOAP note from transcript.
    *Intentionally deterministic & simple for MVP; swap with LLM later.*
    """
    soap = _naive_soap(body.transcript, body.language or "en")
    return NoteDraft(soap=soap)

@router.get("/ping")
async def ping():
    return {"medical": "ok"}
