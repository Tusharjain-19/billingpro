'use client';

import { 
  Store, 
  Printer, 
  Shield, 
  LogOut, 
  ChevronRight, 
  BadgeCheck, 
  Smartphone, 
  HardDrive, 
  Edit3, 
  MapPin, 
  Phone, 
  Hash, 
  X,
  CreditCard,
  Lock,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { db, AppSettings } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { PrinterHelper } from '@/lib/PrinterHelper';

function SettingsItem({ icon: Icon, title, value, status, onClick }: { icon: any, title: string, value?: string, status?: 'on' | 'off', onClick?: () => void }) {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", cursor: onClick ? "pointer" : "default", borderBottom: "1px solid var(--app-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--app-surface-raised)", display: "flex", alignItems: "center", justifyContent: "center", color: status === 'on' ? "var(--app-primary)" : "var(--app-fg-muted)" }}>
          <Icon size={18} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600 }}>{title}</p>
          {value && (
            <p style={{ fontSize: 11, fontWeight: 500, color: "var(--app-fg-muted)" }}>{value}</p>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {status && (
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: status === 'on' ? "#10b981" : "#ef4444" }} />
        )}
        {onClick && <ChevronRight size={16} style={{ color: "var(--app-border)" }} />}
      </div>
    </motion.div>
  );
}

export default function SettingsPage() {
  const currentSettings = useLiveQuery(() => db.settings.toCollection().first());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AppSettings>({
    storeName: 'Indian Mart',
    gstNumber: '08ABC1234D1Z5',
    address: 'Jaipur, Rajasthan',
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
    <div className="fade-in">
      {/* Profile Card Overlay Header */}
      <section style={{ padding: "0 24px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: "var(--app-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 15px 35px rgba(99,102,241,0.3)" }}>
                <Store size={36} />
            </div>
            <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>{formData.storeName}</h2>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--app-fg-muted)" }}>{formData.gstNumber || 'GST Not Linked'}</p>
            </div>
        </div>
      </section>

      {/* Grouped Settings Sections */}
      <section>
        <p style={{ margin: "0 28px 12px", fontSize: 10, fontWeight: 800, color: "var(--app-primary)", letterSpacing: "0.15em" }}>SHOP CONFIGURATION</p>
        <div className="app-card" style={{ padding: 0, overflow: "hidden", margin: "0 20px 32px" }}>
             <SettingsItem icon={Edit3} title="Edit Shop Details" value="Name, GSTIN, Address" onClick={() => setIsEditing(true)} />
             <SettingsItem icon={Printer} title="Bluetooth Printer" value="58mm Thermal Setup" status="on" onClick={handleTestPrint} />
             <SettingsItem icon={CreditCard} title="Taxation Mode" value="Indian GST Format" status="on" />
        </div>

        <p style={{ margin: "0 28px 12px", fontSize: 10, fontWeight: 800, color: "var(--app-primary)", letterSpacing: "0.15em" }}>SYSTEM SECURITY</p>
        <div className="app-card" style={{ padding: 0, overflow: "hidden", margin: "0 20px 32px" }}>
             <SettingsItem icon={Lock} title="Local Database" value="Dexie Secured" status="on" />
             <SettingsItem icon={HardDrive} title="Backup Data" value="Internal Storage" />
             <SettingsItem 
                icon={LogOut} 
                title="Reset All Data" 
                value="Clear Stock & Bills" 
                onClick={() => {
                   if(confirm("Confirm security reset? All local stock will be cleared.")) {
                       db.delete();
                       window.location.reload();
                   }
                }} 
             />
        </div>
      </section>

      {/* Editor Drawer */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)" }}
            onClick={() => setIsEditing(false)}
          >
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              style={{ position: "absolute", bottom: 0, width: "100%", maxWidth: 430, left: "50%", x: "-50%", background: "var(--app-bg)", borderRadius: "32px 32px 0 0", padding: "24px 20px 48px", borderTop: "1px solid var(--app-border)" }}
              onClick={e => e.stopPropagation()}
            >
                <div style={{ width: 40, height: 4, background: "var(--app-border)", borderRadius: 10, margin: "0 auto 20px" }} />
                <h2 className="font-space" style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Edit Details</h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>SHOP NAME</label>
                        <input className="app-input" value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} />
                    </div>
                    <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>GSTIN NUMBER</label>
                        <input className="app-input" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
                    </div>
                    <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>CONTACT PHONE</label>
                        <input className="app-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: "var(--app-fg-muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>ADDRESS</label>
                        <input className="app-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    
                    <button onClick={saveSettings} className="app-btn-primary" style={{ marginTop: 24 }}>SYNC PROFILE</button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
