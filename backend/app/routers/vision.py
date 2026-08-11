"""
Ñkyel AI · Router : Vision
POST /api/vision/analyze — proxy vers NkyelSeer.
"""

import base64
from fastapi import APIRouter, File, UploadFile, Form, Depends, HTTPException
from typing import List, Optional

from app.services.nkyelseer_client import nkyelseer
from app.models.schemas import VisionAnalyzeResponse
from app.auth.clerk import get_current_user

router = APIRouter()


@router.post("/vision/analyze", response_model=VisionAnalyzeResponse)
async def analyze_vision(
    prompt: str = Form("Décris ce que tu vois en détail."),
    image_b64: Optional[str] = Form(None),
    files: Optional[List[UploadFile]] = File(None),
    user: dict = Depends(get_current_user),
):
    """
    Analyse visuelle via NkyelSeer.
    Accepte soit des fichiers uploadés, soit une image en base64 (mode Live).
    """
    result_text = ""

    # Mode 1 : Base64 (Live NkyelSeer — frames caméra)
    if image_b64:
        result_text = await nkyelseer.analyze_image_b64(image_b64, prompt)

    # Mode 2 : Fichiers uploadés
    elif files:
        result_text = await nkyelseer.analyze_files(files, prompt)

    else:
        raise HTTPException(status_code=400, detail="Aucune image ou fichier fourni.")

    return VisionAnalyzeResponse(
        text=result_text,
        meta={
            "model": "NkyelSeer",
            "mode": nkyelseer.mode,
        },
    )
