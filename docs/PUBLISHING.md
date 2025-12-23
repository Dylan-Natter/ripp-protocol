# Publishing Guide

This guide explains how to publish RIPP packages and extensions using the **fully automated** GitHub Actions publishing pipeline.

---

## Overview

RIPP uses **automated PR-based versioning and publishing** with GitHub Actions:

1. **VS Code Extension** → VS Code Marketplace (automatic on release)
2. **RIPP CLI (npm)** → npm Registry (automatic on release)
3. **macOS Binaries** → GitHub Releases (automatic on release)

**Key Principle:** Developers only merge conventional commit PRs to `main`. Everything else happens automatically through release-please and downstream workflows.

---

## How Automatic Publishing Works

### The Complete Flow

1. **Developer**: Merges PR with conventional commits to `main`
2. **release-please**: Creates/updates Release PR with version bumps and CHANGELOG
3. **Maintainer**: Reviews and merges Release PR
4. **Automation**:
   - Creates GitHub Releases with appropriate tags
   - Triggers publishing workflows for each package
   - Publishes to npm and VS Code Marketplace
   - Attaches binaries to releases

**No manual intervention required** beyond merging the Release PR.

### Package-Specific Tags

To support multiple packages in the monorepo:

- **VS Code Extension**: `vX.Y.Z` (e.g., `v0.5.0`)
- **RIPP CLI**: `ripp-cli-vX.Y.Z` (e.g., `ripp-cli-v1.1.0`)

Tags trigger the correct downstream workflows automatically.

---

## Prerequisites

### Required Repository Variable

**ENABLE_AUTO_PUBLISH** must be set to `true` to enable automatic publishing.

**How to set:**

1. Go to repository **Settings** → **Secrets and variables** → **Actions** → **Variables** tab
2. Click **New repository variable**
3. Name: `ENABLE_AUTO_PUBLISH`
4. Value: `true`
5. Click **Add variable**

**Purpose:** Acts as a safety gate to prevent accidental auto-publishing. When set to `false` or unset, only manual workflow triggers will publish packages.

### Required Secrets

Both publishing workflows require secrets to be configured in the GitHub repository:

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
3. Click **Generate New Token** → **Granular Access Token** (recommended)
4. Configure:
   - **Name:** `RIPP CLI Publishing Token` (or similar)
   - **Expiration:** Choose appropriate duration (e.g., 1 year)
   - **Packages and scopes:** Select `ripp-cli` with **Read and write** permissions
   - **2FA requirement:** Enable "Bypass 2FA requirement" (required for CI/CD)
5. Copy the token (starts with `npm_...`)

**Important:** The token MUST have "Bypass 2FA" enabled for automated publishing to work. Standard tokens may fail with E403 if 2FA is enabled on your npm account.

**How to add to GitHub:**

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `NPM_TOKEN`
4. Value: Paste the token from npmjs.com
5. Click **Add secret**

**Security notes:**

- Use "Granular Access Tokens" with specific package scope when possible
- Enable "Bypass 2FA" for automated publishing
- Never commit it to source code
- Revoke and regenerate if compromised
- Rotate tokens annually or as needed

---

## Automated Publishing (Primary Method)

### Prerequisites Checklist

Before automatic publishing can work:

- ✅ `ENABLE_AUTO_PUBLISH` variable set to `true`
- ✅ `NPM_TOKEN` secret configured (for CLI publishing)
- ✅ `VSCE_PAT` secret configured (for VS Code extension publishing)
- ✅ All commits use conventional commit format
- ✅ Branch protection rules enforced on `main`

### Publishing a New Version

**Step 1: Make Changes with Conventional Commits**

Use conventional commit messages to drive versioning:

```bash
# Minor version bump (new feature)
git commit -m "feat(cli): add --json output format"

# Patch version bump (bug fix)
git commit -m "fix(extension): resolve validation error display"

# Major version bump (breaking change)
git commit -m "feat(cli)!: redesign command interface"
```

**Step 2: Merge to Main**

Once your PR is reviewed and approved, merge it to `main`. The release-please workflow will automatically run.

**Step 3: Wait for Release PR**

Within minutes, release-please will:

- Analyze all commits since last release
- Determine version bumps for affected packages
- Create or update a "Release PR" with:
  - Version bumps in `package.json`
  - Updated `CHANGELOG.md`
  - Git tags

**Step 4: Review and Merge Release PR**

Review the Release PR to verify:

- Version numbers are correct
- CHANGELOG accurately reflects changes
- No unintended version bumps
- All CI checks pass

Then merge the Release PR.

**Step 5: Automatic Publishing Happens**

When the Release PR merges:

