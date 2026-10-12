#!/bin/bash

set -e

export DISPLAY=:99

echo "Starting Xvfb..."
Xvfb :99 -screen 0 1920x1080x24 &

sleep 3

echo "Starting Fluxbox..."
fluxbox &

sleep 3

echo "Starting x11vnc..."
x11vnc \
  -display :99 \
  -forever \
  -shared \
  -nopw \
  -rfbport 5900 &

sleep 3

echo "Starting websockify..."
websockify \
  --web=/usr/share/novnc \
  6080 \
  localhost:5900 &

echo "Desktop ready"

tail -f /dev/null