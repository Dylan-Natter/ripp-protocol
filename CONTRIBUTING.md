# Contributing to RIPP

Thank you for your interest in contributing to the Regenerative Intent Prompting Protocol.

## Ways to Contribute

- **Specification improvements**: Propose clarifications or enhancements to SPEC.md
- **Schema refinements**: Suggest improvements to the JSON Schema
- **Examples**: Add real-world RIPP packet examples
- **Tooling**: Improve the validator CLI or create new tools
- **Documentation**: Fix typos, improve clarity, add guides
- **Bug reports**: Report issues with validation or documentation

## Documentation Structure

RIPP documentation lives in the main repository under `/docs/`:

- **`/docs/wiki/`** → Source of truth for GitHub Wiki (auto-published)
- **`/docs/architecture/`** → Architecture decisions and design docs
- **`/docs/*.md`** → GitHub Pages content (user guides)

### GitHub Pages vs GitHub Wiki

The repository uses two complementary documentation systems:

**GitHub Pages (`/docs/*.md`)** - User-facing guides:

- **Purpose:** Accessible learning and onboarding
- **Audience:** New users, decision-makers, learners
- **Style:** Tutorial-style, conceptual, approachable
- **Examples:** Getting started, use cases, philosophy, adoption stories

**GitHub Wiki (`/docs/wiki/`)** - Technical reference:

- **Purpose:** Authoritative technical documentation
- **Audience:** Developers, integrators, power users
- **Style:** Precise, comprehensive, reference-oriented
- **Examples:** CLI reference, schema docs, validation rules, advanced usage

**Guidelines:**

- **Avoid exact duplication** - Link from Pages to Wiki when content overlaps
- **Pages → Wiki for details** - Use Pages for overview, Wiki for specifics
- **Keep both updated** - Changes to spec/tooling should update both if relevant

**Important**: The GitHub Wiki is automatically synced from `/docs/wiki/`. Do not edit the Wiki directly—all changes must go through the main repository PR process.

## Before You Contribute

### Prerequisites

**Node.js Version:**

This repository requires **Node.js 20 LTS** or higher. We recommend using `nvm` (Node Version Manager) for managing Node versions:

```bash
# Install nvm if you don't have it: https://github.com/nvm-sh/nvm

# Use the project's Node version (reads .nvmrc)
nvm use

# Or install Node 20 explicitly
nvm install 20
nvm use 20
```

The repository includes a `.nvmrc` file that specifies Node 20, so `nvm use` will automatically switch to the correct version.

### Setup

### Setup

1. Read the [SPEC.md](SPEC.md) to understand RIPP's design principles
2. Check existing issues and pull requests to avoid duplication
3. For major changes, open an issue first to discuss your proposal

## Repository Structure (Monorepo)

This repository is organized as a **monorepo** with multiple packages:

```
ripp-protocol/
├── package.json           # Root package (dev tools: ESLint, Prettier)
├── tools/
│   ├── ripp-cli/          # Published npm package: ripp-cli
│   └── vscode-extension/  # VS Code extension (published to Marketplace)
├── schema/                # JSON Schema definitions
├── examples/              # Example RIPP packets
└── docs/                  # Documentation
```

**Important monorepo patterns:**

- **Root `package.json`**: Contains shared development tools (ESLint, Prettier) and workspace scripts. The `"ripp-cli": "file:tools/ripp-cli"` dependency enables local linking for testing.
- **Publishing**: The `ripp-cli` package is published from `tools/ripp-cli`, **not** from the repository root.
- **Local development**: Use `npm run setup` at the root to install dependencies and link packages locally.
- **Testing**: Scripts in root `package.json` (like `npm test`) delegate to the appropriate tool directories.

This structure allows us to:

- Maintain formatting/linting consistency across all packages
- Test CLI changes locally before publishing
- Keep published package metadata clean and minimal

## Governance

The RIPP™ repository enforces intentional, reviewed contributions through branch protection and required workflows.

**Branch Protection:**

- The `main` branch is protected
- All changes must be made via pull requests
- Direct pushes to `main` are not permitted
- Force pushes to `main` are not permitted

**Review Requirements:**

- Pull requests require review before merging
- CODEOWNERS approvals may be required for certain paths
- Automated validation may be required as tooling evolves

This governance ensures that RIPP maintains its commitment to explicit, reviewed intent at every level—from specification to contribution workflow.

