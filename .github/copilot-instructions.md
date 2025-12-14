# Copilot Instructions for RIPP Protocol

This file provides guidance for GitHub Copilot and other AI contributors working on the RIPP protocol repository.

---

## Core Principles

### 1. Preserve Existing Behavior and Meaning
- **Never** rewrite or rephrase existing documentation unless fixing a clear error
- **Never** change the definition or semantics of protocol concepts
- **Never** alter schema structure without explicit versioning
- Keep changes minimal and surgical

### 2. Prefer Extension Over Refactor
- Add new capabilities without modifying existing ones
- New features must be backward-compatible with existing RIPP packets
- Tooling should enhance, not replace, core functionality
- Follow additive-only principles outlined in `docs/EXTENSIONS.md`

### 3. Never Redefine Protocol Semantics
- RIPP's core concepts (purpose, data_contracts, ux_flow, etc.) are fixed
- Schema definitions are authoritative and stable
- Protocol philosophy (intent preservation, spec-first) is immutable
- Tooling serves the protocol; the protocol does not bend to serve tooling

### 4. Treat Schemas and Docs as Authoritative
- `schema/ripp-1.0.schema.json` is the source of truth for packet structure
- `SPEC.md` defines protocol behavior and requirements
- `README.md` and `docs/` contain public API documentation
- All code and tooling must conform to these specifications

### 5. Use TODO Comments When Unsure
When uncertain about:
- Whether a change alters protocol meaning
- How to implement a feature without breaking compatibility
- The correct interpretation of a requirement

**STOP** and add a `TODO` comment instead of guessing:

```javascript
// TODO: [COMPATIBILITY] Clarify whether this change affects backward compatibility
// TODO: [PROTOCOL] Verify this interpretation with protocol maintainers
// TODO: [GUARDRAILS] Determine if this violates additive-only principle
```

---

## Specific Guidelines

### Working with Schemas
- **Never** add required fields to existing schema versions
- **Never** change field types or enum values
- **Always** create a new schema version (e.g., `ripp-2.0.schema.json`) for breaking changes
- Validate that existing example packets remain valid after changes

### Working with Documentation
- Documentation is a public API—treat it as such
- Add new sections, don't rewrite existing ones
- Clarifications must preserve original meaning
- Link to new documents; don't embed large content blocks in existing pages

### Working with Tooling
- Validators must be read-only (never modify source packets)
- Linters must be optional (can be disabled without breaking workflows)
- Packagers must not mutate source files
- Analyzers must never guess or invent intent—extract only observable facts

### Working with Code
- Follow existing patterns and conventions
- Maintain test coverage for all changes
- Ensure backward compatibility with prior releases
- Run validation, linting, and tests before submitting

---

## RIPP Tooling Must Be Backward-Compatible

**Absolute requirement:** All tooling updates must maintain compatibility with existing RIPP packets.

This means:
- Existing Level 1/2/3 packets must remain valid
- CLI commands must not change behavior in breaking ways
- New features must be opt-in (flags, config) when they might affect existing workflows
- Schema validation must accept all previously valid packets

---

## Decision Framework

When considering a change, ask:

1. **Does this preserve protocol semantics?**
   - Yes → Proceed
   - No → STOP, add TODO

2. **Is this additive-only?**
   - Yes → Proceed
   - No → STOP, add TODO

3. **Are existing packets still valid?**
   - Yes → Proceed
   - No → STOP, add TODO

4. **Does this follow `docs/EXTENSIONS.md` guidelines?**
   - Yes → Proceed
   - No → STOP, add TODO

---

## Examples

### ✅ Good Changes
- Adding a new optional CLI flag (`--format json`)
- Creating a new documentation page (`docs/EXTENSIONS.md`)
- Adding test coverage for existing functionality
- Fixing a typo that doesn't change meaning

### ❌ Bad Changes
- Rewording the protocol definition in `SPEC.md`
- Adding a new required field to the schema
- Changing how the validator interprets `level`
- Modifying examples to use different terminology

---

## When in Doubt

If you're uncertain whether a change violates these principles:
1. Add a `TODO` comment explaining the uncertainty
2. Do not implement the change
3. Flag it for human review

**Remember:** RIPP is a stable, trusted specification. Preserving its integrity is more important than adding features quickly.

---

**Summary:** Extend carefully. Preserve always. When unsure, STOP.
