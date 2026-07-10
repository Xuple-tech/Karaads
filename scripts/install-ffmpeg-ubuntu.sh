#!/usr/bin/env bash

set -euo pipefail

echo "[media] Installing FFmpeg on Ubuntu..."
sudo apt update
sudo apt install -y ffmpeg

echo "[media] Verifying binaries..."
ffmpeg -version | head -n 1
ffprobe -version | head -n 1

echo "[media] Done."

