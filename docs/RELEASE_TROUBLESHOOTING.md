# Release Process Troubleshooting Report

**Date:** December 25, 2025  
**Branch:** copilot/troubleshoot-release-process  
**Issue:** Troubleshoot and verify release process is working properly

## Executive Summary

The release process has experienced issues due to manual version bumps that bypassed the automated release-please workflow. This document identifies the problems and provides solutions to restore proper release automation.

## Identified Issues

### 1. CLI (ripp-cli) Version Mismatch

**Status:** ⚠️ **Partially Fixed**

- **Current version in code:** 1.2.1 (main branch, `tools/ripp-cli/package.json`)
- **Latest GitHub Release:** ripp-cli-v1.2.0
- **Published on npm:** 1.2.1 ✓
- **Release-please manifest:** Was 1.2.0, now fixed to 1.2.1

**Root Cause:**  
Version 1.2.1 was manually bumped and published to npm to fix schema bundling issues (commit ed94409), bypassing the release-please process. No GitHub Release was created for v1.2.1.

**What Happened:**

1. Version 1.2.0 was published to npm on Dec 23
2. Post-publish smoke tests failed (missing schema files)
3. Automatic rollback triggered (issue #199) - unpublished v1.2.0
4. Bug was fixed by bundling schema files (commit ed94409)
5. Version was manually bumped to 1.2.1
6. Published manually to npm successfully
7. No GitHub Release was created for v1.2.1

### 2. VS Code Extension Version Mismatch

**Status:** ⚠️ **Needs Release**

- **Current version in code:** 0.5.2 (main branch, `tools/vscode-extension/package.json`)
- **Latest GitHub Release:** v0.5.1
- **Release-please manifest:** Was 0.5.2 (already updated)

**Root Cause:**  
Version 0.5.2 was manually bumped in code with fixes for development workflow and debugging, but no GitHub Release has been created yet.

### 3. Release-Please Manifest Out of Sync

**Status:** ✅ **FIXED**

The `.release-please-manifest.json` file was out of sync with actual package versions:

- CLI: manifest showed 1.2.0, but code has 1.2.1
- VS Code: manifest showed 0.5.2 (correct)

**Fix Applied:**  
Updated `.release-please-manifest.json` to reflect current versions:

```json
{
  "tools/vscode-extension": "0.5.2",
  "tools/ripp-cli": "1.2.1"
}
```

### 4. Auto-Publish Configuration

**Status:** ✅ **Verified Working**

All publishing workflows correctly check for `ENABLE_AUTO_PUBLISH` repository variable:

- `npm-publish.yml` - publishes CLI to npm
- `vscode-extension-publish.yml` - publishes extension to VS Code Marketplace
- `build-binaries.yml` - builds platform binaries

**Workflow Trigger Logic:**

```yaml
if: |
  (github.event_name == 'release' && startsWith(github.event.release.tag_name, 'ripp-cli-v') && vars.ENABLE_AUTO_PUBLISH == 'true') ||
  github.event_name == 'workflow_dispatch'
```

## Solutions

### Fix 1: Sync Release-Please Manifest

**Status:** ✅ **COMPLETED**

Updated `.release-please-manifest.json` to match current package versions.

### Fix 2: Create Missing GitHub Releases

**Required Actions:**

#### For ripp-cli v1.2.1:

Create a GitHub Release with:

- **Tag:** `ripp-cli-v1.2.1`
- **Title:** `ripp-cli: v1.2.1`
- **Body:**

```markdown
## [1.2.1] (2025-12-24)

### Bug Fixes

- **cli:** bundle schema files in npm package to fix validation when installed globally ([ed94409](https://github.com/Dylan-Natter/ripp-protocol/commit/ed94409))
  - Schema files are now included in the npm package under `schema/` directory
  - Updated schema loading paths to use bundled schemas instead of parent directory
  - Fixes post-publish smoke test failures from version 1.2.0
- **cli:** fix checklist generation and parsing bugs in `ripp confirm` command
  - Fixed extraction of content fields (purpose, ux_flow, data_contracts, etc.) from candidates
  - Use 'purpose' or 'full-packet' as section name instead of 'unknown'
  - Add 'full-packet' to valid section types in checklist parser
  - Fixes empty YAML blocks in generated checklists
  - Fixes 'Unknown section type' error when building from checklist

**Note:** This version was published to npm on 2025-12-24 to resolve critical schema bundling issues that caused smoke test failures in v1.2.0.
```

#### For VS Code Extension v0.5.2:

Create a GitHub Release with:

- **Tag:** `v0.5.2`
- **Title:** `v0.5.2`
- **Body:**

```markdown
## [0.5.2](https://github.com/Dylan-Natter/ripp-protocol/compare/v0.5.1...v0.5.2) (2025-12-24)

### Bug Fixes

- **vscode:** improve development workflow and debugging ([141377e](https://github.com/Dylan-Natter/ripp-protocol/commit/141377e9ac2c5c14ca67b088a7ff46ffb754094f))
- **vscode:** improve development workflow and debugging ([668d6ed](https://github.com/Dylan-Natter/ripp-protocol/commit/668d6ed5b1a4fb8ead28be5d7bf2cb5889ffef81))
```

### Fix 3: Enable Auto-Publishing (Optional)

**Status:** ℹ️ **Configuration Available**

To enable automatic publishing when releases are created:

1. Go to repository **Settings** → **Secrets and variables** → **Actions** → **Variables**
2. Create a new repository variable:
   - **Name:** `ENABLE_AUTO_PUBLISH`
   - **Value:** `true`

**When enabled:**

- Creating a release with tag `ripp-cli-v*` will automatically publish to npm
- Creating a release with tag `v*` (not starting with `ripp-cli-v`) will automatically publish to VS Code Marketplace
- Binary builds will automatically trigger for CLI releases

**When disabled or unset:**

- All publishing requires manual workflow dispatch
- Provides additional safety for production environments

## Verification Steps

### 1. Verify Current State

```bash
# Check CLI version
cd tools/ripp-cli
node -p "require('./package.json').version"
# Should show: 1.2.1

# Check VS Code extension version
cd tools/vscode-extension
node -p "require('./package.json').version"
# Should show: 0.5.2

# Check release-please manifest
cat .release-please-manifest.json
# Should show both versions correctly
```

### 2. Verify npm Package

```bash
# Check published version on npm
npm view ripp-cli version
# Should show: 1.2.1

# Test installation
npm install -g ripp-cli@1.2.1
ripp --version
# Should work without schema errors
```

### 3. Test Manual Workflow Triggers

**Test npm publish (dry run):**

```bash
# Go to Actions → Publish NPM Package → Run workflow
# Set: dry_run=true, package_path=tools/ripp-cli
# Verify it completes successfully
```

**Test VS Code extension build:**

```bash
# Go to Actions → Publish to VS Code Marketplace → Run workflow
# Set: publish=false
# Verify VSIX builds and uploads as artifact
```

## Best Practices Going Forward

### 1. Always Use Release-Please for Versions

- ✅ **DO:** Let release-please manage version bumps via PRs
- ❌ **DON'T:** Manually edit version in package.json
- ✅ **DO:** Use Conventional Commits to trigger releases automatically
- ❌ **DON'T:** Push direct commits to main that bump versions

### 2. Release Process Workflow

1. Merge conventional commits to main
2. Release-please opens/updates a Release PR
3. Review and merge the Release PR
4. Release-please creates a GitHub Release with appropriate tag
5. If `ENABLE_AUTO_PUBLISH=true`, workflows automatically publish
6. If not set, manually trigger publish workflows

### 3. Emergency Hotfix Process

If you must bypass release-please (like the 1.2.1 schema fix):

1. Fix the bug
2. Manually bump version in package.json
3. Publish to package registry (npm/VSIX)
4. **Immediately update `.release-please-manifest.json`**
5. **Create GitHub Release manually** with proper changelog
6. Document the emergency process in release notes

### 4. Pre-Release Checklist

Before creating a release:

- [ ] All tests pass
- [ ] Version matches across package.json and manifest
- [ ] CHANGELOG.md is updated
- [ ] Documentation reflects new version
- [ ] No uncommitted changes

### 5. Post-Release Verification

After a release is created:

- [ ] GitHub Release exists with correct tag
- [ ] Package published to npm/marketplace (if auto-publish enabled)
- [ ] Version matches on all platforms
- [ ] Smoke tests pass
- [ ] Documentation links work

## Related Workflows

### Release-Please Workflow

- **File:** `.github/workflows/release-please.yml`
- **Triggers:** On push to main
- **Purpose:** Creates/updates Release PRs based on conventional commits

### NPM Publish Workflow

- **File:** `.github/workflows/npm-publish.yml`
- **Triggers:**
  - Manual (workflow_dispatch)
  - Automatic on release (if ENABLE_AUTO_PUBLISH=true and tag starts with `ripp-cli-v`)
- **Purpose:** Publishes CLI to npm registry

### VS Code Extension Publish Workflow

- **File:** `.github/workflows/vscode-extension-publish.yml`
- **Triggers:**
  - Manual (workflow_dispatch)
  - Automatic on release (if ENABLE_AUTO_PUBLISH=true and tag doesn't start with `ripp-cli-v`)
- **Purpose:** Publishes extension to VS Code Marketplace

### Build Binaries Workflow

- **File:** `.github/workflows/build-binaries.yml`
- **Triggers:**
  - Manual (workflow_dispatch)
  - Automatic on release (if ENABLE_AUTO_PUBLISH=true and tag starts with `ripp-cli-v`)
- **Purpose:** Builds platform-specific binaries for CLI

## Recommendations

### Immediate Actions

1. ✅ **DONE:** Update `.release-please-manifest.json` to reflect current versions
2. ⏳ **PENDING:** Create GitHub Release for `ripp-cli-v1.2.1`
3. ⏳ **PENDING:** Create GitHub Release for `v0.5.2`
4. ⏳ **OPTIONAL:** Set `ENABLE_AUTO_PUBLISH=true` if auto-publishing is desired

### Long-Term Improvements

1. **Add Pre-Publish Validation:**
   - Check that release-please manifest matches package.json
   - Fail if versions are out of sync

2. **Improve Smoke Tests:**
   - The v1.2.0 rollback was correct - smoke tests caught the schema issue
   - Consider adding more comprehensive smoke tests

3. **Documentation:**
   - Document emergency hotfix process
   - Add release checklist to CONTRIBUTING.md
   - Create runbook for common release issues

4. **Monitoring:**
   - Set up alerts for failed publish workflows
   - Track release cadence and issues

## Conclusion

The release process is fundamentally sound but was disrupted by manual version management. With the manifest now synced and proper GitHub Releases created, the automated release pipeline will function correctly.

**Key Takeaway:** Trust the release-please automation and avoid manual version bumps unless absolutely necessary (and if necessary, immediately sync the manifest and create releases).

---

**Last Updated:** 2025-12-25  
**Status:** Fixes applied, pending manual release creation
