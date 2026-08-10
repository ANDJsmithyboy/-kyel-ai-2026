'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settings.store';
import { useAgent } from '@/hooks/useAgent';
import { useRenduPanel } from '@/hooks/useRenduPanel';
import InputBar from '@/components/input/InputBar';
import ConversationStream from '@/components/chat/ConversationStream';
import { AgentTimeline } from '@/components/agent/AgentTimeline';

export default function AgentPage() {
  const isBlackPanther = useSettingsStore(s => s.blackPantherMode);
  const openRendu = useRenduPanel(s => s.openRendu);
  
  const { messages, isStreaming, error, activeRendu, sendMessage, stop } = useAgent({
    model: isBlackPanther ? 'BLACK_PANTHER' : 'ONYX',
  });

  const handleSend = (text: string) => {
    sendMessage(text);
  };

  // Open Rendu panel automatically when a new one is generated
  useEffect(() => {
    if (activeRendu) {
      openRendu(activeRendu);
    }
  }, [activeRendu, openRendu]);

  // Extract all agent steps from the current assistant message
  // In a real scenario, you might want to keep a flattened list of all steps in the current run, 
  // but here we just take the last assistant message's step to show in the timeline if it exists.
  // A better approach for the timeline is to have the backend send a history of steps, or accumulate them in useAgent.
  // For now, we'll just mock passing the current step as a list to the timeline.
  const currentStep = messages[messages.length - 1]?.agentStep;
  const agentSteps = currentStep ? [currentStep] : []; 
  // *Note:* Pour un vrai AgentTimeline complet, `useAgent` devrait accumuler un tableau `steps: AgentStep[]`. 
  // J'ai simplifié ici pour correspondre aux modèles de base.

  return (
    <div className="flex flex-col lg:flex-row h-full w-full relative">
      
      {/* Colonne gauche : Chat (Directives) */}
      <div className="flex-1 flex flex-col relative h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-white/5">
        <div className="flex-1 overflow-hidden relative">
          <ConversationStream 
            messages={messages} 
            isStreaming={isStreaming} 
            error={error} 
          />
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[var(--zc-background)] via-[var(--zc-background)] to-transparent pt-10 pb-4">
          <InputBar 
            model={isBlackPanther ? 'BLACK_PANTHER' : 'ONYX'}
            setModel={(m) => { /* TODO */ }}
            onSend={handleSend} 
            onStop={stop} 
            isGenerating={isStreaming} 
          />
        </div>
      </div>

      {/* Colonne droite : Radar LOXO / Pipeline Agent */}
      <div className="w-full lg:w-[400px] xl:w-[480px] h-1/2 lg:h-full bg-black/10 flex flex-col p-4 relative z-0">
        <div className="mb-4 px-2">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse" />
            Vecteur Autonome
          </h3>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-1">Supervision du processus d'exécution</p>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <AgentTimeline sessionId="legacy-session" />
        </div>
      </div>

    </div>
  );
}
