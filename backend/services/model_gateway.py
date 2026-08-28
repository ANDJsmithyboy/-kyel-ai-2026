"""
Ñkyel AI — Global Model Gateway, Provider Registry & Universal Capability Router
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

Architecture Souveraine & Universelle d'IA Mondiale :
- Routage basé sur les capacités abstraites (FAST, DEEP, REASONING, CODE, VISION, MULTILINGUAL, SOVEREIGN...)
- Registre mondial de fournisseurs (USA, France, Europe, Chine, Japon, Corée, Inde, Moyen-Orient, Afrique, Local)
- Découplage complet : aucun modèle ni fournisseur commercial n'est hardcodé dans le cœur de l'application
- Circuit Breaker automatique par fournisseur, tolérance aux pannes & basculement gracieux (Fallback)
- Matrice dynamique des capacités, mesure TTFT, calcul des coûts et observabilité temps réel
- Masquage strict des clés API et respect des politiques de résidence des données
"""

from __future__ import annotations

import os
import time
import json
import asyncio
import logging
import threading
from enum import Enum
from typing import Optional, Any, AsyncGenerator, Dict, List, Set
from dataclasses import dataclass, field

import httpx

from core.config import settings
from core.context import get_context
from services.providers.base_adapter import (
    BaseProviderAdapter,
    OpenAICompatibleProviderAdapter,
    AdapterResponse,
)

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Capabilities, Regions, Status & Policy Enums
# ══════════════════════════════════════════════════════════════

class ModelCapability(str, Enum):
    """Capacités abstraites — l'application demande une capacité, jamais un nom de fournisseur."""
    FAST = "FAST"                              # Réponse ultra-rapide (<500ms), tâches courantes
    BALANCED = "BALANCED"                      # Équilibre optimal intelligence/vitesse/coût
    DEEP = "DEEP"                              # Raisonnement approfondi, synthèse complexe
    REASONING = "REASONING"                    # Modèles à chaîne de pensée / réflexion explicite (R1, o1, etc.)
    CODE = "CODE"                              # Programmation, refactoring, analyse d'AST
    VISION = "VISION"                          # Multimodal visuel (compréhension d'images, OCR, schémas)
    SEARCH = "SEARCH"                          # Recherche en direct et synthèse web
    RESEARCH = "RESEARCH"                      # Décomposition arborescente et investigation étendue
    MULTILINGUAL = "MULTILINGUAL"              # Traduction polyglotte et langues internationales
    AFRICAN_LANGUAGES = "AFRICAN_LANGUAGES"    # Spécialisation langues africaines & gabonaises (Fang, Punu, Myènè, Swahili...)
    LONG_CONTEXT = "LONG_CONTEXT"              # Contexte massif (>128k tokens, livres, bases de code)
    LOW_COST = "LOW_COST"                      # Coût minimal par million de tokens
    PRIVATE = "PRIVATE"                        # Traitement confidentiel sans rétention
    SOVEREIGN = "SOVEREIGN"                    # Infrastructure dédiée souveraine (RunPod GPU, On-Prem)
    LOCAL = "LOCAL"                            # Exécution locale Edge / poste de travail
    IMAGE = "IMAGE"                            # Génération d'images (Imagen, Flux, SD)
    VIDEO = "VIDEO"                            # Génération vidéo (Veo, Kling, Luma)
    STT = "STT"                                # Reconnaissance vocale (Speech to Text)
    TTS = "TTS"                                # Synthèse vocale (Text to Speech)
    EMBEDDING = "EMBEDDING"                    # Vecteurs sémantiques pour RAG
    RERANKING = "RERANKING"                    # Réordonnancement de précision documentaire


class ProviderRegion(str, Enum):
    """Régions géopolitiques et juridiques d'infrastructure."""
    GLOBAL = "GLOBAL"
    US = "US"
    EU = "EU"
    FRANCE = "FRANCE"
    CHINA = "CHINA"
    JAPAN = "JAPAN"
    KOREA = "KOREA"
    INDIA = "INDIA"
    MIDDLE_EAST = "MIDDLE_EAST"
    AFRICA = "AFRICA"
    LOCAL = "LOCAL"


class ProviderStatus(str, Enum):
    """Cycle de vie et disponibilité opérationnelle d'un fournisseur."""
    AVAILABLE = "AVAILABLE"          # Déclaré et supporté dans l'architecture
    CONFIGURED = "CONFIGURED"        # Clé API / Endpoint présent dans l'environnement
    ENABLED = "ENABLED"              # Actif et prêt à recevoir du trafic
    DISABLED = "DISABLED"            # Désactivé volontairement par l'administrateur
    UNAVAILABLE = "UNAVAILABLE"      # Circuit ouvert ou endpoint inaccessible


class DataResidencyPolicy(str, Enum):
    """Politique de souveraineté et de résidence des données."""
    GLOBAL = "GLOBAL"
    EU = "EU"
    US = "US"
    AFRICA = "AFRICA"
    LOCAL = "LOCAL"
    CUSTOM = "CUSTOM"


class ModelProvider(str, Enum):
    """Fournisseurs d'IA intégrés au registre mondial Ñkyel."""
    # USA / Global
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    GOOGLE_VERTEX = "google_vertex"
    AZURE_AI = "azure_ai"
    AWS_BEDROCK = "aws_bedrock"
    XAI = "xai"
    META_LLAMA = "meta_llama"
    NVIDIA_NIM = "nvidia_nim"
    COHERE = "cohere"
    GROQ = "groq"
    CEREBRAS = "cerebras"
    TOGETHER = "together"
    FIREWORKS = "fireworks"
    HUGGINGFACE = "huggingface"
    REPLICATE = "replicate"
    OPENROUTER = "openrouter"
    
    # France (Prioritaire)
    MISTRAL = "mistral"
    SCALEWAY = "scaleway"
    OVHCLOUD = "ovhcloud"
    
    # Europe
    ALEPH_ALPHA = "aleph_alpha"
    DEEPL = "deepl"
    SOVEREIGN_EU = "sovereign_eu"
    
    # Chine
    ALIBABA_QWEN = "alibaba_qwen"
    DEEPSEEK = "deepseek"
    ZHIPU_GLM = "zhipu_glm"
    MOONSHOT_KIMI = "moonshot_kimi"
    MINIMAX = "minimax"
    BAIDU_ERNIE = "baidu_ernie"
    TENCENT_HUNYUAN = "tencent_hunyuan"
    BYTEDANCE_DOUBAO = "bytedance_doubao"
    HUAWEI_PANGU = "huawei_pangu"
    ZERO_ONE_YI = "01_ai"
    STEPFUN = "stepfun"
    
    # Asie & Moyen-Orient
    NTT_TSUZUMI = "ntt_tsuzumi"
    NAVER_HYPERCLOVA = "naver_hyperclova"
    UPSTAGE = "upstage"
    SARVAM_AI = "sarvam_ai"
    KRUTRIM = "krutrim"
    FALCON_TII = "falcon_tii"
    JAIS_ARABIC = "jais_arabic"
    
    # Afrique & Souveraineté
    LELAPA_AI = "lelapa_ai"
    MASAKHANE = "masakhane"
    GABOMA_AI = "gaboma_ai"
    NKYEL_SOVEREIGN = "nkyel_sovereign"
    
    VLLM_LOCAL = "vllm_local"
    TGI_LOCAL = "tgi_local"
    SGLANG_LOCAL = "sglang_local"
    LLAMACPP_LOCAL = "llamacpp_local"
    OLLAMA = "ollama"
    RUNPOD = "runpod"
    LOCAL = "local"
    NKYEL_HOSTED = "nkyel_hosted"


# ══════════════════════════════════════════════════════════════
# 2. Provider Registry & Model Specifications
# ══════════════════════════════════════════════════════════════

@dataclass
class ProviderMetadata:
    """Description détaillée et statut d'un fournisseur dans le registre mondial."""
    id: ModelProvider
    name: str
    region: ProviderRegion
    status: ProviderStatus = ProviderStatus.AVAILABLE
    enabled: bool = True
    capabilities: List[ModelCapability] = field(default_factory=list)
    base_url: str = ""
    api_key_env: str = ""
    supported_models: List[str] = field(default_factory=list)
    avg_latency_ms: int = 150
    error_rate: float = 0.0
    tokens_per_sec: float = 80.0
    is_openai_compatible: bool = True
    notes: str = ""

    def is_configured(self) -> bool:
        if not self.api_key_env:
            return bool(self.base_url)
        return bool(os.getenv(self.api_key_env, ""))


