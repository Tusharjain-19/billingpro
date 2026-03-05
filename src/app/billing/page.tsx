'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Product, CartItem, AppSettings } from '@/lib/db';
import { 
  Search, ShoppingCart, Plus, Minus, CheckCircle2, 
  Camera, CreditCard, ChevronRight, Receipt, Trash2, 
  ArrowLeft, ArrowUpRight, IndianRupee, Printer, X, 
  ShieldCheck, Share2, Smartphone
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { PrinterHelper } from '@/lib/PrinterHelper';

export default function BillingPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const settings = useLiveQuery(() => db.settings.toCollection().first());
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
    return { subtotal, gstTotal, total: subtotal + gstTotal };
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id!, name: product.name, price: product.price, quantity: 1, gstRate: product.gstRate, isGstIncluded: product.isGstIncluded }];
    });
    setSearchTerm('');
    setIsScanning(false);
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const handleFinalize = () => {
    if (cart.length > 0) setShowPreview(true);
  };

  const handleCompleteSale = async () => {
    await db.sales.add({ timestamp: Date.now(), total: stats.total, subtotal: stats.subtotal, gstTotal: stats.gstTotal, items: cart });
    setIsCompleted(true);
  };

  const handlePrint = async () => {
    try {
      await PrinterHelper.printReceipt(settings?.storeName || "Store", cart, stats.total);
    } catch (e) {
      alert("Connect to Printer via Bluetooth first!");
    }
  };

  const resetSale = () => {
    setCart([]);
    setShowPreview(false);
    setIsCompleted(false);
  };

  return (
    <div className="fade-in" style={{ paddingBottom: 280 }}>
      {/* Search Header */}
      <section style={{ padding: "0 24px 20px" }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: "var(--app-primary)", letterSpacing: "0.2em", marginBottom: 12 }}>CAPTURE TRANSACTION</p>
        <div style={{ position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--app-fg-muted)" }} />
          <input className="app-input" placeholder="Find item manually..." style={{ paddingLeft: 48 }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <button onClick={() => setIsScanning(true)} style={{ position: "absolute", right: 10, top: 8, height: 40, width: 40, borderRadius: 12, border: "none", background: "var(--app-bg)", color: "var(--app-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Camera size={20} />
          </button>
          
          <AnimatePresence>
            {searchTerm && products && products.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass" style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 1100, border: "1px solid var(--app-border)", borderRadius: 16 }}>
                {products.map(p => (
                  <button key={p.id} onClick={() => addToCart(p)} style={{ width: "100%", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "none", background: "none", color: "var(--app-fg)", borderBottom: "1px solid var(--app-border)" }}>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</p>
                      <p style={{ fontSize: 9, color: "var(--app-fg-muted)", fontWeight: 600 }}>STOCK: {p.stock} units</p>
                    </div>
                    <span className="font-space" style={{ fontWeight: 800, fontSize: 16, color: "var(--app-primary)" }}>₹{p.price.toFixed(0)}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Itemized Cart Feed */}
      <section style={{ padding: "0 8px" }}>
        <div style={{ padding: "0 16px 12px", display: "flex", justifyContent: "space-between" }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", letterSpacing: "0.15em" }}>CART ({cart.length})</p>
        </div>
        {cart.map(item => (
            <motion.div key={item.productId} layout className="glass app-card" style={{ marginBottom: 12, padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700 }}>{item.name}</h4>
                        <p style={{ fontSize: 10, color: "var(--app-fg-muted)", fontWeight: 600 }}>TAX: {item.gstRate}% {item.isGstIncluded ? 'INC' : 'EXTRA'}</p>
                    </div>
                    <p className="font-space" style={{ fontSize: 18, fontWeight: 700 }}>₹{(item.price * item.quantity).toFixed(0)}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", background: "var(--app-bg)", borderRadius: 12, height: 36, padding: 2 }}>
                        <button onClick={() => updateQty(item.productId, -1)} style={{ width: 34, height: "100%", border: "none", background: "none", color: "var(--app-fg-muted)" }}><Minus size={14} /></button>
                        <span className="font-space" style={{ width: 34, textAlign: "center", fontWeight: 800, fontSize: 13 }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, 1)} style={{ width: 34, height: "100%", border: "none", background: "none", color: "var(--app-primary)" }}><Plus size={14} /></button>
                    </div>
                    <button onClick={() => updateQty(item.productId, -item.quantity)} style={{ background: "none", border: "none", color: "var(--app-fg-muted)", opacity: 0.3 }}><Trash2 size={18} /></button>
                </div>
            </motion.div>
        ))}

        {cart.length === 0 && (
            <div style={{ padding: 60, textAlign: "center", opacity: 0.2 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--app-surface-raised)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <ShoppingCart size={28} />
                </div>
                <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>Scan items to begin</p>
            </div>
        )}
      </section>

      {/* Bottom Floating Settlement Card */}
      <AnimatePresence>
        {cart.length > 0 && !showPreview && (
          <motion.footer 
            initial={{ y: 100, x: "-50%", opacity: 0 }} 
            animate={{ y: 0, x: "-50%", opacity: 1 }} 
            exit={{ y: 100, x: "-50%", opacity: 0 }}
            style={{ position: "absolute", bottom: 105, left: "50%", width: "calc(100% - 32px)", maxWidth: 410, zIndex: 100 }}
          >
              <div className="glass app-card" style={{ margin: 0, padding: "20px 24px", border: "2px solid var(--app-primary)", background: "var(--app-nav-bg)", boxShadow: "0 30px 60px -12px rgba(59, 130, 246, 0.4)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
                      <div>
                          <p style={{ fontSize: 9, fontWeight: 800, color: "var(--app-fg-muted)", marginBottom: 4 }}>TAX EST: ₹{stats.gstTotal.toFixed(0)}</p>
                          <p style={{ fontSize: 10, fontWeight: 800, color: "var(--app-accent)" }}>DUE: ₹{stats.total.toFixed(0)}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)" }}>TOTAL PAYABLE</p>
                          <div className="font-space" style={{ fontSize: 36, fontWeight: 900, color: "var(--app-primary)", letterSpacing: -1.5, lineHeight: 1 }}>
                             ₹{stats.total.toFixed(0)}
                          </div>
                      </div>
                  </div>
                  <button onClick={handleFinalize} className="app-btn-primary">
                    <ArrowUpRight size={20} strokeWidth={3} />
                    FINALISE BILL
                  </button>
              </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(10px)", display: "flex", flexDirection: "column", padding: "40px 24px" }}
          >
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <h2 className="font-space" style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>Bill Preview</h2>
                <button onClick={() => setShowPreview(false)} style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.1)", color: "#fff", border: "none" }}><X size={24} /></button>
             </div>

             <div className="receipt-preview" style={{ flex: 1, overflowY: "auto", marginBottom: 32 }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 900, textTransform: "uppercase" }}>{settings?.storeName}</h3>
                    <p style={{ fontSize: 10 }}>{settings?.address}</p>
                    <p style={{ fontSize: 10 }}>GSTIN: {settings?.gstNumber}</p>
                    <p style={{ fontSize: 14, marginTop: 12 }}>------------------</p>
                </div>
                {cart.map(item => (
                    <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                        <span>{item.quantity} x {item.name.slice(0, 15)}</span>
                        <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                ))}
                <div style={{ borderTop: "1px dashed #000", marginTop: 16, paddingTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span>Subtotal</span><span>₹{stats.subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span>GST Total</span><span>₹{stats.gstTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 900, marginTop: 12 }}>
                        <span>TOTAL</span><span>₹{stats.total.toFixed(0)}</span>
                    </div>
                </div>
                <div style={{ textAlign: "center", marginTop: 40 }}>
                    <p style={{ fontSize: 10 }}>THANK YOU FOR VISITING!</p>
                    <p style={{ fontSize: 8, marginTop: 4 }}>{new Date().toLocaleString()}</p>
                </div>
             </div>

             {!isCompleted ? (
               <button onClick={handleCompleteSale} className="app-btn-primary">
                 <ShieldCheck size={20} /> MARK AS PAID
               </button>
             ) : (
               <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <button onClick={handlePrint} className="app-btn-primary" style={{ background: "var(--app-accent)", boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)" }}>
                    <Printer size={20} /> CONNECT & PRINT
                  </button>
                  <button onClick={resetSale} className="app-btn-primary" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", boxShadow: "none" }}>
                    DONE
                  </button>
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {isScanning && <BarcodeScanner onScan={(sku) => { 
        db.products.where('sku').equals(sku).first().then(p => { if(p) addToCart(p); });
      }} onClose={() => setIsScanning(false)} />}
    </div>
  );
}
