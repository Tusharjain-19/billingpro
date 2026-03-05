'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  Bell, 
  User, 
  Plus, 
  Settings, 
  LayoutGrid, 
  Receipt,
  Sun,
  Moon,
  ChevronRight
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

// Custom NavItem with Haptic Feedbak Feel
function NavItem({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      <motion.div 
        whileTap={{ scale: 0.85 }}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 6,
          position: 'relative'
        }}
      >
        <div style={{
          color: active ? 'var(--app-primary)' : 'var(--app-fg-muted)',
          transition: 'color 0.2s ease',
          zIndex: 2
        }}>
          <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        </div>
        <span style={{ 
          fontSize: 10, 
          fontWeight: 700, 
          color: active ? 'var(--app-primary)' : 'var(--app-fg-muted)',
          letterSpacing: -0.2,
          transition: 'color 0.2s ease'
        }}>
          {label}
        </span>
        {active && (
          <motion.div 
            layoutId="activeTab"
            style={{
              position: 'absolute',
              top: -8,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'var(--app-primary)',
              boxShadow: '0 0 10px var(--app-primary)'
            }}
          />
        )}
      </motion.div>
    </Link>
  );
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const getPageTitle = (path: string) => {
    if (path === '/') return 'Dashboard';
    if (path.includes('/inventory')) return 'Stock Registry';
    if (path.includes('/billing')) return 'Quick Bill';
    if (path.includes('/reports')) return 'Analytics';
    if (path.includes('/settings')) return 'Shop Profile';
    return 'App';
  };

  return (
    <div className="app-container">
      {/* Native-Like Header */}
      <header className="app-header">
        <motion.div 
          whileTap={{ scale: 0.9 }}
          style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--app-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--app-primary)' }}
        >
          <LayoutGrid size={22} strokeWidth={2.5} />
        </motion.div>

        <h1 className="font-space">{getPageTitle(pathname)}</h1>

        <motion.button 
          onClick={toggleTheme}
          whileTap={{ scale: 0.9 }}
          style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--app-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--app-primary)', border: 'none' }}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </motion.button>
      </header>

      {/* Viewport Content */}
      <div className="app-viewport">
        <div className="header-overlap" />
        {children}
      </div>

      {/* Floating Action Button for NEW BILL (Core Feature) */}
      <Link href="/billing">
        <motion.button 
          className="app-fab"
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ cursor: 'pointer', border: 'none' }}
        >
          <Plus size={32} color="#fff" strokeWidth={3} />
        </motion.button>
      </Link>

      {/* Stick Bottom Navigation */}
      <nav className="app-bottom-nav">
        <NavItem href="/"          icon={Home}     label="HOME"     active={pathname === '/'} />
        <NavItem href="/inventory" icon={Search}   label="STOCK"    active={pathname === '/inventory'} />
        
        {/* Gap for FAB or Center Item */}
        <div style={{ width: 64 }} /> 
        
        <NavItem href="/reports"   icon={Bell}     label="REPORTS"  active={pathname === '/reports'} />
        <NavItem href="/settings"  icon={User}     label="PROFILE"  active={pathname === '/settings'} />
      </nav>
    </div>
  );
}
