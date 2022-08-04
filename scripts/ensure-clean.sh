#!/usr/bin/env bash

git update-index --really-refresh >/dev/null

if git diff-index --quiet HEAD; then
  exit 0
else
  echo "Please commit or stash your changes before trying to release."
  exit 1
fi
