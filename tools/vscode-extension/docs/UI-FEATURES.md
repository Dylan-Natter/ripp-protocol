# VS Code Extension UI Features

This document describes the new UI features added to the RIPP VS Code extension.

## RIPP Activity Bar & Sidebar

The extension now includes a dedicated view in VS Code's Activity Bar (the left sidebar with icons).

### Accessing the Sidebar

1. Click the package icon (📦) in the Activity Bar on the left side of VS Code
2. The RIPP sidebar will open, showing:
   - **Initialization Status**: Whether RIPP is initialized in your workspace
   - **Last Validation Result**: Pass/fail status with timestamp
   - **Actions**: Quick access buttons for common tasks

### Available Actions

From the sidebar, you can:

- **Initialize RIPP**: Set up RIPP structure in your repository
- **Validate RIPP**: Run validation on all RIPP packets
- **Open RIPP Docs**: Open the protocol documentation in your browser
- **Open CI / GitHub Actions**: View your GitHub Actions workflows (if available)

## Initialize RIPP (Enhanced)

The initialize command now includes safety features:

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run `RIPP: Initialize Repository`
3. A modal dialog shows you exactly which files will be created:
   - `ripp/` directory structure
   - `ripp/README.md`
   - `ripp/features/`, `ripp/handoffs/`, `ripp/packages/`
   - `.github/workflows/ripp-validate.yml`
4. Choose:
   - **Initialize**: Create files (skip existing)
   - **Force (Overwrite)**: Overwrite existing files
   - **Cancel**: Abort without changes
5. After initialization:
   - Sidebar automatically refreshes
   - Option to open the RIPP folder or view changes in source control

## Problems Panel Integration

Validation results now appear directly in VS Code's Problems panel.

### How It Works

1. Run `RIPP: Validate Packet(s)`
2. Open the Problems panel (View → Problems or `Ctrl+Shift+M` / `Cmd+Shift+M`)
3. See all validation errors and warnings
4. Click any problem to jump to the file and line

### Problem Format

Each diagnostic includes:

- **Severity**: Error (🔴), Warning (🟡), or Info (🔵)
- **File**: The RIPP packet file with the issue
- **Line**: Line number (if available)
- **Message**: Description of the validation issue
- **Source**: "RIPP" label

## Validation Report Viewer

After running validation, view detailed results in a dedicated webview panel.

### Features

- **Summary**: Pass/fail status, issue count, timestamp
- **Findings Table**: All issues in a structured table format
  - Severity column with visual indicators
  - File and line number
  - Full error message
- **Export Options**:
  - Copy to clipboard
  - Export as JSON
  - Export as Markdown

### Accessing the Report

1. Run `RIPP: Validate Packet(s)`
2. The Validation Report panel appears in the RIPP sidebar
3. Review findings and export as needed

## GitHub CI Integration

Quickly access your GitHub Actions workflows from within VS Code.

### How It Works

1. Ensure your workspace has a GitHub remote configured
2. Click "Open CI / GitHub Actions" in the RIPP sidebar
   - Or run `RIPP: Open CI / GitHub Actions` from Command Palette
3. Your default browser opens to the GitHub Actions page for your repository

### Requirements

- Git repository with GitHub remote URL configured
- Remote must be a github.com URL

## Workspace Trust

All RIPP commands that execute the CLI respect VS Code's Workspace Trust feature.

### What This Means

- In **trusted workspaces**: All commands work normally
- In **untrusted workspaces**: Commands that execute the RIPP CLI are blocked
- You'll see a warning explaining Workspace Trust with a link to learn more

### Commands Requiring Trust

- RIPP: Initialize Repository
- RIPP: Validate Packet(s)
- RIPP: Lint Packet(s)
- RIPP: Package Handoff
- RIPP: Analyze Project

### Commands NOT Requiring Trust

- RIPP: Open Documentation (just opens a URL)
- RIPP: Refresh Status (just updates UI)

## Output Channel

All CLI output streams to a dedicated "RIPP" output channel.

### Viewing Output

1. Open Output panel (View → Output or `Ctrl+Shift+U` / `Cmd+Shift+U`)
2. Select "RIPP" from the dropdown
3. See real-time output from RIPP CLI commands

### What's Logged

- Command execution details (which CLI is being used)
- Full stdout and stderr from RIPP CLI
- Error messages and diagnostics

## Configuration

All existing configuration options are preserved:

### `ripp.cliMode`

- `"npx"` (default): Uses local binary or falls back to npx
- `"npmScript"`: Uses npm scripts

### `ripp.strict`

- Enable strict linting mode (warnings become errors)

### `ripp.paths`

- Glob patterns for discovering RIPP packet files
- Default: `["**/*.ripp.yaml", "**/*.ripp.json"]`

## Keyboard Shortcuts

All commands are available via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- Type "RIPP" to see all available commands
- Commands are grouped under the "RIPP" category

## Tips

1. **Pin the sidebar**: Right-click the RIPP Activity Bar icon → Keep in Activity Bar
2. **Quick validation**: Use the sidebar button instead of Command Palette for faster access
3. **Monitor validation**: Keep the Output panel open to see real-time CLI output
4. **Export reports**: Use the report viewer to share validation results with your team
5. **CI integration**: Quickly check GitHub Actions status without leaving VS Code

## Troubleshooting

### Sidebar not showing

- Ensure you have a workspace folder open
- Click the refresh button in the RIPP sidebar
- Restart VS Code

### Commands not working

- Check Workspace Trust settings (File → Preferences → Trust)
- Ensure RIPP CLI is installed (`npm install -D ripp-cli`)
- Check the RIPP output channel for errors

### No validation results

- Ensure you have RIPP packet files in your workspace
- Check that files match the configured glob patterns
- Verify packets have `.ripp.yaml` or `.ripp.json` extension

### GitHub CI button not working

- Ensure your workspace has a git remote configured
- Verify the remote is a GitHub URL
- Check git configuration: `git remote get-url origin`
