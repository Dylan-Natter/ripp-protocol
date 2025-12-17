import * as vscode from 'vscode';
import { execFile } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
import * as fs from 'fs';
import { RippStatusProvider, ValidationResult } from './rippStatusProvider';
import { RippDiagnosticsProvider } from './diagnosticsProvider';
import { RippReportViewProvider, ValidationReport, Finding } from './reportViewProvider';

const execFileAsync = promisify(execFile);

/**
 * VS Code extension for RIPP Protocol
 * 
 * This extension is a thin wrapper around the RIPP CLI.
 * It discovers RIPP packets and executes CLI commands via child_process.
 * 
 * Security constraints:
 * - Uses execFile/spawn with shell: false
 * - Uses args array only (no command strings)
 * - Sets cwd to workspace root
 * - Never executes arbitrary user input
 * - Never logs secrets or env values
 * - Never mutates *.ripp.yaml or *.ripp.json files
 * - Respects VS Code Workspace Trust
 */

// Shared output channel
let outputChannel: vscode.OutputChannel;

// Providers
let statusProvider: RippStatusProvider;
let diagnosticsProvider: RippDiagnosticsProvider;
let reportViewProvider: RippReportViewProvider;

export function activate(context: vscode.ExtensionContext) {
	console.log('RIPP Protocol extension is now active');
	
	// Create shared output channel
	outputChannel = vscode.window.createOutputChannel('RIPP');
	context.subscriptions.push(outputChannel);

	// Initialize providers
	statusProvider = new RippStatusProvider();
	diagnosticsProvider = new RippDiagnosticsProvider();
	reportViewProvider = new RippReportViewProvider(context.extensionUri);

	// Register TreeView for sidebar
	const treeView = vscode.window.createTreeView('rippStatus', {
		treeDataProvider: statusProvider
	});
	context.subscriptions.push(treeView);

	// Register WebView for report viewer
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			RippReportViewProvider.viewType,
			reportViewProvider
		)
	);

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('ripp.validate', () => validatePackets())
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ripp.lint', () => lintPackets())
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ripp.package', () => packageHandoff())
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ripp.analyze', () => analyzeProject())
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ripp.init', () => initRepository())
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ripp.openDocs', () => openDocs())
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ripp.openCI', () => openCI())
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ripp.refreshStatus', () => statusProvider.refresh())
	);

	// Register diagnostics provider
	context.subscriptions.push(diagnosticsProvider);
}

export function deactivate() {
	// Cleanup if needed
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
		vscode.window.showErrorMessage(
			'RIPP commands cannot run in an untrusted workspace. Please trust this workspace first.',
			'Learn More'
		).then(selection => {
			if (selection === 'Learn More') {
				vscode.env.openExternal(vscode.Uri.parse('https://code.visualstudio.com/docs/editor/workspace-trust'));
			}
		});
		return false;
	}
	return true;
}

/**
 * Handle CLI execution errors with user-friendly messages
 */
function handleCommandError(error: any, commandName: string) {
	if ((error as any).code === 'CLI_NOT_FOUND') {
		vscode.window.showErrorMessage(
			'RIPP CLI not found. Install it with: npm install -D ripp-cli',
			'Install Locally',
			'Open Terminal'
		).then(selection => {
			if (selection === 'Install Locally') {
				// Open terminal and suggest install command
				vscode.commands.executeCommand('workbench.action.terminal.new').then(() => {
					vscode.window.showInformationMessage(
						'Run: npm install -D ripp-cli'
					);
				}, (err) => {
					// Terminal failed to open
					vscode.window.showErrorMessage(
						`Could not open terminal: ${err.message}`
					);
				});
			} else if (selection === 'Open Terminal') {
				vscode.commands.executeCommand('workbench.action.terminal.new').then(undefined, (err) => {
					vscode.window.showErrorMessage(
						`Could not open terminal: ${err.message}`
					);
				});
			}
		});
	} else {
		vscode.window.showErrorMessage(`RIPP ${commandName} failed: ${error.message}`);
	}
}

/**
 * Get configuration
 */
function getConfig() {
	const config = vscode.workspace.getConfiguration('ripp');
	return {
		cliMode: config.get<string>('cliMode', 'npx'),
		strict: config.get<boolean>('strict', false),
		paths: config.get<string[]>('paths', ['**/*.ripp.yaml', '**/*.ripp.json'])
	};
}

