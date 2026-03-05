# 💎 BillingPro Engine | Premium POS Dashboard

**BillingPro Engine** is an enterprise-grade, mobile-first Point of Sale (POS) and inventory management system designed for speed, security, and a best-in-class user experience. Built with **Next.js 15**, it offers a high-fidelity dashboard that operates entirely in the browser using local storage for zero-dependency privacy.

### ✨ Key Features

- **📱 True Mobile-First Design**: Optimized for any viewport with smooth, app-like micro-interactions.
- **🛡️ Secure Hardware Interface**: Direct, authorized camera access for optical barcode scanning.
- **💾 Local-First Architecture**: Your business data stays in your browser's IndexedDB (Vault). No cloud database needed.
- **📊 Real-time Analytics**: Live progress tracking for daily revenue, asset counts, and settlement logs.
- **🖨️ Thermal Printer Link**: Integrated with Bluetooth Print Engine for physical receipt generation.
- **🌓 Dual-Theme System**: Premium Light and Graphite Dark modes with smooth transitions.

### 🚀 Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Vanilla CSS (Premium Theming Engine)
- **Animations**: Framer Motion
- **Database**: Dexie.js (IndexedDB)
- **Hardware**: html5-qrcode (Scanner) & Bluetooth GATT (Printer)
- **Icons**: Lucide React

### 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Tusharjain-19/billingpro.git
   ```
2. Setup environment:
   ```bash
   npm install
   ```
3. Run Local Node:
   ```bash
   npm run dev
   ```

### 🤝 Security Protocols

This terminal uses **Ghost Protocol**. No data is ever transmitted to an external server. When you "Initialize", your browser takes over the hardware (Camera) and stores all asset registries in an encrypted local vault.

### 👤 Author

**Tushar Jain**
[jaint0910@gmail.com](mailto:jaint0910@gmail.com)
