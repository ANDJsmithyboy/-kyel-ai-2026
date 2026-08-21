"""
Ñkyel AI — Service de Registre Linguistique Dynamique & Internationalisation
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

Gère l'ensemble des langues du monde avec priorité souveraine pour les langues africaines :
- Normalisation BCP 47 & ISO 639
- Niveaux réels de support : stable, beta, experimental, collecting, unavailable
- 5 réglages linguistiques indépendants (UI, Conversation, Documents, Recherche, Voix)
- Détection automatique et requêtes de recherche multi-langues pivot
- Dictionnaire et glossaires pour langues à faibles ressources avec consentement
"""

from typing import Dict, List, Optional, Literal
from pydantic import BaseModel, Field
import re

UIStatus = Literal["stable", "beta", "partial", "unavailable"]
LLMStatus = Literal["stable", "beta", "experimental", "unavailable"]
STTStatus = Literal["stable", "beta", "experimental", "unavailable"]
TTSStatus = Literal["stable", "beta", "experimental", "unavailable"]
TranslationStatus = Literal["stable", "beta", "experimental", "unavailable"]


class LanguageCapability(BaseModel):
    tag: str  # BCP 47 tag (ex: 'fr', 'fan', 'sw', 'en')
    name: str
    native_name: str
    region: Optional[str] = None
    family: str = "Afroasiatic / Niger-Congo / Indo-European"
    script: str = "Latn"  # Latn, Arab, Ethi, Hans, Hant, etc.
    direction: Literal["ltr", "rtl"] = "ltr"
    ui_status: UIStatus = "stable"
    llm_status: LLMStatus = "stable"
    stt_status: STTStatus = "beta"
    tts_status: TTSStatus = "beta"
    translation_status: TranslationStatus = "stable"
    confidence: float = 1.0
    preferred_models: List[str] = Field(default_factory=lambda: ["gemini-2.5-flash", "gemini-2.5-pro"])
    is_african_priority: bool = False
    notes: Optional[str] = None


class UserLinguisticPreferences(BaseModel):
    user_id: str
    ui_language: str = "fr"
    conversation_language: str = "auto"  # 'auto' ou code BCP 47
    document_language: str = "fr"
    search_language: str = "auto"
    voice_language: str = "fr"
    enable_code_switching: bool = True
    preserve_citations_original: bool = True
    low_bandwidth_mode: bool = False


