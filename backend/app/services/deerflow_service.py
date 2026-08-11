"""
Ñkyel AI · DeerFlow Service
Orchestration d'agents via DeerFlow 2.0 (librairie Python).
Limité à 1 agent concurrent sur RunPod CPU free tier.
"""

import asyncio
from typing import Optional, List, Dict, Any

from app.config import settings
from app.models.schemas import ModelId


# Registre d'outils disponibles pour les agents
_TOOL_REGISTRY: Dict[str, Any] = {}


def register_tool(name: str, tool_instance: Any) -> None:
    """Enregistre un outil dans le registre DeerFlow."""
    _TOOL_REGISTRY[name] = tool_instance


def get_tool(name: str) -> Optional[Any]:
    """Récupère un outil enregistré."""
    return _TOOL_REGISTRY.get(name)


class DeerFlowService:
    """
    Orchestre les agents DeerFlow avec limitation CPU.
    max_concurrent_runs=1 pour le free tier RunPod.
    """

    def __init__(self, max_concurrent_runs: int = 1):
        self.max_concurrent_runs = max_concurrent_runs
        self._semaphore = asyncio.Semaphore(max_concurrent_runs)
        self._active_runs: Dict[str, dict] = {}

    async def run_agent(
        self,
        model_id: str,
        task: str,
        context: Optional[str] = None,
        tool_names: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Lance un agent DeerFlow pour une tâche donnée.
        Limité par le sémaphore (1 agent à la fois sur CPU).
        """
        import uuid
        run_id = str(uuid.uuid4())[:8]

        # Valider le modèle
        valid_models = [m.value for m in ModelId]
        if model_id not in valid_models:
            return {
                "id": run_id,
                "status": "error",
                "result": f"Modèle inconnu : {model_id}. Modèles valides : {valid_models}",
                "events": [],
            }

        # Résoudre les outils demandés
        tools = []
        if tool_names:
            for name in tool_names:
                tool = get_tool(name)
                if tool:
                    tools.append(tool)

        # Acquérir le sémaphore (file d'attente si un agent tourne déjà)
        async with self._semaphore:
            self._active_runs[run_id] = {"status": "running", "model": model_id, "task": task}

            try:
                result = await self._execute_agent(run_id, model_id, task, context, tools)
                self._active_runs[run_id]["status"] = "completed"
                return {
                    "id": run_id,
                    "status": "completed",
                    "result": result,
                    "events": self._active_runs[run_id].get("events", []),
                }
            except Exception as e:
                self._active_runs[run_id]["status"] = "error"
                return {
                    "id": run_id,
                    "status": "error",
                    "result": str(e),
                    "events": [],
                }
            finally:
                if run_id in self._active_runs:
                    del self._active_runs[run_id]

    async def _execute_agent(
        self,
        run_id: str,
        model_id: str,
        task: str,
        context: Optional[str],
        tools: List[Any],
    ) -> str:
        """
        Exécution interne de l'agent.
        En production, utilise DeerFlow lib. En dev, simulation.
        """
        # Construction du prompt agent
        system_prompt = self._build_system_prompt(model_id, tools)

        full_prompt = system_prompt
        if context:
            full_prompt += f"\n\nContexte additionnel :\n{context}"
        full_prompt += f"\n\nTâche à accomplir :\n{task}"

        # Appel LLM via Groq
        from app.services.groq_service import groq_chat

        messages = [
            {"role": "system", "content": system_prompt},
        ]
        if context:
            messages.append({"role": "user", "content": f"Contexte : {context}"})
        messages.append({"role": "user", "content": task})

        result = await groq_chat(model_id, messages, temperature=0.3, max_tokens=8192)

        # Si des outils vision sont disponibles et pertinents, les appeler
        for tool in tools:
            if hasattr(tool, "name") and tool.name == "nkyel_vision":
                # L'outil sera appelé par l'agent si nécessaire
                pass

        return result

    def _build_system_prompt(self, model_id: str, tools: List[Any]) -> str:
        """Construit le prompt système selon le modèle et les outils."""
        base = (
            "Tu es Ñkyel AI, une intelligence artificielle souveraine du Gabon. "
            "Tu réponds en français sauf si l'utilisateur parle une autre langue. "
            "Tu es précis, utile et bienveillant."
        )

        model_specifics = {
            "aurata": "Tu es en mode AURATA : réponses rapides et concises.",
            "nkyel": "Tu es en mode NKYEL : raisonnement profond et détaillé. Prends le temps d'analyser.",
            "onyxgris": (
                "Tu es en mode ONYXGRIS : tu comprends les langues gabonaises "
                "(fang, myene, punu, nzebi, teke, etc.) et tu peux traduire et expliquer."
            ),
            "wandana": (
                "Tu es en mode WANDANA : tu effectues des recherches approfondies. "
                "Cite tes sources avec les URLs."
            ),
            "black-panther": (
                "Tu es en mode BLACK PANTHER : orchestrateur multi-agents. "
                "Planifie, décompose et exécute la tâche en étapes."
            ),
        }

        prompt = base + "\n\n" + model_specifics.get(model_id, "")

        if tools:
            tool_desc = "\n".join(
                f"- {t.name}: {t.description}" for t in tools if hasattr(t, "name")
            )
            if tool_desc:
                prompt += f"\n\nOutils disponibles :\n{tool_desc}"

        return prompt

    @property
    def active_run_count(self) -> int:
        return len(self._active_runs)


# Singleton
deerflow = DeerFlowService(max_concurrent_runs=1)
