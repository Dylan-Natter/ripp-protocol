# GitHub Actions Workflows

This directory contains all GitHub Actions workflows for the RIPP Protocol repository.

## Workflow Overview

### Release & Publishing

- **[release-please.yml](./release-please.yml)** - Automated versioning and release PR creation
- **[vscode-extension-build.yml](./vscode-extension-build.yml)** - Build VS Code extension VSIX packages
- **[vscode-extension-publish.yml](./vscode-extension-publish.yml)** - Publish VS Code extension to marketplace
- **[npm-publish.yml](./npm-publish.yml)** - Publish ripp-cli to npm registry
- **[build-binaries.yml](./build-binaries.yml)** - Build standalone macOS binaries for ripp-cli

### Quality & Testing

- **[code-quality.yml](./code-quality.yml)** - Lint and format checking
- **[ripp-validate.yml](./ripp-validate.yml)** - Validate RIPP packet files
- **[test-automation.yml](./test-automation.yml)** - Comprehensive release automation testing
- **[drift-prevention.yml](./drift-prevention.yml)** - Prevent configuration drift

### Documentation

- **[docs-enforcement.yml](./docs-enforcement.yml)** - Enforce documentation requirements
- **[publish-wiki.yml](./publish-wiki.yml)** - Publish documentation to GitHub Wiki

## Key Workflows

### Test Automation

**Purpose**: Comprehensive testing of the entire release automation pipeline

**Trigger**: Manual (workflow_dispatch)

**What it tests**:

- Release-please configuration
- VSIX build for VS Code extension
- NPM package build for ripp-cli
- Binary builds for macOS
- Version consistency across packages
- Workflow integration

**Documentation**: See [Test Automation Workflow Guide](../../docs/test-automation-workflow.md)

**Usage**:

```bash
# Via GitHub UI: Actions → Test Release Automation → Run workflow
```

### Release Process

The release process follows this sequence:

1. **release-please.yml** - Creates/updates release PR with version bumps
2. Developer reviews and merges release PR
3. **release-please.yml** - Creates GitHub Release and tags
4. **vscode-extension-build.yml** - Builds VSIX (if VS Code extension tag)
5. **vscode-extension-publish.yml** - Publishes to marketplace (if enabled)
6. **npm-publish.yml** - Publishes to npm (if ripp-cli tag and enabled)
7. **build-binaries.yml** - Builds and attaches macOS binaries (if ripp-cli tag)

## Auto-Publish Control

Publishing workflows are controlled by the `ENABLE_AUTO_PUBLISH` repository variable:

- When `ENABLE_AUTO_PUBLISH=true`: Workflows automatically publish on release
- When `ENABLE_AUTO_PUBLISH=false` or unset: Manual approval required

**To enable auto-publish**:

1. Run [test-automation.yml](./test-automation.yml) to verify pipeline works
2. Set repository variable: `ENABLE_AUTO_PUBLISH=true`
3. Subsequent releases will automatically publish

## Required Secrets

The following secrets must be configured for publishing:

- **RELEASE_PAT** - GitHub Personal Access Token for release-please
- **NPM_TOKEN** - npm access token for publishing ripp-cli
- **VSCE_PAT** - Azure DevOps PAT for VS Code marketplace publishing

## Testing Before Production

Before enabling auto-publish, always test the pipeline:

```bash
# 1. Run comprehensive test
Actions → Test Release Automation → Run workflow
Select: full-pipeline-dry-run

# 2. Verify all tests pass

# 3. Enable auto-publish
Set repository variable: ENABLE_AUTO_PUBLISH=true
```

## Workflow Triggers

### Automatic Triggers

- **release-please.yml**: Push to `main` branch
- **vscode-extension-build.yml**: Push tags matching `v*` or `**-v*`
- **vscode-extension-publish.yml**: Release published (non-ripp-cli tags)
- **npm-publish.yml**: Release published (ripp-cli tags)
- **build-binaries.yml**: Release published (ripp-cli tags)
- **code-quality.yml**: Push to main/copilot branches, PRs to main
- **ripp-validate.yml**: Push, PR, workflow_dispatch

### Manual Triggers

All workflows support `workflow_dispatch` for manual execution.

## Version Management

Versions are managed by release-please using conventional commits:

- **feat**: Minor version bump (0.x.0)
- **fix**: Patch version bump (0.0.x)
- **BREAKING CHANGE**: Major version bump (x.0.0)

Configuration:

- [release-please-config.json](../../release-please-config.json) - Package configuration
- [.release-please-manifest.json](../../.release-please-manifest.json) - Current versions

## Package-Specific Tags

- **VS Code Extension**: Tags like `v0.5.1` (no component prefix)
- **ripp-cli**: Tags like `ripp-cli-v1.2.0` (component prefix)

## Monitoring & Debugging

### Workflow Logs

View logs in the Actions tab:

1. Go to repository Actions tab
2. Select workflow from left sidebar
3. Click on specific run
4. View job logs and summaries

### Test Automation Reports

The test automation workflow provides detailed reports:

- Overall test status table
- Job-specific summaries
- Version consistency checks
- Build artifact validation

### Common Issues

1. **Version mismatch**: Run version consistency test
2. **Build failures**: Check individual build job logs
3. **Publish failures**: Verify secrets are configured
4. **Auto-publish not working**: Check `ENABLE_AUTO_PUBLISH` variable

## Contributing

When modifying workflows:

1. Test changes thoroughly using test-automation workflow
2. Document changes in workflow comments
3. Update this README if adding/removing workflows
4. Get PR review before merging

## References

- [Test Automation Guide](../../docs/test-automation-workflow.md)
- [Contributing Guide](../../CONTRIBUTING.md)
- [Release-Please Documentation](https://github.com/googleapis/release-please)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
