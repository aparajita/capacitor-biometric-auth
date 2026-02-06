#!/bin/bash

# Colors
GREEN='\033[32m'
RED='\033[31m'
YELLOW='\033[33m'
RESET='\033[0m'

# First argument is the platform name
PLATFORM="$1"
shift

# Temporary file for capturing output
OUTPUT_FILE=$(mktemp)
trap 'rm -f "$OUTPUT_FILE"' EXIT

# Run the command and capture output
"$@" > "$OUTPUT_FILE" 2>&1
EXIT_CODE=$?

# Check for warnings (case-insensitive)
WARNINGS=$(grep -i "warning" "$OUTPUT_FILE" || true)

# If build succeeded
if [ $EXIT_CODE -eq 0 ]; then
  # Show warnings if any
  if [ -n "$WARNINGS" ]; then
    echo -e "${YELLOW}Warnings found:${RESET}"
    echo "$WARNINGS"
    echo ""
  fi
  echo -e "${GREEN}${PLATFORM} build succeeded${RESET}"
  exit 0
fi

# Build failed - show all output
echo -e "${RED}${PLATFORM} build failed${RESET}"
echo ""
cat "$OUTPUT_FILE"
exit $EXIT_CODE
