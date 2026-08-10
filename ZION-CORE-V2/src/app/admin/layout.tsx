/* GabomaGPT · Admin Layout · SmartANDJ AI Technologies
   Apple-inspired ultra-premium admin shell (Dynamic OLED Themes)
   Fondateur : Daniel Jonathan ANDJ */

'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdminTheme, adminThemes } from '@/stores/adminTheme';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

  if (!mounted) {
    return <div className="min-h-screen bg-[#050507]" />; // Fallback Nuit Lopé
  }

  const marginLeft = isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-[64px]' : 'ml-[220px]');

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
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--accent2)]/[0.03] blur-[120px] rounded-full pointer-events-none transition-colors duration-300`} />
          
          <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-10 relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
