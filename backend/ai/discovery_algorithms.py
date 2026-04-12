# discovery_algorithms.py
#
# PURPOSE: Personalize the discovery/events page for each user.
# Events are scored by tags (not categories) so a single event can
# match multiple user interests simultaneously.
#
# DESIGN NOTES:
#   - Tags are free-form strings attached to events (e.g. "job_fair",
#     "mental_health", "spanish_spoken", "youth", "senior").
#   - The discovery archetype is separate from the complex archetype so
#     it can evolve at a different cadence (events are time-sensitive;
#     resource preferences are stable for weeks).
#   - Isolation impact is computed here because it is fundamentally a
#     discovery problem: isolated users need community events, not more
#     resource referrals.
#
# PUBLIC API:
#   get_age_bucket(age) → str
#   build_discovery_archetype(simple_archetype, event_interactions) → dict
#   update_discovery_archetype(discovery_archetype, new_event_interactions) → dict
#   should_update_discovery(discovery_archetype) → bool
#   score_event(event, discovery_archetype) → float
#   get_top_events(discovery_archetype, all_events, n=5) → list
#   calculate_isolation_impact(simple_archetype) → dict

from datetime import datetime, timezone, timedelta

# ── CONSTANTS ────────────────────────────────────────────────────────────────

# Age ranges → tag bucket used internally for scoring boosts
# Kept broad so minor age differences don't create hard cliffs.
AGE_BUCKET_TAGS = {
    "youth":   (13, 24),   # high school → early career
    "adult":   (25, 54),   # peak workforce + family years
    "senior":  (55, 99),   # retirement-adjacent and older
}

# How many more community events an undocumented person needs vs a citizen.
# Undocumented: excluded from most online civic infrastructure, more
# dependent on in-person networks for information and support.
# Source: framing from Urban Institute (2023) social isolation research.
STATUS_EVENT_MULTIPLIER = {
    "undocumented":       2.2,
    "DACA":               1.7,
    "permanent_resident": 1.2,
    "citizen":            1.0,
}

# Language isolation multiplier — Spanish-primary speakers have fewer
# informal networks within English-dominant institutions.
LANGUAGE_EVENT_MULTIPLIER = {
    "es": 1.5,
    "en": 1.0,
}

# Occupation isolation multiplier — unemployed people lose the social
# infrastructure of the workplace and are most at risk of chronic isolation.
OCCUPATION_ISOLATION = {
    "unemployed":       52.0,   # hours/yr — roughly 1 hr/wk lost to isolation
    "student":          28.0,
    "student_employed": 18.0,
    "employed":         12.0,
}

# Base isolation hours adjusted by status (structural exclusion compounds
# occupational isolation).
STATUS_ISOLATION_MULTIPLIER = {
    "undocumented":       2.0,
    "DACA":               1.6,
    "permanent_resident": 1.2,
    "citizen":            1.0,
}

# Minimum tag weight — all tags start here before interaction boosts.
_BASE_TAG_WEIGHT = 1.0
_INTERACTION_BOOST = 0.4
_MAX_TAG_WEIGHT = 4.0


# ── ALGORITHM 1: Age Bucket ──────────────────────────────────────────────────


def get_age_bucket(age: int) -> str:
    """
    Maps a numeric age to one of: "youth", "adult", "senior", or "unknown".

    Returns "unknown" if age is None, negative, or outside all buckets.
    """
    if age is None or not isinstance(age, (int, float)) or age < 0:
        return "unknown"
    for bucket, (low, high) in AGE_BUCKET_TAGS.items():
        if low <= int(age) <= high:
            return bucket
    return "unknown"


# ── ALGORITHM 2: Discovery Archetype Builder ─────────────────────────────────


def build_discovery_archetype(
    simple_archetype: dict,
    event_interactions: list,
    age: int | None = None,
) -> dict:
    """
    Builds a discovery archetype from a simple_archetype + event interaction
    history.

    event_interactions: list of tag strings that the user clicked on or
        attended (e.g. ["job_fair", "spanish_spoken", "youth"]).

    The archetype stores:
        tag_weights:         dict — normalized tag weights (sum = total tags × 1.0)
        age_bucket:          str  — "youth" | "adult" | "senior" | "unknown"
        last_updated:        ISO timestamp (UTC)
        event_count:         int  — total events interacted with
        top_tags:            list — top 3 tags by weight
        immigration_status:  str  — copied from simple_archetype
        preferred_language:  str  — copied from simple_archetype
        occupation:          str  — copied from simple_archetype
    """
    tag_weights = _compute_tag_weights(event_interactions)
    top_tags = sorted(tag_weights, key=lambda t: tag_weights[t], reverse=True)[:3]

    return {
        "immigration_status": simple_archetype.get("immigration_status"),
        "preferred_language": simple_archetype.get("preferred_language"),
        "occupation": simple_archetype.get("occupation"),
        "age_bucket": get_age_bucket(age),
        "tag_weights": tag_weights,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "event_count": len(event_interactions),
        "top_tags": top_tags,
    }


