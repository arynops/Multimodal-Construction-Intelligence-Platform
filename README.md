# AI-Powered Construction Intelligence Platform

Construction analysis tools built with a React 18/Vite frontend and a FastAPI backend. The backend uses Groq models for text and image analysis. AI-dependent endpoints return an error when the provider is unavailable; they do not report a fabricated analysis as successful.

## Repository Structure

```text
backend/
	main.py              FastAPI application and routes
	ai_service.py        Groq integration
	config.py            Environment-backed settings
	schemas.py           Pydantic response models
	requirements.txt     Python dependencies
	tests/               Backend tests
frontend/
	src/                 React application, pages, and components
	package.json         Frontend scripts and dependencies
	package-lock.json    Locked npm dependency tree
	vite.config.js       Development server and API proxy
	.env.example         Legacy root-level placeholder
backend/.env.example   Backend environment template
frontend/.env.example  Frontend environment template
```

The committed `backend/.env.example` and `frontend/.env.example` files are templates. The root `.env.example` is a legacy placeholder; backend settings are loaded from `backend/.env`. Real `.env` files are ignored by Git.

## Prerequisites

- Python 3.11 or newer
- Node.js 18 or newer and npm
- A Groq API key for AI-dependent features

## Setup on Windows PowerShell

Run these commands from the repository root:

```powershell
Copy-Item backend/.env.example backend/.env
# Set GROQ_API_KEY in backend/.env using a text editor.

py -3 -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt

Set-Location frontend
npm ci
Set-Location ..
```

The frontend uses the Vite `/api` proxy by default, so a frontend `.env` file is not required for local development. To customize the API URL, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_BASE_URL` to the backend API base URL, including `/api`.

## Setup on macOS or Linux

Run these commands from the repository root:

```bash
cp backend/.env.example backend/.env
# Set GROQ_API_KEY in backend/.env using a text editor.

python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.txt

cd frontend
npm ci
cd ..
```

The frontend uses the Vite `/api` proxy by default, so a frontend `.env` file is not required for local development. To customize the API URL, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_BASE_URL` to the backend API base URL, including `/api`.

## Run the Application

Open two terminals at the repository root.

Backend:

Windows PowerShell:

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

macOS/Linux:

```bash
cd backend
.venv/bin/python -m uvicorn main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm run dev
```

The frontend is available at `http://localhost:5173`. API documentation is at `http://localhost:8000/docs`; the health endpoint is `http://localhost:8000/health`.

## Tests and Build

```bash
cd backend
.venv/bin/python -m pytest
cd ../frontend
npm run build
npm run test:e2e:install
npm run test:e2e
```

On Windows PowerShell, run backend tests with `backend\.venv\Scripts\python.exe -m pytest` from the repository root, and build the frontend with `Set-Location frontend; npm run build`.

The Playwright E2E suite starts its own Vite server and mocks API responses; it does not require a Groq key or a running backend.

## Deployment

Deploy the FastAPI backend and Vite-built frontend as separate services, or serve both behind a reverse proxy. The frontend must route `/api/*` to the backend when using the default `VITE_API_BASE_URL=/api`; otherwise set the frontend API base URL to the deployed API origin plus `/api` at build time. Configure the backend CORS allowlist with the exact browser origins. Use HTTPS in production.

| Variable | Service | Purpose |
| --- | --- | --- |
| `GROQ_API_KEY` | Backend | Provider credential. Store in a deployment secret manager; never put it in a `VITE_` variable. |
| `PORT` | Backend | Default port when starting with `python main.py`; when using the Uvicorn CLI, pass the deployment platform's port explicitly. Defaults to `8000`. |
| `APP_ENV` | Backend | Runtime environment label; defaults to `development`. |
| `ALLOWED_ORIGINS` | Backend | Comma-separated exact browser origins; wildcards are rejected. |
| `MAX_IMAGE_SIZE_MB` | Backend | Maximum image upload size from 1 to 50 MB; defaults to `10`. |
| `VITE_API_BASE_URL` | Frontend build | Browser API base, including `/api`; defaults to `/api`. This value is public in the built bundle. |
| `VITE_API_PROXY_TARGET` | Vite development server | Backend origin for the development proxy; defaults to `http://127.0.0.1:8000`. |

Production requirements: provide outbound HTTPS access from the backend to the Groq API, persist no secrets in the frontend artifact, restrict the API to trusted origins, and configure the hosting proxy/body-size limit to allow the selected image limit. `/health` is a liveness check; `ai_available` separately reports provider configuration. No weather provider or live market-price source is integrated.

## API Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Backend and AI availability |
| `GET` | `/api/health` | Health endpoint for frontend API client |
| `POST` | `/api/site-analysis` | Image-based site analysis |
| `POST` | `/api/safety-inspection` | Image-based safety inspection |
| `POST` | `/api/visual-progress` | Image-based progress analysis |
| `POST` | `/api/cost-estimation` | Cost estimate in INR |
| `POST` | `/api/material-analysis` | Material quantity and cost analysis |
| `POST` | `/api/progress-monitoring` | Schedule and budget progress analysis |
| `POST` | `/api/project-report` | Project status report |
| `POST` | `/api/chat` | Construction Q&A |

The image endpoints accept image uploads up to the configured size limit. Financial amounts are expressed in Indian Rupees (INR). If the AI provider is unavailable or returns an invalid response, endpoints return a structured error instead of a successful fallback result.

## Feature Scope

| Requested capability | Current implementation |
| --- | --- |
| Site safety, PPE, and hazard screening | Implemented as image-assisted screening at `/api/safety-inspection`; professional verification is required. |
| Structural crack analysis | Partial: `/api/site-analysis` can report visible structural distress from an image. This is not a dedicated crack detector or structural diagnosis. |
| Project planning | Partial: progress monitoring and reporting exist; there is no schedule-generation or critical-path planning engine. |
| Material estimation | Implemented as an indicative AI-generated BOQ with server-calculated line and grand totals; there is no live supplier-price feed. |
| Construction cost estimation | Implemented as an indicative AI-generated estimate; it is not a quote and has no live rate feed. |
| Real-estate valuation | Not implemented. |
| Construction chatbot and knowledge assistance | Implemented as single-turn construction Q&A; conversation history is not sent to the backend. |
| Daily site assistance | No dedicated daily-assistance workflow is implemented. |
| Weather advisory | Not implemented; no live weather source is integrated. |

Image-based safety and structural findings are preliminary and can be incomplete or uncertain. They are not certifications, engineering diagnoses, or a substitute for an on-site qualified professional.
