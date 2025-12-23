# CLI Reference

Complete reference for the RIPP CLI (`ripp-cli`).

## Installation

### As Dev Dependency (Recommended)

```bash
npm install -D ripp-cli
```

### Global Install

```bash
npm install -g ripp-cli
```

### From Source

```bash
git clone https://github.com/Dylan-Natter/ripp-protocol.git
cd ripp-protocol/tools/ripp-cli
npm install
npm link
```

---

## Command Overview

| Command         | Purpose                                    | Read-Only?                |
| --------------- | ------------------------------------------ | ------------------------- |
| `ripp init`     | Initialize RIPP in your repository         | ❌ Creates files          |
| `ripp migrate`  | Migrate legacy directory structure         | ❌ Moves directories      |
| `ripp validate` | Validate RIPP packets against schema       | ✅ Yes                    |
| `ripp lint`     | Check best practices                       | ✅ Yes                    |
| `ripp package`  | Package RIPP packet into handoff artifact  | ✅ Yes (creates new file) |
| `ripp analyze`  | Generate DRAFT packet from code/schemas    | ✅ Yes (creates new file) |
| `ripp evidence` | Build evidence pack from repository        | ✅ Yes (creates new file) |
| `ripp discover` | AI-assisted intent discovery (optional)    | ✅ Yes (creates new file) |
| `ripp confirm`  | Confirm candidate intent (human-in-loop)   | ✅ Yes (creates new file) |
| `ripp build`    | Build canonical RIPP from confirmed intent | ✅ Yes (creates new file) |
| `ripp metrics`  | Display workflow analytics and health      | ✅ Yes (optional report)  |
| `ripp doctor`   | Run health checks and diagnostics          | ✅ Yes                    |

---

## `ripp init`

Initialize RIPP structure in your repository.

### Purpose

Sets up the recommended directory structure and GitHub Actions workflow for RIPP.

### What It Does

Creates:

- `ripp/` — Main directory for RIPP artifacts
- `ripp/intent/` — Directory for feature RIPP packets
- `ripp/intent-packages/` — Directory for packaged artifacts
- `ripp/README.md` — Documentation about RIPP in your repo
- `ripp/intent-packages/README.md` — Intent package documentation
- `.github/workflows/ripp-validate.yml` — GitHub Action for validation

### What It Writes

| File                                  | Content                | Overwrite Behavior                       |
| ------------------------------------- | ---------------------- | ---------------------------------------- |
| `ripp/`                               | Empty directory        | Always created if missing                |
| `ripp/intent/`                        | Empty directory        | Always created if missing                |
| `ripp/intent-packages/`               | Empty directory        | Always created if missing                |
| `ripp/README.md`                      | Documentation template | **Skipped** if exists (unless `--force`) |
| `ripp/intent-packages/README.md`      | Documentation template | **Skipped** if exists (unless `--force`) |
| `.github/workflows/ripp-validate.yml` | GitHub Action YAML     | **Skipped** if exists (unless `--force`) |

### When to Run It

- ✅ When adopting RIPP in a new or existing repository
- ✅ To regenerate default files (with `--force`)
- ❌ Not needed if you already have RIPP structure set up

### Usage

```bash
# Initialize with default behavior (skip existing files)
ripp init

# Force overwrite existing files
ripp init --force
```

### Options

| Option    | Description              | Default |
| --------- | ------------------------ | ------- |
| `--force` | Overwrite existing files | `false` |

### Example Output

```
Initializing RIPP in your repository...

✓ Created ripp/
✓ Created ripp/intent/
✓ Created ripp/intent-packages/
✓ Created ripp/README.md
✓ Created ripp/intent-packages/README.md
✓ Created .github/workflows/ripp-validate.yml

RIPP initialization complete!

Next steps:
1. Create your first RIPP packet in ripp/intent/
2. Run 'ripp validate ripp/intent/' to validate
3. Commit and push to enable CI/CD validation
```

### Exit Codes

- `0` — Initialization successful
- `1` — Error occurred (e.g., file write failure)

---

## `ripp migrate`

Migrate legacy RIPP directory structure to the new recommended layout.

### Purpose

Automatically reorganizes RIPP directories from the legacy structure to the new structure introduced in RIPP v1.0.

### Legacy vs. New Structure

**Legacy structure (pre-v1.0):**

```
ripp/
├── features/           # Intent packets
├── handoffs/           # Finalized packets
└── packages/           # Generated outputs
```

**New structure (v1.0+):**

```
ripp/
├── intent/             # Intent packets (was features/)
└── output/
    ├── handoffs/       # Finalized packets (was handoffs/)
    └── packages/       # Generated outputs (was packages/)
```

### What It Does

