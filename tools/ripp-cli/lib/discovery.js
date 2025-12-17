const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { createProvider } = require('./ai-provider');
const { loadConfig, checkAiEnabled } = require('./config');

/**
 * RIPP Intent Discovery
 * AI-assisted candidate intent inference from evidence packs
 */

/**
 * Discover candidate intent from evidence pack
 */
async function discoverIntent(cwd, options = {}) {
  // Load configuration
  const config = loadConfig(cwd);

  // Check if AI is enabled
  const aiCheck = checkAiEnabled(config);
  if (!aiCheck.enabled) {
    throw new Error(`AI is not enabled: ${aiCheck.reason}`);
  }

  // Load evidence pack
  const evidencePath = path.join(cwd, '.ripp', 'evidence', 'evidence.index.json');
  if (!fs.existsSync(evidencePath)) {
    throw new Error('Evidence pack not found. Run "ripp evidence build" first.');
  }

  const evidencePack = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));

  // Create AI provider
  const provider = createProvider(config.ai);

  if (!provider.isConfigured()) {
    throw new Error('AI provider is not properly configured. Check environment variables.');
  }

  // Infer intent
  const targetLevel = options.targetLevel || 1;
  const candidates = await provider.inferIntent(evidencePack, {
    targetLevel,
    minConfidence: config.discovery.minConfidence
  });

  // Filter by minimum confidence if configured
  if (config.discovery.minConfidence > 0) {
    candidates.candidates = candidates.candidates.filter(
      c => c.confidence >= config.discovery.minConfidence
    );
  }

  // Write candidates to file
  const candidatesPath = path.join(cwd, '.ripp', 'intent.candidates.yaml');
  const yamlContent = yaml.dump(candidates, { indent: 2, lineWidth: 100 });
  fs.writeFileSync(candidatesPath, yamlContent, 'utf8');

  return {
    candidates,
    candidatesPath,
    totalCandidates: candidates.candidates.length
  };
}

/**
 * Validate candidate intent structure
 */
function validateCandidates(candidates) {
  const errors = [];

  if (!candidates.version || candidates.version !== '1.0') {
    errors.push('Missing or invalid version field');
  }

  if (!candidates.created) {
    errors.push('Missing created timestamp');
  }

  if (!Array.isArray(candidates.candidates)) {
    errors.push('candidates must be an array');
    return errors; // Can't continue validation
  }

  candidates.candidates.forEach((candidate, index) => {
    const prefix = `Candidate ${index + 1}`;

    if (candidate.source !== 'inferred') {
      errors.push(`${prefix}: source must be "inferred"`);
    }

    if (
      typeof candidate.confidence !== 'number' ||
      candidate.confidence < 0 ||
      candidate.confidence > 1
    ) {
      errors.push(`${prefix}: confidence must be between 0.0 and 1.0`);
    }

    if (!Array.isArray(candidate.evidence) || candidate.evidence.length === 0) {
      errors.push(`${prefix}: must have at least one evidence reference`);
    }

    if (candidate.requires_human_confirmation !== true) {
      errors.push(`${prefix}: requires_human_confirmation must be true`);
    }

    if (!candidate.content) {
      errors.push(`${prefix}: missing content field`);
    }
  });

  return errors;
}

module.exports = {
  discoverIntent,
  validateCandidates
};
