# Versioning & Compatibility

This page explains how RIPP versions evolve and how to handle upgrades.

## RIPP Specification Versions

RIPP uses **semantic versioning**: `MAJOR.MINOR.PATCH`

**Current version:** `1.0`

### Version Number Meaning

| Component | Changes                                                   | Example           | Impact                        |
| --------- | --------------------------------------------------------- | ----------------- | ----------------------------- |
| **MAJOR** | Breaking changes to required sections or validation rules | `1.0` → `2.0`     | May require packet updates    |
| **MINOR** | New optional sections or backward-compatible additions    | `1.0` → `1.1`     | Existing packets remain valid |
| **PATCH** | Clarifications, documentation, non-normative updates      | `1.0.0` → `1.0.1` | No changes required           |

---

## Schema Versioning

Each RIPP version has a corresponding JSON Schema:

| RIPP Version | Schema File                   | Schema $id                                                                 |
| ------------ | ----------------------------- | -------------------------------------------------------------------------- |
| `1.0`        | `schema/ripp-1.0.schema.json` | `https://dylan-natter.github.io/ripp-protocol/schema/ripp-1.0.schema.json` |

**Future versions:**

| RIPP Version   | Schema File                   | Schema $id                                                                 |
| -------------- | ----------------------------- | -------------------------------------------------------------------------- |
| `2.0` (future) | `schema/ripp-2.0.schema.json` | `https://dylan-natter.github.io/ripp-protocol/schema/ripp-2.0.schema.json` |

---

## Backward Compatibility Guarantees

### Within a Major Version (1.x)

**Guaranteed:**

- ✅ All existing valid packets remain valid
- ✅ Validators accept packets with unknown optional fields
- ✅ New optional sections can be added
- ✅ Validation rules will not become stricter
- ❌ No new required sections without MAJOR version bump

**Example: 1.0 → 1.1 (hypothetical)**

If RIPP 1.1 adds an optional `observability` section:

```yaml
# RIPP 1.0 packet (still valid in 1.1)
ripp_version: '1.0'
packet_id: 'my-feature'
# ... existing sections ...

# RIPP 1.1 packet (new optional section)
ripp_version: '1.1'
packet_id: 'my-feature'
# ... existing sections ...
observability:        # New optional section
  metrics: [ ... ]
  traces: [ ... ]
```

**Result:**

- RIPP 1.0 packets validate against RIPP 1.1 schema
- RIPP 1.1 packets with `observability` are valid
- RIPP 1.0 packets without `observability` are still valid

---

### Across Major Versions (1.x → 2.x)

**Possible breaking changes:**

- ⚠️ New required sections may be added
- ⚠️ Existing required sections may change structure
- ⚠️ Validation rules may become stricter
- ⚠️ Field types or enums may change

**Guarantees:**

- ✅ Migration guide will be provided
- ✅ Tooling will support both versions during transition period
- ✅ Deprecated sections will be marked before removal

---

## Tooling Compatibility Expectations

### Validators

RIPP validators **MUST**:

- Validate against the schema version specified in `ripp_version`
- Accept packets with unknown optional fields (forward compatibility)
- Fail validation if required sections are missing
- Report errors clearly with field paths

RIPP validators **SHOULD**:

- Support multiple RIPP versions simultaneously (e.g., 1.0 and 2.0)
- Provide warnings for deprecated patterns
- Suggest upgrades when new RIPP versions are available

RIPP validators **MUST NOT**:

- Modify source packet files
- Assume defaults for missing required fields
- Silently ignore validation errors

---

### Linters

RIPP linters **MUST**:

- Operate independently of schema validation
- Check best practices beyond structural requirements
- Be optional (can be disabled without breaking workflows)

RIPP linters **SHOULD**:

- Provide actionable suggestions
- Support `--strict` mode (treat warnings as errors)
- Generate machine-readable reports

---

### Packagers

RIPP packagers **MUST**:

- Validate input packets before packaging
- Preserve all semantic information
- Be read-only (never modify source packets)

