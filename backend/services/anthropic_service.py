import anthropic
import os
from typing import Optional
from config import settings
from utils.prompts import (
    get_system_prompt,
    get_industry_overview_prompt,
    get_bull_case_prompt,
    get_bear_case_prompt,
    get_quarterly_update_prompt,
)
from utils.project_store import get_project, get_project_documents

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

ANALYSIS_MODEL = "claude-opus-4-5"
CHAT_MODEL = "claude-sonnet-4-5"


def _build_file_content_blocks(project_id: str) -> list[dict]:
    """Build Anthropic API content blocks from uploaded project documents."""
    documents = get_project_documents(project_id)
    content_blocks = []

    for doc in documents:
        file_path = doc.get("file_path")
        if not file_path or not os.path.exists(file_path):
            continue

        file_name = doc.get("file_name", "document")
        _, ext = os.path.splitext(file_name.lower())

        try:
            with open(file_path, "rb") as f:
                file_bytes = f.read()

            import base64
            b64_data = base64.standard_b64encode(file_bytes).decode("utf-8")

            if ext == ".pdf":
                content_blocks.append({
                    "type": "document",
                    "source": {
                        "type": "base64",
                        "media_type": "application/pdf",
                        "data": b64_data,
                    },
                    "title": file_name,
                })
            elif ext in (".txt", ".md"):
                content_blocks.append({
                    "type": "document",
                    "source": {
                        "type": "text",
                        "data": file_bytes.decode("utf-8", errors="replace"),
                    },
                    "title": file_name,
                })
        except Exception as e:
            print(f"Warning: could not read file {file_path}: {e}")
            continue

    return content_blocks


def run_analysis(project_id: str, analysis_type: str, extra_context: Optional[str] = None) -> str:
    """Run a structured analysis (industry, bull, bear, quarterly) with extended thinking."""
    project = get_project(project_id)
    if not project:
        raise ValueError(f"Project {project_id} not found")

    ticker = project["ticker"]
    company_name = project["company_name"]
    industry = project["industry"]

    system_prompt = get_system_prompt(ticker, company_name)

    if analysis_type == "industry_overview":
        user_prompt = get_industry_overview_prompt(industry, company_name)
    elif analysis_type == "bull_case":
        user_prompt = get_bull_case_prompt(company_name, ticker)
    elif analysis_type == "bear_case":
        user_prompt = get_bear_case_prompt(company_name, ticker)
    elif analysis_type == "quarterly_update":
        quarter = extra_context or "latest quarter"
        user_prompt = get_quarterly_update_prompt(company_name, quarter)
    else:
        raise ValueError(f"Unknown analysis_type: {analysis_type}")

    file_blocks = _build_file_content_blocks(project_id)

    if file_blocks:
        content = file_blocks + [{"type": "text", "text": user_prompt}]
    else:
        content = user_prompt

    response = client.messages.create(
        model=ANALYSIS_MODEL,
        max_tokens=16000,
        thinking={
            "type": "enabled",
            "budget_tokens": 10000,
        },
        system=system_prompt,
        messages=[{"role": "user", "content": content}],
    )

    result_text = ""
    for block in response.content:
        if block.type == "text":
            result_text += block.text

    return result_text


def chat_with_analyst(
    project_id: str,
    message: str,
    conversation_history: list[dict],
) -> dict:
    """Free-form chat with the stock analyst using uploaded documents as context."""
    project = get_project(project_id)
    if not project:
        raise ValueError(f"Project {project_id} not found")

    ticker = project["ticker"]
    company_name = project["company_name"]
    system_prompt = get_system_prompt(ticker, company_name)

    file_blocks = _build_file_content_blocks(project_id)

    messages = list(conversation_history)

    if file_blocks and not conversation_history:
        user_content = file_blocks + [{"type": "text", "text": message}]
    else:
        user_content = message

    messages.append({"role": "user", "content": user_content})

    response = client.messages.create(
        model=CHAT_MODEL,
        max_tokens=4096,
        system=system_prompt,
        messages=messages,
    )

    response_text = ""
    for block in response.content:
        if hasattr(block, "text"):
            response_text += block.text

    return {"response": response_text}
