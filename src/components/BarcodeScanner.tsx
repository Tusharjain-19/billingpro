'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, RefreshCcw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: ScannerProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        // Check if mediaDevices API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported on this device/browser.");
        }

        const config = { fps: 15, qrbox: { width: 250, height: 250 } };
        html5QrCodeRef.current = new Html5Qrcode("reader");
        
        await html5QrCodeRef.current.start(
          { facingMode: "environment" }, 
          config,
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          () => { /* Quietly ignore scan errors */ }
        );
        
        if (mounted) setIsInitializing(false);
      } catch (err: any) {
        console.error("Camera access failed", err);
        if (mounted) {
          setIsInitializing(false);
          const message = err?.message || String(err);
          if (message.includes("NotAllowedError") || message.includes("Permission")) {
            setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
          } else if (message.includes("NotFoundError") || message.includes("not found")) {
            setCameraError("No camera found on this device.");
          } else {
            setCameraError("Could not access camera. " + message);
          }
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
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
            <div style={{ width: 44, height: 44, borderRadius: 14, background: cameraError ? "#ef4444" : "var(--app-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                {cameraError ? <AlertTriangle size={22} /> : <Camera size={22} />}
            </div>
            <div>
                 <h2 style={{ color: "#fff", fontSize: "14px", fontWeight: 700 }}>{cameraError ? "Camera Error" : "Back Camera"}</h2>
                 <p style={{ color: "var(--app-fg-muted)", fontSize: "10px", textTransform: "uppercase" }}>
                   {cameraError ? "Access Failed" : "Scanning Environment..."}
                 </p>
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
          {cameraError ? (
            <div style={{ textAlign: "center", padding: "0 32px" }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <AlertTriangle size={36} color="#ef4444" />
              </div>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 600, lineHeight: 1.6, marginBottom: 32 }}>
                {cameraError}
              </p>
              <button 
                onClick={() => { stopScanner(); onClose(); }}
                style={{ 
                  padding: "16px 40px", 
                  borderRadius: 16, 
                  background: "rgba(255,255,255,0.1)", 
                  border: "1px solid rgba(255,255,255,0.2)", 
                  color: "#fff", 
                  fontSize: 14, 
                  fontWeight: 700 
                }}
              >
                Go Back
              </button>
            </div>
          ) : (
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
          )}
      </div>
      
      <div style={{ height: 120, textAlign: "center", padding: "0 40px" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 600 }}>
            {cameraError 
              ? "You can still add items manually using the search bar." 
              : "Point your lens at the barcode. Billing will verify the stock in real-time."
            }
          </p>
          <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 10, margin: "24px auto" }} />
      </div>
    </motion.div>
  );
}
