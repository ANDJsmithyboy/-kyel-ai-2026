"""
Test suite for hardened Clerk JWT authentication & JWKS verification.
"""

import time
import pytest
import asyncio
from unittest.mock import patch, MagicMock
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import jwt

from core.security import _verify_clerk_token, ClerkJWKSManager
from core.config import settings


# ── Fixtures: Generate ephemeral RSA keypair ───────────────────
@pytest.fixture(scope="module")
def rsa_keypair():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    public_key = private_key.public_key()
    
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")
    
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")
    
    return {"private_pem": private_pem, "public_pem": public_pem, "kid": "test_kid_production_1"}


def create_token(payload: dict, private_pem: str, kid: str = "test_kid_production_1", alg: str = "RS256") -> str:
    headers = {"kid": kid, "alg": alg}
    return jwt.encode(payload, private_pem, algorithm=alg, headers=headers)


@pytest.mark.asyncio
async def test_valid_clerk_jwt_verification(rsa_keypair):
    """Vérifie qu'un JWT valide avec les claims attendus est correctement vérifié."""
    now = int(time.time())
    payload = {
        "sub": "user_2production_clerk_id_999",
        "email": "jonathanakarentoutoume@gmail.com",
        "iss": settings.clerk_issuer,
        "azp": "https://nkyel.smartandjai.com",
        "iat": now,
        "nbf": now - 5,
        "exp": now + 3600,
    }
    token = create_token(payload, rsa_keypair["private_pem"], kid=rsa_keypair["kid"])

    # Mock manager to return the public key
    with patch.object(ClerkJWKSManager, "get_signing_key", return_value=rsa_keypair["public_pem"]):
        verified = await _verify_clerk_token(token)
        assert verified["sub"] == "user_2production_clerk_id_999"
        assert verified["email"] == "jonathanakarentoutoume@gmail.com"
        assert verified["iss"] == settings.clerk_issuer
        assert verified["azp"] == "https://nkyel.smartandjai.com"


@pytest.mark.asyncio
async def test_expired_clerk_jwt(rsa_keypair):
    """Vérifie qu'un JWT expiré est rejeté."""
    now = int(time.time())
    payload = {
        "sub": "user_expired",
        "iss": settings.clerk_issuer,
        "azp": "https://nkyel.smartandjai.com",
        "iat": now - 3600,
        "nbf": now - 3600,
        "exp": now - 100,  # Déjà expiré
    }
    token = create_token(payload, rsa_keypair["private_pem"], kid=rsa_keypair["kid"])

    with patch.object(ClerkJWKSManager, "get_signing_key", return_value=rsa_keypair["public_pem"]):
        with pytest.raises(jwt.ExpiredSignatureError):
            await _verify_clerk_token(token)


@pytest.mark.asyncio
async def test_invalid_issuer(rsa_keypair):
    """Vérifie qu'un JWT avec un mauvais issuer est rejeté."""
    now = int(time.time())
    payload = {
        "sub": "user_bad_issuer",
        "iss": "https://attacker.clerk.com",
        "azp": "https://nkyel.smartandjai.com",
        "iat": now,
        "exp": now + 3600,
    }
    token = create_token(payload, rsa_keypair["private_pem"], kid=rsa_keypair["kid"])

    with patch.object(ClerkJWKSManager, "get_signing_key", return_value=rsa_keypair["public_pem"]):
        with pytest.raises(jwt.InvalidIssuerError):
            await _verify_clerk_token(token)


@pytest.mark.asyncio
async def test_unauthorized_azp(rsa_keypair):
    """Vérifie qu'un JWT émis pour un autre frontend est rejeté."""
    now = int(time.time())
    payload = {
        "sub": "user_bad_azp",
        "iss": settings.clerk_issuer,
        "azp": "https://evil-unauthorized-app.com",
        "iat": now,
        "exp": now + 3600,
    }
    token = create_token(payload, rsa_keypair["private_pem"], kid=rsa_keypair["kid"])

    with patch.object(ClerkJWKSManager, "get_signing_key", return_value=rsa_keypair["public_pem"]):
        with pytest.raises(jwt.InvalidTokenError, match="non autorisé"):
            await _verify_clerk_token(token)


@pytest.mark.asyncio
async def test_missing_azp_rejection(rsa_keypair):
    """Vérifie qu'un JWT sans claim azp est strictement rejeté lorsque authorized_parties est configuré."""
    now = int(time.time())
    payload = {
        "sub": "user_no_azp",
        "iss": settings.clerk_issuer,
        # "azp" omis intentionnellement
        "iat": now,
        "exp": now + 3600,
    }
    token = create_token(payload, rsa_keypair["private_pem"], kid=rsa_keypair["kid"])

    with patch.object(ClerkJWKSManager, "get_signing_key", return_value=rsa_keypair["public_pem"]):
        with pytest.raises(jwt.InvalidTokenError, match="claim 'azp' .* absent"):
            await _verify_clerk_token(token)

