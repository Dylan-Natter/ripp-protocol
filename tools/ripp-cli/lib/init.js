const fs = require('fs');
const path = require('path');

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
  const rippDir = path.join(process.cwd(), 'ripp');
  if (!fs.existsSync(rippDir)) {
    fs.mkdirSync(rippDir, { recursive: true });
    results.created.push('ripp/');
  } else {
    results.skipped.push('ripp/ (already exists)');
  }

  // 2. Create /ripp/README.md
  const rippReadmePath = path.join(rippDir, 'README.md');
  if (!fs.existsSync(rippReadmePath) || force) {
    const rippReadme = generateRippReadme();
    fs.writeFileSync(rippReadmePath, rippReadme);
    results.created.push('ripp/README.md');
  } else {
    results.skipped.push('ripp/README.md (already exists, use --force to overwrite)');
  }

  // 3. Create /ripp/features directory for feature RIPP files
  const featuresDir = path.join(rippDir, 'features');
  if (!fs.existsSync(featuresDir)) {
    fs.mkdirSync(featuresDir, { recursive: true });
    results.created.push('ripp/features/');
  } else {
    results.skipped.push('ripp/features/ (already exists)');
  }

  // 4. Create /ripp/features/.gitkeep
  const gitkeepPath = path.join(featuresDir, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
    results.created.push('ripp/features/.gitkeep');
  }

  // 5. Create /ripp/intent-packages directory
  const intentPackagesDir = path.join(rippDir, 'intent-packages');
  if (!fs.existsSync(intentPackagesDir)) {
    fs.mkdirSync(intentPackagesDir, { recursive: true });
    results.created.push('ripp/intent-packages/');
  } else {
    results.skipped.push('ripp/intent-packages/ (already exists)');
  }

  // 6. Create /ripp/intent-packages/README.md
  const intentReadmePath = path.join(intentPackagesDir, 'README.md');
  if (!fs.existsSync(intentReadmePath) || force) {
    const intentReadme = generateIntentPackageReadme();
    fs.writeFileSync(intentReadmePath, intentReadme);
    results.created.push('ripp/intent-packages/README.md');
  } else {
    results.skipped.push('ripp/intent-packages/README.md (already exists, use --force to overwrite)');
  }

  // 7. Create .github/workflows directory
  const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
  if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true });
    results.created.push('.github/workflows/');
  } else {
    results.skipped.push('.github/workflows/ (already exists)');
  }

  // 8. Create GitHub Action workflow
  const workflowPath = path.join(workflowsDir, 'ripp-validate.yml');
  if (!fs.existsSync(workflowPath) || force) {
    const workflow = generateGitHubActionWorkflow();
    fs.writeFileSync(workflowPath, workflow);
    results.created.push('.github/workflows/ripp-validate.yml');
  } else {
    results.skipped.push('.github/workflows/ripp-validate.yml (already exists, use --force to overwrite)');
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
├── features/                  # Feature RIPP packets
│   ├── auth-login.ripp.yaml
│   ├── user-profile.ripp.yaml
│   └── ...
└── intent-packages/           # Packaged RIPP artifacts for distribution
    ├── README.md
    ├── latest.tar.gz         # Latest package (symlink)
    └── archive/              # Previous versions
\`\`\`

## Creating RIPP Packets

### 1. Create a new packet

Place your RIPP packets in \`ripp/features/\` with the naming convention:

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

### 3. Validate your packet

\`\`\`bash
ripp validate ripp/features/auth-login.ripp.yaml
\`\`\`

### 4. Learn more

- **Full Specification**: https://github.com/Dylan-Natter/ripp-protocol/blob/main/SPEC.md
- **Schema Reference**: https://github.com/Dylan-Natter/ripp-protocol/blob/main/schema/ripp-1.0.schema.json
- **Examples**: https://github.com/Dylan-Natter/ripp-protocol/tree/main/examples
- **Documentation**: https://dylan-natter.github.io/ripp-protocol

## Validation

This repository includes automated RIPP validation via GitHub Actions.

Every pull request that modifies RIPP files will be automatically validated.

**Manual validation:**

\`\`\`bash
# Validate all RIPP files
ripp validate ripp/

# Validate a specific file
ripp validate ripp/features/my-feature.ripp.yaml

# Enforce minimum conformance level
ripp validate ripp/features/ --min-level 2
\`\`\`

## RIPP Levels

RIPP supports three conformance levels:

- **Level 1**: Basic (purpose, ux_flow, data_contracts)
- **Level 2**: Standard (adds api_contracts, permissions, audit_events)
- **Level 3**: Complete (adds failure_modes, nfrs, acceptance_tests)

Choose the level appropriate for your feature's complexity and criticality.

## Intent Packages

Intent Packages are packaged RIPP artifacts for distribution and handoff.

See \`ripp/intent-packages/README.md\` for details on creating and managing packages.

## Resources

- **CLI Documentation**: \`ripp --help\`
- **Protocol Website**: https://dylan-natter.github.io/ripp-protocol
- **GitHub Repository**: https://github.com/Dylan-Natter/ripp-protocol
- **Issues & Support**: https://github.com/Dylan-Natter/ripp-protocol/issues

---

**Write specs first. Ship with confidence.**
`;
}

