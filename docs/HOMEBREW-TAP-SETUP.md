# homebrew-ripp Repository Setup

This is the complete setup for the `homebrew-ripp` tap repository.

## Repository Information

- **Name**: `homebrew-ripp`
- **Owner**: `Dylan-Natter`
- **URL**: `https://github.com/Dylan-Natter/homebrew-ripp`
- **Purpose**: Homebrew tap for RIPP CLI distribution

## Initial Repository Setup

### Step 1: Create the Repository

1. Go to GitHub and create a new repository
2. Name: `homebrew-ripp`
3. Description: "Homebrew tap for RIPP CLI - Regenerative Intent Prompting Protocol validator"
4. Public repository
5. Initialize with README

### Step 2: Clone and Set Up Structure

```bash
git clone https://github.com/Dylan-Natter/homebrew-ripp.git
cd homebrew-ripp
mkdir -p Formula
```

### Step 3: Create README.md

````markdown
# Homebrew Tap for RIPP

This tap provides the RIPP CLI (Regenerative Intent Prompting Protocol validator) for installation via Homebrew.

## Installation

```bash
brew tap Dylan-Natter/ripp
brew install ripp
```
````

## Usage

```bash
# Validate a RIPP file
ripp validate my-spec.ripp.yaml

# Initialize RIPP in a project
ripp init

# Show version
ripp --version
```

## About RIPP

RIPP is an open standard for capturing feature requirements as structured, machine-readable, human-reviewable specifications.

**Learn more:** [https://github.com/Dylan-Natter/ripp-protocol](https://github.com/Dylan-Natter/ripp-protocol)

## Issues

Report issues at: [https://github.com/Dylan-Natter/ripp-protocol/issues](https://github.com/Dylan-Natter/ripp-protocol/issues)

## License

MIT License - See the [main repository](https://github.com/Dylan-Natter/ripp-protocol) for details.

````

### Step 4: Create Formula/ripp.rb

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
````

### Step 5: Commit Initial Structure

```bash
git add .
git commit -m "Initial tap setup with RIPP formula"
git push origin main
```

## Updating for New Releases

### Automated Process (After Binary Build)

When a new version of RIPP CLI is released:

1. **Wait for binaries to be built**:
   - Push a tag in the main repo: `git tag v1.0.1 && git push origin v1.0.1`
   - GitHub Actions automatically builds binaries
   - Binaries are uploaded to GitHub Releases

2. **Get SHA256 checksums**:
   - Visit: `https://github.com/Dylan-Natter/ripp-protocol/releases/tag/v1.0.1`
   - Download or copy checksums from `.sha256` files

3. **Update Formula/ripp.rb**:

   ```ruby
   version "1.0.1"

   if Hardware::CPU.arm?
     url "https://github.com/Dylan-Natter/ripp-protocol/releases/download/v1.0.1/ripp-darwin-arm64.tar.gz"
     sha256 "abc123def456..."  # ARM64 checksum
   else
     url "https://github.com/Dylan-Natter/ripp-protocol/releases/download/v1.0.1/ripp-darwin-amd64.tar.gz"
     sha256 "789ghi012jkl..."  # AMD64 checksum
   end
   ```

4. **Commit and push**:

   ```bash
   git add Formula/ripp.rb
   git commit -m "ripp 1.0.1"
   git push origin main
   ```

5. **Test the update**:
   ```bash
   brew update
   brew upgrade ripp
   ripp --version  # Should show 1.0.1
   ```

## Testing the Formula

### Local Testing

```bash
# Test formula syntax
brew audit --strict Formula/ripp.rb

# Install from local formula
brew install --build-from-source Formula/ripp.rb

# Run tests
brew test ripp

# Verify installation
ripp --version
ripp validate --help

# Uninstall
brew uninstall ripp
```

### Testing from Tap

```bash
# Ensure tap is added
brew tap Dylan-Natter/ripp

# Update tap
brew update

# Install
brew install ripp

# Test
ripp --version

# Uninstall
brew uninstall ripp
```

## Maintenance Checklist

- [ ] Binary releases are created automatically via GitHub Actions
- [ ] SHA256 checksums match between formula and releases
- [ ] Formula tests pass on both ARM64 and AMD64
- [ ] Version numbers are consistent across formula and binary
- [ ] Formula syntax passes `brew audit --strict`

## Troubleshooting

### Issue: Checksum Mismatch

**Symptom**: Users get checksum verification errors

**Solution**:

1. Verify checksums in formula match GitHub releases
2. Re-download checksums from release page
3. Update formula with correct values

### Issue: Binary Not Executable

**Symptom**: Permission denied when running ripp

**Solution**:

1. Verify binary is marked executable in tar.gz
2. Check install block sets correct permissions
3. Test locally: `chmod +x ripp-darwin-arm64`

### Issue: Formula Not Found

**Symptom**: `brew install ripp` says formula not found

**Solution**:

1. Run `brew update` to refresh taps
2. Verify tap is added: `brew tap`
3. Check formula path: `Formula/ripp.rb` (case-sensitive)

## Resources

- [Homebrew Formula Cookbook](https://docs.brew.sh/Formula-Cookbook)
- [Homebrew Tap Documentation](https://docs.brew.sh/Taps)
- [Main RIPP Repository](https://github.com/Dylan-Natter/ripp-protocol)

## Support

For issues with:

- **Installation**: Open issue in homebrew-ripp
- **RIPP functionality**: Open issue in ripp-protocol
- **Documentation**: Open issue in ripp-protocol