- ✅ Detects legacy directory structure
- ✅ Moves `ripp/features/` → `ripp/intent/`
- ✅ Creates `ripp/output/` directory
- ✅ Moves `ripp/handoffs/` → `ripp/output/handoffs/`
- ✅ Moves `ripp/packages/` → `ripp/output/packages/`
- ✅ Supports dry-run mode to preview changes
- ✅ Handles cross-device moves safely
- ✅ Detects conflicts (if both old and new directories exist)

### What It Never Does

- ❌ Deletes files
- ❌ Modifies file contents
- ❌ Overwrites existing directories
- ❌ Runs automatically (requires explicit user action)

### When to Run It

- ✅ When upgrading from RIPP pre-v1.0 to v1.0+
- ✅ When repository uses legacy directory names
- ✅ After cloning a repository with legacy structure
- ❌ Not needed if already using new structure

### Usage

```bash
# Preview changes (dry-run)
ripp migrate --dry-run

# Execute migration
ripp migrate
```

### Options

| Option      | Description                       | Default |
| ----------- | --------------------------------- | ------- |
| `--dry-run` | Preview changes without executing | `false` |

### Example Output (Dry Run)

```
🔍 Scanning for legacy RIPP directories...

Would move: ripp/features/ → ripp/intent/
Would create: ripp/output/
Would move: ripp/handoffs/ → ripp/output/handoffs/
Would move: ripp/packages/ → ripp/output/packages/

Run without --dry-run to apply changes.
```

### Example Output (Actual Migration)

```
🔍 Scanning for legacy RIPP directories...

✓ Moved: ripp/features/ → ripp/intent/
✓ Created: ripp/output/
✓ Moved: ripp/handoffs/ → ripp/output/handoffs/
✓ Moved: ripp/packages/ → ripp/output/packages/

Migration complete!

Next steps:
1. Review migrated files in new locations
2. Update any scripts or CI configs that reference old paths
3. Commit changes to version control
```

### Example Output (No Legacy Directories)

```
🔍 Scanning for legacy RIPP directories...

No legacy directories found. Already using new structure!
```

### Example Output (Conflict Detected)

```
🔍 Scanning for legacy RIPP directories...

⚠️  Warning: Both ripp/features/ and ripp/intent/ exist. Manual merge required.

Migration cannot proceed automatically.
Please manually merge directories and remove duplicates.
```

### Exit Codes

- `0` — Migration successful or no action needed
- `1` — Migration failed (e.g., file system error)

### Relationship to vNext Workflows

The new directory structure (`ripp/intent/`, `ripp/output/`) is designed to work seamlessly with the vNext intent discovery workflow:

- **`ripp/intent/`** — Stores human-authored or AI-confirmed intent packets
- **`ripp/output/handoffs/`** — Stores finalized, packaged handoff artifacts
- **`ripp/output/packages/`** — Stores generated outputs from build process

After migrating, the VS Code extension and CLI tools will automatically detect and use the new structure.

### Backward Compatibility

The RIPP CLI maintains backward compatibility with legacy paths:

- Commands like `ripp validate` and `ripp lint` will search both legacy and new paths
- You can continue using legacy paths until you're ready to migrate
- The migration is **opt-in** — nothing breaks if you don't migrate immediately

### CI/CD Considerations

After migrating, update your CI/CD workflows to reference new paths:

```yaml
# Before (legacy)
- name: Validate RIPP Packets
  run: ripp validate ripp/features/

# After (new)
- name: Validate RIPP Packets
  run: ripp validate ripp/intent/
```

However, `ripp validate .` works for both structures.

---

## `ripp validate`

Validate RIPP packets against the JSON Schema.

### Purpose

Ensures RIPP packets conform to the specification and include all required sections for their declared level.

### What It Checks

- ✅ **Schema conformance** — Validates against JSON Schema
- ✅ **Required sections** — Ensures all required sections for declared level are present
- ✅ **File naming** — Checks `.ripp.yaml` or `.ripp.json` extension
- ✅ **Data integrity** — Validates `packet_id` format, date formats, status values
- ✅ **Level conformance** — Ensures Level 2/3 sections are present when declared

### What It Never Does

- ❌ Modifies source RIPP packet files
- ❌ Auto-fixes validation errors
- ❌ Generates code or creates files
- ❌ Commits changes to git

### Usage

```bash
# Validate a single file
ripp validate my-feature.ripp.yaml

# Validate all files in a directory
ripp validate ripp/intent/

# Validate current directory
ripp validate .

# Enforce minimum RIPP level
ripp validate . --min-level 2

# Suppress warnings (errors only)
ripp validate . --quiet
```

### Options

| Option                  | Description                       | Default |
| ----------------------- | --------------------------------- | ------- |
| `--min-level <1\|2\|3>` | Enforce minimum conformance level | None    |
| `--quiet`               | Suppress warnings                 | `false` |

### Example Output (Success)

```
✓ item-creation.ripp.yaml is valid (Level 3)
✓ webhook-feature.ripp.yaml is valid (Level 2)
✓ user-auth.ripp.yaml is valid (Level 1)

✓ All 3 RIPP packets are valid.
```

