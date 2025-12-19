# Monorepos & Advanced Layouts

This page explains how RIPP works in monorepo structures and advanced repository layouts.

## Supported Layouts

RIPP is flexible and works with various repository structures:

### Single Project Repository

```
my-app/
├── ripp/
│   └── features/
│       ├── user-auth.ripp.yaml
│       └── item-creation.ripp.yaml
├── src/
├── package.json
└── .github/
    └── workflows/
        └── ripp-validate.yml
```

**Validation:**

```bash
ripp validate .
```

---

### Monorepo (npm/yarn workspaces)

```
monorepo/
├── packages/
│   ├── auth/
│   │   ├── ripp/
│   │   │   └── features/
│   │   │       └── oauth.ripp.yaml
│   │   └── src/
│   ├── billing/
│   │   ├── ripp/
│   │   │   └── features/
│   │   │       └── subscriptions.ripp.yaml
│   │   └── src/
│   └── web/
│       ├── ripp/
│       │   └── features/
│       │       └── dashboard.ripp.yaml
│       └── src/
├── package.json  # workspace root
└── .github/
    └── workflows/
        └── ripp-validate.yml
```

**Validation:**

```bash
# Validate all packages
ripp validate .

# Validate specific package
ripp validate packages/auth/

# Validate multiple packages
ripp validate packages/auth/ packages/billing/
```

---

### Centralized RIPP Directory

```
enterprise-app/
├── ripp/
│   ├── auth/
│   │   ├── login.ripp.yaml
│   │   └── registration.ripp.yaml
│   ├── billing/
│   │   └── subscriptions.ripp.yaml
│   └── core/
│       └── api-gateway.ripp.yaml
├── apps/
│   ├── web/
│   └── mobile/
└── services/
    ├── auth-service/
    └── billing-service/
```

**Validation:**

```bash
# Validate all RIPP packets
ripp validate ripp/

# Validate specific domain
ripp validate ripp/auth/
```

---

### Feature-Colocated

```
feature-based-app/
├── features/
│   ├── user-authentication/
│   │   ├── user-auth.ripp.yaml
│   │   └── src/
│   ├── item-creation/
│   │   ├── item-creation.ripp.yaml
│   │   └── src/
│   └── payment-processing/
│       ├── payment.ripp.yaml
│       └── src/
└── .github/
    └── workflows/
        └── ripp-validate.yml
```

**Validation:**

```bash
# Validate all features
ripp validate features/

# Validate specific feature
ripp validate features/user-authentication/
```

---

## Workspace Root Detection

The RIPP CLI automatically detects the repository root:

### Detection Algorithm

1. Start from current working directory
2. Look for `.git/` directory (Git repository root)
3. Look for `package.json` with `workspaces` field (npm/yarn workspace root)
4. If not found, move up one directory
5. Repeat until root is found or filesystem root is reached

### Example

```
/home/user/monorepo/
├── .git/              ← Repository root detected here
├── package.json       ← Workspace root
└── packages/
    └── auth/          ← You run `ripp validate .` here
```

**Command:**

```bash
cd packages/auth
ripp validate .
```

**Behavior:**

- CLI detects `/home/user/monorepo/` as repository root
- Validates all `*.ripp.yaml` files under `packages/auth/`

---

## Multiple RIPP Artifact Sets

Monorepos can have RIPP packets in multiple locations:

### Strategy 1: One RIPP Directory Per Package

```
packages/
├── auth/
│   └── ripp/intent/
│       ├── login.ripp.yaml
│       └── oauth.ripp.yaml
├── billing/
│   └── ripp/intent/
│       └── subscriptions.ripp.yaml
└── core/
    └── ripp/intent/
        └── api.ripp.yaml
```

**Pros:**

- ✅ Clear ownership (each package owns its RIPP packets)
- ✅ Easy to validate per package
- ✅ Natural fit for independent deployment

**Cons:**

- ⚠️ Cross-package dependencies harder to track

