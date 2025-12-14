---
layout: default
title: "Examples"
---

## RIPP Packet Examples

Learn by example. These real-world RIPP packets demonstrate best practices at each conformance level.

---

## Level 3 Examples

### Item Creation Feature

A complete Level 3 RIPP packet for creating inventory items in a catalog system.

**Demonstrates:**
- Full data contracts with validation rules
- REST API specification
- RBAC permissions
- Comprehensive failure mode handling
- Audit logging for compliance
- Performance NFRs
- BDD-style acceptance tests

**[View: item-creation.ripp.yaml →](https://github.com/Dylan-Natter/ripp-protocol/blob/main/examples/item-creation.ripp.yaml)**

**Key Sections:**
```yaml
level: 3
api_contracts:
  - endpoint: "/api/v1/items"
    method: "POST"
    response:
      errors:
        - status: 409
          description: "SKU already exists"
nfrs:
  performance:
    response_time_p95: "300ms"
  security:
    encryption_at_rest: true
```

---

### Multi-Tenant Data Isolation

A Level 3 packet for implementing tenant-aware data access with row-level security.

**Demonstrates:**
- Organization-scoped permissions
- Security-critical failure modes
- Detailed audit events for access tracking
- Compliance requirements (SOC 2, GDPR)
- Cross-tenant access prevention
- Acceptance tests for security boundaries

**[View: multi-tenant-feature.ripp.yaml →](https://github.com/Dylan-Natter/ripp-protocol/blob/main/examples/multi-tenant-feature.ripp.yaml)**

**Key Sections:**
```yaml
level: 3
failure_modes:
  - scenario: "User attempts to access project from different organization"
    impact: "Potential data leak if not handled correctly"
    handling: "Return 403 Forbidden, log security event"
audit_events:
  - event: "tenant.isolation_violation_attempt"
    severity: "error"
    retention: "730 days"
```

---

## Level 2 Example

### Webhook Delivery System

An API-only feature (no UI) for reliable webhook delivery with retry logic.

**Demonstrates:**
- API-first design
- Webhook-specific patterns (signatures, retries)
- Permission model for third-party integrations
- Failure mode handling for network issues
- No audit events or NFRs (Level 2)

**[View: api-only-feature.ripp.yaml →](https://github.com/Dylan-Natter/ripp-protocol/blob/main/examples/api-only-feature.ripp.yaml)**

**Key Sections:**
```yaml
level: 2
failure_modes:
  - scenario: "Webhook endpoint is unreachable (network timeout)"
    handling: "Retry up to 3 times with exponential backoff"
permissions:
  - action: "create:webhook"
    required_roles: ["admin", "developer"]
```

---

## Level 1 Example Template

Use the [feature packet template](https://github.com/Dylan-Natter/ripp-protocol/blob/main/templates/feature-packet.ripp.template.yaml) as a starting point for Level 1 packets.

A basic Level 1 packet includes:
- Purpose (problem, solution, value)
- UX Flow (user interaction steps)
- Data Contracts (inputs and outputs)

---

## Patterns and Best Practices

### Pattern: CRUD API

When documenting a standard CRUD API:

1. **Purpose**: Describe the resource being managed
2. **UX Flow**: Often system-to-system (no human user)
3. **Data Contracts**: Define the resource schema
4. **API Contracts**: All 5 methods (POST, GET, PUT, PATCH, DELETE)
5. **Permissions**: Per-method authorization
6. **Failure Modes**: 400, 401, 403, 404, 409, 500

See [item-creation.ripp.yaml](https://github.com/Dylan-Natter/ripp-protocol/blob/main/examples/item-creation.ripp.yaml) for CREATE operation.

---

### Pattern: Multi-Tenant Feature

For any feature in a multi-tenant system:

1. **Permissions**: Always include organization-scoped access
2. **Failure Modes**: Document cross-tenant access attempts
3. **Audit Events**: Log tenant context in all events
4. **Acceptance Tests**: Test tenant isolation boundaries

See [multi-tenant-feature.ripp.yaml](https://github.com/Dylan-Natter/ripp-protocol/blob/main/examples/multi-tenant-feature.ripp.yaml).

---

### Pattern: Payment or PII Feature

For payment processing or PII handling:

1. **Level**: Always use Level 3
2. **Audit Events**: Log all access and modifications
3. **NFRs**: Include compliance standards (PCI, GDPR, HIPAA)
4. **Failure Modes**: Fail-safe defaults (deny on error)
5. **Security**: Encryption at rest and in transit

---

### Pattern: Background Job

For asynchronous processing:

1. **UX Flow**: Include job queuing and status checks
2. **Failure Modes**: Timeout, retry logic, dead letter queue
3. **NFRs**: Processing throughput, queue depth limits
4. **Audit Events**: Job start, completion, failure

---

### Pattern: Third-Party Integration

For integrations with external services:

1. **Purpose**: Document the integration's value
2. **Data Contracts**: Include both internal and external schemas
3. **Failure Modes**: Network failures, API rate limits, auth errors
4. **NFRs**: Response time expectations from third party

See [api-only-feature.ripp.yaml](https://github.com/Dylan-Natter/ripp-protocol/blob/main/examples/api-only-feature.ripp.yaml) for webhook pattern.

---

## Common Mistakes to Avoid

### ❌ Too Vague

**Bad:**
```yaml
purpose:
  problem: "Users need better features"
```

**Good:**
```yaml
purpose:
  problem: "Users cannot update their profile information after registration, leading to support tickets"
```

---

### ❌ Missing Error Cases

**Bad:**
```yaml
api_contracts:
  - endpoint: "/api/v1/items"
    response:
      success:
        status: 201
```

**Good:**
```yaml
api_contracts:
  - endpoint: "/api/v1/items"
    response:
      success:
        status: 201
      errors:
        - status: 400
          description: "Invalid input"
        - status: 401
          description: "Unauthorized"
        - status: 409
          description: "SKU already exists"
```

---

### ❌ Incomplete Data Contracts

**Bad:**
```yaml
data_contracts:
  inputs:
    - name: "UserInput"
      fields:
        - name: "email"
```

**Good:**
```yaml
data_contracts:
  inputs:
    - name: "UserInput"
      fields:
        - name: "email"
          type: "string"
          required: true
          description: "User's email address"
          format: "email"
```

---

### ❌ Skipping Failure Modes

Even simple features can fail. Always document at least:
- Network/database unavailable
- Invalid input
- Authentication/authorization failures

---

## Download Examples

All examples are available in the [examples/](https://github.com/Dylan-Natter/ripp-protocol/tree/main/examples) directory:

```bash
git clone https://github.com/Dylan-Natter/ripp-protocol.git
cd ripp-protocol/examples
ls -la
```

Or download individually:

```bash
curl -O https://raw.githubusercontent.com/Dylan-Natter/ripp-protocol/main/examples/item-creation.ripp.yaml
curl -O https://raw.githubusercontent.com/Dylan-Natter/ripp-protocol/main/examples/multi-tenant-feature.ripp.yaml
curl -O https://raw.githubusercontent.com/Dylan-Natter/ripp-protocol/main/examples/api-only-feature.ripp.yaml
```

---

## Contribute Your Examples

Have a great RIPP packet to share? Submit a pull request!

1. Add your packet to `examples/`
2. Ensure it validates: `ripp validate examples/`
3. Open a PR with description

See [CONTRIBUTING.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/CONTRIBUTING.md).

---

**Learn by doing. Study these examples. Write your own.**
