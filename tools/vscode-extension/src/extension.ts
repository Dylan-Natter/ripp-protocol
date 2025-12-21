import * as vscode from 'vscode';
import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { RippWorkflowProvider } from './views/workflowProvider';
import { RippDiagnosticsProvider } from './diagnosticsProvider';
import { RippReportViewProvider, ValidationReport, Finding } from './reportViewProvider';
import { CliRunner } from './services/cliRunner';
import { ConfigService } from './services/configService';
import { SecretService } from './services/secretService';
import { WorkspaceMapService } from './services/workspaceMapService';
import {
  CopilotLmProvider,
  CopilotNotAvailableError,
  CopilotPermissionError
} from './ai/copilotLmProvider';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

const execFileAsync = promisify(execFile);

/**
 * RIPP VS Code Extension vNext
 *
 * World-class protocol UX with thin UI layer over deterministic CLI.
 *
 * Architecture:
 * - Services: CLI runner, config manager, secrets manager, workspace map
 * - Views: 5-step workflow sidebar, webviews for config/secrets/evidence/intent
 * - Providers: Diagnostics, validation reports
 *
 * Core Principles:
 * - CLI is the engine and single source of truth
 * - Extension is thin UI orchestration layer
 * - No secrets in repo files (use SecretStorage)
 * - Respect AI policy and precedence
 * - Transparent logging for all operations
 * - Dynamic path discovery (never hardcode paths)
 */

// Global services and providers
let outputChannel: vscode.OutputChannel;
let cliRunner: CliRunner;
let configService: ConfigService;
let secretService: SecretService;
let workspaceMapService: WorkspaceMapService;
let workflowProvider: RippWorkflowProvider;
let diagnosticsProvider: RippDiagnosticsProvider;
let reportViewProvider: RippReportViewProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log('RIPP Protocol extension vNext is activating...');

  // Create shared output channel
  outputChannel = vscode.window.createOutputChannel('RIPP');
  context.subscriptions.push(outputChannel);

  // Initialize services
  cliRunner = CliRunner.getInstance(outputChannel);
  configService = ConfigService.getInstance();
  secretService = SecretService.getInstance(context.secrets);
  workspaceMapService = WorkspaceMapService.getInstance();

  // Initialize providers
  workflowProvider = new RippWorkflowProvider();
  diagnosticsProvider = new RippDiagnosticsProvider();
  reportViewProvider = new RippReportViewProvider(context.extensionUri);

  // Register TreeView for workflow sidebar
  const treeView = vscode.window.createTreeView('rippStatus', {
    treeDataProvider: workflowProvider,
    showCollapseAll: true
  });
  context.subscriptions.push(treeView);

  // Register WebView for report viewer
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(RippReportViewProvider.viewType, reportViewProvider)
  );

  // Register workflow commands
  registerWorkflowCommands(context);

  // Register utility commands
  registerUtilityCommands(context);

  // Register diagnostics provider
  context.subscriptions.push(diagnosticsProvider);

  // TEST: Simple command to verify registration works
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.test', () => {
      vscode.window.showInformationMessage('RIPP Test Command Works!');
    })
  );

  // Check CLI version on activation
  checkCliVersion();

  console.log('RIPP Protocol extension vNext is now active');
}

export function deactivate() {
  // Cleanup if needed
}

/**
 * Get workspace map service instance (exported for testing and future use)
 */
export function getWorkspaceMapService(): WorkspaceMapService {
  return workspaceMapService;
}

/**
 * Register 5-step workflow commands
 */
function registerWorkflowCommands(context: vscode.ExtensionContext) {
  // Step 1: Initialize
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.init', async () => {
      await executeWorkflowStep('init', async () => {
        await initRepository();
      });
    })
  );

  // Step 2: Build Evidence Pack
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.evidence.build', async () => {
      await executeWorkflowStep('evidence', async () => {
        await buildEvidencePack();
      });
    })
  );

  // Step 3: Discover Intent (AI)
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.discover', async () => {
      await executeWorkflowStep('discover', async () => {
        await discoverIntent();
      });
    })
  );

  // Step 4: Confirm Intent
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.confirm', async () => {
      await executeWorkflowStep('confirm', async () => {
        await confirmIntent();
      });
    })
  );

  // Step 5: Build Canonical Artifacts
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.build', async () => {
      await executeWorkflowStep('finalize', async () => {
        await buildArtifacts();
      });
    })
  );

  // Also register validate and package under step 5
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.validate', async () => {
      await validatePackets();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.package', async () => {
      await packageHandoff();
    })
  );
}

