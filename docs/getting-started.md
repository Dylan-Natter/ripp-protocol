---
layout: default
title: 'Getting Started with RIPP'
---

## Getting Started with RIPP

This guide will help you create your first RIPP packet in under 10 minutes.

RIPP is designed to feel familiar if you've worked with user stories, API specs, or technical design documents. The difference is that RIPP brings all of these into one structured, validated format that preserves intent from concept to production.

**New to RIPP?** Start by understanding what RIPP is (and is not): **[RIPP Category Documentation](category/)**

**If you're coming from Agile:** Think of RIPP as the detailed specification that follows your user story. The user story defines "what" and "why" at a high level; RIPP adds "how," "who can," "what if," and "how to verify."

**If you're building with AI assistance:** RIPP is the contract you write before prompting an AI to generate code. It ensures the generated implementation has clear boundaries, security requirements, and failure handling.

---

## What You'll Need

- A text editor (VS Code, Sublime, Vim, etc.)
- Basic understanding of YAML or JSON
- A feature or API to document

## What You'll Need

- A text editor (VS Code, Sublime, Vim, etc.)
- Basic understanding of YAML or JSON
- A feature or API to document

**Optional (but recommended):**

- Node.js (for the RIPP CLI validator)
- Git (for version control)

---

## Quick Start: Initialize RIPP in Your Repository

The fastest way to get started is with the RIPP CLI:

```bash
# Install RIPP CLI
npm install -g ripp-cli

# Initialize RIPP in your repository
ripp init
```

This creates:

- `ripp/` directory for your RIPP packets
- `ripp/intent/` for feature specifications (human-authored)
- `ripp/output/handoffs/` for validated packets (ready for delivery)
- `ripp/output/packages/` for packaged outputs
- `.ripp/` for configuration and workflow state
- `.github/workflows/ripp-validate.yml` for automated validation

**What you get:**

- ✅ Proper directory structure
- ✅ GitHub Actions for CI/CD validation
- ✅ Documentation and examples
- ✅ Clear separation of source vs generated content

**[📖 Learn more about directory structure →](directory-layout.md)**

Now skip to **Step 4** to create your first RIPP packet.

---

## Manual Setup (Without CLI)

If you prefer to set up manually:

1. Create a directory for RIPP packets (e.g., `ripp/` or `specs/`)
2. Choose your naming convention (e.g., `*.ripp.yaml`)
3. Set up your text editor with the RIPP schema (optional, see [Tooling]({{ '/tooling' | relative_url }}))

---

## Two Paths to RIPP

### Path 1: Spec-First (Traditional)

Write a RIPP packet BEFORE writing any code:

1. Draft RIPP packet describing the feature
2. Review with your team
3. Approve the specification
4. Implement code to match the RIPP spec
5. Validate against acceptance tests

**Best for**: New features with clear requirements, high-risk features, team collaboration

### Path 2: Prototype-First (AI-Assisted)

Start with a rapid prototype and extract the specification:

1. Build a working prototype (AI-generated or rapid development)
2. Run RIPP extraction to generate a draft specification
3. Review the draft, fill gaps, resolve conflicts
4. Approve the refined RIPP packet
5. Rebuild for production using RIPP as the contract

**Best for**: Rapid exploration, AI-assisted development, validating ideas quickly

**Learn more**: See [From Prototype to Production]({{ '/prototype-to-production' | relative_url }}) for the complete prototype extraction workflow.

---

## Step 1: Understand the Basics

A RIPP packet is a structured specification for a single feature or API. It includes:

- **Metadata**: Version, ID, title, status, level
- **Purpose**: Why the feature exists and what it solves
- **UX Flow**: How users or systems interact with it
- **Data Contracts**: What data is consumed and produced

For higher-risk features, you can add API contracts, permissions, failure modes, audit events, NFRs, and acceptance tests.

---

## Step 2: Choose Your RIPP Level

RIPP defines three conformance levels. Choose based on your feature's risk and complexity:

