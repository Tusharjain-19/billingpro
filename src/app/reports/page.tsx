'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Sale } from '@/lib/db';
import { Download, Calendar, ArrowLeft, BarChart3, TrendingUp, Filter, FileSpreadsheet, ChevronRight, IndianRupee } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import Link from 'next/link';

export default function ReportsPage() {
  const [viewType, setViewType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const allSales = useLiveQuery(() => db.sales.toArray());

  const filteredSales = useMemo(() => {
    if (!allSales) return [];
    return allSales.filter(s => {
      const date = new Date(s.timestamp);
      if (viewType === 'monthly') {
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      }
      return date.getFullYear() === selectedYear;
    });
  }, [allSales, viewType, selectedMonth, selectedYear]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
    const totalGst = filteredSales.reduce((acc, s) => acc + s.gstTotal, 0);
    const totalBills = filteredSales.length;
    return { totalRevenue, totalGst, totalBills };
  }, [filteredSales]);

  const exportToExcel = () => {
    if (!filteredSales.length) {
      alert("No data found for this period.");
      return;
    }

    const data: any[] = [];
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const itemLineTotal = item.price * item.quantity;
        let baseVal = 0;
        let gstAmt = 0;

        if (item.isGstIncluded) {
          baseVal = itemLineTotal / (1 + item.gstRate / 100);
          gstAmt = itemLineTotal - baseVal;
        } else {
          baseVal = itemLineTotal;
          gstAmt = itemLineTotal * (item.gstRate / 100);
        }

        data.push({
          'Bill ID': sale.id,
          'Date': new Date(sale.timestamp).toLocaleDateString(),
          'Time': new Date(sale.timestamp).toLocaleTimeString(),
          'Item Name': item.name,
          'Unit Price': item.price,
          'Quantity': item.quantity,
          'Subtotal': baseVal.toFixed(2),
          'GST %': item.gstRate,
          'GST Amount': gstAmt.toFixed(2),
          'Total Amount': (baseVal + gstAmt).toFixed(2),
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    
    // Auto-size columns (rough estimate)
    const maxWidths = data.reduce((acc: any, row) => {
      Object.keys(row).forEach((key, i) => {
        const value = String(row[key]);
        acc[i] = Math.max(acc[i] || 0, key.length, value.length);
      });
      return acc;
    }, []);
    worksheet['!cols'] = maxWidths.map((w: number) => ({ wch: w + 2 }));

    const fileName = `Sales_Report_${viewType}_${selectedYear}${viewType === 'monthly' ? '_' + (selectedMonth + 1) : ''}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div style={{ padding: "40px var(--page-pad) 140px" }}>
      <header style={{ marginBottom: 40, position: "relative" }}>
        <Link href="/" style={{ position: "absolute", left: 0, top: -20, color: "var(--muted)", textDecoration: "none", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10, color: "var(--primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.4em", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <BarChart3 size={12} /> Financial Analytics
          </div>
          <h1 className="font-space" style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>Reports</h1>
        </div>
      </header>

      {/* Period Selector */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {['monthly', 'yearly'].map(t => (
                <button 
                    key={t}
                    onClick={() => setViewType(t as any)}
                    style={{
                        padding: "10px 20px", borderRadius: 100, fontSize: 11, fontWeight: 900, textTransform: "uppercase",
                        background: viewType === t ? "var(--primary)" : "var(--surface-raised)",
                        color: viewType === t ? "#fff" : "var(--fg)",
                        border: "1px solid var(--border)",
                        transition: "all 0.3s"
                    }}
                >
                    {t}
                </button>
            ))}
        </div>

        <div className="glass" style={{ padding: 24, display: "flex", gap: 16 }}>
             {viewType === 'monthly' && (
                 <select 
                    value={selectedMonth} 
                    onChange={e => setSelectedMonth(parseInt(e.target.value))}
                    className="input-modern"
                    style={{ height: 48, padding: "0 16px", flex: 1 }}
                 >
                     {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                 </select>
             )}
             <select 
                value={selectedYear} 
                onChange={e => setSelectedYear(parseInt(e.target.value))}
                className="input-modern"
                style={{ height: 48, padding: "0 16px", flex: 1 }}
             >
                 {years.map(y => <option key={y} value={y}>{y}</option>)}
             </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
        <div className="glass" style={{ padding: "20px" }}>
          <p style={{ fontSize: 9, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Collection</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
             <span style={{ fontSize: 18, fontWeight: 800, color: "var(--muted)" }}>₹</span>
             <span className="font-space" style={{ fontSize: 28, fontWeight: 900 }}>{stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
        <div className="glass" style={{ padding: "20px" }}>
          <p style={{ fontSize: 9, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Total Bills</p>
          <span className="font-space" style={{ fontSize: 28, fontWeight: 900 }}>{stats.totalBills}</span>
        </div>
        <div className="glass" style={{ padding: "20px", gridColumn: "span 2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>Tax Contribution (GST)</p>
            <span className="font-space" style={{ fontSize: 18, fontWeight: 900, color: "var(--primary)" }}>₹{stats.totalGst.toFixed(2)}</span>
          </div>
          <TrendingUp size={24} style={{ opacity: 0.2, color: "var(--primary)" }} />
        </div>
      </div>

      <button
        onClick={exportToExcel}
        className="shimmer-btn"
        style={{
          width: "100%", height: 72, borderRadius: 24, border: "none", color: "#fff",
          fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
          boxShadow: "0 20px 40px rgba(var(--primary-rgb), 0.3)"
        }}
      >
        <FileSpreadsheet size={24} />
        Export to Excel
      </button>

      <div style={{ marginTop: 40, borderTop: "1.5px solid var(--border)", paddingTop: 32 }}>
          <p style={{ fontSize: 9, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 20 }}>Period Sales Feed</p>
          {filteredSales.map(s => (
              <div key={s.id} className="glass" style={{ padding: 20, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                      <p style={{ fontWeight: 800, fontSize: 14 }}>Bill #{s.id}</p>
                      <p style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700 }}>{new Date(s.timestamp).toLocaleDateString()} · {s.items.length} Items</p>
                  </div>
                  <span className="font-space" style={{ fontSize: 18, fontWeight: 900, color: "var(--primary)" }}>₹{s.total.toLocaleString()}</span>
              </div>
          ))}
          {filteredSales.length === 0 && (
              <div style={{ padding: 60, textAlign: "center", opacity: 0.2 }}>
                  <Calendar size={40} style={{ margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>No sales found for this period</p>
              </div>
          )}
      </div>
    </div>
  );
}
