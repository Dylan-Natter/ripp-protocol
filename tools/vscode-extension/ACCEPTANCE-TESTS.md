# RIPP VS Code Extension vNext - Acceptance Test Checklist

## Prerequisites
- [ ] VS Code Desktop installed (version 1.85.0 or higher)
- [ ] Node.js 18+ installed
- [ ] Test repository available (can be empty)

## Phase 1: Installation & Activation
- [ ] Extension compiles without errors (`npm run compile`)
- [ ] Extension lints without errors (`npm run lint`)
- [ ] Extension packages successfully (`npm run package`)
- [ ] Extension activates when RIPP sidebar is opened
- [ ] No errors in VS Code Developer Console (Help → Toggle Developer Tools)

## Phase 2: Workspace Setup
- [ ] Open test workspace in VS Code
- [ ] RIPP icon appears in Activity Bar
- [ ] Click RIPP icon - sidebar opens
- [ ] Workflow steps 1-5 are visible
- [ ] Utilities section shows config/connections actions

## Phase 3: CLI Detection
- [ ] Without CLI installed: Shows installation help
- [ ] With CLI installed: Detects version correctly
- [ ] CLI version check works (logs to Output panel)
- [ ] Version mismatch shows upgrade prompt

## Phase 4: Workflow Step 1 - Initialize
- [ ] Step 1 shows "Ready" status when not initialized
- [ ] Click "Run 1. Initialize"
- [ ] Confirmation dialog shows file preview
- [ ] Click "Initialize" - creates `.ripp/` directory
- [ ] Step 1 status changes to "Done"
- [ ] `.ripp/config.yaml` created with default values
- [ ] Option to "Edit Config" appears

## Phase 5: Config Management
- [ ] Click "Configuration" in Utilities
- [ ] `.ripp/config.yaml` opens in editor
- [ ] File is valid YAML
- [ ] Can edit `ai.enabled` to `true`
- [ ] Save file - no errors

## Phase 6: Secrets Management
- [ ] Click "Connections" in Utilities
- [ ] Provider selection appears (OpenAI, Azure, Ollama)
- [ ] Select OpenAI
- [ ] Enter API key (masked input)
- [ ] Success message appears
- [ ] Secrets stored in SecretStorage (not in repo)

## Phase 7: Workflow Step 2 - Build Evidence
- [ ] Step 2 shows "Ready" status after init
- [ ] Click "Run 2. Build Evidence Pack"
- [ ] Progress notification appears
- [ ] Evidence pack builds successfully
- [ ] Step 2 status changes to "Done"
- [ ] `.ripp/evidence/` directory created
- [ ] `evidence.index.json` exists
- [ ] Can click on output files to open them

## Phase 8: AI Policy Check
- [ ] With `ai.enabled: false` in config:
  - [ ] Step 3 shows error message
  - [ ] Suggests editing config
- [ ] With `ai.enabled: true` but no secrets:
  - [ ] Step 3 shows error message
  - [ ] Suggests configuring connections
- [ ] With `ai.enabled: true` and secrets:
  - [ ] Step 3 shows "Ready" status

## Phase 9: Workflow Step 3 - Discover Intent (AI)
- [ ] Prerequisites met (evidence + AI configured)
- [ ] Click "Run 3. Discover Intent (AI)"
- [ ] Progress notification appears
- [ ] AI discovery runs (may take time)
- [ ] Step 3 status changes to "Done"
- [ ] `.ripp/candidates/` directory created
- [ ] Candidate intent files created
- [ ] Can view candidate files

## Phase 10: Workflow Step 4 - Confirm Intent
- [ ] Step 4 shows "Ready" after discovery
- [ ] Click "Run 4. Confirm Intent"
- [ ] Interactive confirmation starts
- [ ] Can accept/modify intent
- [ ] Step 4 status changes to "Done"
- [ ] `.ripp/confirmed/` directory created
- [ ] Confirmed intent files created