/**
 * Register utility commands
 */
function registerUtilityCommands(context: vscode.ExtensionContext) {
  // Config editor
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.config.edit', async () => {
      await editConfig();
    })
  );

  // Connections editor
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.connections.edit', async () => {
      await editConnections();
    })
  );

  // Refresh workflow
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.refreshStatus', () => {
      workflowProvider.refresh();
    })
  );

  // Open docs
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.openDocs', () => {
      vscode.env.openExternal(vscode.Uri.parse('https://dylan-natter.github.io/ripp-protocol'));
    })
  );

  // Open CI
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.openCI', async () => {
      await openCI();
    })
  );

  // Legacy commands for backward compatibility
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.lint', async () => {
      await lintPackets();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.analyze', async () => {
      await analyzeProject();
    })
  );

  // Copilot-powered commands
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.discover.copilot', async () => {
      await discoverIntentWithCopilot();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.analyze.copilot', async () => {
      await analyzeProjectWithCopilot();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.ai.configureMode', async () => {
      console.log('[RIPP] Configure AI Mode command invoked');
      outputChannel.appendLine('[RIPP] Configure AI Mode command invoked');
      await configureAiMode();
    })
  );

  // Smart discovery command that routes to appropriate method based on config
  context.subscriptions.push(
    vscode.commands.registerCommand('ripp.discover.smart', async () => {
      const mode = getActiveAiMode();
      if (mode === 'copilot') {
        await discoverIntentWithCopilot();
      } else {
        await discoverIntent();
      }
    })
  );
}

/**
 * Helper: Execute a workflow step with error handling and status updates
 */
async function executeWorkflowStep(stepId: string, action: () => Promise<void>): Promise<void> {
  try {
    workflowProvider.updateStepStatus(stepId, 'in-progress');
    await action();
    workflowProvider.updateStepStatus(stepId, 'done', Date.now());
  } catch (error) {
    workflowProvider.updateStepStatus(stepId, 'error');
    throw error;
  }
}

/**
 * Get workspace root path
 */
function getWorkspaceRoot(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage('No workspace folder open');
    return undefined;
  }
  return workspaceFolders[0].uri.fsPath;
}

/**
 * Check if workspace is trusted
 */
function checkWorkspaceTrust(): boolean {
  if (!vscode.workspace.isTrusted) {
    vscode.window
      .showErrorMessage(
        'RIPP commands cannot run in an untrusted workspace. Please trust this workspace first.',
        'Learn More'
      )
      .then(selection => {
        if (selection === 'Learn More') {
          vscode.env.openExternal(
            vscode.Uri.parse('https://code.visualstudio.com/docs/editor/workspace-trust')
          );
        }
      });
    return false;
  }
  return true;
}

/**
 * Check CLI version and show help if needed
 */
async function checkCliVersion(): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return;
  }

  try {
    const versionCheck = await cliRunner.checkVersion(workspaceRoot);

    if (!versionCheck.isInstalled) {
      // Don't show on every activation - only if user tries to run a command
      return;
    }

    if (!versionCheck.isSufficient && versionCheck.currentVersion) {
      await cliRunner.showVersionMismatchHelp(
        versionCheck.currentVersion,
        versionCheck.requiredVersion
      );
    }
  } catch {
    // Silently fail - CLI might not be installed yet
  }
}

/**
 * Get AI environment state
 */
async function getAiState(workspaceRoot: string): Promise<{
  repoAllows: boolean;
  locallyEnabled: boolean;
  hasSecrets: boolean;
  canUseAi: boolean;
}> {
  const repoAllows = configService.configExists(workspaceRoot)
    ? configService.getAiEnabled(workspaceRoot)
    : false;

  const config = vscode.workspace.getConfiguration('ripp');
  const locallyEnabled = config.get<boolean>('ai.enabledLocally', false);
  const hasSecrets = await secretService.hasSecrets();

  const canUseAi = repoAllows && locallyEnabled && hasSecrets;

  return { repoAllows, locallyEnabled, hasSecrets, canUseAi };
}

