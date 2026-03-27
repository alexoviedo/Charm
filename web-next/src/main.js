import { evaluateCapabilities } from './capabilities.js';
import { loadFromManualFiles, loadFromSameSite } from './artifacts.js';
import { createSerialOwnershipModel, SerialOwner, SerialPermissionState } from './serialOwnership.js';
import { WebFlasherService } from './flasher.js';
import { SerialMonitorService } from './monitor.js';
import { createDefaultDraft, normalizeDraft, parseDraftJson, summarizeDraft, validateDraft } from './configDraft.js';

const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
const panels = Array.from(document.querySelectorAll('.panel'));

const banner = document.getElementById('environment-banner');
const envHeading = document.getElementById('env-heading');
const envSummary = document.getElementById('env-summary');
const capabilityMessages = document.getElementById('capability-messages');
const capabilityChips = document.getElementById('capability-chips');
const actionButtons = Array.from(document.querySelectorAll('.action-btn'));

const artifactMode = document.getElementById('artifact-mode');
const loadSameSiteBtn = document.getElementById('artifact-load-site-btn');
const localPickerWrap = document.getElementById('artifact-local-picker-wrap');
const localFileInput = document.getElementById('artifact-local-files');
const loadLocalBtn = document.getElementById('artifact-load-local-btn');
const artifactStatus = document.getElementById('artifact-status');
const artifactSummary = document.getElementById('artifact-summary');

const serialPermissionStateEl = document.getElementById('serial-permission-state');
const serialOwnerStateEl = document.getElementById('serial-owner-state');
const serialModelMessageEl = document.getElementById('serial-model-message');
const serialRequestBtn = document.getElementById('serial-request-permission-btn');
const serialClaimFlashBtn = document.getElementById('serial-claim-flash-btn');
const serialClaimConsoleBtn = document.getElementById('serial-claim-console-btn');
const serialReleaseBtn = document.getElementById('serial-release-btn');
const serialResetBtn = document.getElementById('serial-reset-btn');

const flashIdentifyBtn = document.getElementById('flash-identify-btn');
const flashExecuteBtn = document.getElementById('flash-execute-btn');
const flashStatusEl = document.getElementById('flash-status');
const flashProgressEl = document.getElementById('flash-progress');
const flashProgressLabelEl = document.getElementById('flash-progress-label');
const flashDeviceInfoEl = document.getElementById('flash-device-info');

const monitorConnectBtn = document.getElementById('monitor-connect-btn');
const monitorDisconnectBtn = document.getElementById('monitor-disconnect-btn');
const monitorClearBtn = document.getElementById('monitor-clear-btn');
const monitorAutoScroll = document.getElementById('monitor-autoscroll');
const monitorStatusEl = document.getElementById('monitor-status');
const monitorOutputEl = document.getElementById('monitor-output');

const testerStatusEl = document.getElementById('tester-status');
const testerNoControllerEl = document.getElementById('tester-no-controller');
const testerButtonsEl = document.getElementById('tester-buttons');
const testerAxesEl = document.getElementById('tester-axes');
const testerNeutralEl = document.getElementById('tester-neutral');

const cfgNameEl = document.getElementById('cfg-name');
const cfgAuthorEl = document.getElementById('cfg-author');
const cfgRevisionEl = document.getElementById('cfg-revision');
const cfgUpdatedAtEl = document.getElementById('cfg-updated-at');
const cfgNotesEl = document.getElementById('cfg-notes');
const cfgGlobalScaleEl = document.getElementById('cfg-global-scale');
const cfgGlobalDeadzoneEl = document.getElementById('cfg-global-deadzone');
const cfgGlobalClampMinEl = document.getElementById('cfg-global-clamp-min');
const cfgGlobalClampMaxEl = document.getElementById('cfg-global-clamp-max');
const cfgAxisMoveXIndexEl = document.getElementById('cfg-axis-move-x-index');
const cfgAxisMoveXScaleEl = document.getElementById('cfg-axis-move-x-scale');
const cfgAxisMoveXDeadzoneEl = document.getElementById('cfg-axis-move-x-deadzone');
const cfgAxisMoveXInvertEl = document.getElementById('cfg-axis-move-x-invert');
const cfgAxisMoveYIndexEl = document.getElementById('cfg-axis-move-y-index');
const cfgAxisMoveYScaleEl = document.getElementById('cfg-axis-move-y-scale');
const cfgAxisMoveYDeadzoneEl = document.getElementById('cfg-axis-move-y-deadzone');
const cfgAxisMoveYInvertEl = document.getElementById('cfg-axis-move-y-invert');
const cfgButtonActionAIndexEl = document.getElementById('cfg-button-action-a-index');
const cfgButtonActionBIndexEl = document.getElementById('cfg-button-action-b-index');
const cfgButtonMenuIndexEl = document.getElementById('cfg-button-menu-index');
const cfgValidateBtn = document.getElementById('cfg-validate-btn');
const cfgResetBtn = document.getElementById('cfg-reset-btn');
const cfgImportFileEl = document.getElementById('cfg-import-file');
const cfgImportBtn = document.getElementById('cfg-import-btn');
const cfgExportBtn = document.getElementById('cfg-export-btn');
const cfgSaveBrowserBtn = document.getElementById('cfg-save-browser-btn');
const cfgLoadBrowserBtn = document.getElementById('cfg-load-browser-btn');
const cfgClearBrowserBtn = document.getElementById('cfg-clear-browser-btn');
const cfgStatusEl = document.getElementById('cfg-status');
const cfgLocalFileStatusEl = document.getElementById('cfg-local-file-status');
const cfgLocalStorageStatusEl = document.getElementById('cfg-local-storage-status');
const cfgErrorsEl = document.getElementById('cfg-errors');
const cfgSummaryEl = document.getElementById('cfg-summary');

