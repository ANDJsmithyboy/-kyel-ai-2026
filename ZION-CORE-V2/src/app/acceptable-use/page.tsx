/* Ñkyel AI · Acceptable Use Policy · SmartANDJ AI Technologies
   Politique d'Utilisation Acceptable — page publique
   Fondateur : Daniel Jonathan ANDJ */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Utilisation Acceptable — Ñkyel AI',
  description: 'Politique d\'Utilisation Acceptable de Ñkyel AI par SmartANDJ AI Technologies.',
};

const SECTIONS = [
  {
    title: 'Introduction',
    content: `Cette Politique d'Utilisation Acceptable définit les comportements attendus et interdits lors de l'utilisation de Ñkyel AI. Le non-respect de cette politique peut entraîner la suspension ou la suppression de votre compte.`,
  },
  {
    title: 'Utilisations Interdites',
    content: `Il est interdit d'utiliser Ñkyel AI pour :\n\n• Générer du contenu illégal, haineux, discriminatoire ou incitant à la violence.\n• Usurper l'identité d'une personne ou d'une organisation.\n• Harceler, menacer ou intimider d'autres personnes.\n• Générer de la désinformation ou des « fake news » dans l'intention de nuire.\n• Tenter de contourner les mesures de sécurité ou les filtres de contenu.\n• Utiliser le Service pour du spam, du phishing ou des activités frauduleuses.\n• Collecter ou stocker des données personnelles de tiers sans leur consentement.\n• Effectuer du reverse engineering, décompiler ou tenter d'extraire le code source des modèles.\n• Utiliser le Service de manière à surcharger intentionnellement les infrastructures.`,
  },
  {
    title: 'Contenu Généré',
    content: `Vous êtes responsable de l'utilisation que vous faites du contenu généré par Ñkyel AI. Nous vous rappelons que :\n\n• Les réponses de l'IA peuvent contenir des inexactitudes — vérifiez toujours les informations critiques.\n• Le contenu généré ne constitue pas un conseil juridique, médical, financier ou professionnel.\n• Vous ne devez pas présenter le contenu généré comme provenant d'un humain lorsque la distinction est importante.`,
  },
  {
    title: 'Signalement',
    content: `Si vous constatez une utilisation abusive de Ñkyel AI ou un contenu inapproprié, merci de le signaler via l'icône de signalement dans le chat ou par e-mail à abuse@nkyel.ai.`,
  },
  {
    title: 'Sanctions',
    content: `En cas de violation de cette politique :\n\n• Premier avertissement : notification par e-mail.\n• Récidive : suspension temporaire du compte (24h à 30 jours).\n• Violation grave : suppression définitive du compte sans remboursement.`,
  },
  {
    title: 'Contact',
    content: `SmartANDJ AI Technologies\nLibreville, Gabon\nabuse@nkyel.ai`,
  },
];

export default function AcceptableUsePage() {
  return (
    <div className="legal-root">
      <div className="legal-glow" />
      <div className="legal-container">
        <header className="legal-header">
          <a href="/onboarding" className="legal-back">← Retour</a>
          <h1 className="legal-title">Politique d&apos;Utilisation Acceptable</h1>
          <p className="legal-meta">Dernière mise à jour : Juillet 2026 · SmartANDJ AI Technologies</p>
        </header>

        <div className="legal-sections">
          {SECTIONS.map(s => (
            <section key={s.title} className="legal-section">
              <h2 className="legal-section-title">{s.title}</h2>
              <p className="legal-section-content">{s.content}</p>
            </section>
          ))}
        </div>

        <footer className="legal-footer">SMARTANDJ AI TECHNOLOGIES · Ñkyel AI 2026</footer>
      </div>

      <style>{`
        .legal-root {
          min-height: 100vh;
          background: var(--bg, #020304);
          color: var(--text, #EDEAE3);
          padding: 24px 20px;
          position: relative;
          overflow: hidden;
        }
        .legal-glow {
          position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
          width: 500px; height: 500px;
          background: radial-gradient(circle, var(--accent, #C5A059) 0%, transparent 70%);
          opacity: 0.04; pointer-events: none;
        }
        .legal-container {
          max-width: 640px; margin: 0 auto; position: relative;
        }
        .legal-header { margin-bottom: 32px; }
        .legal-back {
          display: inline-block;
          font-size: 13px; color: var(--accent, #C5A059);
          text-decoration: none; margin-bottom: 16px;
          transition: opacity 0.15s;
        }
        .legal-back:hover { opacity: 0.8; }
        .legal-title {
          font-size: 24px; font-weight: 700;
          margin: 0 0 8px; color: var(--text, #EDEAE3);
        }
        .legal-meta {
          font-size: 12px; color: var(--text-secondary, #8A8378);
          margin: 0;
        }
        .legal-sections { display: flex; flex-direction: column; gap: 12px; }
        .legal-section {
          background: var(--surface, #0A0908);
          border: 1px solid rgba(197, 160, 89, 0.08);
          border-radius: 12px; padding: 20px;
        }
        .legal-section-title {
          font-size: 15px; font-weight: 600;
          color: var(--text, #EDEAE3); margin: 0 0 8px;
        }
        .legal-section-content {
          font-size: 13px; line-height: 1.7;
          color: var(--text-secondary, #8A8378);
          margin: 0; white-space: pre-line;
        }
        .legal-footer {
          text-align: center; font-size: 10px; font-weight: 600;
          letter-spacing: 0.5px; color: var(--text-tertiary, #5C5648);
          margin-top: 40px; padding: 20px 0;
        }
      `}</style>
    </div>
  );
}
