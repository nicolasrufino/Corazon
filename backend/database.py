import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

# Supabase
SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY: str = os.environ["SUPABASE_SERVICE_KEY"]
RESOURCES_TABLE: str = os.getenv("SUPABASE_RESOURCES_TABLE", "opportunities")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ── Resource fetchers (used by ai/chatbot.py) ────────────────────────────────


def get_all_resources() -> list:
    try:
        response = supabase.table(RESOURCES_TABLE).select("*").execute()
        return response.data
    except Exception as e:
        print(f"[get_all_resources] error: {e}")
        return []


def get_resources_by_category(category: str) -> list:
    try:
        response = (
            supabase.table(RESOURCES_TABLE)
            .select("*")
            .eq("category", category)
            .execute()
        )
        return response.data
    except Exception as e:
        print(f"[get_resources_by_category] error: {e}")
        return []


def search_resources(query: str) -> list:
    try:
        response = (
            supabase.table(RESOURCES_TABLE)
            .select("*")
            .ilike("title", f"%{query}%")
            .execute()
        )
        return response.data
    except Exception as e:
        print(f"[search_resources] error: {e}")
        return []


def get_resources_by_neighborhood(neighborhood: str) -> list:
    try:
        response = (
            supabase.table(RESOURCES_TABLE)
            .select("*")
            .ilike("neighborhood", f"%{neighborhood}%")
            .execute()
        )
        return response.data
    except Exception as e:
        print(f"[get_resources_by_neighborhood] error: {e}")
        return []


def get_events() -> list:
    try:
        response = (
            supabase.table(RESOURCES_TABLE)
            .select("*")
            .eq("category", "events")
            .execute()
        )
        return response.data
    except Exception as e:
        print(f"[get_events] error: {e}")
        return []


# Spanish keyword → English keyword expansion for the bilingual chatbot
_TRANSLATION_MAP = {
    "comida": ["food", "grocery", "nutrition", "meal", "snap"],
    "alimentos": ["food", "grocery", "nutrition", "meal"],
    "legal": ["legal", "immigration", "lawyer", "attorney"],
    "salud": ["health", "medical", "clinic", "healthcare"],
    "trabajo": ["job", "employment", "career", "work"],
    "vivienda": ["housing", "shelter", "rent", "homeless"],
    "educacion": ["education", "school", "scholarship", "college"],
    "mental": ["mental", "counseling", "therapy", "behavioral"],
    "idioma": ["language", "english", "esl", "literacy"],
}


def search_resources_multilingual(query: str) -> list:
    """
    Search resources by Spanish OR English keywords. Used by ai/chatbot.py
    so a user typing "¿dónde puedo encontrar comida?" still finds food
    bank rows in the English-keyed scraper data.
    """
    normalized = query.lower()

    english_keywords = []
    for spanish_key, translations in _TRANSLATION_MAP.items():
        if spanish_key in normalized:
            english_keywords.extend(translations)

    seen_ids = set()
    results = []

    for keyword in english_keywords:
        for resource in search_resources(keyword):
            rid = resource.get("id")
            if rid not in seen_ids:
                seen_ids.add(rid)
                results.append(resource)

    for resource in search_resources(query):
        rid = resource.get("id")
        if rid not in seen_ids:
            seen_ids.add(rid)
            results.append(resource)

    return results[:20]
