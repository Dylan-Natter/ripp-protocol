# VS Code Extension Versioning - Historical Implementation Notes

> **Note:** This document contains historical implementation details. For current versioning information, see **[VERSIONING.md]({{ '/VERSIONING' | relative_url }})**.

---

## Overview

This document describes the implementation of PR-based auto-versioning for the VS Code extension using release-please. This approach provides production-grade release automation while respecting branch protection rules.

**Current Documentation:** See [VERSIONING.md]({{ '/VERSIONING' | relative_url }}) for the complete versioning strategy.

---

## Historical Context: Problem Statement

The previous approach had two issues:

1. **Direct Push Auto-Versioning** (Original):
   - Workflow attempted to push version bumps directly to `main`
   - Conflicted with branch protection rules
   - Got stuck at v0.2.1 due to idempotency checks
   - Silent failures when pushes were rejected

2. **Manual Versioning** (Previous Fix):
   - Required manual version updates before each release
   - Easy to forget or make mistakes
   - No automated CHANGELOG generation
   - Time-consuming for frequent releases

## Solution Implemented: PR-Based Auto-Versioning

The approach uses [release-please](https://github.com/googleapis/release-please) to automate versioning through Pull Requests.

For complete details, see [VERSIONING.md]({{ '/VERSIONING' | relative_url }}).
│ Release PR │
│ - Version bump │
│ - CHANGELOG update │
│ - Ready for review │
└────────┬────────────┘
│
▼
┌─────────────────┐
│ Merge Release PR│
└────────┬────────┘
│
▼
┌─────────────────────┐
│ GitHub Release │
│ - Tag created │
│ - Release notes │
└────────┬────────────┘
│
▼
┌─────────────────┐
│ Build Workflow │
│ - Build VSIX │
│ - Upload asset │
└────────┬────────┘
│
▼
┌──────────────────────┐
│ (Optional) │
│ Publish to │
│ Marketplace │
└──────────────────────┘

````

### Key Components

#### 1. Conventional Commits

Developers use standardized commit messages to indicate the type of change:

- `fix:` → Patch version (0.2.0 → 0.2.1)
- `feat:` → Minor version (0.2.0 → 0.3.0)
- `BREAKING CHANGE:` → Major version (0.2.0 → 1.0.0)

#### 2. Release-Please Workflow

**File**: `.github/workflows/release-please.yml`

**Triggers**: Push to `main`

**Actions**:

- Analyzes commits since last release
- Determines next version using conventional commits
- Creates or updates a Release PR with:
  - Version bumps in `package.json` and `package-lock.json`
  - Updated `CHANGELOG.md`
  - Release notes
- When Release PR is merged:
  - Creates a GitHub Release
  - Creates a git tag (e.g., `v0.3.0`)

#### 3. Build Workflow

**File**: `.github/workflows/vscode-extension-build.yml`

**Triggers**: Tags matching `v*`

**Actions**:

- Checks out the tagged commit
- Verifies version in package.json matches tag
- Builds the VSIX package
- Uploads VSIX as workflow artifact
- Attaches VSIX to the GitHub Release

#### 4. Publish Workflow (Optional)

**File**: `.github/workflows/vscode-extension-publish.yml`

**Triggers**: GitHub Release published

**Actions**:

- Downloads or builds the VSIX
- Publishes to VS Code Marketplace using `vsce`
- Requires `VSCE_PAT` secret to be configured

### Configuration Files

#### `release-please-config.json`

Configures release-please behavior for the monorepo:

```json
{
  "packages": {
    "tools/vscode-extension": {
      "release-type": "node",
      "package-name": "ripp-protocol-vscode",
      "changelog-path": "CHANGELOG.md",
      "bump-minor-pre-major": true,
      "include-v-in-tag": true,
      "extra-files": [
        {
          "type": "json",
          "path": "package.json",
          "jsonpath": "$.version"
        },
        {
          "type": "json",
          "path": "package-lock.json",
          "jsonpath": "$.version"
        }
      ]
    }
  }
}
````

#### `.release-please-manifest.json`

Tracks current version (managed by release-please):

```json
{
  "tools/vscode-extension": "0.2.0"
}
```

## Benefits

### Respects Branch Protection ✅

- All version changes happen through PRs
- No direct pushes from CI workflows
- Standard approval process applies
- Compatible with required status checks

### Automated Yet Reviewable 🔍

- Automatic version determination
- Automatic CHANGELOG generation
- Human review before release
- Clear audit trail

### Prevents Common Issues 🛡️

- No version conflicts or race conditions
- No forgotten version bumps
- No manual CHANGELOG updates
- No possibility of pushing to protected branch

### Production-Ready 🚀

- Used by Google and many other organizations
- Mature, well-tested tooling
- Handles monorepos correctly
- Supports complex version strategies

## Implementation Details

### Changes Made

1. **Created Configuration Files**:
   - `release-please-config.json` - Main configuration
   - `.release-please-manifest.json` - Version tracking

2. **Created Release Workflow**:
   - `.github/workflows/release-please.yml` - Manages Release PRs

3. **Updated Build Workflow**:
   - Changed trigger from push events to tag events
   - Added version verification step
   - Added step to upload VSIX to GitHub Release

4. **Created Publish Workflow**:
   - `.github/workflows/vscode-extension-publish.yml` - Optional marketplace publishing

5. **Updated Documentation**:
   - `tools/vscode-extension/VERSIONING.md` - Complete versioning guide
   - `docs/vscode-extension-manual-steps.md` - Step-by-step instructions

### Safety Features

#### Prevent Infinite Loops

- Release PR commits use `chore(main):` which doesn't trigger new releases
- Build workflow triggers only on tags, not pushes
- Publish workflow is optional and manual

#### Version Verification

```bash
# In build workflow
if [ "$VERSION" != "$EXPECTED_VERSION" ]; then
  echo "❌ Error: Version mismatch!"
  exit 1
fi
```

#### Tag Immutability

- release-please never rewrites or reuses tags
- Each release gets a unique tag
- Once published, releases cannot be changed

## Migration Path

### Current State

- package.json version: `0.2.0`
- Existing tag: `v0.2.1`
- Previous workflow: Manual versioning

### Migration Steps

1. **Configuration is ready**: release-please config files created
2. **Next conventional commit** will trigger first Release PR
3. **Version will bump from 0.2.0** based on commit type
4. **Review and merge Release PR** to publish first automated release

### Syncing with Existing Tag

If you want to start from `0.2.1` instead of `0.2.0`:

```bash
# Update manifest to match existing tag
echo '{"tools/vscode-extension": "0.2.1"}' > .release-please-manifest.json
git add .release-please-manifest.json
git commit -m "chore: sync release-please with existing tag"
```

## Usage Examples

### Patch Release

```bash
# Make a bug fix
git commit -m "fix: resolve RIPP validation error"

# Push to main
git push origin main

# Wait for release-please to create PR
# Review and merge Release PR
# → Publishes v0.2.1
```

### Minor Release

```bash
# Add a new feature
git commit -m "feat: add workflow visualization panel"

# Push to main
git push origin main

# Wait for release-please to create PR
# Review and merge Release PR
# → Publishes v0.3.0
```

### Major Release

```bash
# Breaking change
git commit -m "feat!: redesign extension API

BREAKING CHANGE: Extension API has been completely redesigned.
See migration guide in CHANGELOG."

# Push to main
git push origin main

# Wait for release-please to create PR
# Review and merge Release PR
# → Publishes v1.0.0
```

### Accumulating Changes

```bash
# Make several commits
git commit -m "fix: improve error messages"
git commit -m "feat: add new command"
git commit -m "docs: update README"

# Push all at once
git push origin main

# release-please creates ONE Release PR
# It includes all commits and bumps to v0.3.0 (due to feat)
# Review and merge Release PR
# → Publishes v0.3.0 with all changes
```

## Troubleshooting

### Release PR Not Created

**Symptoms**: No Release PR after pushing to main

**Causes**:

1. No `feat:` or `fix:` commits (only `chore:`, `docs:`, etc.)
2. Release PR already exists (will be updated instead)
3. release-please workflow failed

**Solution**:

- Check GitHub Actions for release-please workflow status
- Look for existing Release PRs
- Make a `fix:` or `feat:` commit to trigger a release

### Build Failed on Tag

**Symptoms**: Build workflow fails after merging Release PR

**Causes**:

1. Version mismatch between tag and package.json
2. Build or compilation errors

**Solution**:

- Check that Release PR properly updated package.json
- Verify tag name matches version (e.g., `v0.3.0` → `0.3.0`)
- Check build logs for compilation errors

### Marketplace Publish Failed

**Symptoms**: Publish workflow fails

**Causes**:

1. `VSCE_PAT` secret not configured
2. Invalid or expired PAT
3. Marketplace publishing rights not granted

**Solution**:

- Verify `VSCE_PAT` secret exists and is valid
- Check PAT has "Marketplace (Publish)" scope
- Ensure publisher account is configured

## Comparison with Alternatives

### vs. Manual Versioning

| Aspect            | Manual        | PR-Based Auto  |
| ----------------- | ------------- | -------------- |
| Version bumps     | Manual        | Automatic      |
| CHANGELOG         | Manual        | Automatic      |
| Human review      | Before commit | Before release |
| Branch protection | ✅ Compatible | ✅ Compatible  |
| Effort            | High          | Low            |
| Error prone       | Yes           | No             |

### vs. Direct Push Auto-Versioning

| Aspect            | Direct Push Auto   | PR-Based Auto  |
| ----------------- | ------------------ | -------------- |
| Branch protection | ❌ Conflicts       | ✅ Compatible  |
| Review process    | None (automatic)   | Release PR     |
| Version conflicts | Possible           | Prevented      |
| Audit trail       | Limited            | Complete       |
| CI complexity     | High (auth needed) | Low (standard) |

## Security Considerations

### Permissions Required

The workflows use standard GitHub permissions:

```yaml
permissions:
  contents: write # Create releases and tags
  pull-requests: write # Create and update Release PRs
```

No special GitHub App or elevated credentials needed.

### No Direct Main Pushes

- Workflows never push directly to `main`
- All changes go through PRs
- Standard PR approval process applies
- Compatible with required status checks

### Immutable Releases

- Once a Release PR is merged, the release is immutable
- Tags cannot be moved or deleted
- VSIX files attached to releases are permanent
- Full audit trail in Git history

## Future Enhancements

Potential improvements for the future:

1. **Pre-release Support**: Add alpha/beta releases using release-please's prerelease features
2. **Automated Testing**: Add tests that run on Release PRs before merge
3. **Release Notes Templates**: Customize CHANGELOG format with templates
4. **Multi-package Releases**: Extend to other tools in the monorepo if needed
5. **Slack/Discord Notifications**: Notify team when Release PRs are created

## References

- [release-please Documentation](https://github.com/googleapis/release-please)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Semantic Versioning](https://semver.org/)
