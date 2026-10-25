"""
FastAPI main application - AI-Powered Multimodal Construction Intelligence Platform
All financial values in INR (₹). Structured JSON responses via Pydantic v2.
"""
import os
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from schemas import (
    SiteAnalysisResponse, CostEstimationResponse, SafetyInspectionResponse,
    ProgressMonitoringResponse, MaterialAnalysisResponse, ProjectReportResponse,
    ChatResponse, RiskItem,
)
from ai_service import GroqAIService

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─────────────────── App Lifespan ────────────────────────────────

ai_service: Optional[GroqAIService] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global ai_service
    api_key = os.getenv("GROQ_API_KEY", "")
    if api_key:
        ai_service = GroqAIService(api_key=api_key)
        logger.info("✅ Groq AI Service initialized successfully.")
    else:
        logger.warning("⚠️  GROQ_API_KEY not set. AI features will return fallback responses.")
    yield
    logger.info("Shutting down Construction Intelligence Platform.")


app = FastAPI(
    title="AI Construction Intelligence Platform",
    description="Multimodal AI system for construction site analysis, safety inspection, cost estimation, and reporting.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────── Dependency ──────────────────────────────────

def get_ai_service() -> GroqAIService:
    if ai_service is None:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Please set GROQ_API_KEY in .env file."
        )
    return ai_service


# ─────────────────── Health Check ────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Construction Intelligence Platform",
        "ai_available": ai_service is not None,
        "version": "1.0.0"
    }


# ─────────────────── 1. Site Analysis (Multimodal) ───────────────

@app.post("/api/site-analysis", response_model=SiteAnalysisResponse, tags=["Analysis"])
async def analyze_site(
    image: UploadFile = File(..., description="Construction site image"),
    context: str = Form(default="", description="Additional context about the site"),
    service: GroqAIService = Depends(get_ai_service),
):
    """
    Analyze a construction site image using multimodal AI.
    Returns site conditions, detected elements, safety concerns, and recommendations.
    """
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted.")

    image_bytes = await image.read()
    if len(image_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=413, detail="Image too large. Max 10MB.")

    fallback = SiteAnalysisResponse(
        summary="Unable to analyze image at this time. Please try again.",
        site_condition="Unknown",
        detected_elements=["Analysis unavailable"],
        recommended_actions=["Please retry the analysis"],
    )

    system_prompt = """You are an expert construction site analyst with 20+ years of experience.
Analyze the provided construction site image and extract detailed information about:
- Site conditions and readiness
- Detected construction elements and infrastructure
- Safety hazards and concerns
- Infrastructure readiness assessment
- Actionable recommendations for site engineers
All assessments must be practical, safety-first, and aligned with Indian construction standards (IS codes)."""

    user_prompt = f"""Analyze this construction site image comprehensively.
{f'Additional context: {context}' if context else ''}
Provide a thorough analysis including site condition, detected elements, safety concerns, 
risk assessment, and recommended actions. Use Indian standards and regulatory references.
Express infrastructure readiness as a score from 0-100."""

    result = service.analyze_image_with_text(
        image_bytes=image_bytes,
        image_type=image.content_type,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        schema=SiteAnalysisResponse,
        fallback=fallback,
    )
    return result


# ─────────────────── 2. Cost Estimation ──────────────────────────

class CostEstimationRequest(BaseModel):
    project_type: str = "Residential"
    location: str = "Mumbai, Maharashtra"
    built_up_area_sqft: float = 1000.0
    floors: int = 1
    quality_standard: str = "Standard"
    special_requirements: Optional[str] = None