### Example Output (Failure)

```
✗ user-registration.ripp.yaml
  • /purpose: must have required property 'problem'
  • /status: must be equal to one of the allowed values
  • Packet is Level 2, but missing section: permissions

✗ payment-processing.ripp.yaml
  • /data_contracts/inputs/0/fields/2: must have required property 'description'

✗ 2 of 3 RIPP packets failed validation.
```

### Exit Codes

- `0` — All packets valid
- `1` — Validation failures found

### CI Usage

Recommended for GitHub Actions, GitLab CI, etc.:

```yaml
- name: Validate RIPP Packets
  run: ripp validate .
```

If validation fails, the CI build fails.

---

## `ripp lint`

Check RIPP packets for best practices beyond schema validation.

### Purpose

Identifies issues that are syntactically valid but violate best practices.

### What It Checks

- ⚠️ Missing critical sections (`out_of_scope`, `assumptions`, security NFRs)
- ⚠️ Undefined ID references in `schema_ref`
- ⚠️ Placeholder text (TODO, TBD, `example.com`)
- ⚠️ Missing or vague verification steps in acceptance tests
- ⚠️ Short or uninformative descriptions

### What It Never Does

- ❌ Modifies source RIPP packet files
- ❌ Auto-fixes lint warnings
- ❌ Fails builds (unless `--strict` is used)

### Usage

```bash
# Lint files in a directory
ripp lint ripp/intent/

# Treat warnings as errors (fail on warnings)
ripp lint ripp/intent/ --strict

# Custom output directory
ripp lint ripp/intent/ --output ./build/reports/
```

### Options

| Option           | Description                                 | Default    |
| ---------------- | ------------------------------------------- | ---------- |
| `--strict`       | Treat warnings as errors (fail on warnings) | `false`    |
| `--output <dir>` | Output directory for reports                | `reports/` |

### Output Files

| File                | Format   | Purpose                 |
| ------------------- | -------- | ----------------------- |
| `reports/lint.json` | JSON     | Machine-readable report |
| `reports/lint.md`   | Markdown | Human-readable report   |

### Example Output

```
Linting RIPP packets...

✗ draft-api.ripp.yaml - 2 error(s), 5 warning(s)
  Errors:
    • purpose.out_of_scope is missing (recommended for clarity)
    • acceptance_tests[0].verification is too vague
  Warnings:
    • Contains placeholder text: "TODO"
    • api_contracts[0].response.errors has only 1 error case (recommend at least 2)
    • nfrs.security.encryption_at_rest not specified
    • Short description in data_contracts.inputs[0].fields[1]
    • No assumptions documented

✓ feature.ripp.yaml - No issues
✓ item-creation.ripp.yaml - No issues

📄 JSON report: reports/lint.json
📄 Markdown report: reports/lint.md

✗ Found 2 error(s) and 5 warning(s)
```

### Lint Rules

| Rule                   | Severity | Description                                  |
| ---------------------- | -------- | -------------------------------------------- |
| `missing-out-of-scope` | Warning  | `purpose.out_of_scope` not defined           |
| `missing-assumptions`  | Warning  | `purpose.assumptions` not defined            |
| `placeholder-text`     | Error    | Contains TODO, TBD, or placeholder URLs      |
| `undefined-schema-ref` | Error    | `schema_ref` references non-existent entity  |
| `vague-verification`   | Error    | Acceptance test verification is too generic  |
| `missing-security-nfr` | Warning  | Level 3 packet missing `nfrs.security`       |
| `short-description`    | Warning  | Description field is less than 10 characters |

### Exit Codes

- `0` — No errors (warnings allowed unless `--strict`)
- `1` — Errors found, or warnings found with `--strict`

### CI Usage

```yaml
- name: Lint RIPP Packets (strict)
  run: ripp lint ripp/intent/ --strict
```

---

## `ripp package`

Package a RIPP packet into a normalized handoff artifact.

### Purpose

Creates a standalone, normalized version of a RIPP packet for handoff to production teams or external stakeholders.

### What It Does

- ✅ Validates input before packaging
- ✅ Normalizes packet structure
- ✅ Removes empty optional fields
- ✅ Adds packaging metadata (timestamp, tool version)
- ✅ Outputs in Markdown, JSON, or YAML format

### What It Never Does

- ❌ Modifies the source RIPP packet file (read-only operation)

### Usage

```bash
# Package to Markdown (handoff doc)
ripp package --in feature.ripp.yaml --out handoff.md

# Package to JSON
ripp package --in feature.ripp.yaml --out packaged.json

# Package to YAML
ripp package --in feature.ripp.yaml --out normalized.yaml

# Explicit format specification
ripp package --in feature.ripp.yaml --out artifact --format json
```

### Options

