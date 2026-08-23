"""
Ñkyel AI — Tests Innovation Visual Agent, Memory, World Model
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

Tests unitaires couvrant :
  - AgentSpec (création, validation, sérialisation, fork, diff, versioning)
  - AgentCompiler (compilation, hot-patch)
  - VIEPatch (pipeline HOT/WARM/COLD, undo/redo)
  - Memory Engine (9 scopes, security, provenance, pipeline)
  - World Model (entities, facts, constraints, impact analysis)
"""

import sys
import os
import time
import json
import pytest

# ── Fix import path ──────────────────────────────────────────
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))


# ══════════════════════════════════════════════════════════════
# A. Agent Spec Tests
# ══════════════════════════════════════════════════════════════

class TestAgentSpec:
    """Tests for the AgentSpec declarative schema."""

    def test_create_default_spec(self):
        from core.agent_spec import AgentSpec
        spec = AgentSpec()
        assert spec.identity.name == "Kora"
        assert spec.version == 1
        assert spec.id.startswith("agent_")

    def test_validate_valid_spec(self):
        from core.agent_spec import AgentSpec
        spec = AgentSpec()
        errors = spec.validate()
        assert errors == []

    def test_validate_empty_name(self):
        from core.agent_spec import AgentSpec, AgentIdentity
        spec = AgentSpec(identity=AgentIdentity(name=""))
        errors = spec.validate()
        assert any("identity.name" in e for e in errors)

    def test_validate_negative_budget(self):
        from core.agent_spec import AgentSpec, AgentBudget
        spec = AgentSpec(budget=AgentBudget(max_cost_usd=-1))
        errors = spec.validate()
        assert any("budget.max_cost_usd" in e for e in errors)

    def test_cognition_clamping(self):
        from core.agent_spec import AgentCognition
        c = AgentCognition(autonomy=2.0, verification=-1.0)
        c.validate()
        assert c.autonomy == 1.0
        assert c.verification == 0.0

    def test_serialization_roundtrip(self):
        from core.agent_spec import AgentSpec
        spec = AgentSpec()
        d = spec.to_dict()
        j = spec.to_json()
        assert isinstance(d, dict)
        assert isinstance(json.loads(j), dict)
        assert d["identity"]["name"] == "Kora"

    def test_clone_independence(self):
        from core.agent_spec import AgentSpec
        spec = AgentSpec()
        clone = spec.clone()
        clone.identity.name = "Mana"
        assert spec.identity.name == "Kora"
        assert clone.identity.name == "Mana"

    def test_fork_agent(self):
        from core.agent_spec import AgentSpec, fork_agent
        source = AgentSpec()
        forked = fork_agent(source, "Luca", "Chercheur")
        assert forked.identity.name == "Luca"
        assert forked.identity.role == "Chercheur"
        assert forked.id != source.id
        assert forked.version == 1

    def test_edit_temperature_classification(self):
        from core.agent_spec import get_edit_temperature, EditTemperature
        assert get_edit_temperature("cognition.mode") == EditTemperature.HOT
        assert get_edit_temperature("cognition.autonomy") == EditTemperature.WARM
        assert get_edit_temperature("identity.name") == EditTemperature.COLD

    def test_spec_diff(self):
        from core.agent_spec import AgentSpec, spec_diff
        a = AgentSpec()
        b = a.clone()
        b.cognition.autonomy = 0.9
        b.identity.name = "Mana"
        diffs = spec_diff(a.to_dict(), b.to_dict())
        paths = [d["path"] for d in diffs]
        assert any("autonomy" in p for p in paths)
        assert any("name" in p for p in paths)


# ══════════════════════════════════════════════════════════════
# B. Agent Spec History Tests
# ══════════════════════════════════════════════════════════════

