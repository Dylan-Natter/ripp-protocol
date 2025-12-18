# Auto-Versioning Setup with GitHub App Bypass

This guide provides detailed steps to implement automated version incrementing for the VS Code Extension while maintaining compliance with branch protection rules.

## Overview

The solution uses a GitHub App with bypass permissions to allow the workflow to commit version bumps directly to the `main` branch after a PR is merged, without violating branch protection rules.

## Prerequisites

- Repository administrator access
- GitHub organization or personal account ownership
- Access to create GitHub Apps

---

## Step 1: Create a GitHub App

### 1.1 Navigate to GitHub Apps Settings

**For Organization:**

1. Go to your organization page: `https://github.com/organizations/YOUR_ORG/settings/apps`
2. Click **"New GitHub App"**

**For Personal Account:**

1. Go to Settings → Developer settings → GitHub Apps
2. Click **"New GitHub App"**

### 1.2 Configure the GitHub App

Fill in the following details:

**GitHub App name:** `ripp-auto-versioning` (or your preferred name)

**Description:** `Automated versioning for RIPP VS Code Extension releases`

**Homepage URL:** `https://github.com/Dylan-Natter/ripp-protocol`

**Webhook:**

- Uncheck **"Active"** (we don't need webhook events)

**Permissions:**

Set **Repository permissions**:

- **Contents:** Read and write ✅
- **Metadata:** Read-only (automatically set)
- **Pull requests:** Read-only ✅ (optional, for PR context)

**Where can this GitHub App be installed?**

- Select **"Only on this account"**

### 1.3 Create the App

1. Click **"Create GitHub App"**
2. After creation, note down the **App ID** (you'll need this later)

### 1.4 Generate Private Key

1. On the app's settings page, scroll to **"Private keys"**
2. Click **"Generate a private key"**
3. A `.pem` file will be downloaded - **store this securely**
4. You'll use this private key in repository secrets

---

## Step 2: Install the App on Your Repository

### 2.1 Install the App

1. On the GitHub App settings page, click **"Install App"** (left sidebar)
2. Select your account/organization
3. Choose **"Only select repositories"**
4. Select `Dylan-Natter/ripp-protocol`
5. Click **"Install"**

### 2.2 Note the Installation ID

After installation, you'll be redirected to a URL like:

```
https://github.com/settings/installations/12345678
```

The number at the end (`12345678`) is your **Installation ID** - note this down.

---

## Step 3: Configure Repository Secrets

Add the following secrets to your repository:

1. Go to `https://github.com/Dylan-Natter/ripp-protocol/settings/secrets/actions`
2. Click **"New repository secret"**

### 3.1 Add APP_ID Secret

- **Name:** `VERSIONING_APP_ID`
- **Value:** The App ID from Step 1.3

### 3.2 Add Private Key Secret

- **Name:** `VERSIONING_APP_PRIVATE_KEY`
- **Value:** The entire contents of the `.pem` file (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

### 3.3 Add Installation ID Secret

- **Name:** `VERSIONING_APP_INSTALLATION_ID`
- **Value:** The Installation ID from Step 2.2

---

## Step 4: Update Branch Protection Rules

Configure branch protection to allow the app to bypass:

1. Go to `https://github.com/Dylan-Natter/ripp-protocol/settings/branches`
2. Edit the protection rule for `main` branch
3. Scroll to **"Restrict who can push to matching branches"**
4. Enable this setting
5. Add the GitHub App (`ripp-auto-versioning`) to the allowed list
6. Save changes

**Alternative:** Enable **"Allow specified actors to bypass required pull requests"** and add your GitHub App there.

---

## Step 5: Update the Workflow

Replace the current workflow with the auto-versioning version:

### 5.1 Create Token Generation Action

First, we need to use an action to generate a token from the GitHub App credentials.

Add this to the workflow (after checkout):

```yaml
- name: Generate GitHub App Token
  id: generate-token
  uses: actions/create-github-app-token@v1
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  with:
    app-id: ${{ secrets.VERSIONING_APP_ID }}
    private-key: ${{ secrets.VERSIONING_APP_PRIVATE_KEY }}
```

### 5.2 Update Workflow File

Replace `.github/workflows/vscode-extension-build.yml` with the following:

```yaml
name: Build VS Code Extension

on:
  push:
    branches: [main, copilot/**]
    paths:
      - 'tools/vscode-extension/**'
      - '.github/workflows/vscode-extension-build.yml'
  pull_request:
    branches: [main]
    paths:
      - 'tools/vscode-extension/**'
      - '.github/workflows/vscode-extension-build.yml'
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    name: Build and Package Extension
    runs-on: ubuntu-latest

    permissions:
      contents: write # Needed for auto-versioning on main

    defaults:
      run:
        working-directory: tools/vscode-extension

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Needed for version history
          token: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' && steps.generate-token.outputs.token || github.token }}

      - name: Generate GitHub App Token
        id: generate-token
        uses: actions/create-github-app-token@v1
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        with:
          app-id: ${{ secrets.VERSIONING_APP_ID }}
          private-key: ${{ secrets.VERSIONING_APP_PRIVATE_KEY }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: tools/vscode-extension/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Auto-increment version (main branch only)
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: |
          # Configure git with app identity
          git config user.name "ripp-auto-versioning[bot]"
          git config user.email "ripp-auto-versioning[bot]@users.noreply.github.com"

          # Increment patch version
          npm version patch -m "chore: bump version to %s [skip ci]"

          # Get new version
          NEW_VERSION=$(node -p "require('./package.json').version")
          echo "New version: ${NEW_VERSION}"

          # Update CHANGELOG
          CHANGELOG_DATE=$(date -u +%Y-%m-%d)
          PREV_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")

          if [ -n "$PREV_TAG" ]; then
            CHANGELOG_NOTES=$(git log --format="* %s" "${PREV_TAG}..HEAD^" 2>/dev/null || echo "* Version bump")
          else
            CHANGELOG_NOTES="* Initial release"
          fi

          # Insert changelog entry
          awk -v ver="${NEW_VERSION}" -v date="${CHANGELOG_DATE}" -v notes="${CHANGELOG_NOTES}" '
            /All notable changes.*will be documented/ {
              print;
              print "";
              print "## [" ver "] - " date;
              print "";
              print "### Changed";
              print "";
              n = split(notes, lines, "\n");
              for (i = 1; i <= n; i++) {
                if (length(lines[i]) > 0) print lines[i];
              }
              next;
            }
            { print }
          ' CHANGELOG.md > CHANGELOG.tmp && mv CHANGELOG.tmp CHANGELOG.md

          # Amend the version commit to include CHANGELOG
          git add CHANGELOG.md
          git commit --amend --no-edit

          # Update tag
          git tag -f "v${NEW_VERSION}"

          # Push using app token
          git push origin main --tags

          echo "VERSION=${NEW_VERSION}" >> $GITHUB_ENV

      - name: Get version from package.json (PR builds)
        if: github.event_name != 'push' || github.ref != 'refs/heads/main'
        run: |
          VERSION=$(node -p "require('./package.json').version")
          echo "VERSION=${VERSION}" >> $GITHUB_ENV

      - name: Set build ID
        run: |
          TIMESTAMP=$(date -u +%Y%m%d%H%M%S)
          SHORT_SHA=$(echo "${{ github.sha }}" | cut -c1-7)
          echo "BUILD_ID=${TIMESTAMP}.${SHORT_SHA}" >> $GITHUB_ENV

      - name: Validate version (Marketplace compliance)
        run: |
          VERSION="${{ env.VERSION }}"
          if ! echo "${VERSION}" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(\.[0-9]+)?$'; then
            echo "❌ Error: Version '${VERSION}' is not Marketplace-compliant"
            echo "Version must be 1-4 dot-separated integers (e.g., 0.1.0 or 1.2.3.4)"
            exit 1
          fi
          echo "✅ Version ${VERSION} is Marketplace-compliant"

      - name: Compile TypeScript
        run: npm run compile

      - name: Lint code
        run: npm run lint

      - name: Create output directory
        run: mkdir -p dist

      - name: Package extension (Marketplace-ready)
        run: npx @vscode/vsce package --no-dependencies --out dist/

      - name: Verify VSIX package
        run: |
          VSIX_COUNT=$(ls -1 dist/*.vsix 2>/dev/null | wc -l)
          if [ "$VSIX_COUNT" -eq 0 ]; then
            echo "❌ Error: No .vsix file was produced"
            exit 1
          fi
          VSIX_FILE=$(ls -1 dist/*.vsix | head -1)
          VSIX_BASENAME=$(basename "$VSIX_FILE")
          echo "✅ VSIX package created: $VSIX_BASENAME"

          if echo "$VSIX_BASENAME" | grep -qE '\-[0-9]+\.[0-9]+\.[0-9]+(\.[0-9]+)?\.vsix$'; then
            echo "✅ VSIX filename is Marketplace-compliant"
          else
            echo "❌ Error: VSIX filename may not be Marketplace-compliant"
            exit 1
          fi

      - name: Upload .vsix artifact
        uses: actions/upload-artifact@v4
        with:
          name: vscode-extension-${{ env.VERSION }}-build-${{ env.BUILD_ID }}
          path: tools/vscode-extension/dist/*.vsix
          retention-days: 30
          if-no-files-found: error

      - name: Generate summary
        if: always()
        run: |
          echo "# VS Code Extension Build Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Commit:** \`${{ github.sha }}\`" >> $GITHUB_STEP_SUMMARY
          echo "**Ref:** \`${{ github.ref }}\`" >> $GITHUB_STEP_SUMMARY
          echo "**Version:** \`${{ env.VERSION }}\`" >> $GITHUB_STEP_SUMMARY
          echo "**Build ID:** \`${{ env.BUILD_ID }}\`" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY

          VSIX_COUNT=$(ls -1 dist/*.vsix 2>/dev/null | wc -l)
          if [ "$VSIX_COUNT" -gt 0 ]; then
            VSIX_FILE=$(ls -1 dist/*.vsix | head -1)
            VSIX_BASENAME=$(basename "$VSIX_FILE")
            VSIX_SIZE=$(du -h "$VSIX_FILE" | cut -f1)
            echo "**Status:** ✅ Build successful" >> $GITHUB_STEP_SUMMARY
            echo "**Package:** \`$VSIX_BASENAME\`" >> $GITHUB_STEP_SUMMARY
            echo "**Size:** $VSIX_SIZE" >> $GITHUB_STEP_SUMMARY
          else
            echo "**Status:** ❌ Build failed" >> $GITHUB_STEP_SUMMARY
          fi
```

---

## Step 6: Testing the Setup

### 6.1 Test on a Non-Main Branch First

1. Create a test branch: `git checkout -b test-auto-version`
2. Make a small change to the extension
3. Push and create a PR
4. Merge the PR - the workflow should run but NOT auto-version (since it's a PR)

### 6.2 Test Auto-Versioning

1. Make a direct commit to main (if allowed) or merge a PR
2. The workflow should:
   - Increment the version in `package.json`
   - Update `CHANGELOG.md`
   - Create a git tag
   - Push changes back to main
3. Check that a new commit appears on main with the version bump

### 6.3 Verify Bypass Works

1. Check the commit author - it should show as `ripp-auto-versioning[bot]`
2. Verify that branch protection didn't block the push
3. Confirm the VSIX artifact was created with the new version

---

## Troubleshooting

### "Push declined due to repository rule violations"

**Solution:** Ensure the GitHub App is added to the bypass list in branch protection settings.

### "Resource not accessible by integration"

**Solution:** Verify the GitHub App has `contents: write` permission.

### "Invalid token"

**Solution:** Regenerate the private key and update the `VERSIONING_APP_PRIVATE_KEY` secret.

### Version not incrementing

**Solution:** Check that:

1. The workflow is running on the `main` branch
2. The condition `if: github.event_name == 'push' && github.ref == 'refs/heads/main'` is evaluating to true
3. The app token is being generated successfully

### CHANGELOG.md not found

**Solution:** Create an initial `tools/vscode-extension/CHANGELOG.md` file:

```markdown
# Changelog

All notable changes to the RIPP VS Code Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
```

---

## Security Considerations

### Private Key Storage

- **Never** commit the `.pem` file to the repository
- Store it securely in GitHub Secrets only
- Rotate the key periodically (every 6-12 months)

### App Permissions

- Grant minimum required permissions (only `contents: write`)
- Don't enable webhook if not needed
- Restrict installation to specific repositories only

### Monitoring

- Review the audit log periodically: `https://github.com/Dylan-Natter/ripp-protocol/settings/security_log`
- Monitor for unexpected version bumps
- Set up notifications for the app's activities

---

## Alternative: Simpler Implementation

If you want to avoid creating a GitHub App, you can use a **Personal Access Token (PAT)** with appropriate permissions, but this is **less secure** as it's tied to a user account:

1. Create a fine-grained PAT with `contents: write` for the repository
2. Add it as a secret: `VERSIONING_PAT`
3. Use it in the checkout step: `token: ${{ secrets.VERSIONING_PAT }}`

**Not recommended** because:

- Tied to a user account (audit trail less clear)
- May require broader permissions
- Less granular control

---

## Summary

This setup provides automated version incrementing while maintaining compliance with branch protection rules. The GitHub App approach is secure, auditable, and follows GitHub best practices for automation.

After implementation:

- ✅ Versions increment automatically on merge to main
- ✅ Branch protection rules remain enforced
- ✅ Clear audit trail via GitHub App identity
- ✅ No manual version updates needed
- ✅ CHANGELOG automatically updated
