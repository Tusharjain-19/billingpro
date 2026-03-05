'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Product, CartItem } from '@/lib/db';
import { Search, ShoppingCart, Plus, Minus, CheckCircle2, Camera, CreditCard, ChevronRight, Receipt, Trash2, ArrowLeft, ArrowUpRight, IndianRupee } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { PrinterHelper } from '@/lib/PrinterHelper';

const btnStyle = (disabled = false): React.CSSProperties => ({
  width: "100%", height: 68, borderRadius: 20, border: "none",
  background: disabled ? "var(--muted)" : "var(--primary)",
  opacity: disabled ? 0.3 : 1,
  color: "#fff", fontSize: 13, fontWeight: 900,
  textTransform: "uppercase", letterSpacing: "0.1em",
  cursor: disabled ? "not-allowed" : "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
  boxShadow: disabled ? "none" : "0 15px 35px rgba(var(--primary-rgb), 0.35)",
});

export default function BillingPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [success, setSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const products = useLiveQuery(
    () => db.products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())).toArray(),
    [searchTerm]
  );

  const stats = useMemo(() => {
    let subtotal = 0;
    let gstTotal = 0;

    cart.forEach(item => {
      const lineTotal = item.price * item.quantity;
      if (item.isGstIncluded) {
        const actual = lineTotal / (1 + item.gstRate/100);
        subtotal += actual;
        gstTotal += (lineTotal - actual);
      } else {
        subtotal += lineTotal;
        gstTotal += (lineTotal * (item.gstRate/100));
      }
    });

    const total = subtotal + gstTotal;
    return { subtotal, gstTotal, total };
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { 
        productId: product.id!, 
        name: product.name, 
        price: product.price, 
        quantity: 1, 
        gstRate: product.gstRate, 
        isGstIncluded: product.isGstIncluded 
      }];
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
    try {
      await PrinterHelper.printReceipt("BillingPro Premium", cart, stats.total);
    } catch (e) {
      alert("No printer found.");
    }
  };

  const finalize = async () => {
    if (!cart.length) return;
    await db.sales.add({ timestamp: Date.now(), total: stats.total, subtotal: stats.subtotal, gstTotal: stats.gstTotal, items: cart });
    setSuccess(true);
    setCart([]);
  };

  if (success) {
    return (
      <div style={{ padding: "40px var(--page-pad)", textAlign: "center", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: 100, height: 100, borderRadius: "50%", background: "#10b981", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 20px 40px rgba(16,185,129,0.3)" }}>
          <CheckCircle2 size={56} />
        </motion.div>
        <div>
           <h1 className="font-space" style={{ fontSize: 32, fontWeight: 900 }}>Bill Settled</h1>
           <p style={{ fontSize: 10, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 8 }}>Transaction Logged to Vault</p>
        </div>
        <div className="glass" style={{ padding: 24, paddingBottom: 32 }}>
           <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, color: "var(--muted)", marginBottom: 12 }}>
              <span>Bill Total</span><span>₹{stats.total.toLocaleString()}</span>
           </div>
           <div style={{ height: 1.5, background: "var(--border)", marginBottom: 24 }} />
           <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setSuccess(false)} style={{ flex: 1, height: 62, borderRadius: 16, background: "var(--surface-raised)", border: "1.5px solid var(--border)", fontSize: 11, fontWeight: 900, textTransform: "uppercase" }}>New Sale</button>
              <button 
                onClick={handlePrint}
                className="shimmer-btn" 
                style={{ flex: 1, height: 62, borderRadius: 16, border: "none", color: "#fff", fontSize: 11, fontWeight: 900, textTransform: "uppercase" }}>Print Receipt</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ padding: "40px var(--page-pad) 320px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, paddingRight: 60 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <IndianRupee size={12} /> Indian GST Bill
            </div>
            <h1 className="font-space" style={{ fontSize: 36, fontWeight: 900 }}>Billing</h1>
          </div>
          <motion.button onClick={() => setIsScanning(true)} style={{ width: 52, height: 52, borderRadius: 16, background: "var(--surface-raised)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
            <Camera size={24} />
          </motion.button>
        </header>

        <div style={{ position: "relative", marginBottom: 32 }}>
          <Search size={18} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", opacity: 0.5 }} />
          <input className="input-modern" style={{ paddingLeft: 52, height: 68 }} placeholder="Search stock or scan..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <AnimatePresence>
            {searchTerm && products && products.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ position: "absolute", top: "calc(100% + 12px)", left: 0, right: 0, background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 20, zIndex: 110, padding: 8, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                    {products.map(p => (
                        <button key={p.id} onClick={() => addToCart(p)} style={{ width: "100%", padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 12 }} onMouseEnter={e => e.currentTarget.style.background = "var(--input-bg)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                            <div style={{ textAlign: "left" }}>
                                <p style={{ fontWeight: 800, fontSize: 15 }}>{p.name}</p>
                                <p style={{ fontSize: 9, color: "var(--muted)", fontWeight: 900, textTransform: "uppercase" }}>Tax: {p.gstRate}% {p.isGstIncluded ? 'INC' : 'EXT'}</p>
                            </div>
                            <span className="font-space" style={{ fontWeight: 900, fontSize: 20, color: "var(--primary)" }}>₹{p.price.toLocaleString()}</span>
                        </button>
                    ))}
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "0 4px" }}>
            <p style={{ fontSize: 9, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.2em" }}>Active Cart</p>
            <p style={{ fontSize: 9, fontWeight: 900, color: "var(--primary)", background: "rgba(var(--primary-rgb), 0.1)", padding: "4px 10px", borderRadius: 6 }}>{cart.length} ITEMS</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {cart.map(item => (
                <motion.div key={item.productId} layout className="glass" style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                        <h4 style={{ fontWeight: 800, fontSize: 15 }}>{item.name}</h4>
                        <p className="font-space" style={{ fontWeight: 900, fontSize: 18 }}>₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", background: "var(--input-bg)", borderRadius: 12, border: "1.5px solid var(--border)", padding: 2 }}>
                            <button onClick={() => updateQty(item.productId, -1)} style={{ width: 36, height: 36, color: "var(--muted)" }}><Minus size={14} /></button>
                            <span className="font-space" style={{ width: 36, textAlign: "center", fontWeight: 900, fontSize: 14 }}>{item.quantity}</span>
                            <button onClick={() => updateQty(item.productId, 1)} style={{ width: 36, height: 36, color: "var(--primary)" }}><Plus size={14} /></button>
                        </div>
                        <div style={{ flex: 1, paddingLeft: 16 }}>
                             <p style={{ fontSize: 8, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase" }}>GST {item.gstRate}% {item.isGstIncluded ? 'Included' : 'Extra'}</p>
                        </div>
                        <button onClick={() => updateQty(item.productId, -item.quantity)} style={{ color: "var(--muted)", opacity: 0.3 }}><Trash2 size={16} /></button>
                    </div>
                </motion.div>
            ))}
            {!cart.length && (
                <div style={{ padding: 60, textAlign: "center", border: "2px dashed var(--border)", borderRadius: 28, opacity: 0.3 }}>
                    <ShoppingCart size={32} style={{ margin: "0 auto 12px" }} />
                    <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>Cart Empty</p>
                </div>
            )}
        </div>
      </div>

      {/* Bill Footer Panel */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} 
        style={{ position: "fixed", bottom: 105, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 400, zIndex: 100 }}
      >
          <div className="glass" style={{ padding: 24, border: "2.5px solid var(--border)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 900, color: "var(--muted)" }}>
                      <span>Subtotal</span><span>₹{stats.subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 900, color: "var(--accent)" }}>
                      <span>GST Breakdown</span><span>₹{stats.gstTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ height: 1.5, background: "var(--border)", margin: "4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: 11, fontWeight: 900, color: "var(--fg)" }}>TOTAL PAYABLE</span>
                      <div className="font-space" style={{ fontSize: 40, fontWeight: 900, color: "var(--primary)", letterSpacing: -2 }}>
                         ₹{stats.total.toFixed(2)}
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
                <ArrowUpRight size={20} />
                Finalize Bill
              </motion.button>
          </div>
      </motion.div>

      {isScanning && <BarcodeScanner onScan={handleScan} onClose={() => setIsScanning(false)} />}
    </div>
  );
}
