#!/usr/bin/env bash
VERSION="$1"
IFS="." read -r major minor patch <<< "$VERSION"
NEXT_MINOR=$((minor + 1))
DEV_TAG="v${major}.${NEXT_MINOR}.0-dev.0"
echo "[semantic-release] tagging: $DEV_TAG"
git tag "$DEV_TAG"
git push origin "$DEV_TAG"