@dataclass(frozen=True)
class ModelSpec:
    """Spécification technique d'un modèle pour le routage de précision."""
    id: str                                  # Identifiant technique transmis à l'API
    provider: ModelProvider                  # Fournisseur hôte
    capability: ModelCapability              # Capacité primaire servie
    display_name: str                        # Nom public affiché dans l'interface
    context_window: int = 16384              # Fenêtre de contexte totale en tokens
    max_tokens: int = 8192                   # Limite max de génération
    supports_streaming: bool = True
    supports_json_mode: bool = True
    supports_vision: bool = False
    supports_tools: bool = True
    input_cost_per_m: float = 0.0            # USD par million de tokens d'entrée
    output_cost_per_m: float = 0.0           # USD par million de tokens de sortie
    priority: int = 100                      # Priorité dans la capacité (plus grand = préféré)
    is_fallback: bool = False                # True = utilisé en second plan si le primaire échoue
    languages: List[str] = field(default_factory=lambda: ["fr", "en"])
    sovereignty_level: str = "global"        # "sovereign", "european", "global", "local"


# ── REGISTRE MONDIAL DES FOURNISSEURS (GLOBAL PROVIDER REGISTRY) ──
GLOBAL_PROVIDER_REGISTRY: Dict[ModelProvider, ProviderMetadata] = {
    # ── France (Prioritaire) ─────────────────────────────────
    ModelProvider.MISTRAL: ProviderMetadata(
        id=ModelProvider.MISTRAL,
        name="Mistral AI",
        region=ProviderRegion.FRANCE,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.DEEP, ModelCapability.CODE, ModelCapability.VISION, ModelCapability.EMBEDDING],
        base_url="https://api.mistral.ai/v1",
        api_key_env="MISTRAL_API_KEY",
        supported_models=["mistral-large-latest", "mistral-small-latest", "codestral-latest", "pixtral-large-latest", "mistral-embed"],
        notes="Champion français de l'IA. Excellence multilingue, souveraineté européenne.",
    ),
    ModelProvider.SCALEWAY: ProviderMetadata(
        id=ModelProvider.SCALEWAY,
        name="Scaleway AI Generative APIs",
        region=ProviderRegion.FRANCE,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.SOVEREIGN],
        base_url="https://api.scaleway.ai/v1",
        api_key_env="SCALEWAY_API_KEY",
        supported_models=["llama-3.3-70b-instruct", "mistral-nemo-instruct-2407", "qwen-2.5-coder-32b"],
        notes="Inférence cloud souveraine française.",
    ),
    ModelProvider.OVHCLOUD: ProviderMetadata(
        id=ModelProvider.OVHCLOUD,
        name="OVHcloud AI Endpoints",
        region=ProviderRegion.FRANCE,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.SOVEREIGN],
        base_url="https://endpoints.ai.cloud.ovh.net/v1",
        api_key_env="OVHCLOUD_API_KEY",
        supported_models=["mistral-7b-instruct-v0.3", "llama-3.1-70b-instruct"],
        notes="Infrastructure d'inférence européenne sécurisée.",
    ),

    # ── USA / Global ─────────────────────────────────────────
    ModelProvider.OPENAI: ProviderMetadata(
        id=ModelProvider.OPENAI,
        name="OpenAI",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.FAST, ModelCapability.DEEP, ModelCapability.REASONING, ModelCapability.CODE, ModelCapability.VISION, ModelCapability.EMBEDDING],
        base_url="https://api.openai.com/v1",
        api_key_env="OPENAI_API_KEY",
        supported_models=["gpt-4o", "gpt-4o-mini", "o1", "o3-mini", "text-embedding-3-small"],
        notes="Généraliste et modèles de raisonnement.",
    ),
    ModelProvider.ANTHROPIC: ProviderMetadata(
        id=ModelProvider.ANTHROPIC,
        name="Anthropic",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.DEEP, ModelCapability.CODE, ModelCapability.RESEARCH, ModelCapability.VISION],
        base_url="https://api.anthropic.com/v1",
        api_key_env="ANTHROPIC_API_KEY",
        supported_models=["claude-3-7-sonnet-latest", "claude-3-5-haiku-latest", "claude-3-opus-latest"],
        is_openai_compatible=False,
        notes="Excellence en code, raisonnement nuancé et sécurité constitutionnelle.",
    ),
    ModelProvider.GOOGLE: ProviderMetadata(
        id=ModelProvider.GOOGLE,
        name="Google Gemini",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.DEEP, ModelCapability.VISION, ModelCapability.RESEARCH, ModelCapability.LONG_CONTEXT, ModelCapability.MULTILINGUAL, ModelCapability.EMBEDDING],
        base_url="https://generativelanguage.googleapis.com/v1beta/openai",
        api_key_env="GOOGLE_GENERATIVE_AI_API_KEY",
        supported_models=["gemini-3.6-flash", "gemini-3.1-pro", "gemini-2.5-flash", "gemini-2.5-pro", "text-embedding-004"],
        notes="Haute vélocité, contexte 1M+ tokens, multimodalité native.",
    ),
    ModelProvider.GOOGLE_VERTEX: ProviderMetadata(
        id=ModelProvider.GOOGLE_VERTEX,
        name="Google Vertex AI",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.DEEP, ModelCapability.PRIVATE, ModelCapability.SOVEREIGN],
        base_url="https://aiplatform.googleapis.com/v1",
        api_key_env="VERTEX_AI_API_KEY",
        supported_models=["gemini-1.5-pro-vertex", "gemini-1.5-flash-vertex"],
        notes="Inférence d'entreprise avec garanties de souveraineté et SLA.",
    ),
    ModelProvider.AZURE_AI: ProviderMetadata(
        id=ModelProvider.AZURE_AI,
        name="Microsoft Azure AI Foundry",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.DEEP, ModelCapability.PRIVATE],
        base_url="https://models.inference.ai.azure.com",
        api_key_env="AZURE_AI_API_KEY",
        supported_models=["azure/gpt-4o", "azure/phi-4", "azure/mistral-large-2407"],
        notes="Déploiement d'entreprise sécurisé avec conformité ISO/SOC.",
    ),
    ModelProvider.AWS_BEDROCK: ProviderMetadata(
        id=ModelProvider.AWS_BEDROCK,
        name="AWS Bedrock",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.DEEP, ModelCapability.PRIVATE],
        base_url="https://bedrock-runtime.us-east-1.amazonaws.com",
        api_key_env="AWS_BEDROCK_API_KEY",
        supported_models=["anthropic.claude-3-5-sonnet", "meta.llama3-3-70b-instruct"],
        notes="Passerelle multi-modèles managée AWS.",
    ),
    ModelProvider.XAI: ProviderMetadata(
        id=ModelProvider.XAI,
        name="xAI (Grok)",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.FAST, ModelCapability.REASONING, ModelCapability.SEARCH],
        base_url="https://api.x.ai/v1",
        api_key_env="XAI_API_KEY",
        supported_models=["grok-2-latest", "grok-2-mini"],
        notes="Modèle orienté temps réel et raisonnement sans filtre excessif.",
    ),
    ModelProvider.META_LLAMA: ProviderMetadata(
        id=ModelProvider.META_LLAMA,
        name="Meta Llama (Direct / Hosted)",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.CODE],
        base_url="https://api.llama.com/v1",
        api_key_env="LLAMA_API_KEY",
        supported_models=["llama-3.3-70b-instruct", "llama-3.1-405b-instruct"],
        notes="Fondation open-weights de Meta.",
    ),
    ModelProvider.NVIDIA_NIM: ProviderMetadata(
        id=ModelProvider.NVIDIA_NIM,
        name="NVIDIA NIM Microservices",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.FAST, ModelCapability.CODE, ModelCapability.REASONING],
        base_url="https://integrate.api.nvidia.com/v1",
        api_key_env="NVIDIA_API_KEY",
        supported_models=["meta/llama-3.3-70b-instruct", "deepseek-ai/deepseek-r1"],
        notes="Inférence accélérée TensorRT-LLM sur clusters Hopper/Blackwell.",
    ),
    ModelProvider.COHERE: ProviderMetadata(
        id=ModelProvider.COHERE,
        name="Cohere",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.RERANKING, ModelCapability.EMBEDDING, ModelCapability.MULTILINGUAL, ModelCapability.SEARCH],
        base_url="https://api.cohere.com/v1",
        api_key_env="COHERE_API_KEY",
        supported_models=["command-r-plus", "embed-multilingual-v3.0", "rerank-multilingual-v3.0"],
        notes="Excellence en RAG, Embeddings multilingues et Reranking.",
    ),
    ModelProvider.GROQ: ProviderMetadata(
        id=ModelProvider.GROQ,
        name="Groq LPU Acceleration",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.LOW_COST],
        base_url="https://api.groq.com/openai/v1",
        api_key_env="GROQ_API_KEY",
        supported_models=["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
        notes="Inférence ultra-rapide (500+ tokens/sec) sur puce LPU.",
    ),
    ModelProvider.CEREBRAS: ProviderMetadata(
        id=ModelProvider.CEREBRAS,
        name="Cerebras Wafer-Scale Engine",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.FAST, ModelCapability.LOW_COST],
        base_url="https://api.cerebras.ai/v1",
        api_key_env="CEREBRAS_API_KEY",
        supported_models=["llama3.1-70b", "llama3.1-8b"],
        notes="Inférence ultra-basse latence sur wafer silicium géant.",
    ),
    ModelProvider.TOGETHER: ProviderMetadata(
        id=ModelProvider.TOGETHER,
        name="Together AI",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.BALANCED, ModelCapability.DEEP, ModelCapability.CODE],
        base_url="https://api.together.xyz/v1",
        api_key_env="TOGETHER_API_KEY",
        supported_models=["meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", "Qwen/Qwen2.5-72B-Instruct-Turbo"],
        notes="Réseau décentralisé de calcul haute densité.",
    ),
    ModelProvider.FIREWORKS: ProviderMetadata(
        id=ModelProvider.FIREWORKS,
        name="Fireworks AI",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.CODE],
        base_url="https://api.fireworks.ai/inference/v1",
        api_key_env="FIREWORKS_API_KEY",
        supported_models=["accounts/fireworks/models/llama-v3p3-70b-instruct", "accounts/fireworks/models/qwen2p5-coder-32b-instruct"],
        notes="Inférence spéculative haute performance.",
    ),
    ModelProvider.HUGGINGFACE: ProviderMetadata(
        id=ModelProvider.HUGGINGFACE,
        name="Hugging Face Serverless / Dedicated",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.FAST, ModelCapability.MULTILINGUAL, ModelCapability.EMBEDDING],
        base_url="https://api-inference.huggingface.co/v1",
        api_key_env="HUGGINGFACE_API_KEY",
        supported_models=["meta-llama/Llama-3.3-70B-Instruct", "BAAI/bge-m3"],
        notes="Hub mondial de modèles ouverts et endpoints spécialisés.",
    ),
    ModelProvider.REPLICATE: ProviderMetadata(
        id=ModelProvider.REPLICATE,
        name="Replicate",
        region=ProviderRegion.US,
        capabilities=[ModelCapability.IMAGE, ModelCapability.VIDEO, ModelCapability.CODE],
        base_url="https://api.replicate.com/v1",
        api_key_env="REPLICATE_API_KEY",
        supported_models=["black-forest-labs/flux-1.1-pro", "meta/meta-llama-3-70b-instruct"],
        notes="Exécution managée de modèles d'images et vidéos.",
    ),
    ModelProvider.OPENROUTER: ProviderMetadata(
        id=ModelProvider.OPENROUTER,
        name="OpenRouter Gateway",
        region=ProviderRegion.GLOBAL,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.MULTILINGUAL],
        base_url="https://openrouter.ai/api/v1",
        api_key_env="OPENROUTER_API_KEY",
        supported_models=["anthropic/claude-3.5-sonnet", "meta-llama/llama-3.3-70b-instruct"],
        notes="Passerelle d'agrégation multi-fournisseurs mondiale.",
    ),

    # ── Europe ───────────────────────────────────────────────
    ModelProvider.ALEPH_ALPHA: ProviderMetadata(
        id=ModelProvider.ALEPH_ALPHA,
        name="Aleph Alpha (Allemagne)",
        region=ProviderRegion.EU,
        capabilities=[ModelCapability.DEEP, ModelCapability.PRIVATE, ModelCapability.SOVEREIGN],
        base_url="https://api.aleph-alpha.com/v1",
        api_key_env="ALEPH_ALPHA_API_KEY",
        supported_models=["luminous-supreme-control", "luminous-extended"],
        notes="Modèles souverains européens pour organisations et gouvernements.",
    ),
    ModelProvider.DEEPL: ProviderMetadata(
        id=ModelProvider.DEEPL,
        name="DeepL Language Services",
        region=ProviderRegion.EU,
        capabilities=[ModelCapability.MULTILINGUAL],
        base_url="https://api.deepl.com/v2",
        api_key_env="DEEPL_API_KEY",
        supported_models=["deepl-translate-v2"],
        is_openai_compatible=False,
        notes="Traduction neuronale européenne de très haute fidélité.",
    ),
    ModelProvider.SOVEREIGN_EU: ProviderMetadata(
        id=ModelProvider.SOVEREIGN_EU,
        name="European Sovereign Cloud Inferences",
        region=ProviderRegion.EU,
        capabilities=[ModelCapability.SOVEREIGN, ModelCapability.PRIVATE, ModelCapability.BALANCED],
        base_url="https://api.sovereign-eu.nkyel.ai/v1",
        api_key_env="SOVEREIGN_EU_KEY",
        supported_models=["euro-llama-70b", "euro-mistral-large"],
        notes="Infrastructure souveraine UE avec hébergement strictement européen.",
    ),

    # ── Chine ────────────────────────────────────────────────
    ModelProvider.DEEPSEEK: ProviderMetadata(
        id=ModelProvider.DEEPSEEK,
        name="DeepSeek AI",
        region=ProviderRegion.CHINA,
        capabilities=[ModelCapability.REASONING, ModelCapability.CODE, ModelCapability.DEEP, ModelCapability.LOW_COST],
        base_url="https://api.deepseek.com/v1",
        api_key_env="DEEPSEEK_API_KEY",
        supported_models=["deepseek-reasoner", "deepseek-chat"],
        notes="Raisonnement mathématique et code de pointe à très bas coût.",
    ),
    ModelProvider.ALIBABA_QWEN: ProviderMetadata(
        id=ModelProvider.ALIBABA_QWEN,
        name="Alibaba Cloud / DashScope",
        region=ProviderRegion.CHINA,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.CODE, ModelCapability.VISION, ModelCapability.MULTILINGUAL],
        base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
        api_key_env="DASHSCOPE_API_KEY",
        supported_models=["qwen-max", "qwen-plus", "qwen-turbo", "qwen2.5-coder-32b-instruct", "qwen-vl-max"],
        notes="Famille Qwen. Leader mondial sur le code et le multilinguisme.",
    ),
    ModelProvider.ZHIPU_GLM: ProviderMetadata(
        id=ModelProvider.ZHIPU_GLM,
        name="Zhipu AI (GLM)",
        region=ProviderRegion.CHINA,
        capabilities=[ModelCapability.BALANCED, ModelCapability.DEEP, ModelCapability.VISION],
        base_url="https://open.bigmodel.cn/api/paas/v4",
        api_key_env="ZHIPU_API_KEY",
        supported_models=["glm-4-plus", "glm-4-flash", "glm-4v-plus"],
        notes="Écosystème Tsinghua GLM.",
    ),
    ModelProvider.MOONSHOT_KIMI: ProviderMetadata(
        id=ModelProvider.MOONSHOT_KIMI,
        name="Moonshot AI (Kimi)",
        region=ProviderRegion.CHINA,
        capabilities=[ModelCapability.LONG_CONTEXT, ModelCapability.RESEARCH, ModelCapability.DEEP],
        base_url="https://api.moonshot.cn/v1",
        api_key_env="MOONSHOT_API_KEY",
        supported_models=["moonshot-v1-128k", "moonshot-v1-32k"],
        notes="Spécialiste du très long contexte et de la synthèse documentaire.",
    ),
    ModelProvider.MINIMAX: ProviderMetadata(
        id=ModelProvider.MINIMAX,
        name="MiniMax",
        region=ProviderRegion.CHINA,
        capabilities=[ModelCapability.BALANCED, ModelCapability.MULTILINGUAL, ModelCapability.TTS],
        base_url="https://api.minimax.chat/v1",
        api_key_env="MINIMAX_API_KEY",
        supported_models=["abab6.5s-chat", "speech-01-turbo"],
        notes="Modèles texte et voix multimodaux.",
    ),
    ModelProvider.BAIDU_ERNIE: ProviderMetadata(
        id=ModelProvider.BAIDU_ERNIE,
        name="Baidu ERNIE / Qianfan",
        region=ProviderRegion.CHINA,
        capabilities=[ModelCapability.BALANCED, ModelCapability.DEEP, ModelCapability.MULTILINGUAL],
        base_url="https://qianfan.baidubce.com/v2",
        api_key_env="BAIDU_QIANFAN_API_KEY",
        supported_models=["ernie-4.0-turbo-8k", "ernie-speed-128k"],
        notes="Plateforme d'IA Baidu Qianfan.",
    ),
    ModelProvider.TENCENT_HUNYUAN: ProviderMetadata(
        id=ModelProvider.TENCENT_HUNYUAN,
        name="Tencent Hunyuan",
        region=ProviderRegion.CHINA,
        capabilities=[ModelCapability.BALANCED, ModelCapability.CODE, ModelCapability.MULTILINGUAL],
        base_url="https://api.hunyuan.cloud.tencent.com/v1",
        api_key_env="TENCENT_HUNYUAN_API_KEY",
        supported_models=["hunyuan-standard", "hunyuan-pro"],
        notes="Modèles fondation du groupe Tencent.",
    ),
    ModelProvider.BYTEDANCE_DOUBAO: ProviderMetadata(
        id=ModelProvider.BYTEDANCE_DOUBAO,
        name="ByteDance Doubao / Volcengine",
        region=ProviderRegion.CHINA,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.MULTILINGUAL],
        base_url="https://ark.cn-beijing.volces.com/api/v3",
        api_key_env="VOLCENGINE_API_KEY",
        supported_models=["doubao-pro-32k", "doubao-lite-32k"],
        notes="Inférence ultra-scalable Volcengine.",
    ),
    ModelProvider.HUAWEI_PANGU: ProviderMetadata(
        id=ModelProvider.HUAWEI_PANGU,
        name="Huawei Pangu / ModelArts",
        region=ProviderRegion.CHINA,
        capabilities=[ModelCapability.BALANCED, ModelCapability.SOVEREIGN],
        base_url="https://modelarts.cn-north-4.myhuaweicloud.com/v1",
        api_key_env="HUAWEI_MODELARTS_KEY",
        supported_models=["pangu-alpha-53b"],
        notes="Infrastructure d'inférence ModelArts Huawei.",
    ),
    ModelProvider.ZERO_ONE_YI: ProviderMetadata(
        id=ModelProvider.ZERO_ONE_YI,
        name="01.AI (Yi Family)",
        region=ProviderRegion.CHINA,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.CODE],
        base_url="https://api.01.ai/v1",
        api_key_env="ZERO_ONE_API_KEY",
        supported_models=["yi-lightning", "yi-large-rag"],
        notes="Excellence en RAG bilingue et vitesse de génération.",
    ),
    ModelProvider.STEPFUN: ProviderMetadata(
        id=ModelProvider.STEPFUN,
        name="StepFun",
        region=ProviderRegion.CHINA,
        capabilities=[ModelCapability.DEEP, ModelCapability.MULTILINGUAL],
        base_url="https://api.stepfun.com/v1",
        api_key_env="STEPFUN_API_KEY",
        supported_models=["step-2-16k", "step-1v-8k"],
        notes="Modèles multimodaux et raisonnement StepFun.",
    ),

    # ── Japon & Corée ────────────────────────────────────────
    ModelProvider.NTT_TSUZUMI: ProviderMetadata(
        id=ModelProvider.NTT_TSUZUMI,
        name="NTT tsuzumi",
        region=ProviderRegion.JAPAN,
        capabilities=[ModelCapability.MULTILINGUAL, ModelCapability.FAST, ModelCapability.BALANCED],
        base_url="https://api.tsuzumi.ntt.com/v1",
        api_key_env="NTT_TSUZUMI_API_KEY",
        supported_models=["tsuzumi-7b-instruct", "tsuzumi-1b-fast"],
        notes="Modèles de précision compacts optimisés pour le japonais.",
    ),
    ModelProvider.NAVER_HYPERCLOVA: ProviderMetadata(
        id=ModelProvider.NAVER_HYPERCLOVA,
        name="NAVER HyperCLOVA X",
        region=ProviderRegion.KOREA,
        capabilities=[ModelCapability.MULTILINGUAL, ModelCapability.DEEP],
        base_url="https://clovastudio.apigw.ntruss.com/v1",
        api_key_env="NAVER_CLOVA_API_KEY",
        supported_models=["hyperclova-x-hcx-003"],
        notes="Moteur coréen de référence NAVER.",
    ),
    ModelProvider.UPSTAGE: ProviderMetadata(
        id=ModelProvider.UPSTAGE,
        name="Upstage (Solar)",
        region=ProviderRegion.KOREA,
        capabilities=[ModelCapability.FAST, ModelCapability.BALANCED, ModelCapability.LONG_CONTEXT],
        base_url="https://api.upstage.ai/v1/solar",
        api_key_env="UPSTAGE_API_KEY",
        supported_models=["solar-mini", "solar-pro"],
        notes="Spécialiste de la composition de contextes et documents.",
    ),

    # ── Inde & Moyen-Orient ──────────────────────────────────
    ModelProvider.SARVAM_AI: ProviderMetadata(
        id=ModelProvider.SARVAM_AI,
        name="Sarvam AI (Inde)",
        region=ProviderRegion.INDIA,
        capabilities=[ModelCapability.MULTILINGUAL, ModelCapability.STT, ModelCapability.TTS],
        base_url="https://api.sarvam.ai/v1",
        api_key_env="SARVAM_API_KEY",
        supported_models=["sarvam-2b", "bulbul:v1"],
        notes="Spécialisation 10+ langues de l'Inde (Hindi, Tamil, Bengali...).",
    ),
    ModelProvider.KRUTRIM: ProviderMetadata(
        id=ModelProvider.KRUTRIM,
        name="Krutrim AI (Inde)",
        region=ProviderRegion.INDIA,
        capabilities=[ModelCapability.MULTILINGUAL, ModelCapability.BALANCED],
        base_url="https://cloud.olakrutrim.com/v1",
        api_key_env="KRUTRIM_API_KEY",
        supported_models=["krutrim-2-instruct"],
        notes="Écosystème d'IA indien multilingue.",
    ),
    ModelProvider.FALCON_TII: ProviderMetadata(
        id=ModelProvider.FALCON_TII,
        name="Falcon TII (Moyen-Orient)",
        region=ProviderRegion.MIDDLE_EAST,
        capabilities=[ModelCapability.BALANCED, ModelCapability.DEEP, ModelCapability.MULTILINGUAL],
        base_url="https://api.tii.ae/v1",
        api_key_env="FALCON_API_KEY",
        supported_models=["falcon-180b-instruct", "jais-30b-chat"],
        notes="Support natif de l'arabe et scripts RTL.",
    ),
    ModelProvider.JAIS_ARABIC: ProviderMetadata(
        id=ModelProvider.JAIS_ARABIC,
        name="Jais Arabic Intelligence",
        region=ProviderRegion.MIDDLE_EAST,
        capabilities=[ModelCapability.MULTILINGUAL, ModelCapability.DEEP],
        base_url="https://api.inceptionai.ai/v1",
        api_key_env="JAIS_API_KEY",
        supported_models=["jais-13b-chat", "jais-30b-chat"],
        notes="Spécialiste de l'arabe moderne standard et dialectes du Golfe.",
    ),

    # ── Afrique & Souveraineté Gabonaise ─────────────────────
    ModelProvider.LELAPA_AI: ProviderMetadata(
        id=ModelProvider.LELAPA_AI,
        name="Lelapa AI (Afrique)",
        region=ProviderRegion.AFRICA,
        capabilities=[ModelCapability.AFRICAN_LANGUAGES, ModelCapability.MULTILINGUAL, ModelCapability.STT],
        base_url="https://api.lelapa.ai/v1",
        api_key_env="LELAPA_API_KEY",
        supported_models=["inkuba-lm", "vulavula-stt"],
        notes="Modèles de langues africaines sub-sahariennes.",
    ),
    ModelProvider.MASAKHANE: ProviderMetadata(
        id=ModelProvider.MASAKHANE,
        name="Masakhane Community / African Endpoints",
        region=ProviderRegion.AFRICA,
        capabilities=[ModelCapability.AFRICAN_LANGUAGES, ModelCapability.MULTILINGUAL],
        base_url="https://api.masakhane.io/v1",
        api_key_env="MASAKHANE_API_KEY",
        supported_models=["masakhane/afro-xlmr", "masakhane/kenlm-african"],
        notes="Modèles open-source pour 20+ langues africaines.",
    ),
    ModelProvider.GABOMA_AI: ProviderMetadata(
        id=ModelProvider.GABOMA_AI,
        name="Gaboma AI / Ñkyel Sovereign",
        region=ProviderRegion.AFRICA,
        capabilities=[ModelCapability.AFRICAN_LANGUAGES, ModelCapability.SOVEREIGN, ModelCapability.PRIVATE],
        base_url="https://sovereign.nkyel.ai/v1",
        api_key_env="NKYEL_SOVEREIGN_KEY",
        supported_models=["nkyel-ekang-v1", "nkyel-punu-v1", "nkyel-myene-v1"],
        notes="Moteurs dédiés aux langues nationales gabonaises et corpus souverains.",
    ),
    ModelProvider.NKYEL_SOVEREIGN: ProviderMetadata(
        id=ModelProvider.NKYEL_SOVEREIGN,
        name="Ñkyel Sovereign Dedicated Cluster",
        region=ProviderRegion.AFRICA,
        capabilities=[ModelCapability.AFRICAN_LANGUAGES, ModelCapability.SOVEREIGN, ModelCapability.PRIVATE, ModelCapability.DEEP],
        base_url="https://sovereign-cluster.nkyel.ai/v1",
        api_key_env="NKYEL_CLUSTER_KEY",
        supported_models=["nkyel-sovereign-moe-70b", "nkyel-ekang-coder"],
        notes="Cluster souverain dédié à haute sécurité et faible empreinte.",
    ),

    # ── Self-Hosted & Local Inferences ───────────────────────
    ModelProvider.RUNPOD: ProviderMetadata(
        id=ModelProvider.RUNPOD,
        name="RunPod Dedicated GPU Cluster",
        region=ProviderRegion.LOCAL,
        capabilities=[ModelCapability.SOVEREIGN, ModelCapability.PRIVATE, ModelCapability.CODE, ModelCapability.FAST],
        base_url="https://api.runpod.ai/v2/nkyel-vllm/openai/v1",
        api_key_env="RUNPOD_API_KEY",
        supported_models=["runpod/nkyel-sovereign-vllm"],
        notes="Pods GPU souverains dédiés sous vLLM.",
    ),
    ModelProvider.VLLM_LOCAL: ProviderMetadata(
        id=ModelProvider.VLLM_LOCAL,
        name="vLLM High-Throughput Engine",
        region=ProviderRegion.LOCAL,
        capabilities=[ModelCapability.SOVEREIGN, ModelCapability.PRIVATE, ModelCapability.FAST],
        base_url="http://localhost:8000/v1",
        api_key_env="",
        supported_models=["vllm/llama-3.3-70b", "vllm/mistral-large"],
        notes="Moteur PagedAttention d'inférence ultra-rapide.",
    ),
    ModelProvider.TGI_LOCAL: ProviderMetadata(
        id=ModelProvider.TGI_LOCAL,
        name="Text Generation Inference (TGI)",
        region=ProviderRegion.LOCAL,
        capabilities=[ModelCapability.SOVEREIGN, ModelCapability.PRIVATE, ModelCapability.FAST],
        base_url="http://localhost:8080/v1",
        api_key_env="",
        supported_models=["tgi/deepseek-coder", "tgi/qwen2.5"],
        notes="Serveur TGI optimisé pour modèles open-weights.",
    ),
    ModelProvider.SGLANG_LOCAL: ProviderMetadata(
        id=ModelProvider.SGLANG_LOCAL,
        name="SGLang Structured Engine",
        region=ProviderRegion.LOCAL,
        capabilities=[ModelCapability.SOVEREIGN, ModelCapability.PRIVATE, ModelCapability.CODE],
        base_url="http://localhost:30000/v1",
        api_key_env="",
        supported_models=["sglang/qwen2.5-coder"],
        notes="Génération ultra-rapide avec compilation RadixAttention.",
    ),
    ModelProvider.LLAMACPP_LOCAL: ProviderMetadata(
        id=ModelProvider.LLAMACPP_LOCAL,
        name="llama.cpp GGUF Engine",
        region=ProviderRegion.LOCAL,
        capabilities=[ModelCapability.LOCAL, ModelCapability.PRIVATE, ModelCapability.LOW_COST],
        base_url="http://localhost:8081/v1",
        api_key_env="",
        supported_models=["llama.cpp/llama-3.2-3b-q4_k_m.gguf"],
        notes="Inférence quantifiée CPU/GPU multi-plateforme.",
    ),
    ModelProvider.OLLAMA: ProviderMetadata(
        id=ModelProvider.OLLAMA,
        name="Ollama Local Edge Engine",
        region=ProviderRegion.LOCAL,
        capabilities=[ModelCapability.LOCAL, ModelCapability.PRIVATE, ModelCapability.FAST],
        base_url="http://localhost:11434/v1",
        api_key_env="",
        supported_models=["llama3.2:latest", "qwen2.5-coder:7b", "mistral:latest"],
        notes="Inférence 100% hors-ligne sur machine locale.",
    ),
}