/**
 * Get environment variables for CLI execution
 */
async function getCliEnvironment(
  workspaceRoot: string,
  enableAi: boolean = false
): Promise<NodeJS.ProcessEnv> {
  let env: NodeJS.ProcessEnv = {};

  if (enableAi) {
    const aiState = await getAiState(workspaceRoot);
    if (aiState.canUseAi) {
      env.RIPP_AI_ENABLED = 'true';
      const secretEnv = await secretService.getEnvironmentVariables();
      env = { ...env, ...secretEnv };
    }
  }

  return env;
}

// ============================================================================
// Workflow Commands Implementation
// ============================================================================

/**
 * Step 1: Initialize Repository
 */
async function initRepository(): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !checkWorkspaceTrust()) {
    return;
  }

  // Check CLI first
  const versionCheck = await cliRunner.checkVersion(workspaceRoot);
  if (!versionCheck.isInstalled) {
    await cliRunner.showInstallHelp();
    return;
  }
  if (!versionCheck.isSufficient && versionCheck.currentVersion) {
    await cliRunner.showVersionMismatchHelp(
      versionCheck.currentVersion,
      versionCheck.requiredVersion
    );
    return;
  }

  // Show preview
  const previewItems = [
    '.ripp/',
    '.ripp/config.yaml',
    '.ripp/README.md',
    '.github/workflows/ripp-validate.yml (if .github exists)'
  ];

  const previewMessage = `RIPP will create:\n\n${previewItems.map(item => `  • ${item}`).join('\n')}`;

  const choice = await vscode.window.showInformationMessage(
    'Initialize RIPP in this repository?',
    { modal: true, detail: previewMessage },
    'Initialize',
    'Cancel'
  );

  if (choice !== 'Initialize') {
    return;
  }

  let succeeded = false;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'RIPP: Initializing repository...',
      cancellable: false
    },
    async () => {
      try {
        const result = await cliRunner.execute({
          args: ['init'],
          cwd: workspaceRoot
        });

        if (result.success) {
          succeeded = true;
          workflowProvider.refresh();
        } else {
          vscode.window.showErrorMessage('RIPP initialization failed. Check output for details.');
        }
      } catch (error: any) {
        if (error.code === 'CLI_NOT_FOUND') {
          await cliRunner.showInstallHelp();
        } else {
          vscode.window.showErrorMessage(`RIPP initialization failed: ${error.message}`);
        }
      }
    }
  );

  // Handle user interaction after progress clears
  if (succeeded) {
    const action = await vscode.window.showInformationMessage(
      'RIPP initialized successfully!',
      'Edit Config',
      'View Folder'
    );

    if (action === 'Edit Config') {
      await editConfig();
    } else if (action === 'View Folder') {
      const rippUri = vscode.Uri.file(path.join(workspaceRoot, '.ripp'));
      await vscode.commands.executeCommand('revealInExplorer', rippUri);
    }
  }
}

/**
 * Step 2: Build Evidence Pack
 */
async function buildEvidencePack(): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !checkWorkspaceTrust()) {
    return;
  }

  let succeeded = false;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'RIPP: Building evidence pack...',
      cancellable: false
    },
    async () => {
      try {
        const result = await cliRunner.execute({
          args: ['evidence', 'build'],
          cwd: workspaceRoot
        });

        if (result.success) {
          succeeded = true;

          // Update outputs
          workflowProvider.updateStepOutputs('evidence', [
            '.ripp/evidence/evidence.index.json',
            '.ripp/evidence/routes.json',
            '.ripp/evidence/schemas.json'
          ]);
        } else {
          vscode.window.showErrorMessage(
            'Failed to build evidence pack. Check output for details.'
          );
        }
      } catch (error: any) {
        if (error.code === 'CLI_NOT_FOUND') {
          await cliRunner.showInstallHelp();
        } else {
          vscode.window.showErrorMessage(`Evidence build failed: ${error.message}`);
        }
      }
    }
  );

  // Handle user interaction after progress clears
  if (succeeded) {
    const action = await vscode.window.showInformationMessage(
      'Evidence pack built successfully!',
      'View Index',
      'View Folder'
    );

    if (action === 'View Index') {
      const indexUri = vscode.Uri.file(
        path.join(workspaceRoot, '.ripp', 'evidence', 'evidence.index.json')
      );
      const doc = await vscode.workspace.openTextDocument(indexUri);
      await vscode.window.showTextDocument(doc);
    } else if (action === 'View Folder') {
      const evidenceUri = vscode.Uri.file(path.join(workspaceRoot, '.ripp', 'evidence'));
      await vscode.commands.executeCommand('revealInExplorer', evidenceUri);
    }
  }
}

