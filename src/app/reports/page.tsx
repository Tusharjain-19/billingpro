'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Sale } from '@/lib/db';
import { Download, Calendar, ArrowLeft, BarChart3, TrendingUp, Filter, FileSpreadsheet, ChevronRight, IndianRupee, PieChart, Activity } from 'lucide-react';
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
    <div className="fade-in">
      {/* Segmented Controller (iOS Native Style) */}
      <section style={{ padding: "0 24px 24px" }}>
        <div style={{ background: "var(--app-surface-raised)", padding: 4, borderRadius: 14, display: "flex", gap: 4 }}>
            {['monthly', 'yearly'].map(t => (
                <button 
                  key={t}
                  onClick={() => setViewType(t as any)}
                  style={{ flex: 1, height: 36, borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, background: viewType === t ? "var(--app-surface)" : "none", color: viewType === t ? "var(--app-primary)" : "var(--app-fg-muted)", transition: "0.2s" }}
                >
                    {t.toUpperCase()}
                </button>
            ))}
        </div>
      </section>

      {/* Date Pickers Card */}
      <div className="app-card" style={{ display: "flex", gap: 12, padding: "12px 16px" }}>
            <div style={{ flex: 1, position: "relative" }}>
                 <select 
                    value={selectedMonth} 
                    onChange={e => setSelectedMonth(parseInt(e.target.value))}
                    className="app-input"
                    style={{ height: 44, fontSize: 13, paddingRight: 32, opacity: viewType === 'yearly' ? 0.3 : 1 }}
                    disabled={viewType === 'yearly'}
                 >
                     {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                 </select>
            </div>
            <div style={{ flex: 1, position: "relative" }}>
                 <select 
                    value={selectedYear} 
                    onChange={e => setSelectedYear(parseInt(e.target.value))}
                    className="app-input"
                    style={{ height: 44, fontSize: 13, paddingRight: 32 }}
                 >
                     {years.map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
            </div>
      </div>

      {/* Analytics Snapshot */}
      <section style={{ marginTop: 24, padding: "0 8px" }}>
        <div className="app-card" style={{ padding: 24, background: "var(--app-primary)", color: "#fff", border: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                    <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>TOTAL GROSS COLLECTION</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span className="font-space" style={{ fontSize: 36, fontWeight: 900 }}>₹{stats.totalRevenue.toLocaleString()}</span>
                        <span style={{ fontSize: 16, fontWeight: 800, opacity: 0.6 }}>.00</span>
                    </div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BarChart3 size={20} />
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                    <p style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>BILL COUNT</p>
                    <p className="font-space" style={{ fontSize: 20, fontWeight: 800 }}>{stats.totalBills}</p>
                </div>
                <div>
                    <p style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>GST ESTIMATE</p>
                    <p className="font-space" style={{ fontSize: 20, fontWeight: 800 }}>₹{stats.totalGst.toFixed(0)}</p>
                </div>
            </div>
        </div>

        <div style={{ padding: "0 16px" }}>
            <button onClick={exportToExcel} className="app-btn-primary" style={{ background: "var(--app-surface)", color: "var(--app-primary)", border: "1px solid var(--app-border)" }}>
                <FileSpreadsheet size={20} />
                EXPORT FINANCIAL DATA
            </button>
        </div>
      </section>

      {/* Itemized Feed */}
      <section style={{ marginTop: 32 }}>
          <p style={{ margin: "0 24px 16px", fontSize: 10, fontWeight: 800, color: "var(--app-primary)", letterSpacing: "0.15em" }}>PERIOD TRANSACTION LOG</p>
          <div style={{ padding: "0 8px" }}>
              {filteredSales.map(s => (
                  <div key={s.id} className="app-card" style={{ padding: "16px 20px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--app-surface-raised)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--app-primary)" }}>
                              <Receipt size={18} />
                          </div>
                          <div>
                              <p style={{ fontSize: 14, fontWeight: 700 }}>#{s.id?.toString().slice(-4)}</p>
                              <p style={{ fontSize: 11, color: "var(--app-fg-muted)", fontWeight: 500 }}>{new Date(s.timestamp).toLocaleDateString()}</p>
                          </div>
                      </div>
                      <p className="font-space" style={{ fontSize: 18, fontWeight: 800 }}>₹{s.total.toFixed(0)}</p>
                  </div>
              ))}
              {filteredSales.length === 0 && (
                  <div style={{ padding: 60, textAlign: "center", opacity: 0.2 }}>
                      <Activity size={40} style={{ margin: "0 auto 16px" }} />
                      <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>No data for this selection</p>
                  </div>
              )}
          </div>
      </section>
    </div>
  );
}
