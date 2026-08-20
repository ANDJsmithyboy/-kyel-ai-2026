import os
import logging
import asyncio
import re
from typing import Optional
from urllib.parse import urlparse
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from mcp_integration.security import MCPNetworkAllowlist

logger = logging.getLogger(__name__)

# Basic regex for private/local IPs
PRIVATE_IP_REGEX = re.compile(
    r"(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)|(^169\.254\.)"
)

async def fetch_url_via_mcp(url: str, timeout_seconds: int = 15) -> Optional[str]:
    """
    Fetches a URL using the official mcp-server-fetch via the python mcp SDK.
    Enforces the network allowlist and security constraints (P0 Demo).
    """
    parsed = urlparse(url)
    
    if parsed.scheme != 'https':
        logger.error(f"Insecure protocol: {parsed.scheme}")
        return "Error: Only HTTPS is allowed."
        
    if not parsed.hostname:
        logger.error(f"Invalid URL: {url}")
        return "Error: Invalid URL."
        
    hostname = parsed.hostname.lower()
    
    if hostname == "localhost" or hostname == "127.0.0.1" or hostname == "::1":
        logger.error("Localhost is not allowed.")
        return "Error: Localhost is not allowed."
        
    if PRIVATE_IP_REGEX.match(hostname):
        logger.error("Private IP addresses are not allowed.")
        return "Error: Private IP addresses are not allowed."
        
    if not MCPNetworkAllowlist.is_allowed(hostname):
        logger.error(f"Host '{hostname}' is not on the MCP network allowlist.")
        return f"Error: Host '{hostname}' is not on the MCP network allowlist."

    logger.info(f"Starting MCP fetch client for {url}")
    
    # Optional feature flag check
    if os.environ.get("NKYEL_MCP_FETCH_ENABLED", "1") == "0":
        logger.warning("MCP fetch is disabled via NKYEL_MCP_FETCH_ENABLED")
        return "Error: MCP fetch is disabled."

    env = os.environ.copy() # Inherit PATH
    env["UV_QUIET"] = "1"
    env["UV_NO_PROGRESS"] = "1"
    
    # In production, this should ideally run a pinned version
    server_params = StdioServerParameters(
        command="uvx",
        args=["mcp-server-fetch"],
        env=env
    )
    
    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await asyncio.wait_for(session.initialize(), timeout=5.0)
                
                logger.info("Calling MCP tool: fetch")
                result = await asyncio.wait_for(
                    session.call_tool("fetch", arguments={"url": url}),
                    timeout=timeout_seconds
                )
                
                # Check for errors in the tool response
                if result.isError:
                    error_msg = result.content[0].text if result.content else "Unknown error"
                    logger.error(f"MCP fetch error: {error_msg}")
                    return f"Error: {error_msg}"
                
                if not result.content:
                    return ""
                    
                text_content = result.content[0].text
                
                # Basic size limitation (5MB)
                if len(text_content) > 5 * 1024 * 1024:
                    return "Error: Response too large (exceeds 5MB limit)."
                    
                # Sanitize output (very basic sanitization)
                text_content = text_content.replace("\x00", "")
                
                return text_content
                
    except asyncio.TimeoutError:
        logger.error(f"MCP fetch timed out after {timeout_seconds}s")
        return f"Error: Request timed out after {timeout_seconds} seconds."
    except Exception as e:
        logger.error(f"Failed to execute mcp-server-fetch: {e}")
        return f"Error: Failed to execute MCP server: {str(e)}"
