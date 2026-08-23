/**
 * Nkyel AI · Sidebar Types
 * SmartANDJ AI Technologies
 */

import type { ComponentType } from 'react';

export interface SidebarUser {
  id: string;
  displayName: string;
  initials: string;
  country: string;
  avatarUrl?: string;
}

export interface SidebarEnergy {
  current: number;
  max: number;
  label: string;
}

export interface RecentPiste {
  id: string;
  title: string;
  href: string;
  isActive?: boolean;
  createdAt: Date;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<any>;
  isActive?: boolean;
}

export interface SidebarState {
  isCollapsed: boolean;
  isOpen: boolean;
  toggleCollapse: () => void;
  open: () => void;
  close: () => void;
}
