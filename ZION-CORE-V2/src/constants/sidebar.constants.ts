/**
 * Nkyel AI · Sidebar Constants
 * SmartANDJ AI Technologies
 */

import {
  ProjetsIcon,
  RenduIcon,
  PawHistoryIcon,
  TropheeIcon,
} from '@/components/icons/NkyelIcons';
import type { NavItem } from '@/types/sidebar.types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'projet',   label: 'Projet',    href: '/projet',   icon: ProjetsIcon },
  { id: 'rendu',    label: 'Le Rendu',  href: '/rendu',    icon: RenduIcon },
  { id: 'en-piste', label: 'En Piste',  href: '/en-piste', icon: PawHistoryIcon },
  { id: 'trophees', label: 'Trophées',  href: '/trophees', icon: TropheeIcon },
] as const;

export const SIDEBAR_WIDTHS = {
  expanded: 260,
  collapsed: 64,
  mobile: 280,
} as const;

export const MOBILE_BREAKPOINT = 768;

export const RECENTS_DISPLAY_COUNT = 5;

export const SIDEBAR_STORAGE_KEY = 'nkyel-sidebar-collapsed';
