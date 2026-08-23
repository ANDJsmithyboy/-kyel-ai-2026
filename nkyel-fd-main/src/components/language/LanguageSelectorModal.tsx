/**
 * Ñkyel AI · Modal Sélecteur Linguistique Universel & Priorité Africaine
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Permet de configurer indépendamment les 5 dimensions linguistiques :
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
  Sparkle,
  ShieldCheck,
  Broadcast,
  WifiLow,
} from '@phosphor-icons/react';
import { useLanguageStore, SUPPORTED_LANGUAGES, type LanguageItem } from '@/stores/language.store';

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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0E121A] border border-white/[0.1] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#121620]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#665F9E]/20 text-[#AAA2C8] flex items-center justify-center border border-[#665F9E]/30">
              <Globe size={22} weight="bold" />
            </span>
            <div>
              <h2 className="text-base font-bold font-heading text-[#F1EEE7]">
                Souveraineté Linguistique & Multilinguisme
              </h2>
              <p className="text-xs text-[#7E8795] mt-0.5">
                Langues gabonaises & africaines au cœur de Ñkyel AI, adaptables au monde entier.
              </p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(false)}
            className="p-2 rounded-xl text-[#7E8795] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 5 Settings Tabs */}
        <div className="flex border-b border-white/[0.06] px-6 bg-[#0E121A] shrink-0 overflow-x-auto">
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
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                  isActive
                    ? 'border-[#C39A52] text-[#C39A52]'
                    : 'border-transparent text-[#7E8795] hover:text-[#B8C0CC]'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 px-6 border-b border-white/[0.04] flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0 bg-[#0E121A]">
          <div className="relative w-full sm:w-72">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7E8795]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une langue..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#F1EEE7] outline-none focus:border-[#665F9E]"
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
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterCategory === cat.id
                    ? 'bg-[#665F9E]/20 text-[#AAA2C8] border border-[#665F9E]/40'
                    : 'text-[#7E8795] hover:text-white bg-white/[0.02]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Languages List */}
        <div className="flex-1 overflow-y-auto p-4 px-6 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10">
          {/* Option Auto-detect pour le dialogue */}
          {activeTab === 'conversation' && (
            <div
              onClick={() => handleSelectLang('auto')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeTag === 'auto'
                  ? 'bg-[#C39A52]/15 border-[#C39A52]/50 text-[#F1EEE7]'
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-[#B8C0CC]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#C39A52]/20 text-[#C39A52] flex items-center justify-center font-bold text-xs">
                  ✨
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-[#F1EEE7]">Détection Automatique Universelle</h4>
                  <p className="text-[11px] text-[#7E8795]">
                    L'agent répond dans la langue de votre message (supporte le code-switching Fang / Français / Anglais).
                  </p>
                </div>
              </div>
              {activeTag === 'auto' && <Check size={18} className="text-[#C39A52]" weight="bold" />}
            </div>
          )}

          {filteredLanguages.map((lang) => {
            const isSelected = activeTag === lang.tag;
            return (
              <div
                key={lang.tag}
                onClick={() => handleSelectLang(lang.tag)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#665F9E]/15 border-[#665F9E]/50 text-[#F1EEE7]'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-[#B8C0CC]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center font-bold text-xs uppercase text-[#AAA2C8] shrink-0">
                    {lang.tag}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-semibold text-[#F1EEE7]">{lang.name}</h4>
                      <span className="text-[11px] text-[#7E8795] font-serif italic">({lang.nativeName})</span>
                      {lang.isAfricanPriority && (
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-[#6F9485]/20 text-[#6F9485] border border-[#6F9485]/30">
                          Afrique
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#7E8795] mt-0.5 truncate">
                      {lang.region} • Direction : {lang.direction.toUpperCase()}
                      {lang.notes && ` • ${lang.notes}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium ${
                      lang.llmStatus === 'stable'
                        ? 'bg-[#6F9485]/20 text-[#6F9485]'
                        : lang.llmStatus === 'beta'
                        ? 'bg-[#C39A52]/20 text-[#C39A52]'
                        : 'bg-white/[0.04] text-[#7E8795]'
                    }`}
                  >
                    {lang.llmStatus.toUpperCase()}
                  </span>
                  {isSelected && <Check size={18} className="text-[#6F9485]" weight="bold" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Low Bandwidth Toggle */}
        <div className="p-4 px-6 border-t border-white/[0.06] bg-[#121620] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={toggleLowBandwidthMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              lowBandwidthMode
                ? 'bg-[#6F9485]/20 border-[#6F9485]/40 text-[#6F9485]'
                : 'bg-white/[0.02] border-white/[0.06] text-[#7E8795] hover:text-white'
            }`}
          >
            <WifiLow size={16} />
            <span>Mode Bas Débit {lowBandwidthMode ? '(Actif)' : '(Désactivé)'}</span>
          </button>

          <button
            onClick={() => setModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-[#665F9E] hover:bg-[#665F9E]/80 text-white text-xs font-semibold shadow-lg transition-all"
          >
            Appliquer & Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
