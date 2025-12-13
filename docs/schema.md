---
layout: default
title: "Schema Documentation"
---

## RIPP v1.0 Schema Documentation

The RIPP JSON Schema defines the structure and validation rules for RIPP packets.

---

## Schema Location

**URL**: [https://dylan-natter.github.io/ripp-protocol/schema/ripp-1.0.schema.json](https://dylan-natter.github.io/ripp-protocol/schema/ripp-1.0.schema.json)

**Repository**: [schema/ripp-1.0.schema.json](https://github.com/Dylan-Natter/ripp-protocol/blob/main/schema/ripp-1.0.schema.json)

---

## Schema Overview

The RIPP schema is a JSON Schema Draft 07 document that validates:

- **Required metadata fields** (ripp_version, packet_id, title, etc.)
- **Conformance levels** (ensures Level 2/3 sections are present when declared)
- **Section structures** (each section has its own schema)
- **Data types and formats** (strings, dates, enums, etc.)
- **Field requirements** (which fields are mandatory)

---

## Using the Schema

### In VS Code

Add to `.vscode/settings.json`:

```json
{
  "yaml.schemas": {
    "https://dylan-natter.github.io/ripp-protocol/schema/ripp-1.0.schema.json": [
      "**/*.ripp.yaml"
    ]
  }
}
```

### In JetBrains IDEs

1. **Settings** → **Languages & Frameworks** → **Schemas and DTDs** → **JSON Schema Mappings**
2. Add schema URL and file pattern `*.ripp.yaml`

### Programmatic Validation

**Node.js (Ajv):**

```javascript
const Ajv = require('ajv');
const schema = require('./schema/ripp-1.0.schema.json');

const ajv = new Ajv();
const validate = ajv.compile(schema);

const valid = validate(yourPacketData);
if (!valid) {
  console.log(validate.errors);
}
```

**Python (jsonschema):**

```python
from jsonschema import validate
import json

with open('schema/ripp-1.0.schema.json') as f:
    schema = json.load(f)

validate(instance=your_packet, schema=schema)
```

---

## Schema Structure

### Root Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `ripp_version` | string | Yes | Must be "1.0" |
| `packet_id` | string | Yes | Unique ID (kebab-case) |
| `title` | string | Yes | Human-readable title |
| `created` | string (date) | Yes | ISO 8601 date |
| `updated` | string (date) | Yes | ISO 8601 date |
| `status` | enum | Yes | draft \| approved \| implemented \| deprecated |
| `level` | integer | Yes | 1, 2, or 3 |
| `purpose` | object | Yes | See Purpose section |
| `ux_flow` | array | Yes | See UX Flow section |
| `data_contracts` | object | Yes | See Data Contracts section |

### Conditional Requirements

The schema uses `allOf` with `if/then` to enforce level-based requirements:

- **Level 2**: Requires `api_contracts`, `permissions`, `failure_modes`
- **Level 3**: Requires all Level 2 + `audit_events`, `nfrs`, `acceptance_tests`

---

## Section Schemas

### Purpose

```json
{
  "type": "object",
  "required": ["problem", "solution", "value"],
  "properties": {
    "problem": { "type": "string", "minLength": 1 },
    "solution": { "type": "string", "minLength": 1 },
    "value": { "type": "string", "minLength": 1 },
    "out_of_scope": { "type": "string" },
    "assumptions": { "type": "array", "items": { "type": "string" } },
    "references": { "type": "array" }
  }
}
```

### UX Flow

Array of steps, each requiring:

- `step`: integer (1, 2, 3, ...)
- `actor`: string (who performs the action)
- `action`: string (what happens)
- At least one of: `trigger`, `result`, or `condition`

### Data Contracts

Must have at least `inputs` or `outputs`. Each entity has:

- `name`: Entity name
- `fields`: Array of field definitions

Each field requires:

- `name`: Field name
- `type`: One of: string, number, integer, boolean, object, array, null
- `required`: boolean
- `description`: string

### API Contracts (Level 2+)

Array of endpoints, each requiring:

- `endpoint`: URL path or method name
- `method`: GET | POST | PUT | DELETE | PATCH | HEAD | OPTIONS
- `purpose`: What the endpoint does
- `response.success`: Success response definition
- `response.errors`: Array of error responses (minimum 1)

### Permissions (Level 2+)

Array of permission definitions, each requiring:

- `action`: Permission being checked
- `required_roles`: Array of role names
- `description`: When/why checked

### Failure Modes (Level 2+)

Array of failure scenarios, each requiring:

- `scenario`: What goes wrong
- `impact`: Effect on users/system
- `handling`: How system responds
- `user_message`: What users see

### Audit Events (Level 3)

Array of events, each requiring:

- `event`: Event name
- `severity`: debug | info | warn | error | critical
- `includes`: Array of data fields
- `purpose`: Why it's logged

### NFRs (Level 3)

Object with at least one of:

- `performance`: Response times, throughput
- `scalability`: Concurrent users, data growth
- `availability`: Uptime, RPO, RTO
- `security`: Encryption, auth requirements
- `compliance`: Standards, data residency

### Acceptance Tests (Level 3)

Array of tests, each requiring:

- `test_id`: Unique identifier
- `title`: What's being tested
- `given`: Preconditions
- `when`: Action taken
- `then`: Expected outcome
- `verification`: Array of checks

---

## Validation Rules

### Format Validations

- **Date fields** (`created`, `updated`): Must be valid ISO 8601 dates (YYYY-MM-DD)
- **UUID fields** (where `format: "uuid"` specified): Must be valid UUID format
- **Email fields** (where `format: "email"` specified): Must be valid email format
- **URI fields** (where `format: "uri"` specified): Must be valid URI

### Pattern Validations

- **packet_id**: Must match `^[a-z0-9-]+$` (lowercase letters, numbers, hyphens)

### Enum Validations

- **status**: Must be one of: `draft`, `approved`, `implemented`, `deprecated`
- **level**: Must be 1, 2, or 3
- **severity** (audit events): Must be `debug`, `info`, `warn`, `error`, or `critical`
- **method** (API contracts): Must be valid HTTP method

---

## Custom Extensions

RIPP allows custom sections via `additionalProperties: true` at the root level.

You can add organization-specific fields:

```yaml
ripp_version: "1.0"
# ... standard fields ...

# Custom section (not part of RIPP spec)
custom_tracking:
  jira_ticket: "PROJ-123"
  team: "Platform"
```

Validators will **not** fail on unknown fields, ensuring forward compatibility.

---

## Schema Evolution

### Versioning

The schema follows RIPP spec versioning:

- **v1.0.x**: Current stable version
- **v1.1.x**: Future minor updates (backward compatible)
- **v2.0.x**: Future major updates (may break compatibility)

### Backward Compatibility

Within v1.x:

- New optional fields may be added
- No required fields will be removed
- Enum values will not be removed
- Existing packets remain valid

### Migration

When RIPP v2.0 is released, a migration guide and updated schema will be provided.

---

## Downloading the Schema

**Direct download:**

```bash
curl -O https://dylan-natter.github.io/ripp-protocol/schema/ripp-1.0.schema.json
```

**From repository:**

```bash
git clone https://github.com/Dylan-Natter/ripp-protocol.git
cd ripp-protocol/schema
```

---

## Schema Validation Tools

- **Node.js**: Ajv, ajv-cli
- **Python**: jsonschema
- **Go**: gojsonschema
- **Java**: everit-org/json-schema
- **Ruby**: json-schema
- **PHP**: justinrainbow/json-schema

---

## Contributing to the Schema

Schema changes require:

1. Opening a spec change issue
2. Community discussion
3. Approval from maintainers
4. Updating both SPEC.md and schema file
5. Version increment

See [CONTRIBUTING.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/CONTRIBUTING.md).

---

**The schema is the contract. Validate early. Validate often.**
