#!/bin/bash

DEFAULT_HOSTNAME="bolt-gaming.ngrok.io"

# Use provided hostname or default
NGROK_HOSTNAME="${1:-$DEFAULT_HOSTNAME}"

if [ -n "$NGROK_HOSTNAME" ]; then
    echo "Starting development environment with ngrok hostname: $NGROK_HOSTNAME"
    echo "Note: Custom hostnames require a reserved domain in ngrok dashboard"
else
    echo "Starting development environment with ngrok (will generate random hostname)"
fi

# Export environment variables for Tilt
export NGROK_HOSTNAME="$NGROK_HOSTNAME"
export BL_NGROK="${BL_NGROK}"

# Start Tilt
tilt up

# Clean up when done
echo "Development environment stopped"