/**
 * Step 3: Discover Intent (AI)
 */
async function discoverIntent(): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !checkWorkspaceTrust()) {
    return;
  }

  // Check AI state
  const aiState = await getAiState(workspaceRoot);

  if (!aiState.repoAllows) {
    vscode.window
      .showErrorMessage(
        'AI is disabled in repository config (.ripp/config.yaml). Enable it in config first.',
        'Edit Config'
      )
      .then(selection => {
        if (selection === 'Edit Config') {
          editConfig();
        }
      });
    return;
  }

  if (!aiState.locallyEnabled) {
    const choice = await vscode.window.showInformationMessage(
      'AI is not enabled locally. Enable it to use discovery?',
      'Enable AI',
      'Cancel'
    );

    if (choice === 'Enable AI') {
      await vscode.workspace
        .getConfiguration('ripp')
        .update('ai.enabledLocally', true, vscode.ConfigurationTarget.Workspace);
    } else {
      return;
    }
  }

  if (!aiState.hasSecrets) {
    const choice = await vscode.window.showErrorMessage(
      'AI connection not configured. Set up your API keys first.',
      'Configure Connection'
    );

    if (choice === 'Configure Connection') {
      await editConnections();
    }
    return;
  }

  let succeeded = false;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'RIPP: Discovering intent with AI...',
      cancellable: false
    },
    async () => {
      try {
        const env = await getCliEnvironment(workspaceRoot, true);

        const result = await cliRunner.execute({
          args: ['discover'],
          cwd: workspaceRoot,
          env
        });

        if (result.success) {
          succeeded = true;
          workflowProvider.refresh();
        } else {
          vscode.window.showErrorMessage('Intent discovery failed. Check output for details.');
        }
      } catch (error: any) {
        if (error.code === 'CLI_NOT_FOUND') {
          await cliRunner.showInstallHelp();
        } else {
          vscode.window.showErrorMessage(`Intent discovery failed: ${error.message}`);
        }
      }
    }
  );

  // Handle user interaction after progress clears
  if (succeeded) {
    const action = await vscode.window.showInformationMessage(
      'Intent discovery complete!',
      'View Candidates',
      'Next: Confirm'
    );

    if (action === 'View Candidates') {
      const candidatesDir = path.join(workspaceRoot, '.ripp', 'candidates');
      await vscode.commands.executeCommand('revealInExplorer', vscode.Uri.file(candidatesDir));
    } else if (action === 'Next: Confirm') {
      await vscode.commands.executeCommand('ripp.confirm');
    }
  }
}

/**
 * Step 4: Confirm Intent
 */
async function confirmIntent(): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !checkWorkspaceTrust()) {
    return;
  }

  let succeeded = false;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'RIPP: Confirming intent...',
      cancellable: false
    },
    async () => {
      try {
        const result = await cliRunner.execute({
          args: ['confirm', '--checklist'],
          cwd: workspaceRoot
        });

        if (result.success) {
          succeeded = true;
          workflowProvider.refresh();
        } else {
          vscode.window.showErrorMessage('Intent confirmation failed. Check output for details.');
        }
      } catch (error: any) {
        if (error.code === 'CLI_NOT_FOUND') {
          await cliRunner.showInstallHelp();
        } else {
          vscode.window.showErrorMessage(`Intent confirmation failed: ${error.message}`);
        }
      }
    }
  );

  // Handle user interaction after progress clears
  if (succeeded) {
    const action = await vscode.window.showInformationMessage(
      'Intent confirmed successfully!',
      'Next: Build Artifacts'
    );

    if (action === 'Next: Build Artifacts') {
      await vscode.commands.executeCommand('ripp.build');
    }
  }
}

/**
 * Step 5: Build Canonical Artifacts
 */
