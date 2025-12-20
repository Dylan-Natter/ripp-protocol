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

| Package                | Location                  | Current Version | Automation      |
| ---------------------- | ------------------------- | --------------- | --------------- |
| **VS Code Extension**  | `tools/vscode-extension/` | 0.4.0           | release-please  |
| **RIPP CLI**           | `tools/ripp-cli/`         | 1.0.0           | Manual          |
| **Protocol Spec**      | `SPEC.md`, `schema/`      | 1.0             | Manual          |

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

| Type       | Version Bump | Example                              |
| ---------- | ------------ | ------------------------------------ |
| `feat:`    | Minor        | `feat: add command palette support`  |
| `fix:`     | Patch        | `fix: resolve validation error`      |
| `feat!:`   | Major        | `feat!: change CLI interface`        |
| `docs:`    | None         | `docs: update README`                |
| `chore:`   | None         | `chore: update dependencies`         |
| `refactor:`| None         | `refactor: simplify parser logic`    |

**Note:** Use `BREAKING CHANGE:` in commit body for major version bumps.

---

## RIPP CLI Versioning

### Current Process: Manual

The RIPP CLI uses **manual versioning**:

1. Update `tools/ripp-cli/package.json` version
2. Update `tools/ripp-cli/README.md` if needed
3. Create git tag: `git tag ripp-cli-v1.0.1`
4. Push tag: `git push origin ripp-cli-v1.0.1`
5. Trigger `npm-publish.yml` workflow manually or via tag

### Publishing to npm

**Manual Publish:**

```bash
cd tools/ripp-cli
npm version [major|minor|patch]  # Updates package.json
npm publish                       # Publishes to npm
```

**Automated Publish:** Triggered by GitHub Actions workflow on tag push or manual dispatch.

### Future: Consider Automation

The CLI could be added to `release-please-config.json` for automated versioning:

```json
{
  "packages": {
    "tools/ripp-cli": {
      "release-type": "node",
      "package-name": "ripp-cli",
      "changelog-path": "CHANGELOG.md"
    }
  }
}
```

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

### VS Code Extension

1. Ensure commits use conventional commit format
2. Merge PR to `main`
3. Wait for `release-please` to create Release PR
4. Review and merge Release PR
5. Release and VSIX build happen automatically

### RIPP CLI

1. Update version in `package.json`
2. Update CHANGELOG (if applicable)
3. Create and push tag: `git tag ripp-cli-v1.0.1 && git push origin ripp-cli-v1.0.1`
4. Manually trigger `npm-publish` workflow or publish via npm

### Protocol Specification

1. Update `SPEC.md` and/or schemas
2. Update root `CHANGELOG.md`
3. Create GitHub release manually with notes
4. No package publishing (specification only)

---

## Version History

See individual CHANGELOGs:

- **VS Code Extension**: `/tools/vscode-extension/CHANGELOG.md`
- **RIPP CLI**: `/tools/ripp-cli/package.json` (version field)
- **Protocol**: `/CHANGELOG.md` (root)

---

## Related Documentation

- [Release Please Documentation](https://github.com/googleapis/release-please)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [VS Code Extension Marketplace Requirements](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

---

**Last Updated:** 2025-12-20  
**Maintained By:** RIPP Protocol Contributors
