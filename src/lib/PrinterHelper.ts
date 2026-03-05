import EscPosEncoder from 'esc-pos-encoder';

export class PrinterHelper {
  private static device: BluetoothDevice | null = null;
  private static server: BluetoothRemoteGATTServer | null = null;
  private static characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  static async connect() {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }], // Generic printer service UUID
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

  static async printReceipt(shopName: string, items: any[], total: number) {
    if (!this.characteristic) {
      const connected = await this.connect();
      if (!connected) return;
    }

    const encoder = new EscPosEncoder();
    let result = encoder
      .initialize()
      .align('center')
      .size('normal')
      .text(shopName.toUpperCase())
      .newline()
      .text('--------------------------------')
      .newline()
      .align('left');

    items.forEach(item => {
      result = result
        .text(`${item.name.substring(0, 20).padEnd(20)} x${item.quantity}`)
        .newline()
        .align('right')
        .text(`Rs. ${item.price * item.quantity}`)
        .newline()
        .align('left');
    });

    result = result
      .text('--------------------------------')
      .newline()
      .align('right')
      .text(`TOTAL: Rs. ${total}`)
      .newline()
      .newline()
      .align('center')
      .text('THANK YOU FOR VISITING')
      .newline()
      .cut()
      .encode();

    await this.characteristic?.writeValue(result);
  }
}
