/* GabomaGPT · Terms of Service · SmartANDJ AI Technologies
   Conditions Générales d'Utilisation — page publique
   Fondateur : Daniel Jonathan ANDJ */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CGU — Gaboma AI',
  description: 'Conditions Générales d\'Utilisation de Gaboma AI par SmartANDJ AI Technologies.',
};

const SECTIONS = [
  {
    title: '1. Acceptation des Conditions',
    content: `En accédant à Gaboma AI ou en l'utilisant, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation (« CGU »). Si vous n'acceptez pas ces CGU, veuillez ne pas utiliser le Service. Gaboma AI est édité par SmartANDJ AI Technologies, société enregistrée au Gabon, fondée par Daniel Jonathan ANDJ.`,
  },
  {
    title: '2. Description du Service',
    content: `Gaboma AI est une plateforme d'intelligence artificielle conversationnelle et agentique offrant des fonctionnalités de chat, recherche, génération de contenu, et exécution de tâches autonomes. Le Service est disponible via application mobile (Android) et application web.`,
  },
  {
    title: '3. Inscription et Compte',
    content: `Pour utiliser Gaboma AI, vous devez créer un compte en fournissant des informations exactes. Vous êtes responsable de la sécurité de votre compte et de toutes les activités qui s'y déroulent. Vous devez avoir au moins 16 ans pour utiliser le Service.`,
  },
  {
    title: '4. Utilisation Acceptable',
    content: `Vous vous engagez à utiliser Gaboma AI de manière responsable et conforme à la loi gabonaise et aux lois applicables de votre pays de résidence. Toute utilisation abusive, frauduleuse, ou contraire à notre Politique d'Utilisation Acceptable est interdite et peut entraîner la suspension ou la suppression de votre compte.`,
  },
  {
    title: '5. Propriété Intellectuelle',
    content: `Le contenu que vous générez via Gaboma AI vous appartient, sous réserve des droits préexistants des tiers. L'interface, le code source, les modèles d'IA, les marques, logos et le design de Gaboma AI restent la propriété exclusive de SmartANDJ AI Technologies.`,
  },
  {
    title: '6. Abonnements et Paiements',
    content: `Gaboma AI propose des formules gratuites et payantes. Les paiements sont effectués via Mobile Money (Airtel Money, Moov Money), E-Billing, ou carte bancaire sur notre plateforme web. Les abonnements se renouvellent automatiquement sauf annulation. Les remboursements sont accordés conformément à la législation gabonaise en vigueur.`,
  },
  {
    title: '7. Limitation de Responsabilité',
    content: `Gaboma AI est fourni « en l'état ». SmartANDJ AI Technologies ne garantit pas que les réponses générées par l'IA soient exactes, complètes ou adaptées à un usage spécifique. Vous êtes responsable de vérifier les informations fournies. La responsabilité de SmartANDJ AI Technologies est limitée au montant que vous avez payé pour le Service au cours des 12 derniers mois.`,
  },
  {
    title: '8. Résiliation',
    content: `Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application. SmartANDJ AI Technologies se réserve le droit de suspendre ou supprimer votre compte en cas de violation des CGU, avec notification préalable sauf en cas d'urgence.`,
  },
  {
    title: '9. Modifications des CGU',
    content: `SmartANDJ AI Technologies peut modifier ces CGU à tout moment. Les modifications significatives seront communiquées par notification dans l'application. La poursuite de l'utilisation du Service après notification vaut acceptation des nouvelles CGU.`,
  },
  {
    title: '10. Droit Applicable',
    content: `Les présentes CGU sont régies par le droit gabonais. Tout litige sera soumis à la compétence exclusive des tribunaux de Libreville, Gabon.`,
  },
  {
    title: 'Contact',
    content: `SmartANDJ AI Technologies\nLibreville, Gabon\ncontact@gaboma.ai`,
  },
];

export default function TermsPage() {
  return (
    <div className="legal-root">
      <div className="legal-glow" />
      <div className="legal-container">
        <header className="legal-header">
          <a href="/onboarding" className="legal-back">← Retour</a>
          <h1 className="legal-title">Conditions Générales d&apos;Utilisation</h1>
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

        <footer className="legal-footer">SMARTANDJ AI TECHNOLOGIES · GABOMA AI 2026</footer>
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
