/**
 * Ñkyel AI — Universal Artifact Viewer Dispatcher · SmartANDJ AI Technologies
 * Point d'entrée unique de visualisation pour l'ensemble des 18 catégories d'artefacts réels :
 * Dispatche dynamiquement vers le visualiseur spécialisé approprié.
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React from 'react';
import ImageViewer from './ImageViewer';
import SlideViewer from './SlideViewer';
import SpreadsheetViewer from './SpreadsheetViewer';
import WebsiteViewer from './WebsiteViewer';
import DocumentViewer from './DocumentViewer';
import AudioViewer from './AudioViewer';
import DataViewer from './DataViewer';
import DiagramViewer from './DiagramViewer';
import NotebookViewer from './NotebookViewer';
import TranscriptViewer from './TranscriptViewer';
import CalendarViewer from './CalendarViewer';
import type { NkyelRendu } from '@/lib/models';

interface UniversalArtifactViewerProps {
  artifact: NkyelRendu;
  onExport?: (format: string) => void;
  onShare?: () => void;
}

export default function UniversalArtifactViewer({
  artifact,
  onExport,
  onShare,
}: UniversalArtifactViewerProps) {
  const type = String(artifact.type).toLowerCase();

  // 1. Image & Logo
  if (type === 'image' || type === 'logo') {
    return (
      <ImageViewer
        url={artifact.url || '/placeholder.png'}
        title={artifact.title}
        model={artifact.provenance?.model || 'gemini-3.1-flash-image'}
        onExport={onExport}
      />
    );
  }

  // 2. Présentations & Slides PPTX
  if (type === 'presentation' || type === 'pptx' || type === 'slides') {
    return (
      <SlideViewer
        title={artifact.title}
        onExport={(fmt) => onExport && onExport(fmt)}
      />
    );
  }

  // 3. Feuilles de Calcul & Modèles Financiers
  if (type === 'spreadsheet' || type === 'xlsx' || type === 'excel' || type === 'csv') {
    return (
      <SpreadsheetViewer
        title={artifact.title}
        onExport={(fmt) => onExport && onExport(fmt)}
      />
    );
  }

  // 4. Sites Web & Applications
  if (type === 'website' || type === 'application' || type === 'html') {
    return (
      <WebsiteViewer
        title={artifact.title}
        htmlContent={artifact.content}
        url={artifact.url}
        onExportZip={() => onExport && onExport('zip')}
      />
    );
  }

  // 5. Vidéo
  if (type === 'video') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-black">
        <video
          src={artifact.url}
          controls
          className="max-w-full max-h-[80vh] rounded-xl border border-white/10 shadow-2xl"
        />
      </div>
    );
  }

  // 6. Audio
  if (type === 'audio') {
    return (
      <AudioViewer
        title={artifact.title}
        url={artifact.url}
        onExport={(fmt) => onExport && onExport(fmt)}
      />
    );
  }

  // 7. Datasets & Données structurées (JSON, JSONL, Parquet)
  if (type === 'dataset' || type === 'json') {
    return (
      <DataViewer
        title={artifact.title}
        onExport={(fmt) => onExport && onExport(fmt)}
      />
    );
  }

  // 8. Diagrammes (SVG, Mermaid)
  if (type === 'diagram') {
    return (
      <DiagramViewer
        title={artifact.title}
        onExport={(fmt) => onExport && onExport(fmt)}
      />
    );
  }

  // 9. Notebooks scientifiques (IPYNB)
  if (type === 'notebook') {
    return (
      <NotebookViewer
        title={artifact.title}
        onExport={() => onExport && onExport('ipynb')}
      />
    );
  }

  // 10. Sous-titres & Transcriptions (SRT, VTT)
  if (type === 'transcript') {
    return (
      <TranscriptViewer
        title={artifact.title}
        onExport={(fmt) => onExport && onExport(fmt)}
      />
    );
  }

  // 11. Calendrier & Événements (ICS)
  if (type === 'calendar') {
    return (
      <CalendarViewer
        title={artifact.title}
        onExport={() => onExport && onExport('ics')}
      />
    );
  }

  // 12. Documents, Rapports, Markdown, PDF, DOCX
  return (
    <DocumentViewer
      title={artifact.title}
      content={artifact.content || artifact.title}
      model={artifact.provenance?.model || 'gemini-3.1-pro-preview'}
      onExport={(fmt) => onExport && onExport(fmt)}
    />
  );
}
