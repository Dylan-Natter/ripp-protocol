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

### PR-Based Auto-Versioning with release-please

The VS Code extension uses **PR-based auto-versioning** powered by [release-please](https://github.com/googleapis/release-please). This is a production-grade approach that:

- ✅ Respects branch protection rules (no direct pushes to main)
- ✅ Makes version changes reviewable before release
- ✅ Prevents version conflicts and race conditions
- ✅ Creates immutable releases once published
- ✅ Maintains a clear audit trail

### Tag Formats

The build workflow supports both simple and component-prefixed tag formats:

#### Simple Version Tags (Current Default)

- Format: `v{VERSION}` (e.g., `v0.2.0`, `v1.0.0`)
- Created when: `"include-component-in-tag": false` in `release-please-config.json`
- Example tags: `v0.2.0`, `v0.2.1`, `v1.0.0`

#### Component-Prefixed Tags (Alternative)

- Format: `{component}-v{VERSION}` (e.g., `vscode-extension-v0.2.0`)
- Created when: `"include-component-in-tag": true` in `release-please-config.json`
- Example tags: `vscode-extension-v0.2.0`, `tools-vscode-extension-v0.2.0`

**Current Configuration:** Simple version tags (`v*`) are used by default.

### Complete Release Flow

**How It Works:**

1. **Commit with Conventional Commits**: When you merge PRs to `main`, use [conventional commit](https://www.conventionalcommits.org/) messages:
   - `feat:` → Minor version bump (0.2.0 → 0.3.0)
   - `fix:` → Patch version bump (0.2.0 → 0.2.1)
   - `BREAKING CHANGE:` → Major version bump (0.2.0 → 1.0.0)

2. **Release PR Created Automatically**: The `release-please` workflow runs on every push to `main` and:
   - Analyzes commits since the last release
   - Determines the next version based on conventional commits
   - Creates or updates a "Release PR" with:
     - Version bump in `package.json` and `package-lock.json`
     - Updated `CHANGELOG.md` with all changes
     - Git tag for the new version

3. **Review and Merge**: Review the Release PR to verify:
   - Version number is correct
   - CHANGELOG accurately reflects changes
   - No unintended changes are included

4. **Release Published Automatically**: When you merge the Release PR:
   - A GitHub Release is created with the tag (e.g., `v0.3.0`)
   - The tag triggers the VSIX build workflow automatically
   - The workflow:
     - Extracts the version from the tag (handling both `v0.3.0` and `vscode-extension-v0.3.0` formats)
     - Validates that package.json version matches the tag version
     - Compiles TypeScript, lints code, and packages the extension
     - Creates a Marketplace-compliant VSIX file
     - Uploads the VSIX as a build artifact
     - Attaches the VSIX to the GitHub Release as an asset

5. **Optional Marketplace Publish**: If enabled, the publish workflow automatically pushes the VSIX to the VS Code Marketplace

### Conventional Commit Examples

```bash
# Patch version (0.2.0 → 0.2.1)
git commit -m "fix: resolve syntax highlighting bug"

# Minor version (0.2.0 → 0.3.0)
git commit -m "feat: add RIPP workflow visualization"

# Major version (0.2.0 → 1.0.0)
git commit -m "feat!: redesign extension API

BREAKING CHANGE: Extension API has been completely redesigned"
```

### Manual Release (If Needed)

If you need to create a release manually (bypassing automatic versioning):

1. **Update version in package.json**:

   ```bash
   cd tools/vscode-extension
   npm version patch  # or minor, or major
   ```

2. **Update CHANGELOG.md** with your changes

3. **Create a PR** with these changes

4. **After merge**, manually create a GitHub Release with a tag (e.g., `v0.2.1`)

5. **The build workflow** will automatically trigger and create the VSIX

### Version Bump Rules

Release-please follows these rules for version bumps:

| Commit Type       | Version Bump | Example           |
| ----------------- | ------------ | ----------------- |
| `fix:`            | Patch        | 0.2.0 → 0.2.1     |
| `feat:`           | Minor        | 0.2.0 → 0.3.0     |
| `BREAKING CHANGE` | Major        | 0.2.0 → 1.0.0     |
| `docs:`           | None         | No version change |
| `chore:`          | None         | No version change |
| `refactor:`       | None         | No version change |

**Note**: Multiple commits can accumulate before a release. The highest-impact change determines the version bump (e.g., if there are both `fix:` and `feat:` commits, it will bump the minor version).

### Preventing Accidental Releases

If you're working on features that shouldn't trigger a release yet, use non-release commit types:

```bash
git commit -m "chore: update dependencies"
git commit -m "docs: improve README"
git commit -m "refactor: reorganize code structure"
```

These won't trigger a Release PR until you make a `feat:` or `fix:` commit.

### Workflow Files

The versioning system consists of three workflows:

1. **`.github/workflows/release-please.yml`**
   - Triggers on: Push to `main`
   - Creates/updates Release PR based on conventional commits
   - Creates GitHub Release and tag when Release PR is merged
   - Permissions: `contents: write`, `pull-requests: write`

2. **`.github/workflows/vscode-extension-build.yml`**
   - Triggers on: Tags matching `v*` or `**-v*`
   - Supported tag formats:
     - Simple tags: `v0.2.0`, `v1.0.0`
     - Component-prefixed tags: `vscode-extension-v0.2.0`, `tools-vscode-extension-v0.2.0`
   - Builds VSIX package with Marketplace-compliant version
   - Validates version matches between tag and package.json
   - Uploads VSIX to GitHub Release as an asset

3. **`.github/workflows/vscode-extension-publish.yml`** (Optional)
   - Triggers on: GitHub Release published
   - Publishes VSIX to VS Code Marketplace
   - Requires `VSCE_PAT` secret to be configured

### Configuration Files

- **`release-please-config.json`**: Configures release-please behavior
- **`.release-please-manifest.json`**: Tracks current version (managed by release-please)

## Troubleshooting

### Build Workflow Not Triggered After Release PR Merge

If the VSIX build workflow doesn't run after merging a Release PR:

1. **Check the tag was created**: Look at the GitHub Release page or run `git tag -l`
2. **Verify tag format**: The tag should match either:
   - Simple format: `v0.2.0`, `v1.0.0`
   - Component-prefixed: `vscode-extension-v0.2.0`, `tools-vscode-extension-v0.2.0`
3. **Check workflow triggers**: The build workflow triggers on tags matching `v*` or `**-v*`
4. **Review workflow runs**: Check the Actions tab to see if the workflow was triggered but failed

### Release PR Not Created

If a Release PR isn't created after pushing to `main`:

1. Check that your commits use conventional commit format
2. Verify the `release-please` workflow ran successfully
3. Check if a Release PR already exists (it will be updated, not recreated)

### Version Mismatch Error

If the build fails with a version mismatch error:

1. Ensure `package.json` version matches the git tag
2. The Release PR should have updated both - check if it was modified manually

### Manual Version Correction

If you need to fix a version manually:

1. Create a PR updating `package.json` and `.release-please-manifest.json`
2. Merge it to `main`
3. The next Release PR will use the corrected version as the baseline

### Changing Tag Format

To switch between simple and component-prefixed tag formats:

1. Edit `release-please-config.json` in the repository root
2. Set `"include-component-in-tag"` to `true` (for component-prefixed) or `false` (for simple)
3. Commit and push the change
4. Future releases will use the new tag format
5. **Note**: The build workflow supports both formats, so this change is safe

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [release-please Documentation](https://github.com/googleapis/release-please)
- [VS Code Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Semantic Versioning](https://semver.org/)