def _compute_tag_weights(event_interactions: list) -> dict:
    """
    Internal helper: builds tag_weights from a flat list of tag strings.

    Steps:
      1. Start each seen tag at _BASE_TAG_WEIGHT (1.0).
      2. Add _INTERACTION_BOOST (0.4) per occurrence, capped at _MAX_TAG_WEIGHT (4.0).
      3. Normalize so weights sum to len(unique_tags) × 1.0 — preserves
         the intuition that a tag with no interactions stays at 1.0 relative
         weight while heavily interacted tags rise above 1.0.
    """
    if not event_interactions:
        return {}

    weights: dict[str, float] = {}
    for tag in event_interactions:
        if tag not in weights:
            weights[tag] = _BASE_TAG_WEIGHT
        weights[tag] = min(weights[tag] + _INTERACTION_BOOST, _MAX_TAG_WEIGHT)

    n = len(weights)
    total = sum(weights.values())
    normalized = {tag: round(w / total * n, 4) for tag, w in weights.items()}
    return normalized


# ── ALGORITHM 3: Discovery Archetype Updater ─────────────────────────────────


def update_discovery_archetype(
    discovery_archetype: dict,
    new_event_interactions: list,
) -> dict:
    """
    Merges new event interactions into an existing discovery archetype.

    Applies _INTERACTION_BOOST on top of current normalized weights, then
    re-normalizes. This preserves the relative proportions built up over
    the user's full history without needing to replay all past interactions.
    """
    existing_weights = discovery_archetype.get("tag_weights", {})
    existing_count = discovery_archetype.get("event_count", 0)

    updated_weights = dict(existing_weights)

    for tag in new_event_interactions:
        if tag not in updated_weights:
            updated_weights[tag] = _BASE_TAG_WEIGHT
        updated_weights[tag] = min(
            updated_weights[tag] + _INTERACTION_BOOST, _MAX_TAG_WEIGHT
        )

    n = len(updated_weights)
    total = sum(updated_weights.values())
    if total > 0 and n > 0:
        updated_weights = {
            tag: round(w / total * n, 4) for tag, w in updated_weights.items()
        }

    top_tags = sorted(updated_weights, key=lambda t: updated_weights[t], reverse=True)[
        :3
    ]

    updated = dict(discovery_archetype)
    updated.update(
        {
            "tag_weights": updated_weights,
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "event_count": existing_count + len(new_event_interactions),
            "top_tags": top_tags,
        }
    )
    return updated


# ── ALGORITHM 4: Should Update ───────────────────────────────────────────────


def should_update_discovery(discovery_archetype: dict) -> bool:
    """
    Returns True if 2 or more days have passed since last_updated.

    Events change faster than resource preferences, so the update cadence
    is 2 days (vs 4 days for the complex archetype).
    """
    last_updated_str = discovery_archetype.get("last_updated")
    if not last_updated_str:
        return True
    last_updated = datetime.fromisoformat(last_updated_str)
    if last_updated.tzinfo is None:
        last_updated = last_updated.replace(tzinfo=timezone.utc)
    return (datetime.now(timezone.utc) - last_updated) >= timedelta(days=2)


# ── ALGORITHM 5: Event Scorer ────────────────────────────────────────────────


def score_event(event: dict, discovery_archetype: dict) -> float:
    """
    Scores a single event against a discovery archetype.

    Scoring components:
      tag_score:       sum of tag_weights for each tag present on the event
      language_bonus:  +2.0 if event language matches preferred_language
      age_bonus:       +1.5 if event age_bucket tag matches user's age_bucket
      status_bonus:    +1.5 if event eligibility includes immigration_status or "all"

    Returns the total score as a float. Higher = more relevant.
    """
    tag_weights = discovery_archetype.get("tag_weights", {})
    preferred_language = discovery_archetype.get("preferred_language")
    immigration_status = discovery_archetype.get("immigration_status")
    age_bucket = discovery_archetype.get("age_bucket", "unknown")

    event_tags = event.get("tags", [])
    tag_score = sum(tag_weights.get(tag, 0.0) for tag in event_tags)

    language_bonus = 0.0
    event_languages = event.get("languages", [])
    if preferred_language and preferred_language in event_languages:
        language_bonus = 2.0

    age_bonus = 0.0
    if age_bucket != "unknown" and age_bucket in event_tags:
        age_bonus = 1.5

    status_bonus = 0.0
    event_eligibility = event.get("eligibility", [])
    if "all" in event_eligibility or (
        immigration_status and immigration_status in event_eligibility
    ):
        status_bonus = 1.5

    return round(tag_score + language_bonus + age_bonus + status_bonus, 4)


# ── ALGORITHM 6: Top Events ───────────────────────────────────────────────────


def get_top_events(
    discovery_archetype: dict,
    all_events: list,
    n: int = 5,
) -> list:
    """
    Scores all events and returns the top n sorted by score descending.

    Args:
        discovery_archetype: built or updated discovery archetype dict.
        all_events:          list of event dicts from the database.
        n:                   number of top events to return (default 5).

    Returns:
        list of event dicts, highest-scoring first.
    """
    scored = [(event, score_event(event, discovery_archetype)) for event in all_events]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [event for event, _ in scored[:n]]


