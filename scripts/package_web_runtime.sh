#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: $0 <output-dir> <release-id>"
  exit 1
fi

OUT_DIR="$1"
RELEASE_ID="$2"

rm -rf "${OUT_DIR}"
mkdir -p "${OUT_DIR}/releases/${RELEASE_ID}"
mkdir -p "${OUT_DIR}/current"

cp -R web/. "${OUT_DIR}/releases/${RELEASE_ID}/"
cp -R web/. "${OUT_DIR}/current/"

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