## Phase 11: Workflow Step 5 - Build Artifacts
- [ ] Step 5 shows "Ready" after confirmation
- [ ] Click "Run 5. Build + Validate + Package"
- [ ] Progress notification appears
- [ ] RIPP artifacts built
- [ ] Step 5 status changes to "Done"
- [ ] `.ripp/*.ripp.yaml` files created

## Phase 12: Validation
- [ ] Click "Validate" from Command Palette
- [ ] Validation runs successfully
- [ ] Problems panel shows any issues
- [ ] Validation report appears in sidebar
- [ ] Can click errors to jump to location

## Phase 13: Packaging
- [ ] Click "RIPP: Package Handoff"
- [ ] File save dialog appears
- [ ] Choose output location and format (.md or .zip)
- [ ] Package created successfully
- [ ] Option to "Open File" or "Reveal in Finder"
- [ ] Packaged file contains expected content

## Phase 14: Diagnostics Integration
- [ ] Validation errors appear in Problems panel
- [ ] Click error - jumps to correct file/line
- [ ] Errors have clear messages
- [ ] Can see error severity (error/warning/info)

## Phase 15: Output Channel
- [ ] View → Output → Select "RIPP"
- [ ] All commands log to output
- [ ] Command execution visible
- [ ] CLI path shown (local vs npx)
- [ ] Error messages clearly visible

## Phase 16: Workflow Status Persistence
- [ ] Complete workflow steps 1-5
- [ ] Close and reopen VS Code
- [ ] Workflow status persists
- [ ] Completed steps show "Done" status
- [ ] Output files still accessible

## Phase 17: Error Handling
- [ ] Run command without workspace open - shows error
- [ ] Run AI command without config - shows helpful message
- [ ] Run command with CLI missing - shows install help
- [ ] Invalid config YAML - shows parse error

## Phase 18: Workspace Trust
- [ ] Open untrusted workspace
- [ ] Try to run RIPP command
- [ ] Shows workspace trust error
- [ ] Provides "Learn More" link

## Phase 19: GitHub Codespaces (Optional)
- [ ] Open project in Codespaces
- [ ] Install RIPP CLI in Codespace
- [ ] Extension activates
- [ ] All workflow steps work
- [ ] Can configure AI in Codespace

## Phase 20: Cross-Platform (Optional)
- [ ] Test on Windows (CLI detection with .cmd)
- [ ] Test on macOS (standard binary)
- [ ] Test on Linux (standard binary)

## Regression Tests
- [ ] Legacy "Lint" command still works
- [ ] Legacy "Validate" command still works
- [ ] Legacy "Package" command still works
- [ ] "Open Docs" command works
- [ ] "Open CI" command works (with GitHub repo)

## Performance
- [ ] Extension activates quickly (< 2 seconds)
- [ ] Workflow sidebar renders quickly
- [ ] Commands execute without blocking UI
- [ ] No memory leaks after multiple command runs
- [ ] Output channel doesn't slow down with large logs

## Security
- [ ] API keys NOT in `.ripp/config.yaml`
- [ ] API keys NOT in git history
- [ ] Secrets only in VS Code SecretStorage
- [ ] Environment variables filtered properly
- [ ] No secrets in Output panel logs

## Documentation
- [ ] README accurately describes features
- [ ] Quick Start guide works for new users
- [ ] Configuration examples are correct
- [ ] Troubleshooting section is helpful
- [ ] Release notes are accurate

## Polish
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All icons display correctly
- [ ] Status icons (○ ◌ ◐ ● ✗) render properly
- [ ] Workflow step descriptions are clear
- [ ] Error messages are actionable
- [ ] Success messages are encouraging

## Final Verification
- [ ] Can complete full workflow end-to-end
- [ ] Can package and deliver handoff artifact
- [ ] Extension behaves as thin wrapper over CLI
- [ ] All logs show CLI commands being executed
- [ ] User feels guided and supported throughout

---

## Test Results

**Date:** _______________  
**Tester:** _______________  
**Platform:** _______________  
**VS Code Version:** _______________  
**RIPP CLI Version:** _______________  

**Pass Rate:** _____ / _____ tests passed

**Critical Issues Found:**

**Notes:**
