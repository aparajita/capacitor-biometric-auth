#!/usr/bin/env bash
#
# Syncs shared native files between demo variants (demo-pods, demo-spm).
# One variant is the source of truth; its files are copied to the other(s).
#
# Usage:
#   ./sync-demos.sh [--dry-run] [--from <variant>]
#
# Options:
#   --dry-run   Show what would be copied without doing it
#   --from      Source variant (default: demo-pods)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

# -- Configuration --

VARIANTS=(demo-pods demo-spm)

# Platform support for each variant
declare -A VARIANT_PLATFORMS
VARIANT_PLATFORMS[demo-pods]="ios android"
VARIANT_PLATFORMS[demo-spm]="ios android"

# Files to sync, relative to the demo variant root.
# Directories are synced recursively.
IOS_SYNC=(
  ios/App/App/AppDelegate.swift
  ios/App/App/Info.plist
  ios/App/App/Assets.xcassets
  ios/App/App/Base.lproj
)

ANDROID_SYNC=(
  android/app/src/main/AndroidManifest.xml
  android/app/src/main/java
  android/app/src/main/res
  android/app/build.gradle
  android/build.gradle
  android/gradle.properties
  android/variables.gradle
)

SYNC_PATHS=("${IOS_SYNC[@]}" "${ANDROID_SYNC[@]}")

# Check if a path should be synced to a target based on platform support
should_sync_path() {
  local target="$1"
  local path="$2"
  local platforms="${VARIANT_PLATFORMS[$target]}"

  # Check if path is iOS or Android
  if [[ "$path" == ios/* ]]; then
    [[ "$platforms" == *"ios"* ]]
  elif [[ "$path" == android/* ]]; then
    [[ "$platforms" == *"android"* ]]
  else
    # Unknown platform, sync by default
    true
  fi
}

# -- Parse arguments --

DRY_RUN=false
YES=false
SOURCE="demo-pods"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --yes|-y)
      YES=true
      shift
      ;;
    --from)
      SOURCE="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Usage: $0 [--dry-run] [--yes] [--from <variant>]" >&2
      exit 1
      ;;
  esac
done

# -- Validate --

if [[ ! -d "$SOURCE" ]]; then
  echo "Error: source variant '$SOURCE' not found." >&2
  exit 1
fi

# Build list of targets (all variants except source)
TARGETS=()
for v in "${VARIANTS[@]}"; do
  if [[ "$v" != "$SOURCE" ]]; then
    if [[ ! -d "$v" ]]; then
      echo "Warning: target variant '$v' not found, skipping." >&2
      continue
    fi
    TARGETS+=("$v")
  fi
done

if [[ ${#TARGETS[@]} -eq 0 ]]; then
  echo "No target variants to sync to." >&2
  exit 1
fi

# -- Preview changes --

echo "Preview of changes:"
echo ""

CHANGES=()

for target in "${TARGETS[@]}"; do
  echo "$SOURCE -> $target:"
  for path in "${SYNC_PATHS[@]}"; do
    src="$SOURCE/$path"
    dst="$target/$path"

    if [[ ! -e "$src" ]]; then
      continue
    fi

    # Skip if target doesn't support this platform
    if ! should_sync_path "$target" "$path"; then
      continue
    fi

    if [[ -d "$src" ]]; then
      # For directories, show rsync dry-run diff
      diff_output=$(rsync -a --delete --dry-run --itemize-changes "$src/" "$dst/" 2>/dev/null || true)
      if [[ -n "$diff_output" ]]; then
        echo "  [dir]  $path"
        # shellcheck disable=SC2001
        echo "$diff_output" | sed 's/^/         /'
        CHANGES+=("$target/$path")
      fi
    else
      # For files, show if they differ or don't exist
      if [[ ! -e "$dst" ]]; then
        echo "  [new]  $path"
        CHANGES+=("$target/$path")
      elif ! cmp -s "$src" "$dst"; then
        echo "  [mod]  $path"
        CHANGES+=("$target/$path")
      fi
    fi
  done
  echo ""
done

if [[ ${#CHANGES[@]} -eq 0 ]]; then
  echo "No changes needed. All variants are in sync."
  exit 0
fi

if $DRY_RUN; then
  echo "${#CHANGES[@]} item(s) would be synced."
  exit 0
fi

# -- Confirm --

if [[ "$YES" != true ]]; then
  echo -n "Proceed with sync? [y/N] "
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
fi

# -- Sync --

SYNCED=0

for target in "${TARGETS[@]}"; do
  for path in "${SYNC_PATHS[@]}"; do
    src="$SOURCE/$path"
    dst="$target/$path"

    if [[ ! -e "$src" ]]; then
      continue
    fi

    # Skip if target doesn't support this platform
    if ! should_sync_path "$target" "$path"; then
      continue
    fi

    # Ensure parent directory exists
    mkdir -p "$(dirname "$dst")"

    if [[ -d "$src" ]]; then
      rsync -a --delete "$src/" "$dst/"
    else
      cp "$src" "$dst"
    fi
    SYNCED=$((SYNCED + 1))
  done
done

echo "Done: $SYNCED item(s) synced."
