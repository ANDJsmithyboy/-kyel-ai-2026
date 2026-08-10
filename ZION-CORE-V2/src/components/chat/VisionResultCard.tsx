"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, Info, Clock, Lightning } from "@phosphor-icons/react";

interface VisionResultCardProps {
  mediaUrl?: string;
  mediaType: "image" | "video";
  description: string;
  tokensUsed?: number;
  durationMs?: number;
}

export function VisionResultCard({ mediaUrl, mediaType, description, tokensUsed, durationMs }: VisionResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-2xl bg-[var(--bg-panel)] rounded-2xl border border-[var(--accent)]/20 shadow-lg overflow-hidden font-sans"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--text-ai)]/5 bg-black/10">
        <div className="flex items-center gap-2">
          <Eye weight="regular" className="w-5 h-5 text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--accent)]">GabomaSeer 👁</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-ai)]/50">
          {durationMs && (
            <span className="flex items-center gap-1">
              <Clock weight="thin" className="w-3.5 h-3.5" />
              {(durationMs / 1000).toFixed(1)}s
            </span>
          )}
          {tokensUsed && (
            <span className="flex items-center gap-1">
              <Lightning weight="thin" className="w-3.5 h-3.5" />
              {tokensUsed} tk
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row p-4 gap-4">
        {mediaUrl && (
          <div className="shrink-0 w-full sm:w-32 h-32 rounded-xl bg-black/20 border border-[var(--text-ai)]/10 overflow-hidden relative">
            {mediaType === "image" ? (
              <img src={mediaUrl} alt="Analyzed content" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2 text-center">
                <Info weight="thin" className="w-8 h-8 text-[var(--text-ai)]/50" />
                <span className="text-xs text-[var(--text-ai)]/50">Séquence vidéo traitée</span>
              </div>
            )}
          </div>
        )}

        <div className="flex-1">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-ai)]/40 mb-2">
            Analyse Visuelle
          </h4>
          <p className="text-sm text-[var(--text-ai)] leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