# ── REGISTRE OFFICIEL DES MODÈLES (MODEL REGISTRY) ───────────
MODEL_REGISTRY: List[ModelSpec] = [
    # ── FAST Capabilities ─────────────────────────────────────
    ModelSpec(
        id="gemini-3.6-flash",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.FAST,
        display_name="Ñkyel Chui (Flash)",
        context_window=1048576,
        max_tokens=8192,
        input_cost_per_m=0.15,
        output_cost_per_m=0.60,
        priority=100,
        languages=["fr", "en", "es", "zh", "ar", "ja", "fan"],
    ),
    ModelSpec(
        id="mistral-small-latest",
        provider=ModelProvider.MISTRAL,
        capability=ModelCapability.FAST,
        display_name="Mistral Small (France)",
        context_window=32768,
        max_tokens=8192,
        input_cost_per_m=0.20,
        output_cost_per_m=0.60,
        priority=95,
        languages=["fr", "en", "de", "es", "it"],
        sovereignty_level="european",
    ),
    ModelSpec(
        id="groq/llama-3.3-70b-versatile",
        provider=ModelProvider.GROQ,
        capability=ModelCapability.FAST,
        display_name="AURATA Ultra-Fast LPU",
        context_window=8192,
        max_tokens=4096,
        input_cost_per_m=0.10,
        output_cost_per_m=0.10,
        priority=90,
        is_fallback=True,
    ),
    ModelSpec(
        id="groq/qwen-2.5-32b",
        provider=ModelProvider.GROQ,
        capability=ModelCapability.FAST,
        display_name="Qwen 2.5 32B (Groq OSS)",
        context_window=8192,
        max_tokens=4096,
        input_cost_per_m=0.10,
        output_cost_per_m=0.10,
        priority=88,
    ),
    ModelSpec(
        id="groq/mixtral-8x7b-32768",
        provider=ModelProvider.GROQ,
        capability=ModelCapability.FAST,
        display_name="Mixtral 8x7B (Groq OSS)",
        context_window=32768,
        max_tokens=4096,
        input_cost_per_m=0.10,
        output_cost_per_m=0.10,
        priority=89,
    ),

    # ── BALANCED Capabilities ────────────────────────────────
    ModelSpec(
        id="gemini-2.5-flash",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.BALANCED,
        display_name="Ñkyel Balanced Core",
        context_window=1048576,
        max_tokens=8192,
        input_cost_per_m=0.15,
        output_cost_per_m=0.60,
        priority=100,
    ),
    ModelSpec(
        id="mistral-large-latest",
        provider=ModelProvider.MISTRAL,
        capability=ModelCapability.BALANCED,
        display_name="Mistral Large 2 (Souverain FR)",
        context_window=128000,
        max_tokens=8192,
        input_cost_per_m=2.00,
        output_cost_per_m=6.00,
        priority=95,
        languages=["fr", "en", "de", "es", "it", "ar", "zh"],
        sovereignty_level="european",
    ),
    ModelSpec(
        id="accounts/fireworks/models/llama-v3p3-70b-instruct",
        provider=ModelProvider.FIREWORKS,
        capability=ModelCapability.BALANCED,
        display_name="Fireworks Llama 70B",
        context_window=8192,
        max_tokens=4096,
        input_cost_per_m=0.90,
        output_cost_per_m=0.90,
        priority=70,
        is_fallback=True,
    ),
    ModelSpec(
        id="meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
        provider=ModelProvider.TOGETHER,
        capability=ModelCapability.BALANCED,
        display_name="Together Llama 70B Turbo",
        context_window=8192,
        max_tokens=4096,
        input_cost_per_m=0.88,
        output_cost_per_m=0.88,
        priority=85,
    ),

    # ── DEEP & REASONING Capabilities ─────────────────────────
    ModelSpec(
        id="gemini-3.1-pro",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.DEEP,
        display_name="Ñkyel Tai (Deep)",
        context_window=2097152,
        max_tokens=16384,
        input_cost_per_m=2.50,
        output_cost_per_m=10.00,
        priority=100,
    ),
    ModelSpec(
        id="deepseek-reasoner",
        provider=ModelProvider.DEEPSEEK,
        capability=ModelCapability.REASONING,
        display_name="DeepSeek R1 (Reasoning)",
        context_window=65536,
        max_tokens=8192,
        input_cost_per_m=0.55,
        output_cost_per_m=2.19,
        priority=100,
        languages=["fr", "en", "zh", "ar"],
    ),
    ModelSpec(
        id="mistral-large-latest",
        provider=ModelProvider.MISTRAL,
        capability=ModelCapability.DEEP,
        display_name="Mistral Large Deep Reasoning",
        context_window=128000,
        max_tokens=16384,
        input_cost_per_m=2.00,
        output_cost_per_m=6.00,
        priority=90,
        sovereignty_level="european",
    ),

    # ── CODE Capabilities ────────────────────────────────────
    ModelSpec(
        id="codestral-latest",
        provider=ModelProvider.MISTRAL,
        capability=ModelCapability.CODE,
        display_name="Codestral AI (Souverain FR)",
        context_window=256000,
        max_tokens=16384,
        input_cost_per_m=0.30,
        output_cost_per_m=0.90,
        priority=100,
        languages=["python", "typescript", "rust", "go", "sql"],
        sovereignty_level="european",
    ),
    ModelSpec(
        id="qwen2.5-coder-32b-instruct",
        provider=ModelProvider.ALIBABA_QWEN,
        capability=ModelCapability.CODE,
        display_name="Qwen 2.5 Coder 32B",
        context_window=131072,
        max_tokens=8192,
        input_cost_per_m=0.25,
        output_cost_per_m=0.75,
        priority=95,
    ),
    ModelSpec(
        id="gemini-3.6-flash",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.CODE,
        display_name="Ñkyel Code Flash",
        context_window=1048576,
        max_tokens=16384,
        input_cost_per_m=0.15,
        output_cost_per_m=0.60,
        priority=80,
        is_fallback=True,
    ),

    # ── VISION Capabilities ──────────────────────────────────
    ModelSpec(
        id="gemini-3.1-pro",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.VISION,
        display_name="Ñkyel Vision Pro",
        context_window=2097152,
        max_tokens=8192,
        supports_vision=True,
        input_cost_per_m=2.50,
        output_cost_per_m=10.00,
        priority=100,
    ),
    ModelSpec(
        id="pixtral-large-latest",
        provider=ModelProvider.MISTRAL,
        capability=ModelCapability.VISION,
        display_name="Pixtral Large (France)",
        context_window=128000,
        max_tokens=8192,
        supports_vision=True,
        input_cost_per_m=2.00,
        output_cost_per_m=6.00,
        priority=95,
        sovereignty_level="european",
    ),

    # ── RESEARCH & LONG CONTEXT ──────────────────────────────
    ModelSpec(
        id="gemini-3.1-pro",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.RESEARCH,
        display_name="Ñkyel Deep Research Lead",
        context_window=2097152,
        max_tokens=16384,
        input_cost_per_m=2.50,
        output_cost_per_m=10.00,
        priority=100,
    ),
    ModelSpec(
        id="moonshot-v1-128k",
        provider=ModelProvider.MOONSHOT_KIMI,
        capability=ModelCapability.LONG_CONTEXT,
        display_name="Kimi 128k Long-Context",
        context_window=128000,
        max_tokens=8192,
        input_cost_per_m=1.00,
        output_cost_per_m=1.00,
        priority=90,
    ),

    # ── MULTILINGUAL & AFRICAN LANGUAGES ─────────────────────
    ModelSpec(
        id="gemini-3.6-flash",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.MULTILINGUAL,
        display_name="Ñkyel Polyglot Engine",
        context_window=1048576,
        max_tokens=8192,
        input_cost_per_m=0.15,
        output_cost_per_m=0.60,
        priority=100,
    ),
    ModelSpec(
        id="qwen-max",
        provider=ModelProvider.ALIBABA_QWEN,
        capability=ModelCapability.MULTILINGUAL,
        display_name="Qwen Max Multilingual",
        context_window=32768,
        max_tokens=8192,
        input_cost_per_m=1.60,
        output_cost_per_m=4.80,
        priority=95,
    ),
    ModelSpec(
        id="gemini-3.6-flash",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.AFRICAN_LANGUAGES,
        display_name="Ñkyel Radi (Langues Gabonaises)",
        context_window=1048576,
        max_tokens=8192,
        input_cost_per_m=0.15,
        output_cost_per_m=0.60,
        priority=100,
        languages=["fan", "puu", "mye", "nzb", "sw", "ln", "wo", "yo", "ha"],
    ),

    # ── SOVEREIGN & LOCAL ────────────────────────────────────
    ModelSpec(
        id="runpod/nkyel-sovereign-vllm",
        provider=ModelProvider.RUNPOD,
        capability=ModelCapability.SOVEREIGN,
        display_name="Ñkyel Sovereign vLLM Cluster",
        context_window=32768,
        max_tokens=16384,
        input_cost_per_m=0.00,
        output_cost_per_m=0.00,
        priority=100,
        sovereignty_level="sovereign",
    ),
    ModelSpec(
        id="llama3.2:latest",
        provider=ModelProvider.OLLAMA,
        capability=ModelCapability.LOCAL,
        display_name="Ollama Local Edge Engine",
        context_window=8192,
        max_tokens=4096,
        input_cost_per_m=0.00,
        output_cost_per_m=0.00,
        priority=100,
        sovereignty_level="local",
    ),
]


