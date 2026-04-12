# chatbot.py
#
# Standalone conversational module for Corazón.
# Import and call chat() / start_conversation() directly.

import os

from database import get_all_resources, search_resources_multilingual
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

_CLIENT = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)
_MODEL = "llama-3.3-70b-versatile"


# ── Resource formatting ───────────────────────────────────────────────────────


def format_resource_for_chat(org: dict, language: str = "en") -> str:
    """
    Returns a clean plain-text block for one resource, omitting empty fields.
    No emojis, no markdown bold, no placeholder text.
    Labels are translated based on language ("es" or "en").
    """
    if language == "es":
        phone_label = "Teléfono:"
        link_label = "Enlace:"
        location_label = "Ubicación:"
    else:
        phone_label = "Phone:"
        link_label = "Link:"
        location_label = "Location:"

    title = org.get("title") or org.get("name") or "Unknown"
    description = org.get("description") or ""
    phone = org.get("phone") or org.get("phone_number") or ""
    url = org.get("url") or org.get("website") or ""
    location = (
        org.get("location") or org.get("neighborhood") or org.get("address") or ""
    )

    lines = [f"{title} — {description}" if description else title]
    if phone:
        lines.append(f"{phone_label} {phone}")
    if url:
        lines.append(f"{link_label} {url}")
    if location:
        lines.append(f"{location_label} {location}")
    lines.append("---")
    return "\n".join(lines)


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

    prompt_language = (simple_archetype or {}).get("preferred_language", "es")

    resources_block = ""
    if resource_context:
        lines = ["", "AVAILABLE RESOURCES IN OUR DATABASE:"]
        for org in resource_context:
            lines.append(format_resource_for_chat(org, language=prompt_language))
        resources_block = "\n".join(lines)

    return f"""You are Corazón, a bilingual assistant for Latino immigrants. You help users find specific resources from our database and guide them step by step through their situation.

LANGUAGE: Always respond in the exact language the user writes in. Never mix languages.

PERSONALITY:
- You speak like a knowledgeable friend, not a helpdesk. Warm, direct, real. Like someone who has been through the system and knows how to navigate it.
- Short responses. Never more than 3-4 sentences unless walking through steps.
- Empathy through specificity — the most caring thing you can do is give someone exactly what they need, fast.
- No bullet point lists of resources. Weave them naturally into your response like a person would in conversation.
- No emojis unless the user uses them first.
- No bold formatting on every resource name. Only bold something if it is the single most important thing in the response.
- Start every response mid-thought, as if continuing a conversation. Never open with a pleasantry or self-introduction.
- Never open with: "Claro", "Por supuesto", "Entiendo", "Great", "Of course", "Me alegra", "Me da gusto", "Con mucho gusto", "Estoy aquí para", "Es un placer", or any filler opener.
- Sound like you genuinely care about this specific person, not like you are reading from a script.

BEHAVIOR:
- Ask one clarifying question before giving resources, but make it feel like a natural follow-up, not an intake form.
- When giving resources mention them naturally in a sentence first, then give the contact info on the next line cleanly.
- Give numbered steps only when the process genuinely requires sequential action. Not for everything.
- If someone is scared or overwhelmed, lead with one honest human sentence before the help. Not a formula, something real.
- Never give more than 2-3 resources at once. Quality over quantity.
- If you do not have a resource for something say so plainly and give them the best next step you know.
- Never say "I cannot provide legal advice" — instead say "For this you need a lawyer — here are free options:"

RESOURCE CONTEXT:
If resource_context is provided in the system prompt, use those specific resources. Always prefer database resources over generic ones.

If simple_archetype is provided use it silently — never tell the user you have their profile. Just use it to give relevant resources without asking questions they already answered.

NEVER:
- Give the same resource twice in a conversation
- Ask more than one question at a time
- Use phrases like "As an AI" or "I'm just a chatbot"
- Give more than 3 resources at once
- Repeat what the user just said back to them

RESOURCES RULES — CRITICAL:
- You ONLY reference resources that appear in the AVAILABLE RESOURCES section below. Never invent organization names, phone numbers, or URLs.
- If no relevant resource exists in the database for the user's need, say exactly: "No encontré recursos específicos en nuestra base de datos para esto, pero puedes llamar al 211 para orientación." (or English equivalent)
- Never generate fake phone numbers or URLs. If a resource has no phone or url in the database, omit that field entirely — never show placeholder text to the user.
- Always use the exact title, url, and description from the database entry. Do not paraphrase or rename resources.
- Present resources conversationally, not as a formatted list. Mention the name naturally in a sentence, then give the contact details on the next line. Never show empty fields.
{profile_block}{resources_block}

If the user asks for something not covered by the AVAILABLE RESOURCES list, say so honestly and refer them to 211."""