RIPP packagers **SHOULD**:

- Normalize packet structure (remove empty optional fields)
- Add packaging metadata (timestamp, tool version)
- Support multiple output formats (JSON, YAML, Markdown)

---

## Upgrade Strategy

### PATCH Upgrades (e.g., 1.0.0 → 1.0.1)

**What changes:** Documentation, clarifications, typo fixes

**Action required:** None. Existing packets remain valid.

**Example:**

- Updated SPEC.md with clearer examples
- Fixed typos in schema descriptions
- Clarified validation error messages

**Migration:** Not needed.

---

### MINOR Upgrades (e.g., 1.0 → 1.1)

**What changes:** New optional sections, backward-compatible additions

**Action required:** Optional. Adopt new features when useful.

**Example:**

- New optional `observability` section added
- New optional `security.threat_model` field added

**Migration:**

1. **Do nothing:** Existing packets remain valid
2. **Opt in:** Add new sections to packets that need them

**Recommended approach:**

- Review release notes for new features
- Adopt new sections incrementally
- No urgency to update existing packets

---

### MAJOR Upgrades (e.g., 1.x → 2.x)

**What changes:** Breaking changes, new required sections, schema restructuring

**Action required:** Update packets to conform to new schema

**Migration strategy:**

1. **Read migration guide** — Provided with each MAJOR release
2. **Run compatibility checker** — Tool identifies what needs updating
3. **Update packets incrementally** — Start with high-priority features
4. **Validate against new schema** — Ensure conformance
5. **Update `ripp_version` field** — Change from `1.0` to `2.0`

**Example migration (hypothetical 1.0 → 2.0):**

**Before (RIPP 1.0):**

```yaml
ripp_version: '1.0'
packet_id: 'my-feature'
level: 3
# ... existing sections ...
```

**After (RIPP 2.0):**

```yaml
ripp_version: '2.0'
packet_id: 'my-feature'
level: 3
# ... existing sections ...
# New required section in 2.0:
security:
  threat_model: [...]
```

---

## Individual Packet Versioning

RIPP packets themselves can be versioned independently of the RIPP spec:

### Using the `updated` Field

**Required field:** All RIPP packets must have an `updated` field.

```yaml
created: '2025-01-10'
updated: '2025-12-14' # Update this when packet changes
```

**Best practice:** Update this field whenever you modify the packet.

---

### Using the Optional `version` Field

**Optional field:** Packets can include a `version` field for explicit versioning.

```yaml
version: '2.1.0' # Semver recommended
```

**Use when:**

- ✅ Packet goes through multiple revisions
- ✅ Team wants explicit version tracking
- ✅ Packet is referenced by external systems

**Versioning approach (recommended):**

- **MAJOR:** Breaking changes to API contracts or data contracts
- **MINOR:** New optional fields, backward-compatible additions
- **PATCH:** Clarifications, typo fixes, documentation updates

**Example:**

```yaml
# Version 1.0.0
version: '1.0.0'
api_contracts:
  - endpoint: '/api/items'
    method: 'POST'
    # ... original contract ...

# Version 2.0.0 (breaking change: endpoint changed)
version: '2.0.0'
api_contracts:
  - endpoint: '/api/v2/items'  # Breaking change
    method: 'POST'
    # ... updated contract ...

# Version 2.1.0 (new optional field added)
version: '2.1.0'
api_contracts:
  - endpoint: '/api/v2/items'
    method: 'POST'
    # ... existing contract ...
data_contracts:
  inputs:
    - name: 'CreateItemRequest'
      fields:
        # ... existing fields ...
        - name: 'metadata'  # New optional field
          type: 'object'
          required: false
          description: 'Optional metadata'
```

---

### Using Git for Versioning

**Primary method:** Git commit history is the authoritative version history.

**Advantages:**

- ✅ Automatic tracking of all changes
- ✅ Diff-able (see exactly what changed)
- ✅ Blame attribution (who changed what and when)
- ✅ Branching and merging support

**Best practice:** Use semantic commit messages:

