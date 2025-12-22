# RIPP Release Checklist

This document outlines the complete release process for RIPP CLI and VS Code extension releases.

## Pre-Release Verification

### Local Development Checks

Before creating any releases, verify all changes work locally:

```bash
# From repository root
cd /path/to/ripp-protocol

# 1. Install dependencies
npm ci
cd tools/ripp-cli && npm ci && cd ../..
cd tools/vscode-extension && npm ci && cd ../..

# 2. Run formatters
npm run format:check
# If formatting issues found:
# npm run format

# 3. Run linters
npm run lint
cd tools/ripp-cli && npm run lint && cd ../..
cd tools/vscode-extension && npm run lint && cd ../..

# 4. Run tests
cd tools/ripp-cli
npm test
cd ../..

# 5. Validate example packets
ripp validate examples/

# 6. Test CLI commands
cd tools/ripp-cli
npm link
cd ../..
ripp metrics
ripp --help

# 7. Build VS Code extension
cd tools/vscode-extension
npm run compile
npm run package
cd ../..
```

### CI/CD Verification

Ensure all GitHub Actions workflows pass:

- ✅ `code-quality.yml` - Linting and formatting
- ✅ `ripp-validate.yml` - Schema validation on examples
- ✅ `drift-prevention.yml` - Detect unintended changes

## CLI Release Process

### Version Bumping

1. Update version in `tools/ripp-cli/package.json`:

   ```json
   {
     "version": "1.0.2"
   }
   ```

2. Update CHANGELOG.md with new version and changes:

   ```markdown
   ## [1.0.2] - 2025-12-22

   ### Added

   - `ripp metrics` command for workflow analytics
   - `--report` flag to write metrics.json
   - `--history` flag to show trends

   ### Changed

   - Improved error messages in checklist parser

   ### Fixed

   - Fixed Windows line ending handling in checklist
   ```

3. Commit version bump:

   ```bash
   git add tools/ripp-cli/package.json CHANGELOG.md
   git commit -m "chore(cli): bump version to 1.0.2"
   git push origin main
   ```

### Creating Release Tag

1. Create and push tag:

   ```bash
   git tag ripp-cli-v1.0.2 -m "Release CLI v1.0.2"
   git push origin ripp-cli-v1.0.2
   ```

2. Verify workflows triggered:
   - `npm-publish.yml` should trigger and publish to npm
   - `build-binaries.yml` should trigger for Homebrew distribution

### Post-Release Verification

1. Wait for npm publish workflow to complete

2. Verify npm package:

   ```bash
   npm info ripp-cli
   # Should show version 1.0.2
   ```

3. Test installation:

   ```bash
   mkdir -p /tmp/ripp-test-install
   cd /tmp/ripp-test-install
   npm init -y
   npm install ripp-cli@1.0.2
   npx ripp --version
   # Should output: ripp-cli v1.0.2
   ```

4. Verify Homebrew binaries (if applicable):
   - Check GitHub Release for attached binaries
   - Download and verify checksums

## VS Code Extension Release Process

### Version Bumping

1. Update version in `tools/vscode-extension/package.json`:

   ```json
   {
     "version": "0.4.3"
   }
   ```

2. Update `tools/vscode-extension/CHANGELOG.md`:

   ```markdown
   ## [0.4.3] - 2025-12-22

   ### Added

   - "RIPP: Show Metrics" command
   - Metrics display in OutputChannel
   - Option to view metrics report and history

   ### Changed

   - Improved progress notifications
   ```

3. Commit version bump:

   ```bash
   git add tools/vscode-extension/package.json tools/vscode-extension/CHANGELOG.md
   git commit -m "chore(vscode): bump version to 0.4.3"
   git push origin main
   ```

### Pre-Release Testing (Safe)

Test VSIX build without publishing:

```bash
# Create a test tag (won't trigger publish workflows)
git tag test-vscode-v0.4.3-alpha -m "Test VSIX build"
git push origin test-vscode-v0.4.3-alpha

# Monitor GitHub Actions:
# - vscode-extension-build.yml should run
# - Should produce VSIX artifact
# - Should attach VSIX to GitHub Release

# After verification, delete test tag:
git tag -d test-vscode-v0.4.3-alpha
git push origin :refs/tags/test-vscode-v0.4.3-alpha
```

### Creating Release Tag

1. Create and push tag:

   ```bash
   git tag vscode-extension-v0.4.3 -m "Release VS Code Extension v0.4.3"
   git push origin vscode-extension-v0.4.3
   ```