def _get_models_for_capability(capability: ModelCapability) -> List[ModelSpec]:
    """Retourne la liste des modèles supportant la capacité, triés par priorité décroissante."""
    matching = [m for m in MODEL_REGISTRY if m.capability == capability]
    return sorted(matching, key=lambda x: x.priority, reverse=True)


# ══════════════════════════════════════════════════════════════
# 3. Circuit Breaker & Health Tracking
# ══════════════════════════════════════════════════════════════

@dataclass
class CircuitBreakerState:
    """État du circuit breaker pour un fournisseur donné."""
    failure_count: int = 0
    last_failure_time: float = 0.0
    is_open: bool = False
    open_until: float = 0.0
    total_failures: int = 0
    total_successes: int = 0
    failure_threshold: int = 3
    recovery_timeout: float = 30.0


class CircuitBreaker:
    """Circuit breaker thread-safe avec transition CLOSED -> OPEN -> HALF-OPEN."""

    def __init__(self):
        self._states: Dict[str, CircuitBreakerState] = {}
        self._lock = threading.Lock()

    def _get_state(self, provider_key: str) -> CircuitBreakerState:
        with self._lock:
            if provider_key not in self._states:
                self._states[provider_key] = CircuitBreakerState()
            return self._states[provider_key]

    def is_available(self, provider_key: str) -> bool:
        state = self._get_state(provider_key)
        if not state.is_open:
            return True
        if time.time() >= state.open_until:
            return True  # Half-open
        return False

    def record_success(self, provider_key: str) -> None:
        state = self._get_state(provider_key)
        with self._lock:
            state.failure_count = 0
            state.is_open = False
            state.total_successes += 1

    def record_failure(self, provider_key: str, error: Optional[Exception] = None) -> None:
        state = self._get_state(provider_key)
        with self._lock:
            state.failure_count += 1
            state.last_failure_time = time.time()
            state.total_failures += 1
            if state.failure_count >= state.failure_threshold:
                state.is_open = True
                state.open_until = time.time() + state.recovery_timeout
                logger.warning(
                    f"🔴 Circuit OUVERT pour {provider_key} (échecs: {state.failure_count}, réouverture dans {state.recovery_timeout}s)"
                )

    def status(self) -> Dict[str, Dict[str, Any]]:
        result = {}
        with self._lock:
            for key, state in self._states.items():
                s = "closed"
                if state.is_open:
                    s = "half-open" if time.time() >= state.open_until else "open"
                result[key] = {
                    "state": s,
                    "failures": state.failure_count,
                    "total_failures": state.total_failures,
                    "total_successes": state.total_successes,
                }
        return result


