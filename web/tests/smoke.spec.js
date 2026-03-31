const { test, expect } = require('@playwright/test');

async function openWithCapabilities(page, { secure = true, serial = true, gamepad = true, serialInitiallyOpen = false } = {}) {
  await page.addInitScript(({ secureContext, hasSerial, hasGamepad, serialPortInitiallyOpen }) => {
    Object.defineProperty(window, 'isSecureContext', {
      configurable: true,
      value: secureContext,
    });

    if (hasSerial) {
      const pendingRead = new Promise(() => {});
      const reader = {
        read: () => pendingRead,
        cancel: async () => {},
        releaseLock: () => {},
      };
      const port = {
        readable: serialPortInitiallyOpen ? { getReader: () => reader } : null,
        writable: serialPortInitiallyOpen ? {} : null,
        openCalls: [],
        closeCalls: 0,
        lastOpenOptions: null,
        async open(options) {
          this.lastOpenOptions = options;
          this.openCalls.push(options);
          this.readable = { getReader: () => reader };
          this.writable = {};
        },
        async close() {
          this.closeCalls += 1;
          this.readable = null;
          this.writable = null;
        },
        async forget() {},
      };
      window.__mockSerialPort = port;
      Object.defineProperty(navigator, 'serial', {
        configurable: true,
        value: { requestPort: async () => port },
      });
    } else {
      Object.defineProperty(navigator, 'serial', {
        configurable: true,
        value: undefined,
      });
    }

    if (hasGamepad) {
      Object.defineProperty(navigator, 'getGamepads', {
        configurable: true,
        value: () => [],
      });
    } else {
      Object.defineProperty(navigator, 'getGamepads', {
        configurable: true,
        value: undefined,
      });
    }
  }, { secureContext: secure, hasSerial: serial, hasGamepad: gamepad, serialPortInitiallyOpen: serialInitiallyOpen });

  await page.goto('/index.html');
}

async function mockSameSiteArtifacts(page) {
  const manifest = {
    version: 'test-smoke',
    target: 'esp32s3',
    files: {
      bootloader: 'bootloader.bin',
      partition_table: 'partition-table.bin',
      app: 'charm.bin',
    },
  };

  await page.route('**/firmware/manifest.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(manifest),
    });
  });

  const binaryBody = Buffer.from([0x00, 0x01, 0x02, 0x03]);
  for (const filename of ['bootloader.bin', 'partition-table.bin', 'charm.bin']) {
    await page.route(`**/firmware/${filename}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/octet-stream',
        body: binaryBody,
      });
    });
  }
}

async function mockBrowserSafeEsptoolModule(page) {
  await page.route('https://cdn.jsdelivr.net/npm/esptool-js@0.4.3/+esm', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        export class Transport {
          constructor(port) { this.port = port; this.baudrate = 115200; }
          async disconnect() {}
        }
        export class ESPLoader {
          constructor(options) {
            this.options = options;
            this.chip = {
              CHIP_NAME: 'ESP32-S3',
              async readMac() { return [0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF]; },
            };
          }
          async main() { return 'ESP32-S3'; }
          async writeFlash({ reportProgress }) {
            reportProgress?.(0, 4, 4);
            reportProgress?.(1, 4, 4);
            reportProgress?.(2, 4, 4);
          }
          async hardReset() {}
        }
      `,
    });
  });
}

test('shell renders top-level runtime sections', async ({ page }) => {
  await openWithCapabilities(page, { secure: true, serial: true, gamepad: true });

  await expect(page.getByRole('heading', { name: 'Charm Control Center' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Flash', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Console', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Config', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Validate', exact: true })).toBeVisible();
});

test('capability banner shows supported environment in secure + serial context', async ({ page }) => {
  await openWithCapabilities(page, { secure: true, serial: true, gamepad: true });
  await expect(page.locator('#env-heading')).toHaveText('Supported Environment');
  await expect(page.locator('#capability-messages')).toContainText('serial-first transport');
});

test('capability banner shows unsupported browser when serial is missing', async ({ page }) => {
  await openWithCapabilities(page, { secure: true, serial: false, gamepad: true });
  await expect(page.locator('#env-heading')).toHaveText('Unsupported Browser');
  await expect(page.locator('#capability-messages')).toContainText('Web Serial API is unavailable');
});

test('capability banner shows insecure context warning', async ({ page }) => {
  await openWithCapabilities(page, { secure: false, serial: true, gamepad: true });
  await expect(page.locator('#env-heading')).toHaveText('Insecure Context');
  await expect(page.locator('#capability-messages')).toContainText('Insecure context');
});

