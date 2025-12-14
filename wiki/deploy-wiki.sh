#!/bin/bash
# Script to deploy wiki pages to GitHub wiki repository

set -e

WIKI_REPO="https://github.com/Dylan-Natter/ripp-protocol.wiki.git"
WIKI_DIR="ripp-protocol.wiki"
SOURCE_DIR="$(dirname "$0")"

echo "Deploying RIPP wiki pages..."

# Clone wiki repo if it doesn't exist
if [ ! -d "$WIKI_DIR" ]; then
  echo "Cloning wiki repository..."
  git clone $WIKI_REPO
fi

cd $WIKI_DIR

# Pull latest changes
echo "Pulling latest wiki changes..."
git pull

# Copy all wiki pages (excluding README and tooling log)
echo "Copying wiki pages..."
for file in "$SOURCE_DIR"/*.md; do
  filename=$(basename "$file")
  if [ "$filename" != "README.md" ] && [ "$filename" != "RIPP-Tooling-Evolution-Log.md" ]; then
    echo "  - $filename"
    cp "$file" "./$filename"
  fi
done

# Check if there are changes
if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to deploy."
  cd ..
  exit 0
fi

# Commit and push
echo "Committing changes..."
git add .
git commit -m "Update RIPP wiki documentation"

echo "Pushing to GitHub wiki..."
git push

echo "✓ Wiki deployment complete!"

cd ..
