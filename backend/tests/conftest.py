import os
import pytest


@pytest.fixture(autouse=True)
def fake_env(monkeypatch):
    """Stub the env vars so module-level imports don't crash."""
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_KEY", "fake-service-key")
    monkeypatch.setenv("GROQ_API_KEY", "fake-groq-key")
    monkeypatch.setenv("ELEVENLABS_API_KEY", "fake-eleven-key")