2. Verify workflows triggered:
   - `vscode-extension-build.yml` should build and attach VSIX
   - `vscode-extension-publish.yml` should publish to Marketplace

### Post-Release Verification

1. Wait for workflows to complete

2. Check GitHub Release:
   - Navigate to: https://github.com/Dylan-Natter/ripp-protocol/releases
   - Verify `vscode-extension-v0.4.3` release exists
   - Verify `.vsix` file is attached
   - Download VSIX and verify it's valid (not corrupted)

3. Verify Marketplace publication:
   - Visit: https://marketplace.visualstudio.com/items?itemName=RIPP.ripp-protocol
   - Version should show `0.4.3`
   - May take 5-15 minutes to propagate

4. Test installation from Marketplace:

   ```bash
   # In VS Code:
   # 1. Extensions view (Ctrl+Shift+X)
   # 2. Search "RIPP Protocol"
   # 3. Verify version is 0.4.3
   # 4. Click Install/Update
   # 5. Test commands work
   ```

## Rollback Procedures

### CLI Rollback

If critical issues found after release:

1. Deprecate bad version on npm:

   ```bash
   npm deprecate ripp-cli@1.0.2 "Critical bug, use 1.0.1 instead"
   ```

2. Create hotfix release with incremented version

### VS Code Extension Rollback

If critical issues found after release:

1. Unpublish from Marketplace (contact VS Code team if needed)

2. Create hotfix release with incremented version

3. Users can manually downgrade:
   - Uninstall extension
   - Install from previous VSIX in GitHub Releases

## Common Issues and Solutions

### Issue: npm publish fails with 403

**Solution:**

- Verify NPM_TOKEN secret is configured in GitHub repository settings
- Ensure token has publish permissions
- Check npm account has 2FA bypass enabled for automation tokens

### Issue: VSIX not attached to GitHub Release

**Solution:**

- Check workflow logs for errors
- Verify `contents: write` permission in workflow
- Ensure VSIX was built successfully (check artifacts)
- Re-run workflow if needed

### Issue: Marketplace publish fails

**Solution:**

- Verify VS Code Marketplace token (VSCE_PAT) is valid
- Check token has publish permissions for `RIPP` publisher
- Review marketplace publish logs in GitHub Actions

### Issue: CI workflows fail on tag push

**Solution:**

- Check workflow trigger patterns match tag format
- Verify Node 20 is used in all workflows
- Check for linting/formatting issues
- Review workflow logs for specific errors

## Release Frequency

**Recommended schedule:**

- **Patch releases** (x.x.X): As needed for bug fixes
- **Minor releases** (x.X.0): Monthly for new features
- **Major releases** (X.0.0): When breaking changes required (should be rare due to additive-only policy)

## Coordination with Documentation

When releasing changes:

1. Ensure docs in `/docs` are updated
2. Update main README.md if user-facing changes
3. Update CHANGELOG.md with clear release notes
4. Mark completed items in `docs/planning/NEXT_LEVEL_ENHANCEMENTS.md`

## Emergency Hotfix Process

For critical security or data loss bugs:

1. Create hotfix branch from latest release tag:

   ```bash
   git checkout ripp-cli-v1.0.2
   git checkout -b hotfix/cli-1.0.3
   ```

2. Apply minimal fix

3. Update version to patch increment

4. Create PR to main and release branch

5. After merge, immediately tag and release:

   ```bash
   git tag ripp-cli-v1.0.3 -m "Hotfix: Critical bug"
   git push origin ripp-cli-v1.0.3
   ```

6. Notify users via GitHub Release notes and npm deprecation of broken version

## Post-Release Communication

After successful release:

1. Update GitHub Release notes with:
   - Summary of changes
   - Breaking changes (if any)
   - Migration guide (if needed)
   - Links to documentation

2. Consider announcement on:
   - GitHub Discussions
   - Twitter/social media (if applicable)
   - Team chat/email

3. Monitor for issues:
   - GitHub Issues for bug reports
   - npm download stats
   - Marketplace ratings/reviews

## Verification Commands Summary

```bash
# Quick verification checklist
npm run format:check  # Root
npm run lint          # Root
cd tools/ripp-cli && npm test && cd ../..  # CLI tests
ripp validate examples/  # Schema validation
ripp metrics  # Test new command
cd tools/vscode-extension && npm run compile && npm run package && cd ../..  # Extension build
```

## Support

For questions about the release process:

- Open an issue: https://github.com/Dylan-Natter/ripp-protocol/issues
- Review past releases for examples
- Check workflow logs for debugging
