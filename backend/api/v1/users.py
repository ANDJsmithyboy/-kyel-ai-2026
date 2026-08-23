"""
Ñkyel AI — API v1 Users & Preferences · SmartANDJ AI Technologies
Profil utilisateur et gestion des préférences de production (Settings as Commands).
Protégé par Clerk JWKS + Persistance Neon PostgreSQL.
Fondateur : Daniel Jonathan ANDJ
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from core.security import get_current_user
from core.database import get_user_preferences, upsert_user_preferences

router = APIRouter(prefix="/v1", tags=["Users v1"])


class UserProfileResponse(BaseModel):
    id: Optional[str] = None
    clerk_id: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    tier: Optional[str] = "free"
    credits: Optional[int] = 100
    credits_used: Optional[int] = 0
    is_admin: bool = False
    beta_pioneer: bool = False
    created_at: Optional[Any] = None


class UserPreferencesSchema(BaseModel):
    ui_locale: str = Field(default="fr-FR", description="BCP-47 UI language tag (e.g. fr-FR, fr-GA, en-US, ar-SA, zh-CN)")
    agent_language: str = Field(default="auto", description="Preferred response language for Nkyel agent")
    region: str = Field(default="GA", description="ISO Country Code")
    timezone: str = Field(default="Africa/Libreville", description="IANA Timezone string")
    date_format: str = Field(default="DD/MM/YYYY", description="Date formatting string (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)")
    time_format: str = Field(default="24h", description="Time display mode: 24h or 12h")
    number_format: str = Field(default="space_comma", description="Number formatting: space_comma (1 234,56) or comma_dot (1,234.56)")
    currency_display: str = Field(default="XAF", description="Display currency (XAF, EUR, USD, GBP, CNY, JPY, AED, INR)")
    first_day_of_week: str = Field(default="monday", description="First day of the week: monday, sunday, saturday")
    theme: str = Field(default="black-panther", description="Theme key (black-panther, nuit-lope, aurore-ogoue, bleu-nuit, violette-mandrille, neo-blanc)")
    reduced_motion: bool = Field(default=False, description="Accessibility preference: reduce motion animations")
    density: str = Field(default="comfortable", description="UI density: comfortable, compact, spacious")
    response_depth: str = Field(default="balanced", description="Fast, Balanced, Deep, Research")
    research_depth: str = Field(default="deep", description="quick, balanced, deep, exhaustive")
    citation_preferences: str = Field(default="always", description="always, inline, end_of_message, minimal")
    autonomy_level: str = Field(default="semi_autonomous", description="guided, semi_autonomous, fully_autonomous")
    ask_before_sensitive_actions: bool = Field(default=True, description="Prompt confirmation before destructive or external actions")
    memory_enabled: bool = Field(default=True, description="Master toggle for DeerMem long-term memory")
    automatic_memory: bool = Field(default=True, description="Automatically extract persistent facts from conversations")
    ask_before_remembering: bool = Field(default=False, description="Ask user confirmation before creating a new memory card")
    memory_policy: str = Field(default="auto_preferences", description="never, always_ask, auto_preferences, auto_all")
    data_residency: str = Field(default="GLOBAL", description="GLOBAL, EU, US, AFRICA, LOCAL, CUSTOM")
    notifications: Dict[str, bool] = Field(default_factory=lambda: {
        "mission_updates": True,
        "checkpoint_alerts": True,
        "cost_alerts": True,
        "email_digest": False,
    })
    default_tools: List[str] = Field(default_factory=lambda: [
        "web_search", "code_interpreter", "doc_generation", "workgraph", "vision"
    ])
    visual_intelligence_level: str = Field(default="enhanced", description="standard, enhanced, sovereign_vision")
    workgraph_visibility: str = Field(default="full", description="full, simplified, collapsed")


class UserPreferencesUpdateSchema(BaseModel):
    ui_locale: Optional[str] = None
    agent_language: Optional[str] = None
    region: Optional[str] = None
    timezone: Optional[str] = None
    date_format: Optional[str] = None
    time_format: Optional[str] = None
    number_format: Optional[str] = None
    currency_display: Optional[str] = None
    first_day_of_week: Optional[str] = None
    theme: Optional[str] = None
    reduced_motion: Optional[bool] = None
    density: Optional[str] = None
    response_depth: Optional[str] = None
    research_depth: Optional[str] = None
    citation_preferences: Optional[str] = None
    autonomy_level: Optional[str] = None
    ask_before_sensitive_actions: Optional[bool] = None
    memory_enabled: Optional[bool] = None
    automatic_memory: Optional[bool] = None
    ask_before_remembering: Optional[bool] = None
    memory_policy: Optional[str] = None
    data_residency: Optional[str] = None
    notifications: Optional[Dict[str, bool]] = None
    default_tools: Optional[List[str]] = None
    visual_intelligence_level: Optional[str] = None
    workgraph_visibility: Optional[str] = None


@router.get("/users/me", response_model=UserProfileResponse)
async def get_me(user: dict = Depends(get_current_user)):
    """Retourne le profil de l'utilisateur connecté depuis Neon."""
    return UserProfileResponse(
        id=str(user.get("id", "")),
        clerk_id=user.get("clerk_id") or user.get("clerk_sub"),
        email=user.get("email"),
        full_name=user.get("full_name") or user.get("name"),
        avatar_url=user.get("avatar_url"),
        tier=str(user.get("tier", "free")),
        credits=user.get("credits", 100),
        credits_used=user.get("credits_used", 0),
        is_admin=user.get("is_admin", False),
        beta_pioneer=user.get("beta_pioneer", False),
        created_at=user.get("created_at"),
    )