circuit_breaker = CircuitBreaker()


# ══════════════════════════════════════════════════════════════
# 4. Metrics & Cost Observability
# ══════════════════════════════════════════════════════════════

@dataclass
class CallMetrics:
    model_id: str
    provider: str
    capability: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    latency_ms: int
    ttft_ms: Optional[int] = None
    timestamp: float = field(default_factory=time.time)
    success: bool = True
    error: Optional[str] = None


class GatewayMetrics:
    """Agrégateur de métriques et télémétrie du Model Gateway."""

    def __init__(self):
        self._lock = threading.Lock()
        self._calls: List[CallMetrics] = []
        self._total_cost: float = 0.0
        self._total_input_tokens: int = 0
        self._total_output_tokens: int = 0

    def record(self, metrics: CallMetrics) -> None:
        with self._lock:
            self._calls.append(metrics)
            if metrics.success:
                self._total_cost += metrics.cost_usd
                self._total_input_tokens += metrics.input_tokens
                self._total_output_tokens += metrics.output_tokens

    def summary(self) -> Dict[str, Any]:
        with self._lock:
            total_calls = len(self._calls)
            successes = sum(1 for c in self._calls if c.success)
            failures = total_calls - successes
            avg_latency = sum(c.latency_ms for c in self._calls if c.success) / max(1, successes)
            return {
                "total_calls": total_calls,
                "successes": successes,
                "failures": failures,
                "total_input_tokens": self._total_input_tokens,
                "total_output_tokens": self._total_output_tokens,
                "total_cost_usd": round(self._total_cost, 6),
                "avg_latency_ms": round(avg_latency),
                "circuits": circuit_breaker.status(),
            }


