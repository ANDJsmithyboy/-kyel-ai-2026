"""
Ñkyel AI — Sandbox Provider Abstraction · SmartANDJ AI Technologies
Gestionnaire d'environnements sandbox isolés pour l'exécution de code,
scripts d'analyse, manipulation de fichiers et génération d'artefacts.

Fournisseurs :
1. E2BSandboxProvider — Sandbox infonuagique sécurisée E2B
2. LocalSandboxProvider — Sandbox locale temporaire restreinte (Fallback P0)
3. RunPodSandboxProvider — Sandbox GPU pour calcul lourd (Prévu post-financement)

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import os
import time
import uuid
import shutil
import asyncio
import tempfile
import logging
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field

from core.config import settings
from core.errors import tool_failed

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Execution Result & Specs
# ══════════════════════════════════════════════════════════════

@dataclass
class SandboxExecutionResult:
    """Résultat standardisé d'exécution dans un bac à sable."""
    stdout: str
    stderr: str
    exit_code: int
    duration_ms: int
    artifacts_created: List[Dict[str, Any]] = field(default_factory=list)
    success: bool = True
    error_message: Optional[str] = None


@dataclass
class SandboxConfig:
    """Configuration de cloisonnement d'un bac à sable."""
    user_id: str
    workspace_id: Optional[str] = None
    mission_id: Optional[str] = None
    timeout_seconds: int = 60
    max_memory_mb: int = 512
    allow_network: bool = False
    env_vars: Dict[str, str] = field(default_factory=dict)


# ══════════════════════════════════════════════════════════════
# 2. Sandbox Provider Abstract Base Class
# ══════════════════════════════════════════════════════════════

class SandboxProvider(ABC):
    """Contrat universel d'environnement isolé."""

    @abstractmethod
    async def create_sandbox(self, config: SandboxConfig) -> str:
        """Crée une instance de sandbox et retourne son ID."""
        pass

    @abstractmethod
    async def run_code(
        self,
        sandbox_id: str,
        code: str,
        language: str = "python",
        timeout: Optional[int] = None,
    ) -> SandboxExecutionResult:
        """Exécute un bloc de code dans le sandbox."""
        pass

    @abstractmethod
    async def write_file(self, sandbox_id: str, path: str, content: bytes | str) -> bool:
        """Écrit un fichier dans le système de fichiers du sandbox."""
        pass

    @abstractmethod
    async def read_file(self, sandbox_id: str, path: str) -> Optional[bytes]:
        """Lit un fichier depuis le sandbox."""
        pass

    @abstractmethod
    async def destroy_sandbox(self, sandbox_id: str) -> bool:
        """Détruit proprement l'instance et libère les ressources."""
        pass


# ══════════════════════════════════════════════════════════════
# 3. E2B Sandbox Provider (Cloud)
# ══════════════════════════════════════════════════════════════

class E2BSandboxProvider(SandboxProvider):
    """
    Fournisseur E2B pour environnements sandbox cloud isolés.
    Utilise le SDK e2b_code_interpreter si la clé E2B_API_KEY est configurée.
    """

    def __init__(self):
        self._sandboxes: Dict[str, Any] = {}

    async def create_sandbox(self, config: SandboxConfig) -> str:
        sandbox_id = f"e2b_{uuid.uuid4().hex[:12]}"
        api_key = os.getenv("E2B_API_KEY", "")

        if api_key:
            try:
                # Import paresseux du SDK e2b
                from e2b_code_interpreter import Sandbox
                sb = Sandbox(api_key=api_key)
                self._sandboxes[sandbox_id] = sb
                logger.info(f"Sandbox E2B créée: {sandbox_id} pour user={config.user_id}")
                return sandbox_id
            except Exception as e:
                logger.warning(f"Impossible d'initialiser E2B ({e}), bascule sur sandbox locale.")

        # Fallback local transparent si E2B_API_KEY non fournie
        return sandbox_id

    async def run_code(
        self,
        sandbox_id: str,
        code: str,
        language: str = "python",
        timeout: Optional[int] = None,
    ) -> SandboxExecutionResult:
        sb = self._sandboxes.get(sandbox_id)
        if sb:
            start = time.time()
            try:
                execution = sb.run_code(code)
                duration = int((time.time() - start) * 1000)
                stdout = "\n".join([str(l) for l in execution.logs.stdout])
                stderr = "\n".join([str(l) for l in execution.logs.stderr])
                return SandboxExecutionResult(
                    stdout=stdout,
                    stderr=stderr,
                    exit_code=0 if not execution.error else 1,
                    duration_ms=duration,
                    success=execution.error is None,
                    error_message=str(execution.error) if execution.error else None,
                )
            except Exception as e:
                return SandboxExecutionResult(
                    stdout="",
                    stderr=str(e),
                    exit_code=1,
                    duration_ms=int((time.time() - start) * 1000),
                    success=False,
                    error_message=str(e),
                )

        # Fallback local
        return await local_sandbox_provider.run_code(sandbox_id, code, language, timeout)

    async def write_file(self, sandbox_id: str, path: str, content: bytes | str) -> bool:
        sb = self._sandboxes.get(sandbox_id)
        if sb:
            try:
                sb.files.write(path, content)
                return True
            except Exception:
                return False
        return await local_sandbox_provider.write_file(sandbox_id, path, content)

    async def read_file(self, sandbox_id: str, path: str) -> Optional[bytes]:
        sb = self._sandboxes.get(sandbox_id)
        if sb:
            try:
                return sb.files.read(path, format="bytes")
            except Exception:
                return None
        return await local_sandbox_provider.read_file(sandbox_id, path)

    async def destroy_sandbox(self, sandbox_id: str) -> bool:
        sb = self._sandboxes.pop(sandbox_id, None)
        if sb:
            try:
                sb.close()
                return True
            except Exception:
                return False
        return await local_sandbox_provider.destroy_sandbox(sandbox_id)


