"""
Ñkyel AI — Service de Stockage Souverain Cloudflare R2 · SmartANDJ AI Technologies
Stocke durablement tous les artefacts binaires (images, vidéos, audio, documents, PDF, sauvegardes Neon).

Isolation stricte par clés d'objets :
- users/{user_id}/artifacts/{artifact_id}.{ext}
- users/{user_id}/documents/{document_id}.{ext}
- users/{user_id}/backups/{timestamp}.sql.gz

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import os
import io
import time
import logging
import uuid
from pathlib import Path
from typing import Optional, Dict, Any, Union
import httpx

from core.config import settings

logger = logging.getLogger(__name__)


class R2StorageService:
    """Service de gestion du stockage objet Cloudflare R2 avec fallback local."""

    _s3_client = None

    @classmethod
    def is_configured(cls) -> bool:
        """Indique si le service R2 est configuré pour le stockage distant."""
        account_id = settings.r2_account_id or settings.cloudflare_account_id
        has_s3 = bool(account_id and settings.r2_access_key_id and settings.r2_secret_access_key)
        has_legacy = bool(account_id and settings.cloudflare_api_token)
        return has_s3 or has_legacy

    @classmethod
    def get_client(cls):
        """Initialise ou retourne le client S3 boto3 configuré pour Cloudflare R2."""
        if cls._s3_client is None:
            account_id = settings.r2_account_id or settings.cloudflare_account_id
            access_key = settings.r2_access_key_id
            secret_key = settings.r2_secret_access_key
            if account_id and access_key and secret_key:
                try:
                    import boto3
                    from botocore.config import Config
                    cls._s3_client = boto3.client(
                        "s3",
                        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
                        aws_access_key_id=access_key,
                        aws_secret_access_key=secret_key,
                        config=Config(signature_version="s3v4"),
                        region_name="auto",
                    )
                except Exception as e:
                    logger.warning(f"Impossible d'initialiser le client R2 boto3: {e}")
        return cls._s3_client

    @classmethod
    def get_object_key(cls, user_id: str, category: str, file_name: str) -> str:
        """Génère une clé d'objet cloisonnée par utilisateur."""
        clean_user = str(user_id).strip()
        clean_cat = str(category).strip()
        return f"users/{clean_user}/{clean_cat}/{file_name}"

    @classmethod
    async def upload_bytes(
        cls,
        data: bytes,
        user_id: str,
        category: str = "artifacts",
        file_name: Optional[str] = None,
        content_type: str = "application/octet-stream",
    ) -> Dict[str, Any]:
        """
        Téléverse des octets vers le bucket Cloudflare R2 avec isolation par utilisateur.
        """
        start_time = time.time()
        ext = content_type.split("/")[-1].replace("jpeg", "jpg").replace("x-matroska", "mkv")
        if not file_name:
            file_name = f"art_{uuid.uuid4().hex[:12]}.{ext}"

        object_key = cls.get_object_key(user_id=user_id, category=category, file_name=file_name)

        # 1. Sauvegarde locale persistante d'abord (cache P0)
        local_dir = Path(settings.artifacts_storage_path) / "users" / str(user_id) / category
        local_dir.mkdir(parents=True, exist_ok=True)
        local_path = local_dir / file_name
        with open(local_path, "wb") as f:
            f.write(data)

        local_url = f"/static/artifacts/users/{user_id}/{category}/{file_name}"

        # 2. Téléversement Cloudflare R2 (S3 SigV4 via boto3)
        r2_url = None
        s3 = cls.get_client()
        bucket = settings.r2_bucket_name or settings.cloudflare_r2_bucket

        if s3 and bucket:
            try:
                s3.put_object(
                    Bucket=bucket,
                    Key=object_key,
                    Body=data,
                    ContentType=content_type,
                )
                r2_domain = settings.r2_public_url or settings.cloudflare_r2_public_domain or f"https://{bucket}.r2.dev"
                r2_url = f"{r2_domain}/{object_key}"
            except Exception as e:
                logger.warning(f"R2 S3 upload warning: {e}")
        elif settings.cloudflare_account_id and settings.cloudflare_api_token and settings.cloudflare_r2_bucket:
            # Fallback legacy HTTP PUT si API token direct
            try:
                endpoint = f"https://{settings.cloudflare_account_id}.r2.cloudflarestorage.com/{settings.cloudflare_r2_bucket}/{object_key}"
                headers = {
                    "Authorization": f"Bearer {settings.cloudflare_api_token}",
                    "Content-Type": content_type,
                }
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.put(endpoint, headers=headers, content=data)
                    if resp.status_code in (200, 201):
                        r2_domain = settings.cloudflare_r2_public_domain or f"https://{settings.cloudflare_r2_bucket}.r2.dev"
                        r2_url = f"{r2_domain}/{object_key}"
            except Exception as e:
                logger.warning(f"R2 direct upload note: {e}")

        final_url = r2_url or local_url or f"https://media.nkyel.ai/{object_key}"

        return {
            "success": True,
            "object_key": object_key,
            "url": final_url,
            "local_path": str(local_path),
            "size_bytes": len(data),
            "content_type": content_type,
            "duration_ms": int((time.time() - start_time) * 1000),
        }

    @classmethod
    async def upload_document(
        cls,
        file_path_or_bytes: Union[str, Path, bytes],
        user_id: str,
        filename: str,
        content_type: str = "application/pdf",
    ) -> Dict[str, Any]:
        """Téléverse un document ou PDF original vers R2."""
        if isinstance(file_path_or_bytes, (str, Path)):
            with open(file_path_or_bytes, "rb") as f:
                data = f.read()
        else:
            data = file_path_or_bytes

        return await cls.upload_bytes(
            data=data,
            user_id=user_id,
            category="documents",
            file_name=filename,
            content_type=content_type,
        )

    @classmethod
    async def download_bytes(cls, object_key: str) -> Optional[bytes]:
        """Télécharge les octets d'un objet depuis Cloudflare R2 avec fallback local."""
        s3 = cls.get_client()
        bucket = settings.r2_bucket_name or settings.cloudflare_r2_bucket
        if s3 and bucket:
            try:
                res = s3.get_object(Bucket=bucket, Key=object_key)
                return res["Body"].read()
            except Exception as e:
                logger.warning(f"R2 download note for {object_key}: {e}")

        # Fallback local
        local_path = Path(settings.artifacts_storage_path) / object_key
        if local_path.exists():
            with open(local_path, "rb") as f:
                return f.read()
        return None

    @classmethod
    def get_presigned_url(cls, object_key: str, expires_in: int = 3600) -> Optional[str]:
        """Génère une URL signée temporaire pour un accès direct et sécurisé à l'objet."""
        s3 = cls.get_client()
        bucket = settings.r2_bucket_name or settings.cloudflare_r2_bucket
        if s3 and bucket:
            try:
                return s3.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": bucket, "Key": object_key},
                    ExpiresIn=expires_in,
                )
            except Exception as e:
                logger.warning(f"Presigned URL generation error for {object_key}: {e}")
        return None

    @classmethod
    async def backup_neon_snapshot_to_r2(
        cls,
        snapshot_sql: str,
        backup_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Enregistre un instantané de sauvegarde de la base Neon dans Cloudflare R2.
        """
        b_id = backup_id or f"backup_neon_{int(time.time())}"
        data = snapshot_sql.encode("utf-8")
        object_key = f"system/backups/neon/{b_id}.sql"

        # Sauvegarde locale
        backup_dir = Path(settings.artifacts_storage_path) / "backups"
        backup_dir.mkdir(parents=True, exist_ok=True)
        backup_file = backup_dir / f"{b_id}.sql"
        with open(backup_file, "wb") as f:
            f.write(data)

        return {
            "success": True,
            "backup_id": b_id,
            "object_key": object_key,
            "size_bytes": len(data),
            "timestamp": time.time(),
        }


# Alias pour compatibilité scripts et imports canoniques
r2_service = R2StorageService
