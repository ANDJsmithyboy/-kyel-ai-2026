/* GabomaGPT · Privacy Policy · SmartANDJ AI Technologies
   Politique de Confidentialité — page publique
   Fondateur : Daniel Jonathan ANDJ */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confidentialité — Gaboma AI',
  description: 'Politique de Confidentialité de Gaboma AI par SmartANDJ AI Technologies.',
};

const SECTIONS = [
  {
    title: '1. Responsable du Traitement',
    content: `SmartANDJ AI Technologies, société basée à Libreville, Gabon, est responsable du traitement de vos données personnelles dans le cadre de l'utilisation de Gaboma AI.`,
  },
  {
    title: '2. Données Collectées',
    content: `Nous collectons les données suivantes :\n\n• Informations d'identité : nom, adresse e-mail, photo de profil (via Clerk).\n• Données d'onboarding : nom d'affichage, date de naissance, secteur d'activité, préférences linguistiques.\n• Données d'utilisation : historique des conversations, modèles utilisés, fréquence d'utilisation.\n• Données techniques : adresse IP, type d'appareil, système d'exploitation, identifiants de session.\n• Données de paiement : traitées par nos prestataires (E-Billing, opérateurs Mobile Money). Nous ne stockons jamais les numéros de carte bancaire.`,
  },
  {
    title: '3. Finalités du Traitement',
    content: `Vos données sont utilisées pour :\n\n• Fournir et améliorer le Service Gaboma AI.\n• Personnaliser votre expérience (langue, modèle, préférences).\n• Gérer votre compte et vos abonnements.\n• Assurer la sécurité et prévenir les abus.\n• Si vous y consentez : entraîner et améliorer les modèles d'IA Gaboma (données anonymisées).`,
  },
  {
    title: '4. Base Légale du Traitement',
    content: `• Exécution du contrat : pour fournir le Service.\n• Consentement : pour l'utilisation de vos données à des fins d'amélioration des modèles IA (opt-in uniquement, modifiable à tout moment dans les paramètres).\n• Intérêt légitime : pour la sécurité et la prévention des abus.\n• Obligation légale : pour la conformité avec les lois gabonaises.`,
  },
  {
    title: '5. Partage des Données',
    content: `Nous ne vendons jamais vos données personnelles. Nous pouvons partager des données avec :\n\n• Nos sous-traitants techniques (hébergement, authentification, paiement) dans le cadre strict de la fourniture du Service.\n• Les autorités compétentes en cas d'obligation légale.\n• Des tiers après anonymisation complète à des fins de recherche.`,
  },
  {
    title: '6. Conservation des Données',
    content: `• Données de compte : conservées tant que votre compte est actif, puis supprimées dans les 30 jours suivant la suppression du compte.\n• Historique de conversations : conservé tant que votre compte est actif. Vous pouvez supprimer des conversations individuellement à tout moment.\n• Données anonymisées pour l'entraînement IA : conservées indéfiniment sous forme anonymisée.`,
  },
  {
    title: '7. Vos Droits',
    content: `Conformément à la législation gabonaise et aux réglementations applicables, vous disposez des droits suivants :\n\n• Droit d'accès à vos données personnelles.\n• Droit de rectification de vos données.\n• Droit de suppression (« droit à l'oubli »).\n• Droit de retirer votre consentement à tout moment.\n• Droit à la portabilité de vos données.\n• Droit d'opposition au traitement.\n\nPour exercer ces droits, contactez-nous à privacy@gaboma.ai.`,
  },
  {
    title: '8. Sécurité',
    content: `Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement en transit (TLS) et au repos, accès restreint aux données, audits de sécurité réguliers.`,
  },
  {
    title: '9. Transferts Internationaux',
    content: `Certaines données peuvent être traitées en dehors du Gabon (hébergement cloud). Nous nous assurons que ces transferts respectent un niveau de protection adéquat.`,
  },
  {
    title: '10. Modifications',
    content: `Cette Politique peut être modifiée. Toute modification significative vous sera notifiée dans l'application.`,
  },
  {
    title: 'Contact — Délégué à la Protection des Données',
    content: `SmartANDJ AI Technologies\nLibreville, Gabon\nprivacy@gaboma.ai`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="legal-root">
      <div className="legal-glow" />
      <div className="legal-container">
        <header className="legal-header">
          <a href="/onboarding" className="legal-back">← Retour</a>
          <h1 className="legal-title">Politique de Confidentialité</h1>
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
