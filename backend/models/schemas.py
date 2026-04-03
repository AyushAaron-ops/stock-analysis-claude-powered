from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class StockType(str, Enum):
    slow_grower = "slow_grower"
    stalwart = "stalwart"
    fast_grower = "fast_grower"
    cyclical = "cyclical"
    turnaround = "turnaround"
    asset_play = "asset_play"


class ProjectCreate(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=10)
    company_name: str = Field(..., min_length=1, max_length=200)
    industry: str = Field(..., min_length=1, max_length=200)


class ProjectResponse(BaseModel):
    project_id: str
    ticker: str
    company_name: str
    industry: str
    anthropic_project_id: Optional[str] = None
    created_at: str
    document_count: int = 0


class DocumentUploadResponse(BaseModel):
    document_id: str
    file_name: str
    doc_type: str
    project_id: str
    message: str


class AnalysisRequest(BaseModel):
    project_id: str
    analysis_type: str  # "industry_overview" | "bull_case" | "bear_case" | "quarterly_update"
    extra_context: Optional[str] = None


class QuarterlyUpdateRequest(BaseModel):
    project_id: str
    quarter: str  # e.g. "Q1 2025"


class ChatRequest(BaseModel):
    project_id: str
    message: str
    conversation_history: list[dict] = []


class ChatResponse(BaseModel):
    response: str
    thinking: Optional[str] = None


class AnalysisResponse(BaseModel):
    analysis_type: str
    content: str
    project_id: str
