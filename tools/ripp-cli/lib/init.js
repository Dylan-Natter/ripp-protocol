const fs = require('fs');
const path = require('path');
const { createDefaultConfig } = require('./config');

/**
 * Initialize RIPP in a repository
 * Creates scaffolding for RIPP artifacts, GitHub Actions, and Intent Packages
 */
function initRepository(options = {}) {
  const force = options.force || false;
  const results = {
    created: [],
    skipped: [],
    errors: []
  };

  // 1. Create /ripp directory
  try {
    const rippDir = path.join(process.cwd(), 'ripp');
    if (!fs.existsSync(rippDir)) {
      fs.mkdirSync(rippDir, { recursive: true });
      results.created.push('ripp/');
    } else {
      results.skipped.push('ripp/ (already exists)');
    }
  } catch (error) {
    results.errors.push(`Failed to create ripp/: ${error.message}`);
  }

  // 2. Create /ripp/README.md
  try {
    const rippDir = path.join(process.cwd(), 'ripp');
    const rippReadmePath = path.join(rippDir, 'README.md');
    if (!fs.existsSync(rippReadmePath) || force) {
      const rippReadme = generateRippReadme();
      fs.writeFileSync(rippReadmePath, rippReadme);
      results.created.push('ripp/README.md');
    } else {
      results.skipped.push('ripp/README.md (already exists, use --force to overwrite)');
    }
  } catch (error) {
    results.errors.push(`Failed to create ripp/README.md: ${error.message}`);
  }

  // 3. Create /ripp/features directory for feature RIPP files
  try {
    const rippDir = path.join(process.cwd(), 'ripp');
    const featuresDir = path.join(rippDir, 'features');
    if (!fs.existsSync(featuresDir)) {
      fs.mkdirSync(featuresDir, { recursive: true });
      results.created.push('ripp/features/');
    } else {
      results.skipped.push('ripp/features/ (already exists)');
    }
  } catch (error) {
    results.errors.push(`Failed to create ripp/features/: ${error.message}`);
  }

  // 4. Create /ripp/features/.gitkeep
  try {
    const rippDir = path.join(process.cwd(), 'ripp');
    const featuresDir = path.join(rippDir, 'features');
    const gitkeepPath = path.join(featuresDir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath) || force) {
      fs.writeFileSync(gitkeepPath, '');
      results.created.push('ripp/features/.gitkeep');
    } else {
      results.skipped.push('ripp/features/.gitkeep (already exists, use --force to overwrite)');
    }
  } catch (error) {
    results.errors.push(`Failed to create ripp/features/.gitkeep: ${error.message}`);
  }

  // 5. Create /ripp/handoffs directory (validated, ready-to-deliver packets)
  try {
    const rippDir = path.join(process.cwd(), 'ripp');
    const handoffsDir = path.join(rippDir, 'handoffs');
    if (!fs.existsSync(handoffsDir)) {
      fs.mkdirSync(handoffsDir, { recursive: true });
      results.created.push('ripp/handoffs/');
    } else {
      results.skipped.push('ripp/handoffs/ (already exists)');
    }
  } catch (error) {
    results.errors.push(`Failed to create ripp/handoffs/: ${error.message}`);
  }

  // 6. Create /ripp/handoffs/.gitkeep
  try {
    const rippDir = path.join(process.cwd(), 'ripp');
    const handoffsDir = path.join(rippDir, 'handoffs');
    const gitkeepPath = path.join(handoffsDir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath) || force) {
      fs.writeFileSync(gitkeepPath, '');
      results.created.push('ripp/handoffs/.gitkeep');
    } else {
      results.skipped.push('ripp/handoffs/.gitkeep (already exists, use --force to overwrite)');
    }
  } catch (error) {
    results.errors.push(`Failed to create ripp/handoffs/.gitkeep: ${error.message}`);
  }

  // 7. Create /ripp/packages directory (generated outputs, gitignored)
  try {
    const rippDir = path.join(process.cwd(), 'ripp');
    const packagesDir = path.join(rippDir, 'packages');
    if (!fs.existsSync(packagesDir)) {
      fs.mkdirSync(packagesDir, { recursive: true });
      results.created.push('ripp/packages/');
    } else {
      results.skipped.push('ripp/packages/ (already exists)');
    }
  } catch (error) {
    results.errors.push(`Failed to create ripp/packages/: ${error.message}`);
  }

  // 8. Create /ripp/packages/.gitkeep
  try {
    const rippDir = path.join(process.cwd(), 'ripp');
    const packagesDir = path.join(rippDir, 'packages');
    const gitkeepPath = path.join(packagesDir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath) || force) {
      fs.writeFileSync(gitkeepPath, '');
      results.created.push('ripp/packages/.gitkeep');
    } else {
      results.skipped.push('ripp/packages/.gitkeep (already exists, use --force to overwrite)');
    }
  } catch (error) {
    results.errors.push(`Failed to create ripp/packages/.gitkeep: ${error.message}`);
  }

  // 9. Create /ripp/.gitignore
  try {
    const rippDir = path.join(process.cwd(), 'ripp');
    const gitignorePath = path.join(rippDir, '.gitignore');
    if (!fs.existsSync(gitignorePath) || force) {
      const gitignoreContent = generateRippGitignore();
      fs.writeFileSync(gitignorePath, gitignoreContent);
      results.created.push('ripp/.gitignore');
    } else {
      results.skipped.push('ripp/.gitignore (already exists, use --force to overwrite)');
    }
  } catch (error) {
    results.errors.push(`Failed to create ripp/.gitignore: ${error.message}`);
  }

  // 10. Create .github/workflows directory
  try {
    const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
      results.created.push('.github/workflows/');
    } else {
      results.skipped.push('.github/workflows/ (already exists)');
    }
  } catch (error) {
    results.errors.push(`Failed to create .github/workflows/: ${error.message}`);
  }

  // 11. Create GitHub Action workflow
  try {
    const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
    const workflowPath = path.join(workflowsDir, 'ripp-validate.yml');
    if (!fs.existsSync(workflowPath) || force) {
      const workflow = generateGitHubActionWorkflow();
      fs.writeFileSync(workflowPath, workflow);
      results.created.push('.github/workflows/ripp-validate.yml');
    } else {
      results.skipped.push(
        '.github/workflows/ripp-validate.yml (already exists, use --force to overwrite)'
      );
    }
  } catch (error) {
    results.errors.push(`Failed to create .github/workflows/ripp-validate.yml: ${error.message}`);
  }

  // 12. Create .ripp/config.yaml (vNext)
  try {
    const configResult = createDefaultConfig(process.cwd(), { force });
    if (configResult.created) {
      results.created.push('.ripp/config.yaml');
    } else {
      results.skipped.push('.ripp/config.yaml (already exists, use --force to overwrite)');
    }
  } catch (error) {
    results.errors.push(`Failed to create .ripp/config.yaml: ${error.message}`);
  }

  return results;
}

