"""
GabomaGPT · payment.py · SmartANDJ AI Technologies
Router FastAPI pour proxy paiement → service Go
"""

import os
import logging
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import httpx

log = logging.getLogger("gabomagpt.payment")

router = APIRouter(prefix="/api/payment", tags=["payment"])

PAYMENT_SERVICE_URL = os.getenv("PAYMENT_SERVICE_URL", "http://localhost:8001")


class InitiateRequest(BaseModel):
    plan: str
    operator: str
    userId: str


class CreditTokensRequest(BaseModel):
    userId: str
    plan: str
    tokens: int


@router.post("/initiate")
async def initiate_payment(req: InitiateRequest):
    """Proxy vers le service Go — initier un paiement SUMB"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{PAYMENT_SERVICE_URL}/api/payment/initiate",
                json=req.model_dump(),
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=resp.text)
            return resp.json()
    except httpx.RequestError as e:
        log.error(f"Erreur connexion service paiement: {e}")
        raise HTTPException(status_code=503, detail="Service de paiement indisponible")


@router.get("/status")
async def get_payment_status(ref: str):
    """Proxy vers le service Go — statut d'un paiement"""
    if not ref:
        raise HTTPException(status_code=400, detail="Référence manquante")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{PAYMENT_SERVICE_URL}/api/payment/status",
                params={"ref": ref},
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=resp.text)
            return resp.json()
    except httpx.RequestError as e:
        log.error(f"Erreur connexion service paiement: {e}")
        raise HTTPException(status_code=503, detail="Service de paiement indisponible")
