import React from 'react';
import { VIESection } from '../VIESection';
import { VIEPerception as PerceptionData, VIESectionState } from '@/lib/nkyel/vie-projection';
import { Globe, FileText, Database, ChatCircle, Hash } from '@phosphor-icons/react';

interface VIEPerceptionProps {
  state: VIESectionState<PerceptionData>;
}

export function VIEPerception({ state }: VIEPerceptionProps) {
  const { data, status } = state;

  // Icon mapping for known categories
  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('web') || c.includes('url')) return Globe;
    if (c.includes('doc') || c.includes('file')) return FileText;
    if (c.includes('base') || c.includes('db')) return Database;
    if (c.includes('conv') || c.includes('chat')) return ChatCircle;
    return Hash;
  };

  // Convert categories object to array for easier rendering
  const categories = Object.entries(data.sourceCategories).map(([name, count]) => ({ name, count }));
  
  // Sort by count descending
  categories.sort((a, b) => b.count - a.count);

  const topCategories = categories.slice(0, 4);
  const othersCount = categories.slice(4).reduce((sum, cat) => sum + cat.count, 0);

  const primaryVisualization = (
    <div className="relative w-full h-full flex items-center justify-center min-h-[140px] opacity-80">
      {/* Decorative flow visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Abstract points */}
        <div className="w-[180px] h-[80px] relative">
           {[...Array(12)].map((_, i) => (
             <div 
               key={i}
               className="absolute w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
               style={{
                 left: `${Math.random() * 60}%`,
                 top: `${Math.random() * 100}%`,
                 opacity: 0.3 + Math.random() * 0.7,
                 boxShadow: '0 0 6px var(--nkyel-accent-glow, var(--accent))'
               }}
             />
           ))}
           {/* Flow lines */}
           <svg className="absolute inset-0 w-full h-full text-[var(--accent)] opacity-20" preserveAspectRatio="none">
              <path d="M 60,10 C 120,10 120,40 180,40" stroke="currentColor" fill="none" strokeWidth="1" />
              <path d="M 50,40 C 110,40 130,40 180,40" stroke="currentColor" fill="none" strokeWidth="1" />
              <path d="M 60,70 C 120,70 120,40 180,40" stroke="currentColor" fill="none" strokeWidth="1" />
           </svg>
        </div>
      </div>
    </div>
  );

  const categoryList = (
    <div className="flex flex-col gap-3">
      {topCategories.map((cat, idx) => {
        const Icon = getCategoryIcon(cat.name);
        return (
          <div key={idx} className="flex items-center gap-3 text-[13px] text-[var(--text-primary)]">
            <Icon size={18} className="text-[var(--text-secondary)]" weight="light" />
            <span className="flex-1">{cat.name}</span>
          </div>
        );
      })}
      {othersCount > 0 && (
        <div className="flex items-center gap-3 text-[12px] text-[var(--text-muted)] mt-1">
          <span className="pl-[30px]">+ {othersCount} autres</span>
        </div>
      )}
      {topCategories.length === 0 && status !== 'idle' && (
        <div className="text-[13px] text-[var(--text-muted)] italic">
          Aucune source pour le moment.
        </div>
      )}
    </div>
  );

  return (
    <VIESection
      number={1}
      title="PERCEPTION"
      description="VIE collecte et structure les signaux du monde réel."
      status={status}
      metric={<span>{data.totalSources} sources</span>}
      primaryContent={primaryVisualization}
      secondaryContent={categoryList}
    />
  );
}
