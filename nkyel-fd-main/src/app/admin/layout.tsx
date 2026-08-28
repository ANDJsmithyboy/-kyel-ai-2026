/* Nkyel AI · Admin Layout · SmartANDJ AI Technologies
   Apple-inspired ultra-premium admin shell (Dynamic OLED Themes & Strict RBAC Guard)
   Fondateur : Daniel Jonathan ANDJ */

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdminTheme, adminThemes } from '@/stores/adminTheme';
import { useSafeUser as useUser } from '@/lib/auth-client';
import { getUserTier } from '@/lib/userTiers';
import { LockKey, ArrowLeft, ShieldCheck } from '@phosphor-icons/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { currentTheme, sidebarCollapsed } = useAdminTheme();
  const theme = adminThemes[currentTheme];

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#07090E] text-white">
        <div className="w-7 h-7 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress || '';
  const userRole = (user?.publicMetadata?.role as string) || null;
  const userTier = getUserTier(userEmail, userRole);
  const isAuthorizedAdmin = userTier.isGodMode || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  // ── 403 Forbidden Access Guard ──────────────────────────────
  if (!isSignedIn || !isAuthorizedAdmin) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#07090E] text-white p-6 select-none relative overflow-hidden font-sans">
        {/* Specular Ambient Glow */}
        <div className="absolute top-1/3 start-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md p-8 sm:p-10 rounded-[32px] bg-[#0E121B]/90 backdrop-blur-3xl border border-white/12 text-center space-y-6 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-lg">
            <LockKey size={28} weight="duotone" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Accès Souverain Réservé · 403
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Cette console opérationnelle est strictement réservée aux fondateurs et aux administrateurs autorisés de Ñkyel AI.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-lg transition-all active:scale-95"
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Retour à l&apos;espace de travail</span>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 font-mono pt-4 border-t border-white/10">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Sovereign Security Guard · SmartANDJ AI</span>
          </div>
        </div>
      </div>
    );
  }

  const marginLeft = isMobile ? 'ms-0' : (sidebarCollapsed ? 'ms-[64px]' : 'ms-[220px]');

  return (
    <div 
      data-admin-theme={currentTheme}
      className={`h-screen w-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden flex font-sans antialiased selection:bg-[var(--accent)]/30 selection:text-[var(--text-primary)]`}
    >
      <AdminSidebar isMobile={isMobile} mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
      
      <div className={`flex-1 flex flex-col h-screen w-full transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${marginLeft}`}>
        <AdminHeader isMobile={isMobile} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative w-full">
          {/* Subtle background glow effect (Dynamic) */}
          <div className={`absolute top-0 start-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--accent2)]/[0.03] blur-[120px] rounded-full pointer-events-none transition-colors duration-300`} />
          
          <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-10 relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
