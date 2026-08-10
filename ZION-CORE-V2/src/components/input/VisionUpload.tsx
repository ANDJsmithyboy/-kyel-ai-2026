"use client";

import React, { useState, useRef } from "react";
import { UploadSimple, Eye, XCircle, SpinnerGap, Image as ImageIcon, VideoCamera } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

interface VisionUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export function VisionUpload({ onUpload, isLoading }: VisionUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleAnalyze = () => {
    if (selectedFile) onUpload(selectedFile);
  };

  return (
    <div className="w-full font-sans">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
              relative w-full p-6 rounded-2xl border-2 border-dashed transition-all duration-200
              ${dragActive ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--text-ai)]/20 bg-[var(--bg-panel)]"}
              flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:border-[var(--accent)]/50
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/*,video/mp4,video/quicktime"
              onChange={handleChange}
            />
            <div className="p-3 bg-[var(--bg-panel)] rounded-full border border-[var(--text-ai)]/10 shadow-sm">
              <UploadSimple weight="thin" className="w-8 h-8 text-[var(--text-ai)] opacity-70" />
            </div>
            <div>
              <p className="text-[var(--text-ai)] text-sm font-medium">Glisse une image ou vidéo ici</p>
              <p className="text-[var(--text-ai)]/50 text-xs mt-1">ou clique pour ouvrir l'appareil photo</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-4 rounded-2xl border border-[var(--accent)]/30 bg-[var(--bg-panel)] shadow-md flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-lg bg-black/20 border border-[var(--text-ai)]/10 flex items-center justify-center overflow-hidden shrink-0 relative group">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <VideoCamera weight="thin" className="w-8 h-8 text-[var(--accent)]" />
              )}
              {!isLoading && (
                <button
                  onClick={clearFile}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Supprimer le fichier"
                >
                  <XCircle weight="fill" className="w-4 h-4 text-white" />
                </button>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-ai)] truncate">{selectedFile.name}</p>
              <p className="text-xs text-[var(--text-ai)]/50 mt-0.5">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo
                {selectedFile.type.startsWith("video/") && " • ~120 frames max"}
              </p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className={`
                shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${isLoading 
                  ? "bg-[var(--accent)]/20 text-[var(--accent)]/50 cursor-not-allowed" 
                  : "bg-[var(--accent)] text-[var(--bg-panel)] hover:bg-[var(--accent)]/90 shadow-[0_0_15px_rgba(197,160,89,0.3)]"
                }
              `}
            >
              {isLoading ? (
                <>
                  <SpinnerGap weight="thin" className="w-5 h-5 animate-spin" />
                  <span>Analyse...</span>
                </>
              ) : (
                <>
                  <Eye weight="regular" className="w-5 h-5" />
                  <span>Voir avec GabomaSeer 👁</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
