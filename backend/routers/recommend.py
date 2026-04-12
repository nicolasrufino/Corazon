# recommend.py
#
# PURPOSE: Replace the Groq-based recommend endpoint with Eddie's
# algorithmic scoring from Corazon_AI/algorithms.py.
#
# APPROACH: Pure Python — no .pkl models needed here. The scoring
# logic ports the status/language/occupation multipliers from
# algorithms.py and applies them to the frontend's ResourceCategory
# taxonomy (legal, healthcare, immigration, education, community,
# social_life, financial_aid, language_learning, business).
#
# SOURCE: Ported from edug-0/ai-layer:Corazon_AI/algorithms.py
#   _STATUS_NAV_MULTIPLIER, _LANGUAGE_NAV_PENALTY, _STATUS_SAVED_MULTIPLIER,
#   _LANGUAGE_SAVED_MULTIPLIER, _OCCUPATION_BASE_HOURS

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# ── STATUS MULTIPLIERS ────────────────────────────────────────────────────────
# How urgently each category matters by immigration status.
# Adapted from algorithms.py STATUS_MULTIPLIERS (source: CAP 2022).

_STATUS_CATEGORY_BOOST: dict[str, dict[str, float]] = {
    "undocumented": {
        "legal": 2.4,
        "immigration": 2.4,
        "healthcare": 1.8,
        "financial_aid": 1.6,
        "community": 1.4,
        "language_learning": 1.3,
        "education": 1.2,
        "social_life": 1.1,
        "business": 1.0,
    },
    "daca": {
        "legal": 1.8,
        "immigration": 1.8,
        "healthcare": 1.5,
        "education": 1.5,
        "financial_aid": 1.4,
        "community": 1.3,
        "language_learning": 1.2,
        "social_life": 1.1,
        "business": 1.0,
    },
    "visa_holder": {
        "legal": 1.6,
        "immigration": 1.6,
        "healthcare": 1.4,
        "education": 1.3,
        "financial_aid": 1.2,
        "community": 1.2,
        "language_learning": 1.2,
        "social_life": 1.1,
        "business": 1.0,
    },
    "permanent_resident": {
        "legal": 1.3,
        "healthcare": 1.3,
        "immigration": 1.2,
        "financial_aid": 1.2,
        "education": 1.2,
        "community": 1.1,
        "language_learning": 1.1,
        "social_life": 1.0,
        "business": 1.0,
    },
    "citizen": {
        "legal": 1.0,
        "immigration": 1.0,
        "healthcare": 1.0,
        "financial_aid": 1.0,
        "education": 1.0,
        "community": 1.0,
        "language_learning": 1.0,
        "social_life": 1.0,
        "business": 1.0,
    },
}

# ── LANGUAGE BOOST ────────────────────────────────────────────────────────────
# Spanish-primary speakers have higher need for language support resources.
# Source: algorithms.py LANGUAGE_PENALTY (CAP 2022, LEP.gov).

_LANGUAGE_CATEGORY_BOOST: dict[str, dict[str, float]] = {
    "es": {"language_learning": 1.8, "community": 1.3},
    "en": {},
}

# ── OCCUPATION BOOST ──────────────────────────────────────────────────────────
# Maps occupation to categories where the person has highest need.
# Source: algorithms.py _OCCUPATION_BASE_HOURS + domain knowledge.

_OCCUPATION_CATEGORY_BOOST: dict[str, dict[str, float]] = {
    "job_seeker": {"financial_aid": 1.6, "education": 1.3, "community": 1.2},
    "student": {"education": 1.6, "financial_aid": 1.4, "community": 1.2},
    "student_worker": {"education": 1.4, "financial_aid": 1.3},
    "worker": {"legal": 1.2, "healthcare": 1.2, "financial_aid": 1.1},
    "two_jobs": {"healthcare": 1.3, "legal": 1.2, "financial_aid": 1.2},
    "caregiver": {"healthcare": 1.5, "community": 1.3, "financial_aid": 1.2},
    "retired": {"healthcare": 1.5, "social_life": 1.3, "community": 1.2},
    "other": {},
}

ALL_CATEGORIES = [
    "legal",
    "healthcare",
    "immigration",
    "education",
    "community",
    "social_life",
    "financial_aid",
    "language_learning",
    "business",
]


class RecommendRequest(BaseModel):
    language: str = "en"
    goals: list[str] = []
    immigration_status: Optional[str] = None
    occupation: Optional[str] = None


def score_categories(
    goals: list[str],
    immigration_status: Optional[str],
    occupation: Optional[str],
    language: str,
) -> list[tuple[str, float]]:
    """
    Scores every category using Eddie's multiplier approach.

    Base score: 1.0 for user's stated goals, 0.0 for all others.
    Then apply status × language × occupation boosts multiplicatively.

    Returns list of (category, score) sorted descending.
    """
    scores: dict[str, float] = {cat: 0.0 for cat in ALL_CATEGORIES}

    # Seed from user's stated goals
    for goal in goals:
        if goal in scores:
            scores[goal] = 1.0

    status_boosts = _STATUS_CATEGORY_BOOST.get(
        immigration_status or "citizen",
        _STATUS_CATEGORY_BOOST["citizen"],
    )
    lang_boosts = _LANGUAGE_CATEGORY_BOOST.get(language, {})
    occ_boosts = _OCCUPATION_CATEGORY_BOOST.get(occupation or "other", {})

    for cat in ALL_CATEGORIES:
        base = scores[cat]
        # Apply boosts on top of base; even zero-base categories can surface
        # if multiple multipliers push them up (e.g. undocumented + es +
        # job_seeker all boosting financial_aid)
        s_mult = status_boosts.get(cat, 1.0)
        l_mult = lang_boosts.get(cat, 1.0)
        o_mult = occ_boosts.get(cat, 1.0)

        if base > 0:
            # Stated goal: multiply all three
            scores[cat] = base * s_mult * l_mult * o_mult
        else:
            # Not a stated goal: only surface if combined boost > threshold
            combined = s_mult * l_mult * o_mult
            if combined >= 2.0:
                scores[cat] = combined * 0.4  # partial credit

    return sorted(scores.items(), key=lambda x: x[1], reverse=True)


@router.post("/recommend")
def recommend(req: RecommendRequest):
    ranked = score_categories(
        goals=req.goals,
        immigration_status=req.immigration_status,
        occupation=req.occupation,
        language=req.language,
    )

    top_categories = [cat for cat, score in ranked if score > 0][:3]

    if not top_categories:
        top_categories = req.goals[:3] if req.goals else ["legal", "healthcare", "community"]

    if req.language == "es":
        message = "Aquí están los recursos más importantes para tu situación."
    else:
        message = "Here are the most important resources for your situation."

    return {"categories": top_categories, "message": message}
