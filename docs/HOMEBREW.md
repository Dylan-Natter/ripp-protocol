# Homebrew Distribution

This document provides instructions for setting up and maintaining the Homebrew distribution of ripp-cli.

## Overview

The RIPP CLI is distributed via Homebrew through a custom tap. Users can install it with:

```bash
brew tap Dylan-Natter/ripp
brew install ripp
```

## Repository Structure

The Homebrew formula lives in a separate repository: `homebrew-ripp`

### Expected Repository Structure

```
homebrew-ripp/
├── Formula/
│   └── ripp.rb
└── README.md
```

## Creating the homebrew-ripp Repository

1. Create a new GitHub repository named `homebrew-ripp` under the `Dylan-Natter` organization/user
2. Initialize it with a README
3. Create the `Formula/` directory
4. Add the `ripp.rb` formula (see below)

## Formula Template (ripp.rb)

```ruby
# Formula for RIPP CLI - Regenerative Intent Prompting Protocol validator
# Documentation: https://github.com/Dylan-Natter/ripp-protocol

class Ripp < Formula
  desc "Official CLI validator for Regenerative Intent Prompting Protocol (RIPP)"
  homepage "https://github.com/Dylan-Natter/ripp-protocol"
  license "MIT"

  # Update these values for each release
  version "1.0.0"

  # macOS ARM64 (Apple Silicon)
  if Hardware::CPU.arm?
    url "https://github.com/Dylan-Natter/ripp-protocol/releases/download/v#{version}/ripp-darwin-arm64.tar.gz"
    sha256 "REPLACE_WITH_ARM64_SHA256"
  # macOS AMD64 (Intel)
  else
    url "https://github.com/Dylan-Natter/ripp-protocol/releases/download/v#{version}/ripp-darwin-amd64.tar.gz"
    sha256 "REPLACE_WITH_AMD64_SHA256"
  end

  def install
    # Install the binary
    if Hardware::CPU.arm?
      bin.install "ripp-darwin-arm64" => "ripp"
    else
      bin.install "ripp-darwin-amd64" => "ripp"
    end
  end

  test do
    # Verify the binary runs and reports version
    system "#{bin}/ripp", "--version"

    # Create a minimal RIPP file and validate it
    (testpath/"test.ripp.yaml").write <<~EOS
      ripp_version: "1.0"
      packet_id: "test-packet"
      title: "Test Packet"
      created: "2025-01-01"
      updated: "2025-01-01"
      status: "draft"
      level: 1

      purpose:
        problem: "Test problem"
        solution: "Test solution"
        value: "Test value"

      ux_flow:
        - step: 1
          actor: "User"
          action: "Test action"
          trigger: "Test trigger"

      data_contracts:
        inputs:
          - name: "TestInput"
            fields:
              - name: "test_field"
                type: "string"
                required: true
                description: "Test field"
    EOS

    # Run validation
    system "#{bin}/ripp", "validate", testpath/"test.ripp.yaml"
  end
end
```

## Updating the Formula for a New Release

When a new version is released:

1. **Trigger the build workflow** to create binaries:
   - Push a tag: `git tag v1.0.1 && git push origin v1.0.1`
   - Or use the GitHub Actions workflow manually

2. **Get the SHA256 checksums** from the release page or workflow output

3. **Update the formula** in `homebrew-ripp/Formula/ripp.rb`:

   ```ruby
   version "1.0.1"

   if Hardware::CPU.arm?
     url "https://github.com/Dylan-Natter/ripp-protocol/releases/download/v1.0.1/ripp-darwin-arm64.tar.gz"
     sha256 "abc123..." # ARM64 checksum
   else
     url "https://github.com/Dylan-Natter/ripp-protocol/releases/download/v1.0.1/ripp-darwin-amd64.tar.gz"
     sha256 "def456..." # AMD64 checksum
   end
   ```

4. **Commit and push** the updated formula:

   ```bash
   git add Formula/ripp.rb
   git commit -m "ripp 1.0.1"
   git push origin main
   ```

5. **Test the installation**:
   ```bash
   brew update
   brew upgrade ripp
   ripp --version
   ```

## Release Process

### Step 1: Create and Push a Git Tag

```bash
# Ensure you're on main and up-to-date
git checkout main
git pull origin main

# Create a tag (use semantic versioning)
git tag v1.0.0

# Push the tag
git push origin v1.0.0
```

### Step 2: Wait for Binaries to Build

The GitHub Actions workflow will automatically:

- Build macOS ARM64 and AMD64 binaries
- Package them as `.tar.gz` archives
- Generate SHA256 checksums
- Create a GitHub Release with all artifacts

### Step 3: Retrieve Checksums

Visit the release page or check the workflow summary:

```
https://github.com/Dylan-Natter/ripp-protocol/releases/tag/v1.0.0
```

Download the `.sha256` files or copy from workflow output.

### Step 4: Update Homebrew Formula

In the `homebrew-ripp` repository, update `Formula/ripp.rb`:

```ruby
version "1.0.0"

if Hardware::CPU.arm?
  url "https://github.com/Dylan-Natter/ripp-protocol/releases/download/v1.0.0/ripp-darwin-arm64.tar.gz"
  sha256 "1234567890abcdef..."
else
  url "https://github.com/Dylan-Natter/ripp-protocol/releases/download/v1.0.0/ripp-darwin-amd64.tar.gz"
  sha256 "abcdef1234567890..."
end
```

### Step 5: Test Installation

```bash
# Update Homebrew
brew update

# Install or upgrade
brew install Dylan-Natter/ripp/ripp
# or
brew upgrade ripp

# Verify
ripp --version
ripp validate examples/
```

## Testing the Formula Locally

Before pushing, test the formula locally:

```bash
# Install from local formula file
brew install --build-from-source Formula/ripp.rb

# Run tests
brew test ripp

# Uninstall
brew uninstall ripp
```

## Troubleshooting

### Checksum Mismatch

If users encounter checksum errors:

1. Verify the checksums in the formula match the release artifacts
2. Check that the URL points to the correct release
3. Clear Homebrew cache: `brew cleanup`

### Binary Not Found

If the binary is not found after installation:

1. Check that the binary name matches in the formula
2. Verify the tar.gz structure: `tar -tzf ripp-darwin-arm64.tar.gz`
3. Ensure the install block uses the correct binary name

### Version Not Found

If Homebrew cannot find the version:

1. Check that the release exists on GitHub
2. Verify the URL format matches GitHub's release URL structure
3. Ensure the tag name includes the 'v' prefix

## Automation (Future Enhancement)

Consider automating formula updates with:

- GitHub Actions to automatically update the formula on new releases
- PR-based formula updates using release-please or similar tools

## Resources

- [Homebrew Formula Cookbook](https://docs.brew.sh/Formula-Cookbook)
- [Homebrew Taps Documentation](https://docs.brew.sh/Taps)
- [RIPP Protocol Repository](https://github.com/Dylan-Natter/ripp-protocol)
