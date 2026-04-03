import json
import os
import uuid
from datetime import datetime, timezone
from typing import Optional

STORE_FILE = "projects_store.json"


def _load_store() -> dict:
    if os.path.exists(STORE_FILE):
        with open(STORE_FILE, "r") as f:
            return json.load(f)
    return {"projects": {}, "documents": {}}


def _save_store(data: dict) -> None:
    with open(STORE_FILE, "w") as f:
        json.dump(data, f, indent=2)


def create_project(ticker: str, company_name: str, industry: str, anthropic_project_id: Optional[str] = None) -> dict:
    store = _load_store()
    project_id = str(uuid.uuid4())
    project = {
        "project_id": project_id,
        "ticker": ticker.upper(),
        "company_name": company_name,
        "industry": industry,
        "anthropic_project_id": anthropic_project_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "document_count": 0,
    }
    store["projects"][project_id] = project
    _save_store(store)
    return project


def get_project(project_id: str) -> Optional[dict]:
    store = _load_store()
    return store["projects"].get(project_id)


def get_all_projects() -> list[dict]:
    store = _load_store()
    return list(store["projects"].values())


def update_project_doc_count(project_id: str, delta: int = 1) -> None:
    store = _load_store()
    if project_id in store["projects"]:
        store["projects"][project_id]["document_count"] = (
            store["projects"][project_id].get("document_count", 0) + delta
        )
        _save_store(store)


def add_document(project_id: str, file_name: str, doc_type: str, file_path: str, anthropic_file_id: Optional[str] = None) -> dict:
    store = _load_store()
    doc_id = str(uuid.uuid4())
    doc = {
        "document_id": doc_id,
        "project_id": project_id,
        "file_name": file_name,
        "doc_type": doc_type,
        "file_path": file_path,
        "anthropic_file_id": anthropic_file_id,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }
    if "documents" not in store:
        store["documents"] = {}
    store["documents"][doc_id] = doc
    update_project_doc_count(project_id, 1)
    _save_store(store)
    return doc


def get_project_documents(project_id: str) -> list[dict]:
    store = _load_store()
    return [d for d in store.get("documents", {}).values() if d["project_id"] == project_id]


def delete_project(project_id: str) -> bool:
    store = _load_store()
    if project_id not in store["projects"]:
        return False
    del store["projects"][project_id]
    store["documents"] = {
        k: v for k, v in store.get("documents", {}).items()
        if v["project_id"] != project_id
    }
    _save_store(store)
    return True
