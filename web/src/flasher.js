// src/flasher.js
/**
 * Integrates esptool-js to flash the ESP32-S3 via Web Serial.
 */

// We access esptool from the global window object loaded via unpkg script tag
// It exposes `esptooljs` global
export class WebFlasher {
  constructor(statusElement, monitorTerminal) {
    this.statusEl = statusElement;
    this.term = monitorTerminal; // Keep a ref to the terminal for esptool logs
    this.device = null;
    this.esptool = null;
    this.transport = null;

    // Callbacks to update the UI with device info
    this.onDeviceInfo = null;
    this.onError = null;
  }

  setStatus(msg, isError = false, isSuccess = false) {
    if (!this.statusEl) return;
    this.statusEl.textContent = msg;
    this.statusEl.className = 'status';
    if (isError) this.statusEl.classList.add('error');
    if (isSuccess) this.statusEl.classList.add('success');
  }

  async connect() {
    try {
      this.setStatus("Requesting serial port...");
      this.device = await navigator.serial.requestPort();

      this.transport = new esptooljs.Transport(this.device);
      this.setStatus("Syncing with bootloader...");

      const flashOptions = {
        transport: this.transport,
        baudrate: 115200,
        terminal: {
          clean: () => { if (this.term) this.term.clear(); },
          writeLine: (data) => { if (this.term) this.term.writeln(data); },
          write: (data) => { if (this.term) this.term.write(data); }
        }
      };

      this.esptool = new esptooljs.ESPLoader(flashOptions);
      const chipName = await this.esptool.main();

      const mac = await this.esptool.read_mac();
      const macStr = mac.map(b => b.toString(16).padStart(2, '0')).join(':').toUpperCase();

      this.setStatus(`Connected to ${chipName}. Ready to flash.`, false, true);

      if (this.onDeviceInfo) {
          this.onDeviceInfo({ chip: chipName, mac: macStr });
      }

      return true;

    } catch (err) {
      console.error("Connection error:", err);
      this.device = null;
      this.esptool = null;
      this.transport = null;

      let msg = err.message || "Unknown error";
      if (msg.includes("Failed to execute 'requestPort'")) {
         msg = "Port selection cancelled.";
      } else if (msg.includes("Failed to open serial port")) {
         msg = "Port is already open in another tab or application.";
      } else {
         msg = "Failed to sync with bootloader. See recovery guidance.";
      }

      this.setStatus(`Connection failed: ${msg}`, true);

      if (this.onError) {
          this.onError(msg);
      }
      return false;
    }
  }

  async flash(binaries) {
    if (!this.esptool) {
      this.setStatus("Not connected. Connect to the device first.", true);
      if (this.onError) this.onError("Not connected");
      return false;
    }

    if (!binaries) {
      this.setStatus("No binaries loaded to flash.", true);
      return;
    }

    try {
      this.setStatus("Preparing to flash...");

      // Fast, chunked Array to Binary String converter to avoid memory bloat
      const bufferToString = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        return binary;
      };

      // esptool-js expects a raw binary string in the 'data' field
      const fileArray = [
        { data: bufferToString(binaries.bootloader), address: 0x0000 },
        { data: bufferToString(binaries.partitionTable), address: 0x8000 },
        { data: bufferToString(binaries.app), address: 0x10000 }
      ];

      const flashOptions = {
        fileArray: fileArray,
        flashSize: "keep",
        eraseAll: false,
        compress: true,
        reportProgress: (fileIndex, written, total) => {
          const percent = Math.round((written / total) * 100);
          this.setStatus(`Flashing file ${fileIndex + 1}/3: ${percent}%`);
        },
        calculateMD5Hash: (image) => CryptoJS.MD5(CryptoJS.enc.Latin1.parse(image)).toString()
      };

      // Set baudrate to a faster rate for flashing
      await this.esptool.change_baud(921600);

      this.setStatus("Erasing flash and writing binaries...");
      await this.esptool.write_flash(flashOptions);

      this.setStatus("Flash complete! Hard resetting...", false, true);
      await this.esptool.hard_reset();

      this.setStatus("Flash complete! Hard resetting...", false, true);

      // Let the app code take the device object back for the monitor
      const flashedDevice = this.device;

      // Disconnect local state and esptool-js transport locks, but keep device object open
      if (this.transport) {
          await this.transport.disconnect();
      }
      this.esptool = null;
      this.transport = null;
      this.device = null;

      return flashedDevice;

    } catch (err) {
      console.error("Flash error:", err);
      this.setStatus(`Flash failed: ${err.message}. See recovery guidance.`, true);
      if (this.onError) this.onError(err.message);
      return false;
    }
  }
}
