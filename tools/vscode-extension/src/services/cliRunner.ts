import * as vscode from 'vscode';
import { spawn, SpawnOptions } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * CLI Runner Service
 * 
 * Single implementation for all RIPP CLI command execution.
 * Handles:
 * - CLI detection (local devDependency vs npx)
 * - Version checking
 * - Streaming output
 * - Exit code handling
 * - Structured output parsing
 * - Cancellation support
 */

export interface CliCommandOptions {
	args: string[];
	cwd: string;
	showOutput?: boolean;
	env?: NodeJS.ProcessEnv;
	onStdout?: (data: string) => void;
	onStderr?: (data: string) => void;
}

export interface CliCommandResult {
	exitCode: number;
	stdout: string;
	stderr: string;
	success: boolean;
}

export interface CliVersion {
	version: string;
	major: number;
	minor: number;
	patch: number;
}

export class CliRunner {
	private static instance: CliRunner;
	private outputChannel: vscode.OutputChannel;
	private minRequiredVersion: CliVersion = { version: '1.0.0', major: 1, minor: 0, patch: 0 };

	private constructor(outputChannel: vscode.OutputChannel) {
		this.outputChannel = outputChannel;
	}

	public static getInstance(outputChannel: vscode.OutputChannel): CliRunner {
		if (!CliRunner.instance) {
			CliRunner.instance = new CliRunner(outputChannel);
		}
		return CliRunner.instance;
	}

	/**
	 * Locate the RIPP CLI binary
	 * Prefers workspace devDependency, falls back to npx
	 */
	private locateCliBinary(workspaceRoot: string): { command: string; useNpx: boolean } {
		// Check for local binary first
		const binName = process.platform === 'win32' ? 'ripp.cmd' : 'ripp';
		const localBinary = path.join(workspaceRoot, 'node_modules', '.bin', binName);

		if (fs.existsSync(localBinary)) {
			return { command: localBinary, useNpx: false };
		}

		// Fallback to npx
		return { command: 'npx', useNpx: true };
	}

