# RIPP Directory Layout

This document explains the RIPP directory structure, naming conventions, and the distinction between different types of directories.

## Overview

RIPP uses a clear, explicit directory structure that separates **human-authored intent** from **machine-generated outputs**. This makes it immediately obvious what is source material and what is derived.

## Directory Structure

```
your-project/
├── .ripp/                       # Hidden config/control plane
│   ├── config.yaml              # RIPP configuration (AI settings, evidence scanning)
│   ├── evidence/                # Generated evidence pack (vNext)
│   ├── intent.candidates.yaml   # AI-generated candidates (vNext)
│   ├── intent.confirmed.yaml    # Human-confirmed intent (vNext)
│   └── handoff.ripp.yaml        # Final canonical packet (vNext)
│
└── ripp/                        # Visible workspace
    ├── README.md                # Workflow documentation
    ├── .gitignore               # Ignore generated packages
    ├── intent/                  # 📝 Human-authored intent (SOURCE)
    │   ├── auth-login.ripp.yaml
    │   ├── user-profile.ripp.yaml
    │   └── payment-flow.ripp.yaml
    │
    └── output/                  # 🤖 Generated artifacts (DERIVED)
        ├── handoffs/            # Validated, finalized packets
        │   └── approved-feature.ripp.yaml
        └── packages/            # Packaged deliverables (gitignored)
            ├── handoff.md
            ├── handoff.json
            └── handoff.zip
```

## Directory Purposes

### `.ripp/` — Hidden Control Plane

**Purpose:** Configuration and transient workflow state

**Contents:**

- `config.yaml` — RIPP configuration (AI providers, evidence scanning rules)
- `evidence/` — Repository scan results (vNext Intent Discovery)
- `intent.*.yaml` — Intent discovery workflow state (vNext)

**Visibility:** Hidden (dotfile), excluded from most `ls` output

**Version Control:** `.ripp/config.yaml` is committed; generated files are gitignored

**When to use:** System configuration and AI workflow state; not for end-user content

---

### `ripp/` — Visible Workspace

**Purpose:** All user-facing RIPP content

**Visibility:** Visible, shown in repository navigation

**Version Control:** Entire directory structure is committed (except `output/packages/`)

---

### `ripp/intent/` — Human-Authored Intent

**Purpose:** Work-in-progress RIPP packets

**Contents:**

- Feature specifications in draft or development
- Human-written intent specifications
- May contain TODOs, incomplete sections, or experimental ideas

**Naming Convention:** `<feature-name>.ripp.yaml` or `.ripp.json`

**Examples:**

- `auth-login.ripp.yaml`
- `user-profile-update.ripp.yaml`
- `payment-checkout.ripp.yaml`

**Version Control:** ✅ Committed to git

**Workflow:**

1. Author creates new packet in `intent/`
2. Iterates and refines
3. Runs `ripp validate` and `ripp lint`
4. When approved, moves to `output/handoffs/`

---

### `ripp/output/` — Generated Artifacts

**Purpose:** Machine-generated or finalized outputs

**Contents:**

- `handoffs/` — Validated, approved packets ready for delivery
- `packages/` — Packaged outputs (markdown, JSON, ZIP)

**Rationale:**

- Clearly separates source (intent) from derived artifacts (output)
- Makes it obvious which files are "pristine" vs "processed"
- Prevents confusion about what to edit vs what to regenerate

---

### `ripp/output/handoffs/` — Finalized Packets

**Purpose:** Validated, approved RIPP packets ready for delivery to implementation teams

**Contents:**

- Packets that have passed validation
- Approved by reviewers
- Ready for handoff to engineering, AI agents, or external teams

**Version Control:** ✅ Committed to git

**Workflow:**

1. Move validated packet from `intent/` to `output/handoffs/`
2. Run `ripp package` to generate deliverables
3. Deliver to implementation team

---

### `ripp/output/packages/` — Packaged Deliverables

**Purpose:** Generated output formats for delivery

**Contents:**

- Markdown handoff documents (`.md`)
- JSON exports (`.json`)
- YAML normalized packets (`.yaml`)
- ZIP archives (`.zip`)

**Version Control:** ❌ Gitignored (generated artifacts)

**Workflow:**

1. Run `ripp package --in ripp/output/handoffs/my-feature.ripp.yaml --out ripp/output/packages/handoff.md`
2. Share generated file with receiving team
3. Regenerate as needed (not committed to version control)

---

## `.ripp/` vs `ripp/`

| Aspect               | `.ripp/`                         | `ripp/`                                 |
| -------------------- | -------------------------------- | --------------------------------------- |
| **Visibility**       | Hidden (dotfile)                 | Visible                                 |
| **Purpose**          | Config & workflow state          | User-facing content                     |
| **Typical Contents** | `config.yaml`, AI workflow state | Intent packets, handoffs, packages      |
| **Version Control**  | Config committed, state ignored  | Intent & handoffs committed, packages   |
| ignored              |
| **User Interaction** | Rarely edited manually           | Frequently edited (intent/) or consumed |
| (output/)            |
| **Analogy**          | `.git/` — system internals       | `src/` — source code                    |

---

## Human-Authored vs Generated

### Human-Authored (SOURCE)

- `ripp/intent/` — Feature specifications written by humans
- `.ripp/config.yaml` — Configuration set by humans

### Machine-Generated (DERIVED)

- `ripp/output/handoffs/` — Moved from intent after validation (hybrid: human-authored, machine-validated)
- `ripp/output/packages/` — Generated by `ripp package`
- `.ripp/evidence/` — Generated by `ripp evidence build`
- `.ripp/intent.candidates.yaml` — Generated by `ripp discover` (AI-assisted)

