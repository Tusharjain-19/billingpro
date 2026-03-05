'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: ScannerProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Priority: back camera ('environment')
    const config = { fps: 15, qrbox: { width: 250, height: 250 } };
    
    html5QrCodeRef.current = new Html5Qrcode("reader");
    
    html5QrCodeRef.current.start(
      { facingMode: "environment" }, 
      config,
      (decodedText) => {
        onScan(decodedText);
        stopScanner();
      },
      () => { /* Quietly ignore scan errors */ }
    ).then(() => {
      setIsInitializing(false);
    }).catch((err) => {
      console.error("Camera access failed", err);
      setIsInitializing(false);
    });

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error("Stop failed", e);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        padding: "env(safe-area-inset-top) 24px"
      }}
    >
      <div style={{ 
        height: 100,
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--app-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Camera size={22} />
            </div>
            <div>
                 <h2 style={{ color: "#fff", fontSize: "14px", fontWeight: 700 }}>Back Camera</h2>
                 <p style={{ color: "var(--app-fg-muted)", fontSize: "10px", textTransform: "uppercase" }}>Scanning Environment...</p>
            </div>
        </div>
        <button 
          onClick={() => { stopScanner(); onClose(); }}
          style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div id="reader" style={{ 
            width: "100%", 
            maxWidth: "340px", 
            borderRadius: "40px", 
            overflow: "hidden", 
            border: "3px solid var(--app-primary)",
            background: "#111",
            boxShadow: "0 0 50px var(--app-primary-glow)",
            position: "relative"
          }}>
            {isInitializing && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#000", zIndex: 10 }}>
                     <RefreshCcw size={32} className="animate-spin" color="var(--app-primary)" />
                </div>
            )}
          </div>
      </div>
      
      <div style={{ height: 120, textAlign: "center", padding: "0 40px" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 600 }}>
            Point your lens at the barcode. Billing will verify the stock in real-time.
          </p>
          <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 10, margin: "24px auto" }} />
      </div>
    </motion.div>
  );
}