function generateIntentPackageReadme() {
  return `# Intent Packages

This directory contains packaged RIPP artifacts for distribution and handoff between teams.

## What are Intent Packages?

Intent Packages are bundled collections of RIPP packets, schemas, and related artifacts that can be shared with:
- Production engineering teams
- External partners
- Downstream consumers
- Documentation systems

Each package is a snapshot of RIPP specifications at a point in time.

## Directory Structure

\`\`\`
intent-packages/
├── README.md           # This file
├── latest.tar.gz      # Symlink to most recent package
└── archive/           # Historical packages (keep last 3)
    ├── v1.0.0.tar.gz
    ├── v1.0.1.tar.gz
    └── v1.0.2.tar.gz
\`\`\`

## Creating a Package

### Manual Packaging

1. **Bundle your RIPP files:**

\`\`\`bash
# Create a timestamped package
tar -czf intent-packages/archive/v1.0.0.tar.gz ripp/features/*.ripp.yaml

# Update latest symlink
cd intent-packages
ln -sf archive/v1.0.0.tar.gz latest.tar.gz
\`\`\`

2. **Maintain only the last 3 packages:**

\`\`\`bash
# Remove old packages (keep only 3 most recent)
cd intent-packages/archive
ls -t *.tar.gz | tail -n +4 | xargs rm -f
\`\`\`

### Using RIPP CLI (if available)

\`\`\`bash
# Package a RIPP file
ripp package --in ripp/features/my-feature.ripp.yaml --out handoff.md

# Package to JSON
ripp package --in ripp/features/my-feature.ripp.yaml --out packaged.json
\`\`\`

## Stable Download Link

The \`latest.tar.gz\` symlink provides a stable download location:

\`\`\`bash
# Download latest package (via GitHub raw URL)
curl -L -O https://raw.githubusercontent.com/<org>/<repo>/main/ripp/intent-packages/latest.tar.gz

# Extract
tar -xzf latest.tar.gz
\`\`\`

Replace \`<org>\` and \`<repo>\` with your GitHub organization and repository names.

## Package Lifecycle

### Retention Policy

- **Keep**: Last 3 packages in \`archive/\`
- **Latest**: Always points to most recent
- **Remove**: Packages older than 3 versions

### Versioning

Use semantic versioning for package names:
- \`v1.0.0\` - Initial release
- \`v1.0.1\` - Minor updates
- \`v1.1.0\` - New features
- \`v2.0.0\` - Breaking changes

### When to Create a Package

Create a new package when:
- Releasing a major feature
- Significant RIPP updates
- Preparing for production handoff
- Archiving a stable snapshot

## Automation (Optional)

You can automate package creation using GitHub Actions:

\`\`\`yaml
# .github/workflows/package-ripp.yml
name: Package RIPP Intent

on:
  push:
    tags:
      - 'v*'

jobs:
  package:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Create package
        run: |
          mkdir -p ripp/intent-packages/archive
          tar -czf ripp/intent-packages/archive/\${GITHUB_REF_NAME}.tar.gz ripp/features/*.ripp.yaml
          cd ripp/intent-packages
          ln -sf archive/\${GITHUB_REF_NAME}.tar.gz latest.tar.gz
      
      - name: Commit package
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add ripp/intent-packages/
          git commit -m "Package RIPP intent: \${GITHUB_REF_NAME}"
          git push
\`\`\`

## Best Practices

1. **Validate before packaging**: Always run \`ripp validate\` before creating a package
2. **Tag releases**: Use Git tags to mark package creation points
3. **Document changes**: Include a changelog or release notes
4. **Clean up regularly**: Maintain the 3-package limit to avoid bloat
5. **Stable URLs**: Keep \`latest.tar.gz\` symlink for downstream consumers

## Consumption

Teams consuming Intent Packages can:

1. Download the latest package
2. Extract RIPP specifications
3. Validate against their environment
4. Implement features based on preserved intent

## Resources

- **RIPP CLI**: https://github.com/Dylan-Natter/ripp-protocol/tree/main/tools/ripp-cli
- **Packaging Guide**: https://dylan-natter.github.io/ripp-protocol/tooling
- **Protocol Spec**: https://github.com/Dylan-Natter/ripp-protocol/blob/main/SPEC.md

---

**Package intent. Preserve knowledge. Enable handoff.**
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
      
      - name: Install RIPP CLI
        run: npm install -g ripp-cli
      
      - name: Validate RIPP packets
        run: |
          if [ -d "ripp/features" ]; then
            echo "Validating RIPP packets in ripp/features/..."
            ripp validate ripp/features/
          else
            echo "No ripp/features directory found. Skipping validation."
          fi
      
      - name: Summary
        if: always()
        run: echo "✅ RIPP validation complete"
`;
}

module.exports = {
  initRepository,
  generateRippReadme,
  generateIntentPackageReadme,
  generateGitHubActionWorkflow
};
