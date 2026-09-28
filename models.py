from datetime import datetime

from sqlalchemy import JSON, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class JsonEntity(Base):
    __abstract__ = True
    id: Mapped[str] = mapped_column(String(160), primary_key=True)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)


class Complaint(JsonEntity):
    __tablename__ = "complaints"


class Policy(JsonEntity):
    __tablename__ = "policies"


class RuleMatrix(JsonEntity):
    __tablename__ = "rule_matrix"


class RegisteredUser(JsonEntity):
    __tablename__ = "registered_users"
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False, default="")


class PromptTemplate(JsonEntity):
    __tablename__ = "prompt_templates"


class ActiveSession(Base):
    __tablename__ = "active_sessions"

    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
