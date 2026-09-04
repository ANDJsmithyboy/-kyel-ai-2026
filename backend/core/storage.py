import os
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
import logging
import asyncio

logger = logging.getLogger("nkyel.storage")

class CloudflareR2Storage:
    def __init__(self):
        self.account_id = os.environ.get("R2_ACCOUNT_ID")
        self.access_key = os.environ.get("R2_ACCESS_KEY_ID")
        self.secret_key = os.environ.get("R2_SECRET_ACCESS_KEY")
        self.bucket_name = os.environ.get("R2_BUCKET_NAME", "nkyel-artifacts")
        self.public_url = os.environ.get("R2_PUBLIC_BASE_URL")

        if not self.account_id:
            logger.warning("R2_ACCOUNT_ID non configuré. Le stockage R2 est inactif.")
            self.client = None
            return

        endpoint_url = f"https://{self.account_id}.r2.cloudflarestorage.com"

        self.client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            config=Config(signature_version="s3v4"),
            region_name="auto"
        )

    def _generate_presigned_url(self, method: str, object_key: str, expires_in: int = 3600, content_type: str = None) -> str:
        if not self.client:
            raise ValueError("R2 Storage n'est pas configuré.")
        
        params = {
            "Bucket": self.bucket_name,
            "Key": object_key
        }
        
        if content_type and method == "put_object":
            params["ContentType"] = content_type

        try:
            return self.client.generate_presigned_url(
                ClientMethod=method,
                Params=params,
                ExpiresIn=expires_in
            )
        except ClientError as e:
            logger.error(f"Erreur lors de la génération de l'URL présignée ({method}): {e}")
            raise

    async def generate_presigned_put(self, object_key: str, expires_in: int = 3600, content_type: str = None) -> str:
        """Génère une URL PUT présignée de manière asynchrone pour l'upload d'un objet (ex: depuis le frontend)."""
        return await asyncio.to_thread(self._generate_presigned_url, "put_object", object_key, expires_in, content_type)

    async def generate_presigned_get(self, object_key: str, expires_in: int = 3600) -> str:
        """Génère une URL GET présignée de manière asynchrone pour télécharger un objet."""
        return await asyncio.to_thread(self._generate_presigned_url, "get_object", object_key, expires_in)

    async def generate_public_url(self, object_key: str) -> str:
        """Si un domaine public est configuré pour le bucket (marketing, images publiques)."""
        if self.public_url:
            base = self.public_url.rstrip("/")
            return f"{base}/{object_key}"
        return await self.generate_presigned_get(object_key)


# Singleton
r2_storage = CloudflareR2Storage()
