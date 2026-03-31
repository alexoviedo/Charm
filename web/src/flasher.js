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

const ROM_BAUDRATE = 115200;
const FLASH_BAUDRATE = 921600;

export class WebFlasherService {
  constructor() {
    this.transport = null;
    this.loader = null;
    this.esptool = null;
  }

  async connectAndIdentify(port, hooks = {}) {
    const { onStatus = () => {}, terminal = null } = hooks;

    if (!port) {
      throw new Error('No serial port available for flashing path.');
    }

    await this.cleanup();
    onStatus('FLASH_CONNECTING', 'Connecting to bootloader...');

    try {
      this.esptool = this.esptool || (await importEsptoolJs());
      this.transport = new this.esptool.Transport(port);
      this.loader = new this.esptool.ESPLoader({
        transport: this.transport,
        romBaudrate: ROM_BAUDRATE,
        baudrate: FLASH_BAUDRATE,
        terminal: buildTerminalAdapter(terminal),
      });

      const chip = await invokeCompatibleMethod(this.loader, ['main']);
      const mac = await readLoaderMacAddress(this.loader);
      const chipString = normalizeChipName(chip, this.loader);
      const macString = normalizeMac(mac);

      onStatus('FLASH_IDENTIFIED', `Connected to ${chipString} (${macString}).`);
      return { chip: chipString, mac: macString };
    } catch (err) {
      await this.cleanup();
      throw err;
    }
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
      return new TextDecoder('latin1').decode(new Uint8Array(buffer));
    };

    const fileArray = [
      { data: toBinaryString(bundle.binaries.bootloader), address: parseInt(bundle.flashLayout.bootloader, 16) },
      { data: toBinaryString(bundle.binaries.partition_table), address: parseInt(bundle.flashLayout.partition_table, 16) },
      { data: toBinaryString(bundle.binaries.app), address: parseInt(bundle.flashLayout.app, 16) },
    ];

    onStatus('FLASH_WRITING', 'Writing firmware artifacts...');
    await invokeCompatibleMethod(this.loader, ['writeFlash', 'write_flash'], [{
      fileArray,
      flashSize: 'keep',
      flashMode: 'keep',
      flashFreq: 'keep',
      eraseAll: false,
      compress: true,
      calculateMD5Hash: (image) => calculateMd5Hash(image),
      reportProgress: (fileIndex, written, total) => {
        const pct = total > 0 ? Math.round((written / total) * 100) : 0;
        onProgress({ fileIndex, written, total, pct });
      },
    }]);

    onStatus('FLASH_RESETTING', 'Flash complete. Resetting device...');
    await invokeCompatibleMethod(this.loader, ['hardReset', 'hard_reset']);
    onStatus('FLASH_DONE', 'Flash and reset completed successfully.');
  }

  async cleanup() {
    try {
      if (this.transport && typeof this.transport.disconnect === 'function') {
        await this.transport.disconnect();
      }
    } finally {
      this.loader = null;
      this.transport = null;
    }
  }
}

let esptoolModulePromise = null;
/**
 * Use a browser-safe, version-pinned ESM endpoint rather than the raw package
 * entry. The raw `lib/index.js` export chain leaves bare npm specifiers like
 * `pako` unresolved in browsers, while the `+esm` endpoint rewrites/bundles
 * those dependencies into browser-loadable modules.
 */
const ESPTOOL_BROWSER_MODULE_URL = '../vendor/esptool-js-0.4.3.esm.js';

async function importEsptoolJs() {
  if (!esptoolModulePromise) {
    esptoolModulePromise = import(ESPTOOL_BROWSER_MODULE_URL)
      .then((mod) => {
        const resolved = resolveEsptoolModule(mod);
        if (!resolved?.Transport || !resolved?.ESPLoader) {
          throw new Error('esptool-js module missing required exports.');
        }
        return resolved;
      })
      .catch((err) => {
        esptoolModulePromise = null;
        throw new Error(`Failed to load browser-safe esptool-js module: ${err?.message || String(err)}`);
      });
  }
  return esptoolModulePromise;
}

function resolveEsptoolModule(mod) {
  if (mod?.Transport && mod?.ESPLoader) {
    return mod;
  }
  if (mod?.default?.Transport && mod?.default?.ESPLoader) {
    return mod.default;
  }
  return mod;
}

function buildTerminalAdapter(terminal) {
  return {
    clean: () => terminal?.clear?.(),
    writeLine: (data) => terminal?.writeln?.(data),
    write: (data) => terminal?.write?.(data),
  };
}

function getCompatibleMethod(target, methodNames) {
  if (!target) return null;
  for (const methodName of methodNames) {
    if (typeof target[methodName] === 'function') {
      return target[methodName].bind(target);
    }
  }
  return null;
}

async function invokeCompatibleMethod(target, methodNames, args = []) {
  const method = getCompatibleMethod(target, methodNames);
  if (!method) {
    throw new Error(`esptool-js object is missing compatible method: ${methodNames.join(' or ')}`);
  }
  return method(...args);
}

async function readLoaderMacAddress(loader) {
  const chipMethod = getCompatibleMethod(loader?.chip, ['readMac', 'read_mac']);
  if (chipMethod) {
    return chipMethod(loader);
  }

  const loaderMethod = getCompatibleMethod(loader, ['readMac', 'read_mac']);
  if (loaderMethod) {
    return loaderMethod();
  }

  throw new Error('esptool-js loader is missing a compatible MAC read method.');
}

function normalizeChipName(chip, loader) {
  if (typeof chip === 'string' && chip.trim()) {
    return chip.trim();
  }
  if (typeof loader?.chip?.CHIP_NAME === 'string' && loader.chip.CHIP_NAME.trim()) {
    return loader.chip.CHIP_NAME.trim();
  }
  return String(chip ?? 'unknown');
}

function normalizeMac(mac) {
  if (typeof mac === 'string') {
    return mac.toUpperCase();
  }
  if (Array.isArray(mac) || mac instanceof Uint8Array) {
    return Array.from(mac)
      .map((b) => Number(b).toString(16).padStart(2, '0'))
      .join(':')
      .toUpperCase();
  }
  return String(mac ?? 'unknown');
}

function calculateMd5Hash(image) {
  return md5HexFromBinaryString(image);
}
import { md5HexFromBinaryString } from './md5.js';
