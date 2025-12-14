# RIPP Documentation

This directory contains all documentation for the RIPP Protocol, organized by purpose and audience.

## Documentation Philosophy

RIPP treats documentation as code:

- **Documentation is versioned** alongside source code
- **Documentation changes require PR review** just like code
- **Documentation must stay in sync** with spec, schema, and tooling
- **The repository is the source of truth**, not external systems
- **Automation enforces discipline**, not manual processes

This is not aspirational—it's enforced through CI checks, CODEOWNERS, and GitHub Actions.

## Directory Structure

```
/docs/
├── wiki/              # GitHub Wiki source of truth (auto-published)
├── architecture/      # Architecture decision records and design docs
├── *.md               # GitHub Pages documentation (user-facing guides)
└── README.md          # This file
```

### `/docs/wiki/` — GitHub Wiki Content

- **Purpose**: Comprehensive reference documentation
- **Source of Truth**: This directory (not the GitHub Wiki itself)
- **Publishing**: Automatically synced to GitHub Wiki on merge to `main`
- **Editing**: All changes must go through PR process

Direct edits to the GitHub Wiki are overwritten. Always edit files in this directory.

### `/docs/architecture/` — Architecture Documentation

- **Purpose**: Design decisions, architectural patterns, governance records
- **Audience**: Contributors, maintainers, architects
- **Format**: Markdown files, optionally using ADR (Architecture Decision Record) format

### `/docs/*.md` — GitHub Pages Documentation

- **Purpose**: User-facing guides, tutorials, marketing content
- **Publishing**: Served via GitHub Pages at https://dylan-natter.github.io/ripp-protocol
- **Audience**: End users, adopters, evaluators

## Authoritative Sources Hierarchy

When documentation conflicts with other sources, this is the order of authority:

1. **Schema** (`/schema/ripp-1.0.schema.json`) — Defines packet structure
2. **SPEC.md** (root) — Defines protocol behavior and requirements
3. **README.md** (root) — Project overview and quick start
4. **`/docs/`** — Supplementary documentation and guides

If wiki or guide content conflicts with schema or spec, the schema/spec is authoritative.

## Documentation Enforcement

This repository enforces documentation discipline through:

### 1. CODEOWNERS

- Changes to `/spec/**`, `/schema/**`, `/cli/**` require spec/tool owner review
- Changes to `/docs/**` require docs owner review
- Ensures expertise and oversight for critical paths

### 2. PR Requirements

- PRs that modify spec, schema, CLI, or VSCode extension **must** update docs
- Enforced via GitHub Action (can be overridden with `docs-not-needed` label + justification)
- PR template includes mandatory docs checklist

### 3. Automated Wiki Publishing

- On merge to `main`, `/docs/wiki/` is automatically synced to GitHub Wiki
- Deterministic, idempotent, no manual intervention required
- Clear commit messages for auditability

### 4. Drift Prevention

- CI checks verify generated docs are up to date
- CLI help output is validated against documented references
- Failures block merge

## Making Documentation Changes

### For Wiki Content

1. Edit files in `/docs/wiki/`
2. Submit PR with clear description of changes
3. After merge, wiki is auto-synced (no manual step needed)

### For Architecture Docs

1. Add or update files in `/docs/architecture/`
2. Follow ADR format if documenting a decision
3. Submit PR for review

### For GitHub Pages Content

1. Edit `.md` files in `/docs/`
2. Test locally if making significant changes
3. Submit PR for review
4. After merge, GitHub Pages rebuilds automatically

## Legitimate "No Docs Change" Cases

Sometimes a PR doesn't need documentation updates:

- Internal refactoring with no user-facing impact
- Test-only changes
- Build/CI configuration updates
- Fixing typos in non-user-facing files

**Process**: Add the `docs-not-needed` label and include a brief justification comment explaining why docs aren't required.

## Philosophy: Intent is Explicit, Drift is Unacceptable

RIPP exists to preserve intent from prototype to production. The documentation governance model reflects this:

