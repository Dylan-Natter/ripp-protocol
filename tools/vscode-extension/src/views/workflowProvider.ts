import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Workflow Step State
 */
export type StepStatus = 'not-started' | 'ready' | 'in-progress' | 'done' | 'error';

export interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
  lastRun?: number;
  outputFiles?: string[];
  command?: string;
  prerequisite?: string; // ID of prerequisite step
}

/**
 * Enhanced RIPP Status Provider with 5-Step Workflow
 *
 * Steps:
 * 1. Initialize - ripp init
 * 2. Build Evidence Pack - ripp evidence build
 * 3. Discover Intent (AI) - ripp discover
 * 4. Confirm Intent - ripp confirm
 * 5. Build + Validate + Package - ripp build, validate, package
 */
export class RippWorkflowProvider implements vscode.TreeDataProvider<WorkflowTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<WorkflowTreeItem | undefined | null | void> =
    new vscode.EventEmitter<WorkflowTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<WorkflowTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private workspaceRoot: string | undefined;
  private steps: Map<string, WorkflowStep> = new Map();

  constructor() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    this.workspaceRoot =
      workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : undefined;

    this.initializeSteps();
  }

  private initializeSteps(): void {
    this.steps.set('init', {
      id: 'init',
      label: '1. Initialize',
      description: 'Set up RIPP in repository',
      status: 'not-started',
      command: 'ripp.init'
    });

    this.steps.set('evidence', {
      id: 'evidence',
      label: '2. Build Evidence Pack',
      description: 'Extract repository signals',
      status: 'not-started',
      command: 'ripp.evidence.build',
      prerequisite: 'init'
    });

    this.steps.set('discover', {
      id: 'discover',
      label: '3. Discover Intent',
      description: 'Infer candidate intent with AI',
      status: 'not-started',
      command: 'ripp.discover.smart',
      prerequisite: 'evidence'
    });

    this.steps.set('confirm', {
      id: 'confirm',
      label: '4. Confirm Intent',
      description: 'Review and confirm intent',
      status: 'not-started',
      command: 'ripp.confirm',
      prerequisite: 'discover'
    });

    this.steps.set('finalize', {
      id: 'finalize',
      label: '5. Build + Validate + Package',
      description: 'Generate final artifacts',
      status: 'not-started',
      prerequisite: 'confirm'
    });

    // Check initial statuses
    this.updateAllStatuses();
  }

  refresh(): void {
    this.updateAllStatuses();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: WorkflowTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: WorkflowTreeItem): Thenable<WorkflowTreeItem[]> {
    if (!this.workspaceRoot) {
      return Promise.resolve([
        new WorkflowTreeItem(
          'No Workspace',
          'Open a folder to use RIPP',
          vscode.TreeItemCollapsibleState.None
        )
      ]);
    }

    if (element) {
      // Return children for expandable items
      return Promise.resolve(element.children || []);
    } else {
      // Root level - return workflow steps
      return Promise.resolve(this.getRootItems());
    }
  }

  private getRootItems(): WorkflowTreeItem[] {
    const items: WorkflowTreeItem[] = [];

    // Add workflow steps
    const stepOrder = ['init', 'evidence', 'discover', 'confirm', 'finalize'];

    for (const stepId of stepOrder) {
      const step = this.steps.get(stepId);
      if (step) {
        items.push(this.createStepItem(step));
      }
    }

    // Add divider
    items.push(new WorkflowTreeItem('', '', vscode.TreeItemCollapsibleState.None, 'divider'));

    // Add utility actions
    items.push(this.createUtilityActionsSection());

    return items;
  }

  private createStepItem(step: WorkflowStep): WorkflowTreeItem {
    const statusIcon = this.getStatusIcon(step.status);
    const label = `${statusIcon} ${step.label}`;

    // Check if step can be run
    const canRun = this.canRunStep(step);
    const description = canRun ? step.description : '(prerequisites not met)';

    const item = new WorkflowTreeItem(
      label,
      description,
      vscode.TreeItemCollapsibleState.Collapsed,
      'step'
    );

    // Add children for step details
    const children: WorkflowTreeItem[] = [];

    // Status
    children.push(
      new WorkflowTreeItem(
        `Status: ${step.status}`,
        '',
        vscode.TreeItemCollapsibleState.None,
        'status'
      )
    );

    // Last run
    if (step.lastRun) {
      const timeStr = new Date(step.lastRun).toLocaleString();
      children.push(
        new WorkflowTreeItem(
          `Last run: ${timeStr}`,
          '',
          vscode.TreeItemCollapsibleState.None,
          'info'
        )
      );
    }

    // Output files
    if (step.outputFiles && step.outputFiles.length > 0 && this.workspaceRoot) {
      const outputsItem = new WorkflowTreeItem(
        `Outputs (${step.outputFiles.length})`,
        '',
        vscode.TreeItemCollapsibleState.Collapsed,
        'outputs'
      );
      outputsItem.children = step.outputFiles.map(file => {
        const fileItem = new WorkflowTreeItem(
          path.basename(file),
          file,
          vscode.TreeItemCollapsibleState.None,
          'file'
        );
        fileItem.command = {
          command: 'vscode.open',
          title: 'Open File',
          arguments: [vscode.Uri.file(path.join(this.workspaceRoot!, file))]
        };
        return fileItem;
      });
      children.push(outputsItem);
    }

    // Action buttons - special handling for discover step
    if (step.id === 'discover' && canRun) {
      // Get active AI mode from config
      const aiMode = this.getActiveAiMode();
      
      // Add primary action with active mode indicator
      const primaryAction = new WorkflowTreeItem(
        aiMode === 'copilot' ? '▶ Discover with Copilot' : '▶ Discover with External AI',
        aiMode === 'copilot' ? 'Using GitHub Copilot (active)' : 'Using external endpoint (active)',
        vscode.TreeItemCollapsibleState.None,
        'action'
      );
      primaryAction.command = {
        command: aiMode === 'copilot' ? 'ripp.discover.copilot' : 'ripp.discover',
        title: 'Discover Intent',
        arguments: []
      };
      children.push(primaryAction);

      // Add alternative action
      const altAction = new WorkflowTreeItem(
        aiMode === 'copilot' ? '  Use External AI instead' : '  Use Copilot instead',
        'Click to switch and discover',
        vscode.TreeItemCollapsibleState.None,
        'action'
      );
      altAction.command = {
        command: aiMode === 'copilot' ? 'ripp.discover' : 'ripp.discover.copilot',
        title: 'Discover with alternative',
        arguments: []
      };
      children.push(altAction);

      // Add config link
      const configAction = new WorkflowTreeItem(
        '  ⚙ Configure AI Mode',
        'Choose between Copilot and external endpoint',
        vscode.TreeItemCollapsibleState.None,
        'action'
      );
      configAction.command = {
        command: 'ripp.ai.configureMode',
        title: 'Configure AI Mode',
        arguments: []
      };
      children.push(configAction);
    } else if (step.command && canRun) {
      // Default action button for other steps
      const actionItem = new WorkflowTreeItem(
        `▶ Run ${step.label}`,
        '',
        vscode.TreeItemCollapsibleState.None,
        'action'
      );
      actionItem.command = {
        command: step.command,
        title: `Run ${step.label}`,
        arguments: []
      };
      children.push(actionItem);
    }

    item.children = children;
    return item;
  }

  private createUtilityActionsSection(): WorkflowTreeItem {
    const section = new WorkflowTreeItem(
      'Utilities',
      '',
      vscode.TreeItemCollapsibleState.Expanded,
      'section'
    );

    section.children = [
      this.createActionItem('Configuration', 'Edit RIPP config', 'ripp.config.edit'),
      this.createActionItem('Connections', 'Manage AI connections', 'ripp.connections.edit'),
      this.createActionItem('Refresh', 'Refresh workflow status', 'ripp.refreshStatus'),
      this.createActionItem('Documentation', 'Open RIPP docs', 'ripp.openDocs')
    ];

    return section;
  }

  private createActionItem(
    label: string,
    description: string,
    commandId: string
  ): WorkflowTreeItem {
    const item = new WorkflowTreeItem(
      label,
      description,
      vscode.TreeItemCollapsibleState.None,
      'action'
    );
    item.command = {
      command: commandId,
      title: label,
      arguments: []
    };
    return item;
  }

  private getStatusIcon(status: StepStatus): string {
    switch (status) {
      case 'not-started':
        return '○';
      case 'ready':
        return '◌';
      case 'in-progress':
        return '◐';
      case 'done':
        return '●';
      case 'error':
        return '✗';
      default:
        return '○';
    }
  }

  private canRunStep(step: WorkflowStep): boolean {
    if (!step.prerequisite) {
      return true;
    }

    const prerequisite = this.steps.get(step.prerequisite);
    if (!prerequisite) {
      return true;
    }

    return prerequisite.status === 'done';
  }

  private updateAllStatuses(): void {
    if (!this.workspaceRoot) {
      return;
    }

    // Step 1: Initialize - check if .ripp directory exists
    const rippDir = path.join(this.workspaceRoot, '.ripp');
    const initStep = this.steps.get('init');
    if (initStep) {
      initStep.status = fs.existsSync(rippDir) ? 'done' : 'ready';
    }

    // Step 2: Evidence - check if evidence pack exists
    const evidenceIndex = path.join(this.workspaceRoot, '.ripp', 'evidence', 'evidence.index.json');
    const evidenceStep = this.steps.get('evidence');
    if (evidenceStep) {
      if (fs.existsSync(evidenceIndex)) {
        evidenceStep.status = 'done';
        evidenceStep.outputFiles = [
          '.ripp/evidence/evidence.index.json',
          '.ripp/evidence/routes.json',
          '.ripp/evidence/schemas.json'
        ].filter(file => fs.existsSync(path.join(this.workspaceRoot!, file)));
      } else {
        evidenceStep.status = this.canRunStep(evidenceStep) ? 'ready' : 'not-started';
      }
    }

    // Step 3: Discover - check if candidates exist
    const candidatesFiles = this.getCandidatesFiles();
    const discoverStep = this.steps.get('discover');
    if (discoverStep) {
      if (candidatesFiles.length > 0) {
        discoverStep.status = 'done';
        discoverStep.outputFiles = candidatesFiles;
      } else {
        discoverStep.status = this.canRunStep(discoverStep) ? 'ready' : 'not-started';
      }
    }

    // Step 4: Confirm - check if confirmed intent exists
    const confirmedFiles = this.getConfirmedFiles();
    const confirmStep = this.steps.get('confirm');
    if (confirmStep) {
      if (confirmedFiles.length > 0) {
        confirmStep.status = 'done';
        confirmStep.outputFiles = confirmedFiles;
      } else {
        confirmStep.status = this.canRunStep(confirmStep) ? 'ready' : 'not-started';
      }
    }

    // Step 5: Finalize - check if RIPP packets exist
    const rippPackets = this.getRippPackets();
    const finalizeStep = this.steps.get('finalize');
    if (finalizeStep) {
      if (rippPackets.length > 0) {
        finalizeStep.status = 'done';
        finalizeStep.outputFiles = rippPackets;
      } else {
        finalizeStep.status = this.canRunStep(finalizeStep) ? 'ready' : 'not-started';
      }
    }
  }

  private getCandidatesFiles(): string[] {
    if (!this.workspaceRoot) {
      return [];
    }

    const rippDir = path.join(this.workspaceRoot, '.ripp');
    const candidatesPath = path.join(rippDir, 'intent.candidates.yaml');
    
    if (fs.existsSync(candidatesPath)) {
      return ['.ripp/intent.candidates.yaml'];
    }
    
    return [];
  }

  private getConfirmedFiles(): string[] {
    if (!this.workspaceRoot) {
      return [];
    }

    const confirmedDir = path.join(this.workspaceRoot, '.ripp', 'confirmed');
    if (!fs.existsSync(confirmedDir)) {
      return [];
    }

    try {
      return fs
        .readdirSync(confirmedDir)
        .filter(file => file.startsWith('intent.confirmed.'))
        .map(file => `.ripp/confirmed/${file}`);
    } catch {
      return [];
    }
  }

  private getRippPackets(): string[] {
    if (!this.workspaceRoot) {
      return [];
    }

    const rippDir = path.join(this.workspaceRoot, '.ripp');
    if (!fs.existsSync(rippDir)) {
      return [];
    }

    try {
      return fs
        .readdirSync(rippDir)
        .filter(file => file.endsWith('.ripp.yaml') || file.endsWith('.ripp.json'))
        .map(file => `.ripp/${file}`);
    } catch {
      return [];
    }
  }

  /**
   * Get active AI mode from config
   */
  private getActiveAiMode(): 'copilot' | 'endpoint' {
    if (!this.workspaceRoot) {
      return 'endpoint';
    }

    const configPath = path.join(this.workspaceRoot, '.ripp', 'config.yaml');
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

  /**
   * Update step status
   */
  public updateStepStatus(stepId: string, status: StepStatus, lastRun?: number): void {
    const step = this.steps.get(stepId);
    if (step) {
      step.status = status;
      if (lastRun) {
        step.lastRun = lastRun;
      }
      this.refresh();
    }
  }

  /**
   * Update step outputs
   */
  public updateStepOutputs(stepId: string, outputFiles: string[]): void {
    const step = this.steps.get(stepId);
    if (step) {
      step.outputFiles = outputFiles;
      this.refresh();
    }
  }
}

export class WorkflowTreeItem extends vscode.TreeItem {
  children: WorkflowTreeItem[] | undefined;
  itemType: string;

  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    itemType: string = 'default',
    children?: WorkflowTreeItem[]
  ) {
    super(label, collapsibleState);
    this.description = description;
    this.children = children;
    this.itemType = itemType;
    this.contextValue = itemType;

    // Set icons based on type
    if (itemType === 'action') {
      this.iconPath = new vscode.ThemeIcon('play');
    } else if (itemType === 'file') {
      this.iconPath = new vscode.ThemeIcon('file');
    } else if (itemType === 'outputs') {
      this.iconPath = new vscode.ThemeIcon('folder-opened');
    }
  }
}
