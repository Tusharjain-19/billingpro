import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';
import { db } from './db';

export class PrinterHelper {
  private static device: BluetoothDevice | null = null;
  private static server: BluetoothRemoteGATTServer | null = null;
  private static characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  static async connect() {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }], 
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      this.server = await this.device.gatt?.connect() || null;
      const service = await this.server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      this.characteristic = await service?.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb') || null;

      return true;
    } catch (error) {
      console.error("Bluetooth connection failed", error);
      return false;
    }
  }

  static async printReceipt(shopName: string, items: any[], total: number, isTest = false) {
    if (!this.characteristic) {
      const connected = await this.connect();
      if (!connected) return;
    }

    const settings = await db.settings.toCollection().first();
    const store = settings || { storeName: shopName, gstNumber: 'N/A', address: 'Unknown', phone: 'N/A' };

    const encoder = new ReceiptPrinterEncoder();
    let result = encoder
      .initialize()
      .align('center')
      .size('double')
      .line(store.storeName.toUpperCase())
      .size('normal')
      .line(store.address)
      .line(`GSTIN: ${store.gstNumber}`)
      .line(`Ph: ${store.phone}`)
      .line('--------------------------------')
      .align('left');

    if (isTest) {
      result = result
        .align('center')
        .line('TEST PRINT SUCCESSFUL')
        .line('PRINTER IS CONNECTED')
        .line('HAPPY BILLING!')
        .line('--------------------------------');
    } else {
      result = result
        .line('Item Name           Qty   Price')
        .line('--------------------------------');

      items.forEach(item => {
        const namePart = item.name.substring(0, 16).padEnd(16);
        const qtyPart = `x${item.quantity}`.padEnd(5);
        const price = (item.price * item.quantity).toFixed(2);
        result = result.line(`${namePart} ${qtyPart} ${price}`);
      });

      result = result
        .line('--------------------------------')
        .align('right')
        .line(`TOTAL (INC TAX): Rs. ${total.toFixed(2)}`)
        .newline()
        .align('center')
        .line('THANK YOU FOR YOUR VISIT')
        .line('VISIT AGAIN!')
        .newline();
    }

    result = result.cut().encode();
    await this.characteristic?.writeValue(result);
  }
}
