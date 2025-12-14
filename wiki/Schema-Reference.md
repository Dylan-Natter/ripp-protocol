# Schema Reference

This page provides field-by-field documentation of the RIPP v1.0 JSON Schema.

For the authoritative schema, see: [`schema/ripp-1.0.schema.json`](https://github.com/Dylan-Natter/ripp-protocol/blob/main/schema/ripp-1.0.schema.json)

---

## Schema Location

**Repository:**
```
schema/ripp-1.0.schema.json
```

**Online reference:**
```
https://dylan-natter.github.io/ripp-protocol/schema/ripp-1.0.schema.json
```

---

## Metadata Fields

### `ripp_version`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Required** | ✅ Yes |
| **Allowed Values** | `"1.0"` |
| **Description** | RIPP specification version this packet conforms to |

**Example:**
```yaml
ripp_version: '1.0'
```

---

### `packet_id`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Required** | ✅ Yes |
| **Pattern** | `^[a-z0-9-]+$` (lowercase, numbers, hyphens only) |
| **Description** | Unique identifier for this packet (kebab-case) |

**Example:**
```yaml
packet_id: 'user-authentication'
```

**Best practices:**
- Use descriptive names: `item-creation`, not `ic1`
- Keep it short but clear: `payment-processing`, not `payment-processing-feature-for-checkout`

---

### `title`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Required** | ✅ Yes |
| **Min Length** | 1 |
| **Description** | Human-readable feature title |

**Example:**
```yaml
title: 'Create New Item in Inventory System'
```

---

### `created`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Required** | ✅ Yes |
| **Format** | ISO 8601 date (`YYYY-MM-DD`) |
| **Description** | Date when the packet was first created |

**Example:**
```yaml
created: '2025-12-14'
```

---

### `updated`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Required** | ✅ Yes |
| **Format** | ISO 8601 date (`YYYY-MM-DD`) |
| **Description** | Date of the last update to the packet |

**Example:**
```yaml
updated: '2025-12-14'
```

**Note:** Update this field whenever the packet is modified.

---

### `status`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Required** | ✅ Yes |
| **Allowed Values** | `draft`, `approved`, `implemented`, `deprecated` |
| **Description** | Lifecycle stage of the feature |

**Example:**
```yaml
status: 'approved'
```

**Status meanings:**
- `draft` — Being written; not yet reviewed
- `approved` — Reviewed and ready for implementation
- `implemented` — Code deployed to production
- `deprecated` — Feature being phased out

---

### `level`

| Property | Value |
|----------|-------|
| **Type** | `integer` |
| **Required** | ✅ Yes |
| **Allowed Values** | `1`, `2`, `3` |
| **Description** | RIPP conformance level |

**Example:**
```yaml
level: 3
```

**Level requirements:**
- **Level 1:** Purpose, UX Flow, Data Contracts
- **Level 2:** Level 1 + API Contracts, Permissions, Failure Modes
- **Level 3:** Level 2 + Audit Events, NFRs, Acceptance Tests

---

### `version`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Required** | ❌ No (optional) |
| **Description** | Optional packet version (semver recommended) |

**Example:**
```yaml
version: '2.1.0'
```

---

## Purpose Section

### `purpose`

| Property | Value |
|----------|-------|
| **Type** | `object` |
| **Required** | ✅ Yes |
| **Required Fields** | `problem`, `solution`, `value` |
| **Optional Fields** | `out_of_scope`, `assumptions`, `references` |

#### `purpose.problem`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Required** | ✅ Yes |
| **Min Length** | 1 |
| **Description** | Clear statement of the problem being solved |

**Example:**
```yaml
problem: 'Users cannot add new inventory items without manual database updates'
```

#### `purpose.solution`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Required** | ✅ Yes |
| **Min Length** | 1 |
| **Description** | High-level approach to solving the problem |

**Example:**
```yaml
solution: 'Provide a web form and API endpoint with validation and duplicate detection'
```

#### `purpose.value`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Required** | ✅ Yes |
| **Min Length** | 1 |
| **Description** | Business or user value delivered |

**Example:**
```yaml
value: 'Enables self-service item management, reduces support tickets'
```

#### `purpose.out_of_scope`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Required** | ❌ No (optional) |
| **Description** | What this feature explicitly does NOT do |

**Example:**
```yaml
out_of_scope: 'Bulk import, image upload, third-party catalog integration'
```

#### `purpose.assumptions`

| Property | Value |
|----------|-------|
| **Type** | `array` of `string` |
| **Required** | ❌ No (optional) |
| **Description** | Known assumptions or constraints |

**Example:**
```yaml
assumptions:
  - 'Users have basic understanding of their product taxonomy'
  - 'Item SKUs are managed externally'
```

#### `purpose.references`

| Property | Value |
|----------|-------|
| **Type** | `array` of `object` |
| **Required** | ❌ No (optional) |
| **Object Fields** | `title` (string), `url` (URI) |
| **Description** | Links to related docs, issues, or designs |

**Example:**
```yaml
references:
  - title: 'Inventory Management Design Doc'
    url: 'https://example.com/docs/inventory-design'
```

---

## UX Flow Section

### `ux_flow`

| Property | Value |
|----------|-------|
| **Type** | `array` of `object` |
| **Required** | ✅ Yes |
| **Min Items** | 1 |
| **Description** | User or system interaction flow |

#### Step Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `step` | `integer` | ✅ Yes | Numeric order (starting at 1) |
| `actor` | `string` | ✅ Yes | Who or what performs the action |
| `action` | `string` | ✅ Yes | What happens in this step |
| `trigger` | `string` | ⚠️ Conditional | What initiates this step |
| `result` | `string` | ⚠️ Conditional | What the user sees or receives |
| `condition` | `string` | ⚠️ Conditional | Conditional logic for this step |

**Note:** At least one of `trigger`, `result`, or `condition` must be present.

**Example:**
```yaml
ux_flow:
  - step: 1
    actor: 'User'
    action: 'Navigates to Add Item page'
    trigger: 'Clicks "Add New Item" button'
  - step: 2
    actor: 'System'
    action: 'Validates input'
    condition: 'If SKU already exists, show error'
  - step: 3
    actor: 'System'
    action: 'Creates item record'
    result: 'User sees success message with item ID'
```

---

## Data Contracts Section

### `data_contracts`

| Property | Value |
|----------|-------|
| **Type** | `object` |
| **Required** | ✅ Yes |
| **Properties** | `inputs`, `outputs` |
| **Requirement** | At least one of `inputs` or `outputs` must be present |

#### Entity Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ Yes | Name of the data entity |
| `description` | `string` | ❌ No | Purpose of this entity |
| `fields` | `array` | ✅ Yes | Array of field definitions |

#### Field Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ Yes | Field name |
| `type` | `string` | ✅ Yes | Data type (`string`, `number`, `boolean`, `object`, `array`) |
| `required` | `boolean` | ✅ Yes | Whether field is required |
| `description` | `string` | ✅ Yes | What this field represents |
| `min` | `number` | ❌ No | Minimum value (for numbers) or length (for strings) |
| `max` | `number` | ❌ No | Maximum value (for numbers) or length (for strings) |
| `pattern` | `string` | ❌ No | Regex pattern for validation |
| `format` | `string` | ❌ No | Format hint (e.g., `uuid`, `email`, `date`) |
| `enum` | `array` | ❌ No | Allowed values |

**Example:**
```yaml
data_contracts:
  inputs:
    - name: 'CreateItemRequest'
      description: 'Request payload for creating an item'
      fields:
        - name: 'name'
          type: 'string'
          required: true
          description: 'Item display name'
          min: 1
          max: 200
        - name: 'price'
          type: 'number'
          required: true
          description: 'Item price in USD'
          min: 0
  outputs:
    - name: 'CreateItemResponse'
      fields:
        - name: 'item_id'
          type: 'string'
          required: true
          description: 'UUID of the newly created item'
          format: 'uuid'
```

---

## Level 2 Sections

### `api_contracts`

| Property | Value |
|----------|-------|
| **Type** | `array` of `object` |
| **Required** | ✅ Yes (for Level 2+) |
| **Min Items** | 1 |
| **Description** | API endpoints or service interfaces |

#### API Contract Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `endpoint` | `string` | ✅ Yes | URL path or RPC method name |
| `method` | `string` | ✅ Yes | HTTP method (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) |
| `purpose` | `string` | ✅ Yes | What this endpoint does |
| `request` | `object` | ❌ No | Request specification |
| `response` | `object` | ✅ Yes | Response specification |

**Example:**
```yaml
api_contracts:
  - endpoint: '/api/v1/items'
    method: 'POST'
    purpose: 'Create a new inventory item'
    request:
      content_type: 'application/json'
      schema_ref: 'CreateItemRequest'
    response:
      success:
        status: 201
        schema_ref: 'CreateItemResponse'
      errors:
        - status: 400
          description: 'Invalid input'
        - status: 409
          description: 'Duplicate SKU'
```

---

### `permissions`

| Property | Value |
|----------|-------|
| **Type** | `array` of `object` |
| **Required** | ✅ Yes (for Level 2+) |
| **Min Items** | 1 |
| **Description** | Permission requirements |

#### Permission Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | `string` | ✅ Yes | Permission being checked (e.g., `create:item`) |
| `required_roles` | `array` | ✅ Yes | Roles that can perform this action |
| `resource_scope` | `string` | ❌ No | Scope of the resource |
| `description` | `string` | ✅ Yes | When and why this permission is checked |

**Example:**
```yaml
permissions:
  - action: 'create:item'
    required_roles: ['admin', 'editor']
    resource_scope: 'organization'
    description: 'User must have editor role to create items'
```

---

### `failure_modes`

| Property | Value |
|----------|-------|
| **Type** | `array` of `object` |
| **Required** | ✅ Yes (for Level 2+) |
| **Min Items** | 1 |
| **Description** | What can go wrong and how to handle it |

#### Failure Mode Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scenario` | `string` | ✅ Yes | What goes wrong |
| `impact` | `string` | ✅ Yes | Effect on users or system |
| `handling` | `string` | ✅ Yes | How the system responds |
| `user_message` | `string` | ✅ Yes | What users see or are told |

**Example:**
```yaml
failure_modes:
  - scenario: 'Database is unavailable'
    impact: 'Users cannot save items'
    handling: 'Return 503, retry with exponential backoff'
    user_message: 'Service temporarily unavailable. Please try again.'
```

---

## Level 3 Sections

### `audit_events`

| Property | Value |
|----------|-------|
| **Type** | `array` of `object` |
| **Required** | ✅ Yes (for Level 3) |
| **Min Items** | 1 |
| **Description** | Events that must be logged |

#### Audit Event Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event` | `string` | ✅ Yes | Event name (dot-notation recommended) |
| `severity` | `string` | ✅ Yes | Log level (`info`, `warn`, `error`) |
| `includes` | `array` | ✅ Yes | Data fields captured |
| `retention` | `string` | ❌ No | Retention period |
| `purpose` | `string` | ✅ Yes | Why this event is logged |

**Example:**
```yaml
audit_events:
  - event: 'item.created'
    severity: 'info'
    includes:
      - 'user_id'
      - 'item_id'
      - 'timestamp'
    retention: '90 days'
    purpose: 'Track item creation for compliance'
```

---

### `nfrs`

| Property | Value |
|----------|-------|
| **Type** | `object` |
| **Required** | ✅ Yes (for Level 3) |
| **Properties** | `performance`, `scalability`, `availability`, `security`, `compliance` |
| **Requirement** | At least one property must be present |

**Example:**
```yaml
nfrs:
  performance:
    response_time_p95: '200ms'
    throughput: '1000 requests/second'
  security:
    encryption_at_rest: true
    encryption_in_transit: true
```

---

### `acceptance_tests`

| Property | Value |
|----------|-------|
| **Type** | `array` of `object` |
| **Required** | ✅ Yes (for Level 3) |
| **Min Items** | 1 |
| **Description** | How to verify correctness |

#### Test Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `test_id` | `string` | ✅ Yes | Unique test identifier |
| `title` | `string` | ✅ Yes | What is being tested |
| `given` | `string` | ✅ Yes | Preconditions |
| `when` | `string` | ✅ Yes | Action taken |
| `then` | `string` | ✅ Yes | Expected outcome |
| `verification` | `array` | ✅ Yes | Specific checks to perform |

**Example:**
```yaml
acceptance_tests:
  - test_id: 'TC-001'
    title: 'User can create a new item'
    given: 'User is authenticated with editor role'
    when: 'User submits valid item data'
    then: 'Item is created and ID is returned'
    verification:
      - 'HTTP 201 response received'
      - 'Item ID is present in response'
```

---

## Validation Guarantees

The RIPP schema guarantees:

- ✅ **Structural correctness** — All required fields are present
- ✅ **Type safety** — Fields have correct data types
- ✅ **Format validation** — Dates, URIs, patterns are valid
- ✅ **Enum validation** — Status and method values are from allowed sets
- ❌ **NOT semantic validation** — Schema cannot verify business logic correctness

**What schema validation does NOT check:**

- Whether `purpose.problem` accurately describes a real problem
- Whether `api_contracts.endpoint` matches actual API implementation
- Whether `acceptance_tests` are comprehensive

**These require human review.**

---

## Example Valid Packet

See [`examples/item-creation.ripp.yaml`](https://github.com/Dylan-Natter/ripp-protocol/blob/main/examples/item-creation.ripp.yaml) for a complete, annotated Level 3 RIPP packet.

---

## Next Steps

- Read [RIPP Specification](RIPP-Specification) for protocol overview
- See [Validation Rules](Validation-Rules) for validation behavior
- Check [CLI Reference](CLI-Reference) for validation commands
