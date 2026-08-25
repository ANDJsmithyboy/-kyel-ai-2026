'use client';

import { Check, Copy, DownloadSimple, DotsThree, FileText, ShareNetwork, Star, ArrowDown, CaretDown } from '@phosphor-icons/react';

interface DesktopMissionPreviewProps {
  composer: React.ReactNode;
}

export default function DesktopMissionPreview({ composer }: DesktopMissionPreviewProps) {
  return (
    <div className="nkyel-mission-preview flex h-full min-h-0 flex-col bg-[#1B1B1B]">
      <div className="nkyel-mission-preview-scroll flex-1 overflow-y-auto">
        <div className="nkyel-mission-thread mx-auto w-full max-w-[960px] px-5 pb-6 pt-2">
          <p className="nkyel-mission-copy">Le rendu de la mission est prêt. Voici la synthèse des éléments vérifiés, les sources utilisées et la prochaine décision recommandée pour votre objectif.</p>

          <article data-surface="artifact" aria-label="Livrable de mission Ñkyel" className="nkyel-result-card nkyel-artifact-card mt-5 max-w-[696px] rounded-[16px] border border-white/[0.10] bg-[#252525] p-3">
            <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#C9A24E] text-[#1B1B1B]"><FileText size={20} weight="fill" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-[#E5E5E5]">Ñkyel AI — IA souveraine du Gabon <span className="ml-1 rounded bg-[#C9A24E]/15 px-1.5 py-0.5 text-[10px] text-[#C9A24E]">Temporaire</span></p>
                <p className="truncate text-[12px] text-[#858585]">Ñkyel AI par SmartANDJ AI Technologies — IA souveraine du Gabon</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 pt-4">
              <p className="text-[13px] leading-6 text-[#858585]">Vous pouvez demander à Ñkyel de le transformer en site web permanent.</p>
              <button type="button" className="flex h-9 shrink-0 items-center gap-2 rounded-[9px] bg-[#F3F3F3] px-3 text-[12px] font-semibold text-[#262626] shadow-sm"><DownloadSimple size={15} /> Créer maintenant</button>
            </div>
          </article>

          <div className="mt-5 flex items-center gap-5 text-[13px]">
            <span className="flex items-center gap-2 font-medium text-[#78C56A]"><Check size={17} weight="bold" /> Tâche terminée</span>
            <span className="h-4 w-px bg-white/[0.10]" />
            <button type="button" aria-label="Copier le résultat" className="text-[#858585] hover:text-[#E5E5E5]"><Copy size={17} /></button>
            <button type="button" aria-label="Partager le résultat" className="text-[#858585] hover:text-[#E5E5E5]"><ShareNetwork size={17} /></button>
            <span className="ml-auto hidden items-center gap-2 text-[#858585] sm:flex">Comment était ce résultat ? <Star size={17} /><Star size={17} /><Star size={17} /><Star size={17} /><Star size={17} /><ArrowDown size={18} className="ml-2 rounded-full bg-[#2A2A2A] p-1 text-[#D0D0D0]" /></span>
          </div>

          <div data-surface="checkpoint" className="nkyel-checkpoint-row mt-6 flex items-center gap-3 rounded-[20px] border border-white/[0.08] bg-[#202020] px-5 py-3 text-[14px] text-[#E5E5E5]">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#315A70] text-white"><Check size={14} weight="bold" /></span>
            <span className="truncate font-medium">Présenter la nouvelle version à juger</span>
            <span className="ml-auto flex items-center gap-1 text-[12px] text-[#858585]">5 / 5 <CaretDown size={14} /></span>
          </div>
        </div>
      </div>

      <div className="nkyel-mission-preview-composer shrink-0 px-5 pb-3 pt-1">{composer}</div>
      <div className="flex shrink-0 items-center justify-center gap-4 pb-4 text-[12px] text-[#777]">Ñkyel est un agent IA et peut faire des erreurs. Vérifiez les résultats avant utilisation.</div>
    </div>
  );
}
