# VS Code Extension: Progress Notification Fix

**Date**: 2025-12-21  
**Issue**: Stuck progress notifications in workflow commands  
**Resolution**: Refactored progress callback pattern

---

## Problem

Progress notifications in the VS Code extension's workflow commands (init, evidence build, discover, confirm, build) remained visible indefinitely after CLI command completion. Users experienced:

- Status message "RIPP: Building evidence pack..." stuck in notification area
- CLI completed successfully (verified by file timestamps and output)
- Required VS Code window reload to clear the notification
- Poor user experience with uncertainty about command completion

## Root Cause

User interaction dialogs (`vscode.window.showInformationMessage` with action buttons) were awaited inside `vscode.window.withProgress()` callbacks. This blocked the progress indicator from clearing until the user clicked a button or dismissed the dialog.

**Example of problematic pattern:**

```typescript
await vscode.window.withProgress(
  {
    location: vscode.ProgressLocation.Notification,
    title: 'RIPP: Building evidence pack...',
    cancellable: false
  },
  async () => {
    const result = await cliRunner.execute(...);
    if (result.success) {
      const action = await vscode.window.showInformationMessage(...); // Blocks here
      if (action === 'View Index') { ... }
    }
  }
);
```

## Solution

Refactored all workflow commands to:

1. Store success state in a variable during CLI execution
2. Complete the `withProgress` callback immediately after CLI finishes
3. Handle user interaction dialogs outside the progress callback

**Corrected pattern:**

```typescript
let succeeded = false;

await vscode.window.withProgress(
  {
    location: vscode.ProgressLocation.Notification,
    title: 'RIPP: Building evidence pack...',
    cancellable: false
  },
  async () => {
    const result = await cliRunner.execute(...);
    if (result.success) {
      succeeded = true;
    }
  }
);

// Handle user interaction after progress clears
if (succeeded) {
  const action = await vscode.window.showInformationMessage(...);
  if (action === 'View Index') { ... }
}
```

## Modified Functions

- `initRepository()` - Initialize workflow
- `buildEvidencePack()` - Build evidence pack
- `discoverIntent()` - AI intent discovery
- `confirmIntent()` - Confirm intent
- `buildArtifacts()` - Build canonical artifacts
- `discoverIntentWithCopilot()` - Copilot-based intent discovery

## Impact

**User Experience Improvements:**

- Progress notifications clear immediately when CLI completes
- Clear visual feedback that operations have finished
- Separate, non-blocking dialogs for post-completion actions
- No more stuck notifications requiring window reload

**Technical Benefits:**

- Consistent pattern across all workflow commands
- Better separation of concerns (progress tracking vs. user interaction)
- Improved maintainability with predictable behavior

## Testing

To verify the fix:

1. Open a workspace with RIPP extension installed
2. Run "RIPP: Build Evidence Pack" command
3. Observe progress notification appears
4. Wait for CLI to complete (~2 seconds)
5. Verify notification clears immediately
6. Action dialog appears separately
7. Dismiss or interact with dialog at your own pace

## Related Files

- `tools/vscode-extension/src/extension.ts` - Main extension file with workflow commands
- `tools/vscode-extension/CHANGELOG.md` - Version history
- `tools/vscode-extension/src/services/cliRunner.ts` - CLI execution service (unchanged)

## Best Practices

When implementing VS Code extension commands with progress notifications:

- **DO**: Extract user interaction outside `withProgress()` callbacks
- **DO**: Complete progress callbacks as soon as the operation finishes
- **DON'T**: Await user input inside progress callbacks
- **DON'T**: Block progress indicators on user decisions

This ensures responsive UI and clear feedback to users about operation status.