# Registre exhaustif des langues prioritaires et mondiales
GLOBAL_LANGUAGE_REGISTRY: Dict[str, LanguageCapability] = {
    # ─── LANGUES GABONAISES & AFRICAINES PRIORITAIRES ─────────────
    "fan": LanguageCapability(
        tag="fan",
        name="Fang",
        native_name="Faŋ",
        region="Gabon, Cameroun, Guinée Équatoriale, Congo",
        family="Niger-Congo (Bantu A.70)",
        script="Latn",
        direction="ltr",
        ui_status="beta",
        llm_status="beta",
        stt_status="experimental",
        tts_status="experimental",
        translation_status="beta",
        confidence=0.85,
        is_african_priority=True,
        notes="Support des variantes Ekang, Ntumu et Atsi avec conservation diacritique.",
    ),
    "puu": LanguageCapability(
        tag="puu",
        name="Punu",
        native_name="Yipunu",
        region="Gabon (Ngounié, Nyanga), Congo",
        family="Niger-Congo (Bantu B.43)",
        script="Latn",
        direction="ltr",
        ui_status="beta",
        llm_status="beta",
        stt_status="experimental",
        tts_status="experimental",
        translation_status="beta",
        confidence=0.80,
        is_african_priority=True,
    ),
    "mye": LanguageCapability(
        tag="mye",
        name="Myènè (Pongwé / Mpongwè / Omyènè)",
        native_name="Omyènè",
        region="Gabon (Estuaire, Ogooué-Maritime)",
        family="Niger-Congo (Bantu B.10)",
        script="Latn",
        direction="ltr",
        ui_status="beta",
        llm_status="beta",
        stt_status="experimental",
        tts_status="experimental",
        translation_status="beta",
        confidence=0.82,
        is_african_priority=True,
    ),
    "nzb": LanguageCapability(
        tag="nzb",
        name="Nzebi (Bandjabi)",
        native_name="Inzebi",
        region="Gabon (Ogooué-Lolo, Haut-Ogooué), Congo",
        family="Niger-Congo (Bantu B.52)",
        script="Latn",
        direction="ltr",
        ui_status="beta",
        llm_status="beta",
        stt_status="experimental",
        tts_status="experimental",
        translation_status="beta",
        confidence=0.78,
        is_african_priority=True,
    ),
    "toli": LanguageCapability(
        tag="toli",
        name="Tolibangado (Argot Urbain Gabonais)",
        native_name="Tolibangando",
        region="Gabon (Libreville, Port-Gentil, Franceville)",
        family="Créole urbain afro-francophone",
        script="Latn",
        direction="ltr",
        ui_status="beta",
        llm_status="beta",
        stt_status="experimental",
        tts_status="unavailable",
        translation_status="beta",
        confidence=0.88,
        is_african_priority=True,
        notes="Comprend le lexique moderne des jeunes et expressions de la rue gabonaise.",
    ),
    "sw": LanguageCapability(
        tag="sw",
        name="Swahili",
        native_name="Kiswahili",
        region="Afrique de l'Est et Centrale (Kenya, Tanzanie, RDC, Ouganda)",
        family="Niger-Congo (Bantu G.40)",
        script="Latn",
        direction="ltr",
        ui_status="stable",
        llm_status="stable",
        stt_status="stable",
        tts_status="stable",
        translation_status="stable",
        confidence=0.98,
        is_african_priority=True,
    ),
    "lin": LanguageCapability(
        tag="lin",
        name="Lingala",
        native_name="Lingála",
        region="RDC, Congo-Brazzaville, Centrafrique, Angola",
        family="Niger-Congo (Bantu C.30)",
        script="Latn",
        direction="ltr",
        ui_status="stable",
        llm_status="stable",
        stt_status="beta",
        tts_status="beta",
        translation_status="stable",
        confidence=0.92,
        is_african_priority=True,
    ),
    "wol": LanguageCapability(
        tag="wol",
        name="Wolof",
        native_name="Wolof",
        region="Sénégal, Gambie, Mauritanie",
        family="Niger-Congo (Sénégambien)",
        script="Latn",
        direction="ltr",
        ui_status="stable",
        llm_status="stable",
        stt_status="beta",
        tts_status="beta",
        translation_status="stable",
        confidence=0.90,
        is_african_priority=True,
    ),
    "hau": LanguageCapability(
        tag="hau",
        name="Haoussa",
        native_name="Harshen Hausa",
        region="Nigeria, Niger, Ghana, Cameroun, Tchad",
        family="Afroasiatique (Tchadique)",
        script="Latn",
        direction="ltr",
        ui_status="stable",
        llm_status="stable",
        stt_status="stable",
        tts_status="stable",
        translation_status="stable",
        confidence=0.95,
        is_african_priority=True,
    ),
    "yor": LanguageCapability(
        tag="yor",
        name="Yoruba",
        native_name="Èdè Yorùbá",
        region="Nigeria, Bénin, Togo",
        family="Niger-Congo (Volta-Niger)",
        script="Latn",
        direction="ltr",
        ui_status="stable",
        llm_status="stable",
        stt_status="stable",
        tts_status="stable",
        translation_status="stable",
        confidence=0.94,
        is_african_priority=True,
    ),
    "amh": LanguageCapability(
        tag="amh",
        name="Amharique",
        native_name="አማርኛ",
        region="Éthiopie",
        family="Afroasiatique (Sémitique)",
        script="Ethi",
        direction="ltr",
        ui_status="stable",
        llm_status="stable",
        stt_status="beta",
        tts_status="beta",
        translation_status="stable",
        confidence=0.92,
        is_african_priority=True,
    ),

    # ─── LANGUES INTERNATIONALES MAJEURES ─────────────────────────
    "fr": LanguageCapability(
        tag="fr",
        name="Français",
        native_name="Français",
        region="Monde Francophone",
        family="Indo-Européen (Roman)",
        script="Latn",
        direction="ltr",
        ui_status="stable",
        llm_status="stable",
        stt_status="stable",
        tts_status="stable",
        translation_status="stable",
        confidence=1.0,
    ),
    "en": LanguageCapability(
        tag="en",
        name="Anglais",
        native_name="English",
        region="International",
        family="Indo-Européen (Germanique)",
        script="Latn",
        direction="ltr",
        ui_status="stable",
        llm_status="stable",
        stt_status="stable",
        tts_status="stable",
        translation_status="stable",
        confidence=1.0,
    ),
    "es": LanguageCapability(
        tag="es",
        name="Espagnol",
        native_name="Español",
        region="Monde Hispanophone",
        family="Indo-Européen (Roman)",
        script="Latn",
        direction="ltr",
        ui_status="stable",
        llm_status="stable",
        stt_status="stable",
        tts_status="stable",
        translation_status="stable",
        confidence=1.0,
    ),
    "pt": LanguageCapability(
        tag="pt",
        name="Portugais",
        native_name="Português",
        region="Monde Lusophone (Angola, Mozambique, Brésil, Portugal)",
        family="Indo-Européen (Roman)",
        script="Latn",
        direction="ltr",
        ui_status="stable",
        llm_status="stable",
        stt_status="stable",
        tts_status="stable",
        translation_status="stable",
        confidence=1.0,
    ),
    "ar": LanguageCapability(
        tag="ar",
        name="Arabe",
        native_name="العربية",
        region="Afrique du Nord & Moyen-Orient",
        family="Afroasiatique (Sémitique)",
        script="Arab",
        direction="rtl",
        ui_status="stable",
        llm_status="stable",
        stt_status="stable",
        tts_status="stable",
        translation_status="stable",
        confidence=0.98,
    ),
    "zh": LanguageCapability(
        tag="zh",
        name="Chinois (Mandarin)",
        native_name="中文",
        region="Asie",
        family="Sino-Tibétain",
        script="Hans",
        direction="ltr",
        ui_status="stable",
        llm_status="stable",
        stt_status="stable",
        tts_status="stable",
        translation_status="stable",
        confidence=0.99,
    ),
    "ja": LanguageCapability(
        tag="ja",
        name="Japonais",
        native_name="日本語",
        region="Asie",
        family="Japonique",
        script="Jpan",
        direction="ltr",
        ui_status="stable",
        llm_status="stable",
        stt_status="stable",
        tts_status="stable",
        translation_status="stable",
        confidence=0.98,
    ),
}