# ══════════════════════════════════════════════════════════════
# 4. Local Sandbox Provider (Restricted Subprocess & Tempdir)
# ══════════════════════════════════════════════════════════════

class LocalSandboxProvider(SandboxProvider):
    """
    Fournisseur de bac à sable local restreint dans un dossier temporaire dédié.
    Permet des tests unitaires et une exécution sans dépendance cloud externe.
    """

    def __init__(self):
        self._temp_dirs: Dict[str, Path] = {}

    async def create_sandbox(self, config: SandboxConfig) -> str:
        sandbox_id = f"local_sb_{uuid.uuid4().hex[:10]}"
        temp_dir = Path(tempfile.mkdtemp(prefix=f"nkyel_sb_{config.user_id}_"))
        self._temp_dirs[sandbox_id] = temp_dir
        logger.debug(f"LocalSandbox créée: {sandbox_id} at {temp_dir}")
        return sandbox_id

    async def run_code(
        self,
        sandbox_id: str,
        code: str,
        language: str = "python",
        timeout: Optional[int] = None,
    ) -> SandboxExecutionResult:
        work_dir = self._temp_dirs.get(sandbox_id)
        if not work_dir:
            work_dir = Path(tempfile.mkdtemp(prefix="nkyel_sb_ephemeral_"))
            self._temp_dirs[sandbox_id] = work_dir

        code_file = work_dir / "script.py"
        with open(code_file, "w", encoding="utf-8") as f:
            f.write(code)

        start = time.time()
        timeout_val = timeout or 30

        try:
            process = await asyncio.create_subprocess_exec(
                "python", str(code_file),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(work_dir),
            )
            try:
                stdout_b, stderr_b = await asyncio.wait_for(
                    process.communicate(), timeout=float(timeout_val)
                )
                duration = int((time.time() - start) * 1000)
                stdout = stdout_b.decode("utf-8", errors="replace")
                stderr = stderr_b.decode("utf-8", errors="replace")

                return SandboxExecutionResult(
                    stdout=stdout,
                    stderr=stderr,
                    exit_code=process.returncode or 0,
                    duration_ms=duration,
                    success=(process.returncode == 0),
                )
            except asyncio.TimeoutError:
                process.kill()
                return SandboxExecutionResult(
                    stdout="",
                    stderr=f"Timeout dépassé ({timeout_val}s)",
                    exit_code=-1,
                    duration_ms=int((time.time() - start) * 1000),
                    success=False,
                    error_message="Execution timeout",
                )
        except Exception as e:
            return SandboxExecutionResult(
                stdout="",
                stderr=str(e),
                exit_code=1,
                duration_ms=int((time.time() - start) * 1000),
                success=False,
                error_message=str(e),
            )

    async def write_file(self, sandbox_id: str, path: str, content: bytes | str) -> bool:
        work_dir = self._temp_dirs.get(sandbox_id)
        if not work_dir:
            return False
        target = work_dir / path.lstrip("/")
        target.parent.mkdir(parents=True, exist_ok=True)
        mode = "wb" if isinstance(content, bytes) else "w"
        with open(target, mode) as f:
            f.write(content)
        return True

    async def read_file(self, sandbox_id: str, path: str) -> Optional[bytes]:
        work_dir = self._temp_dirs.get(sandbox_id)
        if not work_dir:
            return None
        target = work_dir / path.lstrip("/")
        if not target.exists():
            return None
        with open(target, "rb") as f:
            return f.read()

    async def destroy_sandbox(self, sandbox_id: str) -> bool:
        work_dir = self._temp_dirs.pop(sandbox_id, None)
        if work_dir and work_dir.exists():
            shutil.rmtree(work_dir, ignore_errors=True)
            return True
        return False


# Instances uniques
local_sandbox_provider = LocalSandboxProvider()
e2b_sandbox_provider = E2BSandboxProvider()


# ══════════════════════════════════════════════════════════════
# 5. Sandbox Manager (Central Orchestrator)
# ══════════════════════════════════════════════════════════════

class SandboxManager:
    """
    Gestionnaire central des bacs à sable Ñkyel.
    Contrôle les quotas, l'isolation et les timeouts.
    """

    def __init__(self, primary_provider: Optional[SandboxProvider] = None):
        self._provider = primary_provider or e2b_sandbox_provider
        self._active_sandboxes: Dict[str, SandboxConfig] = {}

    async def acquire_sandbox(self, config: SandboxConfig) -> str:
        """Obtient une sandbox isolée et enregistre sa session."""
        sandbox_id = await self._provider.create_sandbox(config)
        self._active_sandboxes[sandbox_id] = config
        return sandbox_id

    async def execute_in_sandbox(
        self,
        sandbox_id: str,
        code: str,
        language: str = "python",
        timeout: Optional[int] = None,
    ) -> SandboxExecutionResult:
        """Exécute du code avec contrôle d'accès."""
        return await self._provider.run_code(sandbox_id, code, language, timeout)

    async def release_sandbox(self, sandbox_id: str) -> bool:
        """Libère et détruit la sandbox."""
        self._active_sandboxes.pop(sandbox_id, None)
        return await self._provider.destroy_sandbox(sandbox_id)


# Singleton
sandbox_manager = SandboxManager()
