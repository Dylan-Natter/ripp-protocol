# Manual Steps for VSIX Workflow - PR-Based Auto-Versioning

## Summary

This document describes the **PR-based auto-versioning** system for the VS Code extension. This production-grade approach uses [release-please](https://github.com/googleapis/release-please) to automate version management while respecting branch protection rules.

## Key Changes

### Previous Approach (Manual)

- ❌ Manual version updates required
- ❌ Easy to forget version bumps
- ❌ No automated CHANGELOG generation
- ❌ Manual tag creation

### New Approach (PR-Based Auto-Versioning)

- ✅ Automatic version bumps based on commits
- ✅ Respects branch protection (no direct pushes)
- ✅ Automated CHANGELOG generation
- ✅ Reviewable release PRs before publishing
- ✅ Immutable releases once published

## How It Works

### 1. Write Conventional Commits

When you commit changes, use the [conventional commits](https://www.conventionalcommits.org/) format:

```bash
# Bug fix → Patch version (0.2.0 → 0.2.1)
git commit -m "fix: resolve syntax highlighting bug"

# New feature → Minor version (0.2.0 → 0.3.0)
git commit -m "feat: add RIPP workflow visualization"

# Breaking change → Major version (0.2.0 → 1.0.0)
git commit -m "feat!: redesign extension API

BREAKING CHANGE: Extension API has been completely redesigned"
```

### 2. Release-Please Creates a Release PR

After you merge commits to `main`, the `release-please` workflow automatically:

1. Analyzes all commits since the last release
2. Determines the next version based on conventional commits
3. Creates or updates a **Release PR** with:
   - Version bump in `package.json` and `package-lock.json`
   - Updated `CHANGELOG.md` with all changes
   - A git tag for the new version

### 3. Review and Merge the Release PR

1. Go to the Pull Requests tab
2. Find the Release PR (titled like "chore(main): release 0.3.0")
3. Review the changes:
   - Verify version number is correct
   - Check CHANGELOG is accurate
   - Ensure all commits are included
4. Merge the Release PR

### 4. GitHub Release and VSIX Build

When the Release PR is merged:

1. release-please creates a GitHub Release with the tag (e.g., `v0.3.0`)
2. The build workflow is triggered by the new tag
3. VSIX package is built and attached to the GitHub Release
4. (Optional) The publish workflow pushes to VS Code Marketplace

## Commit Type Reference

| Commit Type       | Version Bump | Example           |
| ----------------- | ------------ | ----------------- |
| `fix:`            | Patch        | 0.2.0 → 0.2.1     |
| `feat:`           | Minor        | 0.2.0 → 0.3.0     |
| `BREAKING CHANGE` | Major        | 0.2.0 → 1.0.0     |
| `docs:`           | None         | No version change |
| `chore:`          | None         | No version change |
| `refactor:`       | None         | No version change |

## Manual Actions Required

### ✅ NO Branch Protection Changes Needed

The system is designed to work with branch protection enabled:

- All version changes happen through PRs
- No direct pushes to `main` from workflows
- Standard PR approval process applies to Release PRs

### ✅ NO GitHub App Modifications Needed

The workflows use the standard `GITHUB_TOKEN` with sufficient permissions:

- `contents: write` - To create releases and tags
- `pull-requests: write` - To create and update Release PRs

### ⚠️ Optional: Configure Marketplace Publishing

If you want automatic publishing to VS Code Marketplace:

1. **Create a Personal Access Token (PAT)**:
   - Go to: https://dev.azure.com/{your-org}/_usersSettings/tokens
   - Create a PAT with "Marketplace (Publish)" scope
   - Copy the token

2. **Add as Repository Secret**:
   - Go to: `Settings` → `Secrets and variables` → `Actions`
   - Add new secret: `VSCE_PAT` with your PAT value

3. **Enable Auto-Publish** (optional):
   - Go to: `Settings` → `Variables` → `Actions`
   - Add new variable: `ENABLE_AUTO_PUBLISH` = `true`
   - Or manually trigger the publish workflow after each release

## Workflow Files

### `.github/workflows/release-please.yml`

- **Triggers**: Push to `main`
- **Purpose**: Creates/updates Release PR, creates GitHub Release
- **No direct pushes**: Only creates PRs and releases

### `.github/workflows/vscode-extension-build.yml`

- **Triggers**: Tags matching `v*`
- **Purpose**: Builds VSIX and uploads to GitHub Release
- **No direct pushes**: Only builds and uploads artifacts

### `.github/workflows/vscode-extension-publish.yml`

- **Triggers**: GitHub Release published (optional)
- **Purpose**: Publishes to VS Code Marketplace
- **Requires**: `VSCE_PAT` secret configured

## Configuration Files

### `release-please-config.json`

Configures how release-please operates:

- Package path: `tools/vscode-extension`
- Release type: `node` (for Node.js/npm projects)
- Extra files: Updates both `package.json` and `package-lock.json`

### `.release-please-manifest.json`

Tracks the current version (managed automatically by release-please):

```json
{
  "tools/vscode-extension": "0.2.0"
}
```

## Troubleshooting

### Release PR Not Created

**Problem**: No Release PR appears after merging to `main`

**Solutions**:

1. Check that commits use conventional commit format
2. Verify the `release-please` workflow ran successfully
3. Non-release commits (`chore:`, `docs:`, etc.) won't trigger a release
4. A Release PR might already exist (will be updated, not recreated)

### Version Mismatch Error

**Problem**: Build fails with "Version mismatch" error

**Solution**:

1. Ensure `package.json` version matches the git tag
2. Don't manually edit versions in Release PRs
3. Let release-please manage version numbers

### Multiple Commits Before Release

**Problem**: Want to accumulate changes before releasing

**Solution**:

- Use non-release commit types (`chore:`, `docs:`, `refactor:`)
- When ready to release, make a `feat:` or `fix:` commit
- All accumulated commits will be included in the next Release PR

### Manual Version Correction

**Problem**: Need to fix an incorrect version

**Solution**:

1. Create a PR updating both `package.json` and `.release-please-manifest.json`
2. Merge to `main`
3. Next Release PR will use the corrected version

## Migration from Current State

The current package.json shows version `0.2.0`, and tag `v0.2.1` exists.

**To sync up**:

1. The `.release-please-manifest.json` is set to `0.2.0`
2. Next conventional commit will bump from `0.2.0`
3. If you want to start from `0.2.1`, update `.release-please-manifest.json` to `"0.2.1"`

## Benefits

### For Developers

- ✅ No manual version management
- ✅ Automated CHANGELOG generation
- ✅ Clear commit message standards
- ✅ Reviewable release process

### For CI/CD

- ✅ Respects branch protection
- ✅ Prevents version conflicts
- ✅ Immutable releases
- ✅ Clear audit trail

### For Users

- ✅ Consistent release notes
- ✅ Predictable version numbers
- ✅ Reliable release cadence

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [release-please Documentation](https://github.com/googleapis/release-please)
- [VS Code Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## Changes Made

### 1. Workflow Simplified (`.github/workflows/vscode-extension-build.yml`)

- ✅ Removed GitHub App token generation step
- ✅ Removed auto-increment version logic (lines 71-153)
- ✅ Removed `contents: write` permission (no longer needed)
- ✅ Simplified to always use version from `package.json`
- ✅ Removed git tag creation and push operations
- ✅ Removed CHANGELOG.md auto-update logic

### 2. Documentation Updated (`tools/vscode-extension/VERSIONING.md`)

- ✅ Clarified manual-only versioning approach
- ✅ Removed outdated references to auto-increment
- ✅ Added clear instructions for version releases
- ✅ Documented that `npm version` command creates both commit and tag

## Manual Actions Required

### ❌ NO Branch Protection Changes Needed

**Good news:** Since the workflow no longer attempts to push commits or tags back to the repository, **no changes to branch protection rules are required**. The workflow now operates in read-only mode on the repository.

### ✅ Optional: GitHub App Cleanup

The workflow previously used a GitHub App to bypass branch protection rules. This is **no longer necessary**.

**Optional cleanup actions:**

1. **Delete GitHub App Secrets** (if you want to clean up):
   - Go to: `Settings` → `Secrets and variables` → `Actions`
   - Delete `RIPP_APP_ID` (if it exists)
   - Delete `RIPP_APP_PRIVATE_KEY` (if it exists)
   - These secrets are no longer referenced in the workflow

2. **Uninstall GitHub App** (if it was only used for this workflow):
   - Go to: `Settings` → `GitHub Apps`
   - Find the "ripp-automation" app (or whatever it was named)
   - Click "Uninstall" if it's not being used elsewhere
   - This step is optional and safe to skip

**Note:** If you're unsure whether the GitHub App is used elsewhere, it's safe to leave it installed. The unused secrets won't cause any issues.

## How Versioning Works Now

### Current State

- **Current version in package.json:** `0.2.0`
- **Latest tag:** `v0.2.1` (exists but package.json is behind)
- **Workflow behavior:** Uses version from `package.json` (0.2.0)

### To Release Version 0.2.1

Since tag `v0.2.1` already exists, you'll need to either:

**Option A: Sync package.json to match the tag (Recommended)**

```bash
cd tools/vscode-extension
# Update version in package.json to 0.2.1
npm version 0.2.1 --no-git-tag-version
# Update package-lock.json to match
npm install --package-lock-only
git add package.json package-lock.json
git commit -m "chore: sync version to match existing tag v0.2.1"
git push origin main
```

**Option B: Skip to 0.2.2**

```bash
cd tools/vscode-extension
npm version 0.2.2  # This creates commit and tag
git push origin main --tags
```

### To Release Future Versions (0.2.2, 0.2.3, etc.)

1. **Update version:**

   ```bash
   cd tools/vscode-extension
   npm version patch  # For patch: 0.2.1 → 0.2.2
   # OR
   npm version minor  # For minor: 0.2.1 → 0.3.0
   # OR
   npm version major  # For major: 0.2.1 → 1.0.0
   ```

   This command automatically:
   - Updates `package.json` and `package-lock.json`
   - Creates a git commit
   - Creates a git tag (e.g., `v0.2.2`)

2. **Update CHANGELOG.md** (manual step):

   ```bash
   # Edit CHANGELOG.md to add release notes
   git add CHANGELOG.md
   git commit --amend --no-edit  # Add to the version bump commit
   ```

3. **Push changes with tags:**

   ```bash
   git push origin main --tags
   ```

4. **Workflow automatically builds VSIX:**
   - The workflow will trigger on push to main
   - It will build a VSIX with the version from `package.json`
   - Artifact will be uploaded with the new version number

5. **Optional: Publish to Marketplace:**
   ```bash
   cd tools/vscode-extension
   npx vsce publish
   ```

## Verification

After this PR is merged:

1. **Test the workflow:**
   - Go to Actions tab
   - Run "Build VS Code Extension" workflow manually
   - Verify it builds successfully with version from `package.json`

2. **Check artifact name:**
   - Should be: `vscode-extension-{version}-build-{timestamp}.{sha}`
   - Example: `vscode-extension-0.2.0-build-20251218210000.abc1234`

3. **Check VSIX package:**
   - Download the artifact
   - Extract and verify `package.json` has correct version
   - Filename should be: `ripp-protocol-{version}.vsix`

## Benefits of This Change

✅ **Simpler workflow:** No complex git operations, just build and package
✅ **Aligned with documentation:** Matches `VERSIONING.md` manual versioning approach
✅ **No branch protection conflicts:** Workflow doesn't push to repository
✅ **Predictable versions:** Version in `package.json` is always the source of truth
✅ **Easier troubleshooting:** No idempotency checks or silent failures
✅ **Cleaner git history:** Version bumps are explicit developer actions

## Rollback Plan (if needed)

If you need to revert to auto-versioning for any reason:

1. Restore the GitHub App secrets
2. Revert this PR
3. Re-add the `contents: write` permission
4. The old auto-versioning logic will be restored

However, this is **not recommended** as it will bring back the original issues with:

- Version stuck at 0.2.1 due to idempotency
- Conflicts with branch protection
- Documentation mismatch
