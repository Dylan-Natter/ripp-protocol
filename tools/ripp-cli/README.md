# RIPP CLI Validator

Official command-line tool for validating Regenerative Intent Prompting Protocol (RIPP) packets.

## Installation

### Global Install (Recommended)

```bash
npm install -g ripp-cli
```

### From Source

```bash
git clone https://github.com/Dylan-Natter/ripp-protocol.git
cd ripp-protocol/tools/ripp-cli
npm install
npm link
```

## Usage

### Validate a single file

```bash
ripp validate my-feature.ripp.yaml
```

### Validate a directory

```bash
ripp validate features/
```

### Enforce minimum RIPP level

```bash
ripp validate api/ --min-level 2
ripp validate auth/ --min-level 3
```

### Suppress warnings

```bash
ripp validate . --quiet
```

## Commands

| Command | Description |
|---------|-------------|
| `ripp validate <path>` | Validate RIPP packets at path |
| `ripp --help` | Show help message |
| `ripp --version` | Show version |

## Options

| Option | Description |
|--------|-------------|
| `--min-level <1\|2\|3>` | Enforce minimum conformance level |
| `--quiet` | Suppress warnings |

## Exit Codes

- `0` - All packets valid
- `1` - Validation failures found

## What It Validates

✓ **Schema Conformance**: Validates against JSON Schema  
✓ **Required Sections**: Ensures all required sections for declared level are present  
✓ **File Naming**: Checks `.ripp.yaml` or `.ripp.json` extension  
✓ **Data Integrity**: Validates packet_id format, date formats, status values  
✓ **Level Conformance**: Ensures Level 2/3 sections are present when declared  

## Example Output

**Success:**

```
✓ item-creation.ripp.yaml is valid (Level 3)
✓ webhook-feature.ripp.yaml is valid (Level 2)

✓ All 2 RIPP packets are valid.
```

**Failure:**

```
✗ user-registration.ripp.yaml
  • /purpose: must have required property 'problem'
  • /status: must be equal to one of the allowed values
  • Packet is Level 2, but missing section: permissions

✗ 1 of 1 RIPP packets failed validation.
```

## CI Integration

### GitHub Actions

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'

- name: Install RIPP CLI
  run: npm install -g ripp-cli

- name: Validate RIPP Packets
  run: ripp validate .
```

### GitLab CI

```yaml
validate-ripp:
  image: node:18
  script:
    - npm install -g ripp-cli
    - ripp validate .
```

## Development

### Install Dependencies

```bash
npm install
```

### Test Locally

```bash
./index.js validate ../../examples/
```

### Link for Development

```bash
npm link
ripp validate ../../examples/
```

## Dependencies

- **ajv**: JSON Schema validator
- **ajv-formats**: Format validators for ajv
- **js-yaml**: YAML parser
- **glob**: File pattern matching

## License

MIT

## Links

- **Documentation**: [https://dylan-natter.github.io/ripp-protocol](https://dylan-natter.github.io/ripp-protocol)
- **Repository**: [https://github.com/Dylan-Natter/ripp-protocol](https://github.com/Dylan-Natter/ripp-protocol)
- **Issues**: [https://github.com/Dylan-Natter/ripp-protocol/issues](https://github.com/Dylan-Natter/ripp-protocol/issues)
