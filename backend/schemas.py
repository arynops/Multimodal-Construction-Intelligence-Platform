"""
Pydantic schemas for AI response validation with fallback defaults.
All financial values are in Indian Rupees (INR/₹).
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ─────────────────────────── Shared ────────────────────────────

class RiskItem(BaseModel):
    severity: str = Field(default="low", description="low | medium | high | critical")
    description: str = Field(default="No risk identified")
    mitigation: str = Field(default="Monitor situation")


class CostItem(BaseModel):
    label: str = Field(default="Item")
    amount_inr: float = Field(default=0.0, description="Amount in Indian Rupees")
    unit: str = Field(default="LS")
    quantity: float = Field(default=1.0)


# ─────────────────── Site Analysis (Image) ──────────────────────

class SiteAnalysisResponse(BaseModel):
    summary: str = Field(default="Site analysis complete.")
    site_condition: str = Field(default="Unknown")
    detected_elements: List[str] = Field(default_factory=lambda: ["Site boundary"])
    safety_concerns: List[str] = Field(default_factory=list)
    recommended_actions: List[str] = Field(default_factory=lambda: ["Review site conditions"])
    risk_level: str = Field(default="medium")
    estimated_site_area_sqft: Optional[float] = Field(default=None)
    infrastructure_readiness_score: int = Field(default=50, ge=0, le=100)
    risks: List[RiskItem] = Field(default_factory=list)


# ─────────────────── Cost Estimation ─────────────────────────────

class CostEstimationResponse(BaseModel):
    project_name: str = Field(default="Construction Project")
    project_type: str = Field(default="Residential")
    total_estimated_cost_inr: float = Field(default=5000000.0)
    cost_breakdown: List[CostItem] = Field(default_factory=lambda: [
        CostItem(label="Civil Work", amount_inr=2000000.0, unit="LS", quantity=1),
        CostItem(label="Finishing", amount_inr=1500000.0, unit="LS", quantity=1),
        CostItem(label="MEP Services", amount_inr=1000000.0, unit="LS", quantity=1),
        CostItem(label="Contingency", amount_inr=500000.0, unit="LS", quantity=1),
    ])
    cost_per_sqft_inr: float = Field(default=2500.0)
    timeline_months: int = Field(default=12)
    risks: List[RiskItem] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=lambda: ["Hire qualified contractors"])
    confidence_score: int = Field(default=70, ge=0, le=100)


# ─────────────────── Safety Inspection ──────────────────────────

class SafetyViolation(BaseModel):
    violation_type: str = Field(default="General Safety")
    location_in_image: str = Field(default="Site area")
    severity: str = Field(default="medium")
    corrective_action: str = Field(default="Address immediately")
    regulatory_reference: str = Field(default="IS: 4130")


class SafetyInspectionResponse(BaseModel):
    overall_safety_score: int = Field(default=70, ge=0, le=100)
    compliance_status: str = Field(default="Partially Compliant")
    violations: List[SafetyViolation] = Field(default_factory=list)
    ppe_compliance: Dict[str, bool] = Field(default_factory=lambda: {
        "helmet": False,
        "safety_vest": False,
        "gloves": False,
        "safety_boots": False,
    })
    immediate_actions_required: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=lambda: ["Conduct safety briefing"])
    estimated_penalty_inr: float = Field(default=0.0)
    next_inspection_date: str = Field(default="Within 7 days")


# ─────────────────── Progress Monitoring ─────────────────────────

class PhaseProgress(BaseModel):
    phase_name: str = Field(default="Foundation")
    planned_percent: float = Field(default=100.0)
    actual_percent: float = Field(default=0.0)
    status: str = Field(default="pending")
    delay_days: int = Field(default=0)


class ProgressMonitoringResponse(BaseModel):
    overall_progress_percent: float = Field(default=0.0)
    schedule_variance_days: int = Field(default=0)
    phases: List[PhaseProgress] = Field(default_factory=lambda: [
        PhaseProgress(phase_name="Site Preparation", planned_percent=100, actual_percent=100, status="completed"),
        PhaseProgress(phase_name="Foundation", planned_percent=100, actual_percent=80, status="in_progress"),
        PhaseProgress(phase_name="Structure", planned_percent=50, actual_percent=30, status="in_progress"),
        PhaseProgress(phase_name="MEP", planned_percent=0, actual_percent=0, status="pending"),
        PhaseProgress(phase_name="Finishing", planned_percent=0, actual_percent=0, status="pending"),
    ])
    resource_utilization_percent: float = Field(default=75.0)
    budget_utilized_inr: float = Field(default=0.0)
    budget_remaining_inr: float = Field(default=0.0)
    key_observations: List[str] = Field(default_factory=lambda: ["Review site conditions"])
    recommendations: List[str] = Field(default_factory=lambda: ["Maintain current pace"])
    projected_completion_date: str = Field(default="To be determined")


# ─────────────────── Material Analysis ──────────────────────────

class MaterialItem(BaseModel):
    name: str = Field(default="Cement")
    quantity_required: float = Field(default=100.0)
    unit: str = Field(default="bags")
    unit_cost_inr: float = Field(default=400.0)
    total_cost_inr: float = Field(default=40000.0)
    supplier_recommendation: str = Field(default="Local supplier")
    quality_grade: str = Field(default="Standard")


class MaterialAnalysisResponse(BaseModel):
    project_description: str = Field(default="Construction project")
    total_material_cost_inr: float = Field(default=1000000.0)
    materials: List[MaterialItem] = Field(default_factory=list)
    wastage_factor_percent: float = Field(default=10.0)
    procurement_timeline_days: int = Field(default=30)
    recommendations: List[str] = Field(default_factory=lambda: ["Source materials locally"])
    cost_optimization_tips: List[str] = Field(default_factory=lambda: ["Bulk purchase for discounts"])


# ─────────────────── Project Report ─────────────────────────────

class MilestoneItem(BaseModel):
    name: str = Field(default="Project Start")
    planned_date: str = Field(default="TBD")
    actual_date: Optional[str] = Field(default=None)
    status: str = Field(default="pending")


class ProjectReportResponse(BaseModel):
    project_name: str = Field(default="Construction Project")
    report_date: str = Field(default="Today")
    executive_summary: str = Field(default="Project is progressing as planned.")
    overall_health: str = Field(default="On Track")
    kpis: Dict[str, Any] = Field(default_factory=lambda: {
        "budget_utilization": "75%",
        "schedule_adherence": "85%",
        "quality_score": "80%",
        "safety_score": "90%",
    })
    milestones: List[MilestoneItem] = Field(default_factory=list)
    financial_summary: Dict[str, float] = Field(default_factory=lambda: {
        "total_budget_inr": 10000000.0,
        "spent_inr": 7500000.0,
        "remaining_inr": 2500000.0,
        "projected_overrun_inr": 0.0,
    })
    risks: List[RiskItem] = Field(default_factory=list)
    action_items: List[str] = Field(default_factory=lambda: ["Review project timeline"])
    next_steps: List[str] = Field(default_factory=lambda: ["Schedule team meeting"])


# ─────────────────── Chat / General Query ───────────────────────

class ChatResponse(BaseModel):
    answer: str = Field(default="I apologize, I was unable to process your query. Please try again.")
    follow_up_suggestions: List[str] = Field(default_factory=lambda: [
        "Tell me about site safety requirements",
        "What is the cost estimate for my project?",
        "Analyze my site condition"
    ])
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    data_points: List[str] = Field(default_factory=list)
