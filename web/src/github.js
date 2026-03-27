// src/github.js
/**
 * Handles fetching firmware artifacts from GitHub Actions REST API.
 */
export class GitHubService {
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

  async fetchLatestArtifact(repoPath, pat) {
    this.setStatus("Fetching latest workflow runs...");
    this.firmwareBinaries = null; // reset

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
    };
    if (pat) {
      headers['Authorization'] = `token ${pat}`;
    }

    try {
      // 1. Get the latest successful workflow run on main for the firmware build
      const runsUrl = `https://api.github.com/repos/${repoPath}/actions/runs?branch=main&status=success`;
      const runsRes = await fetch(runsUrl, { headers });

      if (!runsRes.ok) {
        throw new Error(`Failed to fetch runs: ${runsRes.statusText}`);
      }

      const runsData = await runsRes.json();
      if (runsData.total_count === 0) {
        throw new Error("No successful workflow runs found on main.");
      }

      const latestRun = runsData.workflow_runs[0];
      this.setStatus(`Found successful run #${latestRun.run_number}. Fetching artifacts...`);

      // 2. Get artifacts for this run
      const artifactsUrl = latestRun.artifacts_url;
      const artifactsRes = await fetch(artifactsUrl, { headers });

      if (!artifactsRes.ok) {
        throw new Error(`Failed to fetch artifacts list: ${artifactsRes.statusText}`);
      }

      const artifactsData = await artifactsRes.json();
      const firmwareArtifact = artifactsData.artifacts.find(a => a.name === "firmware-esp32s3-build-artifacts");

      if (!firmwareArtifact) {
        throw new Error("Could not find 'firmware-esp32s3-build-artifacts' in the latest run.");
      }

      this.setStatus(`Found artifact ID: ${firmwareArtifact.id}. Downloading zip...`);

      // 3. Download the artifact zip
      const downloadUrl = firmwareArtifact.archive_download_url;
      const downloadRes = await fetch(downloadUrl, { headers });

      if (!downloadRes.ok) {
        // Handle redirect or error
        if (downloadRes.status === 401 && !pat) {
          throw new Error("GitHub requires authentication to download artifacts via API. Please provide a PAT.");
        }
        throw new Error(`Failed to download artifact: ${downloadRes.statusText}`);
      }

      const zipBlob = await downloadRes.blob();
      this.setStatus("Downloaded zip. Extracting binaries...");

      // 4. Extract binaries using JSZip
      const zip = await JSZip.loadAsync(zipBlob);
      const files = Object.keys(zip.files);

      // We expect paths like:
      // build/bootloader/bootloader.bin
      // build/partition_table/partition-table.bin
      // build/charm.bin
      const bootloaderFile = files.find(f => f.endsWith("bootloader.bin"));
      const partitionFile = files.find(f => f.endsWith("partition-table.bin"));
      const appFile = files.find(f => f.endsWith("charm.bin"));

      if (!bootloaderFile || !partitionFile || !appFile) {
        throw new Error(`Missing expected binaries in zip.\nFound: ${files.join(", ")}`);
      }

      this.firmwareBinaries = {
        bootloader: await zip.file(bootloaderFile).async("uint8array"),
        partitionTable: await zip.file(partitionFile).async("uint8array"),
        app: await zip.file(appFile).async("uint8array")
      };

      this.setStatus("Successfully extracted all required firmware binaries.", false, true);
      return this.firmwareBinaries;

    } catch (err) {
      this.setStatus(err.message, true);
      return null;
    }
  }
}