const serialModel = createSerialOwnershipModel();
const flasherService = new WebFlasherService();
const monitorService = new SerialMonitorService();

const artifactState = { mode: 'same_site_manifest', bundle: null };
const flashState = { identified: null, inProgress: false, lastError: null };
const monitorState = { connected: false, connecting: false, lastError: null };
const configState = {
  draft: createDefaultDraft(),
  validation: { ok: true, errors: [] },
};
const CONFIG_DRAFT_LOCAL_KEY = 'charm_web_next_config_draft_v1';
const sessionState = {
  activeFlow: 'idle',
  handoffState: 'none',
  lastTransportError: null,
};
const testerState = {
  rafId: null,
  lastVisibleGamepadId: null,
};

function activate(targetId) {
  navButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.target === targetId));
  panels.forEach((panel) => {
    const isActive = panel.id === targetId;
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });
}

function setConfigStatus(text, type = 'info') {
  cfgStatusEl.textContent = text;
  cfgStatusEl.className = `artifact-status ${type}`;
}

function setConfigLocalFileStatus(text, type = 'info') {
  cfgLocalFileStatusEl.textContent = text;
  cfgLocalFileStatusEl.className = `artifact-status ${type}`;
}

function setConfigLocalStorageStatus(text, type = 'info') {
  cfgLocalStorageStatusEl.textContent = text;
  cfgLocalStorageStatusEl.className = `artifact-status ${type}`;
}

function readConfigInputsIntoDraft() {
  const draft = configState.draft;
  draft.metadata.name = cfgNameEl.value.trim();
  draft.metadata.author = cfgAuthorEl.value.trim();
  draft.metadata.revision = cfgRevisionEl.value;
  draft.metadata.notes = cfgNotesEl.value;

  draft.global.scale = cfgGlobalScaleEl.value;
  draft.global.deadzone = cfgGlobalDeadzoneEl.value;
  draft.global.clampMin = cfgGlobalClampMinEl.value;
  draft.global.clampMax = cfgGlobalClampMaxEl.value;

  draft.axes.move_x.index = cfgAxisMoveXIndexEl.value;
  draft.axes.move_x.scale = cfgAxisMoveXScaleEl.value;
  draft.axes.move_x.deadzone = cfgAxisMoveXDeadzoneEl.value;
  draft.axes.move_x.invert = cfgAxisMoveXInvertEl.checked;

  draft.axes.move_y.index = cfgAxisMoveYIndexEl.value;
  draft.axes.move_y.scale = cfgAxisMoveYScaleEl.value;
  draft.axes.move_y.deadzone = cfgAxisMoveYDeadzoneEl.value;
  draft.axes.move_y.invert = cfgAxisMoveYInvertEl.checked;

  draft.buttons.action_a.index = cfgButtonActionAIndexEl.value;
  draft.buttons.action_b.index = cfgButtonActionBIndexEl.value;
  draft.buttons.menu.index = cfgButtonMenuIndexEl.value;

  normalizeDraft(draft);
  return draft;
}

function renderConfigInputsFromDraft() {
  const draft = configState.draft;
  cfgNameEl.value = draft.metadata.name;
  cfgAuthorEl.value = draft.metadata.author;
  cfgRevisionEl.value = draft.metadata.revision;
  cfgUpdatedAtEl.value = draft.metadata.updatedAt;
  cfgNotesEl.value = draft.metadata.notes;

  cfgGlobalScaleEl.value = draft.global.scale;
  cfgGlobalDeadzoneEl.value = draft.global.deadzone;
  cfgGlobalClampMinEl.value = draft.global.clampMin;
  cfgGlobalClampMaxEl.value = draft.global.clampMax;

  cfgAxisMoveXIndexEl.value = draft.axes.move_x.index;
  cfgAxisMoveXScaleEl.value = draft.axes.move_x.scale;
  cfgAxisMoveXDeadzoneEl.value = draft.axes.move_x.deadzone;
  cfgAxisMoveXInvertEl.checked = draft.axes.move_x.invert;

  cfgAxisMoveYIndexEl.value = draft.axes.move_y.index;
  cfgAxisMoveYScaleEl.value = draft.axes.move_y.scale;
  cfgAxisMoveYDeadzoneEl.value = draft.axes.move_y.deadzone;
  cfgAxisMoveYInvertEl.checked = draft.axes.move_y.invert;

  cfgButtonActionAIndexEl.value = draft.buttons.action_a.index;
  cfgButtonActionBIndexEl.value = draft.buttons.action_b.index;
  cfgButtonMenuIndexEl.value = draft.buttons.menu.index;
}

