const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

/**
 * RIPP Configuration Manager
 * Handles loading and validation of .ripp/config.yaml with precedence rules
 */

const DEFAULT_CONFIG = {
  rippVersion: '1.0',
  ai: {
    enabled: false,
    provider: 'copilot', // copilot (default) | openai | azure-openai | ollama | custom
    model: 'gpt-4o',
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
  },
  workflow: {
    autoApprove: false,
    approvalThreshold: 0.75
  }
};

/**
 * Load RIPP configuration from .ripp/config.yaml
 * Applies precedence: defaults < repo config < env vars
 */
function loadConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, '.ripp', 'config.yaml');

  // Start with defaults
  let config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

  // Load repo config if exists
  if (fs.existsSync(configPath)) {
    try {
      const fileContent = fs.readFileSync(configPath, 'utf8');
      const repoConfig = yaml.load(fileContent);

      // Merge with defaults
      config = mergeConfig(config, repoConfig);

      // Validate against schema
      // Resolve schema path from bundled schema directory
      const schemaPath = path.join(__dirname, '../schema/ripp-config.schema.json');

      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found at: ${schemaPath}`);
      }

      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

      const ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(ajv);
      const validate = ajv.compile(schema);
      const valid = validate(config);

      if (!valid) {
        const errors = validate.errors.map(e => `${e.instancePath}: ${e.message}`).join(', ');
        throw new Error(`Invalid .ripp/config.yaml: ${errors}`);
      }
    } catch (error) {
      if (error.message.includes('Invalid .ripp/config.yaml')) {
        throw error;
      }
      throw new Error(`Failed to parse .ripp/config.yaml: ${error.message}`);
    }
  }

  // Apply environment variable overrides
  config = applyEnvOverrides(config);

  return config;
}

/**
 * Merge configuration objects (deep merge for nested objects)
 */
function mergeConfig(base, override) {
  const result = { ...base };

  for (const key in override) {
    if (override[key] !== undefined && override[key] !== null) {
      if (
        typeof override[key] === 'object' &&
        !Array.isArray(override[key]) &&
        typeof base[key] === 'object' &&
        !Array.isArray(base[key])
      ) {
        result[key] = mergeConfig(base[key] || {}, override[key]);
      } else {
        result[key] = override[key];
      }
    }
  }

  return result;
}

/**
 * Apply environment variable overrides
 * Env vars take precedence ONLY if ai.enabled=true in repo config
 */
function applyEnvOverrides(config) {
  const result = { ...config };

  // AI configuration (only if enabled in repo)
  if (result.ai.enabled) {
    // RIPP_AI_ENABLED must also be true
    const aiEnabledEnv = process.env.RIPP_AI_ENABLED;
    if (aiEnabledEnv !== undefined) {
      const enabled = aiEnabledEnv.toLowerCase() === 'true';
      if (!enabled) {
        // Env var explicitly disables AI
        result.ai.enabled = false;
      }
    }

    // Other AI settings (only if AI is enabled)
    if (result.ai.enabled) {
      if (process.env.RIPP_AI_PROVIDER) {
        result.ai.provider = process.env.RIPP_AI_PROVIDER;
      }
      if (process.env.RIPP_AI_MODEL) {
        result.ai.model = process.env.RIPP_AI_MODEL;
      }
      if (process.env.RIPP_AI_ENDPOINT) {
        result.ai.customEndpoint = process.env.RIPP_AI_ENDPOINT;
      }
      if (process.env.RIPP_AI_MAX_RETRIES) {
        result.ai.maxRetries = parseInt(process.env.RIPP_AI_MAX_RETRIES, 10);
      }
      if (process.env.RIPP_AI_TIMEOUT) {
        result.ai.timeout = parseInt(process.env.RIPP_AI_TIMEOUT, 10);
      }
    }
  } else {
    // If ai.enabled=false in repo config, AI is ALWAYS OFF
    result.ai.enabled = false;
  }

  return result;
}

/**
 * Check if AI is enabled and properly configured
 * Returns { enabled: boolean, reason: string }
 */
function checkAiEnabled(config) {
  if (!config.ai.enabled) {
    return {
      enabled: false,
      reason: 'AI is disabled in .ripp/config.yaml (ai.enabled: false)'
    };
  }

  // Check for runtime env var
  const aiEnabledEnv = process.env.RIPP_AI_ENABLED;
  if (aiEnabledEnv === undefined || aiEnabledEnv.toLowerCase() !== 'true') {
    return {
      enabled: false,
      reason: 'AI is enabled in config but RIPP_AI_ENABLED env var is not set to "true"'
    };
  }

  // Check for API key based on provider
  const provider = config.ai.provider;
  if (provider === 'copilot') {
    // Copilot uses VS Code's language model API or falls back to OpenAI
    // No explicit API key required when using VS Code extension
    // CLI usage will fall back to OpenAI provider if OPENAI_API_KEY is set
    return { valid: true };
  } else if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      return {
        enabled: false,
        reason: 'OPENAI_API_KEY environment variable is not set'
      };
    }
  } else if (provider === 'azure-openai') {
    if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
      return {
        enabled: false,
        reason: 'AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT environment variables are required'
      };
    }
  } else if (provider === 'custom') {
    if (!config.ai.customEndpoint) {
      return {
        enabled: false,
        reason: 'Custom provider requires customEndpoint in config'
      };
    }
  }

  return { enabled: true, reason: '' };
}

/**
 * Create default .ripp/config.yaml file
 */
function createDefaultConfig(cwd = process.cwd(), options = {}) {
  const rippDir = path.join(cwd, '.ripp');
  const configPath = path.join(rippDir, 'config.yaml');

  // Create .ripp directory if it doesn't exist
  if (!fs.existsSync(rippDir)) {
    fs.mkdirSync(rippDir, { recursive: true });
  }

  // Check if config already exists
  if (fs.existsSync(configPath) && !options.force) {
    return { created: false, path: configPath };
  }

  // Create config with helpful comments
  const configContent = `# RIPP Configuration
# Version: 1.0
# Documentation: https://dylan-natter.github.io/ripp-protocol

rippVersion: "1.0"

# AI Configuration (vNext Intent Discovery Mode)
# AI is DISABLED BY DEFAULT for security and trust
ai:
  enabled: false  # Set to true AND set RIPP_AI_ENABLED=true to enable AI features
  provider: copilot # copilot (default) | openai | azure-openai | ollama | custom
  model: gpt-4o-mini  # Model identifier

# Evidence Pack Configuration
evidencePack:
  includeGlobs:
    - "src/**"
    - "app/**"
    - "api/**"
    - "db/**"
    - ".github/workflows/**"
  excludeGlobs:
    - "**/node_modules/**"
    - "**/dist/**"
    - "**/build/**"
    - "**/*.lock"
    - "**/.git/**"
    - "**/vendor/**"
    - "**/.ripp/**"
  maxFileSize: 1048576  # 1MB

# Discovery Configuration
discovery:
  minConfidence: 0.5  # Minimum confidence for AI-inferred intent (0.0-1.0)
  includeEvidence: true  # Include evidence references in candidates
`;

  fs.writeFileSync(configPath, configContent, 'utf8');

  return { created: true, path: configPath };
}

module.exports = {
  loadConfig,
  checkAiEnabled,
  createDefaultConfig,
  DEFAULT_CONFIG
};