@app.post("/api/cost-estimation", response_model=CostEstimationResponse, tags=["Estimation"])
async def estimate_cost(
    request: CostEstimationRequest,
    service: GroqAIService = Depends(get_ai_service),
):
    """
    Generate detailed cost estimation for construction projects in INR (₹).
    """
    fallback = CostEstimationResponse(
        project_name=f"{request.project_type} Project - {request.location}",
        project_type=request.project_type,
        total_estimated_cost_inr=request.built_up_area_sqft * 2500,
        cost_per_sqft_inr=2500.0,
        timeline_months=max(6, int(request.built_up_area_sqft / 500)),
    )

    system_prompt = """You are a certified quantity surveyor and cost consultant specializing in Indian construction markets.
Generate precise cost estimates using current market rates in Indian Rupees (₹/INR).
Consider location-specific factors, material costs, labor rates, taxes (GST), and regulatory fees.
Use 2024-2025 Indian construction cost benchmarks."""

    user_prompt = f"""Generate a comprehensive construction cost estimate for:
- Project Type: {request.project_type}
- Location: {request.location}
- Built-up Area: {request.built_up_area_sqft} sq.ft
- Number of Floors: {request.floors}
- Quality Standard: {request.quality_standard}
{f'- Special Requirements: {request.special_requirements}' if request.special_requirements else ''}

Provide detailed cost breakdown in Indian Rupees (₹) including:
civil work, finishing, MEP services, external development, fees & approvals, and contingency.
Include cost per sq.ft, timeline, and risk factors."""

    result = service.query_text(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        schema=CostEstimationResponse,
        fallback=fallback,
    )
    return result


# ─────────────────── 3. Safety Inspection (Multimodal) ───────────

@app.post("/api/safety-inspection", response_model=SafetyInspectionResponse, tags=["Safety"])
async def inspect_safety(
    image: UploadFile = File(..., description="Site safety inspection image"),
    site_type: str = Form(default="construction", description="Type of construction site"),
    service: GroqAIService = Depends(get_ai_service),
):
    """
    AI-powered safety inspection using site images.
    Detects PPE violations, safety hazards, and compliance issues.
    """
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted.")

    image_bytes = await image.read()

    fallback = SafetyInspectionResponse(
        overall_safety_score=50,
        compliance_status="Inspection Required",
        violations=[],
        immediate_actions_required=["Conduct manual safety inspection"],
    )

    system_prompt = """You are a certified construction safety inspector with expertise in Indian safety regulations.
Analyze construction site images for safety compliance per:
- The Factories Act 1948
- Building & Other Construction Workers Act 1996
- IS 4130 Safety Requirements
- OSHA guidelines adapted for Indian context
Be thorough, precise, and conservative in safety assessments."""

    user_prompt = f"""Inspect this {site_type} construction site image for safety compliance.
Identify:
1. PPE compliance (helmets, safety vests, gloves, safety boots)
2. Safety violations and their severity
3. Structural or environmental hazards
4. Regulatory compliance issues
5. Corrective actions required
6. Estimated penalties for violations in INR
Score overall safety from 0 (critical danger) to 100 (fully compliant)."""

    result = service.analyze_image_with_text(
        image_bytes=image_bytes,
        image_type=image.content_type,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        schema=SafetyInspectionResponse,
        fallback=fallback,
    )
    return result


# ─────────────────── 4. Progress Monitoring ──────────────────────

class ProgressRequest(BaseModel):
    project_name: str = "Construction Project"
    start_date: str = "2024-01-01"
    planned_end_date: str = "2024-12-31"
    total_budget_inr: float = 10000000.0
    spent_so_far_inr: float = 5000000.0
    current_phase: str = "Structure"
    completed_phases: list[str] = []
    notes: Optional[str] = None


