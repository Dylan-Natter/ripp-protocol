# RIPP Protocol Repository Cleanup & Modernization Plan

**Date:** 2025-12-20  
**Related:** [REPO_AUDIT_REPORT.md](./REPO_AUDIT_REPORT.md)  
**Status:** Ready for Execution

---

## Executive Summary

This plan addresses the 13 issues identified in the audit report (8 P1, 5 P2) through a series of incremental, low-risk changes. The goal is to achieve a world-class repository structure while preserving all valuable content and maintaining backwards compatibility.

**Key Principles:**

- ✅ Preserve all valuable content (move, don't delete)
- ✅ Incremental changes (small, reviewable commits)
- ✅ No breaking changes to published interfaces
- ✅ Clear documentation of what changed and why

---

## End-State Structure Proposal

### Target Repository Layout

```
ripp-protocol/
├── .github/
│   ├── workflows/              # 11 CI/CD workflows (no change)
│   ├── dependabot.yml          # NEW: Dependency updates
│   └── ...
├── docs/
│   ├── wiki/                   # Wiki source of truth (keep as-is)
│   ├── architecture/           # ADRs and design docs
│   │   ├── vscode-extension-implementation.md  # NEW: Consolidated
│   │   └── marketplace-compliance-fix.md       # MOVED from root
│   ├── category/               # RIPP positioning (keep as-is)
│   ├── archive/                # NEW: Archived implementation docs
│   ├── README.md               # ENHANCED: Docs index
│   ├── VERSIONING.md           # NEW: Consolidated versioning guide
│   └── *.md                    # User guides (keep as-is)
├── tools/
│   ├── ripp-cli/
│   │   ├── test/               # FUTURE: Add tests (not in this PR)
│   │   └── ...
│   └── vscode-extension/
│       ├── src/
│       ├── README.md           # Keep
│       ├── CHANGELOG.md        # Keep
│       ├── BUILD.md            # Keep
│       └── QUICK-START.md      # Keep
├── schema/                     # No change
├── examples/                   # No change
├── templates/                  # No change
├── .ripp/                      # No change
├── .nvmrc                      # NEW: Node version pinning
├── SPEC.md                     # No change
├── README.md                   # No change
├── CONTRIBUTING.md             # No change
├── package.json                # MODIFIED: Better scripts
└── ...
```

**Removed Directories:**

- ❌ `/wiki/` (duplicate of `/docs/wiki/`)
- ❌ `/ripp/` (unclear purpose, empty)

**Removed Files (VS Code Extension):**

- ❌ `ACCEPTANCE-TESTS.md` → archived
- ❌ `COMPLETION-SUMMARY.md` → archived
- ❌ `COPILOT-IMPLEMENTATION-SUMMARY.md` → archived
- ❌ `EXTENSION-DRIFT-REPORT.md` → archived
- ❌ `FINAL-SUMMARY.md` → archived
- ❌ `IMPLEMENTATION-COMPLETE.md` → archived
- ❌ `MANUAL-TESTING-CHECKLIST.md` → archived
- ❌ `MARKETPLACE-READY.md` → archived
- ❌ `VERIFICATION-SUMMARY.md` → archived
- ❌ `VERSIONING.md` → consolidated into root `/docs/VERSIONING.md`
- ❌ `RELEASE-CHECKLIST.md` → archived

---

## Step-by-Step Change List

### Phase 1: Documentation Consolidation (P1)

#### Step 1.1: Archive VS Code Extension Internal Docs

**Priority:** P1  
**Risk:** Low (files not referenced externally)

**Actions:**

1. Create `/docs/archive/vscode-extension-internal-docs/` directory
2. Move these files from `/tools/vscode-extension/` to archive:
   - `ACCEPTANCE-TESTS.md`
   - `COMPLETION-SUMMARY.md`
   - `COPILOT-IMPLEMENTATION-SUMMARY.md`
   - `EXTENSION-DRIFT-REPORT.md`
   - `FINAL-SUMMARY.md`
   - `IMPLEMENTATION-COMPLETE.md`
   - `MANUAL-TESTING-CHECKLIST.md`
   - `MARKETPLACE-READY.md`
   - `VERIFICATION-SUMMARY.md`
   - `RELEASE-CHECKLIST.md`
3. Add `README.md` to archive explaining what these files were

**Verification:**

- Extension builds successfully: `cd tools/vscode-extension && npm run compile && npm run package`
- `.vscodeignore` excludes unnecessary files

**Rollback:** Move files back from archive

---

#### Step 1.2: Consolidate Versioning Documentation

**Priority:** P1  
**Risk:** Low (documentation only)

**Actions:**

1. Create `/docs/VERSIONING.md` at root with consolidated content from:
   - `/tools/vscode-extension/VERSIONING.md`
   - `/docs/vscode-extension-pr-based-versioning.md`
2. Structure:
   - **Semantic Versioning Policy** (project-wide)
   - **Release Process** (release-please)
   - **CLI Versioning** (manual or automated)
   - **Extension Versioning** (automated via release-please)
   - **How to Trigger a Release**
3. Remove `/tools/vscode-extension/VERSIONING.md`
4. Update `/docs/vscode-extension-pr-based-versioning.md` to redirect to new doc

**Verification:**

- All links to old docs updated
- New doc is comprehensive and clear

**Rollback:** Restore deleted files

---

#### Step 1.3: Move MARKETPLACE-COMPLIANCE-FIX.md

**Priority:** P2  
**Risk:** Very low (documentation only)

**Actions:**

1. Move `/MARKETPLACE-COMPLIANCE-FIX.md` to `/docs/architecture/marketplace-compliance-fix.md`
2. Add note in README if referenced

**Verification:**

- File moved successfully
- No broken links

**Rollback:** Move file back

---

#### Step 1.4: Remove Duplicate /wiki/ Directory

**Priority:** P1  
**Risk:** Low (if `/docs/wiki/` is confirmed source of truth)

**Actions:**

1. **FIRST:** Verify `/docs/wiki/` and `/wiki/` are identical:

   ```bash
   diff -r docs/wiki/ wiki/ --exclude=README.md
   ```

2. **IF IDENTICAL:** Remove `/wiki/` directory entirely
3. **IF DIFFERENT:** Manually merge differences into `/docs/wiki/`
4. Update any references to `/wiki/` → `/docs/wiki/`
5. Update README if it mentions wiki location

**Verification:**

- `publish-wiki.yml` workflow still works (check source path)
- No broken links in documentation
- Wiki continues to publish correctly

**Rollback:** Restore `/wiki/` from git history if needed

---

#### Step 1.5: Clarify /ripp/ Directory Purpose

**Priority:** P1  
**Risk:** Low (only gitkeep files currently)

**Actions:**

1. Read `/ripp/README.md` to understand intended purpose
2. **Option A:** If for user examples, rename to `/examples/workspace-template/` or similar
3. **Option B:** If deprecated, remove it entirely
4. **Option C:** If needed for future use, enhance README.md to clearly explain purpose

**Decision:** Based on `/ripp/README.md` content (check this first)

**Verification:**

- No references to `/ripp/` in docs or code
- Purpose is clear or directory removed

**Rollback:** Restore directory if needed

---

### Phase 2: Developer Experience Improvements (P1/P2)

#### Step 2.1: Standardize Root Scripts

**Priority:** P1  
**Risk:** Low (additive changes, backwards compatible)

**Actions:**

1. Update `/package.json` scripts:

```json
{
  "scripts": {
    "test": "npm run test:validate-examples",
    "test:validate-examples": "cd tools/ripp-cli && npm ci && npm link && cd ../.. && ripp validate examples/",
    "lint": "eslint tools/ripp-cli/index.js",
    "lint:fix": "eslint --fix tools/ripp-cli/index.js",
    "format": "prettier --write \"**/*.{js,json,md,yaml,yml}\"",
    "format:check": "prettier --check \"**/*.{js,json,md,yaml,yml}\"",
    "setup": "npm install && cd tools/ripp-cli && npm install && npm link && cd ../..",
    "clean": "rm -rf tools/ripp-cli/node_modules tools/vscode-extension/node_modules tools/vscode-extension/out",
    "ripp:lint": "ripp lint examples/",
    "ripp:lint:strict": "ripp lint examples/ --strict",
    "ripp:package:example": "ripp package --in examples/item-creation.ripp.yaml --out /tmp/handoff.md"
  }
}
```

2. Update `README.md` to document new `setup` script
3. Update `CONTRIBUTING.md` to reference standardized scripts

**Verification:**

- `npm run setup` works from fresh clone
- `npm test` runs validation
- All existing scripts still work

**Rollback:** Revert `package.json` changes

---

#### Step 2.2: Add .nvmrc File

**Priority:** P2  
**Risk:** Very low (additive)

**Actions:**

1. Create `.nvmrc` with content: `18`
2. Optionally add `.tool-versions` for asdf users: `nodejs 18.20.0`

**Verification:**

- `nvm use` works (if nvm installed)
- `asdf install` works (if asdf installed)

**Rollback:** Remove file

---

### Phase 3: Configuration & Governance (P1/P2)

#### Step 3.1: Add Dependabot Configuration

**Priority:** P2  
**Risk:** Very low (additive, improves security)

**Actions:**

1. Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    labels:
      - 'dependencies'
      - 'automated'

  - package-ecosystem: 'npm'
    directory: '/tools/ripp-cli'
    schedule:
      interval: 'weekly'
    labels:
      - 'dependencies'
      - 'automated'

  - package-ecosystem: 'npm'
    directory: '/tools/vscode-extension'
    schedule:
      interval: 'weekly'
    labels:
      - 'dependencies'
      - 'automated'

  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
    labels:
      - 'dependencies'
      - 'automated'
```

**Verification:**

- File is valid YAML
- Dependabot starts creating PRs (may take a few days)

**Rollback:** Remove file

---

#### Step 3.2: Document CLI Release Process

**Priority:** P1  
**Risk:** Very low (documentation only)

**Actions:**

1. Check if CLI should be added to release-please config
2. **IF YES:** Add `tools/ripp-cli` to `release-please-config.json`
3. **IF NO:** Document manual release process in `/docs/PUBLISHING.md`:
   - How to version the CLI
   - How to publish to npm
   - How to build binaries
   - How to create GitHub releases

**Verification:**

- Process is clearly documented
- Maintainers can follow the process

**Rollback:** Revert config changes

---

### Phase 4: Documentation Organization (P1/P2)

#### Step 4.1: Enhance docs/README.md

**Priority:** P2  
**Risk:** Very low (documentation improvement)

**Actions:**

1. Update `/docs/README.md` with clear structure:

```markdown
# RIPP Protocol Documentation

## Documentation Structure

This repository has two complementary documentation systems:

- **GitHub Pages** (`/docs/*.md`) - User-friendly guides, tutorials, philosophy
- **GitHub Wiki** (`/docs/wiki/`) - Complete technical reference

### Quick Links

**Getting Started:**

- [Getting Started Guide](./getting-started.md)
- [Core Concepts](./wiki/Core-Concepts.md)
- [FAQ](./faq.md)

**Reference:**

- [RIPP Specification](./spec.md)
- [Schema Reference](./wiki/Schema-Reference.md)
- [CLI Reference](./wiki/CLI-Reference.md)
- [VS Code Extension](./wiki/VS-Code-Extension.md)

**Development:**

- [Contributing Guide](../CONTRIBUTING.md)
- [Architecture Decisions](./architecture/)
- [Versioning Strategy](./VERSIONING.md)
- [Publishing Guide](./PUBLISHING.md)

**Category & Positioning:**

- [Intent as Protocol](./category/INTENT-AS-PROTOCOL.md)
- [What RIPP Is and Is Not](./category/WHAT-RIPP-IS-AND-IS-NOT.md)

## Documentation Guidelines

See [CONTRIBUTING.md](../CONTRIBUTING.md) for how to contribute to documentation.
```

**Verification:**

- All links work
- Structure is clear and navigable

**Rollback:** Revert changes

---

#### Step 4.2: Clarify docs/ vs docs/wiki/ Distinction

**Priority:** P1  
**Risk:** Low (documentation clarity)

**Actions:**

1. Add section to `CONTRIBUTING.md`:

```markdown
## Documentation Structure

RIPP uses two complementary documentation systems:

### GitHub Pages (`/docs/*.md`)

- **Purpose:** User-facing guides, tutorials, onboarding
- **Audience:** New users, decision-makers, learners
- **Style:** Friendly, tutorial-style, conceptual
- **Examples:** Getting started, use cases, philosophy

### GitHub Wiki (`/docs/wiki/`)

- **Purpose:** Complete technical reference
- **Audience:** Developers, integrators, power users
- **Style:** Precise, comprehensive, authoritative
- **Examples:** CLI reference, schema docs, validation rules

### Guidelines

- **Avoid exact duplication** - Link from Pages to Wiki when content overlaps
- **Pages → Wiki for details** - Use Pages for overview, Wiki for specifics
- **Keep both updated** - Changes to spec/tooling should update both if relevant
```

2. Review `docs/getting-started.md` and `docs/wiki/Getting-Started.md` for exact duplicates
3. If duplicate, update Pages version to be shorter with links to Wiki for details

**Verification:**

- Distinction is clear
- No confusing overlaps
- Contributors understand where to add content

**Rollback:** Revert changes

---

## Commit Plan (Ordered)

### Commit Sequence

1. **chore: create audit directory and reports**
   - Add `docs/audit/REPO_AUDIT_REPORT.md`
   - Add `docs/audit/CLEANUP_PLAN.md`
   - Add `docs/audit/DOD_CHECKLIST.md`

2. **docs: archive vscode extension internal docs**
   - Create `docs/archive/vscode-extension-internal-docs/`
   - Move 10 files from extension to archive
   - Add archive README

3. **docs: consolidate versioning documentation**
   - Create `/docs/VERSIONING.md`
   - Remove `/tools/vscode-extension/VERSIONING.md`
   - Update references

4. **docs: move marketplace compliance fix to architecture**
   - Move `MARKETPLACE-COMPLIANCE-FIX.md` → `docs/architecture/`

5. **docs: remove duplicate /wiki/ directory**
   - Verify `/docs/wiki/` and `/wiki/` are identical
   - Remove `/wiki/`
   - Update any references

6. **chore: clarify /ripp/ directory purpose or remove**
   - Based on decision in Step 1.5

7. **chore: add .nvmrc for Node version management**
   - Add `.nvmrc` with `18`

8. **chore: add Dependabot configuration**
   - Add `.github/dependabot.yml`

9. **chore: standardize root package.json scripts**
   - Update scripts in `/package.json`
   - Update `README.md` with `setup` script
   - Update `CONTRIBUTING.md`

10. **docs: enhance documentation index and structure**
    - Update `/docs/README.md`
    - Clarify docs/ vs docs/wiki/ in `CONTRIBUTING.md`

11. **docs: document CLI release process**
    - Update `/docs/PUBLISHING.md` with CLI process
    - Or add CLI to release-please config

12. **chore: run prettier on all new docs**
    - Ensure all new/modified docs pass formatting
    - Run `npm run format`

---

## Compatibility Notes

### Non-Breaking Changes

All changes in this plan are **non-breaking**:

- ✅ No changes to published CLI or extension
- ✅ No changes to schema or spec
- ✅ No changes to public APIs
- ✅ Only documentation and repository structure changes
- ✅ Script changes are backwards compatible (old scripts still work)

### Potential Concerns

1. **Removing /wiki/**
   - **Risk:** CI workflow might reference it
   - **Mitigation:** Check `publish-wiki.yml` workflow source path
   - **Rollback:** Easy to restore from git

2. **Removing extension docs**
   - **Risk:** Might be referenced in issues or PRs
   - **Mitigation:** Archive instead of delete
   - **Rollback:** Move back from archive

3. **Script renaming**
   - **Risk:** CI or users might use old script names
   - **Mitigation:** Keep old scripts as aliases (deprecated)
   - **Rollback:** Revert package.json

---

## Rollback Plan

### Quick Rollback

All changes are in separate commits. To rollback:

```bash
git revert <commit-sha>
git push
```

### Selective Rollback

Individual commits can be reverted without affecting others due to the sequential, incremental nature of the changes.

### Full Rollback

```bash
git reset --soft HEAD~12  # Undo last 12 commits
git push --force-with-lease
```

**Note:** Force push is not recommended unless absolutely necessary. Prefer `git revert` for individual commits.

---

## Validation Checklist

After each commit, verify:

- [ ] `npm install` succeeds
- [ ] `npm run format:check` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] CI workflows pass (check GitHub Actions)
- [ ] Documentation links work
- [ ] VS Code extension builds: `cd tools/vscode-extension && npm run package`

---

## Success Criteria

This cleanup is successful when:

- ✅ All P1 issues resolved (or documented)
- ✅ All P2 issues resolved
- ✅ No broken links in documentation
- ✅ CI continues to pass
- ✅ Fresh clone and setup works smoothly
- ✅ Repository feels organized and navigable
- ✅ All valuable content preserved (moved, not deleted)
- ✅ Changes are documented in DOD checklist

---

## Future Work (Deferred)

These items are noted but **not included in this PR**:

1. **Add CLI tests** (P1) - Significant effort, needs separate PR
2. **Add npm audit to CI** - Minor improvement, can be separate PR
3. **Workflow consolidation** - Optional, current structure works well

---

## Conclusion

This plan transforms the RIPP Protocol repository into a world-class open-source project through careful, incremental changes. Every change:

- ✅ Preserves valuable content
- ✅ Improves clarity and navigation
- ✅ Enhances developer experience
- ✅ Maintains backwards compatibility
- ✅ Is fully reversible

The execution will proceed commit-by-commit with validation at each step.

---

**Plan Status:** ✅ Ready for Execution  
**Next Step:** Begin Phase 1, Step 1.1
