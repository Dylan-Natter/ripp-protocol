# VS Code Extension

This page documents the RIPP Protocol VS Code extension and its capabilities.

## What the Extension Does

The RIPP Protocol VS Code extension is a **thin wrapper** around the official RIPP CLI. It provides:

- ✅ Command palette integration for RIPP commands
- ✅ One-click validation and linting
- ✅ Repository initialization
- ✅ Packet packaging and analysis
- ❌ **NOT** a reimplementation of validation logic
- ❌ **NOT** an auto-fix or code generation tool

**Philosophy:** The extension invokes the CLI. All logic lives in the CLI. No surprises.

---

## Available Commands

All commands are accessible via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

### RIPP: Initialize Repository

**What it does:**
- Runs `ripp init` in your workspace root
- Creates `ripp/` directory structure
- Creates `.github/workflows/ripp-validate.yml`
- Creates documentation files

**When to use:**
- ✅ When adopting RIPP in a new or existing project
- ✅ To regenerate scaffolding files

**What it doesn't do:**
- ❌ Automatically run on extension installation
- ❌ Modify existing RIPP packets
- ❌ Generate feature specifications

---

### RIPP: Validate Packet(s)

**What it does:**
- Runs `ripp validate` on your workspace
- Finds all `*.ripp.yaml` and `*.ripp.json` files
- Reports validation results in the Output panel

**When to use:**
- ✅ After creating or editing a RIPP packet
- ✅ Before committing changes
- ✅ To verify schema conformance

**What it doesn't do:**
- ❌ Modify RIPP packet files
- ❌ Auto-fix validation errors
- ❌ Generate missing sections

**Output location:** View → Output → Select "RIPP"

---

### RIPP: Lint Packet(s)

**What it does:**
- Runs `ripp lint` on your workspace
- Checks best practices beyond schema validation
- Reports warnings and errors in the Output panel
- Generates lint reports in `reports/` directory

**When to use:**
- ✅ Before marking a RIPP packet as `approved`
- ✅ To catch placeholder text (TODO, TBD)
- ✅ To verify `schema_ref` consistency

**What it doesn't do:**
- ❌ Modify RIPP packet files
- ❌ Auto-fix lint warnings
- ❌ Fail builds (unless `--strict` mode enabled)

---

### RIPP: Package Handoff

**What it does:**
- Prompts for input RIPP packet file
- Prompts for output file path and format
- Runs `ripp package --in <input> --out <output>`
- Creates normalized handoff artifact (Markdown, JSON, or YAML)

**When to use:**
- ✅ Creating handoff documentation for production teams
- ✅ Archiving approved specifications
- ✅ Generating stakeholder-friendly documentation

**What it doesn't do:**
- ❌ Modify source RIPP packet file (read-only operation)
- ❌ Generate code from RIPP packets
- ❌ Deploy or publish artifacts

---

### RIPP: Analyze Project (Draft Packet)

**What it does:**
- Prompts for input file (OpenAPI spec or JSON Schema)
- Prompts for output RIPP packet file path
- Runs `ripp analyze` to generate a DRAFT packet
- Creates packet with TODO markers for human review

**When to use:**
- ✅ Bootstrapping RIPP from existing API documentation
- ✅ Extracting data contracts from schemas
- ✅ Starting point for formalization

**What it doesn't do:**
- ❌ Modify existing RIPP packets
- ❌ Guess intent, business logic, or failure modes
- ❌ Produce production-ready packets (always DRAFT)

**⚠️ Important:** Generated packets require human review before use.

---

## Validate vs Init UX Separation

The extension enforces a **clear separation** between read-only and write operations:

### Read-Only Commands

- `RIPP: Validate Packet(s)`
- `RIPP: Lint Packet(s)`

These commands:
- ✅ Never modify files
- ✅ Can be run safely at any time
- ✅ Provide feedback only

### Write Commands (Explicit)

- `RIPP: Initialize Repository`
- `RIPP: Package Handoff`
- `RIPP: Analyze Project (Draft Packet)`

These commands:
- ⚠️ Create new files
- ⚠️ Require user confirmation (file picker dialogs)
- ✅ Never modify existing RIPP packets

