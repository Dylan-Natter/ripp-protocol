# Scripts

This directory contains helper scripts for maintaining and releasing the RIPP protocol tools.

## Documentation Validation

### validate-links.py

Python script to validate internal links in markdown files across the repository.

**Usage:**

```bash
python3 scripts/validate-links.py
```

**What it does:**

1. Scans all markdown files in the repository
2. Validates that all internal relative links point to existing files or directories
3. Handles special cases:
   - Wiki-style links (without .md extension) in docs/wiki/
   - Jekyll Liquid template syntax
   - External links (http/https)
   - Anchor-only links
4. Reports any broken links with file location and expected path

**Exit codes:**

- `0`: All links are valid
- `1`: One or more broken links found

**Requirements:**

- Python 3.6+
- No additional dependencies (uses standard library only)

**Example output:**

```
=== RIPP Protocol - Documentation Link Validator ===

✅ All internal links are valid!
   Checked markdown files in: docs/, tools/, examples/, *.md
```

## Homebrew Release Scripts

### update-homebrew-formula.sh

Helper script to generate the Homebrew formula update snippet with checksums from a GitHub release.

**Usage:**

```bash
./scripts/update-homebrew-formula.sh <version>
```

**Example:**

```bash
./scripts/update-homebrew-formula.sh v1.0.0
```

**What it does:**

1. Checks for GitHub CLI (`gh`) availability
2. Attempts to automatically fetch SHA256 checksums from the release
3. Generates a formatted snippet to update `Formula/ripp.rb` in the homebrew-ripp repository
4. Provides step-by-step instructions for completing the update

**Requirements:**

- bash
- curl (for fetching checksums)
- [GitHub CLI](https://cli.github.com/) (optional, but enables automatic checksum fetching)

**Output:**

The script outputs:

- The version and release URL being processed
- SHA256 checksums for ARM64 and AMD64 binaries
- A ready-to-paste Ruby snippet for the formula
- Next steps for testing and deploying the update

**Manual checksum retrieval:**

If GitHub CLI is not available, the script provides URLs where you can manually download the checksum files.

## See Also

- [Homebrew Release Checklist](../docs/HOMEBREW-RELEASE-CHECKLIST.md) - Complete release process
- [Homebrew Tap Setup](../docs/HOMEBREW-TAP-SETUP.md) - Initial tap repository setup
- [Homebrew Distribution](../docs/HOMEBREW.md) - Homebrew distribution overview