@app.post("/api/progress-monitoring", response_model=ProgressMonitoringResponse, tags=["Monitoring"])
async def monitor_progress(
    request: ProgressRequest,
    service: GroqAIService = Depends(get_ai_service),
):
    """
    AI-driven project progress monitoring and schedule analysis.
    """
    fallback = ProgressMonitoringResponse(
        overall_progress_percent=50.0,
        budget_utilized_inr=request.spent_so_far_inr,
        budget_remaining_inr=request.total_budget_inr - request.spent_so_far_inr,
    )

    system_prompt = """You are an expert construction project manager and schedule analyst.
Analyze project progress data and provide accurate assessment of:
- Schedule adherence and variance
- Budget utilization efficiency  
- Phase-by-phase progress evaluation
- Critical path analysis
- Resource optimization recommendations
Use Earned Value Management (EVM) principles where applicable."""

    user_prompt = f"""Analyze construction project progress:
- Project: {request.project_name}
- Start Date: {request.start_date}
- Planned End Date: {request.planned_end_date}
- Total Budget: ₹{request.total_budget_inr:,.0f}
- Spent So Far: ₹{request.spent_so_far_inr:,.0f}
- Current Phase: {request.current_phase}
- Completed Phases: {', '.join(request.completed_phases) or 'None'}
{f'- Notes: {request.notes}' if request.notes else ''}

Provide detailed progress analysis including phase completion percentages, schedule variance, 
budget tracking, and projected completion date. All amounts in INR."""

    result = service.query_text(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        schema=ProgressMonitoringResponse,
        fallback=fallback,
    )
    return result


# ─────────────────── 5. Material Analysis ────────────────────────

class MaterialRequest(BaseModel):
    project_type: str = "Residential"
    built_up_area_sqft: float = 1000.0
    location: str = "Bengaluru, Karnataka"
    quality_grade: str = "Standard"
    construction_type: str = "RCC Frame Structure"
    special_materials: Optional[str] = None


@app.post("/api/material-analysis", response_model=MaterialAnalysisResponse, tags=["Materials"])
async def analyze_materials(
    request: MaterialRequest,
    service: GroqAIService = Depends(get_ai_service),
):
    """
    AI-powered material requirement analysis and cost optimization.
    Returns BOQ (Bill of Quantities) with current market prices in INR.
    """
    fallback = MaterialAnalysisResponse(
        project_description=f"{request.project_type} - {request.built_up_area_sqft} sq.ft",
        total_material_cost_inr=request.built_up_area_sqft * 1500,
    )

    system_prompt = """You are an expert construction materials analyst and procurement specialist.
Generate accurate Bill of Quantities (BOQ) using current Indian market prices (2024-2025).
Consider regional price variations, wastage factors, and bulk purchase opportunities.
All prices must be in Indian Rupees (₹/INR)."""

    user_prompt = f"""Generate comprehensive material analysis and BOQ for:
- Project Type: {request.project_type}
- Built-up Area: {request.built_up_area_sqft} sq.ft
- Location: {request.location}
- Quality Grade: {request.quality_grade}
- Construction Type: {request.construction_type}
{f'- Special Materials: {request.special_materials}' if request.special_materials else ''}

Include: cement, steel, aggregates, sand, bricks, tiles, waterproofing, paint, electrical materials, 
plumbing materials. Provide current market rates in ₹ (INR) with supplier recommendations and quality grades."""

    result = service.query_text(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        schema=MaterialAnalysisResponse,
        fallback=fallback,
    )
    return result


# ─────────────────── 6. Project Report Generation ────────────────

class ReportRequest(BaseModel):
    project_name: str
    project_type: str = "Residential"
    location: str
    start_date: str
    planned_end_date: str
    total_budget_inr: float
    spent_inr: float
    current_progress_percent: float
    current_phase: str
    team_size: int = 50
    key_issues: Optional[str] = None
    achievements: Optional[str] = None


