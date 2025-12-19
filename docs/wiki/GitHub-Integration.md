# GitHub Integration

This page explains how to integrate RIPP validation into your GitHub workflows.

## GitHub-First Philosophy

RIPP is designed to be **GitHub-first**:

- ✅ RIPP packets are stored in git repositories
- ✅ They are reviewed in pull requests
- ✅ They are validated automatically in CI/CD
- ✅ They version alongside code
- ❌ No external tools required (Jira, Confluence, etc.)

**Key principle:** The repository is the single source of truth for both intent (RIPP) and implementation (code).

---

## Pull Request Validation Flow

### Recommended Workflow

```
1. Developer creates/updates RIPP packet
   ↓
2. Developer opens pull request
   ↓
3. GitHub Action runs `ripp validate`
   ↓
4. ✅ Validation passes → PR ready for review
   ✗ Validation fails → Developer fixes and pushes
   ↓
5. Team reviews RIPP packet
   ↓
6. PR approved and merged
   ↓
7. Implementation begins (or continues)
```

### Why Validate in PRs?

- ✅ **Catch errors early** — Before implementation begins
- ✅ **Enforce standards** — All RIPP packets must be valid
- ✅ **Review gate** — Team sees validation status before approval
- ✅ **Prevent drift** — Specs stay synchronized with code

---

## Recommended GitHub Action

When you run `ripp init`, it creates `.github/workflows/ripp-validate.yml`:

```yaml
name: Validate RIPP Packets

on:
  pull_request:
    paths:
      - '**.ripp.yaml'
      - '**.ripp.json'
  push:
    branches:
      - main
    paths:
      - '**.ripp.yaml'
      - '**.ripp.json'
  workflow_dispatch:

jobs:
  validate:
    name: Validate RIPP Packets
    runs-on: ubuntu-latest

    permissions:
      contents: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: tools/ripp-cli/package-lock.json

      - name: Install RIPP CLI
        run: |
          cd tools/ripp-cli
          npm ci
          npm link

      - name: Validate all RIPP packets
        run: |
          echo "Validating RIPP packets..."
          ripp validate examples/
          ripp validate templates/ || true

      - name: Summary
        if: always()
        run: |
          echo "✅ RIPP validation complete"
          echo "See job logs for details"
```

---

## Trigger Rules

### `pull_request` (Recommended)

Runs when:

- ✅ PR is opened
- ✅ PR is updated (new commits pushed)
- ✅ Files matching `**.ripp.yaml` or `**.ripp.json` are changed

**Why this matters:** Validation happens before merge, catching errors early.

### `push` to `main`

Runs when:

- ✅ Code is merged to `main` branch
- ✅ Files matching `**.ripp.yaml` or `**.ripp.json` are changed

**Why this matters:** Ensures `main` branch always has valid RIPP packets.

### `workflow_dispatch` (Optional)

Allows manual triggering:

- ✅ Via GitHub Actions UI
- ✅ Via GitHub CLI (`gh workflow run`)

**Why this matters:** Useful for testing workflow changes or re-validating after tool updates.

---

## Example Workflow YAML

### Basic Validation

```yaml
name: Validate RIPP Packets

on:
  pull_request:
    paths:
      - '**.ripp.yaml'
      - '**.ripp.json'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install RIPP CLI
        run: npm install -g ripp-cli

      - name: Validate RIPP Packets
        run: ripp validate .
```

---

### Validation + Linting (Strict)

```yaml
name: Validate and Lint RIPP Packets

on:
  pull_request:
    paths:
      - '**.ripp.yaml'
      - '**.ripp.json'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install RIPP CLI
        run: npm install -g ripp-cli

      - name: Validate RIPP Packets
        run: ripp validate .

      - name: Lint RIPP Packets (strict mode)
        run: ripp lint . --strict
```

**Use when:** You want to enforce best practices in addition to schema validation.

---

### Enforce Minimum Level

```yaml
name: Validate RIPP Packets (Level 2+ for Production)

on:
  pull_request:
    paths:
      - 'ripp/intent/**.ripp.yaml'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install RIPP CLI
        run: npm install -g ripp-cli

      - name: Validate Production Features (Level 2+)
        run: ripp validate ripp/intent/ --min-level 2
```

**Use when:** Production features must be Level 2 or higher.

---

### With Local Dev Dependency

```yaml
name: Validate RIPP Packets

on:
  pull_request:
    paths:
      - '**.ripp.yaml'
      - '**.ripp.json'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Validate RIPP Packets
        run: npx ripp validate .
```

**Use when:** You have `ripp-cli` in `devDependencies` of your `package.json`.

---

### Upload Lint Reports as Artifacts

```yaml
name: Validate and Lint RIPP Packets

on:
  pull_request:
    paths:
      - '**.ripp.yaml'
      - '**.ripp.json'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install RIPP CLI
        run: npm install -g ripp-cli

      - name: Validate RIPP Packets
        run: ripp validate .

      - name: Lint RIPP Packets
        run: ripp lint . --output ./lint-reports/

      - name: Upload Lint Reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: ripp-lint-reports
          path: lint-reports/
```

