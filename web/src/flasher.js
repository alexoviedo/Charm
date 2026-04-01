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

import { md5HexFromBinaryString } from './md5.js';

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

      // WR-007 Professional Hot Patch: Fix esptool-js 0.4.3 binary string corruption bug.
      // Modifies the instance method to use charCodeAt/fromCharCode instead of incorrect parseInt/toString.
      this.loader._updateImageFlashParams = function (image, address, flash_size, flash_mode, flash_freq) {
        if (this.debug) this.debug(`_update_image_flash_params ${flash_size} ${flash_mode} ${flash_freq}`);
        if (image.length < 8) return image;
        if (address !== this.chip.BOOTLOADER_FLASH_OFFSET) return image;
        if (flash_size === 'keep' && flash_mode === 'keep' && flash_freq === 'keep') {
          if (this.info) this.info('Not changing the image');
          return image;
        }
        const magic = image.charCodeAt(0) & 0xff;
        let mode = image.charCodeAt(2) & 0xff;
        const speed = image.charCodeAt(3) & 0xff;
        if (magic !== this.ESP_IMAGE_MAGIC) {
          if (this.info) this.info(`Warning: Image file at 0x${address.toString(16)} doesn't look like an image file, so not changing any flash settings.`);
          return image;
        }
        if (flash_mode !== 'keep') {
          const flash_modes = { qio: 0, qout: 1, dio: 2, dout: 3 };
          mode = flash_modes[flash_mode];
        }
        let freq = speed & 0x0f;
        if (flash_freq !== 'keep') {
          const flash_freqs = { '40m': 0, '26m': 1, '20m': 2, '80m': 15 };
          freq = flash_freqs[flash_freq];
        }
        let size = speed & 0xf0;
        if (flash_size !== 'keep') {
          size = this.parseFlashSizeArg(flash_size);
        }
        const params = mode << 8 | (freq + size);
        if (this.info) this.info(`Flash params set to ${params.toString(16)}`);
        if ((image.charCodeAt(2) & 0xff) !== mode) {
          image = image.substring(0, 2) + String.fromCharCode(mode < 0x80 ? mode : 0xf700 | mode) + image.substring(3);
        }
        if ((image.charCodeAt(3) & 0xff) !== (freq + size)) {
          const val = freq + size;
          image = image.substring(0, 3) + String.fromCharCode(val < 0x80 ? val : 0xf700 | val) + image.substring(4);
        }
        return image;
      };

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
      return new TextDecoder('x-user-defined').decode(new Uint8Array(buffer));
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
const ESPTOOL_BROWSER_MODULE_URL = new URL('../vendor/esptool-js-0.4.3.esm.js', import.meta.url).href;

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
