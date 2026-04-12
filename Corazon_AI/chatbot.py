# chatbot.py
#
# Standalone conversational module for Corazón.
# Import and call chat() / start_conversation() directly.

import json
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

_CLIENT = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)
_MODEL = "llama-3.3-70b-versatile"


# ── System prompt ─────────────────────────────────────────────────────────────


def build_system_prompt(
    simple_archetype: dict | None = None,
    resource_context: list | None = None,
) -> str:
    """
    Builds the system prompt for Corazón.

    Args:
        simple_archetype:  Optional user profile dict.
        resource_context:  Optional list of org dicts from the database.
    """
    profile_block = ""
    if simple_archetype:
        immigration_status = simple_archetype.get("immigration_status", "unknown")
        preferred_language = simple_archetype.get("preferred_language", "en")
        occupation = simple_archetype.get("occupation", "unknown")
        nav_hours_yr = simple_archetype.get("nav_hours_yr")

        profile_block = (
            f"\nUSER PROFILE (use silently — never tell the user you have this):\n"
            f"  - Immigration status: {immigration_status}\n"
            f"  - Preferred language: {'Spanish' if preferred_language == 'es' else 'English'}\n"
            f"  - Occupation: {occupation}\n"
        )
        if nav_hours_yr is not None:
            profile_block += f"  - Hours lost/yr navigating systems: {nav_hours_yr}\n"

    resources_block = ""
    if resource_context:
        lines = ["", "AVAILABLE RESOURCES IN OUR DATABASE:"]
        for org in resource_context:
            name = org.get("name", "Unknown")
            categories = ", ".join(org.get("categories", org.get("category", [])) if isinstance(org.get("categories", org.get("category")), list) else [org.get("categories", org.get("category", ""))])
            phone = org.get("phone", "")
            address = org.get("address", "")
            languages = ", ".join(org.get("languages", []))
            lines.append(f"  - {name} | {categories} | {phone} | {address} | languages: {languages}")
        resources_block = "\n".join(lines)

    return f"""You are Corazón, a bilingual assistant for Latino immigrants. You help users find specific resources from our database and guide them step by step through their situation.

LANGUAGE: Always respond in the exact language the user writes in. Never mix languages.

PERSONALITY:
- Warm but concise. No filler phrases like "I understand that must be difficult" before every response.
- Get to the point fast. Empathy through action, not words.
- Never say "I cannot provide legal advice" — instead say "For this you need a lawyer — here are free options:"
- Maximum 3-4 sentences per response unless giving step by step instructions.

BEHAVIOR:
- Always ask ONE clarifying question to understand the specific situation before giving resources. Example: if user says "I need food help" ask "Are you looking for emergency food today or a regular food bank you can visit weekly?"
- After clarifying, give 2-3 specific resources with name, what they offer, and how to contact or access them.
- If resources have links, present them clearly as: [Resource Name](url)
- Give numbered step by step instructions when the user needs to take action. Example: "1. Call 211. 2. Say you need food assistance. 3. They will connect you to the nearest bank."
- If the user seems overwhelmed or distressed, acknowledge with ONE sentence then immediately move to concrete help.
- Never give generic advice like "search online" — always give specific names, numbers, or links.
- When you recommend a resource from the database, format it as: **[Name]** — what they do | 📞 phone | 🔗 link

RESOURCE CONTEXT:
If resource_context is provided in the system prompt, use those specific resources. Always prefer database resources over generic ones.

If simple_archetype is provided use it silently — never tell the user you have their profile. Just use it to give relevant resources without asking questions they already answered.

NEVER:
- Give the same resource twice in a conversation
- Ask more than one question at a time
- Use phrases like "As an AI" or "I'm just a chatbot"
- Give more than 4 resources at once
- Repeat what the user just said back to them
{profile_block}{resources_block}"""


# ── Core functions ────────────────────────────────────────────────────────────


