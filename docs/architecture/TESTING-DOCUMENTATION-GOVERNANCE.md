# Documentation Governance System — End-to-End Testing Guide

This guide provides step-by-step instructions to verify the documentation enforcement system works correctly.

## Prerequisites

- Access to the repository with appropriate permissions
- Ability to create branches and PRs
- GitHub CLI (`gh`) installed (optional, for easier testing)

## Test Scenarios

### Test 1: High-Impact Change WITH Documentation (Should Pass ✅)

**Purpose**: Verify that PRs with both code and docs changes pass enforcement.

```bash
# 1. Create test branch
git checkout main
git pull
git checkout -b test/cli-change-with-docs

# 2. Make a trivial change to CLI
echo "// Test comment" >> tools/ripp-cli/index.js

# 3. Update documentation
echo "" >> docs/wiki/CLI-Reference.md
echo "<!-- Test update -->" >> docs/wiki/CLI-Reference.md

# 4. Commit and push
git add tools/ripp-cli/index.js docs/wiki/CLI-Reference.md
git commit -m "test: CLI change with docs update"
git push -u origin test/cli-change-with-docs

# 5. Create PR (via GitHub UI or gh CLI)
gh pr create --title "Test: CLI change with docs" --body "Testing docs enforcement - should pass"

# 6. Check GitHub Actions
# Expected: "Documentation Enforcement" check passes ✅
```

**Expected Result**: PR shows all checks passing, including "Check Documentation Impact" ✅

---

### Test 2: High-Impact Change WITHOUT Documentation (Should Fail ❌)

**Purpose**: Verify that PRs with code changes but no docs updates fail enforcement.

```bash
# 1. Create test branch
git checkout main
git pull
git checkout -b test/schema-change-no-docs

# 2. Make a trivial change to schema
echo "" >> schema/ripp-1.0.schema.json

# 3. Commit and push (NO docs update)
git add schema/ripp-1.0.schema.json
git commit -m "test: schema change without docs"
git push -u origin test/schema-change-no-docs

# 4. Create PR
gh pr create --title "Test: Schema change no docs" --body "Testing docs enforcement - should fail"

# 5. Check GitHub Actions
# Expected: "Documentation Enforcement" check fails ❌
```

**Expected Result**: PR shows failed check with message:

```
❌ Documentation update required

This PR modifies high-impact paths:
  - SPEC.md or /schema/
  - /tools/ripp-cli/
  - /tools/vscode-extension/
  - /.github/workflows/

You must either:
  1. Update documentation in /docs/ (recommended)
  2. Add the 'docs-not-needed' label with justification
```

---

### Test 3: Override with `docs-not-needed` Label (Should Pass ✅)

**Purpose**: Verify that the label override mechanism works.

```bash
# Continue from Test 2's failed PR

# 1. Add the label (via GitHub UI or CLI)
gh pr edit test/schema-change-no-docs --add-label "docs-not-needed"

# 2. Add justification comment
gh pr comment test/schema-change-no-docs --body "This is a test commit with no user-facing impact. Docs not needed."

# 3. Re-run the check (push a new commit or re-trigger via UI)
git commit --allow-empty -m "trigger check re-run"
git push

# Expected: Check now passes ✅
```

**Expected Result**: PR shows passing check with message:

```
⚠️  High-impact changes detected, but docs-not-needed label is present
Please ensure you've provided justification in the PR description
```

---

### Test 4: Low-Impact Change (Should Pass ✅)

**Purpose**: Verify that changes to non-critical paths don't require docs.

```bash
# 1. Create test branch
git checkout main
git pull
git checkout -b test/low-impact-change

# 2. Modify an example file
echo "# Test comment" >> examples/item-creation.ripp.yaml

# 3. Commit and push
git add examples/item-creation.ripp.yaml
git commit -m "test: update example file"
git push -u origin test/low-impact-change

# 4. Create PR
gh pr create --title "Test: Low-impact change" --body "Testing docs enforcement - should pass without docs"

# Expected: Check passes without requiring docs ✅
```

**Expected Result**: PR shows passing check with message:

```
✅ No high-impact changes detected, docs check not required
```

---

### Test 5: Wiki Auto-Publishing (Manual Verification)

**Purpose**: Verify that merging docs changes triggers wiki sync.

