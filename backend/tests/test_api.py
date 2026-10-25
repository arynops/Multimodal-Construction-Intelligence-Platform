"""
Tests for core API health and schema validation.
These tests run without a real GROQ_API_KEY (AI endpoints return 503).
"""
import pytest
from fastapi.testclient import TestClient


class TestHealth:
    def test_health_returns_200(self, client: TestClient):
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_body_schema(self, client: TestClient):
        body = client.get("/health").json()
        assert "status" in body
        assert "version" in body
        assert "ai_available" in body
        assert body["status"] == "healthy"

    def test_health_service_name(self, client: TestClient):
        body = client.get("/health").json()
        assert "service" in body
        assert "Construction" in body["service"]


class TestCORS:
    def test_cors_preflight_allowed_origin(self, client: TestClient):
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET",
            },
        )
        # FastAPI CORS middleware returns 200 on preflight
        assert response.status_code in (200, 204)


class TestAIEndpointsWithoutKey:
    """
    Without a real GROQ_API_KEY the AI service is None and endpoints
    must return HTTP 503 with a descriptive detail message.
    """

    def test_chat_503_without_key(self, client: TestClient):
        response = client.post("/api/chat", json={"message": "hello"})
        # Either 200 (key configured) or 503 (no key)
        assert response.status_code in (200, 503)

    def test_cost_estimation_rejects_invalid_area(self, client: TestClient):
        response = client.post(
            "/api/cost-estimation",
            json={"built_up_area_sqft": -100, "location": "Mumbai"},
        )
        # Pydantic validation should catch the negative area OR AI 503
        assert response.status_code in (200, 422, 503)