async function buildArtifacts(): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !checkWorkspaceTrust()) {
    return;
  }

  let succeeded = false;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'RIPP: Building canonical artifacts...',
      cancellable: false
    },
    async () => {
      try {
        const result = await cliRunner.execute({
          args: ['build'],
          cwd: workspaceRoot
        });

        if (result.success) {
          succeeded = true;
          workflowProvider.refresh();
        } else {
          vscode.window.showErrorMessage('Build failed. Check output for details.');
        }
      } catch (error: any) {
        if (error.code === 'CLI_NOT_FOUND') {
          await cliRunner.showInstallHelp();
        } else {
          vscode.window.showErrorMessage(`Build failed: ${error.message}`);
        }
      }
    }
  );

  // Handle user interaction after progress clears
  if (succeeded) {
    const action = await vscode.window.showInformationMessage(
      'Artifacts built successfully!',
      'Validate',
      'Package'
    );

    if (action === 'Validate') {
      await vscode.commands.executeCommand('ripp.validate');
    } else if (action === 'Package') {
      await vscode.commands.executeCommand('ripp.package');
    }
  }
}

/**
 * Validate RIPP packets
 */
async function validatePackets(): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !checkWorkspaceTrust()) {
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'RIPP: Validating packets...',
      cancellable: false
    },
    async () => {
      try {
        diagnosticsProvider.clear();

        const result = await cliRunner.execute({
          args: ['validate', '.'],
          cwd: workspaceRoot
        });

        // Parse output for diagnostics
        diagnosticsProvider.parseAndSetDiagnostics(result.stdout + result.stderr, workspaceRoot);

        // Parse output for report
        const report = parseValidationOutput(result.stdout + result.stderr);
        reportViewProvider.updateReport(report);

        if (result.success) {
          vscode.window.showInformationMessage('Validation complete. No errors found.');
        } else {
          vscode.window.showWarningMessage('Validation found issues. Check Problems panel.');
        }
      } catch (error: any) {
        if (error.code === 'CLI_NOT_FOUND') {
          await cliRunner.showInstallHelp();
        } else {
          vscode.window.showErrorMessage(`Validation failed: ${error.message}`);
        }
      }
    }
  );
}

/**
 * Package handoff
 */
async function packageHandoff(): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !checkWorkspaceTrust()) {
    return;
  }

  // Ask for output file
  const outputUri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(path.join(workspaceRoot, 'handoff.ripp.md')),
    filters: {
      Markdown: ['md'],
      'ZIP Archive': ['zip']
    }
  });

  if (!outputUri) {
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'RIPP: Packaging handoff...',
      cancellable: false
    },
    async () => {
      try {
        const outputPath = outputUri.fsPath;
        const ext = path.extname(outputPath);

        const args =
          ext === '.zip'
            ? ['package', '--format', 'zip', '--out', outputPath]
            : ['package', '--out', outputPath];

        const result = await cliRunner.execute({
          args,
          cwd: workspaceRoot
        });

        if (result.success) {
          vscode.window
            .showInformationMessage(
              `Package created: ${path.basename(outputPath)}`,
              'Open File',
              'Reveal in Finder'
            )
            .then(selection => {
              if (selection === 'Open File' && ext !== '.zip') {
                vscode.workspace.openTextDocument(outputUri).then(doc => {
                  vscode.window.showTextDocument(doc);
                });
              } else if (selection === 'Reveal in Finder') {
                vscode.commands.executeCommand('revealFileInOS', outputUri);
              }
            });
        } else {
          vscode.window.showErrorMessage('Packaging failed. Check output for details.');
        }
      } catch (error: any) {
        if (error.code === 'CLI_NOT_FOUND') {
          await cliRunner.showInstallHelp();
        } else {
          vscode.window.showErrorMessage(`Packaging failed: ${error.message}`);
        }
      }
    }
  );
}

// ============================================================================
// Utility Commands Implementation
// ============================================================================

/**
 * Edit RIPP config
 */
