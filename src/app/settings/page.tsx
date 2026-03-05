'use client';

import { Store, Printer, Bell, Shield, LogOut, ChevronRight, BadgeCheck, Globe, Smartphone, Database, Fingerprint, Cpu, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';

function ConfigRow({ icon: Icon, title, value, status }: { icon: any, title: string, value: string, status?: 'on' | 'off' }) {
  return (
    <motion.div whileHover={{ x: 6 }} className="glass" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px", marginBottom: 16, cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: "var(--surface-raised)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
          <Icon size={24} />
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 4 }}>{title}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {status && (
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: status === 'on' ? "#10b981" : "#ef4444" }} />
            )}
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{value}</p>
          </div>
        </div>
      </div>
      <ChevronRight size={18} style={{ opacity: 0.2 }} />
    </motion.div>
  );
}

export default function SettingsPage() {
  return (
    <div style={{ padding: "40px 24px 140px" }}>
      <header style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, color: "var(--primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.4em", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Fingerprint size={12} /> Secure Console
        </div>
        <h1 className="font-space" style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5 }}>System</h1>
      </header>

      {/* Identity Module */}
      <div style={{ marginBottom: 44 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, padding: "0 8px" }}>
          <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.25em", color: "var(--muted)", display: "flex", alignItems: "center", gap: 8 }}>
            <Store size={14} /> Global Identity
          </p>
          <span style={{ fontSize: 10, fontWeight: 900, color: "#10b981", background: "rgba(16,185,129,0.15)", border: "1.5px solid rgba(16,185,129,0.2)", padding: "6px 14px", borderRadius: 100, display: "flex", alignItems: "center", gap: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <BadgeCheck size={14} strokeWidth={3} /> VERIFIED
          </span>
        </div>

        <div className="glass" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 28, border: "2px solid var(--border)" }}>
          {[
            { label: "Designation",   val: "PREMIUM RETAIL SOLUTIONS LTD." },
            { label: "HQ Address",      val: "CENTRAL DISTRICT, RAJASTHAN, IN" },
          ].map(({ label, val }) => (
            <div key={label}>
              <label style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)", display: "block", marginBottom: 12 }}>{label}</label>
              <div style={{ background: "var(--input-bg)", border: "1.5px solid var(--border)", borderRadius: 18, padding: "18px 20px", fontWeight: 800, fontSize: 15, letterSpacing: -0.2 }}>{val}</div>
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[["G-Token", "08ABC1234"], ["Node", "NW-001"]].map(([label, val]) => (
              <div key={label}>
                <label style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)", display: "block", marginBottom: 12 }}>{label}</label>
                <div style={{ background: "var(--input-bg)", border: "1.5px solid var(--border)", borderRadius: 18, padding: "18px 20px", fontWeight: 900, fontSize: 12, letterSpacing: "0.05em", textAlign: "center" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logic Protocols */}
      <div style={{ marginBottom: 44 }}>
        <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.25em", color: "var(--muted)", padding: "0 8px", marginBottom: 20 }}>Active Links</p>
        <ConfigRow icon={Printer}   title="Print Engine"  value="Bluetooth Ready" status="off" />
        <ConfigRow icon={HardDrive} title="Local Vault"   value="IndexedDB Active"  status="on" />
        <ConfigRow icon={Globe}     title="Network Sync"  value="Ghost Protocol"    status="on" />
        <ConfigRow icon={Cpu}       title="Core Hash"     value="SHA-512 Secure"    status="on" />
      </div>

      {/* Terminal Shutdown */}
      <motion.button 
        whileTap={{ scale: 0.98 }}
        style={{ 
          width: "100%", height: 76, borderRadius: 24, 
          background: "rgba(239,68,68,0.05)", border: "2px solid rgba(239,68,68,0.2)", 
          color: "#ef4444", fontSize: 12, fontWeight: 900, textTransform: "uppercase", 
          letterSpacing: "0.3em", display: "flex", alignItems: "center", 
          justifyContent: "center", gap: 14, transition: "all 0.3s" 
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.05)"; }}
      >
        <LogOut size={22} />
        Kill Terminal
      </motion.button>

      <footer style={{ marginTop: 44, textAlign: "center", opacity: 0.2 }}>
         <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5em" }}>v2.0.8 ENTERPRISE</p>
      </footer>
    </div>
  );
}
