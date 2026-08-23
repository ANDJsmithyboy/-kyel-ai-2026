/**
 * Ñkyel AI · Page d'accueil & Passerelle Universelle Manus-Grade
 * SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
 * Route : "/"
 */

'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import ManusLandingPage from '@/components/landing/ManusLandingPage';
import ChatPage from './chat/page';

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();

  // Si l'utilisateur est connecté, on lui donne accès direct au Chat / Mission Studio
  // Sinon, on affiche la page d'accueil d'élite Manus AI avec passerelle Clerk
  if (isLoaded && isSignedIn) {
    return <ChatPage />;
  }

  return <ManusLandingPage />;
}
