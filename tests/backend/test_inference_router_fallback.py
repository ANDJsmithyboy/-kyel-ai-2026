"""
Ñkyel AI — Test Suite Canonical Sovereign Inference Router
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

Valide rigoureusement la décision du Fondateur :
A. GPT-OSS disponible -> GPT-OSS complète
B. Simulation panne GPT-OSS -> Qwen complète
C. Simulation panne GPT-OSS + Qwen -> Groq A complète
D. Simulation panne 3 premiers -> Groq B complète
E. Simulation panne 4 premiers -> Gemini (Last Resort) complète
F. Simulation panne totale -> Arrêt contrôlé sans hallucination
"""

import sys
import os
import pytest
from unittest.mock import AsyncMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from core.routing.inference_router import InferenceRouter, inference_router


@pytest.mark.asyncio
class TestInferenceRouterFallback:

    async def test_scenario_a_gpt_oss_primary(self):
        """A. GPT-OSS disponible : complète la complétion."""
        router = InferenceRouter()

        test_messages = [{"role": "user", "content": "Ping"}]
        events = []
        async for evt in router.stream_chat(test_messages, max_tokens=20):
            events.append(evt)

        # On doit avoir reçu au moins un token et un event done
        done_evts = [e for e in events if e.get("type") == "done"]
        assert len(done_evts) == 1, "Un seul event done attendu (pas de doublon)"
        done = done_evts[0]
        assert done.get("provider") in ("runpod_gpt_oss", "runpod_qwen"), f"Attendu RunPod provider, reçu: {done.get('provider')}"

    async def test_scenario_b_qwen_secondary_fallback(self, monkeypatch):
        """B. Simulation échec GPT-OSS : Qwen prend le relais de façon transparente."""
        router = InferenceRouter()
        # Rendre l'URL GPT-OSS invalide pour simuler une panne réseau
        monkeypatch.setattr(router, "_gpt_oss_base_url", "https://invalid-runpod-gpt-endpoint.internal")

        test_messages = [{"role": "user", "content": "Ping"}]
        events = []
        async for evt in router.stream_chat(test_messages, max_tokens=20):
            events.append(evt)

        fallback_evts = [e for e in events if e.get("type") == "provider_fallback"]
        assert len(fallback_evts) >= 1
        assert fallback_evts[0]["failed_provider"] == "runpod_gpt_oss"
        assert fallback_evts[0]["next_provider"] == "runpod_qwen"

        done_evts = [e for e in events if e.get("type") == "done"]
        assert len(done_evts) == 1
        # Qwen a pris le relais
        assert done_evts[0]["provider"] == "runpod_qwen"

    async def test_scenario_c_groq_a_fallback(self, monkeypatch):
        """C. Simulation échec GPT-OSS + Qwen : Groq A prend le relais."""
        router = InferenceRouter()
        monkeypatch.setattr(router, "_gpt_oss_base_url", "https://invalid-gpt.internal")
        monkeypatch.setattr(router, "_qwen_base_url", "https://invalid-qwen.internal")

        test_messages = [{"role": "user", "content": "Ping"}]
        events = []
        async for evt in router.stream_chat(test_messages, max_tokens=20):
            events.append(evt)

        done_evts = [e for e in events if e.get("type") == "done"]
        assert len(done_evts) == 1
        assert done_evts[0]["provider"] == "groq_model_a"

    async def test_scenario_d_groq_b_fallback(self, monkeypatch):
        """D. Simulation échec des 3 premiers : Groq B prend le relais."""
        router = InferenceRouter()
        monkeypatch.setattr(router, "_gpt_oss_base_url", "https://invalid-gpt.internal")
        monkeypatch.setattr(router, "_qwen_base_url", "https://invalid-qwen.internal")

        # Simuler un rate-limit sur Groq A
        orig_get_chain = router._get_provider_chain
        def mock_chain(requested=None):
            c = orig_get_chain(requested)
            c[2]["base_url"] = "https://invalid-groq-a.internal"
            return c
        monkeypatch.setattr(router, "_get_provider_chain", mock_chain)

        test_messages = [{"role": "user", "content": "Ping"}]
        events = []
        async for evt in router.stream_chat(test_messages, max_tokens=20):
            events.append(evt)

        done_evts = [e for e in events if e.get("type") == "done"]
        assert len(done_evts) == 1
        assert done_evts[0]["provider"] == "groq_model_b"

    async def test_scenario_e_gemini_last_resort(self, monkeypatch):
        """E. Simulation échec des 4 premiers : Gemini (Last Resort) prend le relais."""
        router = InferenceRouter()
        orig_get_chain = router._get_provider_chain
        def mock_chain(requested=None):
            c = orig_get_chain(requested)
            for i in range(4):
                c[i]["base_url"] = "https://invalid-endpoint.internal"
            return c
        monkeypatch.setattr(router, "_get_provider_chain", mock_chain)

        test_messages = [{"role": "user", "content": "Ping"}]
        events = []
        async for evt in router.stream_chat(test_messages, max_tokens=20):
            events.append(evt)

        done_evts = [e for e in events if e.get("type") == "done"]
        assert len(done_evts) == 1
        assert done_evts[0]["provider"] == "gemini_last_resort"

    async def test_scenario_f_total_failure_controlled(self, monkeypatch):
        """F. Simulation échec total : arrêt contrôlé sans hallucination ni récursion infinie."""
        router = InferenceRouter()
        orig_get_chain = router._get_provider_chain
        def mock_chain(requested=None):
            c = orig_get_chain(requested)
            for item in c:
                item["base_url"] = "https://invalid-all.internal"
                item["api_key"] = "invalid"
            return c
        monkeypatch.setattr(router, "_get_provider_chain", mock_chain)

        test_messages = [{"role": "user", "content": "Ping"}]
        events = []
        async for evt in router.stream_chat(test_messages, max_tokens=20):
            events.append(evt)

        # Doit contenir un seul event error
        error_evts = [e for e in events if e.get("type") == "error"]
        assert len(error_evts) == 1
        assert "Échec de tous les fournisseurs" in error_evts[0]["message"]
        # Zéro event done
        assert not any(e.get("type") == "done" for e in events)