def chat(
    message: str,
    history: list,
    simple_archetype: dict | None = None,
    resource_context: list | None = None,
) -> str:
    """
    Sends a message plus conversation history to Groq.

    Args:
        message:          The latest user message.
        history:          List of {role, content} dicts for prior turns.
        simple_archetype: Optional archetype dict for personalised prompting.
        resource_context: Optional list of org dicts to inject into system prompt.

    Returns:
        Groq's reply as a plain string, or an error string on failure.
    """
    try:
        response = _CLIENT.chat.completions.create(
            model=_MODEL,
            messages=(
                [{"role": "system", "content": build_system_prompt(simple_archetype, resource_context)}]
                + [{"role": entry["role"], "content": entry["content"]} for entry in format_history(history)]
                + [{"role": "user", "content": message}]
            ),
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"[Corazón encountered an error: {e}]"


def start_conversation(
    simple_archetype: dict | None = None,
    resource_context: list | None = None,
) -> str:
    """
    Returns a single warm one-sentence greeting that immediately asks what
    the user needs help with. Language defaults to Spanish unless
    simple_archetype preferred_language is 'en'.
    """
    preferred_language = (simple_archetype or {}).get("preferred_language", "es")

    if preferred_language == "en":
        prompt = (
            "Write one warm sentence greeting the user and asking what they need help with today. "
            "No introduction, no explanation of what you are. Just the greeting and the question."
        )
    else:
        prompt = (
            "Escribe una sola oración cálida saludando al usuario y preguntando en qué necesita ayuda hoy. "
            "Sin introducción, sin explicar quién eres. Solo el saludo y la pregunta."
        )

    response = _CLIENT.chat.completions.create(
        model=_MODEL,
        messages=[
            {"role": "system", "content": build_system_prompt(simple_archetype, resource_context)},
            {"role": "user", "content": prompt},
        ],
    )
    return response.choices[0].message.content


def format_history(raw_history: list) -> list:
    """
    Cleans and validates a conversation history list.
    Removes entries missing role or content.
    Ensures role is only 'user' or 'assistant'.
    """
    cleaned = []
    for entry in raw_history:
        role = entry.get("role")
        content = entry.get("content")
        if not role or not content:
            continue
        if role not in ("user", "assistant"):
            continue
        cleaned.append({"role": role, "content": content})
    return cleaned


# ── Standalone test ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    archetype = {
        "immigration_status": "undocumented",
        "preferred_language": "es",
        "occupation": "unemployed",
        "nav_hours_yr": 152.0,
    }

    with open("mock_orgs.json") as f:
        orgs = json.load(f)

    history = []

    # Turn 1: opening greeting
    greeting = start_conversation(archetype, orgs)
    print("Corazón:", greeting)
    print()

    history.append({"role": "assistant", "content": greeting})

    # Turn 2: user says they need food help
    user_msg_1 = "Necesito ayuda con comida, no tengo nada en casa."
    print("User:", user_msg_1)
    reply_1 = chat(user_msg_1, history, archetype, orgs)
    print("Corazón:", reply_1)
    print()

    history.append({"role": "user", "content": user_msg_1})
    history.append({"role": "assistant", "content": reply_1})

    # Turn 3: user gives specific detail
    user_msg_2 = "Soy madre soltera con dos niños pequeños y necesito comida para esta semana."
    print("User:", user_msg_2)
    reply_2 = chat(user_msg_2, history, archetype, orgs)
    print("Corazón:", reply_2)
    print()

    history.append({"role": "user", "content": user_msg_2})
    history.append({"role": "assistant", "content": reply_2})

    # Turn 4: user asks about legal help for immigration status
    user_msg_3 = "También necesito ayuda legal. Soy indocumentada y tengo miedo de ser deportada."
    print("User:", user_msg_3)
    reply_3 = chat(user_msg_3, history, archetype, orgs)
    print("Corazón:", reply_3)