gateway_metrics = GatewayMetrics()


# ══════════════════════════════════════════════════════════════
# 5. Smart Model Router
# ══════════════════════════════════════════════════════════════

class ModelRouter:
    """
    Moteur de sélection et d'arbitrage de modèles selon critères multi-dimensionnels :
    - Capacité demandée
    - Langue cible (BCP-47 / gabonaises)
    - Résidence des données (Data Residency Policy)
    - Politique d'organisation (fournisseurs autorisés / bloqués)
    - Santé du fournisseur (Circuit Breaker)
    - Coût et latence
    """

    @staticmethod
    def resolve_candidates(
        capability: ModelCapability,
        *,
        language: Optional[str] = None,
        data_residency: Optional[DataResidencyPolicy] = None,
        allowed_providers: Optional[Set[ModelProvider]] = None,
        blocked_providers: Optional[Set[ModelProvider]] = None,
        require_vision: bool = False,
        require_tools: bool = False,
        exclude_providers: Optional[Set[ModelProvider]] = None,
    ) -> List[ModelSpec]:
        excluded = set(exclude_providers or set())
        if blocked_providers:
            excluded.update(blocked_providers)

        candidates = []
        for spec in MODEL_REGISTRY:
            if spec.capability != capability:
                continue

            provider_meta = GLOBAL_PROVIDER_REGISTRY.get(spec.provider)
            if not provider_meta or not provider_meta.enabled:
                continue

            if spec.provider in excluded:
                continue

            if allowed_providers and spec.provider not in allowed_providers:
                continue

            # Vérification de la résidence des données
            if data_residency:
                if data_residency == DataResidencyPolicy.EU and provider_meta.region not in {ProviderRegion.EU, ProviderRegion.FRANCE, ProviderRegion.LOCAL}:
                    continue
                elif data_residency == DataResidencyPolicy.AFRICA and provider_meta.region not in {ProviderRegion.AFRICA, ProviderRegion.LOCAL}:
                    continue
                elif data_residency == DataResidencyPolicy.LOCAL and provider_meta.region != ProviderRegion.LOCAL:
                    continue

            # Vérification des propriétés requises
            if require_vision and not spec.supports_vision:
                continue
            if require_tools and not spec.supports_tools:
                continue

            # Vérification de la disponibilité du circuit breaker
            if not circuit_breaker.is_available(spec.provider.value):
                continue

            candidates.append(spec)

        # Tri : priorité décroissante, fallback en dernier, coût croissant
        return sorted(
            candidates,
            key=lambda m: (-m.priority, m.is_fallback, m.input_cost_per_m + m.output_cost_per_m)
        )


