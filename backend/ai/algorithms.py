# algorithms.py
#
# PURPOSE: Define archetypes and expose clean functions for impact
# estimation, time tracking, and resource personalization.
# No training happens here — the time model is loaded once at import.
#
# ONBOARDING FIELDS:
#   immigration_status: "undocumented"|"DACA"|"permanent_resident"|"citizen"
#   preferred_language: "es"|"en"
#   occupation:         "student"|"employed"|"unemployed"|"student_employed"
#
# RESOURCE CATEGORIES (9 total, mirrors scraper):
#   job, internship, scholarship, food_bank, health,
#   mental_health, legal, housing, language
#
# PUBLIC API:
#
#   build_simple_archetype(immigration_status, preferred_language, occupation)
#     → simple_archetype dict with nav_hours_yr and time_saved_rate
#
#   calculate_time_saved(simple_archetype, interactions_log) → dict
#     → total_saved_hrs, breakdown, interactions_count
#
#   build_complex_archetype(simple_archetype, interactions_log) → dict
#     → inherits simple_archetype + category_weights, dominant_categories, etc.
#
#   should_update(complex_archetype) → bool
#     → True if ≥4 days since last_updated
#
#   update_complex_archetype(complex_archetype, new_interactions) → dict
#     → re-weights and updates timestamps
#
#   get_top_resources(complex_archetype, all_orgs, n=5) → list
#     → top N orgs scored by category_weights + bonuses
#
#   estimate_impact(simple_archetype) → dict
#     → nav_hours, poverty_hours, total_hours_yr, lifetime_days, etc.

from pathlib import Path

import joblib
import pandas as pd
from datetime import datetime, timezone, timedelta

# ── LOAD TIME MODEL ONCE AT IMPORT (gracefully) ──────────────────────────────
# time_model.pkl is ~21MB so it's intentionally NOT committed to the
# repo. If it's present alongside this file (e.g. after running
# train_models.py or fetching it from blob storage), we use it. If not,
# the model handles are set to None and estimate_impact() falls back to
# the hardcoded archetype defaults defined inside that function.

_MODEL_DIR = Path(__file__).parent / "models"
_TIME_MODEL_PATH = _MODEL_DIR / "time_model.pkl"

_nav_model = None
_poverty_model = None
_total_model = None
_lifetime_model = None
_status_encoder = None
_lang_encoder = None

if _TIME_MODEL_PATH.exists():
    try:
        _time_bundle = joblib.load(_TIME_MODEL_PATH)
        _nav_model = _time_bundle["nav_model"]
        _poverty_model = _time_bundle["poverty_model"]
        _total_model = _time_bundle["total_model"]
        _lifetime_model = _time_bundle["lifetime_model"]
        _status_encoder = _time_bundle["status_encoder"]
        _lang_encoder = _time_bundle["language_encoder"]
    except Exception as _e:
        print(f"[algorithms] could not load time_model.pkl: {_e}")

# BLS Q2 2024: Hispanic median weekly earnings $903 ÷ 40hrs = $22.58/hr
# Used to convert dollar-denominated poverty premium back into hours.
# Source: BLS Usual Weekly Earnings of Wage and Salary Workers, July 2024
HISPANIC_MEDIAN_HOURLY = 22.58

# All 9 resource categories — mirrors the scraper taxonomy
CATEGORIES = [
    "job",
    "internship",
    "scholarship",
    "food_bank",
    "health",
    "mental_health",
    "legal",
    "housing",
    "language",
]

# Base nav hours by occupation
# unemployed: most time available but most barriers navigating systems
# without employer support or student resources
_OCCUPATION_BASE_HOURS = {
    "unemployed": 60.0,
    "student": 45.0,
    "student_employed": 38.0,
    "employed": 32.0,
}

# Immigration status multiplier applied to nav_hours_yr
# Source: CAP (2022) bureaucratic burden scaling by status
_STATUS_NAV_MULTIPLIER = {
    "undocumented": 2.4,
    "DACA": 1.8,
    "permanent_resident": 1.3,
    "citizen": 1.0,
}

# Language penalty added after multiplier (absolute hours)
_LANGUAGE_NAV_PENALTY = {
    "es": 8.0,
    "en": 0.0,
}

# Hours saved per interaction type — includes community events.
# "community_event" is used by discovery_algorithms.py isolation impact
# calculations to credit event attendance against isolation_hours_yr.
SAVINGS_MAP = {
    "job": 3.0,
    "internship": 2.5,
    "scholarship": 3.5,
    "food_bank": 2.0,
    "health": 4.0,
    "mental_health": 3.0,
    "legal": 6.0,
    "housing": 5.0,
    "language": 2.5,
    "community_event": 2.0,
}

