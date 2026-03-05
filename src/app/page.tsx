'use client';

import { motion } from "framer-motion";
import { 
  Plus, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap, 
  IndianRupee, 
  Package, 
  History, 
  BarChart3,
  TrendingUp,
  Receipt,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useMemo, useState, useEffect } from "react";

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
      // Try to get camera permission, but don't block if it fails
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ video: true });
      }
    } catch (e) {
      console.warn("Camera access not available. Scanner features may be limited.");
    } finally {
      // Always allow the user to proceed to the app
      localStorage.setItem('terminal_init', 'true');
      setPermissionGranted(true);
    }
  };

  if (!permissionGranted) {
    return (
      <div style={{ height: "100%", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="app-card" style={{ maxWidth: 320, padding: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 24, background: "var(--app-primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "var(--app-primary)" }}>
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
          <h2 className="font-space" style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Secure Vault</h2>
          <p style={{ fontSize: 13, color: "var(--app-fg-muted)", lineHeight: 1.6, marginBottom: 32 }}>
            Enable hardware access to start generating GST compliant bills for your store.
          </p>
          <button onClick={initializeTerminal} className="app-btn-primary">
            Start Billing Engine
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: "0 0 40px" }}>
      {/* Native Snapshot Header Component */}
      <section style={{ padding: "0 24px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
                <p style={{ fontSize: 10, fontWeight: 800, color: "var(--app-primary)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Current Session</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span className="font-space" style={{ fontSize: 44, fontWeight: 900, letterSpacing: -1 }}>₹{todayRevenue.toLocaleString()}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "var(--app-fg-muted)" }}>.00</span>
                </div>
            </div>
            <div style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", padding: "6px 12px", borderRadius: 12, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
                <TrendingUp size={14} /> +{progress.toFixed(1)}%
            </div>
        </div>
      </section>

      {/* Target Progress Card */}
      <div className="app-card" style={{ background: "var(--app-primary)", color: "#fff", border: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>Bill Goal: ₹{target.toLocaleString()}</span>
            <span style={{ fontSize: 12, fontWeight: 900 }}>{progress.toFixed(0)}%</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 10, overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: "#fff", borderRadius: 10 }} />
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, padding: "0 4px" }}>
        <div className="glass app-card" style={{ margin: "8px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ color: "var(--app-primary)" }}><Package size={18} /></div>
                <span style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", textTransform: "uppercase" }}>Stock</span>
            </div>
            <p className="font-space" style={{ fontSize: 24, fontWeight: 800 }}>{productCount || 0}</p>
        </div>
        <div className="glass app-card" style={{ margin: "8px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ color: "#f59e0b" }}><History size={18} /></div>
                <span style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", textTransform: "uppercase" }}>Bills</span>
            </div>
            <p className="font-space" style={{ fontSize: 24, fontWeight: 800 }}>{sales?.length || 0}</p>
        </div>
      </div>

      {/* Quick Launch Tools */}
      <section style={{ marginTop: 24 }}>
        <p style={{ margin: "0 24px 16px", fontSize: 10, fontWeight: 800, color: "var(--app-primary)", letterSpacing: "0.15em" }}>MARKET TOOLS</p>
        <div style={{ padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Link href="/billing" style={{ textDecoration: 'none' }}>
                <motion.div whileTap={{ scale: 0.95 }} className="glass" style={{ borderRadius: 22, padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--app-primary-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--app-primary)" }}>
                        <Receipt size={20} />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em" }}>QUICK BILL</span>
                </motion.div>
            </Link>
            <Link href="/inventory" style={{ textDecoration: 'none' }}>
                <motion.div whileTap={{ scale: 0.95 }} className="glass" style={{ borderRadius: 22, padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                        <Package size={20} />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em" }}>STOCK ROOM</span>
                </motion.div>
            </Link>
            <Link href="/reports" style={{ textDecoration: 'none' }}>
                <motion.div whileTap={{ scale: 0.95 }} className="glass" style={{ borderRadius: 22, padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                        <BarChart3 size={20} />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em" }}>ANALYTICS</span>
                </motion.div>
            </Link>
        </div>
      </section>

      {/* Recent History Feed */}
      <section style={{ marginTop: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 24px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: "var(--app-primary)", letterSpacing: "0.15em" }}>RECENT TRANSACTIONS</p>
            <Link href="/reports" style={{ textDecoration: 'none', fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)" }}>SEE ALL</Link>
        </div>
        <div style={{ padding: "0 8px" }}>
            {sales && sales.slice(0, 5).map((s, i) => (
                <div key={s.id} className="glass app-card" style={{ padding: "16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--app-primary-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--app-primary)" }}>
                            <IndianRupee size={18} />
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700 }}>#{s.id?.toString().slice(-4)} BILL SETTLE</p>
                            <p style={{ fontSize: 10, color: "var(--app-fg-muted)", fontWeight: 500 }}>{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                    <p className="font-space" style={{ fontSize: 18, fontWeight: 800, color: "var(--app-primary)" }}>₹{s.total.toFixed(0)}</p>
                </div>
            ))}
            {(!sales || sales.length === 0) && (
              <div style={{ padding: 40, textAlign: "center", opacity: 0.3 }}>
                <History size={32} style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>Capture your first bill today</p>
              </div>
            )}
        </div>
      </section>
    </div>
  );
}