| Level       | When to Use                                            | Required Sections                                   |
| ----------- | ------------------------------------------------------ | --------------------------------------------------- |
| **Level 1** | Simple features, internal tools, low risk              | Purpose, UX Flow, Data Contracts                    |
| **Level 2** | Production features, customer-facing APIs              | Level 1 + API Contracts, Permissions, Failure Modes |
| **Level 3** | High-risk features (payments, auth, PII, multi-tenant) | Level 2 + Audit Events, NFRs, Acceptance Tests      |

**Start with Level 1.** You can always upgrade to Level 2 or 3 later.

---

## Step 3: Copy the Template

Download or copy the [RIPP template](https://github.com/Dylan-Natter/ripp-protocol/blob/main/templates/feature-packet.ripp.template.yaml):

```bash
curl -O https://raw.githubusercontent.com/Dylan-Natter/ripp-protocol/main/templates/feature-packet.ripp.template.yaml
```

Or create a new file `my-feature.ripp.yaml` and paste the template.

---

## Step 4: Fill Out the Metadata

Start by filling out the basic metadata:

```yaml
ripp_version: '1.0'
packet_id: 'user-profile-update'
title: 'User Profile Update Feature'
created: '2025-12-13'
updated: '2025-12-13'
status: 'draft'
level: 1
```

**Tips:**

- Use kebab-case for `packet_id` (lowercase, hyphens)
- Use ISO 8601 dates (YYYY-MM-DD)
- Start with `status: "draft"` until reviewed

---

## Step 5: Define the Purpose

Why does this feature exist? What problem does it solve?

```yaml
purpose:
  problem: 'Users cannot update their profile information after registration'
  solution: 'Provide a profile editing form with server-side validation'
  value: 'Improves user experience and data accuracy'
```

**Optional:** Add `out_of_scope`, `assumptions`, and `references` if helpful.

---

## Step 6: Document the UX Flow

How do users interact with this feature? List each step:

```yaml
ux_flow:
  - step: 1
    actor: 'User'
    action: 'Navigates to profile settings page'
    trigger: "Clicks 'Edit Profile' button"
  - step: 2
    actor: 'User'
    action: 'Updates name and email fields'
    result: 'Form shows real-time validation'
  - step: 3
    actor: 'User'
    action: 'Submits form'
    trigger: "Clicks 'Save Changes'"
  - step: 4
    actor: 'System'
    action: 'Validates and saves changes'
    result: 'User sees success message'
```

**Tips:**

- Each step needs `actor` and `action`
- Include at least one of: `trigger`, `result`, or `condition`

---

## Step 7: Define Data Contracts

What data does this feature accept and return?

```yaml
data_contracts:
  inputs:
    - name: 'ProfileUpdateRequest'
      fields:
        - name: 'name'
          type: 'string'
          required: true
          description: "User's display name"
        - name: 'email'
          type: 'string'
          required: true
          description: "User's email address"
          format: 'email'
  outputs:
    - name: 'ProfileUpdateResponse'
      fields:
        - name: 'user_id'
          type: 'string'
          required: true
          description: 'UUID of the user'
        - name: 'updated_at'
          type: 'string'
          required: true
          description: 'Timestamp of last update'
```

**Tips:**

- Each field needs `name`, `type`, `required`, and `description`
- Valid types: `string`, `number`, `integer`, `boolean`, `object`, `array`

---

## Step 8: Validate Your Packet

Install the RIPP CLI:

```bash
npm install -g ripp-cli
```

Validate your packet:

```bash
ripp validate my-feature.ripp.yaml
```

If validation passes, you'll see:

```
✓ my-feature.ripp.yaml is valid (Level 1)
```

If there are errors, the validator will tell you what's missing or incorrect.

---

## Step 9: Review and Approve

1. Commit your RIPP packet to version control
2. Share it with your team for review
3. Make any requested changes
4. Update the status to `approved`:

```yaml
status: 'approved'
updated: '2025-12-13'
```

---

## Step 10: Implement the Feature

Now you can write code. The RIPP packet is your spec. As you implement:

- Ensure your code matches the data contracts
- Handle the UX flow as documented
- Update the RIPP packet if you discover the spec needs changes

When done, update the status:

```yaml
status: 'implemented'
```

---

## Next Steps

**Add Level 2 sections** if your feature is customer-facing:

- API Contracts: Define endpoints, methods, request/response formats
- Permissions: Document who can do what
- Failure Modes: What can go wrong and how to handle it

**Add Level 3 sections** for high-risk features:

- Audit Events: What gets logged
- NFRs: Performance, scalability, security requirements
- Acceptance Tests: How to verify correctness

---

## Common Patterns

### For APIs

Use Level 2. Define API contracts with endpoints, methods, and error codes.

### For Multi-Tenant Features

Use Level 3. Document tenant isolation in permissions and failure modes.

### For Payment Features

Use Level 3. Include audit events for compliance and NFRs for PCI requirements.

### For Internal Tools

Use Level 1. Keep it simple unless there are security concerns.

---

## Tips for Success

1. **Write the RIPP packet first**, before any code
2. **Review as a team** — catch issues early
3. **Keep it accurate** — update the packet if implementation deviates
4. **Validate in CI** — automate RIPP validation in your pipeline
5. **Version with code** — commit RIPP packets alongside source code

---

## Working with Prototypes

### From Prototype to RIPP

If you've already built a working prototype (especially with AI assistance), you can extract a RIPP specification:

**Conceptual workflow** (RIPP Extractor tooling is conceptual, not yet fully implemented):

```bash
# Generate draft RIPP from prototype (future tooling)
ripp extract --code ./src --input ./README.md --output feature.ripp.yaml

# Review the generated draft
cat feature.ripp.yaml

# Fill in gaps and resolve conflicts
# (Edit the file to add missing permissions, failure modes, etc.)

# Validate the refined packet
ripp validate feature.ripp.yaml

# Approve and use as production specification
```

### What Gets Extracted

From your prototype code:

- API endpoints and methods (from route definitions)
- Data structures (from request/response handling)
- User flows (from UI components and handlers)
- Error handling (from try/catch blocks)

From your inputs (README, prompts, notes):

- Purpose and problem statement
- Intended value and use cases
- Stated requirements and constraints

### What You Must Add

Extraction cannot infer:

- **Permissions**: Who can access what, and under which conditions
- **Multi-tenancy**: Tenant isolation and boundary enforcement
- **Audit requirements**: What must be logged for compliance
- **Security constraints**: Encryption, validation rules, rate limits

These must be specified explicitly before production.

### Evidence and Confidence

Generated RIPP packets include optional metadata showing:

- **`evidence_map`**: Which code files/functions support each section
- **`confidence`**: How certain the extraction is (high/medium/low/unknown)
- **`open_questions`**: Conflicts, gaps, or unresolved decisions

Review these carefully and resolve before approving.

### When to Use Prototype-First

✅ **Good fit**:

- Rapid idea validation with AI-generated prototypes
- Exploring feasibility before committing to full spec
- Converting existing PoC code into formal specifications

❌ **Not ideal**:

- High-security features (write spec first)
- Regulated environments requiring upfront compliance review
- Unclear or experimental ideas (prototype may be too unstable)

**Learn more**: [From Prototype to Production: RIPP as an Intent Compiler]({{ '/prototype-to-production' | relative_url }})

---

## Need Help?

- **Examples**: See [real-world RIPP packets]({{ '/examples' | relative_url }})
- **Specification**: Read the [full RIPP spec]({{ '/spec' | relative_url }})
- **FAQ**: Check the [frequently asked questions]({{ '/faq' | relative_url }})
- **Community**: Open an [issue on GitHub](https://github.com/Dylan-Natter/ripp-protocol/issues)

---

**Ready to build with clarity?** Create your first RIPP packet today.
