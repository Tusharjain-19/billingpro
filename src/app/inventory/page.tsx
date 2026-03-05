'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Product } from '@/lib/db';
import { Plus, Search, Package, Barcode, Trash2, X, AlertCircle, ChevronRight, Camera, IndianRupee, Upload, FileSpreadsheet } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

import { BarcodeScanner } from '@/components/BarcodeScanner';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAddingScanning, setIsAddingScanning] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ 
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

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    await db.products.add(newProduct as Product);
    setIsAdding(false);
    setNewProduct({ name: '', sku: '', price: 0, stock: 0, category: 'General', gstRate: 18, isGstIncluded: true });
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
      {/* Native Search Component */}
      <section style={{ padding: "0 20px 24px" }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
            <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--app-fg-muted)" }} />
            <input 
              className="app-input" 
              placeholder="Search or Scan Barcode..." 
              style={{ paddingLeft: 48 }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsScanning(true)}
              style={{ position: "absolute", right: 8, top: 7, height: 40, width: 40, borderRadius: 12, border: "none", background: "var(--app-surface)", color: "var(--app-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
                <Camera size={20} />
            </motion.button>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="app-btn-primary" style={{ flex: 1, height: 48, background: "var(--app-surface)", color: "var(--app-primary)", border: "1px solid var(--app-border)" }}>
                <Upload size={18} /> Import
            </button>
            <button onClick={() => setIsAdding(true)} className="app-btn-primary" style={{ flex: 1, height: 48 }}>
                <Plus size={18} strokeWidth={3} /> Add New
            </button>
        </div>
      </section>

      {/* Product List Cards */}
      <section style={{ padding: "0 4px" }}>
        {products?.map((p: Product, idx: number) => (
          <div key={p.id} className="app-card" style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--app-primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--app-primary)" }}>
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
                   <button onClick={() => p.id && db.products.delete(p.id)} style={{ color: "var(--app-fg-muted)", border: "none", background: "none" }}><Trash2 size={16} /></button>
                   <ChevronRight size={16} color="var(--app-border)" />
                </div>
            </div>
          </div>
        ))}
        {products?.length === 0 && (
          <div style={{ padding: 60, textAlign: "center", opacity: 0.3 }}>
             <Package size={48} style={{ margin: "0 auto 16px" }} />
             <p style={{ fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>Stock registry is empty</p>
          </div>
        )}
      </section>

      {/* Add Item Bottom Drawer */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)" }}
            onClick={() => setIsAdding(false)}
          >
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{ position: "absolute", bottom: 0, width: "100%", maxWidth: 430, left: "50%", x: "-50%", background: "var(--app-bg)", borderRadius: "32px 32px 0 0", padding: "24px 20px 48px", borderTop: "1px solid var(--app-border)" }}
              onClick={e => e.stopPropagation()}
            >
                <div style={{ width: 40, height: 4, background: "var(--app-border)", borderRadius: 10, margin: "0 auto 20px" }} />
                <h2 className="font-space" style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Add Stock Item</h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="app-input-group">
                        <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>ITEM DESCRIPTION</label>
                        <input className="app-input" placeholder="e.g. Engine Oil 1L" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>PRICE (₹)</label>
                            <input className="app-input" type="number" placeholder="0" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                            <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>STOCK QTY</label>
                            <input className="app-input" type="number" placeholder="0" value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>BARCODE / SKU</label>
                        <div style={{ display: "flex", gap: 12 }}>
                            <input className="app-input" placeholder="Scan or Enter Manual" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
                            <button onClick={() => setIsAddingScanning(true)} style={{ width: 54, height: 54, borderRadius: 16, background: "var(--app-surface)", color: "var(--app-primary)", border: "1px solid var(--app-border)" }}>
                                <Camera size={22} />
                            </button>
                        </div>
                    </div>

                    <div style={{ background: "var(--app-surface)", padding: 16, borderRadius: 20 }}>
                         <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-primary)", textTransform: "uppercase", marginBottom: 12, display: "block" }}>GST SETTINGS</label>
                         <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                            {[0, 5, 12, 18, 28].map(r => (
                                <button key={r} onClick={() => setNewProduct({...newProduct, gstRate: r as any})} style={{ flex: 1, height: 40, borderRadius: 10, background: newProduct.gstRate === r ? 'var(--app-primary)' : 'var(--app-surface-raised)', color: newProduct.gstRate === r ? '#fff' : 'var(--app-fg)', fontWeight: 800, border: "none" }}>{r}%</button>
                            ))}
                         </div>
                         <button 
                            onClick={() => setNewProduct({...newProduct, isGstIncluded: !newProduct.isGstIncluded})}
                            style={{ width: "100%", height: 44, borderRadius: 12, border: "1px solid var(--app-border)", background: "none", color: "var(--app-fg)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}
                         >
                            <span style={{ fontSize: 11, fontWeight: 700 }}>Exclusive GST Price?</span>
                            <div style={{ width: 44, height: 24, borderRadius: 20, background: !newProduct.isGstIncluded ? 'var(--app-primary)' : 'var(--app-surface-raised)', position: "relative" }}>
                                <div style={{ position: "absolute", width: 18, height: 18, background: "#fff", borderRadius: "50%", top: 3, left: !newProduct.isGstIncluded ? 23 : 3, transition: "0.2s" }} />
                            </div>
                         </button>
                    </div>

                    <button onClick={addProduct} className="app-btn-primary" style={{ marginTop: 24 }}>SAVE TO STOCK</button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanners */}
      {isScanning && <BarcodeScanner onScan={(sku) => { setSearchTerm(sku); setIsScanning(false); }} onClose={() => setIsScanning(false)} />}
      {isAddingScanning && <BarcodeScanner onScan={(sku) => { setNewProduct({ ...newProduct, sku }); setIsAddingScanning(false); }} onClose={() => setIsAddingScanning(false)} />}
    </div>
  );
}