class TestAgentSpecHistory:
    """Tests for versioning and history."""

    def test_initial_version(self):
        from core.agent_spec import AgentSpec, AgentSpecHistory
        spec = AgentSpec()
        history = AgentSpecHistory(spec)
        assert history.current_version == 1
        assert history.version_count == 1

    def test_commit_new_version(self):
        from core.agent_spec import AgentSpec, AgentSpecHistory
        spec = AgentSpec()
        history = AgentSpecHistory(spec)
        new_spec = spec.clone()
        new_spec.cognition.autonomy = 0.9
        v = history.commit(new_spec, ["cognition.autonomy"], "Augmentation autonomie")
        assert v == 2
        assert history.current_version == 2
        assert history.version_count == 2

    def test_list_versions(self):
        from core.agent_spec import AgentSpec, AgentSpecHistory
        spec = AgentSpec()
        history = AgentSpecHistory(spec)
        new_spec = spec.clone()
        history.commit(new_spec, ["test"], "Test")
        versions = history.list_versions()
        assert len(versions) == 2
        assert versions[0]["version"] == 1
        assert versions[1]["version"] == 2

    def test_get_version_snapshot(self):
        from core.agent_spec import AgentSpec, AgentSpecHistory
        spec = AgentSpec()
        history = AgentSpecHistory(spec)
        snapshot = history.get_version(1)
        assert snapshot is not None
        assert snapshot["identity"]["name"] == "Kora"


# ══════════════════════════════════════════════════════════════
# C. Agent Compiler Tests
# ══════════════════════════════════════════════════════════════

class TestAgentCompiler:
    """Tests for the Agent Compiler."""

    def test_compile_default_spec(self):
        from core.agent_spec import AgentSpec
        from core.agent_compiler import AgentCompiler
        spec = AgentSpec()
        config = AgentCompiler.compile(spec)
        assert config.agent_name == "Kora"
        assert config.model_capability == "BALANCED"
        assert "web_search" in config.enabled_tools

    def test_compile_code_mode(self):
        from core.agent_spec import AgentSpec, AgentCognition, AgentTools, CognitionMode
        from core.agent_compiler import AgentCompiler
        spec = AgentSpec(
            cognition=AgentCognition(mode=CognitionMode.CODE),
            tools=AgentTools(code=True),
        )
        config = AgentCompiler.compile(spec)
        assert config.model_capability == "CODE"
        assert config.sandbox_enabled is True
        assert "code_execution" in config.enabled_tools

    def test_compile_high_autonomy(self):
        from core.agent_spec import AgentSpec, AgentCognition
        from core.agent_compiler import AgentCompiler
        spec = AgentSpec(cognition=AgentCognition(autonomy=0.9))
        config = AgentCompiler.compile(spec)
        assert config.max_plan_steps == 20
        assert config.autonomy_level == 0.9

    def test_compile_low_autonomy(self):
        from core.agent_spec import AgentSpec, AgentCognition
        from core.agent_compiler import AgentCompiler
        spec = AgentSpec(cognition=AgentCognition(autonomy=0.2))
        config = AgentCompiler.compile(spec)
        assert config.max_plan_steps == 6
        assert any("confirmation" in a for a in config.system_prompt_addons)

    def test_compile_high_verification(self):
        from core.agent_spec import AgentSpec, AgentCognition
        from core.agent_compiler import AgentCompiler
        spec = AgentSpec(cognition=AgentCognition(verification=0.8))
        config = AgentCompiler.compile(spec)
        assert any("sources" in a for a in config.system_prompt_addons)

    def test_compile_permissions_hitl(self):
        from core.agent_spec import AgentSpec, AgentPermissions, PermissionLevel
        from core.agent_compiler import AgentCompiler
        spec = AgentSpec(permissions=AgentPermissions(
            email_send=PermissionLevel.APPROVAL_REQUIRED,
            payment=PermissionLevel.DENIED,
        ))
        config = AgentCompiler.compile(spec)
        assert "email_send" in config.hitl_actions
        assert "payment" in config.denied_actions

    def test_compile_serialization(self):
        from core.agent_spec import AgentSpec
        from core.agent_compiler import AgentCompiler
        spec = AgentSpec()
        config = AgentCompiler.compile(spec)
        d = config.to_dict()
        assert "model" in d
        assert "tools" in d
        assert "budget" in d

    def test_hot_patch(self):
        from core.agent_spec import AgentSpec
        from core.agent_compiler import AgentCompiler
        spec = AgentSpec()
        config = AgentCompiler.compile(spec)
        original_temp = config.model_temperature
        AgentCompiler.apply_hot_patch(config, "model_policy.temperature", 0.3)
        assert config.model_temperature == 0.3

    def test_invalid_spec_raises(self):
        from core.agent_spec import AgentSpec, AgentIdentity
        from core.agent_compiler import AgentCompiler
        spec = AgentSpec(identity=AgentIdentity(name=""))
        with pytest.raises(ValueError, match="invalide"):
            AgentCompiler.compile(spec)


