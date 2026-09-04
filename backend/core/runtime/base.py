"""
Ñkyel AI — Unified Agent Runtime Abstraction · SmartANDJ AI Technologies
Defines the canonical AgentRuntime interface supported by both:
1. NkyelGraphRuntime (Native LangGraph StateGraph)
2. DeerFlowRuntime (DeerFlow 2.0 Complete Engine)

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any, List, Optional
from dataclasses import dataclass, field
import enum
import time


class RuntimeEventType(str, enum.Enum):
    RUN_STARTED = "RUN_STARTED"
    STEP_STARTED = "STEP_STARTED"
    TOOL_CALL_START = "TOOL_CALL_START"
    TOOL_CALL_RESULT = "TOOL_CALL_RESULT"
    STATE_DELTA = "STATE_DELTA"
    STEP_FINISHED = "STEP_FINISHED"
    RUN_FINISHED = "RUN_FINISHED"
    RUN_ERROR = "RUN_ERROR"


@dataclass
class RuntimeEvent:
    type: RuntimeEventType
    mission_id: str
    run_id: str
    payload: Dict[str, Any] = field(default_factory=dict)
    task_id: Optional[str] = None
    agent_id: Optional[str] = None
    tool_call_id: Optional[str] = None
    source_id: Optional[str] = None
    artifact_id: Optional[str] = None
    timestamp: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": self.type.value,
            "mission_id": self.mission_id,
            "run_id": self.run_id,
            "payload": self.payload,
            "task_id": self.task_id,
            "agent_id": self.agent_id,
            "tool_call_id": self.tool_call_id,
            "source_id": self.source_id,
            "artifact_id": self.artifact_id,
            "timestamp": self.timestamp,
        }


@dataclass
class RunResult:
    success: bool
    mission_id: str
    run_id: str
    runtime_type: str
    content: str
    artifacts: List[Dict[str, Any]] = field(default_factory=list)
    sources: List[Dict[str, Any]] = field(default_factory=list)
    evidence: List[Dict[str, Any]] = field(default_factory=list)
    duration_ms: int = 0
    error: Optional[str] = None


@dataclass
class RuntimeCapabilities:
    name: str
    version: str
    supports_skills: bool
    supports_mcp: bool
    supports_subagents: bool
    supports_sandbox: bool
    supports_browser: bool
    supports_search: bool
    supports_streaming: bool
    supports_artifacts: bool
    available_tools: List[str] = field(default_factory=list)


class AgentRuntime(ABC):
    """Abstract interface for all Ñkyel agent execution runtimes."""

    @abstractmethod
    async def run(
        self,
        mission_id: str,
        goal: str,
        context: Optional[str] = None,
        model: Optional[str] = None,
        user_id: Optional[str] = None,
        **kwargs: Any,
    ) -> RunResult:
        """Executes a mission synchronously or until completion."""
        ...

    @abstractmethod
    async def stream(
        self,
        mission_id: str,
        goal: str,
        context: Optional[str] = None,
        model: Optional[str] = None,
        user_id: Optional[str] = None,
        **kwargs: Any,
    ) -> AsyncGenerator[RuntimeEvent, None]:
        """Streams real-time events through the unified event spine."""
        yield ... # type: ignore

    @abstractmethod
    async def cancel(self, run_id: str) -> bool:
        """Cancels an active execution run."""
        ...

    @abstractmethod
    async def resume(self, run_id: str, checkpoint_id: str) -> AsyncGenerator[RuntimeEvent, None]:
        """Resumes an execution from a stored checkpoint."""
        yield ... # type: ignore

    @abstractmethod
    async def get_state(self, run_id: str) -> Dict[str, Any]:
        """Retrieves runtime state for a given run."""
        ...

    @abstractmethod
    def get_tools(self) -> List[Dict[str, Any]]:
        """Returns the list of tools available in this runtime."""
        ...

    @abstractmethod
    def get_capabilities(self) -> RuntimeCapabilities:
        """Returns the capabilities profile of this runtime."""
        ...

    @abstractmethod
    async def health(self) -> Dict[str, Any]:
        """Returns health and readiness status."""
        ...
