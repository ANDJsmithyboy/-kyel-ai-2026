'use client';

import { useEffect, useState } from 'react';
import { GameController, Presentation, Sparkle, Globe, CaretLeft, CaretRight } from '@phosphor-icons/react';

const PROMOS = [
  { title: 'Créez votre propre mission', description: 'Transformez une intention en étapes vérifiables, avec preuves et livrable final.', icon: Sparkle, accent: '#C9A24E' },
  { title: 'Créez des diapositives', description: 'Structurez vos idées en une présentation claire, élégante et prête à partager.', icon: Presentation, accent: '#4C8AA2' },
  { title: 'Construisez un site web', description: 'Passez du concept à une expérience fonctionnelle avec un agent qui avance avec vous.', icon: Globe, accent: '#665F9E' },
  { title: 'Concevez un jeu', description: 'Imaginez un univers, définissez les règles et laissez Ñkyel construire le premier prototype.', icon: GameController, accent: '#6F9485' },
];

export default function DesktopPromoCarousel() {
  const [active, setActive] = useState(0);
  const promo = PROMOS[active];
  const Icon = promo.icon;

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % PROMOS.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="mt-6 w-full max-w-[660px] select-none" aria-label="Inspiration Ñkyel">
      <div className="relative flex h-[120px] items-center overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#242424] px-6 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="relative z-10 max-w-[390px]">
          <p className="mb-1 text-[16px] font-semibold tracking-[-0.02em] text-[#F1EEE7]">{promo.title}</p>
          <p className="text-[13px] leading-5 text-[#8F8F8F]">{promo.description}</p>
        </div>
        <div className="absolute end-5 top-1/2 flex -translate-y-1/2 items-center gap-2 opacity-90">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/[0.08] bg-[#303030]" style={{ transform: `translateY(${(index - 1) * 8}px)` }}>
              <Icon size={20 - index * 2} weight="duotone" style={{ color: index === 0 ? promo.accent : '#777A80' }} />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setActive((active - 1 + PROMOS.length) % PROMOS.length)} aria-label="Carte précédente" className="absolute start-2 top-1/2 hidden -translate-y-1/2 rounded-full p-1 text-[#777A80] hover:bg-white/[0.06] hover:text-[#F1EEE7] lg:block"><CaretLeft size={15} /></button>
        <button type="button" onClick={() => setActive((active + 1) % PROMOS.length)} aria-label="Carte suivante" className="absolute end-2 top-1/2 hidden -translate-y-1/2 rounded-full p-1 text-[#777A80] hover:bg-white/[0.06] hover:text-[#F1EEE7] lg:block"><CaretRight size={15} /></button>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2" aria-label="Position dans le carrousel">
        {PROMOS.map((item, index) => <button key={item.title} type="button" onClick={() => setActive(index)} aria-label={`Afficher ${item.title}`} className={`h-1.5 rounded-full transition-all ${index === active ? 'w-5 bg-[#C9A24E]' : 'w-1.5 bg-white/[0.18]'}`} />)}
      </div>
    </section>
  );
}
