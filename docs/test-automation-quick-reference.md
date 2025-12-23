# Test Automation Quick Reference

## Quick Start

**Location**: Actions → Test Release Automation → Run workflow

## Test Scenarios

| Scenario                    | Duration | Use Case                           |
| --------------------------- | -------- | ---------------------------------- |
| `full-pipeline-dry-run`     | 5-10 min | Complete end-to-end pipeline test  |
| `release-please-only`       | 1 min    | Quick config validation            |
| `vsix-build-only`           | 2-3 min  | VS Code extension build testing    |
| `npm-package-only`          | 3-5 min  | NPM package + binary build testing |
| `version-consistency-check` | 30 sec   | Version alignment verification     |

## What Gets Tested

### Full Pipeline (Recommended)

- ✅ Release-please config validation
- ✅ VS Code extension VSIX build
- ✅ NPM CLI package build & tests
- ✅ macOS binary generation
- ✅ Version consistency checks
- ✅ Workflow integration
- ✅ Dry-run publishing validation

### Safety Guarantees

- 🔒 Manual trigger only (no automatic runs)
- 🔒 Dry-run mode (no actual publishing)
- 🔒 Read-only permissions
- 🔒 No repository modifications
- 🔒 Temporary artifacts (7-day retention)

## Common Commands

### Run Full Test

```
Actions → Test Release Automation → Run workflow
- Test scenario: full-pipeline-dry-run
- Target package: both
- Verbose logging: true
```

### Test Specific Package

```
Actions → Test Release Automation → Run workflow
- Test scenario: vsix-build-only (or npm-package-only)
- Target package: vscode-extension (or ripp-cli)
- Verbose logging: true
```

### Quick Version Check

```
Actions → Test Release Automation → Run workflow
- Test scenario: version-consistency-check
- Target package: both
- Verbose logging: false
```

## Understanding Results

### ✅ Success

All tests passed - pipeline is healthy

- Version consistency verified
- Builds complete successfully
- Packages ready for publishing
- Workflows properly configured

### ❌ Failure

Check specific job logs for details:

1. Click on failed workflow run
2. Expand failed job
3. Review error messages in summary
4. Fix issues
5. Re-run test

## Quick Troubleshooting

| Issue                   | Solution                                                 |
| ----------------------- | -------------------------------------------------------- |
| Version mismatch        | Check `.release-please-manifest.json` and `package.json` |
| VSIX build fails        | Verify TypeScript compiles and linting passes            |
| NPM tests fail          | Run `npm test` locally in `tools/ripp-cli`               |
| Binary build fails      | Check pkg configuration in `package.json`                |
| Workflow trigger issues | Review workflow YAML syntax and trigger conditions       |

## Before Enabling Auto-Publish

1. Run `full-pipeline-dry-run`
2. Verify all tests pass
3. Check secrets are configured
4. Set `ENABLE_AUTO_PUBLISH=true`

## Required Secrets

- **RELEASE_PAT** - GitHub PAT for release-please
- **NPM_TOKEN** - npm token for publishing
- **VSCE_PAT** - Azure DevOps PAT for marketplace

## Links

- [Full Guide](./test-automation-workflow.md)
- [Workflows Overview](../.github/workflows/README.md)
- [Contributing](../CONTRIBUTING.md)