@app.post("/api/project-report", response_model=ProjectReportResponse, tags=["Reports"])
async def generate_report(
    request: ReportRequest,
    service: GroqAIService = Depends(get_ai_service),
):
    """
    Generate comprehensive AI-powered project status report.
    """
    fallback = ProjectReportResponse(
        project_name=request.project_name,
        executive_summary=f"Project {request.project_name} is currently at {request.current_progress_percent:.0f}% completion.",
        financial_summary={
            "total_budget_inr": request.total_budget_inr,
            "spent_inr": request.spent_inr,
            "remaining_inr": request.total_budget_inr - request.spent_inr,
            "projected_overrun_inr": 0.0,
        }
    )

    system_prompt = """You are a senior construction project manager generating executive-level project reports.
Produce comprehensive, professional reports that provide actionable insights for:
- Project owners and investors
- Site engineers and contractors
- Regulatory and compliance teams
Use EVM, KPI frameworks, and Indian construction industry standards."""

    user_prompt = f"""Generate a comprehensive project status report for:
- Project Name: {request.project_name}
- Type: {request.project_type} at {request.location}
- Timeline: {request.start_date} to {request.planned_end_date}
- Budget: ₹{request.total_budget_inr:,.0f} | Spent: ₹{request.spent_inr:,.0f}
- Progress: {request.current_progress_percent}% | Phase: {request.current_phase}
- Team Size: {request.team_size} workers
{f'- Key Issues: {request.key_issues}' if request.key_issues else ''}
{f'- Achievements: {request.achievements}' if request.achievements else ''}

Generate executive summary, KPIs, milestone status, financial summary, risk register, and action items.
All financial figures in Indian Rupees (₹)."""

    result = service.query_text(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        schema=ProjectReportResponse,
        fallback=fallback,
    )
    return result


# ─────────────────── 7. AI Chat Assistant ────────────────────────

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None


@app.post("/api/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_with_ai(
    request: ChatRequest,
    service: GroqAIService = Depends(get_ai_service),
):
    """
    AI construction expert chat assistant.
    Answers queries about construction, costs (INR), safety, materials, and regulations.
    """
    fallback = ChatResponse(
        answer="I apologize, I'm unable to process your query at this time. Please try again or contact support.",
        follow_up_suggestions=[
            "What are the safety requirements for a construction site?",
            "How much does it cost to build a 2BHK apartment in Mumbai?",
            "What is the standard concrete mix ratio?"
        ]
    )

    system_prompt = """You are ConstructAI, an expert AI assistant specialized in Indian construction industry.
You have deep knowledge of:
- Indian construction standards (IS codes, BIS standards)
- Building bylaws and local authority regulations
- Material costs and market prices in INR (₹)
- Safety regulations (Factories Act, BOCW Act)
- Project management (PERT, CPM, EVM)
- Structural engineering and architecture
- Environmental and sustainability aspects

Always provide practical, actionable advice. Quote prices in Indian Rupees (₹).
Be concise but comprehensive. Reference relevant IS codes and regulations when applicable."""

    user_prompt = f"""{request.message}
{f'Context: {request.context}' if request.context else ''}"""

    result = service.chat_query(
        system_prompt=system_prompt,
        user_message=user_prompt,
        schema=ChatResponse,
        fallback=fallback,
    )
    return result


# ─────────────────── 8. Image-based Progress (Multimodal) ─────────

@app.post("/api/visual-progress", response_model=ProgressMonitoringResponse, tags=["Monitoring"])
async def visual_progress_analysis(
    image: UploadFile = File(...),
    project_name: str = Form(default="Construction Project"),
    total_budget_inr: float = Form(default=10000000.0),
    service: GroqAIService = Depends(get_ai_service),
):
    """
    Analyze construction progress from an image using multimodal AI.
    """
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted.")

    image_bytes = await image.read()

    fallback = ProgressMonitoringResponse(
        overall_progress_percent=50.0,
        key_observations=["Unable to analyze image. Please try again."],
    )

    system_prompt = """You are an expert construction progress analyst using computer vision.
Analyze construction site images to determine:
- Overall construction progress percentage
- Visible construction phases and their completion
- Resource utilization (workers, equipment)
- Quality observations
- Schedule adherence indicators
Be precise and conservative in progress estimates."""

    user_prompt = f"""Analyze this construction site image for project: {project_name}
Total project budget: ₹{total_budget_inr:,.0f}

Estimate:
1. Overall progress percentage (0-100%)
2. Which construction phases are visible and their completion
3. Number of visible workers and equipment
4. Quality observations
5. Projected completion based on visible progress
6. Budget utilization estimate in ₹"""

    result = service.analyze_image_with_text(
        image_bytes=image_bytes,
        image_type=image.content_type,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        schema=ProgressMonitoringResponse,
        fallback=fallback,
    )
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