# ══════════════════════════════════════════════════════════════
# D. VIE Patch Tests
# ══════════════════════════════════════════════════════════════

class TestVIEPatch:
    """Tests for the VIE Patch Protocol."""

    def setup_method(self):
        from core.vie_patch import VIEPatchEngine
        self.engine = VIEPatchEngine()

    def test_hot_patch_applied_immediately(self):
        from core.vie_patch import VIEPatch, PatchOperation, PatchTarget
        patch = VIEPatch(
            operation=PatchOperation.UPDATE,
            target=PatchTarget.AGENT_SPEC,
            agent_id="agent_test",
            path="cognition.mode",  # HOT
            old_value="balanced",
            new_value="fast",
        )
        result = self.engine.submit(patch)
        assert result.status.value == "applied"
        assert result.temperature.value == "hot"

    def test_warm_patch_pending(self):
        from core.vie_patch import VIEPatch, PatchOperation, PatchTarget
        patch = VIEPatch(
            operation=PatchOperation.UPDATE,
            target=PatchTarget.AGENT_SPEC,
            agent_id="agent_test",
            path="cognition.autonomy",  # WARM
            old_value=0.5,
            new_value=0.8,
        )
        result = self.engine.submit(patch)
        assert result.status.value == "authorized"
        assert result.temperature.value == "warm"
        assert self.engine.get_pending_count()["warm"] == 1

    def test_cold_patch_pending(self):
        from core.vie_patch import VIEPatch, PatchOperation, PatchTarget
        patch = VIEPatch(
            operation=PatchOperation.UPDATE,
            target=PatchTarget.AGENT_SPEC,
            agent_id="agent_test",
            path="identity.name",  # COLD
            old_value="Kora",
            new_value="Mana",
        )
        result = self.engine.submit(patch)
        assert result.status.value == "authorized"
        assert result.temperature.value == "cold"
        assert self.engine.get_pending_count()["cold"] == 1

    def test_apply_warm_patches(self):
        from core.vie_patch import VIEPatch, PatchOperation, PatchTarget
        patch = VIEPatch(
            operation=PatchOperation.UPDATE,
            target=PatchTarget.AGENT_SPEC,
            agent_id="agent_test",
            path="tools.search",  # WARM
            old_value=True,
            new_value=False,
        )
        self.engine.submit(patch)
        applied = self.engine.apply_warm_patches()
        assert len(applied) == 1
        assert applied[0].status.value == "applied"

    def test_undo_redo(self):
        from core.vie_patch import VIEPatch, PatchOperation, PatchTarget
        patch = VIEPatch(
            operation=PatchOperation.UPDATE,
            target=PatchTarget.AGENT_SPEC,
            agent_id="agent_test",
            path="budget.max_cost_usd",  # HOT
            old_value=1.0,
            new_value=5.0,
        )
        self.engine.submit(patch)
        assert len(self.engine.get_history()) == 1

        inverse = self.engine.undo()
        assert inverse is not None
        assert inverse.new_value == 1.0

        redone = self.engine.redo()
        assert redone is not None

    def test_reject_invalid_patch(self):
        from core.vie_patch import VIEPatch, PatchOperation, PatchTarget
        patch = VIEPatch(
            operation=PatchOperation.UPDATE,
            target=PatchTarget.AGENT_SPEC,
            agent_id="",  # Missing
            path="",      # Missing
        )
        result = self.engine.submit(patch)
        assert result.status.value == "rejected"

    def test_command_to_event(self):
        from core.vie_patch import command_to_event
        assert command_to_event("agent.memory.disable") == "agent.memory.disabled"
        assert command_to_event("agent.tool.add") == "agent.tool.added"
        assert command_to_event("memory.card.delete") == "memory.card.deleted"


