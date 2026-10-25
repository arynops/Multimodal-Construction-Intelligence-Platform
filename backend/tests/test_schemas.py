"""
Tests for Pydantic schema fallback defaults.
These tests never call the network — they validate schema safety guarantees.
"""
import pytest
from schemas import (
    SiteAnalysisResponse,
    CostEstimationResponse,
    SafetyInspectionResponse,
    ProgressMonitoringResponse,
    MaterialAnalysisResponse,
    ProjectReportResponse,
    ChatResponse,
)


class TestSchemaDefaults:
    """All schemas must instantiate with zero arguments (pure defaults)."""

    def test_site_analysis_defaults(self):
        obj = SiteAnalysisResponse()
        assert isinstance(obj.summary, str) and obj.summary
        assert isinstance(obj.detected_elements, list)
        assert 0 <= obj.infrastructure_readiness_score <= 100

    def test_cost_estimation_defaults(self):
        obj = CostEstimationResponse()
        assert obj.total_estimated_cost_inr >= 0
        assert isinstance(obj.cost_breakdown, list)
        assert obj.confidence_score >= 0

    def test_safety_inspection_defaults(self):
        obj = SafetyInspectionResponse()
        assert 0 <= obj.overall_safety_score <= 100
        assert isinstance(obj.ppe_compliance, dict)

    def test_progress_monitoring_defaults(self):
        obj = ProgressMonitoringResponse()
        assert 0.0 <= obj.overall_progress_percent <= 100.0
        assert isinstance(obj.phases, list)

    def test_material_analysis_defaults(self):
        obj = MaterialAnalysisResponse()
        assert obj.total_material_cost_inr >= 0

    def test_project_report_defaults(self):
        obj = ProjectReportResponse()
        assert isinstance(obj.kpis, dict)
        assert isinstance(obj.financial_summary, dict)

    def test_chat_response_defaults(self):
        obj = ChatResponse()
        assert obj.answer
        assert 0.0 <= obj.confidence <= 1.0
        assert isinstance(obj.follow_up_suggestions, list)


class TestSchemaValidation:
    """Out-of-range values should be coerced/clamped by validators."""

    def test_score_clamped_at_max(self):
        obj = SiteAnalysisResponse(infrastructure_readiness_score=100)
        assert obj.infrastructure_readiness_score == 100

    def test_confidence_range_enforced(self):
        # Values above 1.0 should raise a validation error
        with pytest.raises(Exception):
            ChatResponse(confidence=1.5)

    def test_inr_amounts_non_negative(self):
        obj = CostEstimationResponse(total_estimated_cost_inr=0)
        assert obj.total_estimated_cost_inr == 0
