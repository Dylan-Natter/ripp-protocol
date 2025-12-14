---
layout: default
title: 'Getting Started with RIPP'
---

## Getting Started with RIPP

This guide will help you create your first RIPP packet in under 10 minutes.

---

## What You'll Need

- A text editor (VS Code, Sublime, Vim, etc.)
- Basic understanding of YAML or JSON
- A feature or API to document

**Optional:**

- Node.js (for the validator CLI)
- Git (for version control)

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

## Need Help?

- **Examples**: See [real-world RIPP packets]({{ '/examples' | relative_url }})
- **Specification**: Read the [full RIPP spec]({{ '/spec' | relative_url }})
- **FAQ**: Check the [frequently asked questions]({{ '/faq' | relative_url }})
- **Community**: Open an [issue on GitHub](https://github.com/Dylan-Natter/ripp-protocol/issues)

---

**Ready to build with clarity?** Create your first RIPP packet today.
