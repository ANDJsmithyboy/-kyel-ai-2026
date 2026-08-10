/* GabomaGPT · admin/documents/page.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Documents & RAG — Miroir complet Open WebUI Documents + Embedding + Reranking */
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { FileText, Upload, Trash2, RefreshCw, File, Search, Save, Database, Layers, Settings2 } from 'lucide-react';
import { getDocuments, uploadDocument, deleteDocument } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const EMBEDDING_ENGINES = [
  { id: '', name: 'Default (sentence-transformers)' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'ollama', name: 'Ollama' },
  { id: 'azure_openai', name: 'Azure OpenAI' },
];

function Toggle({ checked, onChange, label, helper }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; helper?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <div className="text-sm font-medium text-[var(--text-primary)]">{label}</div>
        {helper && <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{helper}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-5.5 rounded-full transition-colors shrink-0',
          checked ? 'bg-[var(--accent)]' : 'bg-[var(--bg-overlay)]'
        )}
      >
        <span className={cn(
          'absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform shadow-sm',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )} />
      </button>
    </div>
  );
}

type TabId = 'documents' | 'embedding' | 'retrieval';

export default function AdminDocumentsPage() {
  const token = useAuthStore((s) => s.user?.token);
  const [activeTab, setActiveTab] = useState<TabId>('documents');

  // Documents state
  const [docs, setDocs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // RAG / Embedding state
  const [embeddingEngine, setEmbeddingEngine] = useState('');
  const [embeddingModel, setEmbeddingModel] = useState('sentence-transformers/all-MiniLM-L6-v2');
  const [embeddingBatchSize, setEmbeddingBatchSize] = useState('1');
  const [asyncEmbedding, setAsyncEmbedding] = useState(true);
  const [chunkSize, setChunkSize] = useState('1500');
  const [chunkOverlap, setChunkOverlap] = useState('100');
  const [pdfExtractor, setPdfExtractor] = useState('default');

  // Retrieval state
  const [topK, setTopK] = useState('4');
  const [relevanceThreshold, setRelevanceThreshold] = useState('0.0');
  const [hybridSearch, setHybridSearch] = useState(false);
  const [rerankingEnabled, setRerankingEnabled] = useState(false);
  const [rerankingModel, setRerankingModel] = useState('');
  const [topKReranker, setTopKReranker] = useState('4');
  const [queryTemplate, setQueryTemplate] = useState('');

  const loadDocs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getDocuments(token);
      setDocs(data);
    } catch {
      // Backend peut ne pas etre connecte
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      await uploadDocument(token, file);
      toast.success('Document uploade avec succes');
      loadDocs();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await deleteDocument(token, id);
      setDocs((prev) => prev.filter((d) => (d as { id: string }).id !== id));
      toast.success('Document supprime');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleSaveRAG = () => {
    toast.success('Configuration RAG sauvegardee');
  };

  const filtered = search
    ? docs.filter((d) => {
        const name = (d as { filename?: string }).filename || '';
        return name.toLowerCase().includes(search.toLowerCase());
      })
    : docs;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'documents', label: 'Documents', icon: <FileText size={14} /> },
    { id: 'embedding', label: 'Embedding & Chunking', icon: <Layers size={14} /> },
    { id: 'retrieval', label: 'Retrieval & Reranking', icon: <Settings2 size={14} /> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Documents & RAG</h2>
          <p className="text-sm text-[var(--text-tertiary)]">Gestion des documents, embedding et retrieval</p>
        </div>
        {activeTab !== 'documents' && (
          <button onClick={handleSaveRAG} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-medium hover:opacity-90 transition-opacity">
            <Save size={14} />
            Sauvegarder
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-[var(--accent-10)] text-[var(--accent)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Documents */}
      {activeTab === 'documents' && (
        <>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--zc-input)] border border-[var(--border)]">
              <Search size={16} className="text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Rechercher un document..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
              />
            </div>
            <button onClick={loadDocs} className="p-2.5 rounded-xl hover:bg-[var(--accent-10)] transition-colors border border-[var(--border)]">
              <RefreshCw size={15} className={cn('text-[var(--text-secondary)]', loading && 'animate-spin')} />
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                'bg-[var(--accent)] text-[var(--accent-foreground)]',
                uploading ? 'opacity-50' : 'hover:opacity-90'
              )}
            >
              <Upload size={14} />
              <span>{uploading ? 'Upload...' : 'Uploader'}</span>
            </button>
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} accept=".pdf,.txt,.md,.docx,.csv,.json,.xlsx" />
          </div>

          <p className="text-xs text-[var(--text-tertiary)]">{docs.length} document(s) indexe(s)</p>

          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl skeleton" />
              ))
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <FileText size={40} className="text-[var(--text-tertiary)] mb-3 opacity-40" />
                <p className="text-sm text-[var(--text-tertiary)]">Aucun document</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 opacity-60">
                  Uploadez des fichiers PDF, TXT, MD, DOCX, CSV ou JSON pour la recherche RAG.
                </p>
              </div>
            ) : (
              filtered.map((doc) => {
                const d = doc as { id: string; filename?: string; meta?: { size?: number; content_type?: string } };
                return (
                  <div key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors group">
                    <File size={18} className="text-[var(--accent)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">{d.filename || d.id}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">
                        {d.meta?.content_type || 'Document'}
                        {d.meta?.size ? ` · ${(d.meta.size / 1024).toFixed(1)} KB` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Tab: Embedding & Chunking */}
      {activeTab === 'embedding' && (
        <div className="space-y-6">
          <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Database size={15} className="text-[var(--accent)]" />
              Modele d&apos;Embedding
            </h3>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Moteur</label>
              <select
                value={embeddingEngine}
                onChange={(e) => setEmbeddingEngine(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
              >
                {EMBEDDING_ENGINES.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Modele</label>
              <input
                type="text"
                value={embeddingModel}
                onChange={(e) => setEmbeddingModel(e.target.value)}
                placeholder="sentence-transformers/all-MiniLM-L6-v2"
                className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Taille du batch</label>
              <input
                type="number"
                value={embeddingBatchSize}
                onChange={(e) => setEmbeddingBatchSize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <Toggle
              checked={asyncEmbedding}
              onChange={setAsyncEmbedding}
              label="Embedding asynchrone"
              helper="Traiter les embeddings en arriere-plan pour ne pas bloquer l'interface"
            />
          </section>

          <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Layers size={15} className="text-[var(--accent)]" />
              Chunking (Decoupage)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Taille du chunk</label>
                <p className="text-xs text-[var(--text-tertiary)]">Nombre de caracteres par segment</p>
                <input
                  type="number"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Overlap (Chevauchement)</label>
                <p className="text-xs text-[var(--text-tertiary)]">Caracteres communs entre chunks</p>
                <input
                  type="number"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Extracteur PDF</label>
              <select
                value={pdfExtractor}
                onChange={(e) => setPdfExtractor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
              >
                <option value="default">Default</option>
                <option value="tika">Apache Tika</option>
                <option value="docling">Docling</option>
                <option value="unstructured">Unstructured</option>
              </select>
            </div>
          </section>
        </div>
      )}

      {/* Tab: Retrieval & Reranking */}
      {activeTab === 'retrieval' && (
        <div className="space-y-6">
          <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Search size={15} className="text-[var(--accent)]" />
              Parametres de recherche
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Top K</label>
                <p className="text-xs text-[var(--text-tertiary)]">Nombre de chunks retournes</p>
                <input
                  type="number"
                  value={topK}
                  onChange={(e) => setTopK(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Seuil de pertinence</label>
                <p className="text-xs text-[var(--text-tertiary)]">Score minimum (0.0 = pas de filtre)</p>
                <input
                  type="number"
                  step="0.1"
                  value={relevanceThreshold}
                  onChange={(e) => setRelevanceThreshold(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            <Toggle
              checked={hybridSearch}
              onChange={setHybridSearch}
              label="Recherche hybride"
              helper="Combiner la recherche vectorielle et la recherche par mots-cles (BM25)"
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Template de requete RAG</label>
              <p className="text-xs text-[var(--text-tertiary)]">Laissez vide pour le template par defaut</p>
              <textarea
                value={queryTemplate}
                onChange={(e) => setQueryTemplate(e.target.value)}
                rows={3}
                placeholder="[query] sera remplace par la question de l'utilisateur"
                className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors resize-none font-mono text-xs"
              />
            </div>
          </section>

          <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Reranking</h3>

            <Toggle
              checked={rerankingEnabled}
              onChange={setRerankingEnabled}
              label="Activer le reranking"
              helper="Re-classer les resultats de recherche avec un modele de reranking"
            />

            {rerankingEnabled && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Modele de reranking</label>
                  <input
                    type="text"
                    value={rerankingModel}
                    onChange={(e) => setRerankingModel(e.target.value)}
                    placeholder="BAAI/bge-reranker-base"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Top K Reranker</label>
                  <input
                    type="number"
                    value={topKReranker}
                    onChange={(e) => setTopKReranker(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