# Base hours saved per interaction by category (before multipliers)
_BASE_TIME_SAVED = {
    "job": 3.0,
    "internship": 2.5,
    "scholarship": 3.5,
    "food_bank": 2.0,
    "health": 4.0,
    "mental_health": 3.0,
    "legal": 6.0,
    "housing": 5.0,
    "language": 2.5,
}

# Immigration multiplier for time_saved_rate:
# harder-to-navigate populations save more time per interaction
_STATUS_SAVED_MULTIPLIER = {
    "undocumented": 1.8,
    "DACA": 1.5,
    "permanent_resident": 1.2,
    "citizen": 1.0,
}

# Language multiplier for time_saved_rate
_LANGUAGE_SAVED_MULTIPLIER = {
    "es": 1.4,
    "en": 1.0,
}

# Occupation → num_goals proxy for the ML time model
_OCCUPATION_NUM_GOALS = {
    "unemployed": 5,
    "student": 3,
    "student_employed": 4,
    "employed": 2,
}

# Fixed average goal difficulty — no longer collected during onboarding
_AVG_GOAL_DIFFICULTY = 11.0


# ── ALGORITHM 1: Simple Archetype Builder ────────────────────────────────────


def build_simple_archetype(
    immigration_status: str,
    preferred_language: str,
    occupation: str,
) -> dict:
    """
    Builds the simple archetype from the three onboarding fields.

    nav_hours_yr:
        Estimated hours lost per year navigating bureaucratic systems.
        Base set by occupation, scaled by immigration status multiplier,
        then language penalty added.

    time_saved_rate:
        Hours saved per interaction for each of the 9 resource categories.
        Base rates scaled by immigration status and language multipliers so
        harder-to-navigate populations save more time per interaction.
    """
    base = _OCCUPATION_BASE_HOURS.get(occupation, 45.0)
    status_mult = _STATUS_NAV_MULTIPLIER.get(immigration_status, 1.0)
    lang_penalty = _LANGUAGE_NAV_PENALTY.get(preferred_language, 0.0)
    nav_hours_yr = round(base * status_mult + lang_penalty, 1)

    saved_status_mult = _STATUS_SAVED_MULTIPLIER.get(immigration_status, 1.0)
    saved_lang_mult = _LANGUAGE_SAVED_MULTIPLIER.get(preferred_language, 1.0)
    time_saved_rate = {
        cat: round(_BASE_TIME_SAVED[cat] * saved_status_mult * saved_lang_mult, 2)
        for cat in CATEGORIES
    }

    return {
        "immigration_status": immigration_status,
        "preferred_language": preferred_language,
        "occupation": occupation,
        "nav_hours_yr": nav_hours_yr,
        # isolation_hours_yr is computed separately by
        # discovery_algorithms.calculate_isolation_impact()
        "time_saved_rate": time_saved_rate,
    }


# ── ALGORITHM 2: Time Saved Calculator ───────────────────────────────────────


def calculate_time_saved(simple_archetype: dict, interactions_log: list) -> dict:
    """
    Sums hours saved across all interactions using the archetype's
    time_saved_rate lookup.

    interactions_log: list of category strings e.g.
        ["food_bank", "legal", "job"]

    Returns:
        total_saved_hrs:    float — total hours recovered
        breakdown:          dict  — hours saved per category
        interactions_count: int   — number of interactions processed
    """
    rates = simple_archetype.get("time_saved_rate", {})
    breakdown = {cat: 0.0 for cat in CATEGORIES}

    for interaction in interactions_log:
        if interaction in rates:
            breakdown[interaction] += rates[interaction]

    breakdown = {cat: round(v, 2) for cat, v in breakdown.items()}
    total = round(sum(breakdown.values()), 2)

    return {
        "total_saved_hrs": total,
        "breakdown": breakdown,
        "interactions_count": len(interactions_log),
    }


# ── ALGORITHM 3: Complex Archetype Builder and Updater ───────────────────────


def _compute_weights(interactions_log: list) -> dict:
    """
    Internal helper: computes normalized category_weights from interactions.

    Steps:
      1. Start all 9 categories at base weight 1.0
      2. Add 0.3 per interaction to that category's weight
      3. Cap any single category at 3.0
      4. Normalize so all weights sum to 9.0
    """
    weights = {cat: 1.0 for cat in CATEGORIES}

    for interaction in interactions_log:
        if interaction in weights:
            weights[interaction] = min(weights[interaction] + 0.3, 3.0)

    total = sum(weights.values())
    weights = {cat: round(w / total * 9.0, 4) for cat, w in weights.items()}

    return weights