test('config panel renders operator guidance and device command controls', async ({ page }) => {
  await openWithCapabilities(page, { secure: true, serial: true, gamepad: true });
  await page.getByRole('button', { name: 'Config' }).click();

  await expect(page.getByRole('heading', { name: 'Operator Guidance (Config Transport)' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Device: Get Capabilities' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Device: Load Config' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Device: Persist Local Draft' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Device: Clear Config' })).toBeVisible();
  await expect(page.locator('#cfg-write-status')).toContainText('CONFIG_DEVICE');
});

test('artifact mode toggle preserves flow affordances', async ({ page }) => {
  await openWithCapabilities(page, { secure: true, serial: true, gamepad: true });
  await page.getByRole('combobox', { name: 'Source mode' }).selectOption('manual_local_import');
  await expect(page.locator('#artifact-local-picker-wrap')).toBeVisible();
  await expect(page.locator('#artifact-load-site-btn')).toBeHidden();
});

test('identify path succeeds with current esptool-js camelCase API surface', async ({ page }) => {
  await mockBrowserSafeEsptoolModule(page);
  await mockSameSiteArtifacts(page);
  await openWithCapabilities(page, { secure: true, serial: true, gamepad: true });

  await page.getByRole('button', { name: 'Request Serial Permission' }).click();
  await page.getByRole('button', { name: 'Claim Owner: Flash' }).click();
  await page.getByRole('button', { name: 'Load Same-Site Artifacts' }).click();

  await expect(page.locator('#artifact-status')).toContainText('Same-site artifact bundle loaded and validated.');
  await expect(page.locator('#artifact-summary')).toContainText('esp32s3');

  await page.getByRole('button', { name: 'Identify Device (Flashing Path)' }).click();

  await expect(page.locator('#flash-status')).toContainText('FLASH_IDENTIFIED');
  await expect(page.locator('#flash-device-info')).toContainText('ESP32-S3');
  await expect(page.locator('#flash-status')).not.toContainText('Failed to resolve module specifier "pako"');
  await expect(page.locator('#flash-status')).not.toContainText('Buffer is not defined');
  await expect(page.locator('#flash-status')).not.toContainText('read_mac is not a function');
});

test('flash path completes and returns to post-flash idle ownership state', async ({ page }) => {
  await mockBrowserSafeEsptoolModule(page);
  await mockSameSiteArtifacts(page);
  await openWithCapabilities(page, { secure: true, serial: true, gamepad: true });

  await page.getByRole('button', { name: 'Request Serial Permission' }).click();
  await page.getByRole('button', { name: 'Claim Owner: Flash' }).click();
  await page.getByRole('button', { name: 'Load Same-Site Artifacts' }).click();
  await page.getByRole('button', { name: 'Identify Device (Flashing Path)' }).click();
  await expect(page.locator('#flash-status')).toContainText('FLASH_IDENTIFIED');

  await page.getByRole('button', { name: 'Flash Firmware Bundle' }).click();

  await expect(page.locator('#flash-progress-label')).toContainText('100%');
  await expect(page.locator('#serial-owner-state')).toHaveText('none');
  await expect(page.locator('#serial-model-message')).toContainText('handoff=flash_to_console_ready');
  await expect(page.locator('#flash-status')).toContainText('FLASH_BLOCKED');
  await expect(page.locator('#flash-status')).not.toContainText('FLASH_FAILED');
  await expect(page.locator('#flash-status')).not.toContainText('write_flash is not a function');
  await expect(page.locator('#flash-status')).not.toContainText('hard_reset is not a function');
});

test('monitor reconnect forces port reopen at 115200 baud when port is already open', async ({ page }) => {
  await openWithCapabilities(page, { secure: true, serial: true, gamepad: true, serialInitiallyOpen: true });

  await page.getByRole('button', { name: 'Request Serial Permission' }).click();
  await page.getByRole('button', { name: 'Claim Owner: Console' }).click();
  await page.getByRole('button', { name: 'Connect Monitor' }).click();

  await expect(page.locator('#monitor-status')).toContainText('MONITOR_CONNECTED');
  await expect(page.locator('#monitor-status')).toContainText('115200');

  const portState = await page.evaluate(() => ({
    closeCalls: window.__mockSerialPort.closeCalls,
    lastOpenOptions: window.__mockSerialPort.lastOpenOptions,
  }));

  expect(portState.closeCalls).toBe(1);
  expect(portState.lastOpenOptions.baudRate).toBe(115200);
});
