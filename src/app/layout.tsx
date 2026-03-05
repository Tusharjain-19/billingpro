import React from 'react';
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ClientShell } from "@/components/layout/ClientShell";

export const metadata = {
  title: "BillingPro | Premium POS",
  description: "Enterprise-grade Mobile Billing System",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <ClientShell>{children}</ClientShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
