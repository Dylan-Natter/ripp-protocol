# Version Mismatch Fix for VSCode Extension

## Issue

A direct push to the main branch created git tag `v0.4.0` without updating the VSCode extension's version metadata files. This caused the build workflow to fail with a version mismatch error.

## Root Cause

The build workflow (`vscode-extension-build.yml`) validates that the `package.json` version matches the git tag version:

```bash
VERSION=$(node -p "require('./package.json').version")
TAG_NAME="${{ github.ref_name }}"
EXPECTED_VERSION=$(echo "$TAG_NAME" | sed -E 's/^(.*-)?v([0-9]+\.[0-9]+\.[0-9]+(\.[0-9]+)?)$/\2/')

if [ "$VERSION" != "$EXPECTED_VERSION" ]; then
  echo "❌ Error: Version mismatch!"
  exit 1
fi
```

The tag was at v0.4.0, but package files showed 0.3.0, causing the validation to fail.

## Solution

Updated all version-related files to align with git tag `v0.4.0`:

- `tools/vscode-extension/package.json` - version 0.3.0 → 0.4.0
- `tools/vscode-extension/package-lock.json` - version 0.3.0 → 0.4.0 (2 locations)
- `.release-please-manifest.json` - version 0.3.0 → 0.4.0 for tools/vscode-extension
- `tools/vscode-extension/CHANGELOG.md` - added 0.4.0 release entry

## Additional Fixes

Fixed Prettier formatting issues in pre-existing files:

- `.ripp/candidates/intent.candidates.json`
- `.ripp/ripp-protocol-tools.ripp.yaml`
- `tools/ripp-cli/lib/evidence.js`
- `tools/vscode-extension/.ripp/evidence/evidence.index.json`

## Prevention

To prevent similar issues in the future:

1. **Always use pull requests** for version bumps to ensure proper review and validation
2. **Use release-please** workflow for automated version management
3. **Verify version consistency** before creating tags manually
4. The build workflow's version validation will catch mismatches automatically

## Related Files

- Build workflow: `.github/workflows/vscode-extension-build.yml`
- Release workflow: `.github/workflows/release-please.yml`
- Version tracking: `.release-please-manifest.json`
