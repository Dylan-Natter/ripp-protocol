# VS Code Extension Versioning

## Microsoft Marketplace Requirements

The `version` field in `package.json` **MUST** follow strict Microsoft VS Code Marketplace requirements:

### ✅ Valid Version Format

- **Numeric only**: 1-4 dot-separated integers
- **Examples**: `0.1.0`, `1.0.0`, `1.2.3`, `2.1.0.4`
- **At least one segment must be non-zero**

### ❌ Invalid Version Formats

Prerelease labels and build metadata are **NOT ALLOWED** in the Marketplace:

- ❌ `0.1.0-ci` (prerelease label)
- ❌ `0.1.0-alpha` (prerelease label)
- ❌ `0.1.0-beta.1` (prerelease label)
- ❌ `0.1.0+build.123` (build metadata)
- ❌ `0.1.0-ci.20251216073528.462bdeb` (prerelease + build metadata)

## Why This Matters

The Microsoft VS Code Marketplace validates extension packages and **rejects** any VSIX file with a non-compliant version string. Attempting to publish with a prerelease or metadata suffix will fail with an error like:

> The version string '0.1.0-ci.20251216073528.462bdeb' doesn't conform to the requirements for a version. It must be one to four numbers in the range 0 to 2147483647, with each number separated by a period. It must contain at least one non-zero number.

## CI/CD Versioning Strategy

### Automatic Version Incrementing

The workflow **automatically increments** the patch version on every push to the `main` branch:

- **Trigger**: Push to `main` branch
- **Action**: Runs `npm version patch` to increment (e.g., `0.1.0` → `0.1.1`)
- **Commit**: Automatically commits the version bump with message `"chore: bump version to X.Y.Z [skip ci]"`
- **Push**: Pushes the commit back to the repository with `--force-with-lease` for safety
- **Result**: Each build has a unique, Marketplace-compliant version
- **Concurrency**: Workflow has concurrency control to prevent race conditions

### How It Works

1. Developer pushes code to `main`
2. Workflow checks out the repository
3. Workflow pulls latest changes to avoid conflicts (`git pull --rebase`)
4. Workflow auto-increments the patch version in `package.json`
5. Workflow commits and pushes the version change (with `[skip ci]` to prevent infinite loops)
6. Workflow builds and packages the extension with the new version
7. VSIX is created: `ripp-protocol-0.1.1.vsix` (Marketplace-compliant)

**Safety Features:**

- Concurrency control prevents multiple simultaneous builds on same branch
- `git pull --rebase` ensures latest changes before version increment
- `git push --force-with-lease` prevents overwriting concurrent changes
- Error handling at each step with clear failure messages

### Pull Requests

For pull requests, the workflow:

- Does **NOT** auto-increment the version (to avoid conflicts)
- Uses the existing version from `package.json` for packaging
- Artifacts are named with build metadata: `vscode-extension-0.1.0-build-20251216073528.462bdeb`

### Manual Version Updates

If you need to increment the minor or major version:

1. **Manually update** `version` in `package.json`
2. Follow semantic versioning:
   - Patch: Auto-incremented by CI (`0.1.0` → `0.1.1`)
   - Minor: Manual update for new features (`0.1.0` → `0.2.0`)
   - Major: Manual update for breaking changes (`0.1.0` → `1.0.0`)
3. Commit and push to `main`
4. CI will auto-increment from the new base (e.g., `0.2.0` → `0.2.1`)

## References

- [VS Code Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Semantic Versioning](https://semver.org/)
