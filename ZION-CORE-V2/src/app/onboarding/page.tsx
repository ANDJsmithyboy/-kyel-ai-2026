/* Ñkyel AI · Onboarding Page · SmartANDJ AI Technologies
   Premium 6-step onboarding: Consent → Name → Birth → Language → Sector → Telemetry
   Fondateur : Daniel Jonathan ANDJ */

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { DURATION, EASE_CSS } from '@/lib/motion';

// ── Languages gabonaises ──
const ÑKYEL_LANGUAGES = [
  { code: 'fr-GA', name: 'Français (Gabon)', native: 'Français', flag: '🇬🇦' },
  { code: 'fan',   name: 'Fang',             native: 'Fang',     flag: '🌿' },
  { code: 'pun',   name: 'Punu',             native: 'Yipunu',   flag: '🌊' },
  { code: 'mye',   name: 'Myènè',            native: 'Omyènè',   flag: '🌅' },
  { code: 'nzb',   name: 'Nzébi',            native: 'Nzébi',    flag: '🏔️' },
];

// ── Sectors / Domaines ──
const SECTORS = [
  { value: 'tech',        label: 'Tech & Développement',        emoji: '💻' },
  { value: 'business',    label: 'Business & Entrepreneuriat',  emoji: '📊' },
  { value: 'education',   label: 'Éducation & Recherche',       emoji: '📚' },
  { value: 'creative',    label: 'Création & Design',           emoji: '🎨' },
  { value: 'health',      label: 'Santé & Sciences',            emoji: '🧬' },
  { value: 'law',         label: 'Droit & Administration',      emoji: '⚖️' },
  { value: 'finance',     label: 'Finance & Comptabilité',      emoji: '💰' },
  { value: 'media',       label: 'Média & Communication',       emoji: '📡' },
  { value: 'engineering', label: 'Ingénierie & Industrie',      emoji: '⚙️' },
  { value: 'other',       label: 'Autre',                       emoji: '🌍' },
];

type StepKey = 'consent' | 'name' | 'birth' | 'language' | 'sector' | 'telemetry';

