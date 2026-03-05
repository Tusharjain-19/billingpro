'use client';

import React from 'react';
import { NavItem } from "@/components/layout/NavItem";
import { Home, Package, Receipt, Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      style={{
        position: "absolute",
        top: "24px",
        right: "24px",
        zIndex: 1000,
        width: "48px",
        height: "48px",
        borderRadius: "16px",
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "var(--primary)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="app-shell">
      <ThemeToggle />
      <div style={{ flex: 1, paddingBottom: "130px", overflowY: "auto" }}>
        {children}
      </div>
      <nav className="nav-capsule">
        <NavItem href="/"          icon={Home}     label="Home"     />
        <NavItem href="/inventory" icon={Package}  label="Stock"    />
        <NavItem href="/billing"   icon={Receipt}  label="Bill"     />
        <NavItem href="/settings"  icon={Settings} label="Settings" />
      </nav>
    </main>
  );
}