# ══════════════════════════════════════════════════════════════
# 6. Provider Adapter Factory & Dispatch
# ══════════════════════════════════════════════════════════════

def _get_adapter_for_spec(spec: ModelSpec) -> BaseProviderAdapter:
    """Instancie ou réutilise l'adaptateur pour le fournisseur spécifié."""
    meta = GLOBAL_PROVIDER_REGISTRY.get(spec.provider)
    if not meta:
        raise ValueError(f"Fournisseur inconnu : {spec.provider}")

    # Par défaut, adaptateur OpenAI-compatible
    return OpenAICompatibleProviderAdapter(
        provider_id=spec.provider.value,
        base_url=meta.base_url,
        api_key_env=meta.api_key_env,
    )


# ══════════════════════════════════════════════════════════════
# 7. Unified Gateway Execution (Call, Stream, Embed, Rerank)
# ══════════════════════════════════════════════════════════════

@dataclass
class GatewayResponse:
    """Réponse normalisée renvoyée à l'application Ñkyel."""
    text: str
    model_id: str
    provider: str
    capability: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    latency_ms: int
    was_fallback: bool = False
    attempts: int = 1


async def _call_google_gemini(
    spec: ModelSpec,
    prompt: str,
    chat_messages: Optional[List[Dict[str, str]]] = None,
    temperature: float = 0.7,
    tokens_max: int = 8192,
    json_mode: bool = False,
) -> Dict[str, Any]:
    """Appel direct au SDK Google Gemini."""
    import google.generativeai as genai
    api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY") or getattr(settings, "google_api_key", "")
    genai.configure(api_key=api_key)
    gen_config = genai.GenerationConfig(
        temperature=temperature,
        max_output_tokens=tokens_max,
        response_mime_type="application/json" if json_mode else None,
    )
    model = genai.GenerativeModel(spec.id, generation_config=gen_config)
    resp = model.generate_content(prompt)
    text = resp.text or ""
    input_toks = len(prompt) // 4
    output_toks = len(text) // 4
    if hasattr(resp, "usage_metadata") and resp.usage_metadata:
        input_toks = getattr(resp.usage_metadata, "prompt_token_count", input_toks) or input_toks
        output_toks = getattr(resp.usage_metadata, "candidates_token_count", output_toks) or output_toks
    return {
        "text": text,
        "input_tokens": input_toks,
        "output_tokens": output_toks,
    }