```bash
git commit -m "feat(item-creation): add bulk import to data contracts (BREAKING)"
git commit -m "fix(item-creation): clarify permission scope in API contracts"
git commit -m "docs(item-creation): add examples to acceptance tests"
```

---

## Tool Version Compatibility

### RIPP CLI Versions

The RIPP CLI follows semantic versioning and supports specific RIPP spec versions:

| CLI Version      | Supported RIPP Versions | Notes                    |
| ---------------- | ----------------------- | ------------------------ |
| `1.0.x`          | `1.0`                   | Initial release          |
| `1.1.x` (future) | `1.0`, `1.1`            | Backward compatible      |
| `2.0.x` (future) | `1.0`, `2.0`            | Migration tools included |

**Recommendation:** Pin CLI version in `package.json`:

```json
{
  "devDependencies": {
    "ripp-cli": "1.0.0"
  }
}
```

This ensures consistent validation across team and CI.

---

## Migration Checklist (for MAJOR upgrades)

When a new MAJOR version of RIPP is released:

- [ ] **Read release notes** — Understand what changed
- [ ] **Read migration guide** — Step-by-step instructions
- [ ] **Update CLI** — Install new version: `npm install -D ripp-cli@2.0.0`
- [ ] **Run compatibility check** — `ripp validate --compat-check` (hypothetical)
- [ ] **Identify breaking changes** — Which packets need updates?
- [ ] **Update high-priority packets** — Start with Level 3 packets
- [ ] **Validate incrementally** — Ensure each packet conforms
- [ ] **Update `ripp_version`** — Change from `1.0` to `2.0`
- [ ] **Update CI/CD** — Use new CLI version in GitHub Actions
- [ ] **Document migration** — Track what changed and why

---

## Deprecation Policy

When RIPP features are deprecated:

1. **Announcement** — Deprecated features are announced in release notes
2. **Warning period** — Validators emit warnings for 1+ MINOR versions
3. **Removal** — Features removed in next MAJOR version

**Example (hypothetical):**

| Version | Action                                                        |
| ------- | ------------------------------------------------------------- |
| `1.3`   | Deprecate `permissions.resource_scope` (warn but still valid) |
| `1.4`   | Continue warning                                              |
| `2.0`   | Remove `permissions.resource_scope` (breaking change)         |

**Migration guide provided:** Shows how to replace deprecated features.

---

## Version Detection

RIPP validators detect the version from the `ripp_version` field:

```yaml
ripp_version: '1.0' # Validator uses ripp-1.0.schema.json
```

**If version is missing or invalid:**

```
✗ /ripp_version: must be equal to constant
```

**Fix:**

```yaml
ripp_version: '1.0'
```

---

## Multi-Version Support in Monorepos

Monorepos may have packets at different RIPP versions during migration:

**Example:**

```
packages/
├── auth/
│   └── ripp/
│       └── oauth.ripp.yaml  # ripp_version: '2.0'
└── billing/
    └── ripp/
        └── subscriptions.ripp.yaml  # ripp_version: '1.0'
```

**Validation:**

```bash
ripp validate .  # Validates both 1.0 and 2.0 packets
```

**CLI behavior:**

- Validates each packet against its declared `ripp_version`
- No errors if versions differ
- Upgrade at your own pace

---

## Summary

| Upgrade Type | Impact                        | Action Required    | Frequency        |
| ------------ | ----------------------------- | ------------------ | ---------------- |
| **PATCH**    | Documentation, clarifications | None               | As needed        |
| **MINOR**    | New optional features         | Optional adoption  | Every few months |
| **MAJOR**    | Breaking changes              | Required migration | Yearly or less   |

**Philosophy:** RIPP evolves carefully. Existing packets remain valid within MAJOR versions. Breaking changes are rare and well-communicated.

---

## Next Steps

- Read [RIPP Specification](RIPP-Specification) for current version details
- See [Schema Reference](Schema-Reference) for field documentation
- Check [Contributing to RIPP](Contributing-to-RIPP) for proposing changes