/**
 * Discover RIPP packet files
 */
async function discoverPackets(): Promise<vscode.Uri[]> {
	const config = getConfig();
	const patterns = config.paths;

	const files: vscode.Uri[] = [];
	for (const pattern of patterns) {
		const found = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
		files.push(...found);
	}

	return files;
}

/**
 * Execute RIPP CLI command
 */
async function executeRippCommand(
	args: string[],
	workspaceRoot: string,
	showOutput: boolean = true
): Promise<{ stdout: string; stderr: string }> {
	const config = getConfig();

	if (showOutput) {
		outputChannel.show();
		outputChannel.appendLine(`Executing: ${args.join(' ')}`);
		outputChannel.appendLine('---');
	}

	try {
		let command: string;
		let commandArgs: string[];

		if (config.cliMode === 'npx') {
			// Try to use local binary first (prefer devDependency)
			const binName = process.platform === 'win32' ? 'ripp.cmd' : 'ripp';
			const localBinary = path.join(workspaceRoot, 'node_modules', '.bin', binName);
			
			// Note: Using fs.existsSync here is acceptable because:
			// - It's checking a local file (very fast, <1ms)
			// - The alternative (fs.promises.access) would add complexity
			// - This is already in an async context (executeRippCommand)
			if (fs.existsSync(localBinary)) {
				// Use local binary directly
				command = localBinary;
				commandArgs = args;
				if (showOutput) {
					outputChannel.appendLine('Using local RIPP CLI from node_modules');
				}
			} else {
				// Fallback to npx
				command = 'npx';
				commandArgs = ['ripp', ...args];
				if (showOutput) {
					outputChannel.appendLine('Using npx (no local RIPP CLI found)');
				}
			}
		} else {
			// Use npm run script
			// Assumes workspace has npm scripts like "ripp:validate", "ripp:lint", etc.
			command = 'npm';
			const scriptName = `ripp:${args[0]}`;
			commandArgs = ['run', scriptName, '--', ...args.slice(1)];
		}

		// Filter environment to only include safe variables
		// Never pass sensitive env vars like tokens, keys, passwords
		const safeEnv = {
			PATH: process.env.PATH,
			HOME: process.env.HOME,
			NODE_ENV: process.env.NODE_ENV,
			LANG: process.env.LANG,
			LC_ALL: process.env.LC_ALL
		};

		const result = await execFileAsync(command, commandArgs, {
			cwd: workspaceRoot,
			maxBuffer: 10 * 1024 * 1024, // 10MB
			env: safeEnv
		});

		if (showOutput) {
			outputChannel.appendLine(result.stdout);
			if (result.stderr) {
				outputChannel.appendLine('STDERR:');
				outputChannel.appendLine(result.stderr);
			}
		}

		return result;
	} catch (error: any) {
		// Log technical details to output channel
		if (showOutput) {
			outputChannel.appendLine(`Error: ${error.message}`);
			if (error.stdout) {
				outputChannel.appendLine(error.stdout);
			}
			if (error.stderr) {
				outputChannel.appendLine('STDERR:');
				outputChannel.appendLine(error.stderr);
			}
		}

		// Check if this is a CLI not found error
		if (error.code === 'ENOENT' || error.message.includes('command not found') || error.message.includes('not recognized')) {
			// Create user-friendly error for missing CLI
			const cliNotFoundError = new Error(
				'RIPP CLI was not found. Please verify that `npx ripp` works in your terminal.'
			);
			(cliNotFoundError as any).code = 'CLI_NOT_FOUND';
			(cliNotFoundError as any).originalError = error;
			throw cliNotFoundError;
		}

		throw error;
	}
}

/**
 * Command: Validate Packet(s)
 */