def build_complex_archetype(simple_archetype: dict, interactions_log: list) -> dict:
    """
    Extends simple_archetype with interaction-driven category weights.

    Runs on first interaction and then every 4 days via should_update /
    update_complex_archetype.

    Returns all simple_archetype fields plus:
        category_weights:     dict of 9 categories, normalized to sum 9.0
        last_updated:         ISO timestamp string (UTC)
        interaction_count:    int
        dominant_categories:  list of top 3 categories by weight
    """
    weights = _compute_weights(interactions_log)
    dominant = sorted(weights, key=lambda c: weights[c], reverse=True)[:3]

    archetype = dict(simple_archetype)
    archetype.update(
        {
            "category_weights": weights,
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "interaction_count": len(interactions_log),
            "dominant_categories": dominant,
        }
    )
    return archetype


def should_update(complex_archetype: dict) -> bool:
    """
    Returns True if 4 or more days have passed since last_updated.
    """
    last_updated_str = complex_archetype.get("last_updated")
    if not last_updated_str:
        return True
    last_updated = datetime.fromisoformat(last_updated_str)
    if last_updated.tzinfo is None:
        last_updated = last_updated.replace(tzinfo=timezone.utc)
    return (datetime.now(timezone.utc) - last_updated) >= timedelta(days=4)


def update_complex_archetype(
    complex_archetype: dict,
    new_interactions: list,
) -> dict:
    """
    Merges new_interactions into the existing complex archetype.

    Re-runs weight calculation over the full accumulated interaction
    history, updates last_updated, dominant_categories, and
    interaction_count. Returns updated complex_archetype.
    """
    # Reconstruct full interaction history by reverse-engineering existing
    # weights back to a count isn't lossless, so we track cumulative count
    # and treat new_interactions as additive deltas on current weights.
    existing_weights = complex_archetype.get(
        "category_weights", {cat: 1.0 for cat in CATEGORIES}
    )
    existing_count = complex_archetype.get("interaction_count", 0)

    # Rebuild raw (un-normalized) weights from current normalized weights,
    # then apply new interactions on top.
    # Reverse normalization: raw_w = normalized_w / 9.0 * total_raw
    # Since we can't perfectly recover raw weights after capping, we use
    # new_interactions as additive increments on the current normalized weights
    # then re-normalize. This preserves relative proportions.
    updated_weights = {cat: existing_weights.get(cat, 1.0) for cat in CATEGORIES}
    for interaction in new_interactions:
        if interaction in updated_weights:
            updated_weights[interaction] = min(updated_weights[interaction] + 0.3, 3.0)

    total = sum(updated_weights.values())
    updated_weights = {
        cat: round(w / total * 9.0, 4) for cat, w in updated_weights.items()
    }

    dominant = sorted(updated_weights, key=lambda c: updated_weights[c], reverse=True)[
        :3
    ]

    updated = dict(complex_archetype)
    updated.update(
        {
            "category_weights": updated_weights,
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "interaction_count": existing_count + len(new_interactions),
            "dominant_categories": dominant,
        }
    )
    return updated


# ── PERSONALIZATION: Resource Scorer ─────────────────────────────────────────


def get_top_resources(
    complex_archetype: dict,
    all_orgs: list,
    n: int = 5,
) -> list:
    """
    Scores each org using complex_archetype category_weights.

    Scoring:
      base score = sum of category_weights for each org category present
      +1.5 bonus if org languages contains preferred_language
      +1.5 bonus if org eligibility contains immigration_status or "all"

    Returns top n orgs sorted by score descending.
    """
    weights = complex_archetype.get("category_weights", {})
    preferred_language = complex_archetype.get("preferred_language")
    immigration_status = complex_archetype.get("immigration_status")

    scored = []
    for org in all_orgs:
        score = sum(weights.get(cat, 0.0) for cat in org.get("categories", []))

        if preferred_language in org.get("languages", []):
            score += 1.5

        org_elig = org.get("eligibility", [])
        if "all" in org_elig or immigration_status in org_elig:
            score += 1.5

        scored.append((org, score))

    scored.sort(key=lambda x: x[1], reverse=True)
    return [org for org, _ in scored[:n]]


# ── IMPACT ESTIMATE (ML models) ───────────────────────────────────────────────


