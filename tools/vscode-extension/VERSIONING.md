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

### Production Releases

For Marketplace publication:

1. Set the `version` in `package.json` to the release version (e.g., `0.1.0`)
2. Run `npm run package` or `npx vsce package`
3. Publish to Marketplace with `npx vsce publish`

The VSIX filename will match: `ripp-protocol-0.1.0.vsix`

### CI Builds

For continuous integration and testing:

- The workflow reads the version from `package.json` but **never modifies it**
- Build metadata (timestamp, commit SHA) is kept **outside** the package manifest
- CI artifacts use descriptive names like `vscode-extension-0.1.0-build-20251216073528.462bdeb`
- The VSIX package itself remains Marketplace-compliant: `ripp-protocol-0.1.0.vsix`

## Version Increment Guidelines

When preparing a new release:

1. **Manually update** `version` in `package.json`
2. Follow semantic versioning:
   - Patch: Bug fixes (`0.1.0` → `0.1.1`)
   - Minor: New features, backward-compatible (`0.1.0` → `0.2.0`)
   - Major: Breaking changes (`0.1.0` → `1.0.0`)
3. Update `CHANGELOG.md` with release notes
4. Commit and tag the release
5. Run `npx vsce publish` to publish to Marketplace

## References

- [VS Code Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Semantic Versioning](https://semver.org/)
