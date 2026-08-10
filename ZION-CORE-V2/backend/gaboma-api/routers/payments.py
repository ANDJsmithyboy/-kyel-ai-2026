# FILE: gaboma-api/routers/payments.py
from uuid import uuid4

from fastapi import APIRouter, status

from models.payment import (
    InitiatePaymentRequest,
    InitiatePaymentResponse,
    PaymentCallbackPayload,
    PaymentStatus,
)

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post(
    "/initiate",
    response_model=InitiatePaymentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Initier un paiement Mobile Money",
    description="Crée une facture E-Billing et déclenche un USSD Push Airtel Money ou Moov Money via FastAPI uniquement.",
)
async def initiate_payment(payload: InitiatePaymentRequest) -> InitiatePaymentResponse:
    """Squelette sans appel externe réel pour éviter tout débit accidentel."""
    invoice_id = f"gbm-dev-{uuid4()}"

    return InitiatePaymentResponse(
        invoice_id=invoice_id,
        status=PaymentStatus.pending,
        amount_xaf=payload.amount_xaf,
        message=(
            "Facture de développement créée. "
            "Le connecteur E-Billing réel sera activé dans le Sprint Paiement."
        ),
    )


@router.post(
    "/callback",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Recevoir le callback E-Billing",
    description="Webhook appelé par E-Billing après paiement. L'upgrade automatique du tier sera branché avec idempotence.",
)
async def payment_callback(payload: PaymentCallbackPayload) -> dict[str, str]:
    """Webhook temporaire idempotent au niveau contrat."""
    return {
        "invoice_id": payload.invoice_id,
        "status": payload.status,
        "message": "Callback reçu. Traitement persistant à brancher dans le Sprint Paiement.",
    }
