# RIPP vNext — Intent Discovery Mode

**Status**: Released  
**Version**: 1.0  
**Backward Compatible**: Yes (strict superset of RIPP v1)

---

## Overview

RIPP vNext introduces **Intent Discovery Mode**, an optional, trust-first workflow that makes RIPP dramatically easier to adopt for:

- **Brownfield and legacy repositories** — extract intent from existing code
- **Prototype-first tools** (Spark, Replit, Bolt, v0) — bridge prototype to production
- **Teams without fully-defined specs** — discover intent iteratively with AI assistance

### Core Principle

**Intent Discovery Mode is additive and optional.**

- Existing RIPP v1 workflows continue unchanged
- All vNext features require explicit opt-in
- AI usage is disabled by default and requires dual enablement (repo config + runtime env var)
- Human confirmation is mandatory before any AI-inferred content becomes canonical

---

## Workflow

The Intent Discovery Mode workflow consists of four deterministic steps:

```
Evidence Build → AI Discovery → Human Confirmation → Canonical Build
```

### Step 1: Build Evidence Pack

Scan your repository to extract high-signal facts:

```bash
ripp evidence build
```

**What it does:**

- Scans files matching configured glob patterns
- Extracts dependencies, routes, schemas, auth signals, workflows
- Applies best-effort secret redaction
- Produces `.ripp/evidence/evidence.index.json`

**Outputs:**

- `.ripp/evidence/evidence.index.json` — Evidence pack index with all extracted facts
- File hashes and metadata for provenance

**Guardrails:**

- Read-only operation (never modifies source)
- Secrets are redacted (best-effort; always review before sharing)
- Configurable via `.ripp/config.yaml`

### Step 2: Discover Candidate Intent (AI-Assisted, Optional)

Use AI to infer candidate RIPP sections from evidence:

```bash
# Enable AI in .ripp/config.yaml first
# Set ai.enabled: true

# Then run discovery with AI enabled at runtime
RIPP_AI_ENABLED=true ripp discover --target-level 2
```

**What it does:**

- Reads evidence pack (never raw repo)
- Uses configured AI provider to infer RIPP sections
- Assigns confidence scores (0.0–1.0)
- Links each candidate to source evidence
- Validates output structure with retry loop

**Outputs:**

- `.ripp/intent.candidates.yaml` — AI-inferred candidates requiring human confirmation

**Candidate structure:**

```yaml
version: '1.0'
created: '2025-12-16T08:40:00Z'
generatedBy:
  provider: openai
  model: gpt-4o-mini
  evidencePackHash: abc123...

candidates:
  - section: purpose
    source: inferred
    confidence: 0.85
    requires_human_confirmation: true
    evidence:
      - file: src/api/users.js
        line: 11
        snippet: "router.get('/users/:id', authenticate, async (req, res) => {"
    content:
      problem: 'Users need to access their profile data'
      solution: 'Provide authenticated API endpoint for user profile retrieval'
      value: 'Enables personalized user experiences'
```

**Guardrails:**

- AI is disabled by default
- Requires `ai.enabled: true` in `.ripp/config.yaml` AND `RIPP_AI_ENABLED=true` env var
- All candidates must have:
  - `source: inferred`
  - `confidence: 0.0–1.0`
  - `evidence: [...]` (at least one reference)
  - `requires_human_confirmation: true`
- AI NEVER infers permissions, tenancy, or audit requirements (security-critical)
- Schema validation with feedback loop (up to `maxRetries`)

### Step 3: Confirm Candidate Intent (Human Required)

Review and approve AI-inferred candidates:

**Interactive mode (default):**

```bash
ripp confirm
```

**Markdown checklist mode:**

```bash
ripp confirm --checklist
# Edit .ripp/intent.checklist.md manually
```

**What it does:**

- Presents each candidate for review
- Captures human approval/rejection decisions
- Records confirmation metadata (timestamp, user)

**Outputs:**

- `.ripp/intent.confirmed.yaml` — Human-confirmed intent ready for compilation
- `.ripp/intent.rejected.yaml` — Rejected candidates (optional, for audit trail)

**Confirmed structure:**

```yaml
version: '1.0'
confirmed:
  - section: purpose
    source: confirmed
    confirmed_at: '2025-12-16T09:15:00Z'
    confirmed_by: 'developer@example.com'
    original_confidence: 0.85
    evidence: [...]
    content:
      problem: '...'
      solution: '...'
      value: '...'
```

**Guardrails:**

