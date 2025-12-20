#!/usr/bin/env bash
# Script to help update the Homebrew formula with checksums from a GitHub release
# Usage: ./scripts/update-homebrew-formula.sh <version>
# Example: ./scripts/update-homebrew-formula.sh v1.0.0

set -e

VERSION="$1"

if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 v1.0.0"
  exit 1
fi

# Remove 'v' prefix if present for display
VERSION_NUMBER="${VERSION#v}"

REPO="Dylan-Natter/ripp-protocol"
BASE_URL="https://github.com/${REPO}/releases/download/${VERSION}"

echo "================================================"
echo "Homebrew Formula Update Helper"
echo "================================================"
echo "Version: ${VERSION}"
echo "Repository: ${REPO}"
echo ""

# Check if gh CLI is available
if command -v gh &> /dev/null; then
  echo "✓ GitHub CLI (gh) is available"
  echo ""
  
  # Try to fetch checksums using gh
  echo "Fetching checksums from GitHub Release..."
  echo ""
  
  ARM64_CHECKSUM=$(gh release view "${VERSION}" -R "${REPO}" --json assets -q '.assets[] | select(.name == "ripp-darwin-arm64.tar.gz.sha256") | .url' | xargs curl -sL | cut -d' ' -f1 || echo "")
  AMD64_CHECKSUM=$(gh release view "${VERSION}" -R "${REPO}" --json assets -q '.assets[] | select(.name == "ripp-darwin-amd64.tar.gz.sha256") | .url' | xargs curl -sL | cut -d' ' -f1 || echo "")
  
  if [ -n "$ARM64_CHECKSUM" ] && [ -n "$AMD64_CHECKSUM" ]; then
    echo "✓ Successfully fetched checksums"
  else
    echo "⚠ Could not fetch checksums automatically"
    ARM64_CHECKSUM="REPLACE_WITH_ARM64_SHA256"
    AMD64_CHECKSUM="REPLACE_WITH_AMD64_SHA256"
  fi
else
  echo "⚠ GitHub CLI (gh) not found. Install it for automatic checksum fetching:"
  echo "  https://cli.github.com/"
  echo ""
  echo "Manual checksum retrieval:"
  echo "  1. Visit: ${BASE_URL}"
  echo "  2. Download .sha256 files"
  echo ""
  ARM64_CHECKSUM="REPLACE_WITH_ARM64_SHA256"
  AMD64_CHECKSUM="REPLACE_WITH_AMD64_SHA256"
fi

echo ""
echo "================================================"
echo "Formula Update for ripp.rb"
echo "================================================"
echo ""
echo "Update the following in Formula/ripp.rb:"
echo ""
cat <<EOF
  version "${VERSION_NUMBER}"

  # macOS ARM64 (Apple Silicon)
  if Hardware::CPU.arm?
    url "${BASE_URL}/ripp-darwin-arm64.tar.gz"
    sha256 "${ARM64_CHECKSUM}"
  # macOS AMD64 (Intel)
  else
    url "${BASE_URL}/ripp-darwin-amd64.tar.gz"
    sha256 "${AMD64_CHECKSUM}"
  end
EOF

echo ""
echo "================================================"
echo "Next Steps"
echo "================================================"
echo ""
echo "1. Clone the homebrew-ripp repository:"
echo "   git clone https://github.com/Dylan-Natter/homebrew-ripp.git"
echo ""
echo "2. Edit Formula/ripp.rb with the values above"
echo ""
echo "3. Test the formula locally:"
echo "   brew install --build-from-source Formula/ripp.rb"
echo "   brew test ripp"
echo ""
echo "4. Commit and push:"
echo "   git add Formula/ripp.rb"
echo "   git commit -m \"ripp ${VERSION_NUMBER}\""
echo "   git push origin main"
echo ""
echo "5. Test installation:"
echo "   brew update"
echo "   brew upgrade ripp"
echo "   ripp --version"
echo ""

# If checksums were not fetched, provide manual instructions
if [ "$ARM64_CHECKSUM" = "REPLACE_WITH_ARM64_SHA256" ]; then
  echo "================================================"
  echo "Manual Checksum Retrieval"
  echo "================================================"
  echo ""
  echo "Download checksums from:"
  echo "  ${BASE_URL}/ripp-darwin-arm64.tar.gz.sha256"
  echo "  ${BASE_URL}/ripp-darwin-amd64.tar.gz.sha256"
  echo ""
  echo "Or use curl:"
  echo "  curl -L ${BASE_URL}/ripp-darwin-arm64.tar.gz.sha256"
  echo "  curl -L ${BASE_URL}/ripp-darwin-amd64.tar.gz.sha256"
  echo ""
fi