def estimate_impact(simple_archetype: dict) -> dict:
    """
    Runs the trained time model to estimate hours of life lost.

    Feature mapping from simple_archetype:
      status_encoded:      label-encoded immigration_status
      num_goals:           occupation → proxy count (unemployed=5,
                           student_employed=4, student=3, employed=2)
      language_encoded:    label-encoded preferred_language
      avg_goal_difficulty: fixed at 11.0 (no longer collected at onboarding)

    Returns:
      nav_hours:       hours/yr lost navigating bureaucratic systems
      poverty_hours:   hours worked just to cover the poverty premium
      total_hours_yr:  nav_hours + poverty_hours
      lifetime_days:   total_hours_yr × 20 yrs ÷ 8 hr workday
      conversion_rate: BLS wage used for dollar → hour conversion
      source:          citation string
    """
    immigration_status = simple_archetype.get("immigration_status", "citizen")

    # If the .pkl model wasn't loaded at import time (file missing), jump
    # straight to the hardcoded fallback. Avoids AttributeError on None.
    if _nav_model is None or _status_encoder is None:
        return _estimate_impact_fallback(immigration_status)

    try:
        preferred_language = simple_archetype["preferred_language"]
        occupation = simple_archetype["occupation"]

        s = _status_encoder.transform([immigration_status])[0]
        lang_enc = _lang_encoder.transform([preferred_language])[0]
        num_goals = _OCCUPATION_NUM_GOALS.get(occupation, 3)

        features = pd.DataFrame(
            [[s, num_goals, lang_enc, _AVG_GOAL_DIFFICULTY]],
            columns=[
                "status_encoded",
                "num_goals",
                "language_encoded",
                "avg_goal_difficulty",
            ],
        )

        nav = round(float(_nav_model.predict(features)[0]), 1)
        poverty = round(float(_poverty_model.predict(features)[0]), 1)
        total = round(float(_total_model.predict(features)[0]), 1)
        lifetime = round(float(_lifetime_model.predict(features)[0]), 1)

        return {
            "nav_hours": nav,
            "poverty_hours": poverty,
            "total_hours_yr": total,
            "lifetime_days": lifetime,
            "conversion_rate": HISPANIC_MEDIAN_HOURLY,
            "source": "BLS Usual Weekly Earnings Q2 2024",
        }

    except Exception as e:
        print(f"[estimate_impact fallback] {e}")
        return _estimate_impact_fallback(immigration_status)


def _estimate_impact_fallback(immigration_status: str) -> dict:
    """
    Hardcoded fallback used when the .pkl model is missing or fails.
    Returns sensible defaults so the endpoint never 500s.
    """
    nav = {
        "undocumented": 78,
        "DACA": 49,
        "permanent_resident": 28,
        "citizen": 12,
    }.get(immigration_status, 30)
    poverty = {
        "undocumented": 390,
        "DACA": 265,
        "permanent_resident": 181,
        "citizen": 129,
    }.get(immigration_status, 200)
    total = nav + poverty
    return {
        "nav_hours": nav,
        "poverty_hours": poverty,
        "total_hours_yr": total,
        "lifetime_days": round(total * 20 / 8, 1),
        "conversion_rate": HISPANIC_MEDIAN_HOURLY,
        "source": "BLS Usual Weekly Earnings Q2 2024",
    }


# ── STANDALONE TEST ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json

    # 1. Build simple archetype
    simple = build_simple_archetype(
        immigration_status="undocumented",
        preferred_language="es",
        occupation="unemployed",
    )

    # 2. Print simple archetype
    print("=== simple_archetype ===")
    for k, v in simple.items():
        print(f"  {k}: {v}")

    # 3. Simulate interactions
    interactions_log = ["legal", "legal", "food_bank", "scholarship", "health", "legal"]

    # 4. Build complex archetype
    complex_arch = build_complex_archetype(simple, interactions_log)

    # 5. Print complex archetype
    print("\n=== complex_archetype ===")
    for k, v in complex_arch.items():
        print(f"  {k}: {v}")

    # 6. should_update (should be False — just created)
    print("\n=== should_update ===")
    print(f"  {should_update(complex_arch)}")

    # 7. calculate_time_saved
    print("\n=== calculate_time_saved ===")
    saved = calculate_time_saved(simple, interactions_log)
    for k, v in saved.items():
        print(f"  {k}: {v}")

    # 8. get_top_resources
    with open("mock_orgs.json") as f:
        orgs = json.load(f)

    print("\n=== get_top_resources (top 3) ===")
    top = get_top_resources(complex_arch, orgs, n=3)
    for org in top:
        print(f"  {org['name']}")

    # 9. estimate_impact
    print("\n=== estimate_impact ===")
    impact = estimate_impact(simple)
    for k, v in impact.items():
        print(f"  {k}: {v}")
