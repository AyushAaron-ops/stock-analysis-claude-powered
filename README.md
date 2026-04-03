# Stock Analyst — AI × Finance

A full-stack AI-powered stock research tool built on the 5-step framework from the AI × Finance series. Upload filings, transcripts and reports; run structured analyses (Industry Overview, Bull Case, Bear Case, Quarterly Update); and chat with a sourced equity analyst — all grounded in your uploaded documents.

---

## Tech Stack

| Layer    | Technology                         |
|----------|------------------------------------|
| Backend  | Python 3.11+, FastAPI, Uvicorn     |
| AI       | Anthropic Claude (claude-opus-4-5) |
| Frontend | React 18, Vite, React Router       |
| Storage  | Local filesystem + JSON store      |

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- An Anthropic API key → https://console.anthropic.com

---

## Quick Start

### 1. Clone / unzip

```bash
unzip stock_analyst.zip
cd stock_analyst
```

### 2. Set up the backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set your ANTHROPIC_API_KEY
```

### 3. Run the backend

```bash
# From the backend/ directory with .venv active
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API will be live at http://localhost:8000  
Swagger docs at http://localhost:8000/docs

### 4. Set up the frontend

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

Frontend will be live at http://localhost:5173

---

## Usage

1. **Create a Project** — One project per stock. Enter ticker, company name, and industry.
2. **Upload Documents** — Annual reports (10-K), quarterly reports (10-Q), earnings transcripts, industry reports. Supports PDF, TXT, and MD files up to 50MB each.
3. **Run Analysis** — Choose from four analysis types:
   - **Industry Overview** — How the industry works, growth drivers, structural constraints
   - **The Lynch Pitch** — Bull case: why you'd own this stock
   - **The Munger Invert** — Bear case: how you could lose money
   - **Quarterly Update** — Guidance vs reality, KPI trends, what changed
4. **Chat** — Ask any question about the company; answers are grounded in your documents

> **Note:** The analysis types use `claude-opus-4-5` with Extended Thinking enabled. Each run may take 1–3 minutes. Chat uses `claude-sonnet-4-5` for faster responses.

---

## Project Structure

```
stock_analyst/
├── backend/
│   ├── api/
│   │   ├── projects.py       # CRUD for projects
│   │   ├── documents.py      # File upload endpoints
│   │   └── analysis.py       # Analysis + chat endpoints
│   ├── models/
│   │   └── schemas.py        # Pydantic request/response models
│   ├── services/
│   │   └── anthropic_service.py  # Claude API integration
│   ├── utils/
│   │   ├── project_store.py  # JSON persistence layer
│   │   └── prompts.py        # All prompt templates
│   ├── config.py             # App settings (pydantic-settings)
│   ├── main.py               # FastAPI app entry point
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── DocumentsPanel.jsx
│   │   │   ├── AnalysisPanel.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   └── ToastContainer.jsx
│   │   ├── hooks/
│   │   │   └── use_toast.js
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── NewProjectPage.jsx
│   │   │   └── ProjectPage.jsx
│   │   ├── services/
│   │   │   └── api.js        # All API calls (axios)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Pushing to GitHub

```bash
git init
git add .
git commit -m "feat: initial stock analyst app"
git remote add origin https://github.com/YOUR_USERNAME/stock-analyst.git
git push -u origin main
```

A `.gitignore` is included — it excludes `.env`, `uploads/`, `__pycache__/`, `.venv/`, and `node_modules/`.

---

## Environment Variables

| Variable            | Default                                          | Description                  |
|---------------------|--------------------------------------------------|------------------------------|
| `ANTHROPIC_API_KEY` | *(required)*                                     | Your Anthropic API key       |
| `APP_HOST`          | `0.0.0.0`                                        | Backend bind host            |
| `APP_PORT`          | `8000`                                           | Backend port                 |
| `CORS_ORIGINS`      | `["http://localhost:5173","http://localhost:3000"]` | Allowed frontend origins   |
| `UPLOAD_DIR`        | `uploads`                                        | Directory for uploaded files |
| `MAX_FILE_SIZE_MB`  | `50`                                             | Max upload size in MB        |
