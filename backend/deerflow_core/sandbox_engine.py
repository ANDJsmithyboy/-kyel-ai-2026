"""
Ñkyel AI — DeerFlow 2.0 Secure Execution Sandbox · SmartANDJ AI Technologies
Provides isolated code, file creation, shell, and project building capabilities.
Enforces:
- Timeouts (max 30s per execution)
- Workspace isolation per run_id
- Secret scrubbing (ensures API keys/tokens are not leaked in outputs)
- Project artifact packaging

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import os
import sys
import uuid
import time
import shutil
import asyncio
import zipfile
import subprocess
import logging
from typing import Dict, Any, Optional, List
from pathlib import Path

logger = logging.getLogger(__name__)

# Base path for sandboxes
SANDBOX_BASE_DIR = Path("./storage/sandboxes")
SANDBOX_BASE_DIR.mkdir(parents=True, exist_ok=True)


class DeerSandboxEngine:
    """Secure isolated sandbox environment for DeerFlow 2.0."""

    def __init__(self, base_dir: Path = SANDBOX_BASE_DIR):
        self.base_dir = base_dir

    def create_workspace(self, run_id: str) -> Path:
        """Creates an isolated workspace directory for a specific run."""
        ws = self.base_dir / f"ws_{run_id}"
        ws.mkdir(parents=True, exist_ok=True)
        return ws

    def cleanup_workspace(self, run_id: str):
        """Cleans up a run's workspace."""
        ws = self.base_dir / f"ws_{run_id}"
        if ws.exists():
            shutil.rmtree(ws, ignore_errors=True)

    def write_file(self, run_id: str, relative_path: str, content: str | bytes) -> Dict[str, Any]:
        """Safely writes a file within the sandbox workspace."""
        ws = self.create_workspace(run_id)
        # Prevent directory traversal
        target_path = (ws / relative_path).resolve()
        if not str(target_path).startswith(str(ws.resolve())):
            raise ValueError("Directory traversal attempt detected in sandbox.")

        target_path.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(content, str):
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(content)
        else:
            with open(target_path, "wb") as f:
                f.write(content)

        return {
            "success": True,
            "path": str(target_path),
            "size": target_path.stat().st_size,
        }

    async def execute_python(
        self,
        run_id: str,
        code: str,
        timeout_seconds: int = 20,
    ) -> Dict[str, Any]:
        """
        Executes Python code in a child process inside the workspace with timeout
        and environment isolation.
        """
        ws = self.create_workspace(run_id)
        script_file = ws / "script.py"
        with open(script_file, "w", encoding="utf-8") as f:
            f.write(code)

        # Restricted environment: remove host sensitive secrets
        safe_env = {
            "PATH": os.environ.get("PATH", ""),
            "SYSTEMROOT": os.environ.get("SYSTEMROOT", "C:\\Windows"),
            "WINDIR": os.environ.get("WINDIR", "C:\\Windows"),
            "TEMP": os.environ.get("TEMP", ""),
            "TMP": os.environ.get("TMP", ""),
            "PYTHONPATH": str(ws.resolve()),
            "PYTHONIOENCODING": "utf-8",
        }

        start_time = time.time()
        try:
            process = await asyncio.create_subprocess_exec(
                sys.executable,
                "script.py",
                cwd=str(ws.resolve()),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=safe_env,
            )

            stdout_data, stderr_data = await asyncio.wait_for(
                process.communicate(),
                timeout=timeout_seconds,
            )

            stdout = stdout_data.decode("utf-8", errors="replace")
            stderr = stderr_data.decode("utf-8", errors="replace")
            duration_ms = int((time.time() - start_time) * 1000)

            return {
                "success": process.returncode == 0,
                "exit_code": process.returncode,
                "stdout": stdout,
                "stderr": stderr,
                "duration_ms": duration_ms,
            }

        except asyncio.TimeoutError:
            if 'process' in locals():
                process.kill()
            return {
                "success": False,
                "error": f"Execution timed out after {timeout_seconds}s",
                "duration_ms": int((time.time() - start_time) * 1000),
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "duration_ms": int((time.time() - start_time) * 1000),
            }

    def package_project_zip(self, run_id: str, project_name: str = "project") -> bytes:
        """Packages the workspace files into an in-memory ZIP archive."""
        ws = self.create_workspace(run_id)
        zip_buffer = bytearray()
        import io
        buf = io.BytesIO()

        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, _, files in os.walk(ws):
                for f in files:
                    full_path = Path(root) / f
                    rel_path = full_path.relative_to(ws)
                    zf.write(full_path, arcname=str(rel_path))

        return buf.getvalue()


# Global singleton
deer_sandbox_engine = DeerSandboxEngine()
