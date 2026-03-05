'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Product } from '@/lib/db';
import { Plus, Search, Package, Trash2, X, ChevronRight, Camera, Upload, Edit3 } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

import { BarcodeScanner } from '@/components/BarcodeScanner';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDrawerScanning, setIsDrawerScanning] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Partial<Product>>({ 
    name: '', sku: '', price: 0, stock: 0, category: 'General',
    gstRate: 18, isGstIncluded: true 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const products = useLiveQuery(
    () => db.products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ).toArray(),
    [searchTerm]
  );

  const handleSave = async () => {
    if (!activeProduct.name || !activeProduct.price) return;
    
    if (isEditing && activeProduct.id) {
      await db.products.update(activeProduct.id, activeProduct);
    } else {
      await db.products.add(activeProduct as Product);
    }
    
    closeDrawer();
  };

  const openAdd = () => {
    setActiveProduct({ name: '', sku: '', price: 0, stock: 0, category: 'General', gstRate: 18, isGstIncluded: true });
    setIsAdding(true);
    setIsEditing(false);
  };

  const openEdit = (p: Product) => {
    setActiveProduct(p);
    setIsAdding(true);
    setIsEditing(true);
  };

  const closeDrawer = () => {
    setIsAdding(false);
    setIsEditing(false);
    setActiveProduct({ name: '', sku: '', price: 0, stock: 0, category: 'General', gstRate: 18, isGstIncluded: true });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const productsToAdd: Product[] = data.map(item => ({
        name: item.Name || item.name || 'Unnamed Item',
        price: parseFloat(item.Price || item.price || 0),
        stock: parseInt(item.Stock || item.stock || 0),
        sku: String(item.Barcode || item.SKU || item.sku || Date.now() + Math.random().toString(36).substr(2, 5)),
        category: item.Category || item.category || 'Bulk',
        gstRate: parseInt(item.GST || item.gstRate || 18) as any,
        isGstIncluded: item.Inclusive !== undefined ? item.Inclusive === 'true' || item.Inclusive === true : true
      }));

      try {
        await db.products.bulkAdd(productsToAdd);
        alert(`${productsToAdd.length} items imported successfully!`);
      } catch (err) {
        console.error("Bulk add failed", err);
        alert("Import failed. Check if barcodes are unique.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="fade-in">
      {/* Search Header */}
      <section style={{ padding: "0 20px 24px" }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
            <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--app-fg-muted)" }} />
            <input 
              className="app-input" 
              placeholder="Search / Scan..." 
              style={{ paddingLeft: 48, paddingRight: 56 }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsScanning(true)}
              style={{ position: "absolute", right: 6, top: 6, height: 40, width: 40, borderRadius: 12, border: "none", background: "var(--app-surface-raised)", color: "var(--app-primary)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}
            >
                <Camera size={20} />
            </motion.button>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="app-btn-primary" style={{ flex: 1, height: 48, background: "var(--app-surface-raised)", color: "var(--app-fg)", border: "1px solid var(--app-border)" }}>
                <Upload size={18} /> Import
            </button>
            <button onClick={openAdd} className="app-btn-primary" style={{ flex: 1, height: 48 }}>
                <Plus size={18} strokeWidth={3} /> Add New
            </button>
        </div>
      </section>

      {/* Product List */}
      <section style={{ padding: "0 4px" }}>
        {products?.map((p: Product) => (
          <motion.div 
            key={p.id} 
            whileTap={{ scale: 0.98 }}
            onClick={() => openEdit(p)}
            className="glass app-card" 
            style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
          >
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--app-primary-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--app-primary)" }}>
                    <Package size={20} />
                </div>
                <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</h3>
                    <p style={{ fontSize: 11, color: "var(--app-fg-muted)", fontWeight: 500 }}>Qty: {p.stock} units · {p.category}</p>
                </div>
            </div>
            <div style={{ textAlign: "right" }}>
                <p className="font-space" style={{ fontSize: 18, fontWeight: 800, color: "var(--app-primary)" }}>₹{p.price.toFixed(0)}</p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
                   <ChevronRight size={16} color="var(--app-border)" />
                </div>
            </div>
          </motion.div>
        ))}
        {products?.length === 0 && (
          <div style={{ padding: 60, textAlign: "center", opacity: 0.3 }}>
             <Package size={48} style={{ margin: "0 auto 16px" }} />
             <p style={{ fontWeight: 800, fontSize: 12, textTransform: "uppercase" }}>Registry is empty</p>
          </div>
        )}
      </section>

      {/* Add/Edit Drawer */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
            onClick={closeDrawer}
          >
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{ position: "absolute", bottom: 0, width: "100%", maxWidth: 430, left: "50%", x: "-50%", background: "var(--app-bg)", borderRadius: "36px 36px 0 0", padding: "60px 20px 80px", borderTop: "1px solid var(--app-border)", maxHeight: "85vh", overflowY: "auto" }}
              onClick={e => e.stopPropagation()}
            >
                <div style={{ width: 40, height: 4, background: "var(--app-border)", borderRadius: 10, margin: "0 auto 20px" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 className="font-space" style={{ fontSize: 24, fontWeight: 800 }}>{isEditing ? 'Edit Stock' : 'Add Stock'}</h2>
                    {isEditing && (
                      <button onClick={() => activeProduct.id && db.products.delete(activeProduct.id).then(closeDrawer)} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", padding: "8px 12px", borderRadius: 12, fontSize: 11, fontWeight: 800 }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>ITEM DESCRIPTION</label>
                        <input className="app-input" value={activeProduct.name} onChange={e => setActiveProduct({...activeProduct, name: e.target.value})} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>PRICE (₹)</label>
                            <input className="app-input" type="number" value={activeProduct.price || ''} onChange={e => setActiveProduct({...activeProduct, price: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                            <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>STOCK QTY</label>
                            <input className="app-input" type="number" value={activeProduct.stock || ''} onChange={e => setActiveProduct({...activeProduct, stock: parseInt(e.target.value)})} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>BARCODE / SKU</label>
                        <div style={{ display: "flex", gap: 12 }}>
                            <input className="app-input" value={activeProduct.sku} onChange={e => setActiveProduct({...activeProduct, sku: e.target.value})} />
                            <button onClick={() => setIsDrawerScanning(true)} style={{ width: 54, height: 54, borderRadius: 18, background: "var(--app-bg)", color: "var(--app-primary)", border: "1px solid var(--app-border)" }}>
                                <Camera size={22} />
                            </button>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: 16, borderRadius: 20 }}>
                         <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-primary)", textTransform: "uppercase", marginBottom: 12, display: "block" }}>GST SETTINGS</label>
                         <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                            {[0, 5, 12, 18, 28].map(r => (
                                <button key={r} onClick={() => setActiveProduct({...activeProduct, gstRate: r as any})} style={{ flex: 1, height: 40, borderRadius: 10, background: activeProduct.gstRate === r ? 'var(--app-primary)' : 'var(--app-bg)', color: activeProduct.gstRate === r ? '#fff' : 'var(--app-fg)', fontWeight: 800, border: "none" }}>{r}%</button>
                            ))}
                         </div>
                         <button 
                            onClick={() => setActiveProduct({...activeProduct, isGstIncluded: !activeProduct.isGstIncluded})}
                            style={{ width: "100%", height: 48, borderRadius: 14, border: "1px solid var(--app-border)", background: "none", color: "var(--app-fg)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}
                         >
                            <span style={{ fontSize: 11, fontWeight: 700 }}>Exclusive GST Price?</span>
                            <div style={{ width: 44, height: 24, borderRadius: 20, background: !activeProduct.isGstIncluded ? 'var(--app-primary)' : 'var(--app-surface-raised)', position: "relative" }}>
                                <div style={{ position: "absolute", width: 18, height: 18, background: "#fff", borderRadius: "50%", top: 3, left: !activeProduct.isGstIncluded ? 23 : 3, transition: "0.2s" }} />
                            </div>
                         </button>
                    </div>

                    <button onClick={handleSave} className="app-btn-primary" style={{ marginTop: 24 }}>{isEditing ? 'SYNC UPDATES' : 'SAVE TO STOCK'}</button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanners */}
      {isScanning && <BarcodeScanner onScan={(sku) => { setSearchTerm(sku); setIsScanning(false); }} onClose={() => setIsScanning(false)} />}
      {isDrawerScanning && <BarcodeScanner onScan={(sku) => { setActiveProduct({ ...activeProduct, sku }); setIsDrawerScanning(false); }} onClose={() => setIsDrawerScanning(false)} />}
    </div>
  );
}
