# Getting Started with RIPP™

This guide will help you create your first RIPP packet and integrate RIPP into your workflow.

## Prerequisites

- **Node.js** (v16 or later) — Required for RIPP CLI
- **Git** — For version control (recommended)
- **Text editor** — VS Code, Sublime, Vim, or any editor
- **Basic YAML/JSON knowledge** — RIPP packets are written in YAML or JSON

## Installing RIPP Tooling

### Option 1: Dev Dependency (Recommended)

Install RIPP CLI as a dev dependency in your project:

```bash
npm install -D ripp-cli
```

This ensures:
- ✅ Offline support (no `npx` fetch delays)
- ✅ Version consistency across your team
- ✅ Faster CI/CD builds

### Option 2: Global Install

Install globally for use across multiple projects:

```bash
npm install -g ripp-cli
```

### Option 3: npx (No Install)

Run RIPP commands on-demand:

```bash
npx ripp validate my-feature.ripp.yaml
```

⚠️ **Slower** — Downloads CLI on each run if not cached.

---

## Initializing a Repository

Run `ripp init` to set up RIPP structure in your repository:

```bash
ripp init
```

### What It Creates

| File/Directory | Purpose |
|----------------|---------|
| `ripp/` | Main directory for RIPP artifacts |
| `ripp/features/` | Feature specifications go here |
| `ripp/intent-packages/` | Packaged artifacts (handoff documents) |
| `ripp/README.md` | Documentation about RIPP in your repo |
| `.github/workflows/ripp-validate.yml` | GitHub Action for automated validation |

### What It Never Does Automatically

- ❌ Modifies existing RIPP packets
- ❌ Deletes or overwrites files (unless `--force` is used)
- ❌ Generates code or creates features
- ❌ Commits changes to git

**Idempotent:** Safe to run multiple times. Skips existing files by default.

---

## Your First RIPP Packet

Create a file: `ripp/features/my-feature.ripp.yaml`

```yaml
ripp_version: '1.0'
packet_id: 'my-feature'
title: 'My First RIPP Feature'
created: '2025-12-14'
updated: '2025-12-14'
status: 'draft'
level: 1

purpose:
  problem: 'Users cannot perform X, requiring manual workaround Y'
  solution: 'Provide feature Z that enables users to do X directly'
  value: 'Saves time, reduces errors, improves user satisfaction'

ux_flow:
  - step: 1
    actor: 'User'
    action: 'Navigates to feature page'
    trigger: 'Clicks "Start Feature" button'
  - step: 2
    actor: 'System'
    action: 'Validates user permissions'
    result: 'User sees feature interface or error message'
  - step: 3
    actor: 'User'
    action: 'Completes feature workflow'
    result: 'Success confirmation displayed'

data_contracts:
  inputs:
    - name: 'FeatureRequest'
      fields:
        - name: 'user_id'
          type: 'string'
          required: true
          description: 'ID of the user initiating the request'
        - name: 'parameter'
          type: 'string'
          required: true
          description: 'Feature-specific parameter'
  outputs:
    - name: 'FeatureResponse'
      fields:
        - name: 'result_id'
          type: 'string'
          required: true
          description: 'ID of the result'
        - name: 'status'
          type: 'string'
          required: true
          description: 'Success or error status'
```

---

## First Validation

Validate your RIPP packet:

```bash
ripp validate ripp/features/my-feature.ripp.yaml
```

**Success Output:**

```
✓ my-feature.ripp.yaml is valid (Level 1)

✓ All 1 RIPP packets are valid.
```

**Failure Output:**

```
✗ my-feature.ripp.yaml
  • /purpose: must have required property 'problem'
  • /status: must be equal to one of the allowed values

✗ 1 of 1 RIPP packets failed validation.
```

---

## Validation in CI/CD

After running `ripp init`, your repository will have `.github/workflows/ripp-validate.yml`.

**What it does:**

- ✅ Runs `ripp validate` on every pull request
- ✅ Validates on push to `main`
- ✅ Can be triggered manually via `workflow_dispatch`
- ✅ Fails the build if validation fails

**When it runs:**

- On pull requests that modify `*.ripp.yaml` or `*.ripp.json` files
- On pushes to `main` branch (if RIPP files changed)
- Manually via GitHub Actions UI

---

## What Files Are Created (Full Table)

| File | Created By | Purpose | Committed to Git? |
|------|-----------|---------|-------------------|
| `ripp/` | `ripp init` | Main RIPP directory | ✅ Yes |
| `ripp/features/` | `ripp init` | Feature specifications | ✅ Yes |
| `ripp/intent-packages/` | `ripp init` | Packaged artifacts | ⚠️ Optional (add to `.gitignore` if generated) |
| `ripp/README.md` | `ripp init` | Repo-specific RIPP docs | ✅ Yes |
| `.github/workflows/ripp-validate.yml` | `ripp init` | GitHub Action | ✅ Yes |
| `*.ripp.yaml` | You | Feature specifications | ✅ Yes |
| `reports/lint.json` | `ripp lint` | Lint report (machine-readable) | ❌ No (add to `.gitignore`) |
| `reports/lint.md` | `ripp lint` | Lint report (human-readable) | ❌ No (add to `.gitignore`) |

---

## What Never Happens Automatically

RIPP tooling is **explicitly non-destructive**:

- ❌ Validators never modify RIPP packet files
- ❌ Linters never auto-fix issues
- ❌ `ripp init` never overwrites existing files (unless `--force`)
- ❌ `ripp package` never modifies source packets (read-only operation)
- ❌ `ripp analyze` only creates new draft files, never edits existing ones

**Philosophy:** Humans own intent. Tools validate it. No surprises.

---

## Next Steps

1. **Create your first real RIPP packet** → Use a feature you're building now
2. **Validate it** → `ripp validate ripp/features/`
3. **Lint it** → `ripp lint ripp/features/` (best practices check)
4. **Set up GitHub Action** → Commit `.github/workflows/ripp-validate.yml`
5. **Review the spec** → Read [RIPP Specification](RIPP-Specification)
6. **Explore advanced features** → See [CLI Reference](CLI-Reference)

---

## Quick Reference

| Task | Command |
|------|---------|
| Initialize RIPP | `ripp init` |
| Validate a file | `ripp validate my-feature.ripp.yaml` |
| Validate a directory | `ripp validate ripp/features/` |
| Lint for best practices | `ripp lint ripp/features/` |
| Enforce minimum level | `ripp validate . --min-level 2` |
| Package to Markdown | `ripp package --in feature.ripp.yaml --out handoff.md` |
| Generate draft from OpenAPI | `ripp analyze openapi.json --output draft.ripp.yaml` |

---

**Need help?** See [FAQ](FAQ) or [RIPP Specification](RIPP-Specification).
