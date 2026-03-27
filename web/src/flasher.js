// src/flasher.js
/**
 * Integrates esptool-js to flash the ESP32-S3 via Web Serial.
 */

// We access esptool from the global window object loaded via unpkg script tag
// It exposes `esptooljs` global
export class WebFlasher {
  constructor(statusElement, serialMonitor) {
    this.statusEl = statusElement;
    this.monitor = serialMonitor;
    this.device = null;
    this.esptool = null;
    this.transport = null;
  }

  setStatus(msg, isError = false, isSuccess = false) {
    this.statusEl.textContent = msg;
    this.statusEl.className = 'status';
    if (isError) this.statusEl.classList.add('error');
    if (isSuccess) this.statusEl.classList.add('success');
  }

  async connect() {
    try {
      this.setStatus("Requesting serial port...");
      // Request standard ESP baud rate for bootloader (115200)
      this.device = await navigator.serial.requestPort();

      this.transport = new esptooljs.Transport(this.device);
      this.setStatus("Port selected. Connecting to ESP32-S3...");

      const flashOptions = {
        transport: this.transport,
        baudrate: 115200,
        terminal: {
          clean: () => this.monitor.clear(),
          writeLine: (data) => this.monitor.term.writeln(data),
          write: (data) => this.monitor.term.write(data)
        }
      };

      this.esptool = new esptooljs.ESPLoader(flashOptions);
      const chipName = await this.esptool.main();

      this.setStatus(`Connected to: ${chipName}`, false, true);
      return true;

    } catch (err) {
      console.error(err);
      this.setStatus(`Connection failed: ${err.message}`, true);
      return false;
    }
  }

  async flash(binaries) {
    if (!this.esptool) {
      this.setStatus("Not connected. Connect first.", true);
      return;
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

      this.setStatus("Rebooting device. Starting serial monitor...", false, true);

      // Detach esptool-js but keep the transport/device open to read standard logs
      this.esptool = null;
      this.startSerialMonitorLoop();

    } catch (err) {
      console.error(err);
      this.setStatus(`Flash failed: ${err.message}`, true);
    }
  }

  async startSerialMonitorLoop() {
    this.monitor.term.writeln("\n\x1b[32m--- ESP32-S3 Serial Output ---\x1b[0m\n");
    try {
      while (this.device && this.device.readable) {
        const reader = this.device.readable.getReader();
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              this.monitor.writeChunk(value);
            }
          }
        } catch (error) {
          console.error("Error reading from serial port:", error);
        } finally {
          reader.releaseLock();
        }
      }
    } catch (e) {
      console.error("Serial stream failed:", e);
    }
  }
}
