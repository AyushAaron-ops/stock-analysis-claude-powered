from fastapi import APIRouter, HTTPException
from models.schemas import ProjectCreate, ProjectResponse
from utils.project_store import create_project, get_project, get_all_projects, delete_project

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse, status_code=201)
def create_new_project(payload: ProjectCreate):
    project = create_project(
        ticker=payload.ticker,
        company_name=payload.company_name,
        industry=payload.industry,
    )
    return project


@router.get("", response_model=list[ProjectResponse])
def list_projects():
    return get_all_projects()


@router.get("/{project_id}", response_model=ProjectResponse)
def get_single_project(project_id: str):
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}", status_code=204)
def remove_project(project_id: str):
    success = delete_project(project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