**Validation:**

```bash
# All packages
ripp validate packages/*/ripp/

# Specific package
ripp validate packages/auth/ripp/
```

---

### Strategy 2: Centralized RIPP Directory

```
ripp/
├── auth/
│   ├── login.ripp.yaml
│   └── oauth.ripp.yaml
├── billing/
│   └── subscriptions.ripp.yaml
└── core/
    └── api.ripp.yaml

packages/
├── auth/src/
├── billing/src/
└── core/src/
```

**Pros:**

- ✅ All RIPP packets in one place (easier to browse)
- ✅ Simplifies cross-cutting concerns
- ✅ Single source of truth for specs

**Cons:**

- ⚠️ Ownership less clear
- ⚠️ Potential merge conflicts if multiple teams edit

**Validation:**

```bash
ripp validate ripp/
```

---

### Strategy 3: Hybrid (Centralized + Colocated)

```
ripp/
├── cross-cutting/
│   └── authentication.ripp.yaml  # Shared by multiple packages
└── integration/
    └── api-gateway.ripp.yaml      # Integration layer

packages/
├── auth/
│   ├── ripp/
│   │   └── features/
│   │       └── password-reset.ripp.yaml  # Package-specific
│   └── src/
└── billing/
    ├── ripp/
    │   └── features/
    │       └── invoice-generation.ripp.yaml
    └── src/
```

**Pros:**

- ✅ Shared specs centralized
- ✅ Package-specific specs colocated
- ✅ Clear separation of concerns

**Cons:**

- ⚠️ More complex structure
- ⚠️ Need to validate multiple directories

**Validation:**

```bash
# Validate all RIPP packets
ripp validate ripp/ packages/*/ripp/

# Or validate entire repo
ripp validate .
```

---

## Enforcing Different Levels Per Package

In monorepos, different packages may have different risk profiles:

### Example: Enforce Level 3 for Critical Packages

```yaml
# .github/workflows/ripp-validate.yml
name: Validate RIPP Packets

on:
  pull_request:

jobs:
  validate-critical:
    name: Validate Critical Packages (Level 3)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g ripp-cli
      - run: ripp validate packages/auth/ --min-level 3
      - run: ripp validate packages/billing/ --min-level 3

  validate-other:
    name: Validate Other Packages (Level 1)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g ripp-cli
      - run: ripp validate packages/web/
      - run: ripp validate packages/tools/
```

**Result:**

- `auth` and `billing` must be Level 3
- `web` and `tools` can be Level 1

---

## GitHub Actions in Monorepos

### Validate All Packages

```yaml
name: Validate RIPP Packets

on:
  pull_request:
    paths:
      - 'packages/**/ripp/**.ripp.yaml'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g ripp-cli
      - run: ripp validate .
```

---

### Validate Changed Packages Only

```yaml
name: Validate RIPP Packets

on:
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Needed for git diff

      - name: Get changed RIPP files
        id: changed-files
        run: |
          CHANGED=$(git diff --name-only origin/main...HEAD | grep '.ripp.yaml$' || true)
          echo "files=$CHANGED" >> $GITHUB_OUTPUT

      - name: Validate changed RIPP packets
        if: steps.changed-files.outputs.files != ''
        run: |
          npm install -g ripp-cli
          echo "${{ steps.changed-files.outputs.files }}" | xargs ripp validate
```

**Result:** Only validates RIPP packets that changed in the PR.

---

## Known Limitations

### 1. No Cross-Package Schema References

RIPP packets cannot reference entities from other packages' `data_contracts`:

**Not supported:**

```yaml
# packages/auth/ripp/login.ripp.yaml
api_contracts:
  - endpoint: '/login'
    request:
      schema_ref: '../billing/CreateSubscription' # NOT SUPPORTED
```

**Workaround:** Duplicate shared entities or use centralized RIPP directory.

---

### 2. No Automatic Monorepo Detection

