# Homebrew Release Checklist

This checklist guides you through the complete process of releasing a new version of ripp-cli via Homebrew.

## Prerequisites

- [ ] All changes for the release are merged to `main`
- [ ] Version number has been decided (e.g., v1.0.0)
- [ ] CHANGELOG.md has been updated with release notes
- [ ] You have write access to the ripp-protocol repository
- [ ] You have write access to the homebrew-ripp repository (or it's been created)

## Step 1: Create the homebrew-ripp Tap Repository (First Time Only)

If the `homebrew-ripp` repository doesn't exist yet:

- [ ] Go to GitHub and create a new repository
  - Name: `homebrew-ripp`
  - Owner: `Dylan-Natter`
  - Description: "Homebrew tap for RIPP CLI - Regenerative Intent Prompting Protocol validator"
  - Public repository
  - Initialize with README

- [ ] Clone and set up the repository structure:

```bash
git clone https://github.com/Dylan-Natter/homebrew-ripp.git
cd homebrew-ripp
mkdir -p Formula
```

- [ ] Create the initial README.md and Formula/ripp.rb as documented in `docs/HOMEBREW-TAP-SETUP.md`

- [ ] Commit and push:

```bash
git add .
git commit -m "Initial tap setup with RIPP formula"
git push origin main
```

## Step 2: Create and Push a Version Tag

- [ ] Ensure you're on the main branch and up-to-date:

```bash
cd ripp-protocol
git checkout main
git pull origin main
```

- [ ] Create a version tag (use semantic versioning):

```bash
git tag v1.0.0
```

- [ ] Push the tag to trigger the binary build workflow:

```bash
git push origin v1.0.0
```

## Step 3: Wait for Binaries to Build

- [ ] Monitor the GitHub Actions workflow:
  - Visit: https://github.com/Dylan-Natter/ripp-protocol/actions
  - Look for the "Build and Release Binaries" workflow
  - Wait for it to complete (usually takes 5-10 minutes)

- [ ] Verify the release was created:
  - Visit: https://github.com/Dylan-Natter/ripp-protocol/releases/tag/v1.0.0
  - Check that the following files are present:
    - `ripp-darwin-arm64.tar.gz`
    - `ripp-darwin-arm64.tar.gz.sha256`
    - `ripp-darwin-amd64.tar.gz`
    - `ripp-darwin-amd64.tar.gz.sha256`

## Step 4: Get SHA256 Checksums

- [ ] Use the helper script to get checksums:

```bash
cd ripp-protocol
./scripts/update-homebrew-formula.sh v1.0.0
```

This will:

- Fetch checksums from the GitHub release (if gh CLI is installed)
- Generate the formula snippet to copy
- Provide next steps

**OR** manually download checksums:

- [ ] Visit: https://github.com/Dylan-Natter/ripp-protocol/releases/tag/v1.0.0
- [ ] Download or view the `.sha256` files
- [ ] Copy the checksum values (first field in each file)

## Step 5: Update the Homebrew Formula

- [ ] Clone the homebrew-ripp repository (if not already cloned):

```bash
git clone https://github.com/Dylan-Natter/homebrew-ripp.git
cd homebrew-ripp
```

- [ ] Edit `Formula/ripp.rb`:
  - Update the `version` field
  - Update the ARM64 `url` and `sha256`
  - Update the AMD64 `url` and `sha256`

Example:

```ruby
  version "1.0.0"

  # macOS ARM64 (Apple Silicon)
  if Hardware::CPU.arm?
    url "https://github.com/Dylan-Natter/ripp-protocol/releases/download/v1.0.0/ripp-darwin-arm64.tar.gz"
    sha256 "abc123def456..."  # ARM64 checksum
  # macOS AMD64 (Intel)
  else
    url "https://github.com/Dylan-Natter/ripp-protocol/releases/download/v1.0.0/ripp-darwin-amd64.tar.gz"
    sha256 "789ghi012jkl..."  # AMD64 checksum
  end
```

- [ ] Commit and push the updated formula:

```bash
git add Formula/ripp.rb
git commit -m "ripp 1.0.0"
git push origin main
```

## Step 6: Test the Installation

- [ ] Update Homebrew:

```bash
brew update
```

- [ ] Install or upgrade ripp:

```bash
# If installing for the first time
brew tap Dylan-Natter/ripp
brew install ripp

# If upgrading
brew upgrade ripp
```

- [ ] Verify the installation:

```bash
ripp --version
# Should output: 1.0.0

ripp validate --help
# Should display help text
```

- [ ] Test with a real RIPP file:

```bash
# Create a test file or use an example from the repository
ripp validate path/to/test.ripp.yaml
```

## Step 7: Verify on Another Machine (Optional but Recommended)

- [ ] On a different Mac (or ask a team member):

```bash
brew tap Dylan-Natter/ripp
brew install ripp
ripp --version
```

## Troubleshooting

### Issue: Workflow didn't trigger

**Check:**

- Tag format is correct (e.g., `v1.0.0`, not `1.0.0`)
- Tag was pushed to the remote: `git push origin v1.0.0`
- GitHub Actions are enabled for the repository

**Solution:**

- Re-push the tag: `git push --force origin v1.0.0`
- Or manually trigger the workflow from GitHub Actions UI

### Issue: Checksum mismatch

**Symptom:** Users get checksum verification errors during installation

**Solution:**

1. Verify checksums in formula match GitHub releases exactly
2. Re-download checksums from release page
3. Update formula with correct values
4. Users may need to run `brew cleanup` to clear cache

### Issue: Binary not executable

**Symptom:** Permission denied when running ripp

**Solution:**

1. Verify binary is marked executable in tar.gz:

```bash
tar -tzf ripp-darwin-arm64.tar.gz
tar -xzf ripp-darwin-arm64.tar.gz
ls -l ripp-darwin-arm64
```

2. If not executable, the build process needs to be fixed
3. Test locally: `chmod +x ripp-darwin-arm64`

### Issue: Formula not found

**Symptom:** `brew install ripp` says formula not found

**Solution:**

1. Run `brew update` to refresh taps
2. Verify tap is added: `brew tap` (should list `dylan-natter/ripp`)
3. Check formula path in homebrew-ripp repo: `Formula/ripp.rb` (case-sensitive)
4. If formula is in wrong location, move it to `Formula/ripp.rb`

## Post-Release Tasks

- [ ] Announce the release:
  - Update project README if needed
  - Post in relevant channels/communities
  - Update documentation site

- [ ] Monitor for issues:
  - Watch homebrew-ripp repository for issues
  - Check ripp-protocol issues for installation problems

- [ ] Update this checklist if any steps were unclear or missing

## Resources

- [RIPP Homebrew Setup Documentation](../docs/HOMEBREW-TAP-SETUP.md)
- [RIPP Homebrew Distribution Guide](../docs/HOMEBREW.md)
- [Homebrew Formula Cookbook](https://docs.brew.sh/Formula-Cookbook)
- [Homebrew Tap Documentation](https://docs.brew.sh/Taps)
- [Main RIPP Repository](https://github.com/Dylan-Natter/ripp-protocol)

## Quick Reference

### Helper Script

```bash
./scripts/update-homebrew-formula.sh v1.0.0
```

### Manual Tag Creation

```bash
git tag v1.0.0 && git push origin v1.0.0
```

### Formula Update (copy-paste template)

```ruby
version "1.0.0"

if Hardware::CPU.arm?
  url "https://github.com/Dylan-Natter/ripp-protocol/releases/download/v1.0.0/ripp-darwin-arm64.tar.gz"
  sha256 "CHECKSUM_HERE"
else
  url "https://github.com/Dylan-Natter/ripp-protocol/releases/download/v1.0.0/ripp-darwin-amd64.tar.gz"
  sha256 "CHECKSUM_HERE"
end
```

### Testing Commands

```bash
brew audit --strict Formula/ripp.rb
brew install Formula/ripp.rb
brew test ripp
```
