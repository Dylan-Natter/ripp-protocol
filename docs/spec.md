---
layout: default
title: 'RIPP v1.0 Specification'
---

> This page mirrors the [SPEC.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/SPEC.md) from the repository.

---

# RIPP v1.0 Specification

**Regenerative Intent Prompting Protocol**

**Version**: 1.0.0  
**Status**: Stable  
**Date**: 2025-12-13

---

## Abstract

The Regenerative Intent Prompting Protocol (RIPP) is a structured format for capturing feature requirements, system design decisions, and implementation contracts in a machine-readable, human-reviewable format. RIPP packets serve as executable specifications that preserve original intent while enabling rapid iteration, automated validation, and safe production deployment.

For the complete specification, see the [SPEC.md on GitHub](https://github.com/Dylan-Natter/ripp-protocol/blob/main/SPEC.md).

---

## Quick Reference

### Required Metadata

```yaml
ripp_version: '1.0'
packet_id: 'unique-feature-identifier'
title: 'Brief feature title'
created: '2025-12-13'
updated: '2025-12-13'
status: 'draft | approved | implemented | deprecated'
level: 1 | 2 | 3
```

### Level 1 Sections (Minimum)

- **Purpose**: Problem, solution, value
- **UX Flow**: Step-by-step user/system interaction
- **Data Contracts**: Input and output data structures

### Level 2 Sections (Add to Level 1)

- **API Contracts**: Endpoints, methods, request/response formats
- **Permissions**: Who can do what
- **Failure Modes**: What can go wrong and how to handle it

### Level 3 Sections (Add to Level 2)

- **Audit Events**: What gets logged
- **Non-Functional Requirements**: Performance, scalability, security
- **Acceptance Tests**: How to verify correctness

---

## Core Concepts

### What RIPP Is

RIPP is a **specification format** for documenting features, APIs, and system changes. A RIPP packet is a structured document that describes what a feature does, how it works, what can go wrong, and how to verify it.

### What RIPP Is Not

- **Not a project management tool**: RIPP documents features, not timelines
- **Not a code generator**: RIPP is a specification; code generation is optional
- **Not framework-specific**: RIPP is language and platform agnostic

### Why RIPP Exists

Modern software development faces **intent erosion**: ideas conceived with clear purpose often degrade during implementation. RIPP solves this by making the feature specification the **primary artifact**.

---

## File Naming Conventions

RIPP packet files must follow this convention:

```
<feature-identifier>.ripp.{yaml|json}
```

Examples:

- `user-authentication.ripp.yaml`
- `payment-processing.ripp.json`
- `multi-tenant-data-isolation.ripp.yaml`

---

## Validation

All RIPP packets must validate against the JSON Schema:

```bash
ripp validate <file-or-directory>
```

Exit codes:

- `0`: All packets valid
- `1`: Validation failures found

Schema location: [schema/ripp-1.0.schema.json](https://github.com/Dylan-Natter/ripp-protocol/blob/main/schema/ripp-1.0.schema.json)

---

## Protocol Status

**v1.0 Stable** — The RIPP v1.0 specification is stable and ready for production use.

---

## Design Principles

1. **Explicit over implicit**: All requirements must be written down
2. **Reviewable before buildable**: Specs are reviewed before code
3. **Machine-readable, human-first**: Structure serves humans, not parsers
4. **Fail-safe defaults**: Encourage secure and resilient patterns
5. **Progressive disclosure**: Start simple, add rigor as needed

---

## Full Specification

For the complete, detailed specification including all section requirements, validation rules, and normative references, see:

**[SPEC.md on GitHub →](https://github.com/Dylan-Natter/ripp-protocol/blob/main/SPEC.md)**

---

## Related Resources

- [Getting Started]({{ '/getting-started' | relative_url }})
- [RIPP Levels Explained]({{ '/ripp-levels' | relative_url }})
- [Examples]({{ '/examples' | relative_url }})
- [Schema Documentation]({{ '/schema' | relative_url }})
