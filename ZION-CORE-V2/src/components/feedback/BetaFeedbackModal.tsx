/**
 * Ñkyel AI · Beta Feedback Modal (Formulaire Structuré Officiel)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Collecte 13 points de retour d'expérience indispensables pour l'optimisation
 * du système et le dossier de candidature Google.
 */

'use client';

import React, { useState } from 'react';
import { submitBetaFeedback, type BetaFeedbackPayload } from '@/lib/betaStateMachine';
import { Star, X, Check, PaperPlaneTilt, Sparkle } from '@phosphor-icons/react';

interface BetaFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BetaFeedbackModal({ isOpen, onClose, onSuccess }: BetaFeedbackModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 13 champs du formulaire
  const [overallRating, setOverallRating] = useState<number>(5);
  const [goalAttempted, setGoalAttempted] = useState<string>('');
  const [taskSucceeded, setTaskSucceeded] = useState<boolean>(true);
  const [favoriteFeature, setFavoriteFeature] = useState<string>('WorkGraph & Expérience Visuelle (VIE)');
  const [issuesEncountered, setIssuesEncountered] = useState<string>('');
  const [priorityImprovement, setPriorityImprovement] = useState<string>('');
  const [likelyToReuse, setLikelyToReuse] = useState<number>(5);
  const [npsScore, setNpsScore] = useState<number>(10);
  const [willingnessToPay, setWillingnessToPay] = useState<string>('Oui');
  const [priceBracket, setPriceBracket] = useState<string>('5 000 – 15 000 FCFA / mois');
  const [africanContextInterest, setAfricanContextInterest] = useState<string>('Très intéressé par l’intégration des langues gabonaises et des connaissances locales.');
  const [localeUsed, setLocaleUsed] = useState<string>('fr');
  const [quoteConsent, setQuoteConsent] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalAttempted.trim() || !priorityImprovement.trim()) {
      setError('Veuillez remplir l’objectif tenté et l’amélioration prioritaire.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: BetaFeedbackPayload = {
      overall_rating: overallRating,
      goal_attempted: goalAttempted.trim(),
      task_succeeded: taskSucceeded,
      favorite_feature: favoriteFeature,
      issues_encountered: issuesEncountered.trim() || undefined,
      priority_improvement: priorityImprovement.trim(),
      likely_to_reuse: likelyToReuse,
      nps_score: npsScore,
      willingness_to_pay: willingnessToPay,
      price_bracket: priceBracket,
      african_context_interest: africanContextInterest.trim(),
      locale_used: localeUsed,
      quote_consent: quoteConsent,
    };

    try {
      await submitBetaFeedback(payload);
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la transmission du retour.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0E121A] border border-white/[0.1] rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-[#F1EEE7] shadow-2xl relative my-8">
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/[0.08] text-[#F1EEE7]/60 hover:text-[#F1EEE7] transition"
        >
          <X size={20} />
        </button>

        {/* En-tête */}
        <div className="flex items-center gap-2 mb-2 text-[#E5B842] text-xs font-semibold uppercase tracking-wider">
          <Sparkle size={15} weight="fill" />
          Retour d'expérience officiel · 100 Pionniers
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-1">Votre avis pour la version finale</h2>
        <p className="text-xs sm:text-sm text-[#F1EEE7]/70 mb-6">
          Vos réponses permettent de calibrer les capacités de Ñkyel AI avant la soumission officielle à Google.
        </p>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
              <Check size={32} weight="bold" />
            </div>
            <h3 className="text-xl font-bold text-[#F1EEE7] mb-2">Merci pour votre précieuse contribution !</h3>
            <p className="text-sm text-[#F1EEE7]/70 max-w-md">
              Votre retour est désormais enregistré dans Neon et intégré à nos métriques de validation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {error}
              </div>
            )}

            {/* 1. Note globale */}
            <div>
              <label className="block text-xs font-medium text-[#F1EEE7]/80 mb-2">
                1. Note globale de l'expérience (1 à 5 étoiles) *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setOverallRating(star)}
                    className="p-1.5 transition text-2xl"
                  >
                    <Star
                      size={28}
                      weight={star <= overallRating ? 'fill' : 'regular'}
                      className={star <= overallRating ? 'text-[#E5B842]' : 'text-white/20 hover:text-white/40'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Objectif tenté */}
            <div>
              <label className="block text-xs font-medium text-[#F1EEE7]/80 mb-1.5">
                2. Quel objectif ou tâche avez-vous tenté d'accomplir avec Ñkyel ? *
              </label>
              <textarea
                rows={2}
                value={goalAttempted}
                onChange={(e) => setGoalAttempted(e.target.value)}
                placeholder="Ex : Rédaction d'une stratégie de recherche, analyse de document, génération de contenu..."
                className="w-full bg-[#141923] border border-white/[0.08] rounded-xl p-3 text-[#F1EEE7] placeholder-[#F1EEE7]/30 focus:outline-none focus:border-[#C59B27]"
                required
              />
            </div>

            {/* 3. Tâche réussie ou échouée */}
            <div>
              <label className="block text-xs font-medium text-[#F1EEE7]/80 mb-1.5">
                3. Avez-vous réussi à accomplir votre objectif ? *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="task_status"
                    checked={taskSucceeded}
                    onChange={() => setTaskSucceeded(true)}
                    className="accent-[#C59B27]"
                  />
                  <span>Oui, tâche accomplie</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="task_status"
                    checked={!taskSucceeded}
                    onChange={() => setTaskSucceeded(false)}
                    className="accent-[#C59B27]"
                  />
                  <span>Non, objectif non atteint</span>
                </label>
              </div>
            </div>

            {/* 4. Fonctionnalité préférée */}
            <div>
              <label className="block text-xs font-medium text-[#F1EEE7]/80 mb-1.5">
                4. Quelle est votre fonctionnalité préférée ?
              </label>
              <select
                value={favoriteFeature}
                onChange={(e) => setFavoriteFeature(e.target.value)}
                className="w-full bg-[#141923] border border-white/[0.08] rounded-xl p-2.5 text-[#F1EEE7] focus:outline-none focus:border-[#C59B27]"
              >
                <option value="WorkGraph & Expérience Visuelle (VIE)">WorkGraph & Expérience Visuelle Interactive (VIE)</option>
                <option value="Wide Research & Recherche Web Tavily">Wide Research & Recherche Web Multi-sources (Tavily)</option>
                <option value="Modèles Gemini & Raisonnement">Compréhension & Synthèse Gemini</option>
                <option value="Génération Multimédia (Images/Vidéos)">Génération Multimédia et Artefacts</option>
                <option value="Langues Gabonaises (Fang, Mpongwe, Punu)">Traitement des langues nationales gabonaises</option>
                <option value="Mémoire Permanente & Souveraineté">Mémoire persistante et respect de la confidentialité</option>
              </select>
            </div>

            {/* 5. Problème rencontré */}
            <div>
              <label className="block text-xs font-medium text-[#F1EEE7]/80 mb-1.5">
                5. Avez-vous rencontré un bug, une lenteur ou un problème ? (Optionnel)
              </label>
              <textarea
                rows={2}
                value={issuesEncountered}
                onChange={(e) => setIssuesEncountered(e.target.value)}
                placeholder="Décrivez les éventuels blocages ou erreurs..."
                className="w-full bg-[#141923] border border-white/[0.08] rounded-xl p-3 text-[#F1EEE7] placeholder-[#F1EEE7]/30 focus:outline-none focus:border-[#C59B27]"
              />
            </div>

            {/* 6. Amélioration prioritaire */}
            <div>
              <label className="block text-xs font-medium text-[#F1EEE7]/80 mb-1.5">
                6. Quelle amélioration souhaiteriez-vous voir en priorité ? *
              </label>
              <input
                type="text"
                value={priorityImprovement}
                onChange={(e) => setPriorityImprovement(e.target.value)}
                placeholder="Ex : Plus de rapidité, export PDF enrichi, support vocal direct..."
                className="w-full bg-[#141923] border border-white/[0.08] rounded-xl p-2.5 text-[#F1EEE7] placeholder-[#F1EEE7]/30 focus:outline-none focus:border-[#C59B27]"
                required
              />
            </div>

            {/* 7 & 8. Réutilisation et NPS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#F1EEE7]/80 mb-1.5">
                  7. Probabilité de réutiliser Ñkyel (1-5)
                </label>
                <select
                  value={likelyToReuse}
                  onChange={(e) => setLikelyToReuse(Number(e.target.value))}
                  className="w-full bg-[#141923] border border-white/[0.08] rounded-xl p-2.5 text-[#F1EEE7] focus:outline-none focus:border-[#C59B27]"
                >
                  <option value={5}>5 - Très probable / Indispensable</option>
                  <option value={4}>4 - Probable</option>
                  <option value={3}>3 - Moyennement</option>
                  <option value={2}>2 - Peu probable</option>
                  <option value={1}>1 - Pas du tout</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F1EEE7]/80 mb-1.5">
                  8. Recommandation à un collègue (NPS 0 à 10)
                </label>
                <select
                  value={npsScore}
                  onChange={(e) => setNpsScore(Number(e.target.value))}
                  className="w-full bg-[#141923] border border-white/[0.08] rounded-xl p-2.5 text-[#F1EEE7] focus:outline-none focus:border-[#C59B27]"
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((score) => (
                    <option key={score} value={score}>
                      {score} {score >= 9 ? '(Promoteur)' : score <= 6 ? '(Détracteur)' : '(Neutre)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 9 & 10. Volonté de payer et Fourchette */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#F1EEE7]/80 mb-1.5">
                  9. Seriez-vous prêt à payer pour Ñkyel Pro ?
                </label>
                <select
                  value={willingnessToPay}
                  onChange={(e) => setWillingnessToPay(e.target.value)}
                  className="w-full bg-[#141923] border border-white/[0.08] rounded-xl p-2.5 text-[#F1EEE7] focus:outline-none focus:border-[#C59B27]"
                >
                  <option value="Oui">Oui, absolument</option>
                  <option value="Peut-être">Peut-être, selon les fonctionnalités</option>
                  <option value="Non">Non, uniquement version gratuite</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F1EEE7]/80 mb-1.5">
                  10. Fourchette de prix acceptable / mois
                </label>
                <select
                  value={priceBracket}
                  onChange={(e) => setPriceBracket(e.target.value)}
                  className="w-full bg-[#141923] border border-white/[0.08] rounded-xl p-2.5 text-[#F1EEE7] focus:outline-none focus:border-[#C59B27]"
                >
                  <option value="Moins de 5 000 FCFA">Moins de 5 000 FCFA</option>
                  <option value="5 000 – 15 000 FCFA">5 000 – 15 000 FCFA</option>
                  <option value="15 000 – 30 000 FCFA">15 000 – 30 000 FCFA</option>
                  <option value="Plus de 30 000 FCFA (Pro / Entreprise)">Plus de 30 000 FCFA (Entreprise)</option>
                </select>
              </div>
            </div>

            {/* 11. Intérêt Gabon / Afrique */}
            <div>
              <label className="block text-xs font-medium text-[#F1EEE7]/80 mb-1.5">
                11. Intérêt pour les fonctionnalités adaptées au Gabon & à l'Afrique
              </label>
              <textarea
                rows={2}
                value={africanContextInterest}
                onChange={(e) => setAfricanContextInterest(e.target.value)}
                className="w-full bg-[#141923] border border-white/[0.08] rounded-xl p-3 text-[#F1EEE7] focus:outline-none focus:border-[#C59B27]"
              />
            </div>

            {/* 12 & 13. Langue & Consentement */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#F1EEE7]/70">Langue principale :</span>
                <select
                  value={localeUsed}
                  onChange={(e) => setLocaleUsed(e.target.value)}
                  className="bg-[#141923] border border-white/[0.08] rounded-lg p-1.5 text-xs text-[#F1EEE7]"
                >
                  <option value="fr">Français</option>
                  <option value="fang">Fang</option>
                  <option value="mpongwe">Mpongwe</option>
                  <option value="punu">Punu</option>
                  <option value="en">English</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#F1EEE7]/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quoteConsent}
                  onChange={(e) => setQuoteConsent(e.target.checked)}
                  className="accent-[#C59B27] rounded"
                />
                <span>Autoriser l'utilisation anonymisée de cet avis</span>
              </label>
            </div>

            {/* Boutons d'action */}
            <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] text-[#F1EEE7]/70 hover:text-[#F1EEE7] transition"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#C59B27] hover:bg-[#D4A932] text-black transition flex items-center gap-2 shadow-lg"
              >
                <PaperPlaneTilt size={16} weight="bold" />
                {loading ? 'Transmission...' : 'Envoyer mon retour'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
