/**
 * GabomaAI · Main Layout
 * SmartANDJ AI Technologies
 * Task 1 — Layout racine (main) avec Sidebar + TopBar + RenduPanel
 */

'use client';

import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarClient from '@/components/sidebar/SidebarClient';
import TopBar from '@/components/shell/TopBar';
import { useRenduPanel } from '@/hooks/useRenduPanel';
import AuroraBackground from '@/components/ui/AuroraBackground';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { isOpen: renduOpen, artifacts, activeIndex, close: closeRendu, setActiveIndex } = useRenduPanel();
  const activeRendu = artifacts[activeIndex] ?? null;

  return (
    <div className="flex h-dvh overflow-hidden bg-transparent">
      <AuroraBackground />
      {/* Sidebar */}
      <SidebarClient />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* RenduPanel — slide droit */}
      <AnimatePresence>
        {renduOpen && (
          <>
            {/* Mobile overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={closeRendu}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed right-0 inset-y-0 z-40 lg:relative lg:z-0 flex flex-col glass border-l-0 lg:border-l lg:hairline-border shadow-2xl"
              style={{
                width: 'min(42vw, 560px)',
                minWidth: 340,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 h-12 flex-shrink-0 border-b hairline-border"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold" style={{ color: '#F0EDE6', fontFamily: 'var(--font-display)' }}>
                    Le Rendu 💎
                  </span>
                  {artifacts.length > 1 && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(0,212,170,0.15)', color: '#00D4AA' }}
                    >
                      {artifacts.length}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={closeRendu}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--accent-06)] hover:bg-[var(--accent-10)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all hover:scale-105 active:scale-95"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              {artifacts.length > 1 && (
                <div
                  className="flex gap-1 px-3 py-2 overflow-x-auto"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {artifacts.map((a, i) => (
                    <button
                      key={a.id}
                      onClick={() => setActiveIndex(i)}
                      className="px-3 py-1 rounded-lg text-[12px] font-medium whitespace-nowrap transition-colors"
                      style={{
                        background: i === activeIndex ? 'rgba(197,160,89,0.1)' : 'transparent',
                        border: i === activeIndex ? '1px solid rgba(197,160,89,0.2)' : '1px solid transparent',
                        color: i === activeIndex ? '#C5A059' : '#525258',
                        cursor: 'pointer',
                      }}
                    >
                      {a.title.slice(0, 18)}{a.title.length > 18 ? '…' : ''}
                    </button>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                  {activeRendu && (
                    <motion.div
                      key={activeRendu.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {activeRendu.type === 'code' && (
                        <pre
                          className="p-4 rounded-xl text-[13px] overflow-x-auto"
                          style={{
                            background: '#050810',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: '#F0EDE6',
                            fontFamily: 'var(--font-mono)',
                            lineHeight: 1.7,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {activeRendu.content}
                        </pre>
                      )}
                      {activeRendu.type === 'markdown' && (
                        <div
                          className="markdown-prose text-[14px]"
                          style={{ color: '#F0EDE6', lineHeight: 1.7 }}
                          dangerouslySetInnerHTML={{ __html: activeRendu.content ?? '' }}
                        />
                      )}
                      {activeRendu.type === 'html' && (
                        <iframe
                          srcDoc={activeRendu.content}
                          sandbox="allow-scripts"
                          className="w-full rounded-xl"
                          style={{ height: '60vh', border: '1px solid rgba(255,255,255,0.06)' }}
                        />
                      )}
                      {(activeRendu.type === 'pdf' || activeRendu.type === 'word') && (
                        <div className="flex flex-col items-center gap-3 py-8">
                          <span className="text-3xl">{activeRendu.type === 'pdf' ? '📕' : '📄'}</span>
                          <span className="text-[14px] font-medium" style={{ color: '#F0EDE6' }}>{activeRendu.title}</span>
                          {activeRendu.url && (
                            <a
                              href={activeRendu.url}
                              download
                              className="px-4 py-2 rounded-xl text-[13px] font-semibold"
                              style={{ background: 'rgba(197,160,89,0.1)', border: '1px solid rgba(197,160,89,0.2)', color: '#C5A059' }}
                            >
                              Télécharger
                            </a>
                          )}
                        </div>
                      )}
                      {activeRendu.type === 'website' && (
                        <div
                          className="p-4 rounded-xl"
                          style={{ background: 'rgba(197,160,89,0.05)', border: '1px solid rgba(197,160,89,0.15)' }}
                        >
                          <p className="text-[14px] font-semibold mb-2" style={{ color: '#C5A059' }}>{activeRendu.title}</p>
                          {activeRendu.url && (
                            <a href={activeRendu.url} target="_blank" rel="noopener noreferrer" className="text-[13px] underline" style={{ color: '#00D4AA' }}>
                              Ouvrir le site →
                            </a>
                          )}
                        </div>
                      )}
                      {!['code', 'markdown', 'html', 'pdf', 'word', 'website'].includes(activeRendu.type) && (
                        <pre
                          className="p-4 rounded-xl text-[13px] overflow-x-auto"
                          style={{ background: '#050810', border: '1px solid rgba(255,255,255,0.06)', color: '#F0EDE6', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}
                        >
                          {activeRendu.content}
                        </pre>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