const STEPS: { key: StepKey; title: string; subtitle: string }[] = [
  { key: 'consent',   title: 'Conditions d\'utilisation', subtitle: 'Quelques informations à vérifier avant de commencer' },
  { key: 'name',      title: 'Votre nom',                 subtitle: 'Comment souhaitez-vous être appelé ?' },
  { key: 'birth',     title: 'Date de naissance',          subtitle: 'Pour personnaliser votre expérience' },
  { key: 'language',  title: 'Vos langues',                subtitle: 'Sélectionnez les langues pour l\'IA et l\'interface' },
  { key: 'sector',    title: 'Votre domaine',              subtitle: 'Quel est votre secteur d\'activité ?' },
  { key: 'telemetry', title: 'Améliorer Ñkyel AI',        subtitle: 'Aidez-nous à construire la meilleure IA gabonaise' },
];

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // ── Form state ──
  const [step, setStep] = useState(0);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [selectedLangs, setSelectedLangs] = useState<Set<string>>(new Set(['fr-GA']));
  const [primaryLocale, setPrimaryLocale] = useState('fr-GA');
  const [sector, setSector] = useState('');
  const [telemetryEnabled, setTelemetryEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fadeKey, setFadeKey] = useState(0);

  // Prefill name from Clerk
  useEffect(() => {
    if (isLoaded && user) {
      const clerkName = [user.firstName, user.lastName].filter(Boolean).join(' ');
      if (clerkName) setFullName(clerkName);
    }
  }, [isLoaded, user]);

  // ── Validation per step ──
  const canProceed = (): boolean => {
    switch (STEPS[step]?.key) {
      case 'consent':   return tosAccepted;
      case 'name':      return fullName.trim().length >= 2;
      case 'birth':     return birthDate.length === 10;
      case 'language':  return selectedLangs.size > 0;
      case 'sector':    return sector !== '';
      case 'telemetry': return true;
      default: return false;
    }
  };

  // ── Navigation ──
  function goNext() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      setFadeKey(k => k + 1);
      setError('');
    }
  }
  function goBack() {
    if (step > 0) {
      setStep(s => s - 1);
      setFadeKey(k => k + 1);
      setError('');
    }
  }

  // ── Language helpers ──
  function toggleLang(code: string) {
    setSelectedLangs(prev => {
      const next = new Set(prev);
      if (next.has(code) && next.size > 1) {
        next.delete(code);
        if (primaryLocale === code) setPrimaryLocale(Array.from(next)[0]);
      } else {
        next.add(code);
      }
      return next;
    });
  }

  function setAsPrimary(code: string) {
    setSelectedLangs(prev => {
      const next = new Set(prev);
      next.add(code);
      return next;
    });
    setPrimaryLocale(code);
  }

  // ── Submit ──
  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          birthDate,
          sector,
          tosAccepted,
          languages: Array.from(selectedLangs),
          primaryLocale,
          telemetryEnabled,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Une erreur est survenue');
      }

      await user?.reload();
      router.push('/chat');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setSubmitting(false);
    }
  }

  // ── Loading ──
  if (!isLoaded) {
    return (
      <div className="onboarding-loader">
        <div className="onboarding-loader-ring" />
      </div>
    );
  }

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="onboarding-root">
      <div className="onboarding-glow" />

      <div className="onboarding-container">
        {/* Header */}
        <header className="onboarding-header">
          <div className="onboarding-logo-circle">
            <span className="onboarding-logo-text">G</span>
          </div>
          <h1 className="onboarding-title">Bienvenue sur Ñkyel AI</h1>
          <p className="onboarding-subtitle">Quelques étapes pour personnaliser votre expérience</p>
        </header>

        {/* Progress dots (soft, no numbers) */}
        <div className="onboarding-dots">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`onboarding-dot ${i <= step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="onboarding-step-content" key={fadeKey}>
          <h2 className="onboarding-step-title">{currentStep.title}</h2>
          <p className="onboarding-step-subtitle">{currentStep.subtitle}</p>

          {/* ── STEP: CONSENT ── */}
          {currentStep.key === 'consent' && (
            <div className="onboarding-card">
              <p className="onboarding-card-text">
                En utilisant Ñkyel AI, vous acceptez nos conditions et notre politique de confidentialité.
              </p>
              <div className="onboarding-legal-links">
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="onboarding-legal-btn">📜 CGU</a>
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="onboarding-legal-btn">🔒 Confidentialité</a>
                <a href="/acceptable-use" target="_blank" rel="noopener noreferrer" className="onboarding-legal-btn">📋 Usage</a>
              </div>
              <label className="onboarding-checkbox-row">
                <input
                  type="checkbox"
                  checked={tosAccepted}
                  onChange={e => setTosAccepted(e.target.checked)}
                  className="onboarding-checkbox"
                />
                <span>J&apos;accepte les conditions d&apos;utilisation</span>
              </label>
            </div>
          )}

          {/* ── STEP: NAME ── */}
          {currentStep.key === 'name' && (
            <div className="onboarding-card">
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Daniel Jonathan"
                className="onboarding-input"
                autoFocus
              />
              {user?.firstName && fullName !== [user.firstName, user.lastName].filter(Boolean).join(' ') && (
                <p className="onboarding-hint">
                  Nom depuis votre compte : {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                </p>
              )}
            </div>
          )}

          {/* ── STEP: BIRTH ── */}
          {currentStep.key === 'birth' && (
            <div className="onboarding-card">
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="onboarding-input"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          {/* ── STEP: LANGUAGE ── */}
          {currentStep.key === 'language' && (
            <div className="onboarding-card">
              <div className="onboarding-lang-grid">
                {ÑKYEL_LANGUAGES.map(lang => {
                  const isSelected = selectedLangs.has(lang.code);
                  const isPrimary = lang.code === primaryLocale;
                  return (
                    <button
                      key={lang.code}
                      className={`onboarding-lang-card ${isSelected ? 'selected' : ''} ${isPrimary ? 'primary' : ''}`}
                      onClick={() => toggleLang(lang.code)}
                      type="button"
                    >
                      <div className="onboarding-lang-top">
                        <span className="onboarding-lang-flag">{lang.flag}</span>
                        <span className="onboarding-lang-name">{lang.name}</span>
                      </div>
                      <span className="onboarding-lang-native">{lang.native}</span>
                      {isSelected && (
                        <div className="onboarding-lang-indicator">
                          {isPrimary ? (
                            <span className="onboarding-lang-primary-dot" title="Langue principale" />
                          ) : (
                            <button
                              className="onboarding-lang-set-primary"
                              onClick={e => { e.stopPropagation(); setAsPrimary(lang.code); }}
                              title="Définir comme principale"
                              type="button"
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="onboarding-hint" style={{ marginTop: '12px' }}>
                ● = langue principale de l&apos;interface · ✓ = langue additionnelle
              </p>
            </div>
          )}

          {/* ── STEP: SECTOR ── */}
          {currentStep.key === 'sector' && (
            <div className="onboarding-card">
              <div className="onboarding-sectors">
                {SECTORS.map(s => (
                  <button
                    key={s.value}
                    className={`onboarding-sector-chip ${sector === s.value ? 'selected' : ''}`}
                    onClick={() => setSector(s.value)}
                    type="button"
                  >
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP: TELEMETRY ── */}
          {currentStep.key === 'telemetry' && (
            <div className="onboarding-card">
              <p className="onboarding-card-text">
                Vos données d&apos;utilisation, anonymisées, peuvent contribuer à améliorer les futurs modèles Ñkyel AI. 
                Ce choix est modifiable à tout moment dans les paramètres.
              </p>
              <label className="onboarding-toggle-row">
                <span>Partager mes données d&apos;utilisation</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={telemetryEnabled}
                  className={`onboarding-toggle ${telemetryEnabled ? 'on' : ''}`}
                  onClick={() => setTelemetryEnabled(!telemetryEnabled)}
                >
                  <span className="onboarding-toggle-thumb" />
                </button>
              </label>
            </div>
          )}
        </div>

        {/* Error */}
        {error && <div className="onboarding-error">{error}</div>}

        {/* Buttons */}
        <div className="onboarding-buttons">
          {step > 0 && (
            <button className="onboarding-btn-back" onClick={goBack} type="button">
              ← Retour
            </button>
          )}
          {isLastStep ? (
            <button
              className="onboarding-btn-primary"
              disabled={submitting}
              onClick={handleSubmit}
              type="button"
            >
              {submitting ? 'Lancement…' : 'Entrer dans l\'Antre →'}
            </button>
          ) : (
            <button
              className="onboarding-btn-primary"
              disabled={!canProceed()}
              onClick={goNext}
              type="button"
            >
              Continuer →
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="onboarding-footer">SMARTANDJ AI TECHNOLOGIES · Ñkyel AI 2026</p>
      </div>

      <style>{`
        /* ─── ROOT ─── */
        .onboarding-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg, #020304);
          position: relative;
          overflow: hidden;
          padding: 20px;
        }
        .onboarding-glow {
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--accent, #C5A059) 0%, transparent 70%);
          opacity: 0.06;
          pointer-events: none;
        }
        .onboarding-container {
          position: relative;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        /* ─── LOADER ─── */
        .onboarding-loader {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg, #020304);
        }
        .onboarding-loader-ring {
          width: 40px;
          height: 40px;
          border: 3px solid var(--accent, #C5A059);
          border-top-color: transparent;
          border-radius: 50%;
          animation: onb-spin 0.8s linear infinite;
        }
        @keyframes onb-spin { to { transform: rotate(360deg); } }

        /* ─── HEADER ─── */
        .onboarding-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .onboarding-logo-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--accent, #C5A059);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 24px rgba(197, 160, 89, 0.25);
          animation: onb-float 4s ease-in-out infinite;
        }
        @keyframes onb-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .onboarding-logo-text {
          font-size: 26px;
          font-weight: 800;
          color: var(--bg, #020304);
        }
        .onboarding-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text, #EDEAE3);
          margin: 0;
        }
        .onboarding-subtitle {
          font-size: 14px;
          color: var(--text-secondary, #8A8378);
          margin: 0;
        }

        /* ─── PROGRESS DOTS ─── */
        .onboarding-dots {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .onboarding-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--surface, #0A0908);
          border: 1px solid rgba(197, 160, 89, 0.1);
          transition: all ${DURATION.fast}s ${EASE_CSS.standard};
        }
        .onboarding-dot.active {
          background: var(--accent, #C5A059);
          opacity: 0.7;
          width: 10px;
          height: 10px;
        }
        .onboarding-dot.completed {
          background: var(--accent, #C5A059);
          opacity: 1;
        }

        /* ─── STEP CONTENT ─── */
        .onboarding-step-content {
          width: 100%;
          animation: onb-fade 0.22s ${EASE_CSS.decelerate};
        }
        @keyframes onb-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .onboarding-step-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text, #EDEAE3);
          margin: 0 0 4px;
        }
        .onboarding-step-subtitle {
          font-size: 13px;
          color: var(--text-secondary, #8A8378);
          margin: 0 0 16px;
        }

        /* ─── CARD ─── */
        .onboarding-card {
          background: var(--surface, #0A0908);
          border: 1px solid rgba(197, 160, 89, 0.08);
          border-radius: 16px;
          padding: 20px;
        }
        .onboarding-card-text {
          font-size: 13px;
          color: var(--text-secondary, #8A8378);
          line-height: 1.6;
          margin: 0 0 16px;
        }

        /* ─── LEGAL LINKS ─── */
        .onboarding-legal-links {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .onboarding-legal-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 10px 8px;
          background: rgba(197, 160, 89, 0.04);
          border: 1px solid rgba(197, 160, 89, 0.08);
          border-radius: 10px;
          color: var(--accent, #C5A059);
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
          transition: background ${DURATION.fast}s;
        }
        .onboarding-legal-btn:hover {
          background: rgba(197, 160, 89, 0.08);
        }

        /* ─── CHECKBOX ─── */
        .onboarding-checkbox-row {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: var(--text, #EDEAE3);
          padding: 4px 0;
        }
        .onboarding-checkbox {
          width: 18px;
          height: 18px;
          accent-color: var(--accent, #C5A059);
          cursor: pointer;
        }

        /* ─── INPUT ─── */
        .onboarding-input {
          width: 100%;
          padding: 14px 16px;
          background: transparent;
          border: 1px solid rgba(197, 160, 89, 0.15);
          border-radius: 12px;
          color: var(--text, #EDEAE3);
          font-size: 16px;
          outline: none;
          transition: border-color ${DURATION.fast}s;
          box-sizing: border-box;
        }
        .onboarding-input:focus {
          border-color: var(--accent, #C5A059);
        }
        .onboarding-input::placeholder {
          color: var(--text-tertiary, #5C5648);
        }
        .onboarding-input::-webkit-calendar-picker-indicator {
          filter: invert(0.7);
        }
        .onboarding-hint {
          font-size: 12px;
          color: var(--text-secondary, #8A8378);
          margin-top: 8px;
        }

        /* ─── LANGUAGE GRID ─── */
        .onboarding-lang-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .onboarding-lang-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: transparent;
          border: 1px solid rgba(197, 160, 89, 0.08);
          border-radius: 12px;
          color: var(--text, #EDEAE3);
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: all ${DURATION.fast}s ${EASE_CSS.standard};
          position: relative;
        }
        .onboarding-lang-card:hover {
          background: rgba(197, 160, 89, 0.04);
        }
        .onboarding-lang-card.selected {
          background: rgba(197, 160, 89, 0.06);
          border-color: rgba(197, 160, 89, 0.3);
        }
        .onboarding-lang-top {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .onboarding-lang-flag { font-size: 18px; }
        .onboarding-lang-name {
          font-size: 14px;
          font-weight: 500;
        }
        .onboarding-lang-card.selected .onboarding-lang-name {
          color: var(--accent, #C5A059);
          font-weight: 600;
        }
        .onboarding-lang-native {
          font-size: 12px;
          color: var(--text-secondary, #8A8378);
        }
        .onboarding-lang-indicator {
          display: flex;
          align-items: center;
          margin-left: auto;
        }
        .onboarding-lang-primary-dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--accent, #C5A059);
          position: relative;
        }
        .onboarding-lang-primary-dot::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--bg, #020304);
        }
        .onboarding-lang-set-primary {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          background: rgba(197, 160, 89, 0.15);
          border: none;
          color: var(--accent, #C5A059);
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ─── SECTORS ─── */
        .onboarding-sectors {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .onboarding-sector-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border: 1px solid rgba(197, 160, 89, 0.08);
          border-radius: 10px;
          background: transparent;
          color: var(--text, #EDEAE3);
          font-size: 13px;
          cursor: pointer;
          transition: all ${DURATION.fast}s;
          text-align: left;
        }
        .onboarding-sector-chip:hover {
          background: rgba(197, 160, 89, 0.04);
        }
        .onboarding-sector-chip.selected {
          background: rgba(197, 160, 89, 0.1);
          border-color: var(--accent, #C5A059);
          color: var(--accent, #C5A059);
          font-weight: 600;
        }

        /* ─── TOGGLE ─── */
        .onboarding-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          font-weight: 500;
          color: var(--text, #EDEAE3);
          cursor: pointer;
        }
        .onboarding-toggle {
          width: 44px;
          height: 24px;
          border-radius: 12px;
          background: rgba(197, 160, 89, 0.2);
          border: none;
          cursor: pointer;
          position: relative;
          transition: background ${DURATION.fast}s;
        }
        .onboarding-toggle.on {
          background: var(--accent, #C5A059);
        }
        .onboarding-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--bg, #020304);
          transition: transform ${DURATION.fast}s ${EASE_CSS.standard};
        }
        .onboarding-toggle.on .onboarding-toggle-thumb {
          transform: translateX(20px);
        }

        /* ─── ERROR ─── */
        .onboarding-error {
          background: rgba(224, 88, 75, 0.08);
          border: 1px solid rgba(224, 88, 75, 0.2);
          border-radius: 10px;
          padding: 12px;
          color: #E0584B;
          font-size: 13px;
          font-weight: 500;
          width: 100%;
          box-sizing: border-box;
        }

        /* ─── BUTTONS ─── */
        .onboarding-buttons {
          display: flex;
          gap: 12px;
          width: 100%;
        }
        .onboarding-btn-back {
          flex: 0 0 auto;
          padding: 14px 20px;
          background: transparent;
          border: 1px solid rgba(197, 160, 89, 0.08);
          border-radius: 12px;
          color: var(--text-secondary, #8A8378);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background ${DURATION.fast}s;
        }
        .onboarding-btn-back:hover { background: rgba(197, 160, 89, 0.04); }
        .onboarding-btn-primary {
          flex: 1;
          padding: 14px 24px;
          background: var(--accent, #C5A059);
          color: var(--bg, #020304);
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: opacity ${DURATION.fast}s, transform ${DURATION.fast}s;
        }
        .onboarding-btn-primary:hover:not(:disabled) {
          opacity: 0.9;
        }
        .onboarding-btn-primary:active:not(:disabled) {
          transform: scale(0.97);
        }
        .onboarding-btn-primary:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* ─── FOOTER ─── */
        .onboarding-footer {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: var(--text-tertiary, #5C5648);
          text-align: center;
          margin: 0;
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 480px) {
          .onboarding-sectors {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