async function editConfig(): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return;
  }

  const configPath = configService.getConfigPath(workspaceRoot);

  // Create default config if doesn't exist
  if (!configService.configExists(workspaceRoot)) {
    const choice = await vscode.window.showInformationMessage(
      'No RIPP config found. Create default config?',
      'Create',
      'Cancel'
    );

    if (choice === 'Create') {
      try {
        await configService.saveConfig(workspaceRoot, ConfigService.DEFAULT_CONFIG);
      } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to create config: ${error.message}`);
        return;
      }
    } else {
      return;
    }
  }

  // Open config file in editor
  const uri = vscode.Uri.file(configPath);
  const doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc);
}

/**
 * Edit AI connections/secrets
 */
async function editConnections(): Promise<void> {
  // Get current provider
  const currentProvider = await secretService.getProvider();

  // Ask user to select provider
  const providerChoices = [
    { label: 'OpenAI', value: 'openai' as const },
    { label: 'Azure OpenAI', value: 'azure-openai' as const },
    { label: 'Ollama (Local)', value: 'ollama' as const }
  ];

  const selected = await vscode.window.showQuickPick(providerChoices, {
    placeHolder: `Current: ${currentProvider || 'None'} - Select AI provider to configure`
  });

  if (!selected) {
    return;
  }

  if (selected.value === 'openai') {
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your OpenAI API key',
      password: true,
      placeHolder: 'sk-...'
    });

    if (apiKey) {
      await secretService.setOpenAiSecrets({ apiKey });
      vscode.window.showInformationMessage('OpenAI connection configured');
    }
  } else if (selected.value === 'azure-openai') {
    const endpoint = await vscode.window.showInputBox({
      prompt: 'Enter Azure OpenAI endpoint',
      placeHolder: 'https://your-resource.openai.azure.com'
    });

    if (!endpoint) {
      return;
    }

    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter Azure OpenAI API key',
      password: true
    });

    if (!apiKey) {
      return;
    }

    const deployment = await vscode.window.showInputBox({
      prompt: 'Enter deployment name',
      placeHolder: 'gpt-4'
    });

    if (!deployment) {
      return;
    }

    const apiVersion = await vscode.window.showInputBox({
      prompt: 'Enter API version',
      value: '2024-02-15-preview'
    });

    if (apiVersion) {
      await secretService.setAzureOpenAiSecrets({
        endpoint,
        apiKey,
        deployment,
        apiVersion
      });
      vscode.window.showInformationMessage('Azure OpenAI connection configured');
    }
  } else if (selected.value === 'ollama') {
    const baseUrl = await vscode.window.showInputBox({
      prompt: 'Enter Ollama base URL',
      value: 'http://localhost:11434'
    });

    if (baseUrl) {
      await secretService.setOllamaSecrets({ baseUrl });
      vscode.window.showInformationMessage('Ollama connection configured');
    }
  }
}

/**
 * Open GitHub CI page
 */
async function openCI(): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return;
  }

  try {
    // Try to get git remote
    const gitResult = await execFileAsync('git', ['remote', 'get-url', 'origin'], {
      cwd: workspaceRoot
    });

    const remoteUrl = gitResult.stdout.trim();
    const match = remoteUrl.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);

    if (match) {
      const [, owner, repo] = match;
      const actionsUrl = `https://github.com/${owner}/${repo}/actions`;
      await vscode.env.openExternal(vscode.Uri.parse(actionsUrl));
    } else {
      vscode.window.showWarningMessage('Could not detect GitHub repository from git remote');
    }
  } catch {
    vscode.window.showWarningMessage(
      'Could not detect GitHub repository. Is this a git repository with a GitHub remote?'
    );
  }
}

/**
 * Lint packets (legacy command)
 */
async function lintPackets(): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !checkWorkspaceTrust()) {
    return;
  }

  const config = vscode.workspace.getConfiguration('ripp');
  const strict = config.get<boolean>('strict', false);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'RIPP: Linting packets...',
      cancellable: false
    },
    async () => {
      try {
        const args = ['lint', '.'];
        if (strict) {
          args.push('--strict');
        }

        const result = await cliRunner.execute({
          args,
          cwd: workspaceRoot
        });

        if (result.success) {
          vscode.window.showInformationMessage('Linting complete. Check output for details.');
        } else {
          vscode.window.showWarningMessage('Linting found issues. Check output for details.');
        }
      } catch (error: any) {
        if (error.code === 'CLI_NOT_FOUND') {
          await cliRunner.showInstallHelp();
        } else {
          vscode.window.showErrorMessage(`Linting failed: ${error.message}`);
        }
      }
    }
  );
}

