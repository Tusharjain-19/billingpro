'use client';

import { Store, Printer, Bell, Shield, LogOut, ChevronRight, BadgeCheck, Globe, Smartphone, Database, Fingerprint, Cpu, HardDrive, Edit3, MapPin, Phone, Hash, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { db, AppSettings } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { PrinterHelper } from '@/lib/PrinterHelper';

function ConfigRow({ icon: Icon, title, value, status, onClick }: { icon: any, title: string, value: string, status?: 'on' | 'off', onClick?: () => void }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01, x: 4 }} 
      onClick={onClick}
      className="glass" 
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", marginBottom: 16, cursor: onClick ? "pointer" : "default" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--surface-raised)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: status === 'on' ? "var(--primary)" : "var(--muted)" }}>
          <Icon size={20} />
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{title}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {status && (
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: status === 'on' ? "#10b981" : "#ef4444" }} />
            )}
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{value}</p>
          </div>
        </div>
      </div>
      {onClick && <ChevronRight size={16} style={{ opacity: 0.3 }} />}
    </motion.div>
  );
}

export default function SettingsPage() {
  const currentSettings = useLiveQuery(() => db.settings.toCollection().first());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AppSettings>({
    storeName: 'Prem Auto & Spares',
    gstNumber: '08ABC1234D1Z5',
    address: 'NH-8, Transport Nagar, Jaipur, RJ',
    phone: '+91 98765 43210'
  });

  useEffect(() => {
    if (currentSettings) {
      setFormData(currentSettings);
    }
  }, [currentSettings]);

  const saveSettings = async () => {
    if (currentSettings?.id) {
      await db.settings.update(currentSettings.id, formData);
    } else {
      await db.settings.add(formData);
    }
    setIsEditing(false);
  };

  const handleTestPrint = async () => {
    try {
      await PrinterHelper.printReceipt(formData.storeName, [], 0, true);
    } catch (e) {
      alert("Printer connection failed.");
    }
  };

  return (
    <div style={{ padding: "40px var(--page-pad) 140px" }}>
      <header style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, color: "var(--primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Shield size={12} /> Indian Store Config
        </div>
        <h1 className="font-space" style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>Settings</h1>
      </header>

      {/* Identity Module */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "0 4px" }}>
          <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)", display: "flex", alignItems: "center", gap: 8 }}>
            <Store size={14} /> Shop Info
          </p>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsEditing(true)}
            style={{ color: "var(--primary)", fontSize: 10, fontWeight: 900, background: "rgba(var(--primary-rgb), 0.1)", padding: "6px 14px", borderRadius: 100, border: "1px solid rgba(var(--primary-rgb), 0.2)" }}
          >
            EDIT DATA
          </motion.button>
        </div>

        <div className="glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
             <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--surface-raised)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                <BadgeCheck size={20} />
             </div>
             <div>
                <p style={{ fontSize: 14, fontWeight: 900, letterSpacing: -0.2 }}>{formData.storeName}</p>
                <p style={{ fontSize: 9, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginTop: 4 }}>Registration Ready</p>
             </div>
          </div>
          <div style={{ padding: 16, borderRadius: 16, background: "var(--input-bg)", border: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
             <div>
                <label style={{ fontSize: 8, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>GSTIN</label>
                <p style={{ fontSize: 11, fontWeight: 900, color: "var(--primary)" }}>{formData.gstNumber}</p>
             </div>
             <div>
                <label style={{ fontSize: 8, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Contact</label>
                <p style={{ fontSize: 11, fontWeight: 900 }}>{formData.phone}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Logic Protocols */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)", padding: "0 4px", marginBottom: 16 }}>Printer & Hardware</p>
        <ConfigRow 
          icon={Printer}   
          title="Thermal Printer"  
          value="Check Bluetooth" 
          status="off" 
          onClick={handleTestPrint}
        />
        <ConfigRow icon={HardDrive} title="Storage"   value="Local DB Secure"  status="on" />
        <ConfigRow icon={Cpu}       title="Process Code" value="v3.1 Stable"    status="on" />
      </div>

      {/* Terminal Shutdown */}
      <button 
        style={{ 
          width: "100%", height: 68, borderRadius: 20, 
          background: "rgba(239,68,68,0.05)", border: "1.5px solid rgba(239,68,68,0.15)", 
          color: "#ef4444", fontSize: 11, fontWeight: 900, textTransform: "uppercase", 
          letterSpacing: "0.2em", display: "flex", alignItems: "center", 
          justifyContent: "center", gap: 12
        }}
        onClick={() => {
            if(confirm("Confirm security reset? All local stock will be cleared.")) {
                db.delete();
                window.location.reload();
            }
        }}
      >
        <LogOut size={18} />
        Reset Counter
      </button>

      {/* Modal Editor */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", display: "flex", alignItems: "flex-end" }}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              style={{ width: "100%", background: "var(--surface)", padding: "32px", borderRadius: "32px 32px 0 0", borderTop: "2px solid var(--border)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <h3 className="font-space" style={{ fontSize: 22, fontWeight: 900 }}>Edit Shop Data</h3>
                <button onClick={() => setIsEditing(false)} style={{ width: 44, height: 44, borderRadius: 12, background: "var(--input-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 40 }}>
                <div>
                    <label style={{ fontSize: 10, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Shop Name</label>
                    <div style={{ position: "relative" }}>
                        <Store size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                        <input className="input-modern" style={{ paddingLeft: 48 }} value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} />
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 10, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>GST Number</label>
                        <div style={{ position: "relative" }}>
                            <Hash size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                            <input className="input-modern" style={{ paddingLeft: 40 }} value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: 10, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Phone</label>
                        <div style={{ position: "relative" }}>
                            <Phone size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                            <input className="input-modern" style={{ paddingLeft: 40 }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>
                </div>
                <div>
                   <label style={{ fontSize: 10, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Full Address</label>
                   <div style={{ position: "relative" }}>
                        <MapPin size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                        <input className="input-modern" style={{ paddingLeft: 48 }} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                </div>
              </div>

              <button 
                onClick={saveSettings}
                className="shimmer-btn" 
                style={{ width: "100%", height: 68, borderRadius: 20, border: "none", color: "#fff", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em" }}
              >
                Sync with Database
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