	/**
	 * Execute a RIPP CLI command
	 */
	public async execute(
		options: CliCommandOptions,
		cancellationToken?: vscode.CancellationToken
	): Promise<CliCommandResult> {
		const { args, cwd, showOutput = true, env = {}, onStdout, onStderr } = options;

		if (showOutput) {
			this.outputChannel.show();
			this.outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] Executing: ripp ${args.join(' ')}`);
			this.outputChannel.appendLine('---');
		}

		const { command, useNpx } = this.locateCliBinary(cwd);
		const commandArgs = useNpx ? ['ripp', ...args] : args;

		if (showOutput) {
			this.outputChannel.appendLine(`Using ${useNpx ? 'npx ripp' : 'local RIPP CLI'}`);
		}

		// Filter environment to only safe variables
		const safeEnv: NodeJS.ProcessEnv = {
			PATH: process.env.PATH,
			HOME: process.env.HOME,
			NODE_ENV: process.env.NODE_ENV,
			LANG: process.env.LANG,
			LC_ALL: process.env.LC_ALL,
			// Add any RIPP-specific env vars from the provided env
			...Object.fromEntries(
				Object.entries(env).filter(([key]) => 
					key.startsWith('RIPP_') || 
					key.startsWith('OPENAI_') || 
					key.startsWith('AZURE_OPENAI_')
				)
			)
		};

		return new Promise<CliCommandResult>((resolve, reject) => {
			const spawnOptions: SpawnOptions = {
				cwd,
				env: safeEnv,
				shell: false
			};

			const child = spawn(command, commandArgs, spawnOptions);

			let stdout = '';
			let stderr = '';
			let cancelled = false;

			// Handle cancellation
			if (cancellationToken) {
				cancellationToken.onCancellationRequested(() => {
					cancelled = true;
					child.kill();
				});
			}

			child.stdout?.on('data', (data: Buffer) => {
				const text = data.toString();
				stdout += text;
				
				if (showOutput) {
					this.outputChannel.append(text);
				}
				
				if (onStdout) {
					onStdout(text);
				}
			});

			child.stderr?.on('data', (data: Buffer) => {
				const text = data.toString();
				stderr += text;
				
				if (showOutput) {
					this.outputChannel.append(text);
				}
				
				if (onStderr) {
					onStderr(text);
				}
			});

			child.on('error', (error: Error) => {
				if (cancelled) {
					resolve({
						exitCode: -1,
						stdout,
						stderr,
						success: false
					});
					return;
				}

				// Check if this is a CLI not found error
				if ((error as any).code === 'ENOENT') {
					const cliNotFoundError = new Error(
						'RIPP CLI was not found. Please install it with: npm install -D ripp-cli'
					);
					(cliNotFoundError as any).code = 'CLI_NOT_FOUND';
					reject(cliNotFoundError);
				} else {
					reject(error);
				}
			});

			child.on('close', (exitCode: number | null) => {
				if (cancelled) {
					resolve({
						exitCode: -1,
						stdout,
						stderr,
						success: false
					});
					return;
				}

				const code = exitCode ?? 0;
				
				if (showOutput) {
					this.outputChannel.appendLine('---');
					this.outputChannel.appendLine(`Exit code: ${code}`);
				}

				resolve({
					exitCode: code,
					stdout,
					stderr,
					success: code === 0
				});
			});
		});
	}

	/**
	 * Get the installed CLI version
	 */
	public async getVersion(workspaceRoot: string): Promise<CliVersion | null> {
		try {
			const result = await this.execute({
				args: ['--version'],
				cwd: workspaceRoot,
				showOutput: false
			});

			if (result.success) {
				const versionMatch = result.stdout.match(/(\d+)\.(\d+)\.(\d+)/);
				if (versionMatch) {
					return {
						version: versionMatch[0],
						major: parseInt(versionMatch[1], 10),
						minor: parseInt(versionMatch[2], 10),
						patch: parseInt(versionMatch[3], 10)
					};
				}
			}
		} catch (error) {
			// CLI not found or error getting version
			return null;
		}

		return null;
	}

	/**
	 * Check if CLI version meets minimum requirements
	 */
	public async checkVersion(workspaceRoot: string): Promise<{
		isInstalled: boolean;
		isSufficient: boolean;
		currentVersion: CliVersion | null;
		requiredVersion: CliVersion;
	}> {
		const currentVersion = await this.getVersion(workspaceRoot);
		
		if (!currentVersion) {
			return {
				isInstalled: false,
				isSufficient: false,
				currentVersion: null,
				requiredVersion: this.minRequiredVersion
			};
		}

		const isSufficient = this.compareVersions(currentVersion, this.minRequiredVersion) >= 0;

		return {
			isInstalled: true,
			isSufficient,
			currentVersion,
			requiredVersion: this.minRequiredVersion
		};
	}

	/**
	 * Compare two versions
	 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
	 */
	private compareVersions(v1: CliVersion, v2: CliVersion): number {
		if (v1.major !== v2.major) {
			return v1.major - v2.major;
		}
		if (v1.minor !== v2.minor) {
			return v1.minor - v2.minor;
		}
		return v1.patch - v2.patch;
	}

	/**
	 * Parse structured JSON output from CLI
	 */
	public parseJsonOutput<T>(output: string): T | null {
		try {
			// Look for JSON in the output
			const jsonMatch = output.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				return JSON.parse(jsonMatch[0]);
			}
		} catch (error) {
			// Not JSON or invalid JSON
		}
		return null;
	}

	/**
	 * Show CLI installation help
	 */
	public async showInstallHelp(): Promise<void> {
		const choice = await vscode.window.showErrorMessage(
			'RIPP CLI not found. Install it to use this extension.',
			'Install Locally',
			'Show Command',
			'Open Docs'
		);

		if (choice === 'Install Locally') {
			const terminal = vscode.window.createTerminal('RIPP Install');
			terminal.show();
			terminal.sendText('npm install -D ripp-cli');
		} else if (choice === 'Show Command') {
			vscode.window.showInformationMessage(
				'Run this command in your terminal: npm install -D ripp-cli',
				'Copy Command'
			).then(selection => {
				if (selection === 'Copy Command') {
					vscode.env.clipboard.writeText('npm install -D ripp-cli');
					vscode.window.showInformationMessage('Command copied to clipboard');
				}
			});
		} else if (choice === 'Open Docs') {
			vscode.env.openExternal(vscode.Uri.parse('https://dylan-natter.github.io/ripp-protocol'));
		}
	}

	/**
	 * Show version mismatch help
	 */
	public async showVersionMismatchHelp(current: CliVersion, required: CliVersion): Promise<void> {
		const choice = await vscode.window.showWarningMessage(
			`RIPP CLI version ${current.version} is installed, but ${required.version} or higher is required.`,
			'Update CLI',
			'Show Command'
		);

		if (choice === 'Update CLI') {
			const terminal = vscode.window.createTerminal('RIPP Update');
			terminal.show();
			terminal.sendText('npm install -D ripp-cli@latest');
		} else if (choice === 'Show Command') {
			vscode.window.showInformationMessage(
				'Run this command in your terminal: npm install -D ripp-cli@latest',
				'Copy Command'
			).then(selection => {
				if (selection === 'Copy Command') {
					vscode.env.clipboard.writeText('npm install -D ripp-cli@latest');
					vscode.window.showInformationMessage('Command copied to clipboard');
				}
			});
		}
	}
}
