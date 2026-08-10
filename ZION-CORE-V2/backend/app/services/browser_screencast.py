"""
GabomaAI · Browser Screencast Service
SmartANDJ AI Technologies
CDP Page.startScreencast → JPEG frames → asyncio.Queue → WebSocket relay
"""

import asyncio
import base64
import logging
from typing import Optional

logger = logging.getLogger("gaboma.browser_screencast")


class BrowserScreencastService:
    """
    Attache une session CDP à une page Playwright active,
    active Page.startScreencast, et pousse les frames JPEG
    dans une asyncio.Queue pour le relais WebSocket.
    """

    def __init__(self):
        self._sessions: dict[str, "_ScreencastSession"] = {}

    async def start_session(
        self,
        session_id: str,
        page,  # playwright.async_api.Page
        *,
        quality: int = 40,
        max_width: int = 1024,
        max_height: int = 768,
        every_nth_frame: int = 1,
    ) -> asyncio.Queue:
        """
        Démarre le screencast CDP pour la page donnée.
        Retourne une asyncio.Queue[bytes | None] de frames JPEG.
        None = fin du stream.
        """
        if session_id in self._sessions:
            await self.stop_session(session_id)

        queue: asyncio.Queue = asyncio.Queue(maxsize=4)
        cdp = await page.context.new_cdp_session(page)

        async def on_frame(params: dict):
            """Callback CDP Page.screencastFrame."""
            # Acquitter la frame pour recevoir la suivante
            await cdp.send("Page.screencastFrameAck", {"sessionId": params["sessionId"]})
            jpeg_bytes = base64.b64decode(params["data"])
            try:
                queue.put_nowait(jpeg_bytes)
            except asyncio.QueueFull:
                # On drop l'ancienne frame pour garder la plus récente
                try:
                    queue.get_nowait()
                except asyncio.QueueEmpty:
                    pass
                queue.put_nowait(jpeg_bytes)

        cdp.on("Page.screencastFrame", on_frame)

        await cdp.send(
            "Page.startScreencast",
            {
                "format": "jpeg",
                "quality": quality,
                "maxWidth": max_width,
                "maxHeight": max_height,
                "everyNthFrame": every_nth_frame,
            },
        )

        self._sessions[session_id] = _ScreencastSession(
            cdp=cdp, queue=queue, page=page
        )
        logger.info(f"Screencast démarré pour session {session_id}")
        return queue

    async def stop_session(self, session_id: str) -> None:
        """Arrête proprement le screencast CDP."""
        session = self._sessions.pop(session_id, None)
        if session is None:
            return
        try:
            await session.cdp.send("Page.stopScreencast")
            await session.cdp.detach()
        except Exception:
            pass
        # Signal de fin
        try:
            session.queue.put_nowait(None)
        except asyncio.QueueFull:
            pass
        logger.info(f"Screencast arrêté pour session {session_id}")

    async def stop_all(self) -> None:
        """Arrête toutes les sessions actives."""
        for sid in list(self._sessions.keys()):
            await self.stop_session(sid)


class _ScreencastSession:
    __slots__ = ("cdp", "queue", "page")

    def __init__(self, cdp, queue: asyncio.Queue, page):
        self.cdp = cdp
        self.queue = queue
        self.page = page


# Singleton
screencast_service = BrowserScreencastService()