function renderConfigValidation() {
  cfgErrorsEl.innerHTML = '';
  if (configState.validation.errors.length === 0) {
    const ok = document.createElement('li');
    ok.textContent = 'No validation errors.';
    ok.style.color = 'var(--accent-2)';
    cfgErrorsEl.appendChild(ok);
    setConfigStatus('CONFIG_LOCAL_VALID: Local draft passes validation checks.', 'success');
  } else {
    configState.validation.errors.forEach((error) => {
      const item = document.createElement('li');
      item.textContent = error;
      cfgErrorsEl.appendChild(item);
    });
    setConfigStatus('CONFIG_LOCAL_INVALID: Resolve listed draft issues.', 'error');
  }
}

function renderConfigSummary() {
  cfgSummaryEl.textContent = summarizeDraft(configState.draft);
  cfgUpdatedAtEl.value = configState.draft.metadata.updatedAt;
}

function applyDraftAndRender(nextDraft, statusMessage = 'CONFIG_LOCAL: Draft updated.') {
  configState.draft = normalizeDraft(nextDraft);
  configState.validation = validateDraft(configState.draft);
  renderConfigInputsFromDraft();
  renderConfigValidation();
  renderConfigSummary();
  setConfigStatus(statusMessage, configState.validation.ok ? 'success' : 'error');
}

