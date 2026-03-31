/**
 * WR-008 Serial monitor baseline.
 *
 * - independent connect/disconnect flows
 * - read-loop with unplug/error handling
 * - clear output + auto-scroll control
 */

const MONITOR_BAUDRATE = 115200;

export class SerialMonitorService {
  constructor() {
    this.port = null;
    this.reader = null;
    this.isReading = false;
    this.decoder = new TextDecoder();
  }

  async connect(port, hooks = {}) {
    const { onStatus = () => {}, onData = () => {}, onFailure = () => {} } = hooks;

    if (!port) {
      throw new Error('No serial port available for monitor connection.');
    }

    this.port = port;
    onStatus('MONITOR_CONNECTING', 'Opening serial monitor connection...');
    await this.reopenPortForMonitor(onStatus);

    this.isReading = true;
    onStatus('MONITOR_CONNECTED', `Serial monitor connected at ${MONITOR_BAUDRATE} baud.`);

    this.readLoop(onData, onStatus, onFailure);
  }

  async disconnect(onStatus = () => {}) {
    this.isReading = false;

    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch {
        // ignore cancellation race
      }
      this.reader = null;
    }

    if (this.port) {
      try {
        if (this.port.readable || this.port.writable) {
          await this.port.close();
        }
      } catch {
        // no-op: best-effort close
      }
    }

    this.port = null;
    onStatus('MONITOR_DISCONNECTED', 'Serial monitor disconnected.');
  }

  async reopenPortForMonitor(onStatus) {
    if (!this.port) {
      throw new Error('No serial port available for monitor reopen.');
    }

    if (this.port.readable || this.port.writable) {
      onStatus('MONITOR_REOPENING', `Re-opening serial port at ${MONITOR_BAUDRATE} baud for monitor compatibility...`);
      try {
        await this.port.close();
      } catch (err) {
        throw new Error(`Failed to close serial port before monitor reopen: ${err?.message || String(err)}`);
      }
    }

    await this.port.open({ baudRate: MONITOR_BAUDRATE });
  }

  async readLoop(onData, onStatus, onFailure) {
    while (this.port && this.port.readable && this.isReading) {
      this.reader = this.port.readable.getReader();
      try {
        while (this.isReading) {
          const { value, done } = await this.reader.read();
          if (done) break;
          if (value) {
            const text = this.decoder.decode(value);
            onData(text);
          }
        }
      } catch (err) {
        const message = err?.message || String(err);
        onStatus('MONITOR_READ_ERROR', `Read failure: ${message}`);
        onFailure(message);
      } finally {
        if (this.reader) {
          this.reader.releaseLock();
          this.reader = null;
        }
      }
    }

    if (this.isReading) {
      onStatus('MONITOR_UNPLUGGED', 'Monitor stopped due to unplug/disconnect condition.');
      onFailure('Port disconnected or became unavailable.');
      await this.disconnect(onStatus);
    }
  }
}
