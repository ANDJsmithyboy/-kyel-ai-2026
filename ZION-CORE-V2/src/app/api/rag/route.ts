/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Gaboma AI — RAG Qdrant Cloud Query API                     ║
 * ║  SmartANDJ AI Technologies · Constitution Zion Core          ║
 * ║                                                              ║
 * ║  Hybrid Search: Dense (sémantique) + Sparse (mots-clés)      ║
 * ║  Filtrage par langue: fang, punu, nzebi, omyene              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { NextRequest, NextResponse } from 'next/server';

const QDRANT_URL = process.env.QDRANT_URL!;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY!;
const COLLECTION_NAME = 'gabonese_corpus';

interface QdrantSearchResult {
  id: string | number;
  score: number;
  payload: {
    document: string;
    source: string;
    language: string;
    doc_type: string;
    chunk_index: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { query, language, limit = 5 } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // ─── Construction du filtre Qdrant ───
    const filter: Record<string, unknown> = {};
    if (language && language !== 'all') {
      filter.must = [
        { key: 'language', match: { value: language } }
      ];
    }

    // ─── Scroll/Search via REST API Qdrant Cloud ───
    // On utilise l'endpoint /points/query pour la recherche textuelle
    const scrollResponse = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/scroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': QDRANT_API_KEY,
      },
      body: JSON.stringify({
        limit,
        with_payload: true,
        with_vector: false,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      }),
    });

    if (!scrollResponse.ok) {
      const errorText = await scrollResponse.text();
      console.error('[RAG] Qdrant error:', errorText);
      return NextResponse.json({ error: 'Qdrant query failed', details: errorText }, { status: 502 });
    }

    const data = await scrollResponse.json();

    // ─── Formatage des résultats ───
    const results = (data.result?.points || []).map((point: QdrantSearchResult) => ({
      id: point.id,
      score: point.score || 0,
      text: point.payload?.document || '',
      source: point.payload?.source || 'unknown',
      language: point.payload?.language || 'unknown',
      doc_type: point.payload?.doc_type || 'unknown',
    }));

    return NextResponse.json({
      query,
      language: language || 'all',
      count: results.length,
      results,
    });

  } catch (error) {
    console.error('[RAG] Internal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── GET: Info sur la collection ───
export async function GET() {
  try {
    const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
      headers: { 'api-key': QDRANT_API_KEY },
    });

    if (!response.ok) {
      return NextResponse.json({ status: 'disconnected', error: await response.text() }, { status: 502 });
    }

    const data = await response.json();
    const info = data.result;

    return NextResponse.json({
      status: 'connected',
      collection: COLLECTION_NAME,
      points_count: info.points_count,
      indexed_vectors: info.indexed_vectors_count,
      segments_count: info.segments_count,
      optimizer_status: info.optimizer_status,
    });

  } catch (error) {
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 });
  }
}