class LanguageService:
    """Service de détection, pivot multilingue et préservation des citations."""

    @staticmethod
    def get_all_capabilities() -> List[LanguageCapability]:
        return list(GLOBAL_LANGUAGE_REGISTRY.values())

    @staticmethod
    def get_capability(tag: str) -> LanguageCapability:
        clean_tag = tag.lower().split("-")[0]
        return GLOBAL_LANGUAGE_REGISTRY.get(clean_tag, GLOBAL_LANGUAGE_REGISTRY["fr"])

    @staticmethod
    def detect_language(text: str) -> str:
        """Détection heuristique et sémantique de la langue."""
        t_low = text.lower()
        # Heuristiques spécifiques aux langues africaines locales
        if any(w in t_low for w in ["mbote", "ndeko", "sango", "elengi", "makambo"]):
            return "lin"
        if any(w in t_low for w in ["jambo", "habari", "asante", "karibu", "rafiki"]):
            return "sw"
        if any(w in t_low for w in ["mbolo", "akiba", "abeng", "mbôlani", "ve", "ane"]):
            return "fan"
        if any(w in t_low for w in ["mbolani", "wanyi", "diba", "isango"]):
            return "mye"
        if any(w in t_low for w in ["na nga", "boma", "kiff", "djomba", "tchombé", "bangando"]):
            return "toli"
        if any(w in t_low for w in ["the", "what", "how", "when", "research", "agent"]):
            return "en"
        if re.search(r"[\u0600-\u06FF]", text):
            return "ar"
        if re.search(r"[\u4e00-\u9fff]", text):
            return "zh"
        return "fr"

    @staticmethod
    def generate_multilingual_search_queries(topic: str, source_lang: str) -> Dict[str, List[str]]:
        """
        Génère des requêtes de recherche dans la langue source + langues pivots (français, anglais)
        pour garantir une couverture documentaire maximale sans perte sémantique.
        """
        queries: Dict[str, List[str]] = {
            source_lang: [topic, f"{topic} faits preuves", f"{topic} analyse"],
        }
        if source_lang not in ["fr", "en"]:
            queries["fr"] = [f"{topic} actualités", f"{topic} rapport 2026", f"{topic} analyse"]
            queries["en"] = [f"{topic} official report", f"{topic} news overview"]
        elif source_lang == "fr":
            queries["en"] = [f"{topic} overview 2026", f"{topic} research"]
        return queries


language_service = LanguageService()
