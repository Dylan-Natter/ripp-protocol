import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Workspace Map Service
 *
 * Maintains an internal map of RIPP workspace structure.
 * Dynamically discovers paths instead of hardcoding them.
 * Refreshes after CLI commands that may generate/move files.
 *
 * Core Principle: Never assume fixed paths
 */

export interface RippWorkspaceMap {
  workspaceRoot: string;
  rippDir: string | null;
  configPath: string | null;

  // Intent paths
  intentDir: string | null;
  candidatesPath: string | null;
  confirmedPath: string | null;

  // Evidence pack paths
  evidenceDir: string | null;
  evidenceIndexPath: string | null;

  // Output paths
  outputDir: string | null;
  handoffsDir: string | null;
  packagesDir: string | null;

  // Legacy paths (for backward compatibility)
  legacyFeaturesDir: string | null;
  legacyHandoffsDir: string | null;
  legacyPackagesDir: string | null;

  // Build outputs (dynamic discovery from CLI)
  buildOutputs: {
    handoffYaml: string | null;
    handoffMd: string | null;
  };

  // Workspace structure version
  usesLegacyStructure: boolean;
  lastRefresh: Date;
}

export interface WorkspaceMapChangeEvent {
  type: 'refresh' | 'create' | 'delete' | 'move';
  affectedPaths: string[];
}

export class WorkspaceMapService {
  private static instance: WorkspaceMapService;
  private workspaceMaps: Map<string, RippWorkspaceMap> = new Map();
  private onDidChangeEmitter = new vscode.EventEmitter<WorkspaceMapChangeEvent>();
  public readonly onDidChange = this.onDidChangeEmitter.event;

  private constructor() {}

  public static getInstance(): WorkspaceMapService {
    if (!WorkspaceMapService.instance) {
      WorkspaceMapService.instance = new WorkspaceMapService();
    }
    return WorkspaceMapService.instance;
  }

  /**
   * Get workspace map for a given workspace root
   * Auto-discovers if not cached
   */
  public getWorkspaceMap(workspaceRoot: string): RippWorkspaceMap {
    if (!this.workspaceMaps.has(workspaceRoot)) {
      this.refreshWorkspaceMap(workspaceRoot);
    }
    return this.workspaceMaps.get(workspaceRoot)!;
  }

  /**
   * Refresh workspace map by scanning filesystem
   */
  public refreshWorkspaceMap(workspaceRoot: string): RippWorkspaceMap {
    const map: RippWorkspaceMap = {
      workspaceRoot,
      rippDir: null,
      configPath: null,
      intentDir: null,
      candidatesPath: null,
      confirmedPath: null,
      evidenceDir: null,
      evidenceIndexPath: null,
      outputDir: null,
      handoffsDir: null,
      packagesDir: null,
      legacyFeaturesDir: null,
      legacyHandoffsDir: null,
      legacyPackagesDir: null,
      buildOutputs: {
        handoffYaml: null,
        handoffMd: null
      },
      usesLegacyStructure: false,
      lastRefresh: new Date()
    };

    // Check for ripp/ directory
    const rippDir = path.join(workspaceRoot, 'ripp');
    if (fs.existsSync(rippDir)) {
      map.rippDir = rippDir;
    }

    // Check for .ripp/ directory (alternative location)
    const dotRippDir = path.join(workspaceRoot, '.ripp');
    if (fs.existsSync(dotRippDir)) {
      map.rippDir = dotRippDir;
    }

    if (!map.rippDir) {
      // No RIPP structure found
      this.workspaceMaps.set(workspaceRoot, map);
      this.onDidChangeEmitter.fire({ type: 'refresh', affectedPaths: [] });
      return map;
    }

    // Check for config
    const configPath = path.join(map.rippDir, 'config.yaml');
    if (fs.existsSync(configPath)) {
      map.configPath = configPath;
    }

    // Check for new structure paths
    const intentDir = path.join(map.rippDir, 'intent');
    if (fs.existsSync(intentDir)) {
      map.intentDir = intentDir;
    }

    const outputDir = path.join(map.rippDir, 'output');
    if (fs.existsSync(outputDir)) {
      map.outputDir = outputDir;

      const handoffsDir = path.join(outputDir, 'handoffs');
      if (fs.existsSync(handoffsDir)) {
        map.handoffsDir = handoffsDir;
      }

      const packagesDir = path.join(outputDir, 'packages');
      if (fs.existsSync(packagesDir)) {
        map.packagesDir = packagesDir;
      }
    }

    // Check for evidence pack
    const evidenceDir = path.join(map.rippDir, 'evidence');
    if (fs.existsSync(evidenceDir)) {
      map.evidenceDir = evidenceDir;

      const evidenceIndexPath = path.join(evidenceDir, 'evidence.index.json');
      if (fs.existsSync(evidenceIndexPath)) {
        map.evidenceIndexPath = evidenceIndexPath;
      }
    }

    // Check for intent candidates and confirmed
    const candidatesPath = path.join(map.rippDir, 'intent.candidates.yaml');
    if (fs.existsSync(candidatesPath)) {
      map.candidatesPath = candidatesPath;
    }

    const confirmedPath = path.join(map.rippDir, 'intent.confirmed.yaml');
    if (fs.existsSync(confirmedPath)) {
      map.confirmedPath = confirmedPath;
    }

    // Check for build outputs
    const handoffYaml = path.join(map.rippDir, 'handoff.ripp.yaml');
    if (fs.existsSync(handoffYaml)) {
      map.buildOutputs.handoffYaml = handoffYaml;
    }

    const handoffMd = path.join(map.rippDir, 'handoff.ripp.md');
    if (fs.existsSync(handoffMd)) {
      map.buildOutputs.handoffMd = handoffMd;
    }

    // Check for legacy structure
    const legacyFeaturesDir = path.join(map.rippDir, 'features');
    if (fs.existsSync(legacyFeaturesDir)) {
      map.legacyFeaturesDir = legacyFeaturesDir;
      map.usesLegacyStructure = true;
    }

    const legacyHandoffsDir = path.join(map.rippDir, 'handoffs');
    if (fs.existsSync(legacyHandoffsDir)) {
      map.legacyHandoffsDir = legacyHandoffsDir;
      map.usesLegacyStructure = true;
    }

    const legacyPackagesDir = path.join(map.rippDir, 'packages');
    if (fs.existsSync(legacyPackagesDir)) {
      map.legacyPackagesDir = legacyPackagesDir;
      map.usesLegacyStructure = true;
    }

    this.workspaceMaps.set(workspaceRoot, map);
    this.onDidChangeEmitter.fire({
      type: 'refresh',
      affectedPaths: Object.values(map).filter(v => typeof v === 'string') as string[]
    });

    return map;
  }