| Option                      | Description                                  | Required |
| --------------------------- | -------------------------------------------- | -------- |
| `--in <file>`               | Input RIPP packet file                       | ✅ Yes   |
| `--out <file>`              | Output file path                             | ✅ Yes   |
| `--format <json\|yaml\|md>` | Output format (auto-detected from extension) | ❌ No    |

### Output Formats

#### Markdown (`--format md`)

Creates a human-readable handoff document with:

- Feature overview
- All sections formatted for readability
- Metadata footer (packaged timestamp, tool version)

**Use for:** Handoff to teams that prefer documentation over structured data.

#### JSON (`--format json`)

Creates a normalized JSON artifact with:

- All fields from source packet
- Empty optional fields removed
- Packaging metadata added

**Use for:** Machine processing, API integrations, archival.

#### YAML (`--format yaml`)

Creates a normalized YAML artifact (same as JSON but YAML syntax).

**Use for:** Human-readable structured data, config management.

### Example Output (Markdown excerpt)

```markdown
# Create New Item in Inventory System

**Status:** approved  
**Level:** 3  
**Version:** 1.0

---

## Purpose

**Problem:**  
Users cannot add new inventory items without manual database updates.

**Solution:**  
Provide a web form and API endpoint with validation and duplicate detection.

**Value:**  
Enables self-service item management, reduces support tickets.

---

## UX Flow

1. **User** navigates to Add Item page  
   _Trigger: Clicks "Add New Item" button_

2. **System** validates input  
   _Condition: If SKU already exists, show error_

...
```

### Exit Codes

- `0` — Packaging successful
- `1` — Validation failure or packaging error

---

## `ripp analyze`

Generate a DRAFT RIPP packet from existing code or schemas.

### Purpose

Extracts observable facts from OpenAPI specs or JSON Schemas to bootstrap a RIPP packet.

### What It Does

- ✅ Parses OpenAPI 3.0/Swagger 2.0 specifications
- ✅ Parses JSON Schema files
- ✅ Extracts data contracts, API endpoints, field types
- ✅ Generates a **DRAFT** RIPP packet with TODO markers

### What It Never Does

- ❌ Modifies existing RIPP packet files
- ❌ Guesses intent, business logic, or failure modes
- ❌ Produces production-ready packets (always DRAFT status)

### ⚠️ Important

Generated packets are **always DRAFT** and require human review:

- TODO markers indicate sections that need human input
- Extracted facts may be incomplete or inaccurate
- Business logic, purpose, and value cannot be inferred from code
- **Human review is mandatory** before approval

### Usage

```bash
# Analyze OpenAPI specification
ripp analyze openapi.json --output draft-api.ripp.yaml

# Analyze JSON Schema
ripp analyze schema.json --output draft.ripp.yaml --packet-id my-feature
```

### Options

| Option             | Description                              | Required | Default    |
| ------------------ | ---------------------------------------- | -------- | ---------- |
| `<input>`          | Input file (OpenAPI spec or JSON Schema) | ✅ Yes   | —          |
| `--output <file>`  | Output DRAFT RIPP packet file            | ✅ Yes   | —          |
| `--packet-id <id>` | Packet ID for generated RIPP             | ❌ No    | `analyzed` |

### Supported Inputs

- ✅ OpenAPI 3.0 specifications
- ✅ Swagger 2.0 specifications
- ✅ JSON Schema (Draft 7)

### Example Output (YAML excerpt)

```yaml
ripp_version: '1.0'
packet_id: 'analyzed'
title: 'TODO: Add human-readable title'
created: '2025-12-14'
updated: '2025-12-14'
status: 'draft'
level: 1

purpose:
  problem: 'TODO: Define the problem being solved'
  solution: 'TODO: Describe the solution approach'
  value: 'TODO: Explain the business or user value'

# ...extracted data contracts...

# TODO: Add ux_flow (required for Level 1)
# TODO: Review all extracted fields for accuracy
# TODO: Add permissions, failure_modes (required for Level 2+)
```

### Exit Codes

- `0` — Analysis successful, draft created
- `1` — Analysis failed (invalid input, file write error)

---

## `ripp evidence build`

**vNext Feature** — Build evidence pack from repository for intent discovery.

### Purpose

Scans your repository to extract high-signal facts (dependencies, routes, schemas, auth signals) for AI-assisted intent discovery.

### What It Does

- ✅ Scans files according to configured glob patterns
- ✅ Extracts dependencies from `package.json`, `requirements.txt`, etc.
- ✅ Detects API routes (Express, FastAPI, Django, etc.)
- ✅ Finds data schemas (ORMs, migrations, SQL)
- ✅ Identifies authentication signals (middleware, guards)
- ✅ Captures CI/CD workflows (`.github/workflows/`)
- ✅ Applies best-effort secret redaction
- ✅ Generates `.ripp/evidence/evidence.index.json`

### What It Never Does

- ❌ Modifies source code files
- ❌ Commits changes to git
- ❌ Uploads data externally

### Usage