- **Human intent controls the system** (you decide what to document)
- **Automation enforces discipline** (you can't accidentally ship undocumented changes)
- **No silent drift** (wiki always matches repo, generated docs always match code)
- **Transparency** (all changes visible in PR history)

This is RIPP's philosophy applied to its own development process.

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for general contribution guidelines.

For documentation-specific questions, see:
- `/docs/wiki/Contributing-to-RIPP.md` — How to contribute to RIPP
- This README — Documentation governance model

## Questions?

Open a discussion issue or comment on existing issues. We're here to help.

---

## Testing the Documentation Enforcement System

### End-to-End Test Scenarios

#### Scenario 1: High-Impact Change WITH Documentation Update

1. Create a branch: `git checkout -b test/cli-change-with-docs`
2. Modify `/tools/ripp-cli/index.js` (e.g., add a new command)
3. Update `/docs/wiki/CLI-Reference.md` to document the change
4. Open a PR
5. **Expected**: All checks pass ✅

#### Scenario 2: High-Impact Change WITHOUT Documentation (should fail)

1. Create a branch: `git checkout -b test/cli-change-no-docs`
2. Modify `/tools/ripp-cli/index.js`
3. Do NOT update documentation
4. Open a PR
5. **Expected**: `Documentation Enforcement` check fails ❌
6. Add `docs-not-needed` label with justification
7. **Expected**: Check now passes ✅

#### Scenario 3: Low-Impact Change (no docs required)

1. Create a branch: `git checkout -b test/low-impact`
2. Modify `/examples/basic.ripp.yaml`
3. Open a PR
4. **Expected**: Docs enforcement check passes (not required) ✅

#### Scenario 4: Wiki Auto-Publishing

1. Merge a PR that updates `/docs/wiki/Getting-Started.md`
2. Check GitHub Actions for "Publish Wiki" workflow
3. **Expected**: Wiki automatically updated ✅
4. Verify the GitHub Wiki reflects the changes

### Manual Verification Steps

#### Check CODEOWNERS Enforcement

```bash
# Verify CODEOWNERS file exists
cat .github/CODEOWNERS

# Test locally that CODEOWNERS paths are correct
# (GitHub will enforce this on PRs)
```

#### Test Drift Prevention

```bash
# Install CLI
cd tools/ripp-cli
npm ci
npm link

# Generate help output
ripp --help
ripp validate --help
ripp lint --help
ripp package --help

# Verify CLI-Reference.md documents these commands
grep "ripp validate" docs/wiki/CLI-Reference.md
grep "ripp lint" docs/wiki/CLI-Reference.md
grep "ripp package" docs/wiki/CLI-Reference.md
```

#### Test Wiki Sync Locally

```bash
# Run the sync script manually
cd docs/wiki
./deploy-wiki.sh

# Verify no errors
```

### Known Limitations

1. **Wiki Edit Protection**: GitHub doesn't allow disabling direct wiki edits. Contributors could still edit the wiki directly, but those changes will be overwritten on the next sync. We document this clearly and rely on contributor education.

2. **Label Timing**: The `docs-not-needed` label must be added before the workflow runs. If added after, re-run the check or push a new commit.

3. **Initial Wiki Setup**: The wiki repository must be manually enabled in GitHub Settings > Features > Wikis. After that, automation handles everything.

4. **CLI Help Drift Detection**: Currently checks for command presence in docs, not exact help text matching. Future enhancement could compare actual help output.

5. **Generated Docs**: If we add auto-generated documentation in the future, the drift prevention workflow can be extended to verify generated content matches source code.

### Future Enhancements

These are intentionally NOT implemented yet (keeping changes minimal):

- **Exact CLI help text matching**: Compare actual `--help` output to docs
- **Auto-generated CLI reference**: Generate CLI-Reference.md from code
- **Schema documentation sync**: Auto-update Schema-Reference.md from schema
- **Changelog enforcement**: Require CHANGELOG.md updates for notable changes
- **Documentation versioning**: Track docs versions alongside spec versions
