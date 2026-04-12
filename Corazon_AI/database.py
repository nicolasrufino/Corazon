# database.py
#
# Standalone Supabase connection for the Corazon_AI module.

import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
RESOURCES_TABLE = os.getenv("SUPABASE_RESOURCES_TABLE", "resources")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


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


if __name__ == "__main__":
    resources = get_all_resources()
    print(f"Total resources: {len(resources)}")
    if resources:
        print(f"First resource title: {resources[0].get('title', '(no title field)')}")