**No auto-fix, no surprises.**

---

## Codespaces Compatibility

The extension works in **GitHub Codespaces** with proper setup.

### Setup for Codespaces

**Option 1: Add RIPP CLI to devDependencies**

In your `package.json`:

```json
{
  "devDependencies": {
    "ripp-cli": "^1.0.0"
  }
}
```

Then run `npm install` in your Codespace.

**Option 2: Install RIPP CLI in Codespace**

```bash
npm install -D ripp-cli
```

**Option 3: Global install in Codespace**

```bash
npm install -g ripp-cli
```

### How It Works

1. Extension checks for `ripp-cli` in `node_modules/.bin/`
2. If not found, falls back to `npx ripp` (slower, requires network)
3. Commands execute via the CLI

**Recommendation:** Use Option 1 (devDependency) for best performance.

---

## Security and Safety Guarantees

The extension is designed with security and safety in mind:

### Read-Only Validation

- ✅ **Validate** and **Lint** commands never modify RIPP packet files
- ✅ All validation happens locally via the CLI
- ✅ No data is sent to external servers
- ✅ No network access required (if RIPP CLI is installed locally)

### No Credentials Collected

- ✅ Extension does not collect or store credentials
- ✅ No secrets, tokens, or environment variables are accessed
- ✅ No telemetry or analytics sent to external services

### Explicit Writes Only

Commands that write files require explicit user action:

- `RIPP: Initialize Repository` — User must invoke via command palette
- `RIPP: Package Handoff` — User must select input/output files
- `RIPP: Analyze Project` — User must select input/output files

**No automatic or background file writes.**

### Local Processing

All RIPP operations happen locally:

- ✅ Validation runs via local CLI
- ✅ Linting runs via local CLI
- ✅ Packaging runs via local CLI
- ✅ Analysis runs via local CLI

**No data leaves your machine.**

---

## Platform Support

### Supported Operating Systems

- ✅ **Windows** — Uses `ripp.cmd` from `node_modules/.bin/`
- ✅ **macOS** — Uses `ripp` binary
- ✅ **Linux** — Uses `ripp` binary

### Supported Environments

- ✅ **VS Code Desktop** — Full support
- ✅ **GitHub Codespaces** — Full support (with RIPP CLI installed)
- ✅ **VS Code Remote Containers** — Full support (with RIPP CLI installed)
- ⚠️ **VS Code Web (vscode.dev)** — Requires Node.js environment with RIPP CLI

**Note:** VS Code Web support is limited. Use Codespaces or VS Code Desktop for best experience.

---

## How the Extension Invokes the CLI

The extension executes CLI commands using VS Code's terminal API:

```javascript
// Example (internal implementation)
const terminal = vscode.window.createTerminal('RIPP');
terminal.sendText('ripp validate .');
terminal.show();
```

**What this means:**

- ✅ You see the exact command being executed
- ✅ Output is streamed to the terminal (transparent)
- ✅ CLI version matches what you installed
- ✅ No hidden behavior or magic

---

## CLI Resolution Priority

The extension searches for the RIPP CLI in this order:

1. **Local `node_modules/.bin/ripp`** — Project-specific install
2. **Global `ripp`** — System-wide install
3. **`npx ripp`** — On-demand fetch (slowest)

**Recommendation:** Install locally (`npm install -D ripp-cli`) for best performance.

---

## Output Panel

All RIPP commands output to the **RIPP output channel**:

**To view:**

1. Open Output panel: `View → Output` (or `Ctrl+Shift+U`)
2. Select **RIPP** from the dropdown

**What you'll see:**

- Validation results
- Lint warnings and errors
- Packaging progress
- Analysis output
- Error messages

---

## Common Use Cases

### Daily Workflow

1. Edit RIPP packet in VS Code
2. Run `RIPP: Validate Packet(s)` (`Ctrl+Shift+P`)
3. Fix errors shown in Output panel
4. Run `RIPP: Lint Packet(s)` for best practices
5. Commit and push

### Initial Adoption

