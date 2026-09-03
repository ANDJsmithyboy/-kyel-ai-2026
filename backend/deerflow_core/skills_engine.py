"""
Ñkyel AI — DeerFlow 2.0 Dynamic Skills Engine · SmartANDJ AI Technologies
Manages discovery, loading, and execution of DeerFlow Skills:
- Deep Research
- Business Report Generation
- Consulting Analysis
- Data Analysis
- Presentation / Pitch Deck (PPTX)
- Frontend / Web Generation (HTML/CSS/JS/ZIP)
- Image Generation
- Video Generation
- Code & Documentation

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import os
import time
import json
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from pathlib import Path

logger = logging.getLogger(__name__)


@dataclass
class DeerSkill:
    id: str
    name: str
    description: str
    category: str
    required_tools: List[str] = field(default_factory=list)
    parameters: Dict[str, Any] = field(default_factory=dict)
    enabled: bool = True
    installed_path: Optional[str] = None


class DeerSkillsEngine:
    """Dynamic Skills discovery and execution engine."""

    def __init__(self):
        self._skills: Dict[str, DeerSkill] = {}
        self._initialize_core_skills()

    def _initialize_core_skills(self):
        """Initializes canonical verified DeerFlow 2.0 skills."""
        core_catalog = [
            DeerSkill(
                id="skill_deep_research",
                name="Deep Research",
                description="Recherche web récursive multi-requêtes avec extraction de faits, validation croisée et citations.",
                category="research",
                required_tools=["tavily_search", "web_fetch"],
                parameters={"query": {"type": "string"}, "depth": {"type": "integer", "default": 2}},
            ),
            DeerSkill(
                id="skill_business_report",
                name="Business Report Generation",
                description="Génération de rapports d'analyse de marché, concurrentielle et financière avec livrable PDF certifié.",
                category="business",
                required_tools=["tavily_search", "artifact_compiler"],
                parameters={"topic": {"type": "string"}, "format": {"type": "string", "default": "pdf"}},
            ),
            DeerSkill(
                id="skill_consulting_analysis",
                name="Consulting Analysis",
                description="Frameworks stratégiques (SWOT, Porter 5 Forces, McKinsey 7S) et matrice de décision exécutive.",
                category="consulting",
                required_tools=["artifact_compiler"],
                parameters={"company_or_market": {"type": "string"}},
            ),
            DeerSkill(
                id="skill_data_analysis",
                name="Data Analysis & Spreadsheet",
                description="Traitement statistique de données, calculs de rentabilité et génération de tableurs XLSX.",
                category="data",
                required_tools=["sandbox_exec", "artifact_compiler"],
                parameters={"data_input": {"type": "string"}},
            ),
            DeerSkill(
                id="skill_presentation_pptx",
                name="Presentation / Pitch Deck",
                description="Conception de présentations PowerPoint professionnelles et éditables (PPTX canonique).",
                category="presentation",
                required_tools=["artifact_compiler"],
                parameters={"pitch_goal": {"type": "string"}, "slide_count": {"type": "integer", "default": 5}},
            ),
            DeerSkill(
                id="skill_web_generator",
                name="Frontend / Web Project Generator",
                description="Génération d'applications et landing pages web complètes (HTML/CSS/JS responsive packagé en ZIP).",
                category="development",
                required_tools=["sandbox_exec", "artifact_compiler"],
                parameters={"app_spec": {"type": "string"}},
            ),
            DeerSkill(
                id="skill_image_gen",
                name="AI Image Generation",
                description="Création de visuels et logos haute fidélité via les routeurs de diffusion souverains.",
                category="media",
                required_tools=["media_router_image", "artifact_compiler"],
                parameters={"prompt": {"type": "string"}, "aspect_ratio": {"type": "string", "default": "16:9"}},
            ),
            DeerSkill(
                id="skill_video_gen",
                name="AI Video Generation",
                description="Création de séquences vidéo cinématiques avec validation de codec et persistance R2.",
                category="media",
                required_tools=["media_router_video", "artifact_compiler"],
                parameters={"prompt": {"type": "string"}, "duration": {"type": "integer", "default": 5}},
            ),
            DeerSkill(
                id="skill_code_doc",
                name="Code & Documentation",
                description="Audit, refactoring, documentation d'architectures logicielles et génération de spécifications OpenAPI.",
                category="development",
                required_tools=["sandbox_exec"],
                parameters={"code_or_repo": {"type": "string"}},
            ),
        ]

        for sk in core_catalog:
            self._skills[sk.id] = sk

    def list_skills(self) -> List[Dict[str, Any]]:
        """Returns metadata for all available skills."""
        return [
            {
                "id": s.id,
                "name": s.name,
                "description": s.description,
                "category": s.category,
                "required_tools": s.required_tools,
                "enabled": s.enabled,
            }
            for s in self._skills.values()
        ]

    def find_skill_by_intent(self, intent_text: str) -> Optional[DeerSkill]:
        """Matches user intent to the most suitable skill dynamically."""
        lower_intent = intent_text.lower()
        if any(w in lower_intent for w in ["site", "web", "landing", "html", "react"]):
            return self._skills.get("skill_web_generator")
        elif any(w in lower_intent for w in ["pptx", "présentation", "presentation", "deck", "slide"]):
            return self._skills.get("skill_presentation_pptx")
        elif any(w in lower_intent for w in ["xlsx", "tableur", "chiffres", "financ", "excel"]):
            return self._skills.get("skill_data_analysis")
        elif any(w in lower_intent for w in ["vidéo", "video", "clip"]):
            return self._skills.get("skill_video_gen")
        elif any(w in lower_intent for w in ["image", "visuel", "logo", "photo"]):
            return self._skills.get("skill_image_gen")
        elif any(w in lower_intent for w in ["recherche", "research", "veille", "sources"]):
            return self._skills.get("skill_deep_research")
        elif any(w in lower_intent for w in ["rapport", "report", "pdf", "marché"]):
            return self._skills.get("skill_business_report")
        elif any(w in lower_intent for w in ["stratég", "consulting", "swot", "concurrent"]):
            return self._skills.get("skill_consulting_analysis")
        return self._skills.get("skill_deep_research")


# Global singleton
deer_skills_engine = DeerSkillsEngine()
