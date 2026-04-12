"""
AI router — wraps Eddie's Corazon_AI modules in FastAPI endpoints.

All algorithm logic lives in `backend/ai/`. This file just defines the
HTTP surface, validates input with pydantic, and delegates.

Endpoints:
  POST /api/ai/chat                  → chatbot.chat (Groq + Supabase resource grounding)
  POST /api/ai/recommend             → algorithms.get_top_resources (archetype-based)
  POST /api/ai/impact                → algorithms.estimate_impact (sklearn / fallback)
  POST /api/ai/time-saved            → algorithms.calculate_time_saved
  POST /api/ai/discovery/recommend   → discovery_algorithms.get_top_events
  POST /api/ai/discovery/isolation   → discovery_algorithms.calculate_isolation_impact
  POST /api/ai/tts                   → ElevenLabs proxy (key never leaves the server)
  GET  /api/ai/health                → health check
"""

import os
from typing import Any, List, Optional

import httpx
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

from ai.algorithms import (
    build_complex_archetype,
    build_simple_archetype,
    calculate_time_saved,
    estimate_impact,
    get_top_resources,
)
from ai.chatbot import chat as ai_chat
from ai.discovery_algorithms import (
    build_discovery_archetype,
    calculate_isolation_impact,
    get_top_events,
)
from database import get_all_resources, get_events

router = APIRouter()


# ── REQUEST MODELS ───────────────────────────────────────────────────────────


class Message(BaseModel):
    role: str
    content: str


class ProfileBlock(BaseModel):
    goals: Optional[List[str]] = None
    occupation: Optional[str] = None
    immigration_status: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []
    language: str = "en"
    profile: Optional[ProfileBlock] = None


class RecommendRequest(BaseModel):
    immigration_status: str = "citizen"
    preferred_language: str = "en"
    occupation: str = "employed"
    interactions_log: List[str] = []
    n: int = 5


class ImpactRequest(BaseModel):
    immigration_status: str = "citizen"
    preferred_language: str = "en"
    occupation: str = "employed"


class TimeSavedRequest(BaseModel):
    immigration_status: str = "citizen"
    preferred_language: str = "en"
    occupation: str = "employed"
    interactions_log: List[str] = []


class DiscoveryRecommendRequest(BaseModel):
    immigration_status: str = "citizen"
    preferred_language: str = "en"
    occupation: str = "employed"
    event_interactions: List[str] = []
    age: Optional[int] = None
    n: int = 5


class IsolationRequest(BaseModel):
    immigration_status: str = "citizen"
    preferred_language: str = "en"
    occupation: str = "employed"


class TtsRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None  # optional override; defaults to Rachel


# ── HELPERS ──────────────────────────────────────────────────────────────────


def _profile_to_archetype(profile: Optional[ProfileBlock], language: str) -> dict | None:
    """
    Convert the lightweight ProfileBlock the frontend sends into a
    simple_archetype dict that chatbot.chat() can consume.
    """
    if not profile:
        return None

    immigration_status = profile.immigration_status or "citizen"
    occupation = profile.occupation or "employed"

    try:
        return build_simple_archetype(
            immigration_status=immigration_status,
            preferred_language=language,
            occupation=occupation,
        )
    except Exception as e:
        print(f"[_profile_to_archetype] could not build archetype: {e}")
        return None


# ── ENDPOINTS ────────────────────────────────────────────────────────────────