/**
 * Analyze project (legacy command)
 */
async function analyzeProject(): Promise<void> {
  vscode.window
    .showInformationMessage(
      'The analyze command has been replaced by the new 5-step workflow. Use the workflow sidebar instead.',
      'Open Workflow'
    )
    .then(selection => {
      if (selection === 'Open Workflow') {
        vscode.commands.executeCommand('workbench.view.extension.rippActivityBar');
      }
    });
}

/**
 * Parse validation output into a report
 */
function parseValidationOutput(output: string): ValidationReport {
  const findings: Finding[] = [];
  const lines = output.split('\n');

  for (const line of lines) {
    // Pattern: FILE:LINE: SEVERITY: MESSAGE
    let match = line.match(/^(.+?):(\d+):\s*(error|warning|info):\s*(.+)$/i);
    if (match) {
      const [, file, lineStr, severity, message] = match;
      findings.push({
        severity: severity.toLowerCase() as 'error' | 'warning' | 'info',
        file,
        line: parseInt(lineStr, 10),
        message
      });
      continue;
    }

    // Pattern: Error/Warning in FILE: MESSAGE
    match = line.match(/^(error|warning|info)\s+in\s+(.+?):\s*(.+)$/i);
    if (match) {
      const [, severity, file, message] = match;
      findings.push({
        severity: severity.toLowerCase() as 'error' | 'warning' | 'info',
        file,
        message
      });
    }
  }

  const hasErrors = findings.some(f => f.severity === 'error');

  return {
    status: hasErrors ? 'fail' : 'pass',
    timestamp: Date.now(),
    findings
  };
}

// ============================================================================
// Copilot-Powered AI Commands
// ============================================================================

/**
 * Discover intent using Copilot (VS Code Language Model API)
 */
async function discoverIntentWithCopilot(): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot || !checkWorkspaceTrust()) {
    return;
  }

  // Check if evidence pack exists
  const evidencePath = path.join(workspaceRoot, '.ripp', 'evidence', 'evidence.index.json');
  if (!fs.existsSync(evidencePath)) {
    const choice = await vscode.window.showErrorMessage(
      'No evidence pack found. Build evidence pack first.',
      'Build Evidence'
    );
    if (choice === 'Build Evidence') {
      await vscode.commands.executeCommand('ripp.evidence.build');
    }
    return;
  }

  // Confirm Copilot usage
  const choice = await vscode.window.showInformationMessage(
    'Discover intent using GitHub Copilot?\n\nThis will analyze your code evidence using Copilot language models.',
    { modal: true },
    'Use Copilot',
    'Cancel'
  );

  if (choice !== 'Use Copilot') {
    return;
  }

  let succeeded = false;
  let candidatesPath: string | undefined;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'RIPP: Discovering intent with Copilot...',
      cancellable: true
    },
    async (progress, token) => {
      try {
        // Load evidence pack
        const evidenceContent = fs.readFileSync(evidencePath, 'utf8');
        const evidencePack = JSON.parse(evidenceContent);

        // Get config
        const config = vscode.workspace.getConfiguration('ripp.ai.copilot');
        const family = config.get<string>('family') || 'gpt-4o';
        const justification =
          config.get<string>('justification') || 'Analyzing code evidence to discover RIPP intent';

        // Create Copilot provider
        const copilotProvider = new CopilotLmProvider(
          { family, justification, maxRetries: 3 },
          outputChannel
        );

        // Check if configured
        if (!copilotProvider.isConfigured()) {
          throw new Error('VS Code Language Model API is not available. Please update VS Code.');
        }

        progress.report({ message: 'Analyzing evidence with Copilot...' });

        // Infer intent
        const targetLevel = 2; // Default to Level 2
        const candidates = await copilotProvider.inferIntent(evidencePack, { targetLevel }, token);

        // Save candidates
        const rippDir = path.join(workspaceRoot, '.ripp');
        if (!fs.existsSync(rippDir)) {
          fs.mkdirSync(rippDir, { recursive: true });
        }

        candidatesPath = path.join(rippDir, 'intent.candidates.yaml');
        const yamlContent = yaml.dump(candidates, { indent: 2, lineWidth: -1 });
        fs.writeFileSync(candidatesPath, yamlContent, 'utf8');

        succeeded = true;
        workflowProvider.refresh();
      } catch (error: any) {
        if (token.isCancellationRequested) {
          vscode.window.showInformationMessage('Intent discovery was cancelled');
          return;
        }

        if (error instanceof CopilotNotAvailableError) {
          vscode.window.showErrorMessage(error.message, 'Install Copilot').then(selection => {
            if (selection === 'Install Copilot') {
              vscode.env.openExternal(
                vscode.Uri.parse(
                  'https://marketplace.visualstudio.com/items?itemName=GitHub.copilot'
                )
              );
            }
          });
        } else if (error instanceof CopilotPermissionError) {
          vscode.window.showErrorMessage(error.message);
        } else {
          vscode.window.showErrorMessage(`Intent discovery failed: ${error.message}`);
          outputChannel.appendLine(`Error: ${error.stack || error.message}`);
        }
      }
    }
  );

  // Handle user interaction after progress clears
  if (succeeded && candidatesPath) {
    const selection = await vscode.window.showInformationMessage(
      'Intent discovery complete!',
      'View Candidates',
      'Next: Confirm'
    );

    if (selection === 'View Candidates') {
      const doc = await vscode.workspace.openTextDocument(candidatesPath);
      await vscode.window.showTextDocument(doc);
    } else if (selection === 'Next: Confirm') {
      await vscode.commands.executeCommand('ripp.confirm');
    }
  }
}

