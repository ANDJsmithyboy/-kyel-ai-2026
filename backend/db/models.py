"""
Ñkyel AI — Modèles de base de données · SmartANDJ AI Technologies
Architecture Souveraine de Données :
- Neon PostgreSQL : Utilisateurs, Conversations, Messages, Checkpoints, Mémoires DeerMem, Événements WorkGraph, Métadonnées Artefacts, RAG pgvector
- Cloudflare R2 : Fichiers sources, images, vidéos, audio, documents binaires, sauvegardes

Fondateur : Daniel Jonathan ANDJ
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List
import enum

from sqlalchemy import (
    String,
    Text,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
    Index,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
)
from sqlalchemy.dialects.postgresql import UUID


# ── Base déclarative ─────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Enums ────────────────────────────────────────────────────
class UserRole(str, enum.Enum):
    admin = "admin"
    pro = "pro"
    free = "free"
    pending = "pending"


class NkyelMode(str, enum.Enum):
    flash = "flash"
    pro = "pro"
    black_panther = "black-panther"


class MessageRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class Language(str, enum.Enum):
    fr = "fr"
    fang = "fang"
    mpongwe = "mpongwe"
    punu = "punu"


class MediaJobStatus(str, enum.Enum):
    queued = "queued"
    in_progress = "in_progress"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class MediaJobType(str, enum.Enum):
    image_fast = "image_fast"
    image_edit = "image_edit"
    video_t2v = "video_t2v"
    video_i2v = "video_i2v"
    social_video = "social_video"
    stock_search = "stock_search"
    communication_kit = "communication_kit"
    audio_tts = "audio_tts"


def generate_uuid() -> uuid.UUID:
    return uuid.uuid4()


# ── 1. Modèle User (app_users / users) ───────────────────────
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=generate_uuid
    )
    clerk_sub: Mapped[Optional[str]] = mapped_column(
        String(255), unique=True, nullable=True, index=True
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(512), nullable=False, default="")
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole), default=UserRole.free, nullable=False
    )
    preferred_language: Mapped[Language] = mapped_column(
        SAEnum(Language), default=Language.fr, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relations
    conversations: Mapped[List["Conversation"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    agent_memories: Mapped[List["AgentMemory"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    media_jobs: Mapped[List["MediaJob"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    artifacts: Mapped[List["Artifact"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


# ── 2. Modèle Conversation & Thread ──────────────────────────
class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(
        String(512), default="Nouvelle conversation"
    )
    mode: Mapped[NkyelMode] = mapped_column(
        SAEnum(NkyelMode), default=NkyelMode.flash, nullable=False
    )
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relations
    user: Mapped["User"] = relationship(back_populates="conversations")
    messages: Mapped[List["Message"]] = relationship(
        back_populates="conversation", cascade="all, delete-orphan",
        order_by="Message.created_at"
    )
    thread_metadata: Mapped[Optional["ThreadMetadata"]] = relationship(
        back_populates="conversation", cascade="all, delete-orphan", uselist=False
    )

    __table_args__ = (
        Index("ix_conversations_user_id", "user_id"),
        Index("ix_conversations_updated_at", "updated_at"),
    )


# ── 3. Modèle ThreadMetadata (Branches & Checkpoints LangGraph) 
class ThreadMetadata(Base):
    __tablename__ = "thread_metadata"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=generate_uuid
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    active_branch: Mapped[str] = mapped_column(String(128), default="main")
    checkpoint_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    extra_state: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    conversation: Mapped["Conversation"] = relationship(back_populates="thread_metadata")


# ── 4. Modèle Message ────────────────────────────────────────
class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=generate_uuid
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
    )
    role: Mapped[MessageRole] = mapped_column(
        SAEnum(MessageRole), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    mode: Mapped[NkyelMode] = mapped_column(
        SAEnum(NkyelMode), nullable=False
    )
    language: Mapped[Optional[Language]] = mapped_column(
        SAEnum(Language), nullable=True
    )
    tokens: Mapped[int] = mapped_column(Integer, default=0)
    web_search_used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relations
    conversation: Mapped["Conversation"] = relationship(back_populates="messages")

    __table_args__ = (
        Index("ix_messages_conversation_id", "conversation_id"),
        Index("ix_messages_created_at", "created_at"),
    )


# ── 5. Modèle Document & Chunks (RAG pgvector sur Neon) ───────
class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=generate_uuid
    )
    filename: Mapped[str] = mapped_column(String(512), nullable=False)
    collection: Mapped[str] = mapped_column(
        String(255), default="general", nullable=False
    )
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, default=0)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    embedding_model: Mapped[str] = mapped_column(
        String(255), default="all-MiniLM-L6-v2"
    )
    r2_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    r2_key: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    uploaded_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    chunks: Mapped[List["DocumentChunk"]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_documents_collection", "collection"),
        Index("ix_documents_user", "uploaded_by"),
    )


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=generate_uuid
    )
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON or pgvector string
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    document: Mapped["Document"] = relationship(back_populates="chunks")

    __table_args__ = (
        Index("ix_doc_chunks_doc_idx", "document_id", "chunk_index"),
    )


# ── 6. Modèle Artifact (Métadonnées Artefacts dans Neon) ───────
class Artifact(Base):
    """Métadonnées permanentes des artefacts générés (Images, Vidéos, Audio, HTML, Code)."""
    __tablename__ = "artifacts"

    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    artifact_type: Mapped[str] = mapped_column(String(64), nullable=False)  # image, video, audio, code, html, document
    url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Cloudflare R2 / CDN URL
    r2_key: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship(back_populates="artifacts")

    __table_args__ = (
        Index("ix_artifacts_user_type", "user_id", "artifact_type"),
        Index("ix_artifacts_user_created", "user_id", "created_at"),
    )


# ── 7. Modèle AgentMemory (DeerMem sur Neon) ───────────────────
class AgentMemory(Base):
    """
    Mémoire longue durée et cloisonnée des agents dans Neon.
    Espaces :
    - user/{user_id}/global
    - user/{user_id}/agents/visual-director
    - user/{user_id}/agents/video-producer
    - user/{user_id}/projects/{project_id}
    """
    __tablename__ = "agent_memories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    namespace: Mapped[str] = mapped_column(String(512), nullable=False)
    key: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship(back_populates="agent_memories")

    __table_args__ = (
        Index("ix_agent_memories_lookup", "user_id", "namespace", "key"),
        Index("ix_agent_memories_ns", "namespace"),
    )


# ── 8. Modèle WorkGraphEventRecord (VIE Canvas dans Neon) ──────
class WorkGraphEventRecord(Base):
    """Événements WorkGraph réels persistés dans Neon pour replay et inspection."""
    __tablename__ = "workgraph_events"

    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    run_id: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    job_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)
    user_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)
    event_type: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    payload: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )



# ── 9. Modèle MediaJob (Files & Quotas dans Neon) ──────────────
class MediaJob(Base):
    """Tâche de génération multimédia souveraine persistée dans Neon."""
    __tablename__ = "media_jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    clerk_sub: Mapped[str] = mapped_column(String(255), nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(255), nullable=False)
    job_type: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default=MediaJobStatus.queued.value, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=0)
    progress_pct: Mapped[int] = mapped_column(Integer, default=0)
    stage_label: Mapped[str] = mapped_column(String(255), default="En attente")
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    params: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    provider_used: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    model_used: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    result_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    result_meta: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    artifact_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship(back_populates="media_jobs")

    __table_args__ = (
        Index("ix_media_jobs_user_created", "user_id", "created_at"),
        Index("ix_media_jobs_clerk_sub", "clerk_sub"),
        Index("ix_media_jobs_idempotency", "user_id", "idempotency_key"),
    )


# ── 10. Modèle Feedback ──────────────────────────────────────
class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    message_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("messages.id", ondelete="SET NULL"), nullable=True
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )



# ── 11. Modèle ApiKey ────────────────────────────────────────
class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    key_hash: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), default="default")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_used_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


# ── 12. Modèle BetaCampaign ──────────────────────────────────
class BetaCampaign(Base):
    __tablename__ = "beta_campaigns"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=generate_uuid
    )
    slug: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    public_ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    max_seats: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    claimed_seats: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    feedback_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    forced_state: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    enrollments: Mapped[List["BetaEnrollment"]] = relationship(
        back_populates="campaign", cascade="all, delete-orphan"
    )


# ── 13. Modèle BetaEnrollment (100 Places Max) ────────────────
class BetaEnrollment(Base):
    __tablename__ = "beta_enrollments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=generate_uuid
    )
    campaign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("beta_campaigns.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    clerk_user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    seat_number: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="enrolled", nullable=False)  # enrolled, active, completed, waitlist
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    first_task_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_activity_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    feedback_completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    terms_version: Mapped[str] = mapped_column(String(32), default="1.0", nullable=False)
    locale: Mapped[str] = mapped_column(String(16), default="fr", nullable=False)
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    campaign: Mapped["BetaCampaign"] = relationship(back_populates="enrollments")

    __table_args__ = (
        Index("ix_beta_enrollments_campaign_seat", "campaign_id", "seat_number", unique=True),
        Index("ix_beta_enrollments_campaign_user", "campaign_id", "user_id", unique=True),
    )


# ── 14. Modèle BetaEvent ──────────────────────────────────────
class BetaEvent(Base):
    __tablename__ = "beta_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=generate_uuid
    )
    idempotency_key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    campaign_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("beta_campaigns.id", ondelete="SET NULL"), nullable=True, index=True
    )
    enrollment_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("beta_enrollments.id", ondelete="SET NULL"), nullable=True, index=True
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    event_name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    thread_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    run_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )


# ── 15. Modèle BetaFeedbackRecord ─────────────────────────────
class BetaFeedbackRecord(Base):
    __tablename__ = "beta_feedback_records"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=generate_uuid
    )
    campaign_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("beta_campaigns.id", ondelete="CASCADE"), nullable=True
    )
    enrollment_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("beta_enrollments.id", ondelete="CASCADE"), nullable=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    clerk_user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    overall_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    goal_attempted: Mapped[str] = mapped_column(Text, nullable=False)
    task_succeeded: Mapped[bool] = mapped_column(Boolean, nullable=False)
    favorite_feature: Mapped[str] = mapped_column(String(255), nullable=False)
    issues_encountered: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    priority_improvement: Mapped[str] = mapped_column(Text, nullable=False)
    likely_to_reuse: Mapped[int] = mapped_column(Integer, nullable=False)
    nps_score: Mapped[int] = mapped_column(Integer, nullable=False)
    willingness_to_pay: Mapped[str] = mapped_column(String(64), nullable=False)
    price_bracket: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    african_context_interest: Mapped[str] = mapped_column(Text, nullable=False)
    locale_used: Mapped[str] = mapped_column(String(16), default="fr", nullable=False)
    quote_consent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

