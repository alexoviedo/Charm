// src/monitor.js
/**
 * Wraps xterm.js for serial monitoring
 */
export class SerialMonitor {
  constructor(containerId) {
    this.term = new Terminal({
      cursorBlink: true,
      scrollback: 1000,
      theme: { background: '#000000', foreground: '#ffffff' }
    });

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
    this.decoder = new TextDecoder();
  }

  writeChunk(chunk) {
    const text = this.decoder.decode(chunk);
    // Replace standalone \n with \r\n for proper terminal rendering
    const formatted = text.replace(/(?<!\r)\n/g, '\r\n');
    this.term.write(formatted);
  }

  clear() {
    this.term.clear();
  }
}
