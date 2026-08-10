"""
GabomaAI — API v1 RAG Query · SmartANDJ AI Technologies
Recherche vectorielle Qdrant (LOXO)
Protégé par Clerk JWKS.
Fondateur : Daniel Jonathan ANDJ
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from core.security import get_current_user
from services.qdrant_service import query_qdrant

router = APIRouter(prefix="/v1", tags=["RAG v1"])


class RAGQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    collection: str = Field(default="gaboma_loxo")
    top_k: int = Field(default=5, ge=1, le=20)


class RAGChunk(BaseModel):
    id: str
    content: str
    score: float
    source: str
    url: str


class RAGQueryResponse(BaseModel):
    query: str
    chunks: list[RAGChunk]
    total_found: int


@router.post("/rag/query", response_model=RAGQueryResponse)
async def rag_query(
    req: RAGQueryRequest,
    user: dict = Depends(get_current_user),
):
    """
    Recherche dans le Radar LOXO (Qdrant).
    """
    chunks = await query_qdrant(req.query, top_k=req.top_k, collection=req.collection)
    
    rag_chunks = [
        RAGChunk(
            id=c["id"],
            content=c["content"],
            score=c["score"],
            source=c["source"],
            url=c["url"]
        ) for c in chunks
    ]

    return RAGQueryResponse(
        query=req.query,
        chunks=rag_chunks,
        total_found=len(rag_chunks),
    )
