'use client';

import { motion } from "framer-motion";
import { Plus, ShoppingBag, Users, ArrowUpRight, Target, Zap, ShieldCheck, PieChart, Activity, ShoppingCart, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useMemo, useState, useEffect } from "react";

const S = {
  page:    { padding: "40px 24px", paddingBottom: "140px" } as React.CSSProperties,
  header:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" } as React.CSSProperties,
  avatar:  { width: 48, height: 48, borderRadius: 16, background: "var(--surface-raised)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" } as React.CSSProperties,
  section: { marginBottom: 40 } as React.CSSProperties,
  label:   { fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.4em", color: "var(--primary)", marginBottom: 20, paddingLeft: 4, display: "flex", alignItems: "center", gap: 8 } as React.CSSProperties,
  card:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px", marginBottom: 16, cursor: "pointer" } as React.CSSProperties,
};

export default function Home() {
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Real Data Subscriptions
  const sales = useLiveQuery(() => db.sales.orderBy('timestamp').reverse().toArray());
  const productCount = useLiveQuery(() => db.products.count());

  const todayRevenue = useMemo(() => {
    if (!sales) return 0;
    const today = new Date().setHours(0,0,0,0);
    return sales
      .filter(s => s.timestamp >= today)
      .reduce((acc, s) => acc + s.total, 0);
  }, [sales]);

  const target = 50000;
  const progress = Math.min(100, (todayRevenue / target) * 100);

  useEffect(() => {
    const check = localStorage.getItem('terminal_init');
    if (check) setPermissionGranted(true);
  }, []);

  const initializeTerminal = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      localStorage.setItem('terminal_init', 'true');
      setPermissionGranted(true);
    } catch (e) {
      alert("Hardware initialization failed. Scanner requires camera access.");
    }
  };

  if (!permissionGranted) {
    return (
      <div style={{ height: "100vh", padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ padding: 48, borderRadius: 48, maxWidth: 380, border: "2px solid var(--border)" }}>
          <div style={{ width: 80, height: 80, borderRadius: 30, background: "rgba(var(--primary-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", color: "var(--primary)" }}>
            <ShieldCheck size={40} strokeWidth={2.5} />
          </div>
          <h2 className="font-space" style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, letterSpacing: -0.5 }}>Security Protocol</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 40, fontWeight: 500 }}>
            Establish a secure link between your hardware and the local vault to enable real-time asset tracking.
          </p>
          <button 
            onClick={initializeTerminal}
            className="shimmer-btn"
            style={{ width: "100%", height: 72, borderRadius: 24, color: "#fff", border: "none", fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.25em", cursor: "pointer", boxShadow: "0 15px 35px rgba(var(--primary-rgb), 0.3)" }}
          >
            Authorize System
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* Dynamic Header */}
      <header style={S.header}>
        <div>
          <h1 className="font-space" style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>Terminal-01</h1>
          <div style={{ fontSize: 10, color: "var(--primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em", marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} /> System Nominal
          </div>
        </div>
        <div style={S.avatar}>
          <LayoutGrid size={22} fill="currentColor" opacity={0.2} />
        </div>
      </header>

      {/* Main Revenue Engine */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20 }}
        style={{
          position: "relative", height: 240, borderRadius: 40, overflow: "hidden", padding: "40px", marginBottom: 40,
          background: "var(--primary)",
          backgroundImage: "linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          boxShadow: "0 25px 60px rgba(var(--primary-rgb), 0.35)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 12 }}>Gross Intake Today</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span className="font-space" style={{ fontSize: 44, fontWeight: 900, color: "#fff", letterSpacing: -2.5 }}>₹{todayRevenue.toLocaleString()}</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 20 }}>.00</span>
            </div>
          </div>
          <div style={{ background: "rgba(16,185,129,0.2)", border: "1.5px solid rgba(16,185,129,0.3)", color: "#10b981", padding: "6px 14px", borderRadius: 100, fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", gap: 6 }}>
            <ArrowUpRight size={14} strokeWidth={3} /> {progress.toFixed(1)}%
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em" }}>Quota: ₹{target.toLocaleString()}</span>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>{progress.toFixed(0)}%</span>
          </div>
          <div style={{ height: 8, background: "rgba(0,0,0,0.15)", borderRadius: 100, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.5, duration: 1.5, ease: "circOut" }}
              style={{ height: "100%", background: "#fff", borderRadius: 100, boxShadow: "0 0 15px rgba(255,255,255,0.4)" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Snapshot Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
        <div className="glass" style={{ padding: "24px", position: "relative" }}>
          <PieChart size={18} style={{ color: "var(--primary)", position: "absolute", right: 20, top: 20, opacity: 0.4 }} />
          <p style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>Assets</p>
          <p className="font-space" style={{ fontSize: 32, fontWeight: 900 }}>{productCount || 0}</p>
        </div>
        <div className="glass" style={{ padding: "24px", position: "relative" }}>
          <Activity size={18} style={{ color: "var(--accent)", position: "absolute", right: 20, top: 20, opacity: 0.4 }} />
          <p style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>Logs</p>
          <p className="font-space" style={{ fontSize: 32, fontWeight: 900 }}>{sales?.length || 0}</p>
        </div>
      </div>

      {/* Primary Navigation Hub */}
      <div style={S.section}>
        <p style={S.label}>
          <Zap size={12} fill="currentColor" /> Operations Hub
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Link href="/billing" style={{ textDecoration: "none", color: "inherit" }}>
            <motion.div whileHover={{ y: -5 }} className="glass" style={{ padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: 20, background: "rgba(var(--primary-rgb), 0.1)", border: "1.5px solid rgba(var(--primary-rgb), 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                <ShoppingCart size={28} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>Terminal</span>
            </motion.div>
          </Link>
          <Link href="/inventory" style={{ textDecoration: "none", color: "inherit" }}>
            <motion.div whileHover={{ y: -5 }} className="glass" style={{ padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: 20, background: "rgba(var(--accent-rgb), 0.1)", border: "1.5px solid rgba(var(--accent-rgb), 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                <ShoppingBag size={28} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>Registry</span>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Live Transaction Feed */}
      <div style={S.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, padding: "0 4px" }}>
          <p style={{ ...S.label, margin: 0 }}>System Activity</p>
          <span style={{ fontSize: 9, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Recent First</span>
        </div>
        {sales && sales.slice(0, 5).map((s, i) => (
          <motion.div key={s.id} whileHover={{ x: 5 }} className="glass" style={{ ...S.card, background: "var(--glass-bg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--bg)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "var(--muted)" }}>
                {i + 1}
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>Settlement</p>
                <p style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.02em" }}>
                  {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {s.items.length} Assets
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="font-space" style={{ fontWeight: 900, fontSize: 18, color: "var(--primary)" }}>₹{s.total.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
        {(!sales || sales.length === 0) && (
          <div style={{ padding: 60, textAlign: "center", opacity: 0.2 }}>
            <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.3em" }}>No Activity Logged</p>
          </div>
        )}
      </div>
    </div>
  );
}
