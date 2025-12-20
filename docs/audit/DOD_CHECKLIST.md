# RIPP Protocol Repository Cleanup - Definition of Done Checklist

**Related:** [REPO_AUDIT_REPORT.md](./REPO_AUDIT_REPORT.md) | [CLEANUP_PLAN.md](./CLEANUP_PLAN.md)  
**Status:** In Progress

---

## Pre-Execution Checklist

- [x] Audit report completed
- [x] Cleanup plan created
- [x] DOD checklist created
- [ ] Maintainer approval (if required)

---

## Phase 1: Documentation Consolidation

### Step 1.1: Archive VS Code Extension Internal Docs

- [ ] Archive directory created: `docs/archive/vscode-extension-internal-docs/`
- [ ] Moved 10 internal docs from `/tools/vscode-extension/` to archive
- [ ] Archive README.md created explaining archived files
- [ ] VS Code extension builds successfully: `cd tools/vscode-extension && npm run compile && npm run package`
- [ ] `.vscodeignore` verified to exclude unnecessary files
- [ ] Commit created and pushed

### Step 1.2: Consolidate Versioning Documentation

- [ ] Created `/docs/VERSIONING.md` with consolidated content
- [ ] Removed `/tools/vscode-extension/VERSIONING.md`
- [ ] Updated `/docs/vscode-extension-pr-based-versioning.md` with redirect
- [ ] All links to old docs updated
- [ ] New doc reviewed for clarity and completeness
- [ ] Commit created and pushed

### Step 1.3: Move MARKETPLACE-COMPLIANCE-FIX.md

- [ ] Moved to `/docs/architecture/marketplace-compliance-fix.md`
- [ ] Updated any references (if applicable)
- [ ] Verified no broken links
- [ ] Commit created and pushed

### Step 1.4: Remove Duplicate /wiki/ Directory

- [ ] Verified `/docs/wiki/` and `/wiki/` are identical (or merged differences)
- [ ] Removed `/wiki/` directory
- [ ] Updated references from `/wiki/` → `/docs/wiki/`
- [ ] Verified `publish-wiki.yml` workflow still works
- [ ] Tested that wiki publishes correctly
- [ ] Commit created and pushed

### Step 1.5: Clarify /ripp/ Directory Purpose

- [ ] Read `/ripp/README.md` to understand purpose
- [ ] Decision made: [rename/remove/clarify]
- [ ] Action taken based on decision
- [ ] Updated documentation if needed
- [ ] Verified no references broken
- [ ] Commit created and pushed

---

## Phase 2: Developer Experience Improvements

### Step 2.1: Standardize Root Scripts

- [ ] Updated `/package.json` with standardized scripts
- [ ] Added `setup`, `clean`, and other DX improvements
- [ ] Updated `README.md` to document `setup` script
- [ ] Updated `CONTRIBUTING.md` with script references
- [ ] Verified `npm run setup` works from fresh clone
- [ ] Verified `npm test` runs validation
- [ ] All existing scripts still work
- [ ] Commit created and pushed

### Step 2.2: Add .nvmrc File

- [ ] Created `.nvmrc` with Node version `18`
- [ ] Tested `nvm use` (if nvm available)
- [ ] Optionally added `.tool-versions` for asdf users
- [ ] Commit created and pushed

---

## Phase 3: Configuration & Governance

### Step 3.1: Add Dependabot Configuration

- [ ] Created `.github/dependabot.yml`
- [ ] Configured for:
  - [ ] Root npm dependencies
  - [ ] CLI npm dependencies
  - [ ] Extension npm dependencies
  - [ ] GitHub Actions
- [ ] Verified YAML is valid
- [ ] Commit created and pushed
- [ ] Confirmed Dependabot starts creating PRs (may take time)

### Step 3.2: Document CLI Release Process

- [ ] Decision made: [add to release-please / document manual process]
- [ ] If automated: Added CLI to `release-please-config.json`
- [ ] If manual: Documented process in `/docs/PUBLISHING.md`
- [ ] Release process clearly documented
- [ ] Process tested or verified by maintainer
- [ ] Commit created and pushed

---

## Phase 4: Documentation Organization

### Step 4.1: Enhance docs/README.md

- [ ] Updated `/docs/README.md` with clear structure
- [ ] Added sections:
  - [ ] Documentation Structure explanation
  - [ ] Quick Links (Getting Started, Reference, Development)
  - [ ] Documentation Guidelines
- [ ] All links verified to work
- [ ] Navigation is clear and intuitive
- [ ] Commit created and pushed

### Step 4.2: Clarify docs/ vs docs/wiki/ Distinction

- [ ] Added documentation structure section to `CONTRIBUTING.md`
- [ ] Explained GitHub Pages vs GitHub Wiki purposes
- [ ] Provided guidelines for where to add content
- [ ] Reviewed for exact duplicates between docs/ and docs/wiki/
- [ ] Updated any problematic duplicates (consolidated or linked)
- [ ] Distinction is clear to contributors
- [ ] Commit created and pushed

---

