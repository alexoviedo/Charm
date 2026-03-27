// src/main.js
import { GitHubService } from './github.js';
import { SerialMonitor } from './monitor.js';
import { WebFlasher } from './flasher.js';

document.addEventListener("DOMContentLoaded", () => {
  const fetchStatus = document.getElementById("fetch-status");
  const flashStatus = document.getElementById("flash-status");
  const fetchBtn = document.getElementById("fetch-btn");
  const connectBtn = document.getElementById("connect-btn");
  const flashBtn = document.getElementById("flash-btn");
  const clearMonitorBtn = document.getElementById("clear-monitor-btn");

  const githubRepo = document.getElementById("github-repo");
  const githubPat = document.getElementById("github-pat");

  const monitor = new SerialMonitor("terminal-container");
  const github = new GitHubService(fetchStatus);
  const flasher = new WebFlasher(flashStatus, monitor);

  let binaries = null;

  // Ensure Web Serial API is supported
  if (!navigator.serial) {
    flashStatus.textContent = "Web Serial API not supported in this browser. Please use Chrome/Edge 89+.";
    flashStatus.classList.add('error');
    return;
  }

  // Bind Fetch Action
  fetchBtn.addEventListener("click", async () => {
    fetchBtn.disabled = true;
    binaries = await github.fetchLatestArtifact(githubRepo.value, githubPat.value);

    if (binaries) {
      connectBtn.disabled = false;
    }
    fetchBtn.disabled = false;
  });

  // Bind Connect Action
  connectBtn.addEventListener("click", async () => {
    const success = await flasher.connect();
    if (success) {
      connectBtn.disabled = true;
      flashBtn.disabled = false;
    }
  });

  // Bind Flash Action
  flashBtn.addEventListener("click", async () => {
    flashBtn.disabled = true;
    await flasher.flash(binaries);
  });

  // Bind Monitor Action
  clearMonitorBtn.addEventListener("click", () => {
    monitor.clear();
  });
});
