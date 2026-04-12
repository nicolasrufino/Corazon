"""P0 tests for backend/routers/ai.py — route registration + handler smoke tests.

Uses FastAPI TestClient with stubs for chatbot/groq/supabase so we never
hit external services.
"""

import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Stub database module before importing the router (it does module-level Supabase init)
sys.modules.setdefault("database", MagicMock())
database_mock = sys.modules["database"]
database_mock.get_all_resources = MagicMock(return_value=[])
database_mock.get_events = MagicMock(return_value=[])

from fastapi import FastAPI
from fastapi.testclient import TestClient

from routers.ai import router

app = FastAPI()
app.include_router(router, prefix="/api/ai")
client = TestClient(app)


# ── Route registration ──────────────────────────────────────────────────────────

def test_all_routes_registered():
    """All 8 expected routes must be registered."""
    routes = [r.path for r in app.routes if hasattr(r, "path")]
    expected = [
        "/api/ai/chat",
        "/api/ai/recommend",
        "/api/ai/impact",
        "/api/ai/time-saved",
        "/api/ai/discovery/recommend",
        "/api/ai/discovery/isolation",
        "/api/ai/tts",
        "/api/ai/health",
    ]
    for path in expected:
        assert path in routes, f"Route {path} not registered"


# ── /health ─────────────────────────────────────────────────────────────────────

def test_health_returns_ok():
    res = client.get("/api/ai/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "model" in data


# ── /tts ────────────────────────────────────────────────────────────────────────

def test_tts_rejects_empty_text():
    res = client.post("/api/ai/tts", json={"text": ""})
    assert res.status_code == 400
    assert "text is required" in res.json()["detail"]


def test_tts_rejects_whitespace_only_text():
    res = client.post("/api/ai/tts", json={"text": "   "})
    assert res.status_code == 400


def test_tts_rejects_invalid_voice_id():
    """Path traversal or weird characters in voice_id should be rejected."""
    res = client.post("/api/ai/tts", json={"text": "Hello", "voice_id": "../etc/passwd"})
    assert res.status_code == 400
    assert "invalid voice_id" in res.json()["detail"]


def test_tts_rejects_short_voice_id():
    res = client.post("/api/ai/tts", json={"text": "Hello", "voice_id": "abc"})
    assert res.status_code == 400


def test_tts_returns_503_when_key_unset(monkeypatch):
    """When ELEVENLABS_API_KEY is not set, /tts returns 503."""
    monkeypatch.delenv("ELEVENLABS_API_KEY", raising=False)
    res = client.post("/api/ai/tts", json={"text": "Hello"})
    assert res.status_code == 503
    assert "not configured" in res.json()["detail"]


# ── /impact ─────────────────────────────────────────────────────────────────────

def test_impact_returns_valid_shape():
    res = client.post("/api/ai/impact", json={
        "immigration_status": "undocumented",
        "preferred_language": "es",
        "occupation": "unemployed",
    })
    assert res.status_code == 200
    data = res.json()
    assert "nav_hours" in data
    assert "total_hours_yr" in data
    assert "lifetime_days" in data


def test_impact_with_defaults():
    """Should work with no body (all fields have defaults)."""
    res = client.post("/api/ai/impact", json={})
    assert res.status_code == 200


# ── /time-saved ─────────────────────────────────────────────────────────────────

def test_time_saved_empty_interactions():
    res = client.post("/api/ai/time-saved", json={
        "immigration_status": "citizen",
        "preferred_language": "en",
        "occupation": "student",
        "interactions_log": [],
    })
    assert res.status_code == 200
    data = res.json()
    assert data["interactions_count"] == 0
    assert data["total_saved_hrs"] == 0


def test_time_saved_with_interactions():
    res = client.post("/api/ai/time-saved", json={
        "immigration_status": "DACA",
        "preferred_language": "es",
        "occupation": "student",
        "interactions_log": ["legal", "health", "food_bank"],
    })
    assert res.status_code == 200
    data = res.json()
    assert data["interactions_count"] == 3
    assert data["total_saved_hrs"] > 0


# ── /chat ───────────────────────────────────────────────────────────────────────

def test_chat_calls_ai_chat():
    """Stub ai_chat and verify the route delegates correctly."""
    with patch("routers.ai.ai_chat", return_value="Mocked response") as mock:
        res = client.post("/api/ai/chat", json={
            "message": "Hello",
            "language": "en",
            "history": [],
        })
        assert res.status_code == 200
        assert res.text == "Mocked response"
        mock.assert_called_once()


def test_chat_passes_history():
    with patch("routers.ai.ai_chat", return_value="OK") as mock:
        client.post("/api/ai/chat", json={
            "message": "Hi",
            "language": "es",
            "history": [
                {"role": "user", "content": "Hola"},
                {"role": "assistant", "content": "Hola!"},
            ],
        })
        call_kwargs = mock.call_args
        # history should be passed as list of dicts
        history_arg = call_kwargs.kwargs.get("history") or call_kwargs[1].get("history", [])
        assert len(history_arg) == 2


# ── /recommend ──────────────────────────────────────────────────────────────────

def test_recommend_returns_resources():
    """With empty org list (mocked), should still return valid shape."""
    res = client.post("/api/ai/recommend", json={
        "immigration_status": "undocumented",
        "preferred_language": "es",
        "occupation": "unemployed",
        "interactions_log": [],
        "n": 3,
    })
    assert res.status_code == 200
    data = res.json()
    assert "archetype" in data
    assert "resources" in data
    assert "count" in data


# ── /discovery/isolation ────────────────────────────────────────────────────────

def test_discovery_isolation_returns_valid():
    res = client.post("/api/ai/discovery/isolation", json={
        "immigration_status": "undocumented",
        "preferred_language": "es",
        "occupation": "unemployed",
    })
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
