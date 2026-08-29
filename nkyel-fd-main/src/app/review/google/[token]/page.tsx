'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api'; // Or standard fetch

export default function GoogleReviewTokenPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    async function verifyToken() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/v1/review/auth/${token}`, {
          method: 'POST',
        });
        
        if (res.ok) {
          setStatus('success');
          // Wait briefly to show success, then redirect to the private workspace
          setTimeout(() => {
            router.replace('/review/google');
          }, 1500);
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    }
    
    if (token) {
      verifyToken();
    }
  }, [token, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#07090E] text-white">
      <div className="max-w-md w-full p-8 text-center space-y-6">
        <img src="/brand/nkyel-logo-white.png" alt="Ñkyel" className="w-12 h-12 mx-auto animate-pulse" />
        
        {status === 'loading' && (
          <div className="space-y-2">
            <h1 className="text-xl font-bold">Vérification de l'accès...</h1>
            <p className="text-sm text-neutral-400">Authentification Google Review en cours.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-2 animate-in fade-in zoom-in">
            <h1 className="text-xl font-bold text-[var(--accent)]">Accès Autorisé</h1>
            <p className="text-sm text-neutral-400">Redirection vers votre espace souverain...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-red-500">Lien invalide ou expiré</h1>
            <p className="text-sm text-neutral-400">Veuillez demander un nouveau lien d'accès à l'administrateur Ñkyel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
