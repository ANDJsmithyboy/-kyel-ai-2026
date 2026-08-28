/**
 * Ñkyel AI · Production Feedback System
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Universal Production Feedback Modal:
 * - Category picker (BUG, CONFUSING, WRONG_RESULT, SLOW, MOBILE_UI, ARTIFACT, CONNECTOR, SUGGESTION, FEATURE_REQUEST, GREAT, OTHER)
 * - Safe diagnostic client metadata (viewport, platform, browser, route, mission_id, artifact_id, pwa_mode, release_version)
 * - Optional Screenshot attachment (persisted in Cloudflare R2)
 * - Accessible, responsive (bottom sheet on mobile, modal on desktop), zero horizontal overflow.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  PaperPlaneTilt,
  Sparkle,
  Camera,
  Trash,
  CheckCircle,
  WarningCircle,
  ChatCircle,
  Bug,
  Lightbulb,
  ThumbsUp,
} from '@phosphor-icons/react';

export type FeedbackCategory =
  | 'BUG'
  | 'CONFUSING'
  | 'WRONG_RESULT'
  | 'SLOW'
  | 'MOBILE_UI'
  | 'ARTIFACT'
  | 'CONNECTOR'
  | 'SUGGESTION'
  | 'FEATURE_REQUEST'
  | 'GREAT'
  | 'OTHER';

interface ProductionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: FeedbackCategory;
  missionId?: string;
  runId?: string;
  artifactId?: string;
  onSuccess?: () => void;
}

const CATEGORIES: Array<{ id: FeedbackCategory; label: string; icon: React.ComponentType<any> }> = [
  { id: 'BUG', label: 'Bug / Problème', icon: Bug },
  { id: 'CONFUSING', label: 'Confus / Pas clair', icon: WarningCircle },
  { id: 'WRONG_RESULT', label: 'Résultat inexact', icon: WarningCircle },
  { id: 'SLOW', label: 'Trop lent', icon: WarningCircle },
  { id: 'MOBILE_UI', label: 'Interface mobile', icon: ChatCircle },
  { id: 'ARTIFACT', label: 'Problème d’artefact', icon: ChatCircle },
  { id: 'CONNECTOR', label: 'Connecteur / Outil', icon: ChatCircle },
  { id: 'SUGGESTION', label: 'Suggestion', icon: Lightbulb },
  { id: 'FEATURE_REQUEST', label: 'Idée de fonction', icon: Sparkle },
  { id: 'GREAT', label: 'Excellent travail', icon: ThumbsUp },
  { id: 'OTHER', label: 'Autre', icon: ChatCircle },
];

export default function ProductionFeedbackModal({
  isOpen,
  onClose,
  defaultCategory = 'BUG',
  missionId,
  runId,
  artifactId,
  onSuccess,
}: ProductionFeedbackModalProps) {
  const [category, setCategory] = useState<FeedbackCategory>(defaultCategory);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [includeDiagnostic, setIncludeDiagnostic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultCategory) setCategory(defaultCategory);
  }, [defaultCategory]);

  if (!isOpen) return null;

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('La capture d’écran ne doit pas dépasser 8 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotBase64(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Veuillez décrire votre retour ou le problème rencontré.');
      return;
    }

    setLoading(true);
    setError(null);

    const isPwa =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);

    const payload = {
      category,
      title: title.trim() || undefined,
      description: description.trim(),
      mission_id: missionId,
      run_id: runId,
      artifact_id: artifactId,
      screenshot_base64: screenshotBase64 || undefined,
      release_version: '1.0.0-rc1',
      browser: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : undefined,
      platform: typeof navigator !== 'undefined' ? navigator.platform : undefined,
      viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : undefined,
      locale: typeof navigator !== 'undefined' ? navigator.language : 'fr-FR',
      pwa_mode: isPwa,
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
    };

    try {
      const res = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Échec de transmission du feedback.');
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(false);
        setDescription('');
        setTitle('');
        setScreenshotBase64(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l’envoi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full sm:max-w-lg bg-[#0F1218] border border-white/10 sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 text-white shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
        style={{
          borderBottom: 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkle size={18} className="text-[var(--accent)]" />
            <h3 className="text-base font-semibold tracking-tight text-white">
              Transmettre un retour
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
            <CheckCircle size={44} weight="fill" className="text-[#10B981]" />
            <h4 className="text-lg font-semibold text-white">Merci pour votre retour !</h4>
            <p className="text-sm text-[#9199A8] max-w-xs">
              Votre retour a été transmis et sera analysé pour la validation de production.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-medium text-[#9199A8] mb-2 uppercase tracking-wider">
                Catégorie
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/40 shadow-sm'
                          : 'bg-white/[0.04] text-[#9199A8] hover:bg-white/[0.08] hover:text-white border border-transparent'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title / Summary */}
            <div>
              <label className="block text-xs font-medium text-[#9199A8] mb-1.5">
                Objet (court)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. Erreur d’affichage sur le canvas, suggestion..."
                className="w-full px-3 py-2 text-sm rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[#9199A8] mb-1.5">
                Que s’est-il passé ? <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre expérience, le comportement attendu et ce qui s'est produit..."
                className="w-full px-3 py-2 text-sm rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[var(--accent)] transition-colors resize-none"
                required
              />
            </div>

            {/* Optional screenshot */}
            <div>
              <label className="block text-xs font-medium text-[#9199A8] mb-1.5">
                Capture d’écran (optionnel)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleScreenshotChange}
                className="hidden"
              />
              {screenshotBase64 ? (
                <div className="relative rounded-xl border border-white/10 overflow-hidden max-h-36 bg-black/40">
                  <img
                    src={screenshotBase64}
                    alt="Capture"
                    className="w-full h-full object-cover max-h-36"
                  />
                  <button
                    type="button"
                    onClick={() => setScreenshotBase64(null)}
                    className="absolute top-2 end-2 p-1.5 rounded-lg bg-black/70 text-red-400 hover:bg-black transition-colors"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-white/15 text-xs text-[#9199A8] hover:text-white hover:border-white/30 hover:bg-white/[0.02] transition-colors"
                >
                  <Camera size={16} />
                  <span>Ajouter une capture d'écran</span>
                </button>
              )}
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[#9199A8] hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <PaperPlaneTilt size={15} weight="bold" />
                <span>{loading ? 'Envoi...' : 'Envoyer'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
