export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative flex items-center justify-center">
        {/* Glowing rings */}
        <div className="absolute w-24 h-24 border border-[var(--accent)] rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20" />
        <div className="absolute w-16 h-16 border-2 border-[var(--accent)] rounded-full animate-spin border-t-transparent" style={{ animationDuration: '3s' }} />
        <div className="absolute w-10 h-10 border-2 border-[var(--text-muted)] rounded-full animate-spin border-b-transparent" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        
        {/* Core dot */}
        <div className="w-3 h-3 bg-[var(--accent)] rounded-full animate-pulse shadow-[0_0_15px_var(--accent)]" />
      </div>

      <div className="flex flex-col items-center space-y-1">
        <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] tracking-widest uppercase animate-pulse">
          Chargement du Module
        </h3>
        <p className="text-[10px] text-[var(--text-muted)] font-mono tracking-widest uppercase">
          Décryptage en cours...
        </p>
      </div>
    </div>
  );
}
