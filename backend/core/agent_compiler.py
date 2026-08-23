"""
Ñkyel AI — Agent Compiler · SmartANDJ AI Technologies
Traduit une AgentSpec déclarative en configuration exécutable.

Visual Agent → Agent Spec → Agent Compiler → Runtime

Le Compiler produit :
  - DeerFlow / LangGraph state config
  - Model Gateway policy (capacité, provider)
  - Tool whitelist / MCP access
  - A2A delegation permissions
  - Memory scope isolation
  - Sandbox permissions
  - Budget plafonds
  - HITL (Human-in-the-loop) requirements

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

from core.agent_spec import (
    AgentSpec,
    CognitionMode,
    PermissionLevel,
    MemoryAccess,
)

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Compiled Agent Configuration
# ══════════════════════════════════════════════════════════════

@dataclass
class CompiledAgentConfig:
    """
    Configuration compilée prête pour l'exécution.
    Produite par l'Agent Compiler à partir de l'AgentSpec.
    """
    agent_id: str = ""
    agent_name: str = ""
    spec_version: int = 1

    # Model Gateway
    model_capability: str = "BALANCED"
    model_provider: Optional[str] = None
    model_temperature: float = 0.7
    max_tokens_per_call: int = 8192

    # DeerFlow / LangGraph
    max_plan_steps: int = 10
    max_concurrent_agents: int = 4
    autonomy_level: float = 0.5
    verification_level: float = 0.5
    system_prompt_addons: List[str] = field(default_factory=list)

    # Tools
    enabled_tools: List[str] = field(default_factory=list)
    mcp_servers: List[str] = field(default_factory=list)
    excluded_sources: List[str] = field(default_factory=list)

    # Permissions (HITL)
    hitl_actions: List[str] = field(default_factory=list)  # Actions requiring approval
    denied_actions: List[str] = field(default_factory=list)

    # Memory
    memory_scopes: Dict[str, str] = field(default_factory=dict)
    auto_learn: bool = True
    ask_before_save: bool = True
    memory_retention: str = "permanent"

    # Budget
    max_cost_usd: float = 1.0
    max_duration_seconds: int = 600
    max_tokens: int = 500_000
    max_tools_per_mission: int = 20

    # Language
    preferred_language: str = "fr-GA"
    fallback_language: str = "fr"

    # Sandbox
    sandbox_enabled: bool = False
    sandbox_provider: str = "e2b"

    def to_dict(self) -> Dict[str, Any]:
        """Sérialise la configuration compilée."""
        return {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "spec_version": self.spec_version,
            "model": {
                "capability": self.model_capability,
                "provider": self.model_provider,
                "temperature": self.model_temperature,
                "max_tokens_per_call": self.max_tokens_per_call,
            },
            "runtime": {
                "max_plan_steps": self.max_plan_steps,
                "max_concurrent_agents": self.max_concurrent_agents,
                "autonomy_level": self.autonomy_level,
                "verification_level": self.verification_level,
            },
            "tools": {
                "enabled": self.enabled_tools,
                "mcp_servers": self.mcp_servers,
                "excluded_sources": self.excluded_sources,
            },
            "permissions": {
                "hitl_actions": self.hitl_actions,
                "denied_actions": self.denied_actions,
            },
            "memory": {
                "scopes": self.memory_scopes,
                "auto_learn": self.auto_learn,
                "ask_before_save": self.ask_before_save,
                "retention": self.memory_retention,
            },
            "budget": {
                "max_cost_usd": self.max_cost_usd,
                "max_duration_seconds": self.max_duration_seconds,
                "max_tokens": self.max_tokens,
                "max_tools_per_mission": self.max_tools_per_mission,
            },
            "language": {
                "preferred": self.preferred_language,
                "fallback": self.fallback_language,
            },
            "sandbox": {
                "enabled": self.sandbox_enabled,
                "provider": self.sandbox_provider,
            },
        }


# ══════════════════════════════════════════════════════════════
# 2. Agent Compiler
# ══════════════════════════════════════════════════════════════

class AgentCompiler:
    """
    Compile une AgentSpec en CompiledAgentConfig.
    Garantit que la représentation visuelle correspond exactement
    à la configuration exécutée par DeerFlow / LangGraph.
    """

    @classmethod
    def compile(cls, spec: AgentSpec) -> CompiledAgentConfig:
        """
        Compile une AgentSpec complète en configuration d'exécution.
        """
        errors = spec.validate()
        if errors:
            raise ValueError(f"AgentSpec invalide: {', '.join(errors)}")

        config = CompiledAgentConfig(
            agent_id=spec.id,
            agent_name=spec.identity.name,
            spec_version=spec.version,
        )

        # ── Model Gateway ────────────────────────────────
        cls._compile_model(spec, config)

        # ── Runtime (DeerFlow / LangGraph) ───────────────
        cls._compile_runtime(spec, config)

        # ── Tools ────────────────────────────────────────
        cls._compile_tools(spec, config)

        # ── Permissions (HITL) ───────────────────────────
        cls._compile_permissions(spec, config)

        # ── Memory ───────────────────────────────────────
        cls._compile_memory(spec, config)

        # ── Budget ───────────────────────────────────────
        cls._compile_budget(spec, config)

        # ── Language ─────────────────────────────────────
        config.preferred_language = spec.language.preferred
        config.fallback_language = spec.language.fallback

        logger.info(
            f"🔧 Agent compilé: {config.agent_name} (v{config.spec_version}) "
            f"[{config.model_capability}] "
            f"tools={len(config.enabled_tools)} "
            f"mcp={len(config.mcp_servers)}"
        )

        return config

    @classmethod
    def _compile_model(cls, spec: AgentSpec, config: CompiledAgentConfig) -> None:
        """Compile la politique de modèle."""
        mode_to_capability = {
            CognitionMode.FAST: "FAST",
            CognitionMode.BALANCED: "BALANCED",
            CognitionMode.DEEP: "DEEP",
            CognitionMode.RESEARCH: "RESEARCH",
            CognitionMode.CODE: "CODE",
            CognitionMode.VISION: "VISION",
        }
        config.model_capability = mode_to_capability.get(
            spec.cognition.mode, spec.model_policy.capability
        )
        config.model_provider = spec.model_policy.preferred_provider
        config.model_temperature = spec.model_policy.temperature
        config.max_tokens_per_call = spec.model_policy.max_tokens_per_call

    @classmethod
    def _compile_runtime(cls, spec: AgentSpec, config: CompiledAgentConfig) -> None:
        """Compile les paramètres de runtime DeerFlow/LangGraph."""
        config.autonomy_level = spec.cognition.autonomy
        config.verification_level = spec.cognition.verification
        config.max_concurrent_agents = spec.budget.max_agents

        # Déterminer le nombre max d'étapes de plan basé sur l'autonomie
        if spec.cognition.autonomy >= 0.8:
            config.max_plan_steps = 20
        elif spec.cognition.autonomy >= 0.5:
            config.max_plan_steps = 12
        else:
            config.max_plan_steps = 6

        # Addons au prompt système basés sur la verification
        if spec.cognition.verification >= 0.7:
            config.system_prompt_addons.append(
                "Tu DOIS citer tes sources et vérifier les faits avant de conclure."
            )
        if spec.cognition.autonomy <= 0.3:
            config.system_prompt_addons.append(
                "Tu DOIS demander confirmation à l'utilisateur avant chaque action majeure."
            )

    @classmethod
    def _compile_tools(cls, spec: AgentSpec, config: CompiledAgentConfig) -> None:
        """Compile la liste des outils autorisés."""
        if spec.tools.search:
            config.enabled_tools.append("web_search")
        if spec.tools.browser:
            config.enabled_tools.append("browser")
        if spec.tools.code:
            config.enabled_tools.append("code_execution")
            config.sandbox_enabled = True
        if spec.tools.file_system:
            config.enabled_tools.append("file_system")

        config.mcp_servers = list(spec.tools.mcp_servers)
        config.excluded_sources = list(spec.tools.excluded_sources)

    @classmethod
    def _compile_permissions(cls, spec: AgentSpec, config: CompiledAgentConfig) -> None:
        """Compile les permissions HITL."""
        permission_map = {
            "email_send": spec.permissions.email_send,
            "file_delete": spec.permissions.file_delete,
            "file_write": spec.permissions.file_write,
            "web_action": spec.permissions.web_action,
            "payment": spec.permissions.payment,
            "data_export": spec.permissions.data_export,
        }
        for action, level in permission_map.items():
            if level == PermissionLevel.APPROVAL_REQUIRED:
                config.hitl_actions.append(action)
            elif level == PermissionLevel.DENIED:
                config.denied_actions.append(action)

    @classmethod
    def _compile_memory(cls, spec: AgentSpec, config: CompiledAgentConfig) -> None:
        """Compile les scopes de mémoire."""
        config.memory_scopes = {
            "user_profile": spec.memory.user_profile.value,
            "conversations": spec.memory.conversations.value,
            "workspace": spec.memory.workspace.value,
            "private_memory": spec.memory.private_memory.value,
            "projects": spec.memory.projects.value,
            "knowledge": spec.memory.knowledge.value,
        }
        config.auto_learn = spec.memory.auto_learn
        config.ask_before_save = spec.memory.ask_before_save
        config.memory_retention = spec.memory.retention

    @classmethod
    def _compile_budget(cls, spec: AgentSpec, config: CompiledAgentConfig) -> None:
        """Compile les plafonds budgétaires."""
        config.max_cost_usd = spec.budget.max_cost_usd
        config.max_duration_seconds = spec.budget.max_duration_seconds
        config.max_tokens = spec.budget.max_tokens
        config.max_tools_per_mission = spec.budget.max_tools_per_mission

    @classmethod
    def apply_hot_patch(
        cls,
        config: CompiledAgentConfig,
        path: str,
        value: Any,
    ) -> CompiledAgentConfig:
        """
        Applique un patch HOT directement sur la configuration compilée
        sans recompilation complète. Pour les modifications en cours de mission.
        """
        hot_mappings = {
            "budget.max_cost_usd": "max_cost_usd",
            "budget.max_agents": "max_concurrent_agents",
            "budget.max_tokens": "max_tokens",
            "model_policy.temperature": "model_temperature",
        }

        attr = hot_mappings.get(path)
        if attr and hasattr(config, attr):
            setattr(config, attr, value)
            logger.info(f"🔥 Hot patch appliqué: {path} = {value}")
        elif path == "tools.excluded_sources":
            config.excluded_sources = value if isinstance(value, list) else [value]
            logger.info(f"🔥 Hot patch appliqué: {path} = {value}")
        elif path == "language.preferred":
            config.preferred_language = value
            logger.info(f"🔥 Hot patch appliqué: {path} = {value}")
        else:
            logger.warning(f"⚠️ Patch non-HOT tenté: {path}")

        return config