1. **GitHub Releases created** with tags (e.g., `v0.5.0`, `ripp-cli-v1.1.0`)
2. **VS Code Extension** (if applicable):
   - `vscode-extension-publish.yml` triggered by `vX.Y.Z` tag
   - Extension built, packaged, and published to Marketplace
   - VSIX uploaded as artifact
3. **RIPP CLI** (if applicable):
   - `npm-publish.yml` triggered by `ripp-cli-vX.Y.Z` tag
   - Package built, tested, and published to npm
4. **macOS Binaries** (if applicable):
   - `build-binaries.yml` triggered by `ripp-cli-vX.Y.Z` tag
   - Binaries built and attached to GitHub Release

All workflows run in parallel and complete within 5-10 minutes.

**Step 6: Verify Publication**

Check that packages are available:

- **npm**: https://www.npmjs.com/package/ripp-cli
- **VS Code Marketplace**: https://marketplace.visualstudio.com/items?itemName=RIPP.ripp-protocol
- **GitHub Releases**: https://github.com/Dylan-Natter/ripp-protocol/releases

---

## Manual Publishing (Emergency Override)

If automatic publishing fails or you need to publish without going through release-please, use the manual workflows.

### Manual VS Code Extension Publishing

**Only use manual publishing if:**

- Automatic publishing failed and you need to retry
- You need to publish a hotfix without going through release-please
- Testing the publishing workflow itself

#### Workflow: `vscode-extension-publish.yml`

**Location:** `.github/workflows/vscode-extension-publish.yml`

**Triggers:**

- **Automatic:** When a GitHub Release is published with tag `vX.Y.Z` (if `ENABLE_AUTO_PUBLISH` is `true`)
- **Manual:** Via workflow_dispatch (always available)

#### Manual Publishing Steps

##### Step 1: Test the Build (Dry Run)

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

##### Step 2: Publish to Marketplace

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

---

### Manual RIPP CLI Publishing

### Manual RIPP CLI Publishing

**Only use manual publishing if:**

- Automatic publishing failed and you need to retry
- You need to publish a hotfix without going through release-please
- Testing the publishing workflow itself

### Workflow: `npm-publish.yml`

**Location:** `.github/workflows/npm-publish.yml`

**Triggers:**

- **Automatic:** When a GitHub Release is published with tag `ripp-cli-vX.Y.Z` (if `ENABLE_AUTO_PUBLISH` is `true`)
- **Manual:** Via workflow_dispatch (always available)

### Publishing Steps (Manual Override Only)

**⚠️ Note:** These steps are only needed if automatic publishing failed. Under normal circumstances, publishing happens automatically when the Release PR is merged.

#### Step 1: Verify Version is Tagged

Ensure the version you want to publish has been tagged by release-please:

```bash
git fetch --tags
git tag -l "ripp-cli-v*"
```

If the tag doesn't exist, the Release PR may not have been merged yet.

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

### Automatic Publishing (Enabled by Default)

Automatic publishing is **enabled by default** when `ENABLE_AUTO_PUBLISH` is set to `true`.

When a GitHub Release is published with a tag matching `ripp-cli-vX.Y.Z` (e.g., `ripp-cli-v1.1.0`), the workflow:

1. Automatically checks out the tagged version
2. Installs dependencies and runs tests
3. Publishes to npm registry
4. Generates a summary with package URL

**To disable automatic publishing:**

1. Go to repository **Settings** → **Secrets and variables** → **Actions** → **Variables**
2. Set `ENABLE_AUTO_PUBLISH` to `false` or delete the variable

---

### macOS Binaries Publishing

Binaries are automatically built and attached to CLI releases when `ENABLE_AUTO_PUBLISH` is enabled.

**Workflow:** `build-binaries.yml`

**Triggers:**

- **Automatic:** When a GitHub Release is published with tag `ripp-cli-vX.Y.Z` (if `ENABLE_AUTO_PUBLISH` is `true`)
- **Manual:** Via workflow_dispatch (always available)

**What it does:**

1. Builds standalone binaries for macOS (ARM64 and AMD64)
2. Creates tar.gz archives with SHA256 checksums
3. Attaches binaries to the existing GitHub Release

**Note:** This workflow does NOT create releases - it only attaches binaries to releases created by release-please.

**Manual Trigger:** If binaries failed to build automatically, you can manually trigger the workflow:

1. Go to **Actions** → **Build and Attach Binaries to Release**
2. Click **Run workflow**
3. Enter the tag name (e.g., `ripp-cli-v1.1.0`)
4. Click **Run workflow**

---

## Release Checklist

### Before Merging to Main

- [ ] **Use conventional commits:** Ensure PR uses proper commit format (`feat:`, `fix:`, `feat!:`)
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
- [ ] **Test locally:**
  - VS Code extension: Load in Extension Development Host
  - CLI: Run `npm link` in `tools/ripp-cli` and test commands