```bash
# Build evidence pack with default config
ripp evidence build

# Evidence pack is created at .ripp/evidence/
```

### Configuration

Evidence collection is configured via `.ripp/config.yaml`:

```yaml
evidencePack:
  includeGlobs:
    - 'src/**'
    - 'app/**'
    - 'api/**'
  excludeGlobs:
    - '**/node_modules/**'
    - '**/dist/**'
    - '**/*.lock'
  maxFileSize: 1048576 # 1MB
```

### Example Output

```
Building evidence pack...

✓ Evidence pack built successfully
  Index: .ripp/evidence/evidence.index.json
  Files: 23
  Size: 45.2 KB

Evidence Summary:
  Dependencies: 8
  Routes: 12
  Schemas: 3
  Auth Signals: 5
  Workflows: 2

⚠ Note: Evidence pack contains code snippets.
  Best-effort secret redaction applied, but review before sharing.
```

### Exit Codes

- `0` — Evidence build successful
- `1` — Build failed (configuration error, file access error)

---

## `ripp discover`

**vNext Feature** — AI-assisted candidate intent inference from evidence pack.

### Purpose

Uses AI to infer candidate RIPP sections from the evidence pack, generating suggestions that require human confirmation.

### What It Does

- ✅ Reads evidence pack (never raw repository files)
- ✅ Uses configured AI provider (OpenAI, Azure OpenAI, Ollama, custom)
- ✅ Infers candidate RIPP sections with confidence scores
- ✅ Links each candidate to source evidence (file:line references)
- ✅ Validates output against schema (retry loop with feedback)
- ✅ Generates `.ripp/intent.candidates.yaml`

### What It Never Does

- ❌ Modifies source code or RIPP packets
- ❌ Produces canonical artifacts (requires human confirmation)
- ❌ Runs without explicit AI enablement

### ⚠️ AI Enablement Required

AI is disabled by default. To use this command:

1. **Enable in config** (`.ripp/config.yaml`):

   ```yaml
   ai:
     enabled: true
     provider: openai
     model: gpt-4o-mini
   ```

2. **Enable at runtime** (environment variable):
   ```bash
   export RIPP_AI_ENABLED=true
   export OPENAI_API_KEY=sk-your-key-here
   ```

Both are required. If either is false, the command fails.

### Usage

```bash
# Discover intent (requires AI enabled)
RIPP_AI_ENABLED=true ripp discover

# Target specific RIPP level
RIPP_AI_ENABLED=true ripp discover --target-level 2
```

### Options

| Option                     | Description       | Default |
| -------------------------- | ----------------- | ------- |
| `--target-level <1\|2\|3>` | Target RIPP level | `1`     |

### Example Output

```
Discovering intent from evidence...

AI Provider: openai
Model: gpt-4o-mini
Target Level: 2

✓ Intent discovery complete
  Candidates: 8
  Output: .ripp/intent.candidates.yaml

⚠ IMPORTANT:
  All candidates are INFERRED and require human confirmation.
  Run "ripp confirm" to review and approve candidates.
```

### Candidate Structure

All AI-inferred candidates include:

- `source: inferred`
- `confidence: 0.0–1.0`
- `evidence: [{file, line, snippet}]`
- `requires_human_confirmation: true`

### Exit Codes

- `0` — Discovery successful
- `1` — Discovery failed (AI not enabled, API error, validation error)

---

## `ripp confirm`

**vNext Feature** — Human confirmation workflow for AI-inferred candidate intent.

### Purpose

Reviews AI-inferred candidates and captures human approval decisions before compilation.

### What It Does

- ✅ Reads `.ripp/intent.candidates.yaml`
- ✅ Presents each candidate for review (interactive or checklist)
- ✅ Captures confirmation metadata (timestamp, user)
- ✅ Generates `.ripp/intent.confirmed.yaml`
- ✅ Optionally tracks rejected candidates in `.ripp/intent.rejected.yaml`

### What It Never Does

- ❌ Modifies source code or original candidates file
- ❌ Auto-approves candidates
- ❌ Uses AI

### Usage

```bash
# Interactive confirmation (default)
ripp confirm

# Generate markdown checklist for manual review
ripp confirm --checklist

# Specify user identifier
ripp confirm --user developer@example.com
```

### Options

| Option          | Description                      | Default |
| --------------- | -------------------------------- | ------- |
| `--interactive` | Interactive terminal mode        | `true`  |
| `--checklist`   | Generate markdown checklist      | `false` |
| `--user <id>`   | User identifier for confirmation | None    |

### Interactive Mode

Presents each candidate sequentially with options:

- **y** — Accept candidate
- **n** — Reject candidate
- **e** — Edit candidate (future feature)
- **s** — Skip candidate

### Checklist Mode

Generates `.ripp/intent.checklist.md` for manual review:

```markdown
## Candidate 1: purpose

- [ ] Accept this candidate

### Content

- problem: "Users need to..."
- solution: "Provide..."
```

