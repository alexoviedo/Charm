/**
 * Artifact ingestion baseline for WR-005.
 *
 * Assumptions are intentionally explicit and aligned with current repo contracts:
 * - Required artifact set: manifest.json, bootloader.bin, partition-table.bin, charm.bin.
 * - Expected flash addresses (legacy contract, not executed in this slice):
 *   bootloader -> 0x0000, partition-table -> 0x8000, app -> 0x10000.
 * - No runtime dependency on GitHub Actions APIs.
 */

export const REQUIRED_KEYS = ['bootloader', 'partition_table', 'app'];
export const REQUIRED_DEFAULT_FILENAMES = {
  manifest: 'manifest.json',
  bootloader: 'bootloader.bin',
  partition_table: 'partition-table.bin',
  app: 'charm.bin',
};

export const LEGACY_FLASH_LAYOUT = {
  bootloader: '0x0000',
  partition_table: '0x8000',
  app: '0x10000',
};

export function validateManifestStructure(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    return { ok: false, error: 'manifest.json is missing or invalid JSON.' };
  }

  if (!manifest.files || typeof manifest.files !== 'object') {
    return { ok: false, error: 'manifest.json is missing required files map.' };
  }

  for (const key of REQUIRED_KEYS) {
    if (!manifest.files[key]) {
      return { ok: false, error: `manifest.json is missing files.${key}.` };
    }
  }

  return { ok: true, error: null };
}

export function buildRequiredFilenameSet(manifest) {
  return {
    manifest: REQUIRED_DEFAULT_FILENAMES.manifest,
    bootloader: manifest?.files?.bootloader || REQUIRED_DEFAULT_FILENAMES.bootloader,
    partition_table: manifest?.files?.partition_table || REQUIRED_DEFAULT_FILENAMES.partition_table,
    app: manifest?.files?.app || REQUIRED_DEFAULT_FILENAMES.app,
  };
}

export async function loadFromSameSite(fetchImpl = fetch) {
  const manifestPath = new URL('../firmware/manifest.json', import.meta.url).href;
  const manifestRes = await fetchImpl(manifestPath);
  if (!manifestRes.ok) {
    throw new Error(`Failed to fetch manifest.json (${manifestRes.status}).`);
  }

  const manifest = await manifestRes.json();
  const manifestValidation = validateManifestStructure(manifest);
  if (!manifestValidation.ok) {
    throw new Error(manifestValidation.error);
  }

  const required = buildRequiredFilenameSet(manifest);
  const firmwareBase = new URL('../firmware/', import.meta.url).href;
  const filePaths = {
    bootloader: `${firmwareBase}${required.bootloader}`,
    partition_table: `${firmwareBase}${required.partition_table}`,
    app: `${firmwareBase}${required.app}`,
  };

  const [bootloaderRes, partitionRes, appRes] = await Promise.all([
    fetchImpl(filePaths.bootloader),
    fetchImpl(filePaths.partition_table),
    fetchImpl(filePaths.app),
  ]);

  if (!bootloaderRes.ok || !partitionRes.ok || !appRes.ok) {
    throw new Error('Incomplete same-site artifact set: one or more required binaries are missing.');
  }

  return {
    sourceMode: 'same_site_manifest',
    manifest,
    required,
    flashLayout: { ...LEGACY_FLASH_LAYOUT },
    binaries: {
      bootloader: await bootloaderRes.arrayBuffer(),
      partition_table: await partitionRes.arrayBuffer(),
      app: await appRes.arrayBuffer(),
    },
  };
}

export async function loadFromManualFiles(fileList) {
  const files = Array.from(fileList || []);
  const byName = new Map(files.map((f) => [f.name, f]));

  const manifestFile = byName.get(REQUIRED_DEFAULT_FILENAMES.manifest);
  if (!manifestFile) {
    throw new Error('Manual import missing manifest.json.');
  }

  const manifest = JSON.parse(await manifestFile.text());
  const manifestValidation = validateManifestStructure(manifest);
  if (!manifestValidation.ok) {
    throw new Error(manifestValidation.error);
  }

  const required = buildRequiredFilenameSet(manifest);
  const missing = [];
  for (const name of [required.bootloader, required.partition_table, required.app]) {
    if (!byName.has(name)) {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Manual import incomplete. Missing: ${missing.join(', ')}.`);
  }

  return {
    sourceMode: 'manual_local_import',
    manifest,
    required,
    flashLayout: { ...LEGACY_FLASH_LAYOUT },
    binaries: {
      bootloader: await byName.get(required.bootloader).arrayBuffer(),
      partition_table: await byName.get(required.partition_table).arrayBuffer(),
      app: await byName.get(required.app).arrayBuffer(),
    },
  };
}