# ── Resource fetching ─────────────────────────────────────────────────────────


def get_relevant_resources(message: str, simple_archetype: dict | None = None) -> list:
    """
    Fetches resources relevant to the user's message.

    1. Searches by message text.
    2. Pads to at least 5 with get_all_resources() if needed.
    3. Prefers resources matching the user's preferred_language.
    4. Returns up to 10 resources.
    """
    results = search_resources_multilingual(message)

    if len(results) < 5:
        all_resources = get_all_resources()
        existing_ids = {r.get("id") for r in results}
        for resource in all_resources:
            if resource.get("id") not in existing_ids:
                results.append(resource)
                existing_ids.add(resource.get("id"))
            if len(results) >= 5:
                break

    if simple_archetype:
        preferred_language = simple_archetype.get("preferred_language")
        if preferred_language:
            preferred = [
                r
                for r in results
                if preferred_language
                in str(r.get("languages") or r.get("language_support") or "")
            ]
            others = [
                r
                for r in results
                if preferred_language
                not in str(r.get("languages") or r.get("language_support") or "")
            ]
            results = preferred + others

    return results[:10]


# ── Core functions ────────────────────────────────────────────────────────────


def chat(
    message: str,
    history: list,
    simple_archetype: dict | None = None,
    resource_context: list | None = None,
    auto_fetch: bool = True,
) -> str:
    """
    Sends a message plus conversation history to Groq.

    Args:
        message:          The latest user message.
        history:          List of {role, content} dicts for prior turns.
        simple_archetype: Optional archetype dict for personalised prompting.
        resource_context: Optional list of org dicts to inject into system prompt.
        auto_fetch:       If True and resource_context is None, fetches relevant
                          resources from the database automatically.

    Returns:
        Groq's reply as a plain string. Raises on upstream failure so the
        FastAPI handler can convert it to an HTTP 500 instead of leaking
        the error string into the chat UI as if it were a real reply.
    """
    if auto_fetch and resource_context is None:
        resource_context = get_relevant_resources(message, simple_archetype)

    response = _CLIENT.chat.completions.create(
        model=_MODEL,
        messages=(
            [
                {
                    "role": "system",
                    "content": build_system_prompt(
                        simple_archetype, resource_context
                    ),
                }
            ]
            + [
                {"role": entry["role"], "content": entry["content"]}
                for entry in format_history(history)
            ]
            + [{"role": "user", "content": message}]
        ),
    )
    return response.choices[0].message.content


def start_conversation(
    simple_archetype: dict | None = None,
    resource_context: list | None = None,
) -> str:
    """
    Returns a single warm one-sentence greeting that immediately asks what
    the user needs help with. Language defaults to Spanish unless
    simple_archetype preferred_language is 'en'.
    """
    if resource_context is None:
        all_resources = get_all_resources()
        resource_context = all_resources[:10]

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
            {
                "role": "system",
                "content": build_system_prompt(simple_archetype, resource_context),
            },
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

    history = []

    # Turn 1: opening greeting (auto-fetches first 10 resources)
    greeting = start_conversation(archetype)
    print("Corazón:", greeting)
    print()

    history.append({"role": "assistant", "content": greeting})

    # Turn 2: user says they need food help
    user_msg_1 = "Necesito ayuda con comida, no tengo nada en casa."
    print("User:", user_msg_1)
    reply_1 = chat(user_msg_1, history, archetype)
    print("Corazón:", reply_1)
    print()

    history.append({"role": "user", "content": user_msg_1})
    history.append({"role": "assistant", "content": reply_1})

    # Turn 3: user gives specific detail
    user_msg_2 = (
        "Soy madre soltera con dos niños pequeños y necesito comida para esta semana."
    )
    print("User:", user_msg_2)
    reply_2 = chat(user_msg_2, history, archetype)
    print("Corazón:", reply_2)
    print()

    history.append({"role": "user", "content": user_msg_2})
    history.append({"role": "assistant", "content": reply_2})

    # Turn 4: user asks about legal help for immigration status
    user_msg_3 = "También necesito ayuda legal. Soy indocumentada y tengo miedo de ser deportada."
    print("User:", user_msg_3)
    reply_3 = chat(user_msg_3, history, archetype)
    print("Corazón:", reply_3)
