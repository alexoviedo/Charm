#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: $0 <output-dir> <release-id> [firmware-dir]"
  exit 1
fi

OUT_DIR="$1"
RELEASE_ID="$2"
FIRMWARE_DIR="${3:-}"

rm -rf "${OUT_DIR}"
mkdir -p "${OUT_DIR}/releases/${RELEASE_ID}"
mkdir -p "${OUT_DIR}/web"

cp -R web/. "${OUT_DIR}/releases/${RELEASE_ID}/"
cp -R web/. "${OUT_DIR}/web/"

if [[ -n "${FIRMWARE_DIR}" ]]; then
  if [[ ! -d "${FIRMWARE_DIR}" ]]; then
    echo "firmware directory not found: ${FIRMWARE_DIR}"
    exit 1
  fi
  mkdir -p "${OUT_DIR}/releases/${RELEASE_ID}/firmware"
  mkdir -p "${OUT_DIR}/web/firmware"
  cp -R "${FIRMWARE_DIR}/." "${OUT_DIR}/releases/${RELEASE_ID}/firmware/"
  cp -R "${FIRMWARE_DIR}/." "${OUT_DIR}/web/firmware/"
  echo "Included firmware artifacts from ${FIRMWARE_DIR}"
fi

cat > "${OUT_DIR}/deploy-metadata.json" <<EOF
{
  "release_id": "${RELEASE_ID}",
  "commit_sha": "${GITHUB_SHA:-unknown}",
  "run_id": "${GITHUB_RUN_ID:-unknown}",
  "run_attempt": "${GITHUB_RUN_ATTEMPT:-unknown}",
  "generated_at": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
}
EOF

echo "Packaged web runtime into ${OUT_DIR} (release=${RELEASE_ID})"