@router.post("/chat", response_class=PlainTextResponse)
async def chat(req: ChatRequest):
    """
    Chat with the bilingual Corazón assistant. Uses chatbot.chat() which
    grounds responses in real Supabase resources (no hallucinated phone
    numbers) and uses the upgraded Groq llama-3.3-70b-versatile model.
    """
    try:
        archetype = _profile_to_archetype(req.profile, req.language)
        history = [{"role": m.role, "content": m.content} for m in req.history]
        response_text = ai_chat(
            message=req.message,
            history=history,
            simple_archetype=archetype,
            auto_fetch=True,
        )
        return PlainTextResponse(content=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommend")
async def recommend(req: RecommendRequest):
    """
    Returns the top N resources for the user, scored by Eddie's archetype
    weighting (interaction history + immigration status + language).
    """
    try:
        simple = build_simple_archetype(
            immigration_status=req.immigration_status,
            preferred_language=req.preferred_language,
            occupation=req.occupation,
        )
        complex_arch = build_complex_archetype(simple, req.interactions_log)
        all_orgs = get_all_resources()
        top: list[dict[str, Any]] = get_top_resources(complex_arch, all_orgs, n=req.n)
        return {
            "archetype": complex_arch,
            "resources": top,
            "count": len(top),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/impact")
async def impact(req: ImpactRequest):
    """
    Returns estimated hours/yr of life lost to navigation + poverty
    premium, plus lifetime days. Uses the trained sklearn model when
    backend/ai/models/time_model.pkl is present, otherwise falls back to
    hardcoded archetype defaults.
    """
    try:
        simple = build_simple_archetype(
            immigration_status=req.immigration_status,
            preferred_language=req.preferred_language,
            occupation=req.occupation,
        )
        return estimate_impact(simple)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/time-saved")
async def time_saved(req: TimeSavedRequest):
    """
    Sums hours saved by tallying user interactions against the
    archetype's per-category time_saved_rate.
    """
    try:
        simple = build_simple_archetype(
            immigration_status=req.immigration_status,
            preferred_language=req.preferred_language,
            occupation=req.occupation,
        )
        return calculate_time_saved(simple, req.interactions_log)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/discovery/recommend")
async def discovery_recommend(req: DiscoveryRecommendRequest):
    """
    Returns the top N events for the user, scored by Eddie's discovery
    archetype (event tags + immigration status + language + age bucket).
    """
    try:
        simple = build_simple_archetype(
            immigration_status=req.immigration_status,
            preferred_language=req.preferred_language,
            occupation=req.occupation,
        )
        discovery_arch = build_discovery_archetype(
            simple_archetype=simple,
            event_interactions=req.event_interactions,
            age=req.age,
        )
        all_events = get_events()
        top = get_top_events(discovery_arch, all_events, n=req.n)
        return {
            "discovery_archetype": discovery_arch,
            "events": top,
            "count": len(top),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/discovery/isolation")
async def discovery_isolation(req: IsolationRequest):
    """
    Estimates how many hours/yr the user loses to social isolation,
    based on immigration status, language, and occupation. Driven by
    Eddie's discovery_algorithms.calculate_isolation_impact.
    """
    try:
        simple = build_simple_archetype(
            immigration_status=req.immigration_status,
            preferred_language=req.preferred_language,
            occupation=req.occupation,
        )
        return calculate_isolation_impact(simple)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Default voice = the Corazón brand voice (Spanish-native, multilingual).
# She speaks Spanish natively and English with a Latina accent — that's
# the brand. "De latinos para latinos" means the assistant should sound
# like the community it serves, not like a generic English AI voice.
# Override per-request via TtsRequest.voice_id if needed.
_DEFAULT_VOICE_ID = "cAvMBIZ0VNTU8XdsUpEq"


@router.post("/tts")
async def tts(req: TtsRequest):
    """
    Secure ElevenLabs proxy. The API key is read from the server-side
    ELEVENLABS_API_KEY env var (NOT VITE_*) so it never reaches the
    browser bundle. Frontend posts {text}, backend forwards to
    ElevenLabs with the secret key, returns the MP3 bytes.

    Returns 503 if the key isn't configured — frontend treats that as
    a graceful "TTS off" signal and silently no-ops.
    """
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="ElevenLabs not configured")

    voice_id = req.voice_id or _DEFAULT_VOICE_ID

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                headers={
                    "xi-api-key": api_key,
                    "Content-Type": "application/json",
                    "Accept": "audio/mpeg",
                },
                json={
                    "text": text,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                    },
                },
            )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"TTS upstream error: {e}")

    if res.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"ElevenLabs returned {res.status_code}",
        )

    return Response(content=res.content, media_type="audio/mpeg")


@router.get("/health")
async def health():
    return {"status": "ok", "service": "ai", "model": "llama-3.3-70b-versatile"}
