# Copilot-Backed Analysis (VS Code Language Model API)

## Overview

RIPP's VS Code extension now supports using GitHub Copilot for AI-powered intent discovery, eliminating the need for external API keys or endpoint configuration.

## How It Works

The extension uses VS Code's Language Model API (`vscode.lm`) to access GitHub Copilot's language models directly within VS Code. This provides:

- ✅ **No API key management** - Uses your existing Copilot subscription
- ✅ **Secure authentication** - Handled by VS Code and GitHub Copilot extension
- ✅ **Same quality output** - Produces identical RIPP artifacts as endpoint mode
- ✅ **Offline-friendly** - Works wherever Copilot works
- ✅ **No external data transmission** - All processing stays within VS Code

## Prerequisites

1. **VS Code** version 1.85.0 or higher
2. **GitHub Copilot extension** installed and active
3. **GitHub Copilot subscription** (individual, business, or enterprise)
4. **RIPP CLI** installed in your project

## Setup

### 1. Install GitHub Copilot

If you don't already have GitHub Copilot:

1. Open VS Code Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for "GitHub Copilot"
3. Install the extension
4. Sign in with your GitHub account
5. Ensure your subscription is active

### 2. Configure RIPP for Copilot Mode

Run the command:

```
RIPP: Configure AI Mode
```

Select **"Copilot Mode"** from the quick pick menu.

This sets `ripp.ai.mode` to `"copilot"` in your workspace settings.

### 3. Optional: Customize Copilot Settings

You can customize Copilot behavior in VS Code settings:

- `ripp.ai.copilot.family` - Preferred model family (default: `"gpt-4o"`)
- `ripp.ai.copilot.justification` - Message shown to users during model access

## Usage

### Discover Intent with Copilot

1. **Build Evidence Pack** first:

   ```
   RIPP: Build Evidence Pack
   ```

2. **Run Copilot Discovery**:

   ```
   RIPP: Discover Intent (Copilot)
   ```

3. **Consent Flow**: On first use, VS Code will prompt you to allow the extension to access Copilot models. Click "Allow" to proceed.

4. **Wait for Analysis**: Copilot will analyze your evidence pack and generate candidate intent. This typically takes 10-30 seconds.

5. **Review Results**: Candidate intent is saved to `.ripp/candidates/intent-candidates.json`

### What Happens When You Run Discovery

1. Extension loads your evidence pack from `.ripp/evidence/evidence.index.json`
2. Constructs a structured prompt with RIPP inference rules
3. Requests Copilot model access (consent required on first use)
4. Sends prompt to Copilot language model
5. Streams response and parses JSON
6. Validates candidate structure (confidence scores, evidence refs, etc.)
7. Saves candidates to `.ripp/candidates/`
8. Updates workflow status

### Troubleshooting

#### "No Copilot models available"

**Cause**: GitHub Copilot extension is not installed, inactive, or you're not signed in.

**Solution**:

- Install GitHub Copilot extension from VS Code marketplace
- Sign in to GitHub within VS Code
- Verify your Copilot subscription is active
- Reload VS Code window

#### "No permission to access Copilot"

**Cause**: You denied model access, or your Copilot subscription doesn't have model API access.

**Solution**:

- Check that you clicked "Allow" in the consent dialog
- Verify your GitHub Copilot subscription status
- Try signing out and back in to GitHub within VS Code

#### "Request was blocked"

**Cause**: Content filtering or rate limiting by Copilot service.

**Solution**:

- Wait a few minutes and try again
- Check if your repository content triggers content filters
- Review evidence pack for sensitive information

#### Extension says "VS Code Language Model API is not available"

**Cause**: Your VS Code version is too old.

**Solution**:

- Update VS Code to version 1.85.0 or higher
- Reload VS Code after updating

## Differences from Endpoint Mode

| Feature          | Endpoint Mode                       | Copilot Mode                       |
| ---------------- | ----------------------------------- | ---------------------------------- |
| API Key Required | ✅ Yes                              | ❌ No                              |
| Provider Options | OpenAI, Azure OpenAI, Ollama        | GitHub Copilot only                |
| Configuration    | `.ripp/config.yaml` + SecretStorage | VS Code settings only              |
| Cost             | Pay-per-use API costs               | Included with Copilot subscription |
| Offline Support  | ❌ No (needs internet)              | ✅ Same as Copilot                 |
| Model Selection  | Configurable                        | Auto-selected by Copilot           |

## Best Practices

### When to Use Copilot Mode

- ✅ You have an active GitHub Copilot subscription
- ✅ You want zero-config AI discovery
- ✅ You don't want to manage API keys
- ✅ Your team already uses Copilot

### When to Use Endpoint Mode

- ✅ You need specific model versions (e.g., GPT-4-turbo)
- ✅ You're using Azure OpenAI with specific compliance requirements
- ✅ You're running Ollama locally for air-gapped environments
- ✅ You don't have access to GitHub Copilot

### Security Considerations

**Copilot Mode**:

- ✅ No secrets stored in repository
- ✅ Authentication handled by GitHub
- ✅ Evidence pack may be sent to Copilot service (subject to GitHub's privacy policy)
- ✅ Respects your organization's Copilot policies

**Endpoint Mode**:

- ⚠️ Requires storing API keys in VS Code SecretStorage
- ⚠️ Evidence pack sent to configured endpoint (OpenAI, Azure, etc.)
- ⚠️ You control the endpoint and data retention

## Architecture

### How Copilot Integration Works

1. **No CLI Changes**: The RIPP CLI remains unchanged. Copilot mode is extension-only.

2. **AIProvider Interface**: Extension implements the same `AIProvider` interface used by CLI.

3. **VS Code LM API**: Uses `vscode.lm.selectChatModels()` to access Copilot models.

4. **Consent Required**: Must be called from user-initiated command (VS Code requirement).

5. **Streaming Response**: Handles streamed responses via `for await (const chunk of response.text)`.

6. **Error Handling**: Graceful handling of `LanguageModelError` (NotFound, NoPermissions, Blocked).

### Code Structure

```
tools/vscode-extension/
├── src/
│   ├── ai/
│   │   └── copilotLmProvider.ts  # Copilot LM API implementation
│   ├── extension.ts               # Command registration
│   └── test/
│       └── copilotLmProvider.test.ts  # Unit tests
└── package.json                   # Configuration schema
```

## FAQ

### Does this require GitHub Copilot Chat?

No, only the base GitHub Copilot extension is required.

### Can I use this in GitHub Codespaces?

Yes! If Copilot works in your Codespace, RIPP Copilot mode will work too.

### Does this work with Copilot for Business?

Yes, it works with Individual, Business, and Enterprise subscriptions.

### What data is sent to GitHub?

The evidence pack (repository metadata, routes, schemas, dependencies) is sent to Copilot's language models. See [GitHub's Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement) for details.

### Can I use both modes in the same workspace?

Yes! You can switch between modes anytime using `RIPP: Configure AI Mode`.

## Related Documentation

- [VS Code Language Model API](https://code.visualstudio.com/api/extension-guides/language-model)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [RIPP Intent Discovery Workflow](https://dylan-natter.github.io/ripp-protocol/docs/INTENT-DISCOVERY-MODE)
- [RIPP VS Code Extension README](../../tools/vscode-extension/README.md)

## Support

If you encounter issues with Copilot mode:

1. Check this troubleshooting guide first
2. Verify VS Code and extensions are up to date
3. Try switching back to endpoint mode as a workaround
4. File an issue on GitHub with reproduction steps

---

**Last Updated**: December 2025  
**Extension Version**: 0.3.0+
