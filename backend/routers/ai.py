from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class RecommendRequest(BaseModel):
    user_id: str
    context: dict = {}


class ChatRequest(BaseModel):
    user_id: str
    message: str
    history: list = []


class AnalyzeDocumentRequest(BaseModel):
    user_id: str
    document_text: str


@router.post("/recommend")
async def recommend(body: RecommendRequest):
    # TODO: implement with OpenRouter
    return {"recommendations": []}


@router.post("/chat")
async def chat(body: ChatRequest):
    # TODO: implement with OpenRouter
    return {"reply": ""}


@router.post("/analyze-document")
async def analyze_document(body: AnalyzeDocumentRequest):
    # TODO: implement with OpenRouter
    return {"analysis": ""}
