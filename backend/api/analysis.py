from fastapi import APIRouter, HTTPException
from models.schemas import AnalysisRequest, AnalysisResponse, QuarterlyUpdateRequest, ChatRequest, ChatResponse
from services.anthropic_service import run_analysis, chat_with_analyst
from utils.project_store import get_project

router = APIRouter(prefix="/projects/{project_id}/analysis", tags=["analysis"])

VALID_ANALYSIS_TYPES = {"industry_overview", "bull_case", "bear_case", "quarterly_update"}


@router.post("/{analysis_type}", response_model=AnalysisResponse)
def run_analysis_endpoint(project_id: str, analysis_type: str, payload: dict = {}):
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if analysis_type not in VALID_ANALYSIS_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid analysis_type. Allowed: {VALID_ANALYSIS_TYPES}",
        )

    extra_context = payload.get("extra_context") if payload else None

    try:
        content = run_analysis(
            project_id=project_id,
            analysis_type=analysis_type,
            extra_context=extra_context,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    return AnalysisResponse(
        analysis_type=analysis_type,
        content=content,
        project_id=project_id,
    )


@router.post("/chat/message", response_model=ChatResponse)
def chat_endpoint(project_id: str, payload: ChatRequest):
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        result = chat_with_analyst(
            project_id=project_id,
            message=payload.message,
            conversation_history=payload.conversation_history,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

    return ChatResponse(response=result["response"])
