import React, { useEffect, useState } from 'react';
import { usePersonalizationStore } from '@/stores/personalization.store';
import { useLanguageStore } from '@/stores/language.store';
import { 
  UserCircle, 
  Briefcase, 
  TextAa, 
  Translate, 
  ChatTeardropText, 
  GlobeHemisphereWest, 
  UploadSimple,
  WarningCircle,
  CheckCircle,
  SpinnerGap
} from '@phosphor-icons/react';

export default function PersonalizationTab() {
  const { data, isLoading, error, isSaving, saveError, fetchPersonalization, updatePersonalization } = usePersonalizationStore();
  const { isFr } = useLanguageStore();

  const [nickname, setNickname] = useState('');
  const [profession, setProfession] = useState('');
  const [about, setAbout] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [responseStyle, setResponseStyle] = useState('');
  const [timezone, setTimezone] = useState('');

  // Local state for tracking changes before saving (debounced or explicit save)
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    fetchPersonalization();
  }, [fetchPersonalization]);

  useEffect(() => {
    if (data) {
      setNickname(data.nickname || '');
      setProfession(data.profession || '');
      setAbout(data.about || '');
      setPreferredLanguage(data.preferredLanguage || '');
      setResponseStyle(data.responseStyle || '');
      setTimezone(data.timezone || '');
      setIsDirty(false);
    }
  }, [data]);

  const handleSave = () => {
    updatePersonalization({
      nickname,
      profession,
      about,
      preferredLanguage,
      responseStyle,
      timezone
    });
    setIsDirty(false);
  };

  const handleTextChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setter(e.target.value);
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <SpinnerGap size={32} className="animate-spin text-[var(--accent)]" />
        <p className="text-[13px] text-[var(--text-secondary)]">{isFr ? 'Chargement du profil...' : 'Loading profile...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
        <WarningCircle size={48} className="text-red-500" />
        <p className="text-[14px] text-[var(--text-primary)] font-medium text-center">{error}</p>
        <button onClick={() => fetchPersonalization()} className="px-4 py-2 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-strong)] text-[13px] hover:bg-[var(--hover)] transition-colors">
          {isFr ? 'Réessayer' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-wide">
            {isFr ? 'Personnalisation' : 'Personalization'}
          </h2>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            {isFr ? "Définissez comment l'IA vous perçoit et interagit avec vous." : "Define how the AI perceives and interacts with you."}
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={`px-4 py-2 rounded-xl font-medium text-[13px] flex items-center gap-2 transition-all ${
            isDirty && !isSaving 
              ? 'bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110 shadow-sm'
              : 'bg-[var(--surface-raised)] text-[var(--text-tertiary)] cursor-not-allowed border border-[var(--border-strong)]'
          }`}
        >
          {isSaving ? <SpinnerGap size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          {isFr ? (isSaving ? 'Enregistrement...' : 'Enregistrer') : (isSaving ? 'Saving...' : 'Save Changes')}
        </button>
      </div>

      {saveError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
          <WarningCircle size={20} />
          <span className="text-[13px] font-medium">{saveError}</span>
        </div>
      )}

      {/* Identity */}
      <div className="space-y-5">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-strong)] pb-2">
          {isFr ? 'Identité' : 'Identity'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
              <UserCircle size={16} />
              {isFr ? 'Surnom' : 'Nickname'}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={handleTextChange(setNickname)}
              placeholder={isFr ? 'Comment doit-on vous appeler ?' : 'How should we call you?'}
              className="w-full h-11 px-3 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
              <Briefcase size={16} />
              {isFr ? 'Profession' : 'Profession'}
            </label>
            <input
              type="text"
              value={profession}
              onChange={handleTextChange(setProfession)}
              placeholder={isFr ? 'Ex: Ingénieur Logiciel' : 'e.g. Software Engineer'}
              className="w-full h-11 px-3 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-tertiary)]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
              <TextAa size={16} />
              {isFr ? 'À propos de moi' : 'About me'}
            </label>
            <span className={`text-[12px] ${about.length > 500 ? 'text-red-500 font-bold' : 'text-[var(--text-tertiary)]'}`}>
              {about.length} / 500
            </span>
          </div>
          <textarea
            value={about}
            onChange={handleTextChange(setAbout)}
            placeholder={isFr ? 'Partagez du contexte personnel pour de meilleures réponses...' : 'Share personal context for better responses...'}
            className="w-full h-24 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none placeholder:text-[var(--text-tertiary)] custom-scrollbar"
            maxLength={500}
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-5">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-strong)] pb-2">
          {isFr ? 'Préférences' : 'Preferences'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
              <Translate size={16} />
              {isFr ? 'Langue préférée' : 'Preferred Language'}
            </label>
            <select
              value={preferredLanguage}
              onChange={handleTextChange(setPreferredLanguage)}
              className="w-full h-11 px-3 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer"
            >
              <option value="">{isFr ? 'Langue par défaut' : 'Default Language'}</option>
              <option value="en-US">English</option>
              <option value="fr-FR">Français</option>
              <option value="es-ES">Español</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
              <ChatTeardropText size={16} />
              {isFr ? 'Style de réponse' : 'Response Style'}
            </label>
            <select
              value={responseStyle}
              onChange={handleTextChange(setResponseStyle)}
              className="w-full h-11 px-3 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer"
            >
              <option value="">{isFr ? 'Équilibré (Défaut)' : 'Balanced (Default)'}</option>
              <option value="concise">{isFr ? 'Concis & Direct' : 'Concise & Direct'}</option>
              <option value="detailed">{isFr ? 'Détaillé & Pédagogique' : 'Detailed & Educational'}</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
              <GlobeHemisphereWest size={16} />
              {isFr ? 'Fuseau horaire' : 'Timezone'}
            </label>
            <select
              value={timezone}
              onChange={handleTextChange(setTimezone)}
              className="w-full h-11 px-3 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer"
            >
              <option value="">{isFr ? 'Détecter automatiquement' : 'Auto-detect'}</option>
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Africa/Libreville">Africa/Libreville</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Memory Upload */}
      <div className="space-y-5">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-strong)] pb-2">
          {isFr ? 'Mémoire Externe' : 'External Memory'}
        </h3>
        
        <div className="w-full rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-raised)] hover:bg-[var(--surface)] hover:border-[var(--accent)] transition-all cursor-pointer p-8 flex flex-col items-center justify-center text-center group">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-inset)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-subtle)] transition-colors mb-4">
            <UploadSimple size={24} />
          </div>
          <h4 className="text-[14px] font-medium text-[var(--text-primary)]">
            {isFr ? 'Importer un document de contexte' : 'Import context document'}
          </h4>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-1 max-w-sm">
            {isFr 
              ? 'Uploadez un PDF, TXT ou MD. L\'Agent Ñkyel l\'utilisera pour mieux comprendre vos instructions.' 
              : 'Upload a PDF, TXT or MD. The Ñkyel Agent will use it to better understand your instructions.'}
          </p>
        </div>
      </div>
    </div>
  );
}
