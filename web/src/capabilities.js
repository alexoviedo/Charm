export function evaluateCapabilities(env = {}) {
  const secureContext = Boolean(env.isSecureContext);
  const webSerialSupported = Boolean(env.hasSerial);
  const gamepadSupported = Boolean(env.hasGamepad);

  const environmentState = !secureContext
    ? 'insecure_context'
    : webSerialSupported
      ? 'supported'
      : 'unsupported_browser';

  const checks = {
    secure: secureContext,
    serial: webSerialSupported && secureContext,
    gamepad: gamepadSupported,
    config_transport: webSerialSupported && secureContext,
    none: true,
  };

  return {
    environmentState,
    checks,
    messages: buildMessages({ secureContext, webSerialSupported, gamepadSupported }),
  };
}

export function buildMessages({ secureContext, webSerialSupported, gamepadSupported }) {
  const messages = [];

  if (!secureContext) {
    messages.push({
      level: 'error',
      code: 'insecure_context',
      text: 'Insecure context: serve over HTTPS or localhost before using Web Serial features.',
    });
  }

  if (secureContext && !webSerialSupported) {
    messages.push({
      level: 'error',
      code: 'unsupported_browser',
      text: 'Unsupported browser: Web Serial API is unavailable. Use a Chromium-based desktop browser.',
    });
  }

  if (!gamepadSupported) {
    messages.push({
      level: 'warn',
      code: 'gamepad_unavailable',
      text: 'Gamepad API is unavailable. Validation section remains partially disabled.',
    });
  }

  if (secureContext && webSerialSupported && gamepadSupported) {
    messages.push({
      level: 'success',
      code: 'supported_environment',
      text: 'Supported environment detected for planned Web Serial + Gamepad validation flows.',
    });
  } else if (secureContext && webSerialSupported) {
    messages.push({
      level: 'success',
      code: 'serial_ready',
      text: 'Web Serial is available. Config transport can use the serial-first path once permission/ownership gates are satisfied.',
    });
  }

  messages.push({
    level: 'info',
    code: 'serial_config_transport_ready',
    text: 'Device config write/persist uses serial-first transport. BLE config transport remains deferred.',
  });

  return messages;
}
