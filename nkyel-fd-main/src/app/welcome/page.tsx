/**
 * Ñkyel AI · Page d'accueil publique Manus-Grade
 * SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
 * Route : /welcome
 */

import ManusLandingPage from '@/components/landing/ManusLandingPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ñkyel AI — L\'Agent IA Généraliste Universel & Souverain',
  description: 'Orchestrez 38 écosystèmes d\'IA mondiaux avec l\'Agent d\'Intelligence Universel de SmartANDJ AI Technologies.',
};

export default function WelcomePage() {
  return <ManusLandingPage />;
}