async function validatePackets() {
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
				const packets = await discoverPackets();
				
				if (packets.length === 0) {
					vscode.window.showWarningMessage('No RIPP packets found in workspace');
					statusProvider.setLastValidationResult({
						status: 'fail',
						timestamp: Date.now(),
						message: 'No packets found'
					});
					return;
				}

				// Validate all packets in the workspace
				const result = await executeRippCommand(['validate', '.'], workspaceRoot);
				
				// Parse output for diagnostics
				diagnosticsProvider.parseAndSetDiagnostics(result.stdout + result.stderr, workspaceRoot);

				// Parse output for report
				const report = parseValidationOutput(result.stdout + result.stderr);
				reportViewProvider.updateReport(report);

				// Update status
				const validationResult: ValidationResult = {
					status: report.status,
					timestamp: Date.now(),
					message: `${packets.length} packet(s), ${report.findings.length} issue(s)`
				};
				statusProvider.setLastValidationResult(validationResult);
				
				vscode.window.showInformationMessage(
					`RIPP validation complete. Found ${packets.length} packet(s).`
				);
			} catch (error: any) {
				statusProvider.setLastValidationResult({
					status: 'fail',
					timestamp: Date.now(),
					message: 'Validation failed'
				});
				handleCommandError(error, 'validation');
			}
		}
	);
}

/**
 * Command: Lint Packet(s)
 */
async function lintPackets() {
	const workspaceRoot = getWorkspaceRoot();
	if (!workspaceRoot || !checkWorkspaceTrust()) {
		return;
	}

	const config = getConfig();

	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: 'RIPP: Linting packets...',
			cancellable: false
		},
		async () => {
			try {
				const packets = await discoverPackets();
				
				if (packets.length === 0) {
					vscode.window.showWarningMessage('No RIPP packets found in workspace');
					return;
				}

				const args = ['lint', '.'];
				if (config.strict) {
					args.push('--strict');
				}

				await executeRippCommand(args, workspaceRoot);
				
				vscode.window.showInformationMessage(
					'RIPP linting complete. Check output for details.'
				);
			} catch (error: any) {
				handleCommandError(error, 'linting');
			}
		}
	);
}

/**
 * Command: Package Handoff
 */
async function packageHandoff() {
	const workspaceRoot = getWorkspaceRoot();
	if (!workspaceRoot || !checkWorkspaceTrust()) {
		return;
	}

	// Ask user to select a RIPP packet
	const packets = await discoverPackets();
	if (packets.length === 0) {
		vscode.window.showWarningMessage('No RIPP packets found in workspace');
		return;
	}

	const items = packets.map(uri => ({
		label: path.basename(uri.fsPath),
		description: path.relative(workspaceRoot, uri.fsPath),
		uri
	}));

	const selected = await vscode.window.showQuickPick(items, {
		placeHolder: 'Select a RIPP packet to package'
	});

	if (!selected) {
		return;
	}

	// Ask for output file
	const outputUri = await vscode.window.showSaveDialog({
		defaultUri: vscode.Uri.file(path.join(workspaceRoot, 'handoff.md')),
		filters: {
			'Markdown': ['md'],
			'JSON': ['json'],
			'YAML': ['yaml', 'yml']
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
				const inputPath = path.relative(workspaceRoot, selected.uri.fsPath);
				const outputPath = path.relative(workspaceRoot, outputUri.fsPath);

				await executeRippCommand(
					['package', '--in', inputPath, '--out', outputPath],
					workspaceRoot
				);
				
				vscode.window.showInformationMessage(
					`Package created: ${outputPath}`
				);

				// Open the created file
				const doc = await vscode.workspace.openTextDocument(outputUri);
				await vscode.window.showTextDocument(doc);
			} catch (error: any) {
				handleCommandError(error, 'packaging');
			}
		}
	);
}

/**
 * Command: Analyze Project (Draft Packet)
 */
async function analyzeProject() {
	const workspaceRoot = getWorkspaceRoot();
	if (!workspaceRoot || !checkWorkspaceTrust()) {
		return;
	}

	// Ask user to select an input file to analyze
	const inputUri = await vscode.window.showOpenDialog({
		canSelectFiles: true,
		canSelectFolders: false,
		canSelectMany: false,
		openLabel: 'Select file to analyze',
		filters: {
			'All Files': ['*'],
			'Text Files': ['txt', 'md'],
			'Documents': ['doc', 'docx', 'pdf']
		}
	});

	if (!inputUri || inputUri.length === 0) {
		return;
	}

	// Ask for output file
	const outputUri = await vscode.window.showSaveDialog({
		defaultUri: vscode.Uri.file(path.join(workspaceRoot, 'analyzed.ripp.yaml')),
		filters: {
			'RIPP YAML': ['ripp.yaml'],
			'RIPP JSON': ['ripp.json']
		}
	});

	if (!outputUri) {
		return;
	}

	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: 'RIPP: Analyzing project...',
			cancellable: false
		},
		async () => {
			try {
				const inputPath = path.relative(workspaceRoot, inputUri[0].fsPath);
				const outputPath = path.relative(workspaceRoot, outputUri.fsPath);

				await executeRippCommand(
					['analyze', inputPath, '--output', outputPath],
					workspaceRoot
				);
				
				vscode.window.showInformationMessage(
					`Draft packet created: ${outputPath}. Please review before use.`
				);

				// Open the created file
				const doc = await vscode.workspace.openTextDocument(outputUri);
				await vscode.window.showTextDocument(doc);
			} catch (error: any) {
				handleCommandError(error, 'analysis');
			}
		}
	);
}

