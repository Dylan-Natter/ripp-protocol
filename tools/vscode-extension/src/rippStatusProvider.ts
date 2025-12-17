import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class RippStatusProvider implements vscode.TreeDataProvider<RippTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<RippTreeItem | undefined | null | void> = new vscode.EventEmitter<RippTreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<RippTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

	private workspaceRoot: string | undefined;
	private lastValidationResult: ValidationResult | undefined;

	constructor() {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		this.workspaceRoot = workspaceFolders && workspaceFolders.length > 0 
			? workspaceFolders[0].uri.fsPath 
			: undefined;
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	setLastValidationResult(result: ValidationResult): void {
		this.lastValidationResult = result;
		this.refresh();
	}

	getTreeItem(element: RippTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: RippTreeItem): Thenable<RippTreeItem[]> {
		if (!this.workspaceRoot) {
			return Promise.resolve([]);
		}

		if (element && element.children) {
			return Promise.resolve(element.children);
		} else if (element) {
			return Promise.resolve([]);
		} else {
			return Promise.resolve(this.getRootItems());
		}
	}

	private getRootItems(): RippTreeItem[] {
		const items: RippTreeItem[] = [];

		// 1. Initialization Status
		const isInitialized = this.isRippInitialized();
		items.push(new RippTreeItem(
			isInitialized ? 'Status: Initialized ✓' : 'Status: Not Initialized',
			'',
			isInitialized ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.None,
			{
				command: isInitialized ? '' : 'ripp.init',
				title: isInitialized ? '' : 'Initialize RIPP',
				arguments: []
			}
		));

		// 2. Last Validation Result
		if (this.lastValidationResult) {
			const { status, timestamp, message } = this.lastValidationResult;
			const statusIcon = status === 'pass' ? '✓' : '✗';
			const timeStr = new Date(timestamp).toLocaleString();
			items.push(new RippTreeItem(
				`Last Validation: ${statusIcon} ${status}`,
				`${timeStr} - ${message}`,
				vscode.TreeItemCollapsibleState.None
			));
		} else {
			items.push(new RippTreeItem(
				'Last Validation: None',
				'Run validation to see results',
				vscode.TreeItemCollapsibleState.None
			));
		}

		// 3. Detected RIPP Artifacts
		const artifacts = this.detectArtifacts();
		if (artifacts.length > 0) {
			const artifactsItem = new RippTreeItem(
				`Detected Artifacts (${artifacts.length})`,
				'',
				vscode.TreeItemCollapsibleState.Collapsed
			);
			items.push(artifactsItem);
		}

		// 4. Actions
		items.push(new RippTreeItem(
			'Actions',
			'',
			vscode.TreeItemCollapsibleState.Expanded,
			undefined,
			[
				new RippTreeItem('Initialize RIPP', '', vscode.TreeItemCollapsibleState.None, {
					command: 'ripp.init',
					title: 'Initialize RIPP',
					arguments: []
				}),
				new RippTreeItem('Validate RIPP', '', vscode.TreeItemCollapsibleState.None, {
					command: 'ripp.validate',
					title: 'Validate RIPP',
					arguments: []
				}),
				new RippTreeItem('Open RIPP Docs', '', vscode.TreeItemCollapsibleState.None, {
					command: 'ripp.openDocs',
					title: 'Open RIPP Docs',
					arguments: []
				}),
				new RippTreeItem('Open CI / GitHub Actions', '', vscode.TreeItemCollapsibleState.None, {
					command: 'ripp.openCI',
					title: 'Open CI / GitHub Actions',
					arguments: []
				})
			]
		));

		return items;
	}

	private isRippInitialized(): boolean {
		if (!this.workspaceRoot) {
			return false;
		}
		const rippDir = path.join(this.workspaceRoot, 'ripp');
		return fs.existsSync(rippDir);
	}

	private detectArtifacts(): string[] {
		if (!this.workspaceRoot) {
			return [];
		}
		
		const artifacts: string[] = [];
		const rippDir = path.join(this.workspaceRoot, 'ripp');
		
		if (fs.existsSync(rippDir)) {
			artifacts.push('ripp/');
			
			const subdirs = ['features', 'handoffs', 'packages'];
			for (const subdir of subdirs) {
				const subdirPath = path.join(rippDir, subdir);
				if (fs.existsSync(subdirPath)) {
					artifacts.push(`ripp/${subdir}/`);
				}
			}
		}

		return artifacts;
	}
}

export class RippTreeItem extends vscode.TreeItem {
	children: RippTreeItem[] | undefined;

	constructor(
		public readonly label: string,
		public readonly description: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
		children?: RippTreeItem[]
	) {
		super(label, collapsibleState);
		this.description = description;
		this.children = children;
		this.contextValue = 'rippTreeItem';
	}
}

export interface ValidationResult {
	status: 'pass' | 'fail';
	timestamp: number;
	message: string;
}
