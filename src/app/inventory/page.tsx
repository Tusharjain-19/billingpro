'use client';

import { Plus, Search, Package, Barcode, Trash2, X, AlertCircle, Layers, ChevronRight, LayoutGrid, Camera, Percent, IndianRupee, Upload, FileSpreadsheet } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { db, Product } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

import { BarcodeScanner } from '@/components/BarcodeScanner';

const S = {
  header: { padding: "40px var(--page-pad) 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" } as React.CSSProperties,
  searchContainer: { padding: "0 var(--page-pad) 32px" } as React.CSSProperties,
  list: { padding: "0 var(--page-pad) 120px", display: "flex", flexDirection: "column", gap: 16 } as React.CSSProperties,
};

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
    <div style={{ position: "relative" }}>
      {/* Dynamic Header */}
      <header style={S.header}>
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: 10, color: "var(--primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.25em", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
          >
            <div style={{ width: 12, height: 1.5, background: "var(--primary)" }} />
            STOCK REGISTRY
          </motion.div>
          <h1 className="font-space" style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1.2, lineHeight: 1 }}>Inventory</h1>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="glass"
              style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}
            >
              <Upload size={20} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAdding(true)}
              style={{ width: 44, height: 44, borderRadius: 14, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 8px 30px rgba(var(--primary-rgb), 0.35)" }}
            >
              <Plus size={22} strokeWidth={2.5} />
            </motion.button>
        </div>
      </header>

      {/* Modern Search Bar */}
      <div style={S.searchContainer}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none", opacity: 0.6 }} />
            <input
              className="input-modern"
              style={{ paddingLeft: 48, height: 62, fontSize: 13, fontWeight: 600, border: "1.5px solid var(--border)" }}
              placeholder="Search by name or barcode..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsScanning(true)}
            className="glass"
            style={{ width: 62, height: 62, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}
          >
            <Camera size={22} />
          </motion.button>
        </div>
      </div>

      {/* Main Registry List */}
      <div style={S.list}>
        {products?.map((p: Product, idx: number) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, type: "spring", stiffness: 100 }}
            className="glass"
            style={{ padding: "24px", position: "relative", overflow: "hidden" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--surface-raised)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                  <Package size={24} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.2, marginBottom: 4 }}>{p.name}</h3>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 900, color: "var(--muted)", background: "var(--input-bg)", padding: "3px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      GST {p.gstRate}% {p.isGstIncluded ? '(INC)' : '(EXT)'}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "var(--accent)", display: "flex", alignItems: "center", gap: 2 }}>
                      <Barcode size={10} /> {p.sku || 'SERIALIZED'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => p.id && db.products.delete(p.id)}
                style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", opacity: 0.2 }}
                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                onMouseLeave={e => e.currentTarget.style.opacity = "0.2"}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 16, borderTop: "1.5px solid var(--border)" }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 4 }}>In Stock</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.stock < 10 ? "#ef4444" : "#10b981" }} />
                  <span style={{ fontWeight: 800, fontSize: 13 }}>{p.stock} Units</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--primary)", marginBottom: 2 }}>Rate (₹)</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                  <span className="font-space" style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>{p.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {products?.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 40px", opacity: 0.5 }}>
            <LayoutGrid size={48} style={{ margin: "0 auto 20px", opacity: 0.2 }} />
            <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>No Item Found</h3>
            <p style={{ fontSize: 11, fontWeight: 500 }}>Create new entry to start tracking.</p>
          </div>
        )}
      </div>

      {/* Adding Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", maxWidth: 440, left: "50%", x: "-50%" }}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "var(--surface)",
                borderRadius: "32px 32px 0 0",
                padding: "24px 20px 40px",
                boxShadow: "0 -20px 80px rgba(0,0,0,0.5)",
                borderTop: "1px solid var(--border)",
                maxHeight: "90vh", overflowY: "auto"
              }}
            >
              <div style={{ width: 40, height: 4, background: "var(--border)", borderRadius: 10, margin: "0 auto 24px" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
                <div>
                  <h2 className="font-space" style={{ fontSize: 24, fontWeight: 900 }}>Add New Item</h2>
                  <p style={{ fontSize: 9, fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.2em" }}>Stock Registry Update</p>
                </div>
                <button onClick={() => setIsAdding(false)} style={{ width: 40, height: 40, borderRadius: 12, background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 8, paddingLeft: 4 }}>Description / Item Name</label>
                  <input className="input-modern" placeholder="e.g. Engine Oil 1L" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 8, paddingLeft: 4 }}>Price (₹)</label>
                    <div style={{ position: "relative" }}>
                        <IndianRupee size={14} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                        <input className="input-modern" type="number" placeholder="0.00" value={newProduct.price || ''} onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 8, paddingLeft: 4 }}>Stock Qty</label>
                    <input className="input-modern" type="number" placeholder="0" value={newProduct.stock || ''} onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })} />
                  </div>
                </div>

                <div style={{ padding: 16, borderRadius: 20, background: "var(--input-bg)", border: "1.5px solid var(--border)" }}>
                     <label style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", color: "var(--primary)", display: "block", marginBottom: 12 }}>GST Calculation</label>
                     <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                        {[0, 5, 12, 18, 28].map(rate => (
                            <button 
                                key={rate} 
                                onClick={() => setNewProduct({...newProduct, gstRate: rate as any})}
                                style={{
                                    flex: 1, minWidth: "45px", height: 36, borderRadius: 10, fontSize: 11, fontWeight: 900,
                                    background: newProduct.gstRate === rate ? "var(--primary)" : "var(--surface-raised)",
                                    color: newProduct.gstRate === rate ? "#fff" : "var(--fg)",
                                    border: "1px solid var(--border)",
                                    transition: "0.2s"
                                }}
                            >
                                {rate}%
                            </button>
                        ))}
                     </div>
                     <button 
                        onClick={() => setNewProduct({...newProduct, isGstIncluded: !newProduct.isGstIncluded})}
                        style={{ width: "100%", height: 44, borderRadius: 12, background: "var(--surface)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}
                     >
                        <span style={{ fontSize: 10, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase" }}>GST Included in Price?</span>
                        <div style={{ width: 44, height: 24, borderRadius: 20, background: newProduct.isGstIncluded ? "#10b981" : "var(--border)", position: "relative", transition: "0.3s" }}>
                            <div style={{ position: "absolute", width: 18, height: 18, background: "#fff", borderRadius: "50%", top: 3, left: newProduct.isGstIncluded ? 23 : 3, transition: "0.3s" }} />
                        </div>
                     </button>
                </div>

                <div>
                  <label style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 8, paddingLeft: 4 }}>Code / Barcode</label>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ position: "relative", flex: 1 }}>
                       <input className="input-modern" placeholder="Automatic/Manual" value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} />
                    </div>
                    <button 
                      onClick={() => setIsAddingScanning(true)}
                      style={{ width: 62, height: 62, borderRadius: 18, background: "var(--surface-raised)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}
                    >
                      <Camera size={22} />
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={addProduct}
                className="shimmer-btn"
                style={{ width: "100%", height: 68, borderRadius: 20, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", marginTop: 32 }}
              >
                <span style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>Save to Stock</span>
                <ChevronRight size={18} />
              </motion.button>
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
