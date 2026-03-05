'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface ScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: ScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
      },
      () => {
        // quiet error
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [onScan]);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      bottom: 0,
      left: "50%",
      width: "100%",
      maxWidth: 440,
      transform: "translateX(-50%)",
      zIndex: 2000,
      background: "#000",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{ 
        width: "100%", 
        maxWidth: "400px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "32px" 
      }}>
        <h2 style={{ color: "#fff", fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.4em" }}>Terminal Scanner</h2>
        <button 
          onClick={onClose}
          style={{ 
            width: "48px", 
            height: "48px", 
            borderRadius: "16px", 
            background: "rgba(255,255,255,0.1)", 
            border: "1px solid rgba(255,255,255,0.1)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            cursor: "pointer",
            color: "#fff"
          }}
        >
          <X size={24} />
        </button>
      </div>

      <div id="reader" style={{ 
        width: "100%", 
        maxWidth: "340px", 
        borderRadius: "32px", 
        overflow: "hidden", 
        border: "2px solid var(--primary)",
        background: "#111"
      }} />
      
      <p style={{ 
        marginTop: "32px", 
        color: "rgba(255,255,255,0.4)", 
        fontSize: "10px", 
        fontWeight: 700, 
        textTransform: "uppercase", 
        letterSpacing: "0.2em", 
        textAlign: "center",
        padding: "0 40px"
      }}>
        Position target within frame for optical character recognition
      </p>
    </div>
  );
}
