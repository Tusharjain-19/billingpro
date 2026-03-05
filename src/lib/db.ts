import Dexie, { type Table } from 'dexie';

export interface Product {
  id?: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

export interface Sale {
  id?: number;
  timestamp: number;
  total: number;
  items: CartItem[];
  customerName?: string;
}

export interface CartItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

export class AppDatabase extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;

  constructor() {
    super('BillingProDB');
    this.version(1).stores({
      products: '++id, name, sku, category',
      sales: '++id, timestamp'
    });
  }
}

export const db = new AppDatabase();
