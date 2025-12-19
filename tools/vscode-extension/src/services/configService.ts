import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * Config Service
 *
 * Manages .ripp/config.yaml reading and writing.
 * Validates YAML structure before writing.
 * Never stores secrets in repo config.
 */

export interface RippAiConfig {
  enabled: boolean;
  provider: 'openai' | 'azure-openai' | 'ollama';
  model?: string;
  deployment?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface RippEvidencePackConfig {
  includeGlobs: string[];
  excludeGlobs: string[];
  maxFileSize?: number;
  secretPatterns?: string[];
}

export interface RippDiscoveryConfig {
  minConfidence?: number;
  includeEvidence?: boolean;
}

export interface RippConfig {
  rippVersion: string;
  ai: RippAiConfig;
  evidencePack: RippEvidencePackConfig;
  discovery?: RippDiscoveryConfig;
}

export const DEFAULT_CONFIG: RippConfig = {
  rippVersion: '1.0',
  ai: {
    enabled: false,
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxRetries: 3,
    timeout: 30000
  },
  evidencePack: {
    includeGlobs: ['src/**', 'app/**', 'api/**', 'db/**', '.github/workflows/**'],
    excludeGlobs: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.lock',
      '**/.git/**',
      '**/vendor/**',
      '**/.ripp/**'
    ],
    maxFileSize: 1048576, // 1MB
    secretPatterns: []
  },
  discovery: {
    minConfidence: 0.5,
    includeEvidence: true
  }
};

export class ConfigService {
  private static instance: ConfigService;
  public static DEFAULT_CONFIG = DEFAULT_CONFIG;

  private constructor() {}

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Get config file path
   */
  public getConfigPath(workspaceRoot: string): string {
    return path.join(workspaceRoot, '.ripp', 'config.yaml');
  }

  /**
   * Check if config exists
   */
  public configExists(workspaceRoot: string): boolean {
    return fs.existsSync(this.getConfigPath(workspaceRoot));
  }

  /**
   * Load config from .ripp/config.yaml
   * Returns default config if file doesn't exist
   */
  public loadConfig(workspaceRoot: string): RippConfig {
    const configPath = this.getConfigPath(workspaceRoot);

    if (!fs.existsSync(configPath)) {
      return DEFAULT_CONFIG;
    }

    try {
      const content = fs.readFileSync(configPath, 'utf8');
      const parsed = yaml.load(content) as Partial<RippConfig>;

      // Merge with defaults
      return this.mergeWithDefaults(parsed);
    } catch (error) {
      throw new Error(`Failed to parse .ripp/config.yaml: ${(error as Error).message}`);
    }
  }

  /**
   * Save config to .ripp/config.yaml
   * Validates YAML structure before writing
   */
  public async saveConfig(workspaceRoot: string, config: RippConfig): Promise<void> {
    const configPath = this.getConfigPath(workspaceRoot);
    const configDir = path.dirname(configPath);

    // Ensure .ripp directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Validate config structure
    this.validateConfig(config);

    // Convert to YAML
    const yamlContent = yaml.dump(config, {
      indent: 2,
      lineWidth: 100,
      noRefs: true
    });

    // Write to file
    fs.writeFileSync(configPath, yamlContent, 'utf8');
  }

  /**
   * Update specific config section
   */
  public async updateConfig(workspaceRoot: string, updates: Partial<RippConfig>): Promise<void> {
    const currentConfig = this.loadConfig(workspaceRoot);
    const newConfig = { ...currentConfig, ...updates };
    await this.saveConfig(workspaceRoot, newConfig);
  }

  /**
   * Update AI config section
   */
  public async updateAiConfig(
    workspaceRoot: string,
    aiConfig: Partial<RippAiConfig>
  ): Promise<void> {
    const currentConfig = this.loadConfig(workspaceRoot);
    currentConfig.ai = { ...currentConfig.ai, ...aiConfig };
    await this.saveConfig(workspaceRoot, currentConfig);
  }

  /**
   * Update evidence pack config section
   */
  public async updateEvidencePackConfig(
    workspaceRoot: string,
    evidencePackConfig: Partial<RippEvidencePackConfig>
  ): Promise<void> {
    const currentConfig = this.loadConfig(workspaceRoot);
    currentConfig.evidencePack = { ...currentConfig.evidencePack, ...evidencePackConfig };
    await this.saveConfig(workspaceRoot, currentConfig);
  }

  /**
   * Get AI enabled status from repo config
   */
  public getAiEnabled(workspaceRoot: string): boolean {
    const config = this.loadConfig(workspaceRoot);
    return config.ai.enabled;
  }

  /**
   * Set AI enabled status in repo config
   */
  public async setAiEnabled(workspaceRoot: string, enabled: boolean): Promise<void> {
    await this.updateAiConfig(workspaceRoot, { enabled });
  }

  /**
   * Merge partial config with defaults
   */
  private mergeWithDefaults(partial: Partial<RippConfig>): RippConfig {
    return {
      rippVersion: partial.rippVersion || DEFAULT_CONFIG.rippVersion,
      ai: {
        ...DEFAULT_CONFIG.ai,
        ...partial.ai
      },
      evidencePack: {
        ...DEFAULT_CONFIG.evidencePack,
        ...partial.evidencePack
      },
      discovery: {
        ...DEFAULT_CONFIG.discovery,
        ...partial.discovery
      }
    };
  }

  /**
   * Validate config structure
   */
  private validateConfig(config: RippConfig): void {
    if (!config.rippVersion) {
      throw new Error('rippVersion is required');
    }

    if (!config.ai) {
      throw new Error('ai section is required');
    }

    if (typeof config.ai.enabled !== 'boolean') {
      throw new Error('ai.enabled must be a boolean');
    }

    if (!['openai', 'azure-openai', 'ollama'].includes(config.ai.provider)) {
      throw new Error('ai.provider must be one of: openai, azure-openai, ollama');
    }

    if (!config.evidencePack) {
      throw new Error('evidencePack section is required');
    }

    if (!Array.isArray(config.evidencePack.includeGlobs)) {
      throw new Error('evidencePack.includeGlobs must be an array');
    }

    if (!Array.isArray(config.evidencePack.excludeGlobs)) {
      throw new Error('evidencePack.excludeGlobs must be an array');
    }
  }
}