The CLI does not automatically detect monorepo package boundaries.

**Example:**

```bash
cd packages/auth
ripp validate .
```

This validates **only** `packages/auth/`, not the entire monorepo.

**Workaround:** Use explicit paths or validate from repository root:

```bash
cd monorepo-root
ripp validate .
```

---

### 3. No Per-Package Configuration

RIPP does not support per-package configuration files (e.g., `.ripprc`).

**Example (not supported):**

```
packages/auth/.ripprc  ← Does not exist
```

**Workaround:** Use CLI flags in package-specific scripts:

```json
// packages/auth/package.json
{
  "scripts": {
    "validate-ripp": "ripp validate ripp/ --min-level 3"
  }
}
```

---

### 4. Lint Reports in Monorepos

`ripp lint` generates reports in `reports/` directory at the location where the command is run.

**Issue:** In monorepos, this can create multiple `reports/` directories.

**Workaround:** Use `--output` flag to centralize reports:

```bash
ripp lint packages/auth/ --output ./build/reports/auth/
ripp lint packages/billing/ --output ./build/reports/billing/
```

---

## Best Practices for Monorepos

### 1. Centralize RIPP for Shared Specs

Place cross-cutting or shared specifications in a centralized `ripp/` directory:

```
ripp/
├── shared/
│   ├── authentication.ripp.yaml
│   └── rate-limiting.ripp.yaml
└── integration/
    └── api-contracts.ripp.yaml
```

### 2. Colocate Package-Specific Specs

Keep package-specific RIPP packets close to their implementation:

```
packages/auth/
├── ripp/intent/
│   └── password-reset.ripp.yaml
└── src/
```

### 3. Validate from Repository Root

Always run `ripp validate .` from the repository root in CI:

```yaml
- name: Validate all RIPP packets
  run: ripp validate .
```

This ensures no RIPP packets are missed.

### 4. Use Matrix Strategy for Different Levels

```yaml
jobs:
  validate:
    strategy:
      matrix:
        package:
          - { path: 'packages/auth', level: 3 }
          - { path: 'packages/billing', level: 3 }
          - { path: 'packages/web', level: 1 }
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g ripp-cli
      - run: ripp validate ${{ matrix.package.path }} --min-level ${{ matrix.package.level }}
```

### 5. Add `.gitignore` for Lint Reports

Exclude generated lint reports from version control:

```gitignore
# .gitignore
reports/
**/reports/
build/reports/
```

---

## Migration Strategy for Monorepos

### Phase 1: Centralized Adoption

1. Create centralized `ripp/` directory
2. Run `ripp init` from repository root
3. Create first RIPP packets in `ripp/intent/`
4. Set up GitHub Action to validate all

### Phase 2: Package-Specific Adoption

1. Identify high-risk packages (auth, billing, payments)
2. Create `ripp/intent/` in those packages
3. Move relevant specs from centralized directory
4. Update GitHub Action to enforce Level 3 for those packages

### Phase 3: Full Adoption

1. Add `ripp/` to remaining packages
2. Update validation to enforce minimum levels per package
3. Consolidate shared specs in centralized directory

---

## Summary

| Layout                   | Best For                              | Validation Command                     |
| ------------------------ | ------------------------------------- | -------------------------------------- |
| **Single project**       | Small apps, single team               | `ripp validate .`                      |
| **One RIPP per package** | Independent packages, clear ownership | `ripp validate packages/*/ripp/`       |
| **Centralized RIPP**     | Shared specs, integration testing     | `ripp validate ripp/`                  |
| **Hybrid**               | Complex monorepos, mixed ownership    | `ripp validate ripp/ packages/*/ripp/` |

**Philosophy:** RIPP adapts to your repository structure. No prescribed layout.

---

## Next Steps

- See [CLI Reference](CLI-Reference) for validation commands
- Read [GitHub Integration](GitHub-Integration) for CI/CD setup
- Check [Getting Started](Getting-Started) for initialization
