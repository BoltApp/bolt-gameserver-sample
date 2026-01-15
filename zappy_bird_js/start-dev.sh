#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Starting zappy_bird_js with Tilt..."

# Change to script directory and start Tilt
cd "$SCRIPT_DIR" && tilt up

# Clean up when done
echo "Development environment stopped"
