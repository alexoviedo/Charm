const DEFAULT_DRAFT = Object.freeze({
  metadata: {
    name: 'default-layout-v1',
    author: 'local',
    revision: 1,
    notes: '',
    updatedAt: '',
  },
  global: {
    scale: 1,
    deadzone: 0.08,
    clampMin: -1,
    clampMax: 1,
  },
  axes: {
    move_x: { index: 0, scale: 1, deadzone: 0.08, invert: false },
    move_y: { index: 1, scale: 1, deadzone: 0.08, invert: false },
  },
  buttons: {
    action_a: { index: 0 },
    action_b: { index: 1 },
    menu: { index: 9 },
  },
});

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function toFiniteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function createDefaultDraft() {
  const draft = clone(DEFAULT_DRAFT);
  draft.metadata.updatedAt = new Date().toISOString();
  return draft;
}

export function touchDraft(draft) {
  draft.metadata.updatedAt = new Date().toISOString();
}

export function normalizeDraft(draft) {
  draft.metadata.revision = Math.max(1, Math.floor(toFiniteNumber(draft.metadata.revision, 1)));

  draft.global.scale = toFiniteNumber(draft.global.scale, 1);
  draft.global.deadzone = toFiniteNumber(draft.global.deadzone, 0.08);
  draft.global.clampMin = toFiniteNumber(draft.global.clampMin, -1);
  draft.global.clampMax = toFiniteNumber(draft.global.clampMax, 1);

  Object.values(draft.axes).forEach((axis) => {
    axis.index = Math.max(0, Math.floor(toFiniteNumber(axis.index, 0)));
    axis.scale = toFiniteNumber(axis.scale, 1);
    axis.deadzone = toFiniteNumber(axis.deadzone, 0.08);
    axis.invert = Boolean(axis.invert);
  });

  Object.values(draft.buttons).forEach((button) => {
    button.index = Math.max(0, Math.floor(toFiniteNumber(button.index, 0)));
  });

  touchDraft(draft);
  return draft;
}

export function validateDraft(draft) {
  const errors = [];

  if (!draft.metadata.name?.trim()) {
    errors.push('Draft name is required.');
  }

  if (draft.global.scale < 0.1 || draft.global.scale > 4) {
    errors.push('Global scale must be within 0.1..4.0.');
  }

  if (draft.global.deadzone < 0 || draft.global.deadzone > 0.95) {
    errors.push('Global deadzone must be within 0.00..0.95.');
  }

  if (draft.global.clampMin < -1 || draft.global.clampMin > 1) {
    errors.push('Clamp min must be within -1.0..1.0.');
  }

  if (draft.global.clampMax < -1 || draft.global.clampMax > 1) {
    errors.push('Clamp max must be within -1.0..1.0.');
  }

  if (draft.global.clampMin >= draft.global.clampMax) {
    errors.push('Clamp min must be strictly less than clamp max.');
  }

  Object.entries(draft.axes).forEach(([name, axis]) => {
    if (!Number.isInteger(axis.index) || axis.index < 0) {
      errors.push(`Axis ${name}: index must be a non-negative integer.`);
    }
    if (axis.scale < 0.1 || axis.scale > 4) {
      errors.push(`Axis ${name}: scale must be within 0.1..4.0.`);
    }
    if (axis.deadzone < 0 || axis.deadzone > 0.95) {
      errors.push(`Axis ${name}: deadzone must be within 0.00..0.95.`);
    }
  });

  Object.entries(draft.buttons).forEach(([name, button]) => {
    if (!Number.isInteger(button.index) || button.index < 0) {
      errors.push(`Button ${name}: index must be a non-negative integer.`);
    }
  });

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function summarizeDraft(draft) {
  return JSON.stringify(draft, null, 2);
}

export function parseDraftJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err.message || String(err)}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid draft JSON: expected top-level object.');
  }

  if (!parsed.metadata || typeof parsed.metadata !== 'object') {
    throw new Error('Invalid draft JSON: missing "metadata" object.');
  }
  if (!parsed.global || typeof parsed.global !== 'object') {
    throw new Error('Invalid draft JSON: missing "global" object.');
  }
  if (!parsed.axes || typeof parsed.axes !== 'object') {
    throw new Error('Invalid draft JSON: missing "axes" object.');
  }
  if (!parsed.buttons || typeof parsed.buttons !== 'object') {
    throw new Error('Invalid draft JSON: missing "buttons" object.');
  }

  if (!parsed.axes.move_x || !parsed.axes.move_y) {
    throw new Error('Invalid draft JSON: missing required axes "move_x" and/or "move_y".');
  }
  if (!parsed.buttons.action_a || !parsed.buttons.action_b || !parsed.buttons.menu) {
    throw new Error('Invalid draft JSON: missing required button mappings (action_a/action_b/menu).');
  }

  return normalizeDraft(parsed);
}