- Every confirmed block must have `source: confirmed` and `confirmed_at`
- Original confidence and evidence preserved for traceability
- Rejected candidates tracked separately (audit trail)

### Step 4: Build Canonical Artifacts (Deterministic)

Compile confirmed intent into canonical RIPP packets:

```bash
ripp build --packet-id my-feature --title "My Feature"
```

**What it does:**

- Reads `.ripp/intent.confirmed.yaml`
- Assembles canonical RIPP packet from confirmed blocks
- Validates against RIPP schema
- Generates consolidated handoff document

**Outputs:**

- `.ripp/handoff.ripp.yaml` — Canonical RIPP packet (schema-validated)
- `.ripp/handoff.ripp.md` — Human-readable handoff document

**Guardrails:**

- Deterministic: same confirmed intent → same output
- Schema-validated before writing
- Provenance metadata included (source, timestamps, confidence)
- Backward compatible with RIPP v1 validators

---

## Configuration

Configuration lives in `.ripp/config.yaml` (created by `ripp init`).

### Example Configuration

```yaml
rippVersion: '1.0'

ai:
  enabled: false # Master switch (disabled by default)
  provider: openai # openai | azure-openai | ollama | custom
  model: gpt-4o-mini
  maxRetries: 3 # Retry loop for schema validation
  timeout: 30000 # Request timeout (ms)

evidencePack:
  includeGlobs:
    - 'src/**'
    - 'app/**'
    - 'api/**'
    - 'db/**'
    - '.github/workflows/**'
  excludeGlobs:
    - '**/node_modules/**'
    - '**/dist/**'
    - '**/*.lock'
    - '**/.git/**'
    - '**/vendor/**'
    - '**/.ripp/**'
  maxFileSize: 1048576 # 1MB

discovery:
  minConfidence: 0.5 # Filter candidates below this confidence
  includeEvidence: true # Include evidence references in candidates
```

### Configuration Precedence

1. **Defaults** (built-in)
2. **Repository config** (`.ripp/config.yaml`)
3. **Environment variables** (runtime overrides)

**Environment Variables:**

- `RIPP_AI_ENABLED` — Must be `true` to enable AI (even if `ai.enabled: true` in config)
- `RIPP_AI_PROVIDER` — Override provider
- `RIPP_AI_MODEL` — Override model
- `RIPP_AI_ENDPOINT` — Custom endpoint
- `OPENAI_API_KEY` — Required for OpenAI provider
- `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT` — Required for Azure provider

**AI Enablement Rules:**

- If `ai.enabled: false` in config, AI is **ALWAYS OFF** (env vars ignored)
- If `ai.enabled: true` in config, AI requires `RIPP_AI_ENABLED=true` at runtime
- This dual-gate prevents accidental AI usage in CI or automated workflows

---

## AI Providers

RIPP vNext supports pluggable AI providers.

### Supported Providers

| Provider       | Config Value   | Required Env Vars                               | Status         |
| -------------- | -------------- | ----------------------------------------------- | -------------- |
| OpenAI         | `openai`       | `OPENAI_API_KEY`                                | ✅ Implemented |
| Azure OpenAI   | `azure-openai` | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT` | ⚠️ Planned     |
| Ollama (local) | `ollama`       | None (uses `http://localhost:11434`)            | ⚠️ Planned     |
| Custom         | `custom`       | `RIPP_AI_ENDPOINT`                              | ⚠️ Planned     |

### Provider Interface

All providers implement the `AIProvider` interface:

```javascript
class AIProvider {
  async inferIntent(evidencePack, options) {
    // Returns candidate intent with confidence scores
  }

  isConfigured() {
    // Returns true if provider is properly configured
  }
}
```

**Custom Provider Example:**

```yaml
ai:
  enabled: true
  provider: custom
  customEndpoint: https://my-ai-service.example.com/infer
```

---

## Schemas

RIPP vNext introduces additional schemas for new artifacts:

- **`.ripp/config.yaml`** — [ripp-config.schema.json](../schema/ripp-config.schema.json)
- **Evidence Pack** — [evidence-pack.schema.json](../schema/evidence-pack.schema.json)
- **Candidate Intent** — [intent-candidates.schema.json](../schema/intent-candidates.schema.json)
- **Confirmed Intent** — [intent-confirmed.schema.json](../schema/intent-confirmed.schema.json)

---

## Guardrails Summary

### AI Safety