- [ ] **Review CHANGELOG:** Ensure commit messages accurately describe changes

### Reviewing Release PR

- [ ] **Verify version bumps:** Check that version numbers follow semver correctly
- [ ] **Review CHANGELOG:** Ensure all changes are accurately documented
- [ ] **Check CI status:** All checks must pass
- [ ] **No unintended changes:** Only version numbers and CHANGELOG should change

### After Merging Release PR

- [ ] **Monitor GitHub Actions:** Watch for successful completion of publish workflows
- [ ] **Verify publications:**
  - VS Code Extension: Check [Marketplace](https://marketplace.visualstudio.com/items?itemName=RIPP.ripp-protocol)
  - RIPP CLI: Check [npm](https://www.npmjs.com/package/ripp-cli)
  - Binaries: Check [GitHub Releases](https://github.com/Dylan-Natter/ripp-protocol/releases)
- [ ] **Test installations:**

  ```bash
  # VS Code Extension
  # Search "RIPP Protocol" in VS Code Extensions

  # CLI
  npm install -g ripp-cli
  ripp --version

  # Homebrew (after formula update)
  brew tap Dylan-Natter/ripp
  brew install ripp
  ripp --version
  ```

- [ ] **Update Homebrew formula:** If CLI was released, update checksums in homebrew-ripp tap
- [ ] **Announce release:** Update README, social media, etc. if major release

---

## Troubleshooting

### Automated Publishing

**Problem:** Release PR was not created after merging to main

- **Solution:** Verify commits use conventional commit format (`feat:`, `fix:`, etc.)
- **Check:** Review release-please workflow logs in GitHub Actions
- **Tip:** Only `feat:` and `fix:` commits trigger version bumps

**Problem:** Release PR was merged but no packages were published

- **Solution:** Check that `ENABLE_AUTO_PUBLISH` variable is set to `true`
- **Check:** Review publish workflow logs in GitHub Actions
- **Verify:** Secrets `NPM_TOKEN` and `VSCE_PAT` are configured

**Problem:** Only one package published, not both

- **Solution:** This is expected - packages only publish when their versions change
- **Check:** Review Release PR to see which packages had version bumps
- **Note:** CLI and extension version independently based on which files changed

**Problem:** Binaries failed to attach to release

- **Solution:** Manually trigger "Build and Attach Binaries to Release" workflow
- **Input:** Provide the tag name (e.g., `ripp-cli-v1.1.0`)
- **Check:** Ensure macOS runner is available (GitHub Actions status)

### VS Code Extension

**Problem:** `VSCE_PAT secret is not configured`

- **Solution:** Add the `VSCE_PAT` secret to GitHub repository secrets (see [Prerequisites](#required-secrets))

**Problem:** Publish fails with "401 Unauthorized"

- **Solution:** The PAT may have expired or lacks permissions. Generate a new PAT with Marketplace: Manage scope.

**Problem:** Version already exists on Marketplace

- **Solution:** This shouldn't happen with release-please; check that the Release PR had the correct version bump
- **Recovery:** Manually bump version and create a new Release PR

**Problem:** VSIX package is malformed

- **Solution:** Run `npm run compile` locally in `tools/vscode-extension` and test the extension before triggering manual publish

### npm CLI

**Problem:** `NPM_TOKEN secret is not configured`

- **Solution:** Add the `NPM_TOKEN` secret to GitHub repository secrets (see [Prerequisites](#required-secrets))

**Problem:** "Version X.Y.Z is already published"

- **Solution:** This shouldn't happen with release-please; check that the Release PR had the correct version bump
- **Recovery:** Manually bump version and create a new Release PR

**Problem:** "Working tree is dirty"

- **Solution:** This shouldn't happen in automated flow; check for uncommitted changes in the repository

**Problem:** Tests or linter fail

- **Solution:** Fix the issues locally and re-run the workflow

---

## Security Best Practices

1. **Never commit secrets to source code**
   - Use GitHub Secrets for `VSCE_PAT` and `NPM_TOKEN`
   - Secrets are automatically redacted in logs

2. **Use minimal permissions**
   - VSCE_PAT: Only Marketplace: Manage scope
   - NPM_TOKEN: Use granular tokens with package-specific scope and "Bypass 2FA" enabled

3. **Rotate secrets regularly**
   - Regenerate PATs every 90 days
   - Revoke and regenerate if compromised

4. **Test before publishing (when using manual workflows)**
   - Always run dry-run/build-only mode first
   - Automated flow includes built-in testing

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
- [Conventional Commits](https://www.conventionalcommits.org/)
- [RIPP Versioning Strategy](VERSIONING.md)

---

## Questions?

If you encounter issues not covered in this guide:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the workflow logs for specific error messages
3. Open an issue in the repository with details
