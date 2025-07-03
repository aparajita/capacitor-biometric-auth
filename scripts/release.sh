#!/usr/bin/env bash

# This script is used to release a new version of the plugin & demo app.
# We're using Git Flow for the release process.

set -e
set -o pipefail
set -u

# Track the original branch to return to it on failure
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Attempt cleanup if anything fails
cleanup() {
  echo "An error occurred. Attempting to clean up..."
  git checkout "$ORIGINAL_BRANCH" || true
}
trap cleanup ERR

# Ensure the script is run from the root of the repository
if [[ ! -d .git ]]; then
  echo "This script must be run from the root of the repository."
  exit 1
fi

# Check if the current branch is 'develop'
if [[ "$ORIGINAL_BRANCH" != "develop" ]]; then
  echo "You must be on the 'develop' branch to run this script."
  exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
  echo "You have uncommitted changes. Please commit or stash them before running this script."
  exit 1
fi

# Create a new release branch
git checkout -b "release/next"

# Bump the version and update the changelog
pnpm tag --commit-all

# Push the release branch and tag to the remote
git push --follow-tags origin "release/next"

# Merge the release branch into 'main'. We use --ff-only
# to ensure the exact commit history is preserved (no merge commits).
git checkout main

if ! git merge --ff-only release/next; then
  echo "Fast-forward merge into 'main' failed. Aborting."
  git checkout "$ORIGINAL_BRANCH"
  exit 1
fi

git push origin main

# Merge the release branch back into 'develop'. We use --no-ff
# to ensure a merge commit is created, which helps in tracking the release.
# We use --no-edit to avoid prompting for a merge commit message.
git checkout develop
git merge --no-ff --no-edit release/next
git push origin develop

# Delete the release branch locally and remotely
git branch -d release/next
git push origin --delete release/next

# Return to the original branch
git checkout "$ORIGINAL_BRANCH"

echo "✅ Release completed successfully."
