"""
Ñkyel AI — Simulation Engine · SmartANDJ AI Technologies
Moteur de simulation temporelle what-if.

Simule l'impact d'une décision AVANT exécution.
Gère 3 horizons temporels : PASSÉ · PRÉSENT · FUTURS POSSIBLES.

Distinction épistémique stricte :
  FACT       — prouvé, vérifié
  ASSUMPTION — hypothèse non vérifiée
  PREDICTION — estimation basée sur des données
  SIMULATION — scénario exploratoire

Ñkyel ne prétend JAMAIS connaître l'avenir.
Chaque prédiction affiche son incertitude.

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import uuid
import logging
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum

from core.event_schema import NkyelEvent, event_emitter

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Epistemic Status
# ══════════════════════════════════════════════════════════════

class EpistemicStatus(str, Enum):
    """Classification épistémique stricte."""
    FACT = "fact"             # Prouvé et vérifié
    ASSUMPTION = "assumption" # Hypothèse non vérifiée
    PREDICTION = "prediction" # Estimation basée sur des données
    SIMULATION = "simulation" # Scénario exploratoire what-if


class TemporalHorizon(str, Enum):
    """Horizons temporels du modèle."""
    PAST = "past"             # Événements passés vérifiés
    PRESENT = "present"       # État actuel modélisé
    FUTURE = "future"         # Futurs possibles avec incertitude


class ScenarioStatus(str, Enum):
    """Statut d'un scénario de simulation."""
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    ACCEPTED = "accepted"     # L'utilisateur a choisi ce scénario
    REJECTED = "rejected"


# ══════════════════════════════════════════════════════════════
# 2. Simulation Data Structures
# ══════════════════════════════════════════════════════════════

@dataclass
class SimulationVariable:
    """Variable dans une simulation what-if."""
    name: str = ""
    current_value: Any = None
    simulated_value: Any = None
    unit: str = ""
    epistemic_status: EpistemicStatus = EpistemicStatus.ASSUMPTION

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "current_value": self.current_value,
            "simulated_value": self.simulated_value,
            "unit": self.unit,
            "epistemic_status": self.epistemic_status.value,
        }


@dataclass
class SimulationImpact:
    """Impact d'une simulation sur une entité ou une décision."""
    entity_name: str = ""
    impact_description: str = ""
    severity: str = "medium"  # "low", "medium", "high", "critical"
    confidence: float = 0.5
    epistemic_status: EpistemicStatus = EpistemicStatus.PREDICTION

    def to_dict(self) -> Dict[str, Any]:
        return {
            "entity_name": self.entity_name,
            "impact_description": self.impact_description,
            "severity": self.severity,
            "confidence": self.confidence,
            "epistemic_status": self.epistemic_status.value,
        }


@dataclass
class WhatIfScenario:
    """Scénario de simulation what-if complet."""
    id: str = field(default_factory=lambda: f"sim_{uuid.uuid4().hex[:10]}")
    mission_id: str = ""
    title: str = ""
    description: str = ""
    status: ScenarioStatus = ScenarioStatus.DRAFT

    # Variables manipulées
    variables: List[SimulationVariable] = field(default_factory=list)

    # Impacts calculés
    impacts: List[SimulationImpact] = field(default_factory=list)

    # Résultat
    overall_risk: str = "medium"
    overall_confidence: float = 0.5
    recommendation: str = ""

    # Méta
    created_at: float = field(default_factory=time.time)
    completed_at: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "mission_id": self.mission_id,
            "title": self.title,
            "description": self.description,
            "status": self.status.value,
            "variables": [v.to_dict() for v in self.variables],
            "impacts": [i.to_dict() for i in self.impacts],
            "overall_risk": self.overall_risk,
            "overall_confidence": self.overall_confidence,
            "recommendation": self.recommendation,
            "created_at": self.created_at,
            "completed_at": self.completed_at,
        }


# ══════════════════════════════════════════════════════════════
# 3. Temporal State
# ══════════════════════════════════════════════════════════════

