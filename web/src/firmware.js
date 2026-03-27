/**
 * Handles fetching statically hosted firmware artifacts.
 */
export class FirmwareService {
  constructor(statusElement) {
    this.statusEl = statusElement;
    this.firmwareBinaries = null;
  }

  setStatus(msg, isError = false, isSuccess = false) {
    this.statusEl.textContent = msg;
    this.statusEl.className = 'status';
    if (isError) this.statusEl.classList.add('error');
    if (isSuccess) this.statusEl.classList.add('success');
  }

  async fetchArtifacts() {
    this.setStatus("Fetching manifest.json...");
    this.firmwareBinaries = null; // reset

    try {
      // 1. Get the manifest to locate the firmware assets
      const manifestRes = await fetch('./firmware/manifest.json');
      if (!manifestRes.ok) {
        throw new Error(`Failed to fetch manifest.json: HTTP ${manifestRes.status}. Make sure firmware artifacts are deployed.`);
      }

      const manifest = await manifestRes.json();
      const files = manifest.files;

      if (!files || !files.bootloader || !files.partition_table || !files.app) {
         throw new Error("manifest.json is missing required file definitions.");
      }

      this.setStatus(`Downloading target: ${manifest.target} (${manifest.commit_sha.substring(0, 7)})...`);

      // 2. Fetch the raw binary ArrayBuffers
      const [bootloaderRes, partitionRes, appRes] = await Promise.all([
        fetch(`./firmware/${files.bootloader}`),
        fetch(`./firmware/${files.partition_table}`),
        fetch(`./firmware/${files.app}`)
      ]);

      if (!bootloaderRes.ok || !partitionRes.ok || !appRes.ok) {
        throw new Error("Failed to download one or more firmware binaries. Check deployment.");
      }

      this.setStatus("Processing binaries...");

      this.firmwareBinaries = {
        bootloader: await bootloaderRes.arrayBuffer(),
        partitionTable: await partitionRes.arrayBuffer(),
        app: await appRes.arrayBuffer()
      };

      this.setStatus("Successfully loaded all required firmware binaries.", false, true);
      return this.firmwareBinaries;

    } catch (err) {
      this.setStatus(err.message, true);
      return null;
    }
  }
}
