# VS Code Extension Versioning

## Microsoft Marketplace Requirements

The `version` field in `package.json` **MUST** follow strict Microsoft VS Code Marketplace requirements:

### ✅ Valid Version Format

- **Numeric only**: 1-4 dot-separated integers
- **Examples**: `0.1.0`, `1.0.0`, `1.2.3`, `2.1.0.4`
- **At least one segment must be non-zero**

### ❌ Invalid Version Formats

Prerelease labels and build metadata are **NOT ALLOWED** in the Marketplace:

- ❌ `0.1.0-ci` (prerelease label)
- ❌ `0.1.0-alpha` (prerelease label)
- ❌ `0.1.0-beta.1` (prerelease label)
- ❌ `0.1.0+build.123` (build metadata)
- ❌ `0.1.0-ci.20251216073528.462bdeb` (prerelease + build metadata)

## Why This Matters

The Microsoft VS Code Marketplace validates extension packages and **rejects** any VSIX file with a non-compliant version string. Attempting to publish with a prerelease or metadata suffix will fail with an error like:

> The version string '0.1.0-ci.20251216073528.462bdeb' doesn't conform to the requirements for a version. It must be one to four numbers in the range 0 to 2147483647, with each number separated by a period. It must contain at least one non-zero number.

## CI/CD Versioning Strategy

### Manual Versioning

The VS Code extension uses **manual versioning only**. The CI/CD workflow does not automatically increment versions.

**How It Works:**

- **Version Source**: The version in `package.json` is the single source of truth
- **CI Behavior**: The workflow validates the version is Marketplace-compliant and builds the VSIX with that exact version
- **All Events**: Both main branch builds and pull requests use the version from `package.json` without modification
- **No Auto-Increment**: The workflow never modifies `package.json` or creates git tags

### How to Release a New Version

To publish a new version of the extension:

1. **Update the version** in `package.json`:

   ```bash
   cd tools/vscode-extension
   # For patch release (0.2.0 → 0.2.1)
   npm version patch
   # For minor release (0.2.0 → 0.3.0)
   npm version minor
   # For major release (0.2.0 → 1.0.0)
   npm version major
   ```

   This command will:
   - Update `package.json` with the new version
   - Create a git commit with the version bump
   - Create a git tag (e.g., `v0.2.1`)

2. **Update CHANGELOG.md** with changes for the new version

3. **Push the changes** including the tag:

   ```bash
   git push origin main
   git push origin --tags
   ```

4. **The CI workflow will automatically build** the VSIX with the new version

5. **Optional: Publish to Marketplace**:
   ```bash
   npx vsce publish
   ```

### Pull Requests and Development Builds

For pull requests and development builds, the workflow:

- Uses the existing version from `package.json` for packaging
- Validates the version is Marketplace-compliant
- Artifacts are named with build metadata for identification:
  - Format: `vscode-extension-{version}-build-{timestamp}.{sha}`
  - Example: `vscode-extension-0.2.0-build-20251217183528.f7fc498`
  - The build metadata is used only for artifact naming, not in the VSIX package itself

### Version Update Guidelines

Follow semantic versioning when updating versions:

- **Patch** (`0.2.0` → `0.2.1`): Bug fixes, minor improvements
- **Minor** (`0.2.0` → `0.3.0`): New features, backward-compatible changes
- **Major** (`0.2.0` → `1.0.0`): Breaking changes, major rewrites

## References

- [VS Code Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Semantic Versioning](https://semver.org/)
