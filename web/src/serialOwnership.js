/**
 * WR-006 Serial ownership and permission model.
 *
 * Goals:
 * - exactly one serial owner at a time
 * - explicit permission and contention states
 * - feature-agnostic arbitration for future flash/console sessions
 */

export const SerialPermissionState = {
  UNKNOWN: 'unknown',
  REQUESTING: 'requesting_permission',
  GRANTED: 'permission_granted',
  DENIED: 'permission_denied',
  CANCELLED: 'request_cancelled',
  PORT_BUSY: 'port_busy',
  UNSUPPORTED: 'unsupported',
};

export const SerialOwner = {
  NONE: 'none',
  FLASH: 'flash',
  CONSOLE: 'console',
};

export function createSerialOwnershipModel() {
  const state = {
    permission: SerialPermissionState.UNKNOWN,
    owner: SerialOwner.NONE,
    port: null,
    lastError: null,
    infoMessage: 'Serial ownership idle. No owner currently assigned.',
  };

  function snapshot() {
    return { ...state };
  }

  function setInfo(message) {
    state.infoMessage = message;
  }

  async function requestPermission(requestPortImpl) {
    state.permission = SerialPermissionState.REQUESTING;
    state.lastError = null;
    setInfo('Requesting serial permission...');

    try {
      const port = await requestPortImpl();
      state.port = port;
      state.permission = SerialPermissionState.GRANTED;
      setInfo('Serial permission granted. Assign an owner (flash or console).');
      return snapshot();
    } catch (err) {
      const mapped = mapPermissionError(err);
      state.permission = mapped;
      state.lastError = err?.message || String(err);
      state.port = null;

      if (mapped === SerialPermissionState.CANCELLED) {
        setInfo('Serial permission request was cancelled by the user.');
      } else if (mapped === SerialPermissionState.DENIED) {
        setInfo('Serial permission denied by browser or policy.');
      } else if (mapped === SerialPermissionState.PORT_BUSY) {
        setInfo('Serial port appears busy/in use by another process or tab.');
      } else {
        setInfo('Serial permission request failed.');
      }

      return snapshot();
    }
  }

  function claimOwner(nextOwner) {
    if (state.permission !== SerialPermissionState.GRANTED) {
      state.lastError = 'Cannot assign serial owner without granted permission.';
      setInfo('Owner claim rejected: serial permission is not granted.');
      return { ok: false, state: snapshot() };
    }

    if (state.owner !== SerialOwner.NONE && state.owner !== nextOwner) {
      state.lastError = `Serial owner conflict: currently owned by ${state.owner}.`;
      setInfo(`Owner claim rejected: ${state.owner} currently owns the serial resource.`);
      return { ok: false, state: snapshot() };
    }

    state.owner = nextOwner;
    state.lastError = null;
    setInfo(`Serial ownership assigned to ${nextOwner}.`);
    return { ok: true, state: snapshot() };
  }

  function handoffOwner(nextOwner) {
    if (state.permission !== SerialPermissionState.GRANTED) {
      state.lastError = 'Cannot hand off owner without granted permission.';
      setInfo('Owner handoff rejected: serial permission is not granted.');
      return { ok: false, state: snapshot() };
    }

    if (state.owner === SerialOwner.NONE) {
      state.lastError = 'Cannot hand off owner when no current owner is active.';
      setInfo('Owner handoff rejected: no current owner.');
      return { ok: false, state: snapshot() };
    }

    if (state.owner === nextOwner) {
      state.lastError = null;
      setInfo(`Owner handoff not required: ${nextOwner} already owns serial.`);
      return { ok: true, state: snapshot() };
    }

    const prev = state.owner;
    state.owner = nextOwner;
    state.lastError = null;
    setInfo(`Serial ownership handed off from ${prev} to ${nextOwner}.`);
    return { ok: true, state: snapshot() };
  }

  function releaseOwner() {
    if (state.owner === SerialOwner.NONE) {
      setInfo('Release ignored: no active serial owner.');
      return snapshot();
    }

    const prev = state.owner;
    state.owner = SerialOwner.NONE;
    state.lastError = null;
    setInfo(`Serial owner released from ${prev}.`);
    return snapshot();
  }

  async function clearPermission() {
    try {
      if (state.port && typeof state.port.forget === 'function') {
        await state.port.forget();
      }
    } catch {
      // no-op: permission clear should be best-effort in this static model
    }

    state.port = null;
    state.permission = SerialPermissionState.UNKNOWN;
    state.owner = SerialOwner.NONE;
    state.lastError = null;
    setInfo('Serial permission cleared and ownership reset.');
    return snapshot();
  }

  return {
    snapshot,
    requestPermission,
    claimOwner,
    handoffOwner,
    releaseOwner,
    clearPermission,
  };
}

export function mapPermissionError(err) {
  const name = err?.name || '';
  const message = String(err?.message || '').toLowerCase();

  if (name === 'NotFoundError') return SerialPermissionState.CANCELLED;
  if (name === 'SecurityError') return SerialPermissionState.DENIED;
  if (name === 'NetworkError' || message.includes('already open') || message.includes('busy')) {
    return SerialPermissionState.PORT_BUSY;
  }

  return SerialPermissionState.DENIED;
}
