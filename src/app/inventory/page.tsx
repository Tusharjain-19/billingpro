'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Product } from '@/lib/db';
import { Plus, Search, Package, Barcode, Trash2, X, AlertCircle, Layers, ChevronRight, LayoutGrid, Camera } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { BarcodeScanner } from '@/components/BarcodeScanner';

const S = {
  header: { padding: "40px 24px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" } as React.CSSProperties,
  searchContainer: { padding: "0 24px 32px" } as React.CSSProperties,
  list: { padding: "0 24px 120px", display: "flex", flexDirection: "column", gap: 16 } as React.CSSProperties,
};

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAddingScanning, setIsAddingScanning] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', sku: '', price: 0, stock: 0, category: 'General' });

  const products = useLiveQuery(
    () => db.products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ).toArray(),
    [searchTerm]
  );

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    await db.products.add(newProduct as Product);
    setIsAdding(false);
    setNewProduct({ name: '', sku: '', price: 0, stock: 0, category: 'General' });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Dynamic Header */}
      <header style={S.header}>
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: 10, color: "var(--primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.4em", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
          >
            <div style={{ width: 12, height: 1.5, background: "var(--primary)" }} />
            Asset Registry
          </motion.div>
          <h1 className="font-space" style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1 }}>Inventory</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAdding(true)}
          style={{ width: 52, height: 52, borderRadius: 16, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 8px 30px rgba(var(--primary-rgb), 0.4)" }}
        >
          <Plus size={28} strokeWidth={2.5} />
        </motion.button>
      </header>

      {/* Modern Search Bar */}
      <div style={S.searchContainer}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} style={{ position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none", opacity: 0.6 }} />
            <input
              className="input-modern"
              style={{ paddingLeft: 56, height: 68, fontSize: 13, fontWeight: 600, border: "2px solid var(--border)" }}
              placeholder="Search items by name or SKU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsScanning(true)}
            className="glass"
            style={{ width: 68, height: 68, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}
          >
            <Camera size={24} />
          </motion.button>
        </div>
      </div>

      {/* Main Registry List */}
      <div style={S.list}>
        {products?.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, type: "spring", stiffness: 100 }}
            className="glass"
            style={{ padding: "24px", position: "relative", overflow: "hidden" }}
          >
            {/* Asset Icon & Details */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--surface-raised)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                  <Package size={28} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.4, marginBottom: 6 }}>{p.name}</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "var(--muted)", background: "var(--input-bg)", padding: "4px 10px", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {p.category}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Barcode size={10} /> {p.sku || 'UNTRACKED'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => p.id && db.products.delete(p.id)}
                style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", opacity: 0.3 }}
                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                onMouseLeave={e => e.currentTarget.style.opacity = "0.3"}
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Price & Stock Stats */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 20, borderTop: "1.5px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 24 }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)", marginBottom: 6 }}>Availability</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.stock < 5 ? "#ef4444" : "#10b981", boxShadow: `0 0 10px ${p.stock < 5 ? "#ef444455" : "#10b98155"}` }} />
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{p.stock} Units</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--primary)", marginBottom: 4 }}>Unit Price</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--muted)" }}>₹</span>
                  <span className="font-space" style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>{p.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {products?.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "100px 40px" }}>
            <div style={{ width: 80, height: 80, borderRadius: 30, background: "var(--surface-raised)", border: "2px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "var(--muted)" }}>
              <LayoutGrid size={32} opacity={0.3} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Vault is Empty</h3>
            <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500, lineHeight: 1.5 }}>Initialize your inventory by adding your first commercial asset.</p>
          </motion.div>
        )}
      </div>

      {/* Ultra-Premium Modal / Drawer */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", maxWidth: 440, left: "50%", x: "-50%" }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "var(--surface)",
                borderRadius: "40px 40px 0 0",
                padding: "32px 32px 48px",
                boxShadow: "0 -20px 80px rgba(0,0,0,0.5)",
                borderTop: "1px solid var(--glass-border)"
              }}
            >
              <div style={{ width: 40, height: 4, background: "var(--border)", borderRadius: 10, margin: "0 auto 32px" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
                <div>
                  <h2 className="font-space" style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>New Asset</h2>
                  <p style={{ fontSize: 10, fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.25em" }}>Registry Configuration</p>
                </div>
                <button
                  onClick={() => setIsAdding(false)}
                  style={{ width: 52, height: 52, borderRadius: 18, background: "var(--surface-raised)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <label style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)", display: "block", marginBottom: 10, marginLeft: 4 }}>Designation</label>
                  <input className="input-modern" placeholder="e.g. Mechanical Movement" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <label style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)", display: "block", marginBottom: 10, marginLeft: 4 }}>Unit Rate (₹)</label>
                    <input className="input-modern" type="number" placeholder="0.00" value={newProduct.price || ''} onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)", display: "block", marginBottom: 10, marginLeft: 4 }}>Vault Count</label>
                    <input className="input-modern" type="number" placeholder="0" value={newProduct.stock || ''} onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)", display: "block", marginBottom: 10, marginLeft: 4 }}>System Token (SKU)</label>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ position: "relative", flex: 1 }}>
                       <Barcode size={18} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", color: "var(--primary)", opacity: 0.5 }} />
                       <input className="input-modern" placeholder="Manual Override / Scan" value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} />
                    </div>
                    <button 
                      onClick={() => setIsAddingScanning(true)}
                      style={{ width: 68, height: 68, borderRadius: 20, background: "var(--surface-raised)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}
                    >
                      <Camera size={24} />
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={addProduct}
                className="shimmer-btn"
                style={{ width: "100%", height: 74, borderRadius: 24, padding: "0 32px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 40, boxShadow: "0 15px 40px rgba(var(--primary-rgb), 0.3)" }}
              >
                <span style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em" }}>Commit to Registry</span>
                <ChevronRight size={20} strokeWidth={3} />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanners */}
      {isScanning && (
        <BarcodeScanner 
          onScan={(sku) => { setSearchTerm(sku); setIsScanning(false); }} 
          onClose={() => setIsScanning(false)} 
        />
      )}
      {isAddingScanning && (
        <BarcodeScanner 
          onScan={(sku) => { setNewProduct({ ...newProduct, sku }); setIsAddingScanning(false); }} 
          onClose={() => setIsAddingScanning(false)} 
        />
      )}
    </div>
  );
}