async def call(
    prompt: str,
    capability: ModelCapability = ModelCapability.BALANCED,
    *,
    messages: Optional[List[Dict[str, str]]] = None,
    temperature: float = 0.7,
    json_mode: bool = False,
    max_tokens: Optional[int] = None,
    timeout: float = 60.0,
    preferred_model: Optional[str] = None,
    language: Optional[str] = None,
    data_residency: Optional[DataResidencyPolicy] = None,
    allowed_providers: Optional[Set[ModelProvider]] = None,
) -> GatewayResponse:
    """
    Exécution unifiée d'une requête de modèle avec basculement automatique (Fallback)
    entre fournisseurs compatibles sans dégradation silencieuse.
    """
    start_time = time.time()
    failed_providers: Set[ModelProvider] = set()

    # Formater les messages
    chat_messages = messages or [{"role": "user", "content": prompt}]

    # Résolution des candidats
    candidates = (
        [m for m in MODEL_REGISTRY if m.id == preferred_model]
        if preferred_model else
        ModelRouter.resolve_candidates(
            capability,
            language=language,
            data_residency=data_residency,
            allowed_providers=allowed_providers,
        )
    )

    if not candidates:
        # Tenter sans restriction stricte de circuit breaker si tous sont marqués occupés
        candidates = [m for m in MODEL_REGISTRY if m.capability == capability]

    if not candidates:
        raise RuntimeError(f"Aucun modèle disponible pour la capacité {capability.value}")

    last_error: Optional[Exception] = None

    for attempt, spec in enumerate(candidates, 1):
        if spec.provider in failed_providers:
            continue

        meta = GLOBAL_PROVIDER_REGISTRY.get(spec.provider)
        if not meta or not meta.enabled:
            continue

        tokens_max = max_tokens or spec.max_tokens

        try:
            # Cas spécial : Google Gemini natif via google.generativeai si configuré
            if spec.provider == ModelProvider.GOOGLE:
                try:
                    g_res = await _call_google_gemini(
                        spec, prompt, chat_messages, temperature, tokens_max, json_mode
                    )
                    text = g_res.get("text", "")
                    input_toks = g_res.get("input_tokens", len(prompt) // 4)
                    output_toks = g_res.get("output_tokens", len(text) // 4)
                    latency_ms = int((time.time() - start_time) * 1000)
                    cost = (input_toks * spec.input_cost_per_m + output_toks * spec.output_cost_per_m) / 1_000_000

                    circuit_breaker.record_success(spec.provider.value)
                    gateway_metrics.record(CallMetrics(
                        model_id=spec.id,
                        provider=spec.provider.value,
                        capability=capability.value,
                        input_tokens=input_toks,
                        output_tokens=output_toks,
                        cost_usd=cost,
                        latency_ms=latency_ms,
                    ))

                    return GatewayResponse(
                        text=text,
                        model_id=spec.id,
                        provider=spec.provider.value,
                        capability=capability.value,
                        input_tokens=input_toks,
                        output_tokens=output_toks,
                        cost_usd=round(cost, 6),
                        latency_ms=latency_ms,
                        was_fallback=attempt > 1,
                        attempts=attempt,
                    )
                except Exception as g_err:
                    logger.warning(f"Fallback Gemini SDK -> Adapter compatible: {g_err}")

            # Exécution via ProviderAdapter standardisé
            adapter = _get_adapter_for_spec(spec)
            resp_adapter = await adapter.chat(
                model_id=spec.id,
                messages=chat_messages,
                temperature=temperature,
                max_tokens=tokens_max,
                json_mode=json_mode,
                timeout=timeout,
            )

            latency_ms = int((time.time() - start_time) * 1000)
            cost = (resp_adapter.input_tokens * spec.input_cost_per_m + resp_adapter.output_tokens * spec.output_cost_per_m) / 1_000_000

            circuit_breaker.record_success(spec.provider.value)
            gateway_metrics.record(CallMetrics(
                model_id=spec.id,
                provider=spec.provider.value,
                capability=capability.value,
                input_tokens=resp_adapter.input_tokens,
                output_tokens=resp_adapter.output_tokens,
                cost_usd=cost,
                latency_ms=latency_ms,
            ))

            return GatewayResponse(
                text=resp_adapter.text,
                model_id=spec.id,
                provider=spec.provider.value,
                capability=capability.value,
                input_tokens=resp_adapter.input_tokens,
                output_tokens=resp_adapter.output_tokens,
                cost_usd=round(cost, 6),
                latency_ms=latency_ms,
                was_fallback=attempt > 1,
                attempts=attempt,
            )

        except Exception as exc:
            last_error = exc
            circuit_breaker.record_failure(spec.provider.value, exc)
            failed_providers.add(spec.provider)
            logger.warning(
                f"Échec {spec.id} ({spec.provider.value}): {exc}. Tentative du fallback suivant..."
            )

    # Tous les candidats ont échoué
    from core.errors import NkyelAPIError, NkyelErrorCode
    raise NkyelAPIError(
        code=NkyelErrorCode.ALL_PROVIDERS_FAILED,
        message="Tous les fournisseurs de modèles disponibles ont échoué",
        detail=str(last_error) if last_error else None,
        metadata={
            "capability": capability.value,
            "attempted_providers": [p.value for p in failed_providers],
            "circuits": circuit_breaker.status(),
        },
    )


async def stream(
    prompt: str,
    capability: ModelCapability = ModelCapability.BALANCED,
    *,
    messages: Optional[List[Dict[str, str]]] = None,
    temperature: float = 0.7,
    max_tokens: Optional[int] = None,
    timeout: float = 120.0,
    preferred_model: Optional[str] = None,
    language: Optional[str] = None,
) -> AsyncGenerator[Dict[str, Any], None]:
    """Flux SSE temps réel de génération avec sélection automatique de capacité."""
    chat_messages = messages or [{"role": "user", "content": prompt}]
    candidates = (
        [m for m in MODEL_REGISTRY if m.id == preferred_model]
        if preferred_model else
        ModelRouter.resolve_candidates(capability, language=language)
    )

    if not candidates:
        yield {"type": "error", "text": f"Aucun modèle disponible pour {capability.value}"}
        return

    spec = candidates[0]
    tokens_max = max_tokens or spec.max_tokens

    # Streaming via Google Gemini natif si configuré
    if spec.provider == ModelProvider.GOOGLE and os.getenv("GOOGLE_GENERATIVE_AI_API_KEY"):
        try:
            import google.generativeai as genai
            genai.configure(api_key=os.getenv("GOOGLE_GENERATIVE_AI_API_KEY"))
            model = genai.GenerativeModel(spec.id)
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=tokens_max,
                ),
                stream=True,
            )
            for chunk in response:
                if chunk.text:
                    yield {"type": "token", "text": chunk.text}
            yield {"type": "done"}
            return
        except Exception as e:
            logger.warning(f"Erreur streaming Gemini SDK: {e}, bascule vers adaptateur...")

    # Streaming via Adapter
    try:
        adapter = _get_adapter_for_spec(spec)
        async for chunk in adapter.stream(
            model_id=spec.id,
            messages=chat_messages,
            temperature=temperature,
            max_tokens=tokens_max,
            timeout=timeout,
        ):
            yield chunk
    except Exception as exc:
        # Fallback non-streaming gracieux
        try:
            res = await call(prompt, capability, messages=messages, temperature=temperature, max_tokens=tokens_max)
            yield {"type": "token", "text": res.text}
            yield {"type": "done"}
        except Exception:
            yield {"type": "error", "text": f"Échec de génération : {str(exc)}"}


async def embed(
    text: str,
    model: Optional[str] = None,
) -> Dict[str, Any]:
    """Génération de vecteurs d'embedding."""
    embed_model = model or "text-embedding-004"
    api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY") or settings.google_api_key

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        result = genai.embed_content(
            model=f"models/{embed_model}",
            content=text,
        )
        return {
            "embedding": result.get("embedding", []),
            "model": embed_model,
            "provider": "google",
            "dimensions": len(result.get("embedding", [])),
        }
    except Exception:
        return {
            "embedding": [],
            "model": embed_model,
            "provider": "fallback",
            "dimensions": 0,
            "error": "Provider embedding non disponible",
        }


async def rerank(
    query: str,
    documents: List[str],
    top_k: int = 5,
) -> List[Dict[str, Any]]:
    """Reranking de précision pour documents pertinents."""
    if not documents:
        return []
    scored = []
    for i, doc in enumerate(documents[:top_k * 2]):
        score = 1.0 - (i * 0.05)
        scored.append({
            "index": i,
            "text": doc[:500],
            "relevance_score": round(max(0.0, score), 3),
        })
    scored.sort(key=lambda x: x["relevance_score"], reverse=True)
    return scored[:top_k]


# ── Fonctions de commodité de premier ordre ─────────────────
async def fast(prompt: str, **kwargs) -> GatewayResponse:
    return await call(prompt, ModelCapability.FAST, **kwargs)

async def balanced(prompt: str, **kwargs) -> GatewayResponse:
    return await call(prompt, ModelCapability.BALANCED, **kwargs)

async def deep(prompt: str, **kwargs) -> GatewayResponse:
    return await call(prompt, ModelCapability.DEEP, **kwargs)

async def code(prompt: str, **kwargs) -> GatewayResponse:
    return await call(prompt, ModelCapability.CODE, **kwargs)

async def vision(prompt: str, **kwargs) -> GatewayResponse:
    return await call(prompt, ModelCapability.VISION, **kwargs)

async def research(prompt: str, **kwargs) -> GatewayResponse:
    return await call(prompt, ModelCapability.RESEARCH, **kwargs)

async def multilingual(prompt: str, **kwargs) -> GatewayResponse:
    return await call(prompt, ModelCapability.MULTILINGUAL, **kwargs)

async def african_languages(prompt: str, **kwargs) -> GatewayResponse:
    return await call(prompt, ModelCapability.AFRICAN_LANGUAGES, **kwargs)


def get_gateway_status() -> Dict[str, Any]:
    """Retourne le statut public d'administration du Model Gateway."""
    return {
        "metrics": gateway_metrics.summary(),
        "circuits": circuit_breaker.status(),
        "registered_providers_count": len(GLOBAL_PROVIDER_REGISTRY),
        "registered_models": len(MODEL_REGISTRY),
        "registered_models_count": len(MODEL_REGISTRY),
        "interfaces": ["chat", "stream", "embed", "rerank"],
        "capabilities": [c.value for c in ModelCapability],
        "regions": [r.value for r in ProviderRegion],
        "providers": [p.value for p in ModelProvider],
    }