## Final Validation

### Repository Health

- [ ] Fresh clone succeeds: `git clone <repo>`
- [ ] Install succeeds: `npm install`
- [ ] Setup succeeds: `npm run setup`
- [ ] Lint passes: `npm run lint`
- [ ] Format check passes: `npm run format:check`
- [ ] Tests pass: `npm test`

### Deliverables Build

- [ ] CLI builds: `cd tools/ripp-cli && npm install && npm link`
- [ ] CLI validates examples: `ripp validate examples/`
- [ ] Extension compiles: `cd tools/vscode-extension && npm run compile`
- [ ] Extension packages: `cd tools/vscode-extension && npm run package`
- [ ] VSIX file created successfully

### CI/CD Workflows

- [ ] `code-quality.yml` passes
- [ ] `ripp-validate.yml` passes
- [ ] `docs-enforcement.yml` passes (if applicable)
- [ ] `drift-prevention.yml` passes
- [ ] `vscode-extension-build.yml` passes
- [ ] No workflow failures on latest commit

### Documentation Quality

- [ ] No broken links in `/docs/`
- [ ] No broken links in `/docs/wiki/`
- [ ] README.md links work
- [ ] CONTRIBUTING.md links work
- [ ] All new docs formatted properly: `npx prettier --check docs/`

### Structure Verification

- [ ] `/wiki/` directory removed (if planned)
- [ ] `/ripp/` directory clarified or removed
- [ ] Extension internal docs archived
- [ ] Root directory is clean and organized
- [ ] All valuable content preserved (nothing lost)

---

## Issues Resolution Status

### P1 (Important) Issues - 8 Total

- [ ] **A1:** Duplicate wiki directories - RESOLVED
- [ ] **A2:** "ripp" directory unclear - RESOLVED
- [ ] **A3:** Extension internal docs - RESOLVED
- [ ] **B1:** Documentation sprawl - RESOLVED
- [ ] **B2:** docs/ vs docs/wiki/ unclear - RESOLVED
- [ ] **C1:** Inconsistent script naming - RESOLVED
- [ ] **C3:** CLI has no tests - DEFERRED (future work)
- [ ] **D1:** Release-please only tracks extension - RESOLVED

### P2 (Polish) Issues - 5 Total

- [ ] **A4:** MARKETPLACE-COMPLIANCE-FIX.md at root - RESOLVED
- [ ] **A5:** No .nvmrc file - RESOLVED
- [ ] **B3:** Missing centralized docs index - RESOLVED
- [ ] **C2:** No root-level quick start - RESOLVED
- [ ] **E2:** Dependabot not configured - RESOLVED

---

## Audit Deliverables

- [x] `docs/audit/REPO_AUDIT_REPORT.md` created
- [x] `docs/audit/CLEANUP_PLAN.md` created
- [x] `docs/audit/DOD_CHECKLIST.md` created
- [ ] All documents reviewed and approved
- [ ] All documents pass prettier formatting

---

## Post-Merge Verification

### Immediate (Within 1 Hour)

- [ ] GitHub Actions all green
- [ ] No new issues opened related to cleanup
- [ ] Wiki still publishes correctly (check GitHub Wiki tab)

### Short-Term (Within 1 Week)

- [ ] Dependabot creates first PR
- [ ] No contributor confusion reported
- [ ] Documentation is being used successfully

### Medium-Term (Within 1 Month)

- [ ] New contributors can clone and setup without issues
- [ ] Documentation PRs follow new structure
- [ ] No rollback needed

---

## Rollback Criteria

Rollback if:

- [ ] Critical CI/CD workflows break
- [ ] Extension fails to build/package
- [ ] Wiki publishing breaks
- [ ] Major documentation loss discovered
- [ ] Maintainer requests rollback

Rollback procedure:

1. Identify problematic commit
2. `git revert <commit-sha>`
3. Push revert commit
4. Document what went wrong
5. Fix issue and re-apply

---

## Success Metrics

After completion, the repository should achieve:

- ✅ **Clarity:** New contributors understand structure immediately
- ✅ **Organization:** Easy to find documentation and code
- ✅ **Maintainability:** Reduced documentation burden
- ✅ **Quality:** All CI checks pass, no broken links
- ✅ **Professionalism:** Feels like a world-class OSS project
- ✅ **Completeness:** No valuable content lost

---

## Sign-Off

### Completed By

- **Executor:** GitHub Copilot Agent
- **Date:** 2025-12-20
- **PR:** #[number]

### Reviewed By

- **Maintainer:** [Name]
- **Date:** [Date]
- **Approval:** [ ] Approved / [ ] Needs Changes

### Post-Merge Verification By

- **Verifier:** [Name]
- **Date:** [Date]
- **Status:** [ ] All checks passed / [ ] Issues found

---

## Notes

Any additional notes, discoveries, or deviations from the plan:

- [Add notes here as cleanup progresses]

---

**Checklist Status:** ✅ Ready for Execution  
**Last Updated:** 2025-12-20  
**Next Action:** Begin Phase 1 execution
