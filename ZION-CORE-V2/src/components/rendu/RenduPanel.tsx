'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRenduPanel } from '@/hooks/useRenduPanel';
import { useSidebarStore } from '@/stores/sidebar';
import RenduHeader from './RenduHeader';
import RenduViewer from './RenduViewer';
import { cn } from '@/lib/utils';

export default function RenduPanel() {
  const { isOpen, artifacts, activeIndex, close: closeRendu } = useRenduPanel();
  const activeRendu = artifacts[activeIndex];
  const isMobile = useSidebarStore(s => s.isMobile);

  return (
    <AnimatePresence>
      {isOpen && activeRendu && (
        <>
          {/* Overlay for mobile */}
          {isMobile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeRendu}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
          )}

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed right-0 top-0 h-screen z-50 flex flex-col bg-[var(--bg-panel)] shadow-2xl border-l border-white/10",
              isMobile ? "w-[100vw]" : "w-[45vw] min-w-[400px] max-w-[800px]"
            )}
          >
            <RenduHeader 
              title={activeRendu.title} 
              type={activeRendu.type} 
              version={activeRendu.version} 
              onClose={closeRendu} 
            />
            
            <div className="flex-1 overflow-hidden relative">
              <RenduViewer rendu={activeRendu} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