@dataclass
class TemporalFact:
    """Fait avec contexte temporel et incertitude."""
    id: str = field(default_factory=lambda: f"tf_{uuid.uuid4().hex[:8]}")
    statement: str = ""
    horizon: TemporalHorizon = TemporalHorizon.PRESENT
    epistemic_status: EpistemicStatus = EpistemicStatus.ASSUMPTION
    confidence: float = 0.5
    uncertainty_range: Optional[List[float]] = None  # [min, max] pour les prédictions
    source: str = ""
    timestamp: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        result = {
            "id": self.id,
            "statement": self.statement,
            "horizon": self.horizon.value,
            "epistemic_status": self.epistemic_status.value,
            "confidence": self.confidence,
            "source": self.source,
        }
        if self.uncertainty_range:
            result["uncertainty_range"] = self.uncertainty_range
        return result


# ══════════════════════════════════════════════════════════════
# 4. Simulation Engine
# ══════════════════════════════════════════════════════════════

class SimulationEngine:
    """
    Moteur de simulation what-if.
    Simule l'impact avant exécution. Jamais de fausse voyance.
    """

    def __init__(self):
        self._scenarios: Dict[str, WhatIfScenario] = {}
        self._temporal_facts: Dict[str, TemporalFact] = {}

    # ── Scenarios ────────────────────────────────────────────

    def create_scenario(
        self,
        title: str,
        description: str,
        mission_id: str = "",
        variables: Optional[List[Dict[str, Any]]] = None,
    ) -> WhatIfScenario:
        """Crée un nouveau scénario de simulation what-if."""
        scenario = WhatIfScenario(
            mission_id=mission_id,
            title=title,
            description=description,
        )

        if variables:
            for v in variables:
                scenario.variables.append(SimulationVariable(
                    name=v.get("name", ""),
                    current_value=v.get("current_value"),
                    simulated_value=v.get("simulated_value"),
                    unit=v.get("unit", ""),
                    epistemic_status=EpistemicStatus(
                        v.get("epistemic_status", "assumption")
                    ),
                ))

        self._scenarios[scenario.id] = scenario
        return scenario

    def run_simulation(self, scenario_id: str) -> Optional[WhatIfScenario]:
        """
        Exécute une simulation what-if.
        Calcule les impacts basés sur les variables manipulées.
        """
        scenario = self._scenarios.get(scenario_id)
        if not scenario:
            return None

        scenario.status = ScenarioStatus.RUNNING

        # Calculer les impacts pour chaque variable modifiée
        for var in scenario.variables:
            if var.current_value is not None and var.simulated_value is not None:
                impact = self._calculate_impact(var)
                scenario.impacts.append(impact)

        # Calculer le risque global
        if scenario.impacts:
            severity_scores = {
                "low": 1, "medium": 2, "high": 3, "critical": 4
            }
            avg_severity = sum(
                severity_scores.get(i.severity, 2) for i in scenario.impacts
            ) / len(scenario.impacts)
            avg_confidence = sum(
                i.confidence for i in scenario.impacts
            ) / len(scenario.impacts)

            if avg_severity >= 3.5:
                scenario.overall_risk = "critical"
            elif avg_severity >= 2.5:
                scenario.overall_risk = "high"
            elif avg_severity >= 1.5:
                scenario.overall_risk = "medium"
            else:
                scenario.overall_risk = "low"

            scenario.overall_confidence = round(avg_confidence, 2)

            # Recommandation
            if scenario.overall_risk in ("critical", "high"):
                scenario.recommendation = (
                    "Impact significatif détecté. "
                    "Vérification approfondie recommandée avant exécution."
                )
            else:
                scenario.recommendation = (
                    "Impact modéré. Exécution possible avec suivi."
                )
        else:
            scenario.recommendation = "Aucun impact calculable avec les données actuelles."

        scenario.status = ScenarioStatus.COMPLETED
        scenario.completed_at = time.time()

        # Émettre l'événement
        event_emitter.emit(NkyelEvent(
            type="simulation.completed",
            mission_id=scenario.mission_id,
            payload={
                "scenario_id": scenario.id,
                "title": scenario.title,
                "overall_risk": scenario.overall_risk,
                "overall_confidence": scenario.overall_confidence,
                "impact_count": len(scenario.impacts),
                "recommendation": scenario.recommendation,
            },
        ))

        logger.info(
            f"🔮 Simulation terminée: \"{scenario.title}\" "
            f"risque={scenario.overall_risk} "
            f"confiance={scenario.overall_confidence}"
        )

        return scenario

    def _calculate_impact(self, var: SimulationVariable) -> SimulationImpact:
        """Calcule l'impact d'une variable modifiée."""
        # Déterminer la sévérité basée sur le changement
        severity = "medium"
        confidence = 0.5

        try:
            current = float(var.current_value)
            simulated = float(var.simulated_value)
            if current != 0:
                change_pct = abs((simulated - current) / current)
                if change_pct >= 0.5:
                    severity = "critical"
                    confidence = 0.7
                elif change_pct >= 0.3:
                    severity = "high"
                    confidence = 0.6
                elif change_pct >= 0.1:
                    severity = "medium"
                    confidence = 0.5
                else:
                    severity = "low"
                    confidence = 0.4

                direction = "augmentation" if simulated > current else "diminution"
                description = (
                    f"{direction.capitalize()} de {var.name} "
                    f"de {change_pct:.0%} "
                    f"({var.current_value} → {var.simulated_value} {var.unit})"
                )
            else:
                description = f"Changement de {var.name}: {var.current_value} → {var.simulated_value}"
        except (ValueError, TypeError):
            description = f"Modification de {var.name}: {var.current_value} → {var.simulated_value}"

        return SimulationImpact(
            entity_name=var.name,
            impact_description=description,
            severity=severity,
            confidence=confidence,
            epistemic_status=EpistemicStatus.SIMULATION,
        )

    def accept_scenario(self, scenario_id: str) -> Optional[WhatIfScenario]:
        """L'utilisateur accepte un scénario pour exécution."""
        scenario = self._scenarios.get(scenario_id)
        if scenario:
            scenario.status = ScenarioStatus.ACCEPTED
        return scenario

    def reject_scenario(self, scenario_id: str) -> Optional[WhatIfScenario]:
        """L'utilisateur rejette un scénario."""
        scenario = self._scenarios.get(scenario_id)
        if scenario:
            scenario.status = ScenarioStatus.REJECTED
        return scenario

    def get_scenario(self, scenario_id: str) -> Optional[WhatIfScenario]:
        return self._scenarios.get(scenario_id)

    def list_scenarios(self, mission_id: Optional[str] = None) -> List[Dict[str, Any]]:
        results = []
        for s in self._scenarios.values():
            if mission_id and s.mission_id != mission_id:
                continue
            results.append({
                "id": s.id,
                "title": s.title,
                "status": s.status.value,
                "overall_risk": s.overall_risk,
                "overall_confidence": s.overall_confidence,
            })
        return results

    # ── Temporal Facts ───────────────────────────────────────

    def add_temporal_fact(self, fact: TemporalFact) -> TemporalFact:
        self._temporal_facts[fact.id] = fact
        return fact

    def get_temporal_facts(
        self,
        horizon: Optional[TemporalHorizon] = None,
        epistemic_status: Optional[EpistemicStatus] = None,
    ) -> List[TemporalFact]:
        results = list(self._temporal_facts.values())
        if horizon:
            results = [f for f in results if f.horizon == horizon]
        if epistemic_status:
            results = [f for f in results if f.epistemic_status == epistemic_status]
        return results

    def clear(self) -> None:
        self._scenarios.clear()
        self._temporal_facts.clear()


# ══════════════════════════════════════════════════════════════
# Singleton
# ══════════════════════════════════════════════════════════════

simulation_engine = SimulationEngine()
