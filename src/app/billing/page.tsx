'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Product, CartItem } from '@/lib/db';
import { Search, ShoppingCart, Plus, Minus, CheckCircle2, Camera, CreditCard, ChevronRight, Receipt, Trash2, ArrowLeft } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { PrinterHelper } from '@/lib/PrinterHelper';

const btnStyle = (disabled = false): React.CSSProperties => ({
  width: "100%", height: 76, borderRadius: 24, border: "none",
  background: disabled ? "var(--muted)" : "var(--primary)",
  opacity: disabled ? 0.3 : 1,
  color: "#fff", fontSize: 13, fontWeight: 900,
  textTransform: "uppercase", letterSpacing: "0.2em",
  cursor: disabled ? "not-allowed" : "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
  boxShadow: disabled ? "none" : "0 15px 40px rgba(var(--primary-rgb), 0.35)",
  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
});

export default function BillingPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [success, setSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const products = useLiveQuery(
    () => db.products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).toArray(),
    [searchTerm]
  );

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id!, name: product.name, price: product.price, quantity: 1 }];
    });
    setSearchTerm('');
    setIsScanning(false);
  };

  const handleScan = async (sku: string) => {
    const p = await db.products.where('sku').equals(sku).first();
    if (p) addToCart(p);
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const handlePrint = async () => {
    // We'll use a placeholder for now as we don't have the printer connected
    // but the logic is here
    try {
      await PrinterHelper.printReceipt("BillingPro Premium", cart, total);
    } catch (e) {
      console.error("Print failed", e);
      alert("No printer connected via Bluetooth.");
    }
  };

  const finalize = async () => {
    if (!cart.length) return;
    await db.sales.add({ timestamp: Date.now(), total, items: cart });
    setSuccess(true);
    setCart([]);
  };

  // ── Success Screen ──────────────────────────────────
  if (success) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 32, textAlign: "center", gap: 40 }}>
        <motion.div
          initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          style={{ width: 140, height: 140, borderRadius: 48, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 25px 60px rgba(16,185,129,0.4)", position: "relative" }}
        >
          <div style={{ position: "absolute", inset: -15, border: "2px solid #10b981", borderRadius: 60, opacity: 0.2 }} />
          <CheckCircle2 size={80} strokeWidth={2.5} />
        </motion.div>
        
        <div>
          <h1 className="font-space" style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2.5, lineHeight: 1 }}>AUTHENTICATED</h1>
          <p style={{ fontSize: 11, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.4em", marginTop: 12 }}>Transaction Securely Logged</p>
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass" style={{ width: "100%", padding: "32px", border: "2px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>Total Settlement</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "var(--muted)" }}>₹</span>
                <span className="font-space" style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1 }}>{total.toLocaleString()}</span>
            </div>
          </div>
          <div style={{ height: 1.5, background: "var(--border)", marginBottom: 24 }} />
          <div style={{ display: "flex", gap: 16 }}>
            <button onClick={() => setSuccess(false)} style={{ flex: 1, height: 68, borderRadius: 20, background: "var(--surface-raised)", border: "1.5px solid var(--border)", color: "var(--fg)", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>Next Sale</button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
              className="shimmer-btn" 
              style={{ flex: 1, height: 68, borderRadius: 20, border: "none", color: "#fff", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer" }}
            >
              Print Slip
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ padding: "40px 24px 300px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.4em", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Receipt size={12} /> Live POS
            </div>
            <h1 className="font-space" style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5 }}>Billing</h1>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsScanning(true)}
              className="glass"
              style={{ width: 56, height: 56, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}
            >
              <Camera size={24} />
            </motion.button>
            <div className="glass" style={{ height: 56, padding: "0 20px", borderRadius: 18, display: "flex", alignItems: "center", gap: 12 }}>
              <ShoppingCart size={20} style={{ color: "var(--muted)" }} />
              <span className="font-space" style={{ fontWeight: 800, fontSize: 18 }}>{cart.length}</span>
            </div>
          </div>
        </div>

        {/* Global Search */}
        <div style={{ position: "relative", marginBottom: 40 }}>
          <Search size={20} style={{ position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", opacity: 0.5 }} />
          <input
            className="input-modern"
            style={{ paddingLeft: 64, height: 72, fontSize: 14, border: "2.5px solid var(--border)" }}
            placeholder="Add assets by name/identifier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <AnimatePresence>
            {searchTerm && products && products.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ position: "absolute", top: "calc(100% + 12px)", left: 0, right: 0, background: "var(--surface-raised)", border: "1.5px solid var(--border)", borderRadius: 24, zIndex: 110, maxHeight: 320, overflowY: "auto", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", padding: 8 }}
              >
                {products.map(p => (
                  <button key={p.id} onClick={() => addToCart(p)} style={{ width: "100%", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", color: "var(--fg)", cursor: "pointer", borderRadius: 18, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--glass-bg)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <div style={{ textAlign: "left" }}>
                      <span style={{ display: "block", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{p.name}</span>
                      <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Stock: {p.stock}</span>
                    </div>
                    <span className="font-space" style={{ color: "var(--primary)", fontWeight: 800, fontSize: 20 }}>₹{p.price}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cart View */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, padding: "0 8px" }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.25em", color: "var(--muted)" }}>Active Batch</p>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", background: "var(--surface-raised)", padding: "4px 12px", borderRadius: 100, border: "1px solid var(--border)" }}>{cart.length} LINE ITEMS</span>
          </div>
          <AnimatePresence mode="popLayout">
            {cart.map(item => (
              <motion.div key={item.productId} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass" style={{ padding: "24px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <h4 style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.4 }}>{item.name}</h4>
                  <p className="font-space" style={{ fontWeight: 800, fontSize: 20 }}>₹{item.price * item.quantity}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", background: "var(--surface-raised)", borderRadius: 16, border: "1.5px solid var(--border)", padding: 4 }}>
                    <button onClick={() => updateQty(item.productId, -1)} style={{ width: 40, height: 40, color: "var(--fg)", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={16} strokeWidth={3} /></button>
                    <span className="font-space" style={{ width: 44, textAlign: "center", fontWeight: 800, fontSize: 16 }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, 1)} style={{ width: 40, height: 40, color: "var(--fg)", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={16} strokeWidth={3} /></button>
                  </div>
                  <div style={{ flex: 1, paddingLeft: 16 }}>
                     <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Base: ₹{item.price}</p>
                  </div>
                  <button onClick={() => updateQty(item.productId, -item.quantity)} style={{ color: "var(--muted)", opacity: 0.3 }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.3"}><Trash2 size={18} /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!cart.length && (
            <div style={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed var(--border)", borderRadius: 40, opacity: 0.25 }}>
               <ShoppingCart size={44} strokeWidth={1} style={{ marginBottom: 16 }} />
               <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.3em" }}>Awaiting Input</p>
            </div>
          )}
        </div>
      </div>

      {/* High-Impact Settlement Panel */}
      <motion.div 
        initial={{ y: 100 }} animate={{ y: 0 }}
        style={{ position: "fixed", bottom: 110, left: "50%", x: "-50%", width: "calc(100% - 40px)", maxWidth: 400, zIndex: 120 }}
      >
        <div style={{ background: "var(--surface)", border: "2px solid var(--border)", borderRadius: 44, padding: "32px", boxShadow: "0 -40px 100px rgba(0,0,0,0.6)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>
              <span>Valuation</span><span style={{ color: "var(--fg)" }}>₹{subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>
              <span>Tax (GST 18%)</span><span style={{ color: "var(--fg)" }}>₹{tax.toLocaleString()}</span>
            </div>
            <div style={{ height: 1.5, background: "var(--border)", margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.3em", color: "var(--primary)" }}>TOTAL</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "var(--muted)" }}>₹</span>
                  <span className="font-space" style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2 }}>{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.96 }}
            disabled={!cart.length} 
            onClick={finalize} 
            className={cart.length ? "shimmer-btn" : ""}
            style={btnStyle(!cart.length)}
          >
            <CreditCard size={22} />
            Authorize Settle
          </motion.button>
        </div>
      </motion.div>

      {isScanning && <BarcodeScanner onScan={handleScan} onClose={() => setIsScanning(false)} />}
    </div>
  );
}