function generateRippReadme() {
  return `# RIPP - Regenerative Intent Prompting Protocol

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

\`\`\`
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
\`\`\`

## Workflow

### 1. Create new packets in \`features/\`

Place your work-in-progress RIPP packets in \`ripp/features/\` with the naming convention:

\`\`\`
<feature-name>.ripp.yaml
\`\`\`

Example: \`auth-login.ripp.yaml\`

### 2. Minimum required structure (Level 1)

\`\`\`yaml
ripp_version: "1.0"
packet_id: auth-login
title: User Authentication and Login
created: 2024-01-15
updated: 2024-01-15
status: draft
level: 1

purpose:
  problem: "Users need a secure way to authenticate and access their accounts"
  solution: "Implement JWT-based authentication with email/password login"
  value: "Enables secure user access and personalized experiences"

ux_flow:
  - step: "User navigates to login page"
  - step: "User enters email and password"
  - step: "System validates credentials"
  - step: "User is redirected to dashboard"

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
      description: "JWT access token"
\`\`\`

### 3. Validate your packets

\`\`\`bash
# Validate all packets in features/
ripp validate ripp/features/

# Validate a specific file
ripp validate ripp/features/auth-login.ripp.yaml

# Enforce minimum conformance level
ripp validate ripp/features/ --min-level 2
\`\`\`

### 4. Lint for best practices

\`\`\`bash
ripp lint ripp/features/
ripp lint ripp/features/ --strict
\`\`\`

### 5. Move validated packets to \`handoffs/\`

When a packet is validated and approved, move it to the handoffs directory:

\`\`\`bash
mv ripp/features/my-feature.ripp.yaml ripp/handoffs/
\`\`\`

### 6. Package for delivery

\`\`\`bash
# Package a single packet
ripp package --in ripp/handoffs/my-feature.ripp.yaml --out ripp/packages/handoff.md

# Package to JSON
ripp package --in ripp/handoffs/my-feature.ripp.yaml --out ripp/packages/packaged.json
\`\`\`

### 7. Deliver the package

Share the generated files in \`ripp/packages/\` with receiving teams or upload to artifact repositories.

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

- **CLI Documentation**: \`ripp --help\`
- **Protocol Website**: https://dylan-natter.github.io/ripp-protocol
- **GitHub Repository**: https://github.com/Dylan-Natter/ripp-protocol
- **Issues & Support**: https://github.com/Dylan-Natter/ripp-protocol/issues

---

**Write specs first. Ship with confidence.**
`;
}

function generateRippGitignore() {
  return `# Generated packages (deliverables)
# These are built artifacts that should not be committed
packages/

# Keep directory structure
!.gitkeep
`;
}

function generateGitHubActionWorkflow() {
  return `name: Validate RIPP Packets

on:
  pull_request:
    paths:
      - 'ripp/**/*.ripp.yaml'
      - 'ripp/**/*.ripp.json'
  workflow_dispatch:

jobs:
  validate:
    name: Validate RIPP Packets
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate RIPP packets
        run: npm run ripp:validate
      
      - name: Summary
        if: always()
        run: echo "✅ RIPP validation complete"
`;
}

module.exports = {
  initRepository,
  generateRippReadme,
  generateRippGitignore,
  generateGitHubActionWorkflow
};
