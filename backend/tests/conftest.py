"""
Pytest configuration and shared fixtures for the ConstructAI backend.
"""
import pytest
from fastapi.testclient import TestClient

# Import must succeed before any test runs — validates module structure
from main import app;


@pytest.fixture(scope="session")
def client() -> TestClient:
    """
    Synchronous HTTPX test client wrapping the FastAPI app.
    Session-scoped so the lifespan runs only once per test run.
    """
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
