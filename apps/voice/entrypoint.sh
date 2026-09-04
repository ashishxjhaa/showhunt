#!/bin/sh
set -eu
PORT="${PORT:-${VOICE_PORT:-7860}}"
echo "showhunt-voice: binding 0.0.0.0:${PORT}"
exec python -u server.py --host 0.0.0.0 --port "${PORT}"
