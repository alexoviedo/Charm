/**
 * WR-007 Web flasher baseline.
 *
 * Uses esptool-js in browser to:
 * - identify target chip via bootloader session
 * - flash approved artifact set
 * - report deterministic progress/failure states
 *
 * Notes:
 * - Assumes legacy layout addresses already documented in artifacts layer.
 * - No console streaming implemented here.
 */

export class WebFlasherService {
  constructor() {
    this.transport = null;
    this.loader = null;
  }

  async connectAndIdentify(port, hooks = {}) {
    const { onStatus = () => {}, terminal = null } = hooks;

    if (!port) {
      throw new Error('No serial port available for flashing path.');
    }

    onStatus('FLASH_CONNECTING', 'Connecting to bootloader...');

    this.transport = new esptooljs.Transport(port);
    this.loader = new esptooljs.ESPLoader({
      transport: this.transport,
      baudrate: 115200,
      terminal: {
        clean: () => terminal?.clear?.(),
        writeLine: (d) => terminal?.writeln?.(d),
        write: (d) => terminal?.write?.(d),
      },
    });

    const chip = await this.loader.main();
    const mac = await this.loader.read_mac();
    const macString = mac.map((b) => b.toString(16).padStart(2, '0')).join(':').toUpperCase();

    onStatus('FLASH_IDENTIFIED', `Connected to ${chip} (${macString}).`);
    return { chip, mac: macString };
  }

  async flashBundle(bundle, hooks = {}) {
    const { onStatus = () => {}, onProgress = () => {} } = hooks;

    if (!this.loader) {
      throw new Error('Flasher not connected. Run identify first.');
    }
    if (!bundle?.binaries) {
      throw new Error('Artifact bundle is missing binaries.');
    }

    onStatus('FLASH_PREPARING', 'Preparing bundle for flashing...');

    const toBinaryString = (buffer) => {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
      }
      return binary;
    };

    const fileArray = [
      { data: toBinaryString(bundle.binaries.bootloader), address: parseInt(bundle.flashLayout.bootloader, 16) },
      { data: toBinaryString(bundle.binaries.partition_table), address: parseInt(bundle.flashLayout.partition_table, 16) },
      { data: toBinaryString(bundle.binaries.app), address: parseInt(bundle.flashLayout.app, 16) },
    ];

    await this.loader.change_baud(921600);

    onStatus('FLASH_WRITING', 'Writing firmware artifacts...');
    await this.loader.write_flash({
      fileArray,
      flashSize: 'keep',
      eraseAll: false,
      compress: true,
      calculateMD5Hash: (image) => CryptoJS.MD5(CryptoJS.enc.Latin1.parse(image)).toString(),
      reportProgress: (fileIndex, written, total) => {
        const pct = total > 0 ? Math.round((written / total) * 100) : 0;
        onProgress({ fileIndex, written, total, pct });
      },
    });

    onStatus('FLASH_RESETTING', 'Flash complete. Resetting device...');
    await this.loader.hard_reset();
    onStatus('FLASH_DONE', 'Flash and reset completed successfully.');
  }

  async cleanup() {
    try {
      if (this.transport) {
        await this.transport.disconnect();
      }
    } finally {
      this.loader = null;
      this.transport = null;
    }
  }
}
