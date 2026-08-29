import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // En l'absence d'une base de données ou de données réelles, nous renvoyons
  // intentionnellement un état vide pour forcer l'affichage de l'état vierge premium.
  // Plus tard, nous brancherons ceci sur le moteur de WorkGraph.
  
  return NextResponse.json({ nodes: [], edges: [] });
}
