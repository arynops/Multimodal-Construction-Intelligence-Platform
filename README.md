# AI-Powered Construction Intelligence Platform

> Multimodal AI decision-support for site engineers, contractors, and project managers.  
> Built with **FastAPI + Groq Llama-4 Scout** (backend) and **React 18 + Vite** (frontend).

---

## Repository Structure

```
Multimodal Construction Intelligence Platform/
├── backend/                    # FastAPI application
│   ├── main.py                 # App entry-point, all API routes
│   ├── ai_service.py           # Centralized Groq SDK integration
│   ├── schemas.py              # Pydantic v2 schemas + fallback defaults
│   ├── config.py               # Environment settings (pydantic-settings)
│   ├── requirements.txt        # Pinned production + test dependencies
│   ├── pyproject.toml          # pytest + coverage configuration
│   ├── .env                    # ← Real secrets (git-ignored)
│   ├── .env.example            # ← Template to copy (committed)
│   └── tests/
│       ├── conftest.py         # Shared pytest fixtures (TestClient)
│       ├── test_api.py         # HTTP endpoint tests
│       └── test_schemas.py     # Pydantic schema / fallback tests
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx             # Router + layout
│   │   ├── api.js              # Axios client + INR formatters
│   │   ├── index.css           # Premium dark-mode design system
│   │   ├── components/         # Sidebar, ImageUploader, ScoreGauge …
│   │   └── pages/              # One file per module
│   ├── package.json
│   ├── vite.config.js          # Dev-proxy /api → :8000
│   ├── .env                    # ← Real values (git-ignored)
│   └── .env.example            # ← Template to copy (committed)
│
├── .gitignore                  # Covers .env, venv, node_modules …
└── README.md
```

---

## Phase 1 — One-Time Setup

### Prerequisites
| Tool | Minimum version |
|------|----------------|
| Python | 3.9 |
| Node.js | 18 |
| Groq API key | [console.groq.com](https://console.groq.com) (free) |

---

### 1 — Clone & configure secrets

```bash
# Backend
cp backend/.env.example backend/.env
# Open backend/.env and set:  GROQ_API_KEY=gsk_...

# Frontend
cp frontend/.env.example frontend/.env
# VITE_API_BASE_URL is pre-set to http://localhost:8000
```

### 2 — Backend: virtual environment + dependencies

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 3 — Frontend: Node dependencies

```bash
cd frontend
npm install
```

---

## Running the Platform

Open **two terminals** from the repo root:

| Terminal | Command | URL |
|----------|---------|-----|
| **Backend** | `cd backend && python -m uvicorn main:app --reload --port 8000` | http://localhost:8000 |
| **Frontend** | `cd frontend && npm run dev` | http://localhost:5173 |

Interactive API docs: **http://localhost:8000/docs**

---

## Running Tests

```bash
cd backend
python -m pytest          # all 16 tests
python -m pytest -k schema  # schema tests only
```

---

## AI Models

| Use Case | Model |
|----------|-------|
| Site Analysis · Safety Inspection · Visual Progress | `meta-llama/llama-4-scout-17b-16e-instruct` |
| Cost Estimation · Materials · Progress · Report · Chat | `llama-3.3-70b-versatile` |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/site-analysis` | Multimodal site condition analysis |
| `POST` | `/api/safety-inspection` | PPE & hazard detection |
| `POST` | `/api/visual-progress` | Progress estimation from image |
| `POST` | `/api/cost-estimation` | Detailed BOQ cost estimate (₹ INR) |
| `POST` | `/api/material-analysis` | Bill of Quantities with market rates |
| `POST` | `/api/progress-monitoring` | EVM & schedule variance |
| `POST` | `/api/project-report` | Executive AI project report |
| `POST` | `/api/chat` | Expert construction Q&A assistant |

---

## Localization
All financial outputs use **Indian Rupees (₹ / INR)** with Lakh/Crore compact notation.
