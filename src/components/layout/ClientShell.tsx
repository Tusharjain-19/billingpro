'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  Settings, 
  LayoutGrid, 
  Receipt,
  Sun,
  Moon,
  BarChart3,
  User,
  Plus
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

function NavItem({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
      <motion.div 
        whileTap={{ scale: 0.9 }}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 4,
          position: 'relative',
          padding: '8px 0'
        }}
      >
        <div style={{
          color: active ? 'var(--app-primary)' : 'var(--app-fg-muted)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: active ? 'translateY(-2px)' : 'none'
        }}>
          <Icon size={22} strokeWidth={active ? 2.5 : 2} />
        </div>
        <span style={{ 
          fontSize: 9, 
          fontWeight: 800, 
          color: active ? 'var(--app-primary)' : 'var(--app-fg-muted)',
          letterSpacing: 0.5,
          transition: 'all 0.3s ease'
        }}>
          {label}
        </span>
        {active && (
          <motion.div 
            layoutId="navIndicator"
            style={{
              position: 'absolute',
              bottom: 0,
              width: 12,
              height: 3,
              borderRadius: 10,
              background: 'var(--app-primary)',
              boxShadow: '0 0 10px var(--app-primary-glow)'
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
    if (path.includes('/inventory')) return 'Stock Shop';
    if (path.includes('/billing')) return 'Terminal';
    if (path.includes('/reports')) return 'Analytics';
    if (path.includes('/settings')) return 'Shop Profile';
    return 'App';
  };

  return (
    <div className="app-container">
      <header className="app-header glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--app-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <LayoutGrid size={18} />
            </div>
            <h1 className="font-space" style={{ fontSize: 18, fontWeight: 800 }}>{getPageTitle(pathname)}</h1>
        </div>

        <motion.button 
          onClick={toggleTheme}
          whileTap={{ scale: 0.9 }}
          style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--app-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--app-primary)', border: 'none', cursor: 'pointer' }}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </motion.button>
      </header>

      <div className="app-viewport">
        {children}
      </div>

      {/* Optimized Bottom Navigation */}
      <nav className="app-bottom-nav">
        <NavItem href="/"          icon={Home}       label="HOME"     active={pathname === '/'} />
        <NavItem href="/inventory" icon={Search}     label="STOCK"    active={pathname === '/inventory'} />
        
        {/* Central Billing Button */}
        <Link href="/billing" style={{ textDecoration: 'none', flex: 1.2 }}>
            <motion.div 
                whileTap={{ scale: 0.9 }}
                style={{ 
                    marginTop: -30,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6
                }}
            >
                <div style={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 20, 
                    background: 'var(--app-primary)', 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 10px 25px var(--app-primary-glow)',
                    border: '4px solid var(--app-bg)'
                }}>
                    <Plus size={28} strokeWidth={3} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 900, color: pathname === '/billing' ? 'var(--app-primary)' : 'var(--app-fg-muted)' }}>BILL</span>
            </motion.div>
        </Link>
        
        <NavItem href="/reports"   icon={BarChart3}  label="REPORTS"  active={pathname === '/reports'} />
        <NavItem href="/settings"  icon={User}       label="PROFILE"  active={pathname === '/settings'} />
      </nav>
    </div>
  );
}
