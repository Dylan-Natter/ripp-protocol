# RIPP - Regenerative Intent Prompting Protocol

This directory contains RIPP (Regenerative Intent Prompting Protocol) packets for this repository.

## What is RIPP?

RIPP is a **structured specification format** for capturing feature requirements, design decisions, and implementation contracts in a machine-readable, human-reviewable format.

A RIPP packet is a YAML or JSON document that describes:

- **What** a feature does and **why** it exists
- **How** users interact with it
- **What data** it produces and consumes
- **Who** can do what (permissions)
- **What can go wrong** and how to handle it
- **How to verify** correctness (acceptance tests)

**Key Benefits:**

- Preserve original intent during implementation
- Create reviewable, versioned contracts
- Enable automated validation
- Bridge prototyping and production teams
- Prevent intent erosion and undocumented assumptions

## What RIPP is NOT

**RIPP is not a code migration tool:**

- Does not transform prototype code into production code
- Does not provide refactoring or modernization capabilities
- Does not attempt lift-and-shift operations

**RIPP is not a code generator:**

- RIPP is a specification format, not a code generation framework
- While tools MAY generate code from RIPP packets, this is optional
- RIPP does not prescribe implementation details

**RIPP is not a production hardening helper:**

- Does not scan code for vulnerabilities
- Does not inject security controls into existing code
- Does not automatically make prototype code production-ready

## Directory Structure

```
ripp/
├── README.md                  # This file
├── .gitignore                 # Ignores generated packages
├── features/                  # Work-in-progress RIPP packets (development, may contain TODOs)
│   ├── auth-login.ripp.yaml
│   ├── user-profile.ripp.yaml
│   └── ...
├── handoffs/                  # Validated, approved RIPP packets ready for delivery
│   ├── sample.ripp.yaml
│   └── ...
└── packages/                  # Generated output formats (.zip, .md, .json) [gitignored]
    ├── handoff.zip
    ├── sample.md
    └── ...
```

## Workflow

### 1. Create new packets in `features/`

Place your work-in-progress RIPP packets in `ripp/features/` with the naming convention:

```
<feature-name>.ripp.yaml
```

Example: `auth-login.ripp.yaml`

### 2. Minimum required structure (Level 1)

```yaml
ripp_version: '1.0'
packet_id: auth-login
title: User Authentication and Login
created: 2024-01-15
updated: 2024-01-15
status: draft
level: 1

purpose:
  problem: 'Users need a secure way to authenticate and access their accounts'
  solution: 'Implement JWT-based authentication with email/password login'
  value: 'Enables secure user access and personalized experiences'

ux_flow:
  - step: 'User navigates to login page'
  - step: 'User enters email and password'
  - step: 'System validates credentials'
  - step: 'User is redirected to dashboard'

data_contracts:
  inputs:
    - name: email
      type: string
      format: email
      required: true
    - name: password
      type: string
      required: true
  outputs:
    - name: auth_token
      type: string
      description: 'JWT access token'
```

### 3. Validate your packets

```bash
# Validate all packets in features/
ripp validate ripp/features/

# Validate a specific file
ripp validate ripp/features/auth-login.ripp.yaml

# Enforce minimum conformance level
ripp validate ripp/features/ --min-level 2
```

### 4. Lint for best practices

```bash
ripp lint ripp/features/
ripp lint ripp/features/ --strict
```

### 5. Move validated packets to `handoffs/`

When a packet is validated and approved, move it to the handoffs directory:

```bash
mv ripp/features/my-feature.ripp.yaml ripp/handoffs/
```

### 6. Package for delivery

```bash
# Package a single packet
ripp package --in ripp/handoffs/my-feature.ripp.yaml --out ripp/packages/handoff.md

# Package to JSON
ripp package --in ripp/handoffs/my-feature.ripp.yaml --out ripp/packages/packaged.json
```

### 7. Deliver the package

Share the generated files in `ripp/packages/` with receiving teams or upload to artifact repositories.

## Validation

This repository includes automated RIPP validation via GitHub Actions.

Every pull request that modifies RIPP files will be automatically validated.

## RIPP Levels

RIPP supports three conformance levels:

- **Level 1**: Basic (purpose, ux_flow, data_contracts)
- **Level 2**: Standard (adds api_contracts, permissions, failure_modes)
- **Level 3**: Complete (adds audit_events, nfrs, acceptance_tests)

Choose the level appropriate for your feature's complexity and criticality.

## Resources

- **CLI Documentation**: `ripp --help`
- **Protocol Website**: https://dylan-natter.github.io/ripp-protocol
- **GitHub Repository**: https://github.com/Dylan-Natter/ripp-protocol
- **Issues & Support**: https://github.com/Dylan-Natter/ripp-protocol/issues

---

**Write specs first. Ship with confidence.**