# ── ALGORITHM 7: Isolation Impact ────────────────────────────────────────────


def calculate_isolation_impact(simple_archetype: dict) -> dict:
    """
    Estimates annual hours of social isolation caused by structural barriers.

    Isolation hours here represent time spent without meaningful social
    support networks — not physically alone time, but functionally isolated
    from civic, professional, and community life due to immigration status,
    language, and employment barriers.

    Returns:
        isolation_hours_yr:  float — estimated hours/yr of structural isolation
        status_multiplier:   float — the immigration status multiplier applied
        language_multiplier: float — the language multiplier applied
        base_hours:          float — occupation baseline before multipliers
        occupation:          str
        breakdown_note:      str   — brief explanation of what drives the number
    """
    occupation = simple_archetype.get("occupation", "employed")
    immigration_status = simple_archetype.get("immigration_status", "citizen")
    preferred_language = simple_archetype.get("preferred_language", "en")

    base = OCCUPATION_ISOLATION.get(occupation, 20.0)
    status_mult = STATUS_ISOLATION_MULTIPLIER.get(immigration_status, 1.0)
    lang_mult = LANGUAGE_EVENT_MULTIPLIER.get(preferred_language, 1.0)

    isolation_hours_yr = round(base * status_mult * lang_mult, 1)

    if immigration_status == "undocumented":
        note = (
            "Exclusion from civic infrastructure and fear of visibility "
            "compound occupational isolation."
        )
    elif immigration_status == "DACA":
        note = (
            "Policy uncertainty limits long-term community investment "
            "and institutional belonging."
        )
    elif preferred_language == "es":
        note = (
            "Language barriers reduce participation in English-dominant "
            "civic and professional networks."
        )
    else:
        note = "Occupational baseline with minimal structural multipliers."

    return {
        "isolation_hours_yr": isolation_hours_yr,
        "base_hours": base,
        "status_multiplier": status_mult,
        "language_multiplier": lang_mult,
        "occupation": occupation,
        "breakdown_note": note,
    }


# ── STANDALONE TEST ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json

    simple = {
        "immigration_status": "undocumented",
        "preferred_language": "es",
        "occupation": "unemployed",
        "nav_hours_yr": 152.0,
    }

    # 1. Age bucket
    print("=== get_age_bucket ===")
    for age in [17, 22, 35, 60, None, -1]:
        print(f"  age {age!r:>4} → {get_age_bucket(age)}")

    # 2. Build discovery archetype (no prior interactions)
    print("\n=== build_discovery_archetype (no interactions) ===")
    disc = build_discovery_archetype(simple, [], age=28)
    for k, v in disc.items():
        print(f"  {k}: {v}")

    # 3. Build with interactions
    print("\n=== build_discovery_archetype (with interactions) ===")
    interactions = [
        "job_fair", "spanish_spoken", "job_fair",
        "legal_clinic", "community", "job_fair", "youth",
    ]
    disc2 = build_discovery_archetype(simple, interactions, age=22)
    for k, v in disc2.items():
        print(f"  {k}: {v}")

    # 4. should_update_discovery — just built, should be False
    print("\n=== should_update_discovery ===")
    print(f"  just built: {should_update_discovery(disc2)}")

    # 5. Update discovery archetype
    print("\n=== update_discovery_archetype ===")
    disc3 = update_discovery_archetype(disc2, ["health_fair", "job_fair", "spanish_spoken"])
    for k, v in disc3.items():
        print(f"  {k}: {v}")

    # 6. score_event
    print("\n=== score_event ===")
    mock_events = [
        {
            "id": 1,
            "name": "Community Job Fair",
            "tags": ["job_fair", "spanish_spoken", "adult"],
            "languages": ["es", "en"],
            "eligibility": ["all"],
        },
        {
            "id": 2,
            "name": "Free Legal Clinic",
            "tags": ["legal_clinic", "undocumented", "adult"],
            "languages": ["es"],
            "eligibility": ["undocumented", "DACA"],
        },
        {
            "id": 3,
            "name": "Senior Social Hour",
            "tags": ["senior", "community"],
            "languages": ["en"],
            "eligibility": ["all"],
        },
    ]
    for event in mock_events:
        s = score_event(event, disc3)
        print(f"  {event['name']:30s} score: {s}")

    # 7. get_top_events
    print("\n=== get_top_events (top 2) ===")
    top = get_top_events(disc3, mock_events, n=2)
    for e in top:
        print(f"  {e['name']}")

    # 8. calculate_isolation_impact
    print("\n=== calculate_isolation_impact ===")
    profiles = [
        {"immigration_status": "undocumented", "preferred_language": "es", "occupation": "unemployed"},
        {"immigration_status": "DACA",          "preferred_language": "es", "occupation": "student"},
        {"immigration_status": "citizen",       "preferred_language": "en", "occupation": "employed"},
    ]
    for p in profiles:
        impact = calculate_isolation_impact(p)
        print(
            f"  {p['immigration_status']:20s} | {p['preferred_language']} | "
            f"{p['occupation']:17s} → {impact['isolation_hours_yr']} hrs/yr"
        )
