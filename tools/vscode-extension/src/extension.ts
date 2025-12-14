import * as vscode from 'vscode';
import { execFile } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';

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
 */

// Shared output channel
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
	console.log('RIPP Protocol extension is now active');
	
	// Create shared output channel
	outputChannel = vscode.window.createOutputChannel('RIPP');
	context.subscriptions.push(outputChannel);

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
 * Handle CLI execution errors with user-friendly messages
 */
function handleCommandError(error: any, commandName: string) {
	if ((error as any).code === 'CLI_NOT_FOUND') {
		vscode.window.showErrorMessage(
			`RIPP CLI not found. Please verify that \`npx ripp\` works in your terminal.`,
			'Open Terminal'
		).then(selection => {
			if (selection === 'Open Terminal') {
				vscode.commands.executeCommand('workbench.action.terminal.new');
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
			// Use npx ripp
			command = 'npx';
			commandArgs = ['ripp', ...args];
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
	if (!workspaceRoot) {
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
				const packets = await discoverPackets();
				
				if (packets.length === 0) {
					vscode.window.showWarningMessage('No RIPP packets found in workspace');
					return;
				}

				// Validate all packets in the workspace
				// We'll validate the directory to find all packets
				await executeRippCommand(['validate', '.'], workspaceRoot);
				
				vscode.window.showInformationMessage(
					`RIPP validation complete. Found ${packets.length} packet(s).`
				);
			} catch (error: any) {
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
	if (!workspaceRoot) {
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
					`RIPP linting complete. Check output for details.`
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
	if (!workspaceRoot) {
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
	if (!workspaceRoot) {
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
	if (!workspaceRoot) {
		return;
	}

	// Ask user to confirm initialization
	const forceOption = await vscode.window.showQuickPick(
		[
			{
				label: 'Standard',
				description: 'Create RIPP files (skip existing)',
				force: false
			},
			{
				label: 'Force',
				description: 'Overwrite existing files',
				force: true
			}
		],
		{
			placeHolder: 'Initialize RIPP in this repository?'
		}
	);

	if (!forceOption) {
		return;
	}

	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: 'RIPP: Initializing repository...',
			cancellable: false
		},
		async () => {
			try {
				const args = ['init'];
				if (forceOption.force) {
					args.push('--force');
				}

				await executeRippCommand(args, workspaceRoot);
				
				vscode.window.showInformationMessage(
					`RIPP initialized successfully! Check the RIPP output for details.`
				);
			} catch (error: any) {
				handleCommandError(error, 'initialization');
			}
		}
	);
}
