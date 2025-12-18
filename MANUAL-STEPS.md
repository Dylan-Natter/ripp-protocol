# Manual Steps for VSIX Workflow Fix

## Summary

This PR removes the auto-versioning logic from the VSIX workflow. The workflow is now simplified to use **manual versioning only**, which aligns with the existing `VERSIONING.md` documentation and eliminates the conflict with branch protection rules.

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
