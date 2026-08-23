/**
 * Ñkyel AI · Modal Sélecteur Linguistique Universel & Priorité Africaine
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Configures the 5 independent language dimensions:
 * 1. Interface (UI)
 * 2. Conversation (Dialogue)
 * 3. Documents (Livrables)
 * 4. Recherche Web Pivot
 * 5. Voix (STT / TTS)
 */

'use client';

import React, { useState } from 'react';
import {
  Globe,
  Translate,
  Microphone,
  FileText,
  MagnifyingGlass,
  X,
  Check,
  WifiLow,
} from '@phosphor-icons/react';
import { useLanguageStore, SUPPORTED_LANGUAGES } from '@/stores/language.store';

export default function LanguageSelectorModal() {
  const {
    isModalOpen,
    setModalOpen,
    uiLanguage,
    conversationLanguage,
    documentLanguage,
    searchLanguage,
    voiceLanguage,
    setUiLanguage,
    setConversationLanguage,
    setDocumentLanguage,
    setSearchLanguage,
    setVoiceLanguage,
    lowBandwidthMode,
    toggleLowBandwidthMode,
  } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'ui' | 'conversation' | 'document' | 'search' | 'voice'>('conversation');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'african' | 'world'>('all');

  if (!isModalOpen) return null;

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const matchesSearch =
      lang.name.toLowerCase().includes(search.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      lang.tag.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      filterCategory === 'all' ||
      (filterCategory === 'african' && lang.isAfricanPriority) ||
      (filterCategory === 'world' && !lang.isAfricanPriority);
    return matchesSearch && matchesCat;
  });

  const getActiveLangForTab = (): string => {
    switch (activeTab) {
      case 'ui':
        return uiLanguage;
      case 'conversation':
        return conversationLanguage;
      case 'document':
        return documentLanguage;
      case 'search':
        return searchLanguage;
      case 'voice':
        return voiceLanguage;
    }
  };

  const handleSelectLang = (tag: string) => {
    switch (activeTab) {
      case 'ui':
        setUiLanguage(tag);
        break;
      case 'conversation':
        setConversationLanguage(tag);
        break;
      case 'document':
        setDocumentLanguage(tag);
        break;
      case 'search':
        setSearchLanguage(tag);
        break;
      case 'voice':
        setVoiceLanguage(tag);
        break;
    }
  };

  const activeTag = getActiveLangForTab();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="w-full max-w-2xl border rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        style={{
          background: 'var(--bg)',
          borderColor: 'var(--border-default)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b flex items-center justify-between shrink-0"
          style={{
            background: 'var(--surface-raised)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0"
              style={{
                background: 'var(--accent-subtle)',
                color: 'var(--accent)',
                borderColor: 'var(--accent-muted)',
              }}
            >
              <Globe size={22} weight="bold" />
            </span>
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--fg)' }}>
                Souveraineté Linguistique & Multilinguisme
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
                Langues gabonaises & africaines au cœur de Ñkyel AI, adaptées au monde entier.
              </p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(false)}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--fg-subtle)' }}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 5 Settings Tabs */}
        <div
          className="flex border-b px-6 shrink-0 overflow-x-auto"
          style={{
            background: 'var(--bg)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          {[
            { id: 'conversation', label: 'Dialogue', icon: Translate },
            { id: 'ui', label: 'Interface', icon: Globe },
            { id: 'document', label: 'Livrables & Docs', icon: FileText },
            { id: 'search', label: 'Recherche Pivot', icon: MagnifyingGlass },
            { id: 'voice', label: 'Voix & STT/TTS', icon: Microphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all shrink-0"
                style={{
                  borderColor: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--fg-subtle)',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter */}
        <div
          className="p-4 px-6 border-b flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0"
          style={{
            background: 'var(--surface-raised)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="relative w-full sm:w-72">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--fg-subtle)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une langue..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs outline-none"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--fg)',
              }}
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'african', label: 'Afrique & Gabon' },
              { id: 'world', label: 'Monde' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id as any)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all border"
                style={{
                  background: filterCategory === cat.id ? 'var(--accent-subtle)' : 'transparent',
                  color: filterCategory === cat.id ? 'var(--accent)' : 'var(--fg-subtle)',
                  borderColor: filterCategory === cat.id ? 'var(--accent-muted)' : 'var(--border-subtle)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Languages List */}
        <div className="flex-1 overflow-y-auto p-4 px-6 space-y-2.5 scrollbar-thin">
          {/* Auto-detect option for conversation */}
          {activeTab === 'conversation' && (
            <div
              onClick={() => handleSelectLang('auto')}
              className="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between"
              style={{
                background: activeTag === 'auto' ? 'var(--accent-subtle)' : 'var(--surface)',
                borderColor: activeTag === 'auto' ? 'var(--accent)' : 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                >
                  ✨
                </span>
                <div>
                  <h4 className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>
                    Détection Automatique Universelle
                  </h4>
                  <p className="text-[11px]" style={{ color: 'var(--fg-muted)' }}>
                    L'agent répond dans la langue de votre message (supporte le code-switching Fang / Français / Anglais).
                  </p>
                </div>
              </div>
              {activeTag === 'auto' && <Check size={18} style={{ color: 'var(--accent)' }} weight="bold" />}
            </div>
          )}

          {filteredLanguages.map((lang) => {
            const isSelected = activeTag === lang.tag;
            return (
              <div
                key={lang.tag}
                onClick={() => handleSelectLang(lang.tag)}
                className="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between"
                style={{
                  background: isSelected ? 'var(--accent-subtle)' : 'var(--surface)',
                  borderColor: isSelected ? 'var(--accent)' : 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs uppercase shrink-0 font-mono"
                    style={{
                      background: 'var(--surface-raised)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--accent)',
                    }}
                  >
                    {lang.tag}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>
                        {lang.name}
                      </h4>
                      <span className="text-[11px] italic" style={{ color: 'var(--fg-muted)' }}>
                        ({lang.nativeName})
                      </span>
                      {lang.isAfricanPriority && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border"
                          style={{
                            background: 'rgba(111, 148, 133, 0.15)',
                            color: 'var(--hue-success)',
                            borderColor: 'rgba(111, 148, 133, 0.3)',
                          }}
                        >
                          Afrique
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--fg-muted)' }}>
                      {lang.region} • Direction : {lang.direction.toUpperCase()}
                      {lang.notes && ` • ${lang.notes}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium"
                    style={{
                      background: lang.llmStatus === 'stable' ? 'rgba(111, 148, 133, 0.15)' : 'var(--accent-subtle)',
                      color: lang.llmStatus === 'stable' ? 'var(--hue-success)' : 'var(--accent)',
                    }}
                  >
                    {lang.llmStatus.toUpperCase()}
                  </span>
                  {isSelected && <Check size={18} style={{ color: 'var(--hue-success)' }} weight="bold" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Low Bandwidth Toggle */}
        <div
          className="p-4 px-6 border-t flex items-center justify-between shrink-0"
          style={{
            background: 'var(--surface-raised)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={toggleLowBandwidthMode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all"
            style={{
              background: lowBandwidthMode ? 'rgba(111, 148, 133, 0.15)' : 'transparent',
              borderColor: lowBandwidthMode ? 'rgba(111, 148, 133, 0.3)' : 'var(--border-subtle)',
              color: lowBandwidthMode ? 'var(--hue-success)' : 'var(--fg-muted)',
            }}
          >
            <WifiLow size={16} />
            <span>Mode Bas Débit {lowBandwidthMode ? '(Actif)' : '(Désactivé)'}</span>
          </button>

          <button
            onClick={() => setModalOpen(false)}
            className="px-5 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
            }}
          >
            Appliquer & Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