### Example Output

```
Confirming candidate intent...

--- Candidate 1/8 ---
Section: purpose
Confidence: 87.0%

Content:
  problem: "Users need to retrieve their profile information"
  solution: "Provide authenticated API endpoint"
  value: "Enables personalized user experiences"

Accept this candidate? (y/n/e/s): y
✓ Accepted

...

✓ Intent confirmation complete
  Confirmed: 6
  Rejected: 2
  Output: .ripp/intent.confirmed.yaml
```

### Exit Codes

- `0` — Confirmation complete
- `1` — Confirmation failed (candidates file missing or invalid)

---

## `ripp build`

**vNext Feature** — Build canonical RIPP artifacts from confirmed intent.

### Purpose

Compiles human-confirmed intent blocks into schema-validated canonical RIPP packets.

### What It Does

- ✅ Reads `.ripp/intent.confirmed.yaml`
- ✅ Assembles canonical RIPP packet from confirmed blocks
- ✅ Validates against RIPP schema before writing
- ✅ Generates `.ripp/handoff.ripp.yaml` (canonical packet)
- ✅ Generates `.ripp/handoff.ripp.md` (human-readable handoff doc)
- ✅ Includes full provenance metadata

### What It Never Does

- ❌ Modifies source code or confirmed intent file
- ❌ Uses AI
- ❌ Produces non-deterministic output

### Usage

```bash
# Build with default settings
ripp build

# Specify packet ID and title
ripp build --packet-id user-api --title "User API"

# Custom output filename
ripp build --output-name my-feature.ripp.yaml
```

### Options

| Option                 | Description                     | Default             |
| ---------------------- | ------------------------------- | ------------------- |
| `--packet-id <id>`     | Packet ID for generated RIPP    | `discovered-intent` |
| `--title <title>`      | Title for generated RIPP packet | `Discovered Intent` |
| `--output-name <file>` | Output filename                 | `handoff.ripp.yaml` |

### Example Output

```
Building canonical RIPP artifacts...

✓ Build complete
  RIPP Packet: .ripp/handoff.ripp.yaml
  Handoff MD: .ripp/handoff.ripp.md
  Level: 2

Next steps:
  1. Review generated artifacts
  2. Run "ripp validate .ripp/" to validate
  3. Run "ripp package" to create handoff.zip
```

### Deterministic Compilation

Given the same confirmed intent:

- Same packet structure is always generated
- Same metadata is included
- Output is reproducible

### Exit Codes

- `0` — Build successful
- `1` — Build failed (confirmed intent missing, validation failed)

---

## `ripp metrics`

**vNext Feature** — Display workflow analytics and health metrics.

### Purpose

Provides visibility into RIPP workflow progress and quality metrics to help identify bottlenecks and validate completeness.

### What It Does

- ✅ Gathers evidence pack metrics (file count, size, coverage %)
- ✅ Calculates discovery metrics (candidate count, confidence, quality score)
- ✅ Checks validation status (last run, pass/fail)
- ✅ Measures workflow completion (% of artifacts present)
- ✅ Optionally writes metrics report to `.ripp/metrics.json`
- ✅ Optionally shows historical trends

### What It Never Does

- ❌ Modifies any files (except when writing reports with `--report`)
- ❌ Sends data externally
- ❌ Requires network access
- ❌ Includes secrets or PII in reports

### Usage

```bash
# Display human-readable metrics summary
ripp metrics

# Write metrics report to .ripp/metrics.json
ripp metrics --report

# Show historical trends (if multiple runs)
ripp metrics --history
```

### Options

| Option      | Description                           | Default |
| ----------- | ------------------------------------- | ------- |
| `--report`  | Write metrics to `.ripp/metrics.json` | `false` |
| `--history` | Show metrics trends from past runs    | `false` |

### Example Output

```
RIPP Workflow Metrics
============================================================

Evidence Pack:
  Status: ✓ Built
  Files: 127
  Size: 2.3 MB
  Coverage: 85% of git-tracked files
  Last Build: 12/22/2025, 7:15:33 PM

Intent Discovery:
  Status: ✓ Completed
  Candidates: 5
  Avg Confidence: 78%
  Quality Score: 65/100
  Model: gpt-4o

Validation:
  Status: ✓ Pass
  Level: 2
  Last Run: 12/22/2025, 7:20:10 PM

Workflow Progress:
  Completion: 100% (5/5 steps)
  Steps:
    ✓ Initialized (.ripp/config.yaml)
    ✓ Evidence Built
    ✓ Discovery Run
    ✓ Checklist Generated
    ✓ Artifacts Built

============================================================
Generated: 12/22/2025, 7:25:00 PM
```

### Metrics Tracked

#### Evidence Metrics

- **File Count**: Number of files in evidence pack
- **Total Size**: Total bytes of tracked files
- **Coverage %**: Percentage of git-tracked files included in evidence

