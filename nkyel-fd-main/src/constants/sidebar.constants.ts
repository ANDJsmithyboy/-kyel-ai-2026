import {
  ChatCircleText,
  Folder,
  Compass,
  FolderSimple,
  PlugsConnected,
  PuzzlePiece,
  UsersThree,
  Brain,
  Calendar,
} from '@phosphor-icons/react';
import type { NavItem } from '@/types/sidebar.types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'chat', label: 'Missions & Chat', href: '/chat', icon: ChatCircleText },
  { id: 'wide-research', label: 'Wide Research', href: '/wide-research', icon: Compass },
  { id: 'projects', label: 'Projets', href: '/projects', icon: Folder },
  { id: 'library', label: 'Bibliothèque', href: '/library', icon: FolderSimple },
  { id: 'mcp', label: 'MCP Hub', href: '/mcp', icon: PlugsConnected },
  { id: 'skills', label: 'Skills Studio', href: '/skills', icon: PuzzlePiece },
  { id: 'agents', label: 'Agent Mesh (A2A)', href: '/agents', icon: UsersThree },
  { id: 'memory', label: 'Mémoire DeerMem', href: '/memory', icon: Brain },
  { id: 'scheduled', label: 'Planification', href: '/scheduled', icon: Calendar },
] as const;

export const SIDEBAR_WIDTHS = {
  expanded: 260,
  collapsed: 64,
  mobile: 280,
} as const;

export const MOBILE_BREAKPOINT = 768;

export const RECENTS_DISPLAY_COUNT = 5;

export const SIDEBAR_STORAGE_KEY = 'nkyel-sidebar-collapsed';
