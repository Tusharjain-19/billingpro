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
    if (!activeProduct.name) {
      alert("Please enter a product name");
      return;
    }
    if (activeProduct.price === undefined || activeProduct.price < 0) {
      alert("Please enter a valid price");
      return;
    }
    
    const productData = {
      ...activeProduct,
      price: Number(activeProduct.price),
      stock: Number(activeProduct.stock || 0)
    };
    
    if (isEditing && activeProduct.id) {
      await db.products.update(activeProduct.id, productData);
    } else {
      await db.products.add(productData as Product);
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
    <div className="fade-in" style={{ paddingBottom: 100 }}>
      {/* Search Header */}
      <section style={{ padding: "12px 16px 20px" }}>
        <div style={{ position: "relative", marginBottom: 16 }}>
            <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--app-fg-muted)" }} />
            <input 
              className="app-input" 
              placeholder="Search by name or barcode..." 
              style={{ paddingLeft: 48, paddingRight: 56, borderRadius: 20, height: 56 }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsScanning(true)}
              style={{ position: "absolute", right: 8, top: 8, height: 40, width: 40, borderRadius: 14, border: "none", background: "var(--app-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}
            >
                <Camera size={20} />
            </motion.button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()} 
              className="glass"
              style={{ 
                height: 54, 
                borderRadius: 18, 
                background: "var(--app-surface-raised)", 
                color: "var(--app-fg)", 
                border: "1px solid var(--app-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 700
              }}
            >
                <Upload size={18} color="var(--app-primary)" /> Bulk Import
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={openAdd} 
              className="app-btn-primary" 
              style={{ height: 54, borderRadius: 18, fontSize: 13 }}
            >
                <Plus size={18} strokeWidth={3} /> Add Product
            </motion.button>
        </div>
      </section>

      {/* Product List */}
      <section style={{ padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "0 4px" }}>
            <h2 style={{ fontSize: 10, fontWeight: 800, color: "var(--app-primary)", letterSpacing: "0.15em", textTransform: "uppercase" }}>MASTER STOCK ({products?.length || 0})</h2>
            <div style={{ width: 40, height: 2, background: "var(--app-border)", borderRadius: 10 }} />
        </div>
        
        {products?.map((p: Product) => (
          <motion.div 
            key={p.id} 
            whileTap={{ scale: 0.98 }}
            onClick={() => openEdit(p)}
            className="glass" 
            style={{ 
              marginBottom: 12, 
              padding: 16,
              borderRadius: 24,
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              cursor: "pointer",
              border: "1px solid var(--app-border)"
            }}
          >
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "var(--app-primary-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--app-primary)" }}>
                    <Package size={24} />
                </div>
                <div>
                    <p style={{ fontSize: 9, fontWeight: 800, color: "var(--app-primary)", marginBottom: 2 }}>PRODUCT</p>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{p.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div>
                            <p style={{ fontSize: 8, fontWeight: 800, color: "var(--app-fg-muted)" }}>CATEGORY</p>
                            <span style={{ fontSize: 11, fontWeight: 700 }}>{p.category}</span>
                        </div>
                        <div style={{ width: 1, height: 16, background: "var(--app-border)" }} />
                        <div>
                            <p style={{ fontSize: 8, fontWeight: 800, color: "var(--app-fg-muted)" }}>STOCK</p>
                            <span style={{ fontSize: 11, color: p.stock < 10 ? "#ef4444" : "var(--app-accent)", fontWeight: 800 }}>
                                {p.stock} units
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ textAlign: "right", background: "var(--app-surface-raised)", padding: "10px 14px", borderRadius: 16, border: "1px solid var(--app-border)" }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: "var(--app-fg-muted)", marginBottom: 2 }}>UNIT PRICE</p>
                <p className="font-space" style={{ fontSize: 20, fontWeight: 900, color: "var(--app-primary)" }}>₹{p.price.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
        
        {products?.length === 0 && (
          <div style={{ padding: "80px 20px", textAlign: "center", opacity: 0.3 }}>
             <Package size={64} strokeWidth={1} style={{ margin: "0 auto 20px", color: "var(--app-primary)" }} />
             <p style={{ fontWeight: 800, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Empty Stock Room</p>
             <p style={{ fontSize: 12, marginTop: 8 }}>Add your first product to begin billing</p>
          </div>
        )}
      </section>

      {/* Add/Edit Drawer */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            key="drawer-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 4000 }}
          >
            {/* Backdrop */}
            <div
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
              onClick={closeDrawer}
            />
            {/* Drawer Panel */}
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{ 
                position: "absolute", 
                bottom: 0, 
                width: "100%", 
                maxWidth: 430, 
                left: "50%", 
                x: "-50%", 
                background: "var(--app-bg)", 
                borderRadius: "32px 32px 0 0", 
                padding: "24px 24px 40px", 
                borderTop: "1px solid var(--app-border)", 
                maxHeight: "92vh", 
                overflowY: "auto",
                zIndex: 4001,
                boxShadow: "0 -20px 50px rgba(0,0,0,0.5)"
              }}
              onClick={e => e.stopPropagation()}
            >
                <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 10, margin: "0 auto 20px" }} />
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                    <div>
                        <h2 className="font-space" style={{ fontSize: 24, fontWeight: 900 }}>{isEditing ? 'Edit Item' : 'New Product'}</h2>
                        <p style={{ fontSize: 12, color: "var(--app-fg-muted)", fontWeight: 500 }}>{isEditing ? 'Modify stock details' : 'Add to inventory master'}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        {isEditing && (
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                if(confirm("Delete this product?")) {
                                    activeProduct.id && db.products.delete(activeProduct.id).then(closeDrawer);
                                }
                            }} 
                            style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            <Trash2 size={20} />
                        </motion.button>
                        )}
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={closeDrawer} 
                            style={{ width: 44, height: 44, borderRadius: 14, background: "var(--app-surface-raised)", border: "none", color: "var(--app-fg)", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            <X size={20} />
                        </motion.button>
                    </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-primary)", textTransform: "uppercase", marginBottom: 12, display: "block", letterSpacing: "0.1em" }}>Product Name</label>
                        <input 
                          className="app-input" 
                          placeholder="What is the item called?"
                          value={activeProduct.name} 
                          onChange={e => setActiveProduct({...activeProduct, name: e.target.value})} 
                          style={{ height: 60, fontSize: 16, fontWeight: 600 }}
                        />
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-primary)", textTransform: "uppercase", marginBottom: 12, display: "block", letterSpacing: "0.1em" }}>Selling Price</label>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontWeight: 800, color: "var(--app-fg-muted)" }}>₹</span>
                                <input 
                                  className="app-input" 
                                  type="number" 
                                  style={{ paddingLeft: 32 }}
                                  value={activeProduct.price || ''} 
                                  onChange={e => setActiveProduct({...activeProduct, price: parseFloat(e.target.value)})} 
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-primary)", textTransform: "uppercase", marginBottom: 12, display: "block", letterSpacing: "0.1em" }}>Initial Stock</label>
                            <input 
                              className="app-input" 
                              type="number" 
                              placeholder="0"
                              value={activeProduct.stock || ''} 
                              onChange={e => setActiveProduct({...activeProduct, stock: parseInt(e.target.value)})} 
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-primary)", textTransform: "uppercase", marginBottom: 12, display: "block", letterSpacing: "0.1em" }}>Barcode / Unique SKU</label>
                        <div style={{ display: "flex", gap: 12 }}>
                            <input 
                              className="app-input" 
                              placeholder="Scan or type code"
                              value={activeProduct.sku} 
                              onChange={e => setActiveProduct({...activeProduct, sku: e.target.value})} 
                            />
                            <motion.button 
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setIsDrawerScanning(true)} 
                              style={{ width: 56, height: 56, borderRadius: 16, background: "var(--app-primary-glow)", color: "var(--app-primary)", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                                <Camera size={24} />
                            </motion.button>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: 20, borderRadius: 24, border: "1px solid var(--app-border)" }}>
                         <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-primary)", textTransform: "uppercase", marginBottom: 16, display: "block" }}>Taxation (GST)</label>
                         <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 20 }}>
                            {[0, 5, 12, 18, 28].map(r => (
                                <button 
                                  key={r} 
                                  onClick={() => setActiveProduct({...activeProduct, gstRate: r as any})} 
                                  style={{ 
                                    height: 44, 
                                    borderRadius: 12, 
                                    background: activeProduct.gstRate === r ? 'var(--app-primary)' : 'var(--app-surface-raised)', 
                                    color: activeProduct.gstRate === r ? '#fff' : 'var(--app-fg)', 
                                    fontWeight: 800, 
                                    border: "none",
                                    fontSize: 12,
                                    transition: "0.2s"
                                  }}
                                >
                                  {r}%
                                </button>
                            ))}
                         </div>
                         <motion.button 
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveProduct({...activeProduct, isGstIncluded: !activeProduct.isGstIncluded})}
                            style={{ 
                                width: "100%", 
                                height: 54, 
                                borderRadius: 16, 
                                border: "1px solid var(--app-border)", 
                                background: activeProduct.isGstIncluded ? "rgba(16,185,129,0.05)" : "none", 
                                color: "var(--app-fg)", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "space-between", 
                                padding: "0 16px" 
                            }}
                         >
                            <span style={{ fontSize: 13, fontWeight: 700 }}>Tax already included in price?</span>
                            <div style={{ width: 48, height: 26, borderRadius: 20, background: activeProduct.isGstIncluded ? 'var(--app-accent)' : 'var(--app-surface-raised)', position: "relative", transition: "0.3s" }}>
                                <div style={{ position: "absolute", width: 20, height: 20, background: "#fff", borderRadius: "50%", top: 3, left: activeProduct.isGstIncluded ? 25 : 3, transition: "0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }} />
                            </div>
                         </motion.button>
                    </div>

                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave} 
                      className="app-btn-primary" 
                      style={{ height: 64, borderRadius: 20, marginTop: 8 }}
                    >
                      {isEditing ? 'UPDATE PRODUCT' : 'ADD TO STOCK'}
                    </motion.button>
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