@router.get("/users/preferences", response_model=UserPreferencesSchema)
async def get_preferences(user: dict = Depends(get_current_user)):
    """
    Récupère les préférences persistées de l'utilisateur depuis Neon PostgreSQL.
    Survit au refresh, au logout et aux changements d'appareils.
    """
    user_id = str(user.get("id") or user.get("clerk_id") or user.get("clerk_sub", "default_user"))
    prefs_db = await get_user_preferences(user_id)
    if not prefs_db:
        # Retourner les valeurs par défaut
        return UserPreferencesSchema()

    # Désérialisation des JSONs si nécessaire
    notifs = prefs_db.get("notifications_json")
    if isinstance(notifs, str):
        try:
            import json
            notifs = json.loads(notifs)
        except Exception:
            notifs = {}
    elif not isinstance(notifs, dict):
        notifs = {}

    tools = prefs_db.get("default_tools_json")
    if isinstance(tools, str):
        try:
            import json
            tools = json.loads(tools)
        except Exception:
            tools = []
    elif not isinstance(tools, list):
        tools = []

    return UserPreferencesSchema(
        ui_locale=prefs_db.get("ui_locale", "fr-FR"),
        agent_language=prefs_db.get("agent_language", "auto"),
        region=prefs_db.get("region", "GA"),
        timezone=prefs_db.get("timezone", "Africa/Libreville"),
        date_format=prefs_db.get("date_format", "DD/MM/YYYY"),
        time_format=prefs_db.get("time_format", "24h"),
        number_format=prefs_db.get("number_format", "space_comma"),
        currency_display=prefs_db.get("currency_display", "XAF"),
        first_day_of_week=prefs_db.get("first_day_of_week", "monday"),
        theme=prefs_db.get("theme", "black-panther"),
        reduced_motion=prefs_db.get("reduced_motion", False),
        density=prefs_db.get("density", "comfortable"),
        response_depth=prefs_db.get("response_depth", "balanced"),
        research_depth=prefs_db.get("research_depth", "deep"),
        citation_preferences=prefs_db.get("citation_preferences", "always"),
        autonomy_level=prefs_db.get("autonomy_level", "semi_autonomous"),
        ask_before_sensitive_actions=prefs_db.get("ask_before_sensitive_actions", True),
        memory_enabled=prefs_db.get("memory_enabled", True),
        automatic_memory=prefs_db.get("automatic_memory", True),
        ask_before_remembering=prefs_db.get("ask_before_remembering", False),
        memory_policy=prefs_db.get("memory_policy", "auto_preferences"),
        data_residency=prefs_db.get("data_residency", "GLOBAL"),
        notifications=notifs or {
            "mission_updates": True,
            "checkpoint_alerts": True,
            "cost_alerts": True,
            "email_digest": False,
        },
        default_tools=tools or [
            "web_search", "code_interpreter", "doc_generation", "workgraph", "vision"
        ],
        visual_intelligence_level=prefs_db.get("visual_intelligence_level", "enhanced"),
        workgraph_visibility=prefs_db.get("workgraph_visibility", "full"),
    )


@router.put("/users/preferences", response_model=UserPreferencesSchema)
async def update_all_preferences(
    prefs: UserPreferencesSchema,
    user: dict = Depends(get_current_user),
):
    """
    Remplacement complet des préférences de l'utilisateur (Settings as Commands).
    Sauvegarde validée dans Neon PostgreSQL.
    """
    import json
    user_id = str(user.get("id") or user.get("clerk_id") or user.get("clerk_sub", "default_user"))
    
    payload = prefs.model_dump()
    payload["notifications_json"] = json.dumps(payload.pop("notifications", {}))
    payload["default_tools_json"] = json.dumps(payload.pop("default_tools", []))

    await upsert_user_preferences(user_id, payload)
    return prefs


@router.patch("/users/preferences", response_model=UserPreferencesSchema)
async def patch_preferences(
    updates: UserPreferencesUpdateSchema,
    user: dict = Depends(get_current_user),
):
    """Mise à jour partielle atomique des préférences utilisateur."""
    import json
    user_id = str(user.get("id") or user.get("clerk_id") or user.get("clerk_sub", "default_user"))
    current = await get_preferences(user=user)
    current_dict = current.model_dump()

    patch_data = updates.model_dump(exclude_unset=True)
    current_dict.update(patch_data)

    payload = dict(current_dict)
    payload["notifications_json"] = json.dumps(payload.pop("notifications", {}))
    payload["default_tools_json"] = json.dumps(payload.pop("default_tools", []))

    await upsert_user_preferences(user_id, payload)
    return UserPreferencesSchema(**current_dict)
