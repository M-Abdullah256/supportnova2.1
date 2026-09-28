import hashlib
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import database
import main
from ai_pipeline import run_ai_pipeline
from models import ActiveSession


@pytest.fixture
def client_factory(tmp_path, monkeypatch):
    engine = create_engine(
        f"sqlite:///{tmp_path / 'sessions.db'}",
        connect_args={"check_same_thread": False},
    )
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    monkeypatch.setattr(database, "engine", engine)
    monkeypatch.setattr(database, "SessionLocal", session_factory)
    monkeypatch.setattr(main, "SessionLocal", session_factory)
    yield lambda: TestClient(main.app)
    engine.dispose()


def log_in(client: TestClient) -> str:
    response = client.post("/api/auth/login", json={"role": "Agent"})
    assert response.status_code == 200
    return response.json()["token"]


def test_session_survives_app_restart(client_factory):
    with client_factory() as client:
        token = log_in(client)
        assert client.get(
            "/api/complaints", headers={"Authorization": f"Bearer {token}"}
        ).status_code == 200

    with client_factory() as restarted_client:
        assert restarted_client.get(
            "/api/complaints", headers={"Authorization": f"Bearer {token}"}
        ).status_code == 200


def test_garbage_token_is_unauthorized(client_factory):
    with client_factory() as client:
        assert client.get(
            "/api/complaints", headers={"Authorization": "Bearer garbage"}
        ).status_code == 401


def test_logout_invalidates_session(client_factory):
    with client_factory() as client:
        token = log_in(client)
        assert client.post(
            "/api/auth/logout", headers={"Authorization": f"Bearer {token}"}
        ).status_code == 200
        assert client.get(
            "/api/complaints", headers={"Authorization": f"Bearer {token}"}
        ).status_code == 401


def test_expired_session_is_rejected_and_deleted(client_factory, tmp_path):
    with client_factory() as client:
        token = log_in(client)
        session_factory = main.SessionLocal
        db = session_factory()
        try:
            row = db.get(ActiveSession, hashlib.sha256(token.encode()).hexdigest())
            assert row is not None
            row.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
            db.commit()
        finally:
            db.close()

        assert client.get(
            "/api/complaints", headers={"Authorization": f"Bearer {token}"}
        ).status_code == 401
        db = session_factory()
        try:
            assert db.get(ActiveSession, hashlib.sha256(token.encode()).hexdigest()) is None
        finally:
            db.close()


def test_empty_key_is_filled_from_env_file_and_whitespace_is_missing(tmp_path, monkeypatch):
    env_file = tmp_path / ".env"
    env_file.write_text("GEMINI_API_KEY=from-env-file\n", encoding="utf-8")
    monkeypatch.setenv("GEMINI_API_KEY", "")
    main._load_environment(env_file)
    assert main.os.getenv("GEMINI_API_KEY") == "from-env-file"

    monkeypatch.setenv("GEMINI_API_KEY", "   ")
    assert run_ai_pipeline({"title": "Test"}, [])["errorCode"] == "GENAI_API_KEY_MISSING"