# ══════════════════════════════════════════════════════════════
# E. Memory Engine Tests
# ══════════════════════════════════════════════════════════════

class TestNkyelMemory:
    """Tests for the Sovereign Memory Engine."""

    def setup_method(self):
        from services.nkyel_memory import NkyelMemoryEngine
        self.engine = NkyelMemoryEngine()

    def test_create_card(self):
        from services.nkyel_memory import MemoryCard, MemoryScope
        card = MemoryCard(
            content="L'utilisateur préfère le français.",
            type="preference",
            scope=MemoryScope.PREFERENCE,
            owner_id="user_1",
        )
        created = self.engine.create_card(card)
        assert created.memory_id == card.memory_id
        assert self.engine.get_card(card.memory_id) is not None

    def test_reject_sensitive_content(self):
        from services.nkyel_memory import MemoryCard
        card = MemoryCard(content="api_key=sk-1234567890abcdef")
        with pytest.raises(ValueError, match="sensible"):
            self.engine.create_card(card)

    def test_reject_password_content(self):
        from services.nkyel_memory import MemoryCard
        card = MemoryCard(content="password: MySuperSecret123!")
        with pytest.raises(ValueError, match="sensible"):
            self.engine.create_card(card)

    def test_reject_credit_card(self):
        from services.nkyel_memory import MemoryCard
        card = MemoryCard(content="Carte: 4532-1234-5678-9012")
        with pytest.raises(ValueError, match="sensible"):
            self.engine.create_card(card)

    def test_update_card(self):
        from services.nkyel_memory import MemoryCard, MemoryScope
        card = MemoryCard(content="Ancienne info", scope=MemoryScope.USER, owner_id="u1")
        self.engine.create_card(card)
        updated = self.engine.update_card(card.memory_id, "Nouvelle info")
        assert updated is not None
        assert updated.content == "Nouvelle info"

    def test_update_locked_card_fails(self):
        from services.nkyel_memory import MemoryCard
        card = MemoryCard(content="Important")
        self.engine.create_card(card)
        self.engine.lock_card(card.memory_id)
        with pytest.raises(ValueError, match="verrouillée"):
            self.engine.update_card(card.memory_id, "Tentative de modification")

    def test_delete_card(self):
        from services.nkyel_memory import MemoryCard
        card = MemoryCard(content="À supprimer")
        self.engine.create_card(card)
        assert self.engine.delete_card(card.memory_id) is True
        assert self.engine.get_card(card.memory_id) is None

    def test_delete_locked_card_fails(self):
        from services.nkyel_memory import MemoryCard
        card = MemoryCard(content="Protégé")
        self.engine.create_card(card)
        self.engine.lock_card(card.memory_id)
        with pytest.raises(ValueError, match="verrouillée"):
            self.engine.delete_card(card.memory_id)

    def test_provenance(self):
        from services.nkyel_memory import MemoryCard
        card = MemoryCard(
            content="Fait appris",
            source="conversation",
            source_conversations=["conv_1", "conv_2"],
        )
        self.engine.create_card(card)
        prov = self.engine.get_provenance(card.memory_id)
        assert prov is not None
        assert len(prov["source_conversations"]) == 2
        assert "2 conversation(s)" in prov["explanation"]

    def test_learning_policy(self):
        from services.nkyel_memory import LearningPolicy
        self.engine.set_learning_policy("user_1", LearningPolicy.NEVER)
        assert self.engine.get_learning_policy("user_1") == LearningPolicy.NEVER

    def test_memory_pipeline_respects_policy(self):
        from services.nkyel_memory import MemoryCandidate, LearningPolicy, MemoryScope
        self.engine.set_learning_policy("user_1", LearningPolicy.NEVER)
        candidate = MemoryCandidate(
            content="Something learned",
            owner_id="user_1",
            scope=MemoryScope.USER,
        )
        result = self.engine.process_candidate(candidate)
        assert result is None  # Blocked by policy

    def test_memory_pipeline_auto_preferences(self):
        from services.nkyel_memory import MemoryCandidate, LearningPolicy, MemoryScope
        self.engine.set_learning_policy("user_2", LearningPolicy.AUTO_PREFERENCES)
        candidate = MemoryCandidate(
            content="Préfère le mode sombre",
            type="preference",
            owner_id="user_2",
            scope=MemoryScope.PREFERENCE,
        )
        result = self.engine.process_candidate(candidate)
        assert result is not None
        assert result.type == "preference"

    def test_list_by_scope(self):
        from services.nkyel_memory import MemoryCard, MemoryScope
        self.engine.create_card(MemoryCard(content="A", scope=MemoryScope.USER, owner_id="u1"))
        self.engine.create_card(MemoryCard(content="B", scope=MemoryScope.PROJECT, owner_id="u1"))
        self.engine.create_card(MemoryCard(content="C", scope=MemoryScope.USER, owner_id="u1"))

        user_cards = self.engine.list_cards(owner_id="u1", scope=MemoryScope.USER)
        assert len(user_cards) == 2

    def test_stats(self):
        from services.nkyel_memory import MemoryCard, MemoryScope
        self.engine.create_card(MemoryCard(content="A", scope=MemoryScope.USER, owner_id="u1"))
        self.engine.create_card(MemoryCard(content="B", scope=MemoryScope.USER, owner_id="u1"))
        stats = self.engine.stats(owner_id="u1")
        assert stats["total_cards"] == 2

    def test_sensitivity_classifier(self):
        from services.nkyel_memory import classify_sensitivity, SensitivityLevel
        assert classify_sensitivity("api_key=sk-abc123456789") == SensitivityLevel.RESTRICTED
        assert classify_sensitivity("Bonjour le monde") == SensitivityLevel.INTERNAL
        assert classify_sensitivity("Ceci est confidentiel") == SensitivityLevel.CONFIDENTIAL