/**
 * Command: Initialize RIPP in Repository
 */
async function initRepository() {
	const workspaceRoot = getWorkspaceRoot();
	if (!workspaceRoot || !checkWorkspaceTrust()) {
		return;
	}

	// Show preview of files that will be created
	const previewItems = [
		'ripp/',
		'ripp/README.md',
		'ripp/features/',
		'ripp/handoffs/',
		'ripp/packages/',
		'ripp/.gitignore',
		'.github/workflows/',
		'.github/workflows/ripp-validate.yml'
	];

	const previewMessage = `RIPP will create the following files and directories:\n\n${previewItems.map(item => `  • ${item}`).join('\n')}\n\nExisting files will not be overwritten unless you choose "Force".`;

	// Show confirmation dialog
	const choice = await vscode.window.showInformationMessage(
		'Initialize RIPP in this repository?',
		{ modal: true, detail: previewMessage },
		'Initialize',
		'Force (Overwrite)',
		'Cancel'
	);

	if (!choice || choice === 'Cancel') {
		return;
	}

	const force = choice === 'Force (Overwrite)';

	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: 'RIPP: Initializing repository...',
			cancellable: false
		},
		async () => {
			try {
				const args = ['init'];
				if (force) {
					args.push('--force');
				}

				await executeRippCommand(args, workspaceRoot);
				
				// Refresh sidebar
				statusProvider.refresh();
				
				vscode.window.showInformationMessage(
					'RIPP initialized successfully! Check the RIPP output for details.'
				);

				// Offer to open diff or create PR
				const action = await vscode.window.showInformationMessage(
					'RIPP has been initialized',
					'Open RIPP Folder',
					'View Changes'
				);

				if (action === 'Open RIPP Folder') {
					const rippUri = vscode.Uri.file(path.join(workspaceRoot, 'ripp'));
					await vscode.commands.executeCommand('revealInExplorer', rippUri);
				} else if (action === 'View Changes') {
					await vscode.commands.executeCommand('workbench.view.scm');
				}
			} catch (error: any) {
				handleCommandError(error, 'initialization');
			}
		}
	);
}

/**
 * Command: Open RIPP Documentation
 */
async function openDocs() {
	const url = 'https://dylan-natter.github.io/ripp-protocol';
	await vscode.env.openExternal(vscode.Uri.parse(url));
}

/**
 * Command: Open CI / GitHub Actions
 */
async function openCI() {
	const workspaceRoot = getWorkspaceRoot();
	if (!workspaceRoot) {
		return;
	}

	try {
		// Try to detect GitHub remote
		const result = await execFileAsync('git', ['remote', 'get-url', 'origin'], {
			cwd: workspaceRoot
		});

		const remoteUrl = result.stdout.trim();
		
		// Parse GitHub URL
		// Supports: https://github.com/user/repo.git and git@github.com:user/repo.git
		const match = remoteUrl.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);
		
		if (match) {
			const [, owner, repo] = match;
			const actionsUrl = `https://github.com/${owner}/${repo}/actions`;
			await vscode.env.openExternal(vscode.Uri.parse(actionsUrl));
		} else {
			vscode.window.showWarningMessage('Could not detect GitHub repository from git remote');
		}
	} catch (error) {
		vscode.window.showWarningMessage('Could not detect GitHub repository. Is this a git repository with a GitHub remote?');
	}
}

/**
 * Parse validation output into a report
 */
function parseValidationOutput(output: string): ValidationReport {
	const findings: Finding[] = [];
	const lines = output.split('\n');

	// Simple parsing - look for error/warning patterns
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
