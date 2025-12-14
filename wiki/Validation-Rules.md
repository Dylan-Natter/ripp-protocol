# Validation Rules

This page explains what RIPP validation enforces, how validation works, and how to fix common errors.

## What Validation Enforces

RIPP validation has two layers:

1. **Structural Validation** — Schema conformance, required fields, data types
2. **Semantic Validation** — Level conformance, internal consistency, best practices (via `ripp lint`)

---

## Structural vs Semantic Validation

### Structural Validation (`ripp validate`)

Enforces:

- ✅ All required metadata fields are present
- ✅ Field types match schema (string, number, boolean, etc.)
- ✅ Required sections exist for the declared level
- ✅ Date formats are valid ISO 8601
- ✅ `packet_id` follows kebab-case pattern
- ✅ `status` is one of: `draft`, `approved`, `implemented`, `deprecated`
- ✅ `level` is 1, 2, or 3
- ✅ File extension is `.ripp.yaml` or `.ripp.json`

**Example violations:**

```yaml
# Missing required field
purpose:
  problem: 'Users cannot do X'
  # ERROR: missing 'solution' and 'value'

# Wrong type
level: '3'  # ERROR: should be integer, not string

# Invalid status
status: 'in-progress'  # ERROR: not in allowed values

# Bad packet_id format
packet_id: 'My_Feature_123'  # ERROR: must be lowercase kebab-case
```

### Semantic Validation (`ripp lint`)

Checks for best practices:

- ⚠️ `purpose.out_of_scope` is missing (recommended)
- ⚠️ `purpose.assumptions` is missing (recommended)
- ⚠️ Placeholder text like "TODO" or "TBD" is present
- ⚠️ `schema_ref` references undefined entity in `data_contracts`
- ⚠️ Acceptance test verification is too vague
- ⚠️ Level 3 packet missing `nfrs.security` section

**Example violations:**

```yaml
# Placeholder text
purpose:
  problem: 'TODO: Define the problem'  # WARNING

# Undefined schema_ref
api_contracts:
  - endpoint: '/api/items'
    request:
      schema_ref: 'CreateItemRequest'  # WARNING if not in data_contracts.inputs

# Vague verification
acceptance_tests:
  - test_id: 'TC-001'
    verification:
      - 'It works'  # WARNING: too vague
```

---

## Validation Philosophy

RIPP validation is designed to:

### Fail Fast

Catch errors before code is written, not during implementation or production.

**Example:**

```
✗ user-auth.ripp.yaml
  • /permissions: must have required property 'action'
```

**Fix immediately** — Don't proceed with implementation until RIPP validates.

---

### Fail Clearly

Error messages include:

- ✅ File name
- ✅ JSON path to the error
- ✅ Clear description of the violation

**Example:**

```
✗ payment-processing.ripp.yaml
  • /data_contracts/inputs/0/fields/2: must have required property 'description'
  • /status: must be equal to one of the allowed values
  • Packet is Level 3, but missing section: audit_events
```

**What this tells you:**

1. Missing `description` field in the 3rd field of the 1st input entity
2. Invalid `status` value
3. Level 3 requires `audit_events`, but it's missing

---

### Never Guess

Validators report the problem but **never assume** what the fix should be.

**Anti-pattern (auto-fix):**

```yaml
# Before validation
purpose:
  problem: 'Users cannot do X'

# After auto-fix (BAD)
purpose:
  problem: 'Users cannot do X'
  solution: 'TODO'  # Syntactically valid, semantically useless
  value: 'TODO'
```

**RIPP approach:**

```
✗ my-feature.ripp.yaml
  • /purpose: must have required property 'solution'
  • /purpose: must have required property 'value'
```

**Human fixes it correctly:**

```yaml
purpose:
  problem: 'Users cannot do X'
  solution: 'Provide feature Y that enables X'
  value: 'Saves time, reduces errors'
```

---

## Common Validation Errors and Fixes

### Error: Missing Required Property

```
✗ /purpose: must have required property 'problem'
```

**Cause:** A required field in the `purpose` section is missing.

**Fix:**

```yaml
purpose:
  problem: 'Users cannot add items without manual database updates'
  solution: 'Provide web form and API endpoint'
  value: 'Enables self-service, reduces support tickets'
```

---

### Error: Invalid Status Value

```
✗ /status: must be equal to one of the allowed values
```

**Cause:** `status` is not one of: `draft`, `approved`, `implemented`, `deprecated`

**Fix:**

```yaml
status: 'approved'  # Use only allowed values
```

---

### Error: Invalid packet_id Format

```
✗ /packet_id: must match pattern "^[a-z0-9-]+$"
```

**Cause:** `packet_id` contains uppercase letters, underscores, or spaces.

**Fix:**

```yaml
# Before
packet_id: 'My_Feature_123'

# After
packet_id: 'my-feature-123'
```

---

### Error: Missing Level 2 Section

```
✗ Packet is Level 2, but missing section: permissions
```

**Cause:** Packet declares `level: 2` but doesn't include `permissions`.

**Fix:** Add the missing section:

```yaml
level: 2

# Add this:
permissions:
  - action: 'create:item'
    required_roles: ['admin', 'editor']
    description: 'User must have editor role to create items'
```

**Or** lower the level to 1 if permissions aren't needed yet.

---

### Error: Missing Level 3 Section

```
✗ Packet is Level 3, but missing section: audit_events
✗ Packet is Level 3, but missing section: nfrs
```

**Cause:** Packet declares `level: 3` but missing Level 3 sections.

**Fix:** Add missing sections:

