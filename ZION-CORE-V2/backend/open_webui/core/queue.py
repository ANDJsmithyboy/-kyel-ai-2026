# GabomaGPT · queue.py · SmartANDJ AI Technologies
# File de priorité pour 60k+ utilisateurs simultanés
# Fondateur: Daniel Jonathan ANDJ

import asyncio
import logging
import time
from typing import Optional, Callable, Any, Dict
from dataclasses import dataclass, field
from enum import IntEnum

log = logging.getLogger(__name__)


# ============================================================
# Niveaux de priorité par plan tarifaire
# ============================================================

class Priority(IntEnum):
    """Priorité inversée : plus le chiffre est bas, plus c'est prioritaire."""
    PANTHER_PRO = 1   # 150 000 FCFA — traitement immédiat
    PANTHER = 2       # 50 000 FCFA — quasi-immédiat
    ELITE = 3         # 13 000 FCFA — prioritaire
    PRO = 4           # 2 500 FCFA — standard
    FLASH = 5         # Gratuit — file d'attente


PLAN_PRIORITY_MAP: Dict[str, Priority] = {
    "panther_pro": Priority.PANTHER_PRO,
    "panther": Priority.PANTHER,
    "elite": Priority.ELITE,
    "pro": Priority.PRO,
    "flash": Priority.FLASH,
}


# ============================================================
# Élément de la file
# ============================================================

@dataclass(order=True)
class QueueItem:
    """Élément dans la file de priorité."""
    priority: int
    timestamp: float = field(compare=True)
    user_id: str = field(compare=False)
    plan: str = field(compare=False)
    task: Callable = field(compare=False, repr=False)
    kwargs: Dict[str, Any] = field(compare=False, default_factory=dict)
    future: asyncio.Future = field(compare=False, default=None, repr=False)


# ============================================================
# File de priorité asynchrone
# ============================================================

class GabomaQueue:
    """
    File de priorité asynchrone pour GabomaGPT.

    Gère 60k+ utilisateurs simultanés avec :
    - Priorité par plan tarifaire (Panther Pro > Flash)
    - Concurrence limitée pour protéger le GPU/API
    - Timeout par requête
    - Métriques temps réel
    """

    def __init__(
        self,
        max_concurrent: int = 50,
        max_queue_size: int = 10000,
        request_timeout: float = 120.0,
    ):
        self._queue: asyncio.PriorityQueue = asyncio.PriorityQueue(maxsize=max_queue_size)
        self._semaphore = asyncio.Semaphore(max_concurrent)
        self._max_concurrent = max_concurrent
        self._max_queue_size = max_queue_size
        self._request_timeout = request_timeout
        self._workers: list[asyncio.Task] = []
        self._running = False

        # Métriques
        self._total_processed = 0
        self._total_errors = 0
        self._total_timeouts = 0
        self._active_tasks = 0
        self._start_time = time.monotonic()

        log.info(
            f"GabomaQueue initialisée: "
            f"max_concurrent={max_concurrent}, "
            f"max_queue={max_queue_size}, "
            f"timeout={request_timeout}s"
        )

    async def start(self, num_workers: int = 10) -> None:
        """Démarre les workers de la file."""
        if self._running:
            return
        self._running = True
        self._start_time = time.monotonic()
        for i in range(num_workers):
            task = asyncio.create_task(self._worker(f"worker-{i}"))
            self._workers.append(task)
        log.info(f"GabomaQueue: {num_workers} workers démarrés")

    async def stop(self) -> None:
        """Arrête proprement la file."""
        self._running = False
        for worker in self._workers:
            worker.cancel()
        await asyncio.gather(*self._workers, return_exceptions=True)
        self._workers.clear()
        log.info("GabomaQueue arrêtée")

    async def enqueue(
        self,
        user_id: str,
        plan: str,
        task: Callable,
        **kwargs,
    ) -> Any:
        """
        Ajoute une tâche dans la file avec priorité selon le plan.

        Returns:
            Le résultat de la tâche une fois exécutée.

        Raises:
            asyncio.QueueFull: Si la file est pleine.
            asyncio.TimeoutError: Si la tâche dépasse le timeout.
        """
        priority = PLAN_PRIORITY_MAP.get(plan, Priority.FLASH)
        loop = asyncio.get_event_loop()
        future = loop.create_future()

        item = QueueItem(
            priority=priority.value,
            timestamp=time.monotonic(),
            user_id=user_id,
            plan=plan,
            task=task,
            kwargs=kwargs,
            future=future,
        )

        try:
            self._queue.put_nowait(item)
        except asyncio.QueueFull:
            log.warning(f"GabomaQueue: File pleine — rejet {user_id} (plan={plan})")
            raise

        queue_size = self._queue.qsize()
        if queue_size > self._max_queue_size * 0.8:
            log.warning(f"GabomaQueue: Charge élevée — {queue_size}/{self._max_queue_size}")

        try:
            result = await asyncio.wait_for(future, timeout=self._request_timeout)
            return result
        except asyncio.TimeoutError:
            self._total_timeouts += 1
            log.error(f"GabomaQueue: Timeout {user_id} après {self._request_timeout}s")
            raise

    async def _worker(self, name: str) -> None:
        """Worker qui traite les tâches de la file."""
        while self._running:
            try:
                item: QueueItem = await asyncio.wait_for(
                    self._queue.get(), timeout=1.0
                )
            except asyncio.TimeoutError:
                continue
            except asyncio.CancelledError:
                break

            wait_time = time.monotonic() - item.timestamp
            if wait_time > 5.0:
                log.info(
                    f"GabomaQueue [{name}]: {item.user_id} a attendu {wait_time:.1f}s "
                    f"(plan={item.plan}, priority={item.priority})"
                )

            async with self._semaphore:
                self._active_tasks += 1
                start = time.monotonic()
                try:
                    if asyncio.iscoroutinefunction(item.task):
                        result = await item.task(**item.kwargs)
                    else:
                        result = item.task(**item.kwargs)

                    if not item.future.done():
                        item.future.set_result(result)
                    self._total_processed += 1

                except Exception as e:
                    self._total_errors += 1
                    log.error(f"GabomaQueue [{name}]: Erreur — {e}")
                    if not item.future.done():
                        item.future.set_exception(e)

                finally:
                    self._active_tasks -= 1
                    elapsed = time.monotonic() - start
                    if elapsed > 10.0:
                        log.warning(
                            f"GabomaQueue [{name}]: Tâche lente {elapsed:.1f}s "
                            f"(user={item.user_id})"
                        )

    @property
    def metrics(self) -> Dict[str, Any]:
        """Métriques temps réel de la file."""
        uptime = time.monotonic() - self._start_time
        return {
            "queue_size": self._queue.qsize(),
            "max_queue_size": self._max_queue_size,
            "active_tasks": self._active_tasks,
            "max_concurrent": self._max_concurrent,
            "total_processed": self._total_processed,
            "total_errors": self._total_errors,
            "total_timeouts": self._total_timeouts,
            "uptime_seconds": round(uptime, 1),
            "throughput_per_min": round(
                self._total_processed / max(uptime / 60, 0.01), 1
            ),
            "error_rate": round(
                self._total_errors / max(self._total_processed, 1) * 100, 2
            ),
        }


# ============================================================
# Instance globale
# ============================================================

gaboma_queue = GabomaQueue(
    max_concurrent=50,
    max_queue_size=10000,
    request_timeout=120.0,
)
