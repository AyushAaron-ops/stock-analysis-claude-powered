import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from api import projects, documents, analysis

app = FastAPI(
    title="Stock Analyst API",
    description="AI-powered stock research tool built on the AI × Finance framework",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.upload_dir, exist_ok=True)

app.include_router(projects.router)
app.include_router(documents.router)
app.include_router(analysis.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}