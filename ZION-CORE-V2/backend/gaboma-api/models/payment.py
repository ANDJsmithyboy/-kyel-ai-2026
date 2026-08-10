# FILE: gaboma-api/models/payment.py
from enum import StrEnum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from models.user import UserTier


class PaymentOperator(StrEnum):
    """Opérateurs mobile money supportés au Gabon."""

    airtel = "airtel"
    moov = "moov"


class PaymentStatus(StrEnum):
    """Statuts normalisés côté GabomaGPT."""

    pending = "pending"
    paid = "paid"
    failed = "failed"
    expired = "expired"


class InitiatePaymentRequest(BaseModel):
    """Demande d'initiation USSD Push via E-Billing."""

    model_config = ConfigDict(str_strip_whitespace=True)

    phone: str = Field(
        pattern=r"^(06|07)\d{8}$",
        description="Numéro de paiement au format 06XXXXXXXX ou 07XXXXXXXX.",
    )
    operator: PaymentOperator
    target_tier: UserTier = Field(
        description="Tier demandé après paiement.",
    )
    amount_xaf: int = Field(
        ge=100,
        le=1_000_000,
        description="Montant en XAF.",
    )


class InitiatePaymentResponse(BaseModel):
    """Réponse après création de facture E-Billing."""

    invoice_id: str
    status: PaymentStatus
    amount_xaf: int
    message: str


class PaymentCallbackPayload(BaseModel):
    """Payload webhook normalisé reçu depuis E-Billing."""

    invoice_id: str
    external_transaction_id: Optional[str] = None
    status: PaymentStatus
    phone: str = Field(pattern=r"^(06|07)\d{8}$")
    amount_xaf: int = Field(ge=0)
    target_tier: UserTier
