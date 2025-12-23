# RIPP Protocol Versioning Strategy

This document describes the versioning and release strategy for all RIPP Protocol deliverables.

---

## Semantic Versioning

All RIPP Protocol packages follow [Semantic Versioning 2.0.0](https://semver.org/):

- **Major (X.0.0)**: Breaking changes, incompatible API changes
- **Minor (0.X.0)**: New features, backwards compatible
- **Patch (0.0.X)**: Bug fixes, backwards compatible

## Independent Versioning

The RIPP Protocol repository contains multiple deliverables that version independently:

| Package               | Location                  | Current Version | Automation     | Tag Format        |
| --------------------- | ------------------------- | --------------- | -------------- | ----------------- |
| **VS Code Extension** | `tools/vscode-extension/` | 0.5.0           | release-please | `vX.Y.Z`          |
| **RIPP CLI**          | `tools/ripp-cli/`         | 1.1.0           | release-please | `ripp-cli-vX.Y.Z` |
| **Protocol Spec**     | `SPEC.md`, `schema/`      | 1.0             | Manual         | N/A               |

**Fully Automated:** Both the VS Code Extension and RIPP CLI use release-please for automatic versioning and publishing. Only the Protocol Spec requires manual versioning.

---

## VS Code Extension Versioning

### Microsoft Marketplace Requirements

The VS Code extension **MUST** follow strict Microsoft Marketplace version requirements:

#### ✅ Valid Version Format

- **Numeric only**: 1-4 dot-separated integers
- **Examples**: `0.1.0`, `1.0.0`, `1.2.3`, `2.1.0.4`
- **At least one segment must be non-zero**

#### ❌ Invalid Version Formats

Prerelease labels and build metadata are **NOT ALLOWED**:

- ❌ `0.1.0-ci` (prerelease label)
- ❌ `0.1.0-alpha` (prerelease label)
- ❌ `0.1.0-beta.1` (prerelease label)
- ❌ `0.1.0+build.123` (build metadata)

**Why?** The Microsoft Marketplace validates packages and **rejects** non-compliant versions.

### PR-Based Auto-Versioning with release-please

The VS Code extension uses **automated PR-based versioning** via [release-please](https://github.com/googleapis/release-please):

**Benefits:**

- ✅ Respects branch protection rules (no direct pushes to main)
- ✅ Version changes are reviewable before release
- ✅ Prevents version conflicts and race conditions
- ✅ Automatic CHANGELOG generation
- ✅ Clear audit trail

### Release Flow

1. **Commit with Conventional Commits**: Use [conventional commit](https://www.conventionalcommits.org/) messages:

   ```bash
   feat: add new validation rule     # Minor bump (0.2.0 → 0.3.0)
   fix: resolve syntax bug           # Patch bump (0.2.0 → 0.2.1)
   feat!: breaking API change        # Major bump (0.2.0 → 1.0.0)
   ```

2. **Release PR Created Automatically**: The `release-please` workflow:
   - Analyzes commits since last release
   - Determines next version based on conventional commits
   - Creates/updates a "Release PR" with:
     - Version bump in `package.json` and `package-lock.json`
     - Updated `CHANGELOG.md`
     - Git tag

3. **Review and Merge Release PR**: Verify:
   - Version number is correct
   - CHANGELOG accurately reflects changes
   - No unintended changes

4. **Release Published Automatically**: When Release PR is merged:
   - GitHub Release created with tag (e.g., `v0.3.0`)
   - Tag triggers VSIX build workflow
   - Workflow compiles, packages, and uploads VSIX
   - VSIX attached to GitHub Release
   - (Optional) Published to VS Code Marketplace

### Tag Formats

The extension supports both simple and component-prefixed tags:

- **Simple** (current): `v0.3.0`, `v1.0.0`
- **Prefixed** (alternative): `vscode-extension-v0.3.0`

**Current configuration:** Simple version tags (`v*`)

### Conventional Commit Types

| Type        | Version Bump | Example                             |
| ----------- | ------------ | ----------------------------------- |
| `feat:`     | Minor        | `feat: add command palette support` |
| `fix:`      | Patch        | `fix: resolve validation error`     |
| `feat!:`    | Major        | `feat!: change CLI interface`       |
| `docs:`     | None         | `docs: update README`               |
| `chore:`    | None         | `chore: update dependencies`        |
| `refactor:` | None         | `refactor: simplify parser logic`   |

**Note:** Use `BREAKING CHANGE:` in commit body for major version bumps.

---

## RIPP CLI Versioning

### Automated PR-Based Versioning

The RIPP CLI now uses **automated PR-based versioning** via [release-please](https://github.com/googleapis/release-please), matching the VS Code extension workflow.

**Benefits:**

- ✅ Respects branch protection rules (no direct pushes to main)
- ✅ Version changes are reviewable before release
- ✅ Prevents version conflicts and race conditions
- ✅ Automatic CHANGELOG generation
- ✅ Clear audit trail
- ✅ Automatic publishing to npm

### Release Flow

The CLI follows the same release flow as the VS Code extension:

1. **Commit with Conventional Commits**: Use [conventional commit](https://www.conventionalcommits.org/) messages:

   ```bash
   feat(cli): add new command     # Minor bump (1.1.0 → 1.2.0)
   fix(cli): resolve bug          # Patch bump (1.1.0 → 1.1.1)
   feat(cli)!: breaking change    # Major bump (1.1.0 → 2.0.0)
   ```

2. **Release PR Created Automatically**: The `release-please` workflow:
   - Analyzes commits since last release
   - Determines next version based on conventional commits
   - Creates/updates a "Release PR" with:
     - Version bump in `package.json`
     - Updated `CHANGELOG.md`
     - Git tag

3. **Review and Merge Release PR**: Verify:
   - Version number is correct
   - CHANGELOG accurately reflects changes
   - No unintended changes

4. **Release Published Automatically**: When Release PR is merged:
   - GitHub Release created with tag `ripp-cli-vX.Y.Z`
   - Tag triggers npm publish workflow
   - Package automatically published to npm
   - Binaries built and attached to GitHub Release

### Tag Format

The CLI uses **component-prefixed tags** to avoid conflicts with the VS Code extension:

- **CLI tags:** `ripp-cli-v1.1.0`, `ripp-cli-v1.2.0`
- **Extension tags:** `v0.5.0`, `v0.6.0`

This allows both packages to version independently within the same repository.

---

## Protocol Specification Versioning

### Stable at 1.0

The RIPP Protocol specification (`SPEC.md`, schemas) is at **version 1.0** and changes infrequently.

**Versioning Policy:**

- **Major changes** (breaking): New major version (e.g., 2.0)
- **Minor additions** (backwards compatible): Document in CHANGELOG
- **Clarifications**: Update SPEC.md, no version change

### Schema Versioning

JSON schemas are versioned independently:

- `ripp-1.0.schema.json` - Core RIPP packet schema
- `ripp-config.schema.json` - Configuration schema
- `evidence-pack.schema.json` - Evidence pack schema
- `intent-candidates.schema.json` - Intent candidates schema
- `intent-confirmed.schema.json` - Confirmed intent schema

**Breaking schema changes** require a new major version (e.g., `ripp-2.0.schema.json`).

---

## How to Trigger a Release

### VS Code Extension and RIPP CLI (Automated)

Both packages use the **same automated release flow**:

1. **Use conventional commits** when making changes
2. **Merge PR to `main`** with conventional commit messages
3. **Wait for release-please** to create/update Release PR automatically
4. **Review and merge Release PR** to trigger publishing
5. **Verify publication:**
   - VS Code Extension: [Marketplace](https://marketplace.visualstudio.com/items?itemName=RIPP.ripp-protocol)
   - RIPP CLI: [npm](https://www.npmjs.com/package/ripp-cli)

**Important:** The `ENABLE_AUTO_PUBLISH` repository variable must be set to `true` for automatic publishing to work.

### Manual Override (Emergency Only)

If automatic publishing fails, manual workflows are available:

- **VS Code Extension:** Actions → "Publish to VS Code Marketplace"
- **RIPP CLI:** Actions → "Publish NPM Package"

See [PUBLISHING.md](PUBLISHING.md) for detailed manual publishing instructions.

### Protocol Specification

1. Update `SPEC.md` and/or schemas
2. Update root `CHANGELOG.md`
3. Create GitHub release manually with notes
4. No package publishing (specification only)

---

## Version History

See individual CHANGELOGs:

- **VS Code Extension**: `/tools/vscode-extension/CHANGELOG.md` (auto-generated by release-please)
- **RIPP CLI**: `/tools/ripp-cli/CHANGELOG.md` (auto-generated by release-please)
- **Protocol**: `/CHANGELOG.md` (root, manually maintained)

---

## Related Documentation

- [Release Please Documentation](https://github.com/googleapis/release-please)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [VS Code Extension Marketplace Requirements](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

---

**Last Updated:** 2025-12-20  
**Maintained By:** RIPP Protocol Contributors
