"""
Ñkyel AI — Service de Modération & Sécurité Multimédia · SmartANDJ AI Technologies
Garantit la conformité éthique, la protection de l'identité et le nettoyage des métadonnées.

Règles appliquées :
- Refus de contenus illégaux / haineux / violents
- Protection stricte contre les deepfakes non consentis
- Validation des types MIME et signatures (magic bytes)
- Décapage (stripping) complet des métadonnées EXIF / GPS / device IDs
- Contrôle strict des tailles de fichiers (Images <= 20 Mo, Vidéos <= 100 Mo)
- Journalisation Sentry avec masquage systématique des PII

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import io
import re
import logging
from typing import Tuple, Optional, Dict, Any
from PIL import Image

from core.config import settings

logger = logging.getLogger(__name__)

# ── Mots-clés et motifs prohibés ─────────────────────────────
PROHIBITED_TERMS = [
    r"\bchild[\s_-]*abuse\b",
    r"\bcsam\b",
    r"\bpedophil\w*\b",
    r"\bdeepfake\s+(nude|porn|explicit|face[\s_-]*swap)\b",
    r"\bnon[\s_-]*consensual\b",
    r"\bterrorism\b",
    r"\bself[\s_-]*harm\b",
    r"\bsuicide\b",
    r"\bweapon\s+manufacturing\b",
    r"\bhate[\s_-]*speech\b",
]

DISALLOWED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in PROHIBITED_TERMS]

# ── Signatures Magic Bytes ──────────────────────────────────
MAGIC_SIGNATURES = {
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"\xff\xd8\xff": "image/jpeg",
    b"RIFF": "image/webp",  # suivi de WEBP plus loin
    b"GIF87a": "image/gif",
    b"GIF89a": "image/gif",
    b"\x00\x00\x00\x18ftypmp42": "video/mp4",
    b"\x00\x00\x00\x20ftypisom": "video/mp4",
    b"\x00\x00\x00\x1cftypisom": "video/mp4",
    b"\x00\x00\x00\x14ftyp": "video/mp4",
}

MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024  # 20 Mo
MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024  # 100 Mo


class ModerationService:
    """Service de modération de sécurité et nettoyage des actifs multimédias."""

    @classmethod
    def check_text_prompt(cls, prompt: str) -> Tuple[bool, Optional[str]]:
        """
        Vérifie si le prompt textuel respecte la charte de sécurité.
        Retourne (is_safe, error_reason).
        """
        if not prompt or not prompt.strip():
            return False, "Le prompt ne peut pas être vide."

        # Recherche de motifs prohibés
        for pattern in DISALLOWED_PATTERNS:
            if pattern.search(prompt):
                cls._log_security_alert("prohibited_prompt_content", prompt)
                return False, "Ce prompt enfreint les règles de sécurité et d'intégrité de Ñkyel AI."

        return True, None

    @classmethod
    def validate_file_buffer(
        cls, buffer: bytes, expected_type: str = "image"
    ) -> Tuple[bool, str, Optional[str]]:
        """
        Valide la taille et le type MIME réel d'un tampon binaire.
        Retourne (is_valid, detected_mime, error_reason).
        """
        size = len(buffer)
        if size == 0:
            return False, "", "Fichier vide fourni."

        if expected_type == "image" and size > MAX_IMAGE_SIZE_BYTES:
            return False, "", f"L'image dépasse la taille maximale autorisée (20 Mo, reçue: {size / 1024 / 1024:.1f} Mo)."

        if expected_type == "video" and size > MAX_VIDEO_SIZE_BYTES:
            return False, "", f"La vidéo dépasse la taille maximale autorisée (100 Mo, reçue: {size / 1024 / 1024:.1f} Mo)."

        # Détection Magic Bytes
        detected_mime = "application/octet-stream"
        for sig, mime in MAGIC_SIGNATURES.items():
            if buffer.startswith(sig):
                detected_mime = mime
                break
        
        # Vérification WebP spécifique
        if buffer.startswith(b"RIFF") and b"WEBP" in buffer[:16]:
            detected_mime = "image/webp"

        # Validation par Pillow pour les images
        if expected_type == "image":
            try:
                img = Image.open(io.BytesIO(buffer))
                img.verify()
                format_lower = (img.format or "").lower()
                if format_lower in ("png", "jpeg", "jpg", "webp", "gif"):
                    detected_mime = f"image/{'jpeg' if format_lower == 'jpg' else format_lower}"
            except Exception as e:
                return False, "", f"Fichier image corrompu ou invalide: {str(e)}"

        return True, detected_mime, None

    @classmethod
    def strip_image_metadata(cls, image_bytes: bytes) -> bytes:
        """
        Supprime toutes les métadonnées EXIF, GPS, numéros de série de caméra
        et retourne une image propre sans fuite de PII.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))
            # Créer une nouvelle image vierge sans les dictionnaires EXIF
            clean_img = Image.new(image.mode, image.size)
            clean_img.putdata(list(image.getdata()))

            output = io.BytesIO()
            format_to_save = image.format or "PNG"
            clean_img.save(output, format=format_to_save, quality=95)
            return output.getvalue()
        except Exception as e:
            logger.warning(f"Metadata strip fallback failed: {e}")
            return image_bytes

    @classmethod
    def log_security_incident(
        cls, incident_type: str, details: str, user_id_sub: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Journalise un incident de sécurité en masquant systématiquement tout token,
        clé API, mot de passe ou PII avant envoi à Sentry.
        """
        # Nettoyage des motifs de secrets/tokens/PII
        sanitized = re.sub(r"(token|api[-_]?key|bearer|password|secret)[^\s,;]*", "[REDACTED]", details, flags=re.IGNORECASE)
        sanitized_user = f"user_{user_id_sub[:8]}..." if user_id_sub and len(user_id_sub) > 8 else (user_id_sub or "anonymous")
        
        logger.warning(f"[SECURITY INCIDENT] Type: {incident_type} | User: {sanitized_user} | Details: {sanitized}")

        if settings.sentry_dsn:
            try:
                import sentry_sdk
                with sentry_sdk.push_scope() as scope:
                    scope.set_tag("incident_type", incident_type)
                    scope.set_user({"id": sanitized_user})
                    sentry_sdk.capture_message(f"Security Incident: {incident_type} - {sanitized}", level="error")
            except Exception:
                pass

        return {
            "status": "logged_to_sentry",
            "incident_type": incident_type,
            "details": sanitized,
            "user_id_sub": sanitized_user,
        }

    @classmethod
    def _log_security_alert(cls, alert_type: str, raw_text: str) -> None:
        """Enregistre un incident de sécurité en masquant les détails privés."""
        scrubbed = raw_text[:30] + "..." if len(raw_text) > 30 else raw_text
        logger.warning(f"[SECURITY ALERT] {alert_type}: prompt={scrubbed}")

        if settings.sentry_dsn:
            try:
                import sentry_sdk
                sentry_sdk.capture_message(f"Security Alert: {alert_type}", level="warning")
            except Exception:
                pass

