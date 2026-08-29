'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GoogleReviewWorkspace() {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/review/status`, {
          // credentials: 'include' is critical to send the HttpOnly cookie
          credentials: 'include' 
        });
        
        const data = await res.json();
        
        if (data.active) {
          setIsVerified(true);
        } else {
          router.replace('/'); // Kick out if no valid session
        }
      } catch (err) {
        router.replace('/');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#07090E]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isVerified) return null;

  return (
    <div className="min-h-screen w-full bg-[#07090E] text-white flex">
      {/* Simplified Reviewer Sidebar */}
      <div className="w-64 border-r border-white/10 p-4 flex flex-col h-screen">
        <div className="flex items-center gap-3 mb-8">
          <img src="/brand/nkyel-logo-white.png" alt="Ñkyel" className="w-6 h-6" />
          <span className="font-semibold tracking-wide">Ñkyel</span>
          <span className="text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded-full ml-auto">
            REVIEW
          </span>
        </div>
        
        <div className="flex-1">
          <div className="text-xs font-semibold text-neutral-500 mb-4">WORKSPACE</div>
          <button className="w-full text-left px-3 py-2 rounded-lg bg-white/5 text-sm font-medium border border-white/5">
            Évaluation Globale
          </button>
        </div>
        
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="text-xs text-neutral-500">Google App Review Session</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="border-b border-white/10 pb-6 mb-8">
            <h1 className="text-3xl font-bold mb-2">Espace d'Évaluation Google</h1>
            <p className="text-neutral-400">Bienvenue dans l'environnement de test sécurisé et souverain de Ñkyel.</p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[var(--accent)]/50 transition-colors cursor-pointer group">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--accent)] transition-colors">Test : Raisonnement (Gemini)</h3>
              <p className="text-sm text-neutral-400">Lancer une requête complexe utilisant les capacités de raisonnement profond.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[var(--accent)]/50 transition-colors cursor-pointer group">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--accent)] transition-colors">Test : Multimodalité</h3>
              <p className="text-sm text-neutral-400">Évaluer l'analyse d'images et de documents via l'API Vision.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