- ✅ AI disabled by default
- ✅ Dual enablement required (config + runtime env var)
- ✅ All AI output marked as `source: inferred`
- ✅ Confidence scores mandatory
- ✅ Evidence references required
- ✅ Human confirmation mandatory before canonicalization
- ✅ Never infers security-critical fields (permissions, tenancy, audit)

### Data Integrity

- ✅ Evidence pack is read-only
- ✅ Secrets redacted (best-effort)
- ✅ File hashes for provenance
- ✅ Deterministic compilation (confirmed intent → canonical packet)
- ✅ Schema validation enforced
- ✅ Backward compatible with RIPP v1

### Provenance

- ✅ All artifacts include source metadata
- ✅ Timestamps for all operations
- ✅ Original confidence scores preserved
- ✅ Evidence references maintained
- ✅ Rejected candidates tracked (audit trail)

---

## Example Workflow

### Scenario: Extracting intent from an existing Express.js API

**1. Initialize RIPP:**

```bash
ripp init
```

**2. Enable AI in `.ripp/config.yaml`:**

```yaml
ai:
  enabled: true
  provider: openai
  model: gpt-4o-mini
```

**3. Build evidence pack:**

```bash
ripp evidence build
```

Output:

```
✓ Evidence pack built successfully
  Files: 42
  Dependencies: 15
  Routes: 23
  Auth Signals: 8
```

**4. Discover candidate intent:**

```bash
OPENAI_API_KEY=sk-... RIPP_AI_ENABLED=true ripp discover --target-level 2
```

Output:

```
✓ Intent discovery complete
  Candidates: 12
  Output: .ripp/intent.candidates.yaml
```

**5. Review candidates:**

```bash
ripp confirm
```

Interactive prompt:

```
--- Candidate 1/12 ---
Section: purpose
Confidence: 87.5%

Content:
  problem: "Users need to authenticate to access protected resources"
  solution: "JWT-based authentication with email/password login"
  value: "Secure user access control"

Accept this candidate? (y/n/e/s): y
✓ Accepted
```

**6. Build canonical artifacts:**

```bash
ripp build --packet-id user-auth --title "User Authentication"
```

Output:

```
✓ Build complete
  RIPP Packet: .ripp/handoff.ripp.yaml
  Handoff MD: .ripp/handoff.ripp.md
  Level: 2
```

**7. Validate and package:**

```bash
ripp validate .ripp/handoff.ripp.yaml
ripp package --in .ripp/handoff.ripp.yaml --out handoff.md
```

---

## Backward Compatibility

RIPP vNext is a **strict superset** of RIPP v1:

- All v1 commands work unchanged (`init`, `validate`, `lint`, `package`, `analyze`)
- All v1 packets remain valid
- No breaking changes to schemas or workflows
- vNext features are opt-in only

### Migration from v1 to vNext

**No migration required.** Continue using v1 workflows.

**To adopt Intent Discovery Mode:**

1. Run `ripp init` (adds `.ripp/config.yaml`)
2. Configure AI provider (if using discovery)
3. Run vNext workflow as needed

---

## FAQ

**Q: Is AI required to use RIPP vNext?**

No. AI is optional and disabled by default. You can use the evidence pack builder without AI, or manually create RIPP packets as before.

**Q: How accurate is AI inference?**

AI inference provides candidate suggestions with confidence scores. It should be treated as a starting point, not truth. Always review and confirm candidates before using them.

**Q: Can I use RIPP vNext in CI?**

Yes. AI is disabled by default, preventing accidental AI usage in automated workflows. Evidence building and validation are deterministic and safe for CI.

**Q: What about secrets in evidence packs?**

Best-effort secret redaction is applied, but evidence packs may still contain sensitive snippets. Review before sharing. Consider excluding sensitive directories in `evidencePack.excludeGlobs`.

**Q: Can I edit candidates before confirming?**

Yes. Use `ripp confirm --checklist` to generate a markdown checklist, edit it manually, then proceed with build.

**Q: Does confirmed intent replace manual RIPP packet writing?**

No. Intent Discovery Mode is a workflow option, not a replacement. Teams can still write RIPP packets manually (Level 1-3) as before.

---

## Learn More

- [RIPP Specification](../SPEC.md)
- [Configuration Schema](../schema/ripp-config.schema.json)
- [Evidence Pack Schema](../schema/evidence-pack.schema.json)
- [GitHub Repository](https://github.com/Dylan-Natter/ripp-protocol)

---

**Intent Discovery Mode:** Build fast. Confirm carefully. Ship safely.
