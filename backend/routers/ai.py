import os
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from groq import Groq

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama3-8b-8192"

SYSTEM_PROMPT_EN = """You are Corazón, a warm and trustworthy AI assistant built for the Latino community in Chicago. You help people find resources, understand their options, and navigate life in the US. You are bilingual, culturally aware, and speak plainly. Never provide legal or medical advice — always recommend consulting a qualified professional. Keep responses short and conversational."""

SYSTEM_PROMPT_ES = """Eres Corazón, un asistente de IA cálido y confiable creado para la comunidad latina en Chicago. Ayudas a las personas a encontrar recursos, entender sus opciones y navegar la vida en los EE.UU. Eres bilingüe, culturalmente consciente y hablas de manera sencilla. Nunca des consejos legales o médicos — siempre recomienda consultar con un profesional calificado. Mantén las respuestas cortas y conversacionales."""


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []
    language: str = "en"
    profile: Optional[dict] = None


@router.post("/chat")
async def chat(req: ChatRequest):
    system = SYSTEM_PROMPT_ES if req.language == "es" else SYSTEM_PROMPT_EN
    if req.profile:
        profile_context = f"\nUser profile: goals={req.profile.get('goals', [])}, occupation={req.profile.get('occupation', '')}, language={req.language}"
        system += profile_context

    messages = [{"role": "system", "content": system}]
    for msg in req.history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": req.message})

    def generate():
        stream = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            stream=True,
            max_tokens=500,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    return StreamingResponse(generate(), media_type="text/plain")


@router.get("/health")
async def health():
    return {"status": "ok", "model": MODEL}