/**
 * Analyze project using Copilot (placeholder for future implementation)
 */
async function analyzeProjectWithCopilot(): Promise<void> {
  vscode.window
    .showInformationMessage(
      'Analyze with Copilot is coming soon! Use "RIPP: Discover Intent (Copilot)" for now.',
      'Open Discover'
    )
    .then(selection => {
      if (selection === 'Open Discover') {
        vscode.commands.executeCommand('ripp.discover.copilot');
      }
    });
}

/**
 * Configure AI mode (endpoint vs copilot)
 */
async function configureAiMode(): Promise<void> {
  console.log('[RIPP] configureAiMode function started');
  outputChannel.appendLine('[RIPP] configureAiMode function started');

  const current = vscode.workspace.getConfiguration('ripp.ai').get<string>('mode') || 'endpoint';

  const items: vscode.QuickPickItem[] = [
    {
      label: 'Copilot Mode',
      description: 'Use GitHub Copilot (no API key needed)',
      detail: current === 'copilot' ? '$(check) Currently active' : 'Recommended for VS Code users',
      picked: current === 'copilot'
    },
    {
      label: 'Endpoint Mode',
      description: 'Use external AI endpoint (OpenAI, Azure, etc.)',
      detail:
        current === 'endpoint' ? '$(check) Currently active' : 'Requires API key configuration',
      picked: current === 'endpoint'
    }
  ];

  const selection = await vscode.window.showQuickPick(items, {
    title: 'Configure AI Mode for RIPP',
    placeHolder: 'Select AI mode...'
  });

  if (!selection) {
    return;
  }

  const newMode = selection.label === 'Copilot Mode' ? 'copilot' : 'endpoint';

  if (newMode === current) {
    vscode.window.showInformationMessage(`AI mode is already set to ${newMode}`);
    return;
  }

  await vscode.workspace
    .getConfiguration('ripp.ai')
    .update('mode', newMode, vscode.ConfigurationTarget.Workspace);

  const nextSteps =
    newMode === 'copilot'
      ? 'You can now use "RIPP: Discover Intent (Copilot)" without API keys.'
      : 'Remember to configure your API keys using "RIPP: Manage AI Connections".';

  vscode.window.showInformationMessage(`AI mode changed to ${newMode}. ${nextSteps}`, 'Got it');

  // Refresh the workflow view to update UI
  workflowProvider.refresh();
}

/**
 * Get active AI mode from workspace config
 */
function getActiveAiMode(): 'copilot' | 'endpoint' {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    return 'endpoint';
  }

  const configPath = path.join(workspaceRoot, '.ripp', 'config.yaml');
  if (!fs.existsSync(configPath)) {
    return 'endpoint';
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8');
    // Simple check for copilot mode marker
    if (content.includes('# AI Mode: copilot')) {
      return 'copilot';
    }
  } catch {
    // Ignore read errors
  }

  return 'endpoint';
}
