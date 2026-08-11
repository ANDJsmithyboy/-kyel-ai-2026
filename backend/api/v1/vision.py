from fastapi import APIRouter, File, UploadFile, Form, Depends, HTTPException
from typing import List, Optional
from services.nkyelvision_client import nkyelvision_client
# Importer la dépendance Clerk si existante : from core.auth import get_current_user

router = APIRouter()

@router.post("/vision/analyze")
async def analyze_vision(
    files: List[UploadFile] = File(...),
    prompt: str = Form("Que vois-tu dans cette image/vidéo ?"),
    # current_user = Depends(get_current_user) # Désactivé temporairement pour le test
):
    """
    Endpoint appelé par le Frontend Next.js (Bouton Live ou Upload)
    Sert de proxy vers le conteneur GPU ÑkyelVision.
    """
    if not files:
        raise HTTPException(status_code=400, detail="Aucun fichier fourni.")
        
    text_result = await nkyelvision_client.analyze_media(files=files, prompt=prompt)
    
    return {
        "text": text_result,
        "meta": {
            "model": "ÑkyelVision",
            "files_analyzed": len(files)
        }
    }
