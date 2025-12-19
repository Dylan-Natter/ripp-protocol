# Publishing Guide

This guide explains how to publish RIPP packages and extensions using GitHub Actions workflows.

---

## Overview

RIPP uses GitHub Actions workflows to automate publishing:

1. **VS Code Extension** → VS Code Marketplace (`vscode-extension-publish.yml`)
2. **RIPP CLI (npm)** → npm Registry (`npm-publish.yml`)

Both workflows are **manual by default** with dry-run safety controls to prevent accidental publishes.

---

## Prerequisites

### Required Secrets

Both workflows require secrets to be configured in the GitHub repository:

#### 1. VSCE_PAT (VS Code Extension Publishing)

**Purpose:** Authenticate with the VS Code Marketplace to publish extensions

**How to create:**

1. Go to [Azure DevOps](https://dev.azure.com) and sign in with your Microsoft account
2. Navigate to **User Settings** → **Personal Access Tokens**
3. Click **New Token** and configure:
   - **Name:** `VSCE Publishing Token` (or similar)
   - **Organization:** Select your organization (or "All accessible organizations")
   - **Expiration:** Choose an appropriate duration (e.g., 90 days or custom)
   - **Scopes:** Select **Marketplace** → **Manage** (grants publish rights)
4. Click **Create** and copy the token (it won't be shown again!)

**How to add to GitHub:**

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `VSCE_PAT`
4. Value: Paste the token from Azure DevOps
5. Click **Add secret**

**Security notes:**

- The PAT has publish rights to the VS Code Marketplace
- Never commit it to source code
- Rotate it periodically (every 90 days recommended)
- Use minimal scopes (Marketplace: Manage only)

#### 2. NPM_TOKEN (npm Package Publishing)

**Purpose:** Authenticate with npm registry to publish packages

**How to create:**

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Click your profile icon → **Access Tokens**
3. Click **Generate New Token** → **Classic Token**
4. Select **Automation** token type (recommended for CI/CD)
5. Copy the token (starts with `npm_...`)

**How to add to GitHub:**

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `NPM_TOKEN`
4. Value: Paste the token from npmjs.com
5. Click **Add secret**

**Security notes:**

- Use "Automation" tokens for CI/CD (never "Publish" tokens which are more privileged)
- Never commit it to source code
- Revoke and regenerate if compromised
- Consider using granular access tokens (if available) to limit scope to specific packages

---

## Publishing the VS Code Extension

### Workflow: `vscode-extension-publish.yml`

**Location:** `.github/workflows/vscode-extension-publish.yml`

**Triggers:**

- **Automatic:** When a GitHub Release is published (if `ENABLE_AUTO_PUBLISH` is set)
- **Manual:** Via workflow_dispatch (recommended)

### Manual Publishing (Recommended)

#### Step 1: Test the Build (Dry Run)

1. Go to **Actions** → **Publish to VS Code Marketplace**
2. Click **Run workflow**
3. Configure:
   - **Tag name:** Leave empty (uses current branch) or specify a tag (e.g., `v0.2.2`)
   - **Publish:** `false` (build only, safe test)
   - **Pre-release:** `false` (unless publishing a pre-release)
4. Click **Run workflow**
5. Wait for completion (~2-3 minutes)
6. Download the VSIX artifact from the workflow run
7. Test the VSIX locally:
   ```bash
   code --install-extension vscode-extension-0.2.2.vsix
   ```

#### Step 2: Publish to Marketplace

Once you've verified the VSIX works correctly:

1. Go to **Actions** → **Publish to VS Code Marketplace**
2. Click **Run workflow**
3. Configure:
   - **Tag name:** Specify the git tag to publish (e.g., `v0.2.2`)
   - **Publish:** `true` (⚠️ WILL PUBLISH FOR REAL)
   - **Pre-release:** `false` (or `true` for pre-release versions)
4. Click **Run workflow**
5. Wait for completion (~3-5 minutes)
6. Verify publication:
   - Check the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=RIPP.ripp-protocol)
   - Search for the extension in VS Code

**What happens:**

- Checks out the specified tag (or current HEAD if empty)
- Installs dependencies and compiles TypeScript
- Runs linter (fails if lint errors)
- Packages the VSIX
- Uploads VSIX as workflow artifact
- If `publish=true`: Publishes to the VS Code Marketplace using `VSCE_PAT`
- Generates a summary with extension ID, version, and Marketplace URL

**Safety features:**

- Default is `publish=false` (build-only mode)
- Requires explicit `publish=true` to actually publish
- VSIX artifact is always uploaded (even if publish fails)
- Concurrency control prevents double publishes
- Secrets are never exposed in logs

### Automatic Publishing (Optional)

To enable automatic publishing when a GitHub Release is created:

1. Set repository variable `ENABLE_AUTO_PUBLISH` to `true`
2. When release-please creates a GitHub Release, the publish workflow will automatically run
3. The VSIX will be published to the Marketplace without manual intervention

**⚠️ Warning:** Only enable this if you're confident in your release process. Manual publishing is safer.

---

## Publishing the RIPP CLI (npm)

### Workflow: `npm-publish.yml`

**Location:** `.github/workflows/npm-publish.yml`

**Triggers:**

- **Manual only:** Via workflow_dispatch

### Publishing Steps

#### Step 1: Bump the Version

Before publishing, update the version in `tools/ripp-cli/package.json`:

```bash
cd tools/ripp-cli
npm version patch  # or minor, major, prerelease
git add package.json package-lock.json
git commit -m "chore(cli): bump version to X.Y.Z"
git push
```

#### Step 2: Dry Run (Test)

1. Go to **Actions** → **Publish NPM Package**
2. Click **Run workflow**
3. Configure:
   - **Package path:** `tools/ripp-cli` (default, leave as-is)
   - **NPM dist-tag:** `latest` (or `next`, `beta` for pre-releases)
   - **Dry run:** `true` (⚠️ SAFE, test mode)
4. Click **Run workflow**
5. Wait for completion (~2-3 minutes)
6. Review the job summary:
   - Check package name, version, and dist-tag
   - Review package contents preview
   - Verify no errors or warnings

**What happens:**

- Checks out the repository
- Installs dependencies
- Runs tests and linter (if available)
- Checks if version is already published (fails if duplicate)
- Shows what would be published (`npm pack --dry-run`)
- Runs `npm publish --dry-run` (no actual publish)
- Generates a summary

#### Step 3: Publish for Real

Once the dry run succeeds:

1. Go to **Actions** → **Publish NPM Package**
2. Click **Run workflow**
3. Configure:
   - **Package path:** `tools/ripp-cli` (default, leave as-is)
   - **NPM dist-tag:** `latest` (or `next`, `beta` for pre-releases)
   - **Dry run:** `false` (⚠️ WILL PUBLISH FOR REAL)
4. Click **Run workflow**
5. Wait for completion (~2-3 minutes)
6. Verify publication:
   - Check [npmjs.com/package/ripp-cli](https://www.npmjs.com/package/ripp-cli)
   - Test installation:
     ```bash
     npm install -g ripp-cli
     ripp --version
     ```

**Safety features:**

- Default is `dry_run=true` (test mode)
- Requires explicit `dry_run=false` to actually publish
- Verifies version is not already published
- Checks working tree is clean (no uncommitted changes)
- Uses `NODE_AUTH_TOKEN` (secrets not exposed)
- Supports custom dist-tags (`latest`, `next`, `beta`)

---

## Release Checklist

Follow this checklist before publishing:

### Pre-Release

- [ ] **Version bump:** Update `package.json` version (for npm CLI)
  - VS Code extension version is managed by release-please
- [ ] **Run validation:**
  ```bash
  npm run test          # Run tests (root)
  npm run lint          # Run linter
  npm run format:check  # Check code formatting
  ```
- [ ] **Run RIPP validation:**
  ```bash
  npm run ripp:lint     # Lint RIPP examples
  ripp validate examples/
  ```
- [ ] **Build locally:**
  - VS Code extension: `cd tools/vscode-extension && npm run compile`
  - CLI: `cd tools/ripp-cli && npm link`
- [ ] **Test manually:**
  - VS Code extension: Load in Extension Development Host
  - CLI: Run `ripp validate`, `ripp lint`, etc.
- [ ] **Review CHANGELOG:** Ensure all changes are documented

### Publishing (VS Code Extension)

- [ ] **Dry run workflow:** Run with `publish=false`
- [ ] **Download and test VSIX:** Install locally and verify
- [ ] **Publish:** Re-run with `publish=true`
- [ ] **Verify on Marketplace:** Check extension page and version
- [ ] **Test installation:** Install from Marketplace in clean VS Code

### Publishing (npm CLI)

- [ ] **Commit version bump:** Ensure `package.json` version is committed
- [ ] **Dry run workflow:** Run with `dry_run=true`
- [ ] **Review package contents:** Check the dry run output
- [ ] **Publish:** Re-run with `dry_run=false`
- [ ] **Verify on npm:** Check package page and version
- [ ] **Test installation:** Install globally and verify commands work

### Post-Release

- [ ] **Tag the release (if not auto-tagged):**
  ```bash
  git tag -a v0.2.2 -m "Release v0.2.2"
  git push origin v0.2.2
  ```
- [ ] **Create GitHub Release:** If not using release-please
- [ ] **Update documentation:** If APIs or usage changed
- [ ] **Announce release:** Update README, social media, etc.

---

## Troubleshooting

### VS Code Extension

**Problem:** `VSCE_PAT secret is not configured`

- **Solution:** Add the `VSCE_PAT` secret to GitHub repository secrets (see [Prerequisites](#required-secrets))

**Problem:** Publish fails with "401 Unauthorized"

- **Solution:** The PAT may have expired or lacks permissions. Generate a new PAT with Marketplace: Manage scope.

**Problem:** Version already exists on Marketplace

- **Solution:** Bump the version in `tools/vscode-extension/package.json` before publishing

**Problem:** VSIX package is malformed

- **Solution:** Run `npm run compile` locally and test the extension before publishing

### npm CLI

**Problem:** `NPM_TOKEN secret is not configured`

- **Solution:** Add the `NPM_TOKEN` secret to GitHub repository secrets (see [Prerequisites](#required-secrets))

**Problem:** "Version X.Y.Z is already published"

- **Solution:** Bump the version in `tools/ripp-cli/package.json` using `npm version`

**Problem:** "Working tree is dirty"

- **Solution:** Commit or stash all changes before running the publish workflow

**Problem:** Tests or linter fail

- **Solution:** Fix the issues locally and re-run the workflow

---

## Security Best Practices

1. **Never commit secrets to source code**
   - Use GitHub Secrets for `VSCE_PAT` and `NPM_TOKEN`
   - Secrets are automatically redacted in logs

2. **Use minimal permissions**
   - VSCE_PAT: Only Marketplace: Manage scope
   - NPM_TOKEN: Use "Automation" token type

3. **Rotate secrets regularly**
   - Regenerate PATs every 90 days
   - Revoke and regenerate if compromised

4. **Test before publishing**
   - Always run dry-run/build-only mode first
   - Manually test VSIX or npm package locally

5. **Review workflow runs**
   - Check logs for unexpected errors or warnings
   - Verify secrets are not exposed

6. **Use concurrency controls**
   - Workflows prevent double publishes on the same ref
   - Don't manually run multiple publishes simultaneously

---

## Additional Resources

- [VS Code Extension Publishing Docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Release Please Documentation](https://github.com/googleapis/release-please)
- [RIPP PR-Based Versioning Guide](vscode-extension-pr-based-versioning.md)

---

## Questions?

If you encounter issues not covered in this guide:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the workflow logs for specific error messages
3. Open an issue in the repository with details
