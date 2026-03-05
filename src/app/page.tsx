'use client';

import { motion } from "framer-motion";
import { Plus, ShoppingBag, Users, ArrowUpRight, Target, Zap, ShieldCheck, PieChart, Activity, ShoppingCart, LayoutGrid, IndianRupee, Store, Package, History, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useMemo, useState, useEffect } from "react";

const S = {
  page:    { padding: "40px var(--page-pad)", paddingBottom: "140px" } as React.CSSProperties,
  header:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" } as React.CSSProperties,
  avatar:  { width: 44, height: 44, borderRadius: 14, background: "var(--surface-raised)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" } as React.CSSProperties,
  section: { marginBottom: 32 } as React.CSSProperties,
  label:   { fontSize: 10, fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "var(--primary)", marginBottom: 16, paddingLeft: 4, display: "flex", alignItems: "center", gap: 8 } as React.CSSProperties,
  card:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", marginBottom: 16, cursor: "pointer" } as React.CSSProperties,
};

export default function Home() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const settings = useLiveQuery(() => db.settings.toCollection().first());

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
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ padding: 40, borderRadius: 40, maxWidth: 360, border: "2px solid var(--border)" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(var(--primary-rgb), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "var(--primary)" }}>
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
          <h2 className="font-space" style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Indian Store Entry</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 32, fontWeight: 500 }}>
            Configure your local vault and printer to enable secure Indian GST billing.
          </p>
          <button 
            onClick={initializeTerminal}
            className="shimmer-btn"
            style={{ width: "100%", height: 68, borderRadius: 20, color: "#fff", border: "none", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", cursor: "pointer" }}
          >
            Start Billing Engine
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div>
          <h1 className="font-space" style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>{settings?.storeName || 'Main Counter'}</h1>
          <div style={{ fontSize: 10, color: "#10b981", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} /> System Nominal
          </div>
        </div>
        <div style={S.avatar}>
          <Store size={20} />
        </div>
      </header>

      {/* Gross Revenue Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: "relative", minHeight: 180, borderRadius: 32, overflow: "hidden", padding: "28px", marginBottom: 32,
          background: "linear-gradient(135deg, #1e1b4b 0%, var(--primary) 100%)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          boxShadow: "0 20px 50px rgba(var(--primary-rgb), 0.3)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 8 }}>Daily Sale Collection</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span className="font-space" style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: -1.5 }}>₹{todayRevenue.toLocaleString()}</span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 800, fontSize: 16 }}>.00</span>
            </div>
          </div>
          <div style={{ background: "rgba(255,184,0,0.2)", border: "1.5px solid rgba(255,184,0,0.3)", color: "#ffb800", padding: "6px 14px", borderRadius: 100, fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", gap: 6 }}>
            <ArrowUpRight size={12} strokeWidth={3} /> {progress.toFixed(1)}%
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, fontWeight: 900, textTransform: "uppercase" }}>Goal: ₹{target.toLocaleString()}</span>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 12 }}>{progress.toFixed(0)}%</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 100, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.5, duration: 1.5 }}
              style={{ height: "100%", background: "#ffb800", borderRadius: 100, boxShadow: "0 0 15px rgba(255,184,0,0.4)" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Simplified Snapshots */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
        <div className="glass" style={{ padding: "20px", position: "relative" }}>
          <Package size={16} style={{ color: "var(--primary)", position: "absolute", right: 16, top: 16 }} />
          <p style={{ fontSize: 9, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Total Items</p>
          <p className="font-space" style={{ fontSize: 26, fontWeight: 900 }}>{productCount || 0}</p>
        </div>
        <div className="glass" style={{ padding: "20px", position: "relative" }}>
          <History size={16} style={{ color: "#ffb800", position: "absolute", right: 16, top: 16 }} />
          <p style={{ fontSize: 9, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Total Bills</p>
          <p className="font-space" style={{ fontSize: 26, fontWeight: 900 }}>{sales?.length || 0}</p>
        </div>
      </div>

      {/* Indian Hub Tools */}
      <div style={S.section}>
        <p style={S.label}>
          <Zap size={10} fill="currentColor" /> MARKET TOOLS
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <Link href="/billing" style={{ textDecoration: "none", color: "inherit" }}>
            <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: "24px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(var(--primary-rgb), 0.1)", border: "1.5px solid rgba(var(--primary-rgb), 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                <IndianRupee size={20} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>Bill</span>
            </motion.div>
          </Link>
          <Link href="/inventory" style={{ textDecoration: "none", color: "inherit" }}>
            <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: "24px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,184,0,0.1)", border: "1.5px solid rgba(255,184,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffb800" }}>
                <Package size={20} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>Stock</span>
            </motion.div>
          </Link>
          <Link href="/reports" style={{ textDecoration: "none", color: "inherit" }}>
            <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: "24px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                <BarChart3 size={20} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>Reports</span>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Sale History List */}
      <div style={S.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "0 4px" }}>
          <p style={S.label}>RECENT BILLS</p>
          <span style={{ fontSize: 8, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase" }}>LATEST ENTRIES</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sales && sales.slice(0, 5).map((s, i) => (
            <motion.div key={s.id} whileHover={{ x: 4 }} className="glass" style={{ ...S.card, marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--input-bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>
                        {i + 1}
                    </div>
                    <div>
                        <p style={{ fontWeight: 800, fontSize: 15 }}>Bill Settle</p>
                        <p style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>
                            {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {s.items.length} Items
                        </p>
                    </div>
                </div>
                <p className="font-space" style={{ fontWeight: 900, fontSize: 17, color: "var(--primary)" }}>₹{s.total.toLocaleString()}</p>
            </motion.div>
            ))}
            {(!sales || sales.length === 0) && (
              <div style={{ padding: 40, textAlign: "center", border: "2px dashed var(--border)", borderRadius: 28, opacity: 0.2 }}>
                <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>No Sale Today</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