  /**
   * Update workspace map after CLI command execution
   * Parses CLI output for generated file paths
   */
  public updateAfterCliCommand(workspaceRoot: string, cliOutput: string): void {
    // Refresh the map
    this.refreshWorkspaceMap(workspaceRoot);

    // Extract paths from CLI output (common patterns)
    const pathPatterns = [
      /Created: (.+)/g,
      /Generated: (.+)/g,
      /Output: (.+)/g,
      /Index: (.+)/g,
      /RIPP Packet: (.+)/g,
      /Handoff MD: (.+)/g
    ];

    const extractedPaths: string[] = [];

    for (const pattern of pathPatterns) {
      let match;
      while ((match = pattern.exec(cliOutput)) !== null) {
        extractedPaths.push(match[1].trim());
      }
    }

    if (extractedPaths.length > 0) {
      this.onDidChangeEmitter.fire({
        type: 'create',
        affectedPaths: extractedPaths
      });
    }
  }

  /**
   * Get intent directory (handles both new and legacy)
   */
  public getIntentDir(workspaceRoot: string): string | null {
    const map = this.getWorkspaceMap(workspaceRoot);
    return map.intentDir || map.legacyFeaturesDir;
  }

  /**
   * Get handoffs directory (handles both new and legacy)
   */
  public getHandoffsDir(workspaceRoot: string): string | null {
    const map = this.getWorkspaceMap(workspaceRoot);
    return map.handoffsDir || map.legacyHandoffsDir;
  }

  /**
   * Get packages directory (handles both new and legacy)
   */
  public getPackagesDir(workspaceRoot: string): string | null {
    const map = this.getWorkspaceMap(workspaceRoot);
    return map.packagesDir || map.legacyPackagesDir;
  }

  /**
   * Check if RIPP is initialized
   */
  public isRippInitialized(workspaceRoot: string): boolean {
    const map = this.getWorkspaceMap(workspaceRoot);
    return map.rippDir !== null;
  }

  /**
   * Check if evidence pack exists
   */
  public hasEvidencePack(workspaceRoot: string): boolean {
    const map = this.getWorkspaceMap(workspaceRoot);
    return map.evidenceIndexPath !== null;
  }

  /**
   * Check if intent candidates exist
   */
  public hasIntentCandidates(workspaceRoot: string): boolean {
    const map = this.getWorkspaceMap(workspaceRoot);
    return map.candidatesPath !== null;
  }

  /**
   * Check if intent is confirmed
   */
  public hasConfirmedIntent(workspaceRoot: string): boolean {
    const map = this.getWorkspaceMap(workspaceRoot);
    return map.confirmedPath !== null;
  }

  /**
   * Check if build outputs exist
   */
  public hasBuildOutputs(workspaceRoot: string): boolean {
    const map = this.getWorkspaceMap(workspaceRoot);
    return map.buildOutputs.handoffYaml !== null || map.buildOutputs.handoffMd !== null;
  }

  /**
   * Get recommended migration action
   */
  public getRecommendedAction(workspaceRoot: string): string | null {
    const map = this.getWorkspaceMap(workspaceRoot);

    if (!map.rippDir) {
      return 'initialize';
    }

    if (map.usesLegacyStructure && !map.intentDir) {
      return 'migrate';
    }

    if (!map.evidenceIndexPath) {
      return 'build-evidence';
    }

    if (!map.candidatesPath) {
      return 'discover-intent';
    }

    if (!map.confirmedPath) {
      return 'confirm-intent';
    }

    if (!map.buildOutputs.handoffYaml) {
      return 'build';
    }

    return null; // All steps complete
  }

  /**
   * Clear cached map (force refresh on next access)
   */
  public clearCache(workspaceRoot: string): void {
    this.workspaceMaps.delete(workspaceRoot);
  }

  /**
   * Clear all cached maps
   */
  public clearAllCaches(): void {
    this.workspaceMaps.clear();
  }
}
