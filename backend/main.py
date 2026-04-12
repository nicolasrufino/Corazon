from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import ai, resources, users

app = FastAPI(title="Corazon API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://*.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(resources.router, prefix="/api/resources", tags=["resources"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])


@app.get("/")
def health_check():
    return {"status": "ok"}
