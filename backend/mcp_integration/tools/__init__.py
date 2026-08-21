"""
Ñkyel AI — MCP Tools Package · SmartANDJ AI Technologies
Auto-registers all MCP tools when imported.

Fondateur : Daniel Jonathan ANDJ
"""

# Import tool modules to trigger @registry.tool() registration
from mcp_integration.tools.tavily_tool import tavily_search  # noqa: F401
from mcp_integration.tools.fx_tool import fx_code_agent  # noqa: F401
import mcp_integration.tools.multimedia_tools  # noqa: F401

__all__ = [
    "tavily_search",
    "fx_code_agent",
    "generate_image_skill",
    "edit_image_skill",
    "brand_studio_skill",
    "stock_media_search_skill",
    "storyboard_skill",
    "image_to_video_skill",
    "text_to_video_skill",
    "social_video_composer_skill",
    "visual_analysis_skill",
    "communication_kit_skill",
]