#### Discovery Metrics

- **Candidate Count**: Number of AI-discovered candidates
- **Avg Confidence**: Average confidence score (0.0-1.0)
- **Quality Score**: Composite quality metric (0-100)

#### Validation Metrics

- **Status**: Pass or fail from last validation
- **Last Run**: Timestamp of last validation
- **Level**: RIPP level of validated packet

#### Workflow Metrics

- **Completion %**: Overall workflow progress (0-100)
- **Steps Completed**: Count of completed vs total steps
- **Step Status**: Individual status for each workflow step

### Report Format

When using `--report`, metrics are written to `.ripp/metrics.json`:

```json
{
  "timestamp": "2025-12-22T19:15:44.570Z",
  "evidence": {
    "status": "built",
    "file_count": 127,
    "total_size": 2456789,
    "coverage_percent": 85,
    "last_build": "2025-12-22T19:10:00.000Z"
  },
  "discovery": {
    "status": "completed",
    "candidate_count": 5,
    "avg_confidence": 0.78,
    "quality_score": 65,
    "model": "gpt-4o"
  },
  "validation": {
    "status": "pass",
    "last_run": "2025-12-22T19:20:10.000Z",
    "level": 2
  },
  "workflow": {
    "completion_percent": 100,
    "steps_completed": 5,
    "steps_total": 5,
    "steps": {
      "initialized": true,
      "evidence_built": true,
      "discovery_run": true,
      "checklist_generated": true,
      "artifacts_built": true
    }
  }
}
```

### History Tracking

With `--history`, view trends across multiple runs:

```
RIPP Metrics History
============================================================

Recent Trends (last 10 runs):

Evidence Coverage:
  12/22/2025, 7:00:00 PM    ████████████████ 80%
  12/22/2025, 7:10:00 PM    █████████████████ 85%
  12/22/2025, 7:15:00 PM    █████████████████ 85%

Discovery Quality Score:
  12/22/2025, 7:05:00 PM    ████████████ 60/100
  12/22/2025, 7:12:00 PM    █████████████ 65/100
  12/22/2025, 7:15:00 PM    █████████████ 65/100

Workflow Completion:
  12/22/2025, 7:00:00 PM    ████████ 40%
  12/22/2025, 7:10:00 PM    ████████████████ 80%
  12/22/2025, 7:15:00 PM    ████████████████████ 100%
```

### Use Cases

- **CI/CD Integration**: Track workflow completion in automated builds
- **Quality Monitoring**: Verify discovery confidence meets thresholds
- **Debugging**: Identify which workflow steps failed or are incomplete
- **Progress Tracking**: Monitor RIPP adoption across team

### Exit Codes

- `0` — Metrics gathered successfully
- `1` — RIPP directory not initialized (run `ripp init` first)

---

## `ripp doctor`

**vNext Feature** — Run health checks and diagnostics for your RIPP setup.

### Purpose

Diagnoses common setup issues and provides actionable fix-it commands with documentation links. Useful for troubleshooting failed workflows or verifying environment configuration.

### What It Does

- ✅ Checks Node.js version (>= 20.0.0 required)
- ✅ Verifies Git repository exists
- ✅ Checks RIPP directory structure (`.ripp/`)
- ✅ Validates configuration file (`config.yaml`)
- ✅ Checks evidence pack status
- ✅ Verifies intent candidates exist
- ✅ Confirms intent artifact status
- ✅ Tests RIPP schema accessibility
- ✅ Displays CLI version
- ✅ Provides fix-it commands for failed checks

### What It Never Does

- ❌ Modifies any files
- ❌ Sends data externally
- ❌ Requires network access
- ❌ Includes secrets or PII in output

### Usage

```bash
# Run all health checks
ripp doctor
```

### Example Output

```
🔍 RIPP Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Node.js Version: Node.js v20.19.6

✓ Git Repository: Git repository detected

✓ RIPP Directory: .ripp directory exists

✓ Configuration: config.yaml present

⚠ Evidence Pack: Evidence pack not built
  → Fix: Build evidence: ripp evidence build
  → Docs: https://dylan-natter.github.io/ripp-protocol/getting-started.html#step-2-build-evidence

✓ Intent Candidates: 3 candidate(s) found

⚠ Confirmed Intent: Intent not confirmed
  → Fix: Confirm intent: ripp confirm --checklist (then ripp build --from-checklist)
  → Docs: https://dylan-natter.github.io/ripp-protocol/getting-started.html#step-4-confirm-intent

✓ RIPP Schema: RIPP schema accessible

✓ CLI Version: ripp-cli v1.0.1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Next Steps:

  All critical checks passed. Address warnings to improve workflow.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For more help: https://dylan-natter.github.io/ripp-protocol/getting-started.html
```

### Health Checks

#### 1. Node.js Version

- **Status**: ✓ Pass if >= 20.0.0, ✗ Fail otherwise
- **Fix**: Install Node.js 20 or later from https://nodejs.org/

