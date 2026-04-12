"""P0 tests for backend/ai/algorithms.py — pure functions, no mocks needed."""

import sys
from pathlib import Path

# Ensure the backend root is on sys.path so `from ai.algorithms import ...` works
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ai import algorithms as alg


# ── build_simple_archetype ──────────────────────────────────────────────────────

def test_build_simple_archetype_undocumented_es_unemployed():
    """
    nav_hours_yr = base(60) * status_mult(2.4) + lang_penalty(8) = 152.0
    """
    result = alg.build_simple_archetype("undocumented", "es", "unemployed")
    assert result["nav_hours_yr"] == 152.0
    assert result["immigration_status"] == "undocumented"
    assert result["preferred_language"] == "es"
    assert result["occupation"] == "unemployed"


def test_build_simple_archetype_citizen_en_employed():
    """
    nav_hours_yr = base(32) * status_mult(1.0) + lang_penalty(0) = 32.0
    """
    result = alg.build_simple_archetype("citizen", "en", "employed")
    assert result["nav_hours_yr"] == 32.0


def test_build_simple_archetype_daca_es_student():
    """
    nav_hours_yr = base(45) * status_mult(1.8) + lang_penalty(8) = 89.0
    """
    result = alg.build_simple_archetype("DACA", "es", "student")
    assert result["nav_hours_yr"] == 89.0


def test_build_simple_archetype_time_saved_rate_keys():
    """time_saved_rate should have all 9 categories."""
    result = alg.build_simple_archetype("citizen", "en", "student")
    assert isinstance(result["time_saved_rate"], dict)
    for cat in alg.CATEGORIES:
        assert cat in result["time_saved_rate"]


def test_build_simple_archetype_unknown_defaults():
    """Unknown values should fallback gracefully."""
    result = alg.build_simple_archetype("unknown_status", "fr", "freelancer")
    # Defaults: base=45, mult=1.0, penalty=0.0
    assert result["nav_hours_yr"] == 45.0


# ── calculate_time_saved ────────────────────────────────────────────────────────

def test_calculate_time_saved_with_interactions():
    """interactions_log is a list of category strings, not dicts."""
    archetype = alg.build_simple_archetype("undocumented", "es", "unemployed")
    interactions = ["legal", "food_bank"]
    result = alg.calculate_time_saved(archetype, interactions)
    assert result["interactions_count"] == 2
    assert result["total_saved_hrs"] > 0
    assert "breakdown" in result
    assert result["breakdown"]["legal"] > 0
    assert result["breakdown"]["food_bank"] > 0


def test_calculate_time_saved_empty_interactions():
    archetype = alg.build_simple_archetype("citizen", "en", "student")
    result = alg.calculate_time_saved(archetype, [])
    assert result["interactions_count"] == 0
    assert result["total_saved_hrs"] == 0


# ── build_complex_archetype ─────────────────────────────────────────────────────

def test_build_complex_archetype_has_dominant_categories():
    simple = alg.build_simple_archetype("DACA", "es", "student")
    interactions = ["legal", "legal", "health"]
    result = alg.build_complex_archetype(simple, interactions)
    assert "dominant_categories" in result
    assert isinstance(result["dominant_categories"], list)
    assert len(result["dominant_categories"]) <= 3


def test_build_complex_archetype_inherits_simple():
    simple = alg.build_simple_archetype("citizen", "en", "employed")
    result = alg.build_complex_archetype(simple, [])
    assert result["immigration_status"] == "citizen"
    assert result["nav_hours_yr"] == simple["nav_hours_yr"]


# ── get_top_resources ───────────────────────────────────────────────────────────

def test_get_top_resources_returns_list():
    simple = alg.build_simple_archetype("undocumented", "es", "unemployed")
    complex_arch = alg.build_complex_archetype(simple, [])
    orgs = [
        {
            "name": "Test Org",
            "categories": ["legal"],
            "languages": ["es"],
            "eligibility": ["undocumented"],
        },
        {
            "name": "Another Org",
            "categories": ["health"],
            "languages": ["en"],
            "eligibility": [],
        },
    ]
    result = alg.get_top_resources(complex_arch, orgs, n=2)
    assert isinstance(result, list)
    assert len(result) <= 2


def test_get_top_resources_scores_language_bonus():
    """Spanish-speaking orgs should score higher for es-speaking users."""
    simple = alg.build_simple_archetype("undocumented", "es", "unemployed")
    complex_arch = alg.build_complex_archetype(simple, [])
    orgs = [
        {"name": "ES Org", "categories": ["legal"], "languages": ["es"], "eligibility": []},
        {"name": "EN Org", "categories": ["legal"], "languages": ["en"], "eligibility": []},
    ]
    result = alg.get_top_resources(complex_arch, orgs, n=2)
    # ES org should rank first due to language bonus
    if len(result) >= 2:
        assert result[0]["name"] == "ES Org"


# ── estimate_impact ─────────────────────────────────────────────────────────────

def test_estimate_impact_fallback_when_no_model(monkeypatch):
    """When ML model is None, estimate_impact returns fallback dict."""
    monkeypatch.setattr(alg, "_nav_model", None)
    monkeypatch.setattr(alg, "_poverty_model", None)
    monkeypatch.setattr(alg, "_total_model", None)
    monkeypatch.setattr(alg, "_lifetime_model", None)

    simple = alg.build_simple_archetype("undocumented", "es", "unemployed")
    result = alg.estimate_impact(simple)
    assert "nav_hours" in result
    assert "total_hours_yr" in result
    # Fallback uses hardcoded defaults, not the archetype's nav_hours_yr
    assert isinstance(result["nav_hours"], (int, float))
    assert result["nav_hours"] > 0


def test_estimate_impact_returns_all_fields():
    simple = alg.build_simple_archetype("citizen", "en", "student")
    result = alg.estimate_impact(simple)
    for key in ["nav_hours", "poverty_hours", "total_hours_yr", "lifetime_days"]:
        assert key in result
        assert isinstance(result[key], (int, float))