# ══════════════════════════════════════════════════════════════
# F. World Model Tests
# ══════════════════════════════════════════════════════════════

class TestWorldModel:
    """Tests for the World Model."""

    def setup_method(self):
        from core.world_model import WorldModel
        self.wm = WorldModel(mission_id="mission_test")

    def test_add_entity(self):
        from core.world_model import WorldEntity
        entity = WorldEntity(name="Google", entity_type="company")
        self.wm.add_entity(entity)
        assert self.wm.get_entity(entity.id) is not None

    def test_add_fact(self):
        from core.world_model import WorldFact
        fact = WorldFact(statement="Le marché est en croissance", confidence=0.7)
        self.wm.add_fact(fact)
        facts = self.wm.get_facts()
        assert len(facts) == 1

    def test_add_constraint(self):
        from core.world_model import WorldConstraint
        c = WorldConstraint(description="Budget limité à 10000€", constraint_type="budget")
        self.wm.add_constraint(c)
        assert len(self.wm.get_active_constraints()) == 1

    def test_add_relationship(self):
        from core.world_model import WorldEntity, WorldRelationship, RelationType
        e1 = WorldEntity(name="A", entity_type="company")
        e2 = WorldEntity(name="B", entity_type="company")
        self.wm.add_entity(e1)
        self.wm.add_entity(e2)
        rel = WorldRelationship(
            source_entity_id=e1.id,
            target_entity_id=e2.id,
            relation_type=RelationType.COMPETITOR,
        )
        self.wm.add_relationship(rel)
        rels = self.wm.get_relationships_for(e1.id)
        assert len(rels) == 1

    def test_user_reject_fact(self):
        from core.world_model import WorldFact, FactStatus
        fact = WorldFact(statement="Le concurrent est faible", confidence=0.6)
        self.wm.add_fact(fact)
        result = self.wm.user_reject_fact(fact.id, "Information incorrecte")
        assert result["success"] is True
        assert self.wm.get_facts()[0].status == FactStatus.REJECTED

    def test_user_accept_fact(self):
        from core.world_model import WorldFact, FactStatus
        fact = WorldFact(statement="Croissance de 15%", confidence=0.5)
        self.wm.add_fact(fact)
        result = self.wm.user_accept_fact(fact.id)
        assert result["success"] is True
        assert self.wm.get_facts()[0].status == FactStatus.VERIFIED
        assert self.wm.get_facts()[0].confidence == 1.0

    def test_user_add_constraint_with_impact(self):
        from core.world_model import WorldEntity, WorldFact
        entity = WorldEntity(name="Nigeria", entity_type="market")
        self.wm.add_entity(entity)
        fact = WorldFact(
            statement="Le Nigeria est un marché cible",
            entity_ids=[entity.id],
        )
        self.wm.add_fact(fact)

        result = self.wm.user_add_constraint(
            description="Le Nigeria est exclu par réglementation",
            constraint_type="regulatory",
            entity_ids=[entity.id],
        )
        assert result["success"] is True
        assert result["impact"]["replan_required"] is True

    def test_user_correct_entity(self):
        from core.world_model import WorldEntity
        entity = WorldEntity(
            name="TechCorp",
            entity_type="company",
            properties={"revenue": "10M"},
        )
        self.wm.add_entity(entity)
        result = self.wm.user_correct_entity(
            entity.id,
            {"revenue": "50M"},
            "Mise à jour du chiffre d'affaires",
        )
        assert result["success"] is True
        updated = self.wm.get_entity(entity.id)
        assert updated is not None
        assert updated.properties["revenue"] == "50M"

    def test_serialization(self):
        from core.world_model import WorldEntity, WorldFact
        self.wm.add_entity(WorldEntity(name="Test", entity_type="test"))
        self.wm.add_fact(WorldFact(statement="Test fact"))
        d = self.wm.to_dict()
        assert d["stats"]["entity_count"] == 1
        assert d["stats"]["fact_count"] == 1

    def test_impact_analysis_with_relationships(self):
        from core.world_model import WorldEntity, WorldRelationship, WorldFact, RelationType
        e1 = WorldEntity(name="A")
        e2 = WorldEntity(name="B")
        e3 = WorldEntity(name="C")
        self.wm.add_entity(e1)
        self.wm.add_entity(e2)
        self.wm.add_entity(e3)
        self.wm.add_relationship(WorldRelationship(
            source_entity_id=e1.id, target_entity_id=e2.id, relation_type=RelationType.DEPENDS_ON,
        ))
        self.wm.add_relationship(WorldRelationship(
            source_entity_id=e1.id, target_entity_id=e3.id, relation_type=RelationType.SUPPORTS,
        ))
        # Fact linked to entity e1 so impact analysis finds related entities
        fact = WorldFact(statement="A est crucial", entity_ids=[e1.id])
        self.wm.add_fact(fact)

        result = self.wm.user_reject_fact(fact.id)
        assert result["success"] is True
        assert len(result["impact"]["impacted_entities"]) >= 2
        assert result["impact"]["replan_required"] is True
