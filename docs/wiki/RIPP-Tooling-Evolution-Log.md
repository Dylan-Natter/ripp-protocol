# RIPP Tooling & Evolution Log

**This is a design and decision log for RIPP tooling development.**

---

## Purpose of This Wiki

This wiki serves as a **decision log** for tooling extensions, design discussions, and evolution of the RIPP ecosystem. It documents the "why" behind tooling choices and captures context for future contributors.

### What This Wiki Is

- A historical record of design decisions
- A discussion space for proposed tooling extensions
- A log of implementation rationale and trade-offs
- A collaborative workspace for contributors

### What This Wiki Is NOT

- **NOT a specification**: The specification lives in `SPEC.md` and `schema/ripp-1.0.schema.json`
- **NOT authoritative**: If wiki content conflicts with schema, code, or public docs, the wiki is wrong
- **NOT a protocol definition**: RIPP protocol behavior is defined in the main repository only

---

## Hierarchy of Truth

When information conflicts across sources, this is the order of authority:

1. **JSON Schema** (`schema/ripp-1.0.schema.json`) — Defines packet structure
2. **SPEC.md** — Defines protocol semantics and requirements
3. **Code** (validators, CLI) — Implements the specification
4. **Public Documentation** (`README.md`, `docs/`) — User-facing API
5. **Wiki** — Design notes and decision log (lowest authority)

**Note on Schema vs. Specification Conflicts**: If the JSON Schema and SPEC.md conflict on structural requirements, the schema takes precedence for validation. If they conflict on semantic meaning or protocol behavior, SPEC.md takes precedence. In practice, these should always be aligned; conflicts indicate a bug that must be resolved.

If the wiki contradicts any of the above, **the wiki is wrong** and should be corrected.

---

## Initial Entry: Adding Tooling in a Backward-Compatible, Additive Way

**Date**: 2025-12-14  
**Context**: RIPP v1.0 is stable and in production use. The community has requested additional tooling to enhance workflows.

### Intent

Add tooling capabilities (linting, packaging, analysis) to RIPP while preserving the protocol as a stable, trusted specification.

### Guardrails Established

To prevent tooling from destabilizing the protocol, we have established:

1. **Extension Guardrails** (`docs/EXTENSIONS.md`)
   - Defines what "additive extension" means
   - Establishes clear boundaries for tooling behavior
   - Prohibits tooling from mutating source packets or guessing intent

2. **AI Contributor Guidelines** (`.github/copilot-instructions.md`)
   - Instructs automated contributors to preserve existing behavior
   - Requires additive-only changes
   - Enforces backward compatibility

3. **Documentation Stability**
   - Documentation is treated as a public API
   - Changes must be additive only
   - No rewrites of existing concepts

### Principles

- **Protocol First**: RIPP is a specification, tooling second
- **Additive Only**: Enhancements, not replacements
- **Backward Compatibility**: Existing packets must remain valid
- **Read-Only Tooling**: Validators, linters, and packagers never mutate source files
- **Extractive Analysis**: Analyzers extract observable facts, never invent intent

### Next Steps

Future tooling additions will be logged here with:

- Rationale for the feature
- How it maintains backward compatibility
- Design trade-offs considered
- Implementation notes

---

## How to Use This Wiki

### For Contributors

- Document your design decisions here before implementing
- Link to RFC discussions or issues
- Capture trade-offs and alternatives considered
- Update entries when implementations diverge from original plans

### For Maintainers

- Review wiki entries during code review
- Ensure alignment with `docs/EXTENSIONS.md` guardrails
- Flag conflicts between wiki and authoritative sources
- Archive outdated entries rather than deleting them

### For Users

- Understand the reasoning behind tooling choices
- See historical context for current behavior
- Propose new tooling extensions with design rationale

---

## Contribution Guidelines

When adding to this wiki:

1. **Be clear about status**: Mark proposals as "Draft", "Under Discussion", "Approved", or "Implemented"
2. **Link to authoritative sources**: Reference SPEC.md, schema, or code where applicable
3. **Timestamp entries**: Include date for historical context
4. **Preserve history**: Archive, don't delete, when decisions change
5. **Defer to authority**: If unsure, reference SPEC.md or schema, not the wiki

---

**Remember:** This wiki documents decisions. The specification defines behavior.