## Contribution Process

### For Documentation or Minor Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b improve/docs-clarity`
3. Make your changes in the appropriate location:
   - Wiki content: `/docs/wiki/`
   - Architecture docs: `/docs/architecture/`
   - User guides: `/docs/`
4. Test locally if applicable
5. Submit a pull request with a clear description
6. After merge, wiki content is automatically published

**Note**: Changes to `/docs/wiki/` will auto-sync to the GitHub Wiki on merge to `main`.

### For Specification Changes

1. Open an issue using the "Spec Change" template
2. Provide rationale and use cases
3. Allow time for community discussion
4. If consensus is reached, submit a pull request
5. Spec changes require review from multiple maintainers

### For Code Contributions

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-validator`
3. Write clear, documented code
4. Add tests if applicable
5. Run linting: `npm run lint` (or `npm run lint:fix` to auto-fix)
6. Check code formatting: `npm run format:check`
7. Ensure all tests pass: `npm test`
8. **Update relevant documentation** (see "Documentation Requirements" below)
9. Submit a pull request

## Documentation Requirements

**All PRs that modify behavior must update documentation.**

Changes to these paths require corresponding documentation updates:

- `/spec/**` or `SPEC.md`
- `/schema/**`
- `/tools/ripp-cli/**` (CLI changes)
- `/tools/vscode-extension/**` (VSCode extension changes)
- `.github/workflows/**` (workflow behavior changes)

### What to Update

- **CLI changes**: Update `/docs/wiki/CLI-Reference.md`
- **Schema changes**: Update `/docs/wiki/Schema-Reference.md` and `SPEC.md`
- **Spec changes**: Update `/docs/wiki/RIPP-Specification.md` and examples
- **VSCode extension**: Update `/docs/wiki/VS-Code-Extension.md`
- **Workflow changes**: Update `/docs/wiki/GitHub-Integration.md`

### Enforcement

A GitHub Action checks PRs for high-impact changes and requires docs updates. If docs truly aren't needed:

1. Add the `docs-not-needed` label to your PR
2. Include a comment explaining why (e.g., "internal refactor, no user-facing impact")

The check will pass if:

- Documentation changes are detected in `/docs/`
- OR the `docs-not-needed` label is present

### How Documentation is Reviewed

The CODEOWNERS file requires:

- Spec/schema/CLI changes: review by spec/tool owners
- Documentation changes: review by docs owners

This ensures expertise and prevents drift.

## Code Quality

This repository uses ESLint for linting and Prettier for code formatting.

- **Linting**: `npm run lint` or `npm run lint:fix`
- **Formatting**: `npm run format:check` or `npm run format`
- **Tests**: `npm test`

Configuration files:

- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `.editorconfig` - Editor settings for consistent styling

## Pull Request Guidelines

- Use clear, descriptive titles
- Reference related issues: "Fixes #123" or "Addresses #456"
- Include motivation and context
- Keep changes focused and atomic
- Follow existing code style
- Update CHANGELOG.md for notable changes

## Commit Message Format

Use conventional commit format:

```
type(scope): brief description

Longer explanation if needed.

Closes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Branch Protection and Required Checks

The `main` branch is protected with the following requirements:

### Required Status Checks

These CI checks must pass before merging:

1. **Code Quality** (`lint-and-format`) — ESLint and Prettier checks
2. **RIPP Validation** (`validate`) — All RIPP packets must validate
3. **Documentation Enforcement** (`check-docs-impact`) — Docs must be updated for high-impact changes
4. **Drift Prevention** (`verify-cli-docs`) — CLI docs must match implementation (when CLI changes)

### Required Reviews

- At least one approval from a CODEOWNER
- CODEOWNERS enforce domain expertise:
  - Spec/schema changes require spec maintainer review
  - Documentation changes require docs owner review
  - CLI/tooling changes require tool owner review

### Override: docs-not-needed Label

If your PR modifies high-impact paths but doesn't require docs:

1. Add the `docs-not-needed` label
2. Explain why in the PR description (internal refactor, test-only, etc.)
3. The docs enforcement check will pass

This override is intentionally explicit to prevent accidental undocumented changes.

## Code Review Process

- All submissions require review
- Maintainers may request changes
- Once approved, maintainers will merge
- Be patient; maintainers are volunteers

## Spec Versioning

RIPP uses semantic versioning:

- **MAJOR**: Breaking changes to required sections or validation rules
- **MINOR**: New optional sections or backward-compatible features
- **PATCH**: Clarifications, typo fixes, non-normative updates

## Package Versioning and Release Process

The repository uses automated versioning for published packages (ripp-cli and VS Code extension) via [release-please](https://github.com/googleapis/release-please).

### How It Works

1. **Commits drive versioning**: Version bumps are determined by conventional commit messages
   - `feat:` → Minor version bump (0.1.0 → 0.2.0)
   - `fix:` → Patch version bump (0.1.0 → 0.1.1)
   - `feat!:` or `BREAKING CHANGE:` → Major version bump (0.1.0 → 1.0.0)

2. **Release-please creates PRs**: On every push to `main`, the release-please workflow:
   - Analyzes commits since the last release
   - Determines version bumps for each package
   - Creates or updates a "Release PR" with:
     - Updated version numbers in `package.json`
     - Updated `CHANGELOG.md` with grouped changes
     - Draft release notes

3. **Merging triggers releases**: When the Release PR is merged:
   - GitHub releases are created with tags
   - VS Code extension: Tag format `vX.Y.Z` → triggers VSIX build and marketplace publish
   - RIPP CLI: Tag format `ripp-cli-vX.Y.Z` → triggers NPM publish

### Package-Specific Tags

To support multiple packages in the monorepo:

- **VS Code Extension**: Uses simple tags like `v0.4.2`
- **RIPP CLI**: Uses component tags like `ripp-cli-v1.0.1`

This prevents tag collisions and allows independent versioning.

### Writing Commit Messages for Versioning

**Good commit messages** that trigger proper versioning:

```bash
# Minor version bump (new feature)
git commit -m "feat(cli): add --json output format"

# Patch version bump (bug fix)
git commit -m "fix(cli): handle malformed YAML gracefully"

# Major version bump (breaking change)
git commit -m "feat(cli)!: remove deprecated --legacy flag"

# Or with body
git commit -m "feat(cli): redesign validation API

BREAKING CHANGE: ValidationResult interface changed
"

# No version bump (internal change)
git commit -m "chore: update dev dependencies"
git commit -m "docs: fix typo in README"
```

**Scopes** help organize changelogs:

- `feat(cli):` → Groups under "CLI" in changelog
- `feat(vscode):` → Groups under "VS Code Extension"
- `feat(spec):` → Groups under "Specification"

### Manual Publishing (Emergency Override)

If automated publishing fails, you can publish manually:

**RIPP CLI:**

1. Go to Actions → "Publish NPM Package"
2. Click "Run workflow"
3. Test with `dry_run=true` first
4. Then run with `dry_run=false` to publish

**VS Code Extension:**

1. Go to Actions → "Publish to VS Code Marketplace"
2. Click "Run workflow"
3. Set `publish=false` to build only (artifact uploaded)
4. Set `publish=true` to actually publish

### Checking Current Versions

```bash
# RIPP CLI current version
cat tools/ripp-cli/package.json | grep version

# VS Code extension current version
cat tools/vscode-extension/package.json | grep version

# All tracked versions (release-please manifest)
cat .release-please-manifest.json
```

### Release Checklist

When merging a Release PR:

1. ✅ Review the changelog for accuracy
2. ✅ Verify version bumps are correct
3. ✅ Check that CI checks pass
4. ✅ Merge the Release PR
5. ✅ Verify GitHub releases are created
6. ✅ Monitor downstream publish workflows
7. ✅ Verify packages are available:
   - NPM: https://www.npmjs.com/package/ripp-cli
   - VS Code Marketplace: Search for "RIPP Protocol"

### Troubleshooting Releases

**Release PR not created?**

- Check that commits use conventional commit format
- Verify commits have landed on `main` branch
- Check release-please workflow run logs

**Publishing failed?**

- Ensure `ENABLE_AUTO_PUBLISH` repo variable is set to `true`
- Check that secrets are configured (NPM_TOKEN, VSCE_PAT)
- Review publish workflow logs for errors
- Use manual publishing workflow as fallback

**Version already exists error?**

- This means the version wasn't bumped in the Release PR
- Ensure at least one `feat:` or `fix:` commit was included
- Check that `.release-please-manifest.json` reflects latest published version

## Questions?

Open a discussion issue or comment on existing issues. We're here to help.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
