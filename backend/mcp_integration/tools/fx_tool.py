"""
Ñkyel AI — MCP fx Native Coding Agent Tool · SmartANDJ AI Technologies
Harness for Vercel Labs fx (Zig-based native coding agent) with execution fallback.

Fondateur : Daniel Jonathan ANDJ
"""

import os
import shutil
import subprocess
import time
import logging
from typing import Dict, Any, Optional

from mcp_integration.registry import registry

logger = logging.getLogger(__name__)


def _find_fx_binary() -> Optional[str]:
    """Locate the fx binary on the system (PATH, ~/.fx/bin, /usr/local/bin)."""
    # 1. System PATH
    fx_path = shutil.which("fx")
    if fx_path:
        return fx_path

    # 2. Common install locations
    home = os.path.expanduser("~")
    candidates = [
        os.path.join(home, ".fx", "bin", "fx"),
        os.path.join(home, ".local", "bin", "fx"),
        "/usr/local/bin/fx",
        "/usr/bin/fx",
    ]
    for c in candidates:
        if os.path.isfile(c) and os.access(c, os.X_OK):
            return c

    return None


@registry.tool(
    name="fx_code_agent",
    description="Execute native code tasks, scripts, and debugging using the ultra-lightweight fx agent harness (Vercel Labs Zig binary).",
    permissions=["code:execute", "file:read", "file:write"],
    input_schema={
        "type": "object",
        "properties": {
            "prompt": {"type": "string", "description": "Instruction or coding task for fx"},
            "code": {"type": "string", "description": "Optional raw code snippet to run (Python/Bash/Node)"},
            "language": {"type": "string", "default": "python", "enum": ["python", "bash", "javascript", "typescript"]},
            "working_directory": {"type": "string", "description": "Optional working directory"},
            "timeout_seconds": {"type": "integer", "default": 60, "description": "Max execution time in seconds"},
        },
        "required": ["prompt"],
    },
    timeout_seconds=65,
)
def fx_code_agent(
    prompt: str,
    code: Optional[str] = None,
    language: str = "python",
    working_directory: Optional[str] = None,
    timeout_seconds: int = 60,
) -> Dict[str, Any]:
    """
    Execute coding tasks via fx or fallback runner.
    """
    start_time = time.time()
    fx_bin = _find_fx_binary()
    cwd = working_directory or os.getcwd()

    # Case 1: fx binary is available on the system
    if fx_bin:
        logger.info(f"Invoking native fx agent at {fx_bin}...")
        try:
            cmd = [fx_bin, "-p", prompt]
            result = subprocess.run(
                cmd,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )
            latency_ms = int((time.time() - start_time) * 1000)

            return {
                "engine": "fx_native_zig",
                "status": "completed" if result.returncode == 0 else "error",
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
                "exit_code": result.returncode,
                "latency_ms": latency_ms,
            }
        except subprocess.TimeoutExpired:
            return {
                "engine": "fx_native_zig",
                "status": "timeout",
                "error": f"fx execution timed out after {timeout_seconds}s",
                "latency_ms": int((time.time() - start_time) * 1000),
            }
        except Exception as e:
            logger.warning(f"fx execution failed, falling back to direct runner: {e}")

    # Case 2: Code snippet provided -> direct sandbox execution
    if code and code.strip():
        logger.info(f"Running code directly in sandbox ({language})...")
        try:
            if language == "python":
                cmd = ["python3" if shutil.which("python3") else "python", "-c", code]
            elif language == "bash":
                cmd = ["bash", "-c", code]
            elif language in ("javascript", "typescript", "node"):
                cmd = ["node", "-e", code]
            else:
                cmd = ["python", "-c", code]

            result = subprocess.run(
                cmd,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )
            latency_ms = int((time.time() - start_time) * 1000)

            return {
                "engine": "sandbox_direct",
                "status": "completed" if result.returncode == 0 else "error",
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
                "exit_code": result.returncode,
                "latency_ms": latency_ms,
            }
        except Exception as e:
            return {
                "engine": "sandbox_direct",
                "status": "error",
                "error": str(e),
                "latency_ms": int((time.time() - start_time) * 1000),
            }

    # Case 3: Prompt given but fx not installed
    return {
        "engine": "fx_pending_install",
        "status": "ready",
        "message": (
            "fx native agent is ready for installation. "
            "Install with 'curl -fsSL https://fx.sh/setup.sh | bash' on your server or pod."
        ),
        "prompt": prompt,
        "latency_ms": int((time.time() - start_time) * 1000),
    }
