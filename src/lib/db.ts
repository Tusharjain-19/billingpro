import Dexie, { type Table } from 'dexie';

export interface Product {
  id?: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  gstRate: 0 | 5 | 12 | 18 | 28;
  isGstIncluded: boolean;
  image?: string;
}

export interface Sale {
  id?: number;
  timestamp: number;
  subtotal: number;
  gstTotal: number;
  total: number;
  items: CartItem[];
  customerName?: string;
}

export interface CartItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  gstRate: number;
  isGstIncluded: boolean;
}

export interface AppSettings {
  id?: number;
  storeName: string;
  gstNumber: string;
  address: string;
  phone: string;
}

export class AppDatabase extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  settings!: Table<AppSettings>;

  constructor() {
    super('BillingProDB');
    this.version(2).stores({
      products: '++id, name, sku, category',
      sales: '++id, timestamp',
      settings: '++id'
    });
  }
}

export const db = new AppDatabase();