```bash
# 1. Create test branch
git checkout main
git pull
git checkout -b test/wiki-auto-publish

# 2. Update a wiki page
echo "" >> docs/wiki/Getting-Started.md
echo "## Test Section" >> docs/wiki/Getting-Started.md
echo "This is a test addition to verify auto-publishing." >> docs/wiki/Getting-Started.md

# 3. Commit and push
git add docs/wiki/Getting-Started.md
git commit -m "docs: test wiki auto-publish"
git push -u origin test/wiki-auto-publish

# 4. Create and merge PR
gh pr create --title "Test: Wiki auto-publish" --body "Testing wiki sync automation"
gh pr merge --auto --squash

# 5. After merge, check GitHub Actions
# Go to Actions tab → "Publish Wiki" workflow
# Expected: Workflow runs and syncs to GitHub Wiki

# 6. Verify GitHub Wiki
# Navigate to repository Wiki tab
# Check that Getting-Started.md contains the test section
```

**Expected Result**:

- Workflow runs automatically after merge ✅
- Wiki repository is updated with commit message like:
  ```
  docs: sync wiki from main repository
  
  Auto-synced from /docs/wiki/ on commit <sha>
  ```
- GitHub Wiki shows updated content ✅

---

### Test 6: Drift Prevention — CLI Docs Consistency

**Purpose**: Verify that CLI changes trigger drift prevention checks.

```bash
# 1. Check current state
cd tools/ripp-cli
npm ci
npm link
ripp --help

# 2. Create test branch
git checkout main
git pull
git checkout -b test/cli-drift-check

# 3. Add a new CLI command or option
# (For testing, you can just modify the help text)
# Edit tools/ripp-cli/index.js to add a command

# 4. Commit and push
git add tools/ripp-cli/index.js
git commit -m "test: add new CLI feature"
git push -u origin test/cli-drift-check

# 5. Create PR
gh pr create --title "Test: CLI drift check" --body "Testing drift prevention"

# Expected: 
# - Docs enforcement fails (no docs update)
# - Drift prevention checks CLI-Reference.md for command presence
```

**Expected Result**:

- Docs enforcement check fails (no docs update) ❌
- Drift prevention verifies CLI-Reference.md documents main commands ✅

---

## Manual Verification Checklist

After running automated tests, manually verify:

- [ ] CODEOWNERS file is recognized by GitHub (check PR review requirements)
- [ ] PR template includes documentation checklist
- [ ] `docs-not-needed` label exists in repository labels
- [ ] Wiki is enabled in repository settings
- [ ] All three workflows appear in Actions tab
- [ ] Branch protection requires the new checks (if configured)

## Cleanup

After testing, clean up test branches and PRs:

```bash
# Delete test branches
git branch -D test/cli-change-with-docs
git branch -D test/schema-change-no-docs
git branch -D test/low-impact-change
git branch -D test/wiki-auto-publish
git branch -D test/cli-drift-check

# Delete remote branches (via UI or CLI)
git push origin --delete test/cli-change-with-docs
git push origin --delete test/schema-change-no-docs
git push origin --delete test/low-impact-change
git push origin --delete test/wiki-auto-publish
git push origin --delete test/cli-drift-check

# Close PRs if not already closed
gh pr close <PR-number>
```

## Troubleshooting

### Workflow doesn't run

- Check workflow file syntax: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/docs-enforcement.yml'))"`
- Verify workflow triggers match PR event type
- Check GitHub Actions permissions in repository settings

### Label override doesn't work

- Ensure label is named exactly `docs-not-needed`
- Re-trigger workflow by pushing a new commit
- Check workflow run logs for label detection

### Wiki sync fails

- Verify wiki is enabled in repository settings
- Check GitHub token permissions (must have `contents: write`)
- Verify wiki repository exists (visit Wiki tab once to initialize)

### Drift check is too strict/loose

- Review high-impact paths in docs-enforcement.yml
- Adjust paths as needed for your workflow
- Document any changes in CONTRIBUTING.md

## Success Criteria

All tests pass when:

- ✅ High-impact changes WITH docs → passes
- ❌ High-impact changes WITHOUT docs → fails
- ✅ High-impact changes with `docs-not-needed` label → passes
- ✅ Low-impact changes → passes (no docs required)
- ✅ Wiki auto-syncs after merge to main
- ✅ CLI docs verified for consistency

---

**Note**: This testing guide should be run by a maintainer before declaring the documentation governance system fully operational.