**Use when:** You want to preserve lint reports for later review.

---

## Local vs CI Parity

RIPP validation behaves **identically** in local and CI environments:

| Aspect                | Local (`ripp validate`) | CI (`ripp validate`) |
| --------------------- | ----------------------- | -------------------- |
| **Validation logic**  | Same                    | Same                 |
| **Schema used**       | Same                    | Same                 |
| **Exit codes**        | Same                    | Same                 |
| **Error messages**    | Same                    | Same                 |
| **File modification** | Never                   | Never                |

**Why this matters:** You can test locally before pushing and get the same results.

### Testing Locally Before Pushing

```bash
# Validate locally (exact same check as CI)
ripp validate .

# If valid locally, it will be valid in CI
git add .
git commit -m "Add feature RIPP packet"
git push
```

---

## Monorepo Support

### Validating All Packages

```yaml
- name: Validate all RIPP packets in monorepo
  run: ripp validate .
```

RIPP CLI automatically finds all `*.ripp.yaml` and `*.ripp.json` files in the repository.

### Validating Specific Packages

```yaml
- name: Validate auth package only
  run: ripp validate packages/auth/ripp/

- name: Validate billing package only
  run: ripp validate packages/billing/ripp/
```

### Conditional Validation by Path

```yaml
name: Validate RIPP Packets

on:
  pull_request:
    paths:
      - 'packages/auth/**.ripp.yaml'
      - 'packages/billing/**.ripp.yaml'

jobs:
  validate-auth:
    if: contains(github.event.pull_request.changed_files, 'packages/auth/')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g ripp-cli
      - run: ripp validate packages/auth/ --min-level 3

  validate-billing:
    if: contains(github.event.pull_request.changed_files, 'packages/billing/')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g ripp-cli
      - run: ripp validate packages/billing/ --min-level 3
```

**Use when:** Different packages have different validation requirements.

---

## Status Checks and Branch Protection

### Enable Required Status Checks

1. Go to **Settings** → **Branches** → **Branch protection rules**
2. Add rule for `main` branch
3. Check **Require status checks to pass before merging**
4. Select **Validate RIPP Packets** workflow
5. Save

**Result:** PRs cannot be merged if RIPP validation fails.

---

## Handling Validation Failures in PRs

### When Validation Fails

GitHub Action output:

```
✗ user-registration.ripp.yaml
  • /purpose: must have required property 'problem'
  • /status: must be equal to one of the allowed values

✗ 1 of 3 RIPP packets failed validation.

Error: Process completed with exit code 1.
```

### Developer Workflow

1. **Read the error** — Identify the issue
2. **Fix the RIPP packet locally**
3. **Validate locally** — `ripp validate user-registration.ripp.yaml`
4. **Push fix** — GitHub Action re-runs automatically
5. **Validation passes** — PR ready for review

---

## Advanced: Matrix Strategy for Multiple RIPP Versions

If your repository supports multiple RIPP versions:

```yaml
name: Validate RIPP Packets

on:
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        ripp-version: ['1.0', '2.0']
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install RIPP CLI (version ${{ matrix.ripp-version }})
        run: npm install -g ripp-cli@${{ matrix.ripp-version }}

      - name: Validate RIPP Packets
        run: ripp validate .
```

**Use when:** You're migrating between RIPP spec versions.

---

## Troubleshooting

### Action Fails with "command not found: ripp"

**Cause:** RIPP CLI not installed or not in PATH.

**Fix:** Ensure installation step completes successfully:

```yaml
- name: Install RIPP CLI
  run: npm install -g ripp-cli
```

Or use `npx`:

```yaml
- name: Validate RIPP Packets
  run: npx ripp validate .
```

---

### Action Fails with "No such file or directory"

**Cause:** RIPP packet files not checked out.

**Fix:** Add checkout step:

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
```

---

### Action Succeeds Locally but Fails in CI

**Cause 1:** Different Node.js versions.

**Fix:** Specify Node.js version in workflow:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
```

**Cause 2:** Files not committed to git.

**Fix:** Ensure RIPP packets are committed:

```bash
git status
git add ripp/
git commit -m "Add RIPP packets"
git push
```

---

## Summary

| Feature               | Recommendation                           |
| --------------------- | ---------------------------------------- |
| **Trigger**           | `pull_request` + `push` to `main`        |
| **Validation**        | Always run `ripp validate .`             |
| **Linting**           | Optional, use `--strict` for enforcement |
| **Branch Protection** | Enable required status checks            |
| **Local Testing**     | Always validate locally before pushing   |

**Philosophy:** Validation in CI prevents bad specs from reaching `main`. Local validation prevents wasted CI cycles.

---

## Next Steps

- See [CLI Reference](CLI-Reference) for validation commands
- Read [Validation Rules](Validation-Rules) for what validation enforces
- Check [Getting Started](Getting-Started) for local setup
- Review [VS Code Extension](VS-Code-Extension) for IDE integration
