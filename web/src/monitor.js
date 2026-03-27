// src/monitor.js
/**
 * Wraps xterm.js for serial monitoring
 */
export class SerialMonitor {
  constructor(containerId, statusEl, autoScrollCb) {
    this.term = new Terminal({
      cursorBlink: true,
      scrollback: 1000,
      theme: { background: '#000000', foreground: '#ffffff' }
    });

    this.statusEl = statusEl;
    this.autoScrollCb = autoScrollCb;

    this.device = null;
    this.reader = null;
    this.isReading = false;
    this.readLoopPromise = null;

    // Attempt to load fit addon if available on window (from unpkg)
    if (window.FitAddon && window.FitAddon.FitAddon) {
      this.fitAddon = new window.FitAddon.FitAddon();
      this.term.loadAddon(this.fitAddon);
    }

    this.term.open(document.getElementById(containerId));
    if (this.fitAddon) {
      this.fitAddon.fit();
      window.addEventListener('resize', () => this.fitAddon.fit());
    }

    this.term.writeln("\x1b[32mCharm Serial Monitor Initialized\x1b[0m");
    this.term.writeln("Ready to connect...");
    this.decoder = new TextDecoder();
  }

  setStatus(msg, isError = false, isSuccess = false) {
    if (!this.statusEl) return;
    this.statusEl.textContent = msg;
    this.statusEl.className = 'status';
    if (isError) this.statusEl.classList.add('error');
    if (isSuccess) this.statusEl.classList.add('success');
  }

  async connect(device = null) {
    try {
      if (this.device) {
        await this.disconnect();
      }

      this.setStatus("Requesting port...");
      // Re-use an existing device if passed (e.g. from flasher), otherwise request
      this.device = device || await navigator.serial.requestPort();

      if (!this.device.readable) {
        this.setStatus("Opening port at 115200 baud...");
        await this.device.open({ baudRate: 115200 });
      }

      this.setStatus("Connected. Monitoring...", false, true);
      this.term.writeln("\n\x1b[32m--- Connected ---\x1b[0m\n");

      this.isReading = true;
      this.readLoopPromise = this.readLoop();
      return true;
    } catch (e) {
      console.error(e);
      this.setStatus(`Connection failed: ${e.message}`, true);
      this.device = null;
      return false;
    }
  }

  async disconnect(internal = false) {
    this.setStatus("Disconnecting...");
    this.isReading = false;

    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }

    // Only await the readLoop if we aren't calling this from *inside* the readLoop
    if (this.readLoopPromise && !internal) {
        await this.readLoopPromise;
        this.readLoopPromise = null;
    }

    if (this.device) {
      await this.device.close();
      this.device = null;
    }

    this.term.writeln("\n\x1b[31m--- Disconnected ---\x1b[0m\n");
    this.setStatus("Disconnected.");
  }

  async readLoop() {
    while (this.device && this.device.readable && this.isReading) {
      this.reader = this.device.readable.getReader();
      try {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          if (value) {
            this.writeChunk(value);
          }
        }
      } catch (error) {
        console.error("Serial read error:", error);
        this.setStatus(`Read error: ${error.message}`, true);
        this.term.writeln(`\n\x1b[31m--- Read Error: ${error.message} ---\x1b[0m\n`);
      } finally {
        if (this.reader) {
            this.reader.releaseLock();
            this.reader = null;
        }
      }
    }

    // If we exited the loop and wasn't intentionally disconnected,
    // it implies the device was physically disconnected.
    if (this.isReading) {
        await this.disconnect(true);
        this.setStatus("Device disconnected unexpectedly.", true);
    }
  }

  writeChunk(chunk) {
    const text = this.decoder.decode(chunk);
    // Replace standalone \n with \r\n for proper terminal rendering
    const formatted = text.replace(/(?<!\r)\n/g, '\r\n');
    this.term.write(formatted);

    if (this.autoScrollCb && this.autoScrollCb.checked) {
        this.term.scrollToBottom();
    }
  }

  clear() {
    this.term.clear();
  }
}