**Rule of thumb:** If it can be regenerated from source, it's machine-generated.

---

## What "Artifacts" Means in RIPP

**Common confusion:** Is there an `artifacts/` directory?

**Answer:** No. "Artifacts" in RIPP refers to the **conceptual outputs** of the specification process, not a specific directory.

**RIPP artifacts include:**

- Intent packets (`ripp/intent/*.ripp.yaml`)
- Handoff packets (`ripp/output/handoffs/*.ripp.yaml`)
- Packaged outputs (`ripp/output/packages/*`)
- Evidence packs (`.ripp/evidence/`)

**Why explicit names instead of "artifacts/":**

- "Artifacts" is ambiguous (source? generated? both?)
- Explicit names (`intent/`, `output/`) are self-documenting
- Reduces onboarding friction for new contributors

---

## VS Code Extension and Tooling Boundaries

### What Gets Packaged

**Included in RIPP outputs:**

- ✅ Intent packets (`ripp/intent/*.ripp.yaml`)
- ✅ Handoff packets (`ripp/output/handoffs/*.ripp.yaml`)
- ✅ Package metadata (tool name, version)

**NOT included in RIPP outputs:**

- ❌ VS Code extension source code
- ❌ VS Code extension binaries
- ❌ ripp-cli source code
- ❌ ripp-cli binaries

### Metadata vs Tooling

**Acceptable metadata:**

```yaml
# Inside a packaged RIPP packet
_ripp_package_metadata:
  packaged_by: ripp-cli
  ripp_cli_version: 1.0.0
  packaged_at: '2025-12-13T10:00:00Z'
  tooling_used:
    - name: vscode-ripp
      version: 1.2.0
```

**NOT acceptable:**

- Including extension `.vsix` files
- Bundling CLI binaries
- Embedding tooling source code

**Rationale:**

- RIPP is protocol-first, tool-agnostic
- Tooling serves the protocol, not vice versa
- Receiving teams may use different tools
- Protocol packets must remain portable

---

## Migration from Legacy Structure

### Legacy Structure (Pre-v1.1)

```
ripp/
├── features/    # Old name for intent
├── handoffs/    # Old location (now output/handoffs/)
└── packages/    # Old location (now output/packages/)
```

### New Structure (v1.1+)

```
ripp/
├── intent/              # Renamed from features/
└── output/
    ├── handoffs/        # Moved from handoffs/
    └── packages/        # Moved from packages/
```

### How to Migrate

```bash
# Preview changes
ripp migrate --dry-run

# Apply migration
ripp migrate
```

**What happens:**

- `ripp/features/` → `ripp/intent/`
- `ripp/handoffs/` → `ripp/output/handoffs/`
- `ripp/packages/` → `ripp/output/packages/`

**Backward compatibility:**

- CLI still recognizes old paths
- `ripp validate ripp/features/` still works
- Warnings displayed if legacy directories detected

---

## Best Practices

### 1. Keep Intent Packets in `intent/`

- Work-in-progress specifications
- Drafts, experiments, TODOs

### 2. Move to `output/handoffs/` When Approved

- Passed validation (`ripp validate`)
- Reviewed and approved
- Ready for delivery

### 3. Regenerate Packages from Source

- Don't manually edit files in `output/packages/`
- Always regenerate: `ripp package --in ... --out ...`

### 4. Don't Commit Packages to Git

- `output/packages/` should be gitignored
- Packages are derived artifacts, not source
- Regenerate on-demand for delivery

### 5. Use Descriptive Packet IDs

- Good: `auth-login`, `user-profile-update`, `payment-checkout`
- Bad: `feature1`, `test`, `new`

### 6. Validate Before Moving to Handoffs

```bash
# Validate before moving
ripp validate ripp/intent/my-feature.ripp.yaml

# Move when valid
mv ripp/intent/my-feature.ripp.yaml ripp/output/handoffs/
```

---

## FAQ

### Why `intent/` instead of `features/`?

- "Intent" is more precise — it's about capturing the **why** and **what**
- Aligns with RIPP's core philosophy: preserving intent
- Distinguishes from "feature flags" or "feature branches"

### Why `output/` instead of top-level `handoffs/` and `packages/`?

- Groups all generated artifacts under one clear parent
- Makes it obvious what is derived vs source
- Easier to exclude generated content (e.g., in CI, backups)

### Can I use the old directory names?

- Yes, the CLI maintains backward compatibility
- Warnings will be shown
- Use `ripp migrate` to update

### Do I need to migrate immediately?

- No, old structure continues to work
- Migration recommended for clarity
- New projects should use new structure from the start

### Can I create custom subdirectories?

- Yes, under `intent/` for organization (e.g., `intent/api/`, `intent/ui/`)
- Avoid modifying `output/` structure (reserved for CLI)

---

## Summary

| Directory               | Purpose                     | Source/Derived | Committed to Git |
| ----------------------- | --------------------------- | -------------- | ---------------- |
| `.ripp/config.yaml`     | Configuration               | Source         | ✅               |
| `.ripp/evidence/`       | Repository scan (vNext)     | Derived        | ❌               |
| `ripp/intent/`          | Work-in-progress packets    | Source         | ✅               |
| `ripp/output/handoffs/` | Finalized, approved packets | Hybrid         | ✅               |
| `ripp/output/packages/` | Packaged deliverables       | Derived        | ❌               |

**Remember:**

- `.ripp/` = hidden config/state
- `ripp/intent/` = human-authored source
- `ripp/output/` = machine-generated or finalized

---

**Learn more:**

- [RIPP Specification](../SPEC.md)
- [Getting Started Guide]({{ '/getting-started' | relative_url }})
- [Tooling Documentation]({{ '/tooling' | relative_url }})