1. Open your project in VS Code
2. Run `RIPP: Initialize Repository`
3. Create first RIPP packet in `ripp/features/`
4. Run `RIPP: Validate Packet(s)`
5. Commit scaffolding and first packet

### Handoff to Production Team

1. Finalize RIPP packet (status: `approved`)
2. Run `RIPP: Package Handoff`
3. Select input: `ripp/features/my-feature.ripp.yaml`
4. Select output: `ripp/intent-packages/my-feature-handoff.md`
5. Share handoff document with production team

### Bootstrapping from OpenAPI

1. Have OpenAPI spec ready (e.g., `openapi.json`)
2. Run `RIPP: Analyze Project (Draft Packet)`
3. Select input: `openapi.json`
4. Select output: `ripp/features/draft-api.ripp.yaml`
5. Review and fill TODOs in generated packet
6. Run `RIPP: Validate Packet(s)`
7. Update status to `draft` → `approved` after review

---

## Troubleshooting

### Extension Commands Not Appearing

**Cause:** Extension not installed or not activated.

**Fix:**

1. Open Extensions (`Ctrl+Shift+X`)
2. Search for "RIPP Protocol"
3. Click Install
4. Reload VS Code if needed

---

### "Command 'ripp' not found"

**Cause:** RIPP CLI not installed.

**Fix:**

```bash
npm install -D ripp-cli
```

Or globally:

```bash
npm install -g ripp-cli
```

Then reload VS Code.

---

### Validation Output Not Showing

**Cause:** Output panel not set to RIPP channel.

**Fix:**

1. Open Output panel (`View → Output`)
2. Select **RIPP** from dropdown (top-right)

---

### Extension Slow in Codespaces

**Cause:** Using `npx ripp` (fetches CLI on each run).

**Fix:** Install RIPP CLI locally:

```bash
npm install -D ripp-cli
```

Reload Codespace window.

---

### Validate Passes Locally but Fails in CI

**Cause:** Different CLI versions.

**Fix:** Lock CLI version in `package.json`:

```json
{
  "devDependencies": {
    "ripp-cli": "1.0.0"
  }
}
```

Use same version in CI:

```yaml
- name: Install RIPP CLI
  run: npm ci
```

---

## Settings

Currently, the extension has **no configurable settings**. All behavior is determined by the RIPP CLI.

**Future settings (not yet implemented):**

- Custom RIPP CLI path
- Auto-validate on save
- Lint strictness level

---

## Comparison to CLI

| Feature | VS Code Extension | RIPP CLI |
|---------|-------------------|----------|
| **Validation** | Via command palette | Via terminal: `ripp validate` |
| **Linting** | Via command palette | Via terminal: `ripp lint` |
| **Initialization** | Via command palette | Via terminal: `ripp init` |
| **Packaging** | Via command palette | Via terminal: `ripp package` |
| **Analysis** | Via command palette | Via terminal: `ripp analyze` |
| **Output** | VS Code Output panel | Terminal stdout |
| **Error Handling** | Same (uses CLI) | Same |

**Key takeaway:** The extension is a convenience wrapper. The CLI is the source of truth.

---

## Privacy and Telemetry

- ✅ **No telemetry** — Extension does not collect usage data
- ✅ **No network requests** — All operations are local (except `npx` fallback)
- ✅ **No external APIs** — No communication with third-party services

**Your RIPP packets never leave your machine.**

---

## Summary

| Aspect | Guarantee |
|--------|-----------|
| **Read-only validation** | ✅ Never modifies source packets |
| **Local processing** | ✅ All operations happen locally |
| **No credentials collected** | ✅ No secrets or tokens accessed |
| **Explicit writes** | ✅ User must confirm all file writes |
| **CLI wrapper** | ✅ Extension delegates to official CLI |
| **Codespaces compatible** | ✅ Works with proper setup |

**Philosophy:** The extension serves you. You own your intent. No surprises.

---

## Next Steps

- Install the extension from the VS Code Marketplace (search for "RIPP Protocol")
- Read [Getting Started](Getting-Started) for RIPP basics
- See [CLI Reference](CLI-Reference) for command details
- Check [GitHub Integration](GitHub-Integration) for CI/CD setup
