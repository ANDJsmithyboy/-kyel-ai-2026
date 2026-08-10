import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier audio fourni.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY non configurée sur le serveur.' },
        { status: 500 }
      );
    }

    // Préparer la requête pour Groq Whisper
    const groqFormData = new FormData();
    groqFormData.append('file', file, 'audio.webm');
    groqFormData.append('model', 'whisper-large-v3');
    // groqFormData.append('language', 'fr'); // Optionnel: forcer le français

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: groqFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Erreur API Groq:', errText);
      return NextResponse.json(
        { error: `Erreur Groq: ${response.status} - ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error('Erreur lors de la transcription audio:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur lors de la transcription.' },
      { status: 500 }
    );
  }
}