#### 2. Git Repository

- **Status**: ✓ Pass if `.git/` exists, ✗ Fail otherwise
- **Fix**: `git init` to initialize repository

#### 3. RIPP Directory

- **Status**: ✓ Pass if `.ripp/` exists, ✗ Fail otherwise
- **Fix**: `ripp init` to initialize RIPP

#### 4. Configuration

- **Status**: ✓ Pass if `config.yaml` exists, ⚠ Warning otherwise
- **Fix**: `ripp init` to create default config

#### 5. Evidence Pack

- **Status**: ✓ Pass if evidence built, ⚠ Warning otherwise
- **Fix**: `ripp evidence build` to scan repository

#### 6. Intent Candidates

- **Status**: ✓ Pass if candidates exist, ⚠ Warning otherwise
- **Fix**: `ripp discover` (requires AI enabled)

#### 7. Confirmed Intent

- **Status**: ✓ Pass if intent confirmed, ⚠ Warning otherwise
- **Fix**: `ripp confirm --checklist` then `ripp build --from-checklist`

#### 8. RIPP Schema

- **Status**: ✓ Pass if schema accessible, ⚠ Warning otherwise
- **Note**: Schema loaded from repository when needed

#### 9. CLI Version

- **Status**: ✓ Always pass
- **Info**: Displays installed CLI version

### Use Cases

- **Troubleshooting**: Identify missing setup steps or failed workflows
- **Onboarding**: Verify new team members have correct environment
- **CI/CD**: Pre-flight checks before running RIPP workflows
- **Support**: Generate diagnostic output for issue reports

### Exit Codes

- `0` — All checks passed (or only warnings)
- `1` — One or more critical checks failed

---

## Expected Behavior in Monorepos

The RIPP CLI supports monorepo structures:

### Workspace Root Detection

The CLI searches upward from the current directory to find the repository root:

- ✅ Looks for `.git/` directory
- ✅ Looks for `package.json` with `workspaces` field
- ✅ Uses current directory if no root found

### Validation in Monorepos

```bash
# Validate all RIPP packets in the monorepo
ripp validate .

# Validate specific workspace
cd packages/auth
ripp validate .

# Validate all workspaces from root
ripp validate packages/*/ripp/
```

### GitHub Action in Monorepos

The generated `.github/workflows/ripp-validate.yml` works in monorepos:

```yaml
- name: Validate all RIPP packets
  run: ripp validate .
```

It finds all `*.ripp.yaml` and `*.ripp.json` files in the repository.

---

## Exit Codes Summary

| Command         | Success | Failure                                   |
| --------------- | ------- | ----------------------------------------- |
| `ripp init`     | `0`     | `1` (file write error)                    |
| `ripp validate` | `0`     | `1` (validation failures)                 |
| `ripp lint`     | `0`     | `1` (errors, or warnings with `--strict`) |
| `ripp package`  | `0`     | `1` (validation or packaging error)       |
| `ripp analyze`  | `0`     | `1` (analysis failure)                    |
| `ripp evidence` | `0`     | `1` (build failed)                        |
| `ripp discover` | `0`     | `1` (AI not enabled, discovery failed)    |
| `ripp confirm`  | `0`     | `1` (confirmation failed)                 |
| `ripp build`    | `0`     | `1` (build failed, validation failed)     |
| `ripp metrics`  | `0`     | `1` (RIPP directory not initialized)      |
| `ripp doctor`   | `0`     | `1` (critical health checks failed)       |

---

## Environment Variables

### RIPP vNext (Intent Discovery Mode)

| Variable                | Purpose                               | Required For             |
| ----------------------- | ------------------------------------- | ------------------------ |
| `RIPP_AI_ENABLED`       | Enable AI at runtime (must be `true`) | `ripp discover`          |
| `OPENAI_API_KEY`        | OpenAI API key                        | `ripp discover` (OpenAI) |
| `AZURE_OPENAI_API_KEY`  | Azure OpenAI API key                  | `ripp discover` (Azure)  |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint URL             | `ripp discover` (Azure)  |
| `RIPP_AI_PROVIDER`      | Override AI provider (optional)       | `ripp discover`          |
| `RIPP_AI_MODEL`         | Override AI model (optional)          | `ripp discover`          |
| `RIPP_AI_ENDPOINT`      | Custom AI endpoint (optional)         | `ripp discover` (custom) |

**Note:** AI features require dual opt-in:

1. `ai.enabled: true` in `.ripp/config.yaml`
2. `RIPP_AI_ENABLED=true` environment variable

If either is false, AI features are disabled.

---

## Next Steps

- See [Getting Started](Getting-Started) for installation guide
- Read [Validation Rules](Validation-Rules) for validation behavior
- Check [GitHub Integration](GitHub-Integration) for CI/CD setup
- Review [Schema Reference](Schema-Reference) for packet structure
