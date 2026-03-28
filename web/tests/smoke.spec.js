const { test, expect } = require('@playwright/test');

async function openWithCapabilities(page, { secure = true, serial = true, gamepad = true } = {}) {
  await page.addInitScript(({ secureContext, hasSerial, hasGamepad }) => {
    Object.defineProperty(window, 'isSecureContext', {
      configurable: true,
      value: secureContext,
    });

    if (hasSerial) {
      Object.defineProperty(navigator, 'serial', {
        configurable: true,
        value: { requestPort: async () => ({}) },
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
  }, { secureContext: secure, hasSerial: serial, hasGamepad: gamepad });

  await page.goto('/index.html');
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