function exportDraftToLocalFile() {
  const json = summarizeDraft(configState.draft);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const a = document.createElement('a');
  a.href = url;
  a.download = `charm-config-draft-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setConfigLocalFileStatus('CONFIG_LOCAL_FILE_EXPORT_OK: Draft exported to local JSON file.', 'success');
}

async function importDraftFromLocalFile() {
  const file = cfgImportFileEl.files?.[0];
  if (!file) {
    setConfigLocalFileStatus('CONFIG_LOCAL_FILE_IMPORT_ERROR: Select a .json file before importing.', 'error');
    return;
  }
  if (!file.name.toLowerCase().endsWith('.json')) {
    setConfigLocalFileStatus('CONFIG_LOCAL_FILE_IMPORT_ERROR: File must have .json extension.', 'error');
    return;
  }

  try {
    const text = await file.text();
    const parsed = parseDraftJson(text);
    applyDraftAndRender(parsed, 'CONFIG_LOCAL_IMPORT_OK: Draft imported and validated from local file.');
    setConfigLocalFileStatus('CONFIG_LOCAL_FILE_IMPORT_OK: Local JSON import completed.', 'success');
  } catch (err) {
    setConfigLocalFileStatus(`CONFIG_LOCAL_FILE_IMPORT_ERROR: ${err.message || String(err)}`, 'error');
    setConfigStatus('CONFIG_LOCAL_INVALID: Imported file could not be applied.', 'error');
  }
}

function saveDraftToBrowserStorage() {
  try {
    localStorage.setItem(CONFIG_DRAFT_LOCAL_KEY, summarizeDraft(configState.draft));
    setConfigLocalStorageStatus('CONFIG_LOCAL_STORAGE_SAVE_OK: Draft saved in this browser only.', 'success');
  } catch (err) {
    setConfigLocalStorageStatus(`CONFIG_LOCAL_STORAGE_SAVE_ERROR: ${err.message || String(err)}`, 'error');
  }
}

function loadDraftFromBrowserStorage() {
  try {
    const raw = localStorage.getItem(CONFIG_DRAFT_LOCAL_KEY);
    if (!raw) {
      setConfigLocalStorageStatus('CONFIG_LOCAL_STORAGE_LOAD_ERROR: No local browser draft was found.', 'error');
      return;
    }
    const parsed = parseDraftJson(raw);
    applyDraftAndRender(parsed, 'CONFIG_LOCAL_STORAGE_LOAD_OK: Draft loaded from browser-local storage.');
    setConfigLocalStorageStatus('CONFIG_LOCAL_STORAGE_LOAD_OK: Loaded browser-local draft.', 'success');
  } catch (err) {
    setConfigLocalStorageStatus(`CONFIG_LOCAL_STORAGE_LOAD_ERROR: ${err.message || String(err)}`, 'error');
  }
}

function clearDraftFromBrowserStorage() {
  localStorage.removeItem(CONFIG_DRAFT_LOCAL_KEY);
  setConfigLocalStorageStatus('CONFIG_LOCAL_STORAGE_CLEARED: Browser-local draft removed.', 'info');
}

function setTesterStatus(text, type = 'info') {
  testerStatusEl.textContent = text;
  testerStatusEl.className = `artifact-status ${type}`;
}

function getVisibleGamepad() {
  const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
  return pads[0] || null;
}

function renderNoControllerState() {
  testerNoControllerEl.style.display = 'block';
  testerButtonsEl.innerHTML = '';
  testerAxesEl.innerHTML = '';
  testerNeutralEl.innerHTML = '<p>No axis readouts available until a controller is visible.</p>';
  setTesterStatus(
    'TESTER_NO_CONTROLLER: No controller visible via Gamepad API. Pair/reconnect at OS level and press any input.',
    'error',
  );
}

function renderButtons(gamepad) {
  testerButtonsEl.innerHTML = '';
  gamepad.buttons.forEach((btn, index) => {
    const item = document.createElement('div');
    item.className = `tester-button ${btn.pressed ? 'active' : ''}`;
    item.textContent = `B${index}: ${btn.pressed ? 'pressed' : 'released'} (${btn.value.toFixed(2)})`;
    testerButtonsEl.appendChild(item);
  });
}

function renderAxes(gamepad) {
  testerAxesEl.innerHTML = '';
  const nearNeutral = [];
  gamepad.axes.forEach((axis, index) => {
    const item = document.createElement('div');
    item.className = 'tester-axis';

    const value = Number(axis.toFixed(3));
    if (Math.abs(value) <= 0.1) nearNeutral.push(index);

    const label = document.createElement('div');
    label.textContent = `A${index}: ${value.toFixed(3)}`;

    const meter = document.createElement('input');
    meter.type = 'range';
    meter.min = '-1';
    meter.max = '1';
    meter.step = '0.001';
    meter.value = value;
    meter.disabled = true;
    meter.className = 'tester-axis-meter';

    item.appendChild(label);
    item.appendChild(meter);
    testerAxesEl.appendChild(item);
  });

  testerNeutralEl.innerHTML = `
    <p><strong>Neutral readout:</strong> Axes near neutral (|value| ≤ 0.10): ${nearNeutral.length > 0 ? nearNeutral.join(', ') : 'none'}.</p>
    <p class="muted">Tip: if neutral values drift, re-center controller and reconnect at OS level.</p>
  `;
}

function renderTesterFrame() {
  const gamepad = getVisibleGamepad();
  if (!gamepad) {
    testerState.lastVisibleGamepadId = null;
    renderNoControllerState();
    return;
  }

  testerNoControllerEl.style.display = 'none';
  testerState.lastVisibleGamepadId = gamepad.id || `index_${gamepad.index}`;
  setTesterStatus(
    `TESTER_ACTIVE: Reading controller ${gamepad.index} (${testerState.lastVisibleGamepadId}).`,
    'success',
  );
  renderButtons(gamepad);
  renderAxes(gamepad);
}

function testerLoop() {
  renderTesterFrame();
  testerState.rafId = requestAnimationFrame(testerLoop);
}

function initTesterControls() {
  window.addEventListener('gamepadconnected', () => {
    setTesterStatus('TESTER_CONNECTED: Controller connected. Live readout active.', 'success');
  });
  window.addEventListener('gamepaddisconnected', () => {
    setTesterStatus('TESTER_DISCONNECTED: Controller disconnected. Retry OS reconnect/pairing.', 'error');
  });
  renderNoControllerState();
  testerLoop();
}

function setEnvironmentState(state) {
  banner.classList.remove('state-supported', 'state-unsupported', 'state-insecure');
  if (state === 'supported') {
    banner.classList.add('state-supported');
    envHeading.textContent = 'Supported Environment';
    envSummary.textContent = 'Secure context detected with Web Serial support.';
    return;
  }
  if (state === 'unsupported_browser') {
    banner.classList.add('state-unsupported');
    envHeading.textContent = 'Unsupported Browser';
    envSummary.textContent = 'Web Serial API is unavailable in this browser.';
    return;
  }
  banner.classList.add('state-insecure');
  envHeading.textContent = 'Insecure Context';
  envSummary.textContent = 'This page must be served from HTTPS or localhost for Web Serial features.';
}

function renderChips(checks) {
  capabilityChips.innerHTML = '';
  [['secure', 'Secure Context'], ['serial', 'Web Serial'], ['gamepad', 'Gamepad API']].forEach(([key, label]) => {
    const chip = document.createElement('span');
    chip.className = `cap-chip ${checks[key] ? 'ok' : 'bad'}`;
    chip.textContent = `${label}: ${checks[key] ? 'Available' : 'Unavailable'}`;
    capabilityChips.appendChild(chip);
  });
}

function renderMessages(messages) {
  capabilityMessages.innerHTML = '';
  messages.forEach((msg) => {
    const item = document.createElement('li');
    item.className = `msg-${msg.level}`;
    item.textContent = msg.text;
    capabilityMessages.appendChild(item);
  });
}

function gateActions(checks) {
  actionButtons.forEach((btn) => {
    const requires = (btn.dataset.requires || 'none').split(',').map((v) => v.trim()).filter(Boolean);
    const blockedBy = requires.find((cap) => !checks[cap]);
    if (blockedBy) {
      btn.disabled = true;
      btn.title = `Unavailable: missing ${blockedBy} capability.`;
      return;
    }
    if (!btn.disabled) {
      btn.title = 'Action available subject to feature state preconditions.';
    }
  });
}

function setArtifactStatus(text, type = 'info') {
  artifactStatus.textContent = text;
  artifactStatus.className = `artifact-status ${type}`;
}

function renderArtifactSummary() {
  if (!artifactState.bundle) {
    artifactSummary.innerHTML = '<p>No artifact bundle loaded yet.</p>';
    return;
  }
  const b = artifactState.bundle;
  artifactSummary.innerHTML = `
    <p><strong>Source mode:</strong> ${b.sourceMode}</p>
    <p><strong>Target:</strong> ${b.manifest.target || 'unknown'}</p>
    <p><strong>Version:</strong> ${b.manifest.version || 'unknown'}</p>
    <p><strong>Files:</strong> ${b.required.bootloader}, ${b.required.partition_table}, ${b.required.app}</p>
    <p><strong>Legacy flash layout:</strong> bootloader ${b.flashLayout.bootloader}, partition ${b.flashLayout.partition_table}, app ${b.flashLayout.app}</p>
  `;
}

function setArtifactMode(mode) {
  artifactState.mode = mode;
  const manual = mode === 'manual_local_import';
  localPickerWrap.hidden = !manual;
  loadSameSiteBtn.hidden = manual;
  setArtifactStatus(manual
    ? 'Manual local import selected. Choose manifest.json + binaries, then load.'
    : 'Same-site manifest mode selected. Click load to ingest ./firmware artifacts.', 'info');
}

async function handleSameSiteLoad() {
  setArtifactStatus('Loading artifacts from same-site manifest...', 'info');
  try {
    artifactState.bundle = await loadFromSameSite();
    setArtifactStatus('Same-site artifact bundle loaded and validated.', 'success');
  } catch (err) {
    artifactState.bundle = null;
    setArtifactStatus(`Artifact load failed: ${err.message}`, 'error');
  }
  renderArtifactSummary();
  renderFlashState();
}

async function handleManualLoad() {
  setArtifactStatus('Loading artifacts from manual local selection...', 'info');
  try {
    artifactState.bundle = await loadFromManualFiles(localFileInput.files);
    setArtifactStatus('Manual artifact bundle loaded and validated.', 'success');
  } catch (err) {
    artifactState.bundle = null;
    setArtifactStatus(`Artifact load failed: ${err.message}`, 'error');
  }
  renderArtifactSummary();
  renderFlashState();
}

function renderSerialModel() {
  const s = serialModel.snapshot();
  serialPermissionStateEl.textContent = s.permission;
  serialOwnerStateEl.textContent = s.owner;
  const conflictMsg = s.owner !== SerialOwner.NONE
    ? `${s.owner} owns serial. The other feature must wait until release.`
    : 'No current owner. Flash and Console remain mutually exclusive once one claims ownership.';
  const errorSuffix = s.lastError ? ` (Last error: ${s.lastError})` : '';
  const handoffSuffix = sessionState.handoffState !== 'none' ? ` [handoff=${sessionState.handoffState}]` : '';
  const transportSuffix = sessionState.lastTransportError ? ` [transport=${sessionState.lastTransportError}]` : '';
  serialModelMessageEl.textContent = `${s.infoMessage} ${conflictMsg}${errorSuffix}${handoffSuffix}${transportSuffix}`;

  const canClaim = s.permission === SerialPermissionState.GRANTED;
  const blockClaimFlash = monitorState.connected || monitorState.connecting;
  const blockClaimConsole = flashState.inProgress;
  serialClaimFlashBtn.disabled = !canClaim || blockClaimFlash;
  serialClaimConsoleBtn.disabled = !canClaim || blockClaimConsole;
  serialReleaseBtn.disabled = s.owner === SerialOwner.NONE;

  renderFlashState();
  renderMonitorState();
}

async function handleRequestPermission() {
  if (!navigator.serial || typeof navigator.serial.requestPort !== 'function') {
    serialPermissionStateEl.textContent = SerialPermissionState.UNSUPPORTED;
    serialModelMessageEl.textContent = 'Web Serial API is unavailable in this browser.';
    return;
  }
  await serialModel.requestPermission(() => navigator.serial.requestPort());
  const snap = serialModel.snapshot();
  if (snap.permission !== SerialPermissionState.GRANTED) {
    clearSessionOnTransportFailure('permission', `Permission outcome: ${snap.permission}`);
    if (snap.permission === SerialPermissionState.DENIED) {
      setMonitorStatus('MONITOR_BLOCKED', 'Permission denied. Retry request permission to continue.', 'error');
      setFlashStatus('FLASH_BLOCKED', 'Permission denied. Retry request permission to continue.');
    } else if (snap.permission === SerialPermissionState.PORT_BUSY) {
      setMonitorStatus('MONITOR_BLOCKED', 'Port busy. Close other serial sessions and retry.', 'error');
      setFlashStatus('FLASH_BLOCKED', 'Port busy. Close other serial sessions and retry.');
    }
  } else {
    sessionState.lastTransportError = null;
  }
  renderSerialModel();
}

function setFlashStatus(stage, message) {
  flashStatusEl.textContent = `${stage}: ${message}`;
}

function setFlashProgress(percent, label = '') {
  flashProgressEl.value = percent;
  flashProgressLabelEl.textContent = `${percent}% ${label}`.trim();
}

function setSessionHandoff(state, detail = '') {
  sessionState.handoffState = state;
  if (detail) {
    serialModelMessageEl.textContent = detail;
  }
}

function clearSessionOnTransportFailure(origin, message) {
  sessionState.activeFlow = 'idle';
  sessionState.lastTransportError = `${origin}: ${message}`;
  flashState.identified = null;
  flashState.inProgress = false;
  monitorState.connected = false;
  monitorState.connecting = false;
  monitorState.lastError = message;
  serialModel.releaseOwner();
}

function renderFlashState() {
  const serial = serialModel.snapshot();
  const hasBundle = Boolean(artifactState.bundle);
  const ownsFlash = serial.owner === SerialOwner.FLASH;
  const hasPermission = serial.permission === SerialPermissionState.GRANTED;
  const readyIdentify = hasPermission && ownsFlash && !monitorState.connected && !monitorState.connecting && !flashState.inProgress;
  const readyFlash = readyIdentify && hasBundle && flashState.identified && !flashState.inProgress;

  flashIdentifyBtn.disabled = !readyIdentify;
  flashExecuteBtn.disabled = !readyFlash;

  if (flashState.inProgress) setFlashStatus('FLASH_ACTIVE', 'Flashing in progress. Console remains blocked until completion.');
  else if (!hasBundle) setFlashStatus('FLASH_BLOCKED', 'Load a valid artifact bundle first.');
  else if (!hasPermission) setFlashStatus('FLASH_BLOCKED', 'Serial permission must be granted first.');
  else if (monitorState.connected || monitorState.connecting) setFlashStatus('FLASH_BLOCKED', 'Monitor must fully disconnect before flash flow.');
  else if (!ownsFlash) setFlashStatus('FLASH_BLOCKED', 'Serial owner must be set to Flash before identify/flash.');
}

async function handleIdentify() {
  try {
    sessionState.activeFlow = 'flash_identify';
    setSessionHandoff('none');
    const snap = serialModel.snapshot();
    if (snap.owner !== SerialOwner.FLASH) throw new Error('Flash identify requires Flash ownership.');
    if (!snap.port) throw new Error('No granted serial port available. Request permission first.');

    setFlashStatus('FLASH_IDENTIFYING', 'Starting identify path...');
    const info = await flasherService.connectAndIdentify(snap.port, {
      onStatus: (stage, message) => setFlashStatus(stage, message),
    });

    flashState.identified = info;
    flashState.lastError = null;
    flashDeviceInfoEl.textContent = `Chip: ${info.chip} | MAC: ${info.mac}`;
    setFlashProgress(0, 'Ready to flash');
    sessionState.activeFlow = 'idle';
    renderFlashState();
  } catch (err) {
    sessionState.activeFlow = 'idle';
    flashState.lastError = err.message || String(err);
    setFlashStatus('FLASH_IDENTIFY_FAILED', err.message || String(err));
  }
}

async function handleFlash() {
  if (!artifactState.bundle) {
    setFlashStatus('FLASH_BLOCKED', 'No artifact bundle loaded.');
    return;
  }

  try {
    const serial = serialModel.snapshot();
    if (serial.owner !== SerialOwner.FLASH) {
      throw new Error('Flash execution requires active Flash ownership.');
    }
    if (monitorState.connected || monitorState.connecting) {
      throw new Error('Cannot flash while console session is active.');
    }

    sessionState.activeFlow = 'flash';
    flashState.inProgress = true;
    setSessionHandoff('flash_active', 'Flash session active. Console reconnect is available after reset/reboot completes.');
    setFlashProgress(0, 'Starting flash...');
    await flasherService.flashBundle(artifactState.bundle, {
      onStatus: (stage, message) => setFlashStatus(stage, message),
      onProgress: ({ fileIndex, pct }) => setFlashProgress(pct, `(file ${fileIndex + 1}/3)`),
    });
    setFlashProgress(100, 'Complete');
    flashState.lastError = null;
    setSessionHandoff('flash_to_console_ready', 'Flash completed and reset issued. You may now claim Console and reconnect monitor.');
  } catch (err) {
    const failure = err.message || String(err);
    flashState.lastError = failure;
    setFlashStatus('FLASH_FAILED', `${failure} Retry by re-identifying, then flashing again.`);
    setSessionHandoff('flash_recovery_required', 'Flash failed. Ownership was released. Reclaim Flash owner and retry identify/flash.');
  } finally {
    await flasherService.cleanup();
    flashState.inProgress = false;
    serialModel.releaseOwner();
    flashState.identified = null;
    sessionState.activeFlow = 'idle';
    renderSerialModel();
    renderFlashState();
  }
}

function appendMonitorOutput(text) {
  const formatted = text.replace(/(?<!\r)\n/g, '\r\n');
  monitorOutputEl.textContent += formatted;
  if (monitorAutoScroll.checked) {
    monitorOutputEl.scrollTop = monitorOutputEl.scrollHeight;
  }
}

function setMonitorStatus(stage, message, type = 'info') {
  monitorStatusEl.textContent = `${stage}: ${message}`;
  monitorStatusEl.className = `artifact-status ${type}`;
}

function renderMonitorState() {
  const serial = serialModel.snapshot();
  const ownsConsole = serial.owner === SerialOwner.CONSOLE;
  const hasPermission = serial.permission === SerialPermissionState.GRANTED;
  const canConnect = hasPermission
    && !monitorState.connected
    && !monitorState.connecting
    && !flashState.inProgress
    && (serial.owner === SerialOwner.NONE || ownsConsole);

  monitorConnectBtn.disabled = !canConnect;
  monitorDisconnectBtn.disabled = !(monitorState.connected || monitorState.connecting);
}

async function handleMonitorConnect() {
  try {
    if (flashState.inProgress) {
      throw new Error('Cannot connect monitor while flash session is in progress.');
    }

    monitorState.connecting = true;
    sessionState.activeFlow = 'console_connect';
    setSessionHandoff('console_connecting', 'Console connect in progress. Flash is blocked until this session resolves.');
    let snap = serialModel.snapshot();

    if (!navigator.serial || typeof navigator.serial.requestPort !== 'function') {
      throw new Error('Web Serial unsupported in this browser.');
    }

    if (snap.permission !== SerialPermissionState.GRANTED) {
      await serialModel.requestPermission(() => navigator.serial.requestPort());
      snap = serialModel.snapshot();
      if (snap.permission !== SerialPermissionState.GRANTED) {
        throw new Error(`Permission flow did not grant serial access (${snap.permission}).`);
      }
    }

    const claim = serialModel.claimOwner(SerialOwner.CONSOLE);
    if (!claim.ok) {
      throw new Error(claim.state.lastError || 'Failed to claim console ownership.');
    }

    setMonitorStatus('MONITOR_CONNECTING', 'Connecting monitor...', 'info');
    await monitorService.connect(serialModel.snapshot().port, {
      onStatus: (stage, msg) => setMonitorStatus(stage, msg, stage.includes('ERROR') || stage.includes('UNPLUGGED') ? 'error' : 'success'),
      onData: appendMonitorOutput,
      onFailure: async (message) => {
        clearSessionOnTransportFailure('monitor', message || 'Monitor session failure');
        setSessionHandoff('console_recovery_required', 'Console session failed. Reconnect monitor or reclaim Flash owner.');
        monitorState.connected = false;
        monitorState.connecting = false;
        renderSerialModel();
        renderMonitorState();
      },
    });

    monitorState.connected = true;
    monitorState.connecting = false;
    monitorState.lastError = null;
    sessionState.activeFlow = 'console';
    setSessionHandoff('console_active', 'Console connected. Disconnect monitor before starting any flash session.');
    renderSerialModel();
    renderMonitorState();
  } catch (err) {
    const failure = err.message || String(err);
    setMonitorStatus('MONITOR_CONNECT_FAILED', `${failure} Retry connect after resolving permission/port state.`, 'error');
    clearSessionOnTransportFailure('monitor_connect', failure);
    monitorState.connected = false;
    monitorState.connecting = false;
    setSessionHandoff('console_recovery_required', 'Console connect failed. Retry connect or return to flash flow.');
    renderSerialModel();
    renderMonitorState();
  }
}

async function handleMonitorDisconnect() {
  await monitorService.disconnect((stage, msg) => setMonitorStatus(stage, msg, 'info'));
  monitorState.connected = false;
  monitorState.connecting = false;
  serialModel.releaseOwner();
  sessionState.activeFlow = 'idle';
  setSessionHandoff('console_disconnected', 'Console disconnected. You may now claim Flash owner and run identify/flash.');
  renderSerialModel();
  renderMonitorState();
}

function initMonitorControls() {
  monitorConnectBtn.addEventListener('click', handleMonitorConnect);
  monitorDisconnectBtn.addEventListener('click', handleMonitorDisconnect);
  monitorClearBtn.addEventListener('click', () => {
    monitorOutputEl.textContent = '';
  });
  renderMonitorState();
}

function initSerialModelControls() {
  serialRequestBtn.addEventListener('click', handleRequestPermission);
  serialClaimFlashBtn.addEventListener('click', () => {
    const snap = serialModel.snapshot();
    if (snap.owner === SerialOwner.CONSOLE) {
      setSessionHandoff('handoff_console_to_flash', 'Handoff requested: Console -> Flash. Disconnect console first to complete.');
      const result = serialModel.handoffOwner(SerialOwner.FLASH);
      if (!result.ok) {
        setFlashStatus('FLASH_BLOCKED', 'Cannot hand off from Console while monitor session is active. Disconnect monitor first.');
      }
    } else {
      serialModel.claimOwner(SerialOwner.FLASH);
      setSessionHandoff('flash_owner_claimed', 'Flash ownership claimed. Identify device to continue.');
    }
    renderSerialModel();
  });
  serialClaimConsoleBtn.addEventListener('click', () => {
    const snap = serialModel.snapshot();
    if (snap.owner === SerialOwner.FLASH && flashState.inProgress) {
      setSessionHandoff('handoff_flash_blocked', 'Flash is active. Wait for completion before handing off to Console.');
      setMonitorStatus('MONITOR_BLOCKED', 'Flash in progress. Retry monitor connect after flash completes.', 'error');
      renderSerialModel();
      return;
    }
    if (snap.owner === SerialOwner.FLASH) {
      setSessionHandoff('handoff_flash_to_console', 'Handoff requested: Flash -> Console. Flash session must be idle.');
      serialModel.handoffOwner(SerialOwner.CONSOLE);
    } else {
      serialModel.claimOwner(SerialOwner.CONSOLE);
      setSessionHandoff('console_owner_claimed', 'Console ownership claimed. Connect monitor to start streaming.');
    }
    renderSerialModel();
  });
  serialReleaseBtn.addEventListener('click', () => { serialModel.releaseOwner(); renderSerialModel(); });
  serialResetBtn.addEventListener('click', async () => {
    await serialModel.clearPermission();
    sessionState.activeFlow = 'idle';
    sessionState.lastTransportError = null;
    setSessionHandoff('none');
    flashState.identified = null;
    flashState.inProgress = false;
    monitorState.connected = false;
    monitorState.connecting = false;
    renderSerialModel();
    renderFlashState();
    renderMonitorState();
  });
  renderSerialModel();
}

function initCapabilityGating() {
  const result = evaluateCapabilities({
    isSecureContext: window.isSecureContext,
    hasSerial: Boolean(navigator.serial),
    hasGamepad: typeof navigator.getGamepads === 'function',
  });
  setEnvironmentState(result.environmentState);
  renderChips(result.checks);
  renderMessages(result.messages);
  gateActions(result.checks);
}

function initArtifactIngestion() {
  artifactMode.addEventListener('change', () => setArtifactMode(artifactMode.value));
  loadSameSiteBtn.addEventListener('click', handleSameSiteLoad);
  loadLocalBtn.addEventListener('click', handleManualLoad);
  setArtifactMode('same_site_manifest');
  renderArtifactSummary();
}

function initFlasherControls() {
  flashIdentifyBtn.addEventListener('click', handleIdentify);
  flashExecuteBtn.addEventListener('click', handleFlash);
  setFlashProgress(0, 'Idle');
  renderFlashState();
}

function initConfigControls() {
  const inputs = [
    cfgNameEl, cfgAuthorEl, cfgRevisionEl, cfgNotesEl,
    cfgGlobalScaleEl, cfgGlobalDeadzoneEl, cfgGlobalClampMinEl, cfgGlobalClampMaxEl,
    cfgAxisMoveXIndexEl, cfgAxisMoveXScaleEl, cfgAxisMoveXDeadzoneEl, cfgAxisMoveXInvertEl,
    cfgAxisMoveYIndexEl, cfgAxisMoveYScaleEl, cfgAxisMoveYDeadzoneEl, cfgAxisMoveYInvertEl,
    cfgButtonActionAIndexEl, cfgButtonActionBIndexEl, cfgButtonMenuIndexEl,
  ];

  const onLocalChange = () => {
    readConfigInputsIntoDraft();
    configState.validation = validateDraft(configState.draft);
    renderConfigValidation();
    renderConfigSummary();
  };

  inputs.forEach((el) => {
    el.addEventListener('input', onLocalChange);
    el.addEventListener('change', onLocalChange);
  });

  cfgValidateBtn.addEventListener('click', () => {
    readConfigInputsIntoDraft();
    configState.validation = validateDraft(configState.draft);
    renderConfigValidation();
    renderConfigSummary();
  });

  cfgResetBtn.addEventListener('click', () => {
    configState.draft = createDefaultDraft();
    configState.validation = validateDraft(configState.draft);
    renderConfigInputsFromDraft();
    renderConfigValidation();
    renderConfigSummary();
    setConfigStatus('CONFIG_LOCAL_RESET: Draft restored to local defaults.', 'info');
  });

  cfgImportBtn.addEventListener('click', importDraftFromLocalFile);
  cfgExportBtn.addEventListener('click', exportDraftToLocalFile);
  cfgSaveBrowserBtn.addEventListener('click', saveDraftToBrowserStorage);
  cfgLoadBrowserBtn.addEventListener('click', loadDraftFromBrowserStorage);
  cfgClearBrowserBtn.addEventListener('click', clearDraftFromBrowserStorage);

  configState.validation = validateDraft(configState.draft);
  renderConfigInputsFromDraft();
  renderConfigValidation();
  renderConfigSummary();
  setConfigLocalFileStatus('CONFIG_LOCAL_FILE: Import/export uses local JSON files only.', 'info');
  setConfigLocalStorageStatus('CONFIG_LOCAL_STORAGE: Save/load is browser-local only (not device storage).', 'info');
}

navButtons.forEach((btn) => btn.addEventListener('click', () => activate(btn.dataset.target)));

activate('flash');
initCapabilityGating();
initArtifactIngestion();
initSerialModelControls();
initFlasherControls();
initMonitorControls();
initConfigControls();
initTesterControls();