```yaml
level: 3

audit_events:
  - event: 'item.created'
    severity: 'info'
    includes: ['user_id', 'item_id', 'timestamp']
    purpose: 'Track item creation for compliance'

nfrs:
  performance:
    response_time_p95: '200ms'
  security:
    encryption_at_rest: true
```

---

### Error: Date Format Invalid

```
✗ /created: must match format "date"
```

**Cause:** Date is not in ISO 8601 format (`YYYY-MM-DD`).

**Fix:**

```yaml
# Before
created: '12/14/2025'

# After
created: '2025-12-14'
```

---

### Error: At Least One Field Required

```
✗ /data_contracts: must have required property 'inputs' or 'outputs'
```

**Cause:** `data_contracts` has neither `inputs` nor `outputs`.

**Fix:** Add at least one:

```yaml
data_contracts:
  inputs:
    - name: 'Request'
      fields:
        - name: 'id'
          type: 'string'
          required: true
          description: 'Unique identifier'
```

---

### Error: Missing Field in UX Flow Step

```
✗ /ux_flow/0: must have required property 'trigger', 'result', or 'condition'
```

**Cause:** UX flow step has `step`, `actor`, and `action`, but none of the conditional fields.

**Fix:** Add at least one of `trigger`, `result`, or `condition`:

```yaml
ux_flow:
  - step: 1
    actor: 'User'
    action: 'Clicks button'
    trigger: 'User navigates to page'  # Add this
```

---

### Error: schema_ref References Undefined Entity

```
✗ api_contracts[0].request.schema_ref references 'CreateItemRequest', but it is not defined in data_contracts.inputs
```

**Cause:** API contract references an entity that doesn't exist in `data_contracts`.

**Fix:** Add the entity to `data_contracts`:

```yaml
data_contracts:
  inputs:
    - name: 'CreateItemRequest'  # Must match schema_ref
      fields:
        - name: 'item_name'
          type: 'string'
          required: true
          description: 'Name of the item'
```

---

### Warning: Placeholder Text Detected

```
⚠️ Contains placeholder text: "TODO"
```

**Cause:** RIPP packet contains "TODO", "TBD", or "example.com".

**Fix:** Replace placeholders with actual content:

```yaml
# Before
purpose:
  problem: 'TODO: Define the problem'

# After
purpose:
  problem: 'Users cannot manage inventory without manual database updates'
```

---

### Warning: Missing out_of_scope

```
⚠️ purpose.out_of_scope is missing (recommended for clarity)
```

**Cause:** `purpose.out_of_scope` is optional but recommended.

**Fix:** Add it to clarify boundaries:

```yaml
purpose:
  problem: 'Users cannot create items'
  solution: 'Provide item creation form'
  value: 'Self-service item management'
  out_of_scope: 'Bulk import, image upload, third-party integrations'
```

---

### Warning: Vague Acceptance Test Verification

```
⚠️ acceptance_tests[0].verification is too vague
```

**Cause:** Verification steps like "It works" or "Success" are too generic.

**Fix:** Be specific:

```yaml
# Before
verification:
  - 'Success'

# After
verification:
  - 'HTTP 201 response received'
  - 'Item ID is present in response body'
  - 'Item is retrievable via GET /api/items/{id}'
```

---

## Validation Workflow

### Local Development

1. Write or update RIPP packet
2. Run `ripp validate <file>`
3. Fix errors
4. Run `ripp lint <file>` (optional, best practices)
5. Fix warnings (or use `--strict` to treat warnings as errors)
6. Commit to git

### CI/CD

1. Developer opens PR with RIPP packet changes
2. GitHub Action runs `ripp validate .`
3. If validation fails, PR build fails
4. Developer fixes errors and pushes
5. Validation passes → PR approved → merged

---

## Exit Codes

| Command | Exit Code | Meaning |
|---------|-----------|---------|
| `ripp validate` | `0` | All packets valid |
| `ripp validate` | `1` | Validation failures |
| `ripp lint` | `0` | No errors (warnings allowed unless `--strict`) |
| `ripp lint` | `1` | Errors found, or warnings with `--strict` |

---

## Best Practices

### 1. Validate Early and Often

Run `ripp validate` after every significant change:

```bash
# After adding a section
ripp validate my-feature.ripp.yaml

# Before committing
ripp validate .
```

### 2. Use Linting in CI

Add both validation and linting to CI:

```yaml
- name: Validate RIPP Packets
  run: ripp validate .

- name: Lint RIPP Packets (strict)
  run: ripp lint . --strict
```

### 3. Fix Warnings Before Approval

Warnings indicate potential issues. Address them before marking RIPP packet as `approved`:

```bash
ripp lint my-feature.ripp.yaml
```

### 4. Enforce Minimum Level for Critical Features

Use `--min-level` for features that require higher assurance:

```bash
# Payment and auth features must be Level 3
ripp validate features/payments/ --min-level 3
```

### 5. Review Validation Output Carefully

Validation errors often reveal misunderstandings about the feature:

```
✗ Packet is Level 2, but missing section: permissions
```

**Question to ask:** Does this feature actually require permissions? If yes, add them. If no, lower the level.

---

## Summary

| Validation Type | Tool | Purpose | Fail Build? |
|----------------|------|---------|-------------|
| **Structural** | `ripp validate` | Schema conformance, required fields | ✅ Yes |
| **Semantic** | `ripp lint` | Best practices, placeholders, consistency | ⚠️ Only with `--strict` |

**Philosophy:** Validation catches errors. Humans fix them deliberately. No surprises.

---

## Next Steps

- Read [CLI Reference](CLI-Reference) for validation commands
- See [Schema Reference](Schema-Reference) for field requirements
- Check [GitHub Integration](GitHub-Integration) for CI/CD setup
