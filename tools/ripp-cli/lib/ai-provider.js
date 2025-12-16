/**
 * RIPP AI Provider Interface
 * Pluggable architecture for AI-assisted intent inference
 */

/**
 * Base AI Provider class
 * All providers must implement this interface
 */
class AIProvider {
  constructor(config) {
    this.config = config;
  }

  /**
   * Infer intent from evidence pack
   * @param {Object} evidencePack - Evidence pack index
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Candidate intent with confidence scores
   */
  async inferIntent(evidencePack, options) {
    throw new Error('inferIntent() must be implemented by subclass');
  }

  /**
   * Validate that the provider is properly configured
   * @returns {boolean} True if configured correctly
   */
  isConfigured() {
    throw new Error('isConfigured() must be implemented by subclass');
  }
}

/**
 * OpenAI Provider
 */
class OpenAIProvider extends AIProvider {
  constructor(config) {
    super(config);
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async inferIntent(evidencePack, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    const prompt = this.buildPrompt(evidencePack, options);
    const maxRetries = this.config.maxRetries || 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(prompt, options);
        const candidates = this.parseResponse(response, evidencePack);

        // Validate structure
        this.validateCandidates(candidates);

        return candidates;
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          // Add feedback to prompt for next attempt
          prompt.feedback = error.message;
        }
      }
    }

    throw new Error(`Failed to infer intent after ${maxRetries} attempts: ${lastError.message}`);
  }

  buildPrompt(evidencePack, options) {
    const targetLevel = options.targetLevel || 1;

    return {
      system: `You are a RIPP (Regenerative Intent Prompting Protocol) intent inference assistant.

Your task is to analyze code evidence and infer candidate RIPP sections with confidence scores.

CRITICAL RULES:
1. Every candidate MUST have:
   - source: "inferred"
   - confidence: 0.0-1.0 (be conservative)
   - evidence: array of {file, line, snippet} references
   - requires_human_confirmation: true

2. NEVER infer:
   - Permissions (mark as "unknown" - security critical)
   - Tenancy (mark as "unknown" - security critical)
   - Audit requirements (mark as "unknown" - compliance critical)

3. Be conservative with confidence:
   - 0.9-1.0: Direct evidence in code
   - 0.7-0.9: Strong patterns
   - 0.5-0.7: Reasonable inference
   - 0.0-0.5: Weak or uncertain

4. Output MUST be valid JSON matching the intent-candidates schema.`,

      user: `Analyze this evidence pack and generate Level ${targetLevel} RIPP candidate intent:

Evidence Summary:
- Dependencies: ${evidencePack.evidence.dependencies.length}
- Routes: ${evidencePack.evidence.routes.length}
- Schemas: ${evidencePack.evidence.schemas.length}
- Auth Signals: ${evidencePack.evidence.auth.length}
- Workflows: ${evidencePack.evidence.workflows.length}

Evidence Details:
${JSON.stringify(evidencePack.evidence, null, 2)}

Generate candidates for these sections:
- purpose (problem, solution, value)
- ux_flow (user interaction steps)
- data_contracts (inputs, outputs)
${targetLevel >= 2 ? '- api_contracts (endpoints, methods)' : ''}
${targetLevel >= 2 ? '- failure_modes (error scenarios)' : ''}

Return ONLY valid JSON matching the schema. No markdown, no explanations.`,

      feedback: null
    };
  }

  async makeRequest(prompt, options) {
    const model = this.config.model || 'gpt-4o-mini';
    const timeout = this.config.timeout || 30000;

    const messages = [
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user }
    ];

    if (prompt.feedback) {
      messages.push({
        role: 'user',
        content: `Previous attempt failed validation: ${prompt.feedback}\nPlease fix and try again.`
      });
    }

    const requestBody = {
      model,
      messages,
      temperature: 0.3, // Lower temperature for more deterministic output
      response_format: { type: 'json_object' }
    };

    // Use native fetch (Node 18+) or require node-fetch for older versions
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  parseResponse(response, evidencePack) {
    try {
      const parsed = JSON.parse(response);

      // Wrap in standard structure if needed
      if (Array.isArray(parsed)) {
        return {
          version: '1.0',
          created: new Date().toISOString(),
          generatedBy: {
            provider: 'openai',
            model: this.config.model || 'gpt-4o-mini',
            evidencePackHash: this.hashEvidencePack(evidencePack)
          },
          candidates: parsed
        };
      } else if (parsed.candidates) {
        return {
          version: '1.0',
          created: new Date().toISOString(),
          generatedBy: {
            provider: 'openai',
            model: this.config.model || 'gpt-4o-mini',
            evidencePackHash: this.hashEvidencePack(evidencePack)
          },
          ...parsed
        };
      } else {
        return {
          version: '1.0',
          created: new Date().toISOString(),
          generatedBy: {
            provider: 'openai',
            model: this.config.model || 'gpt-4o-mini',
            evidencePackHash: this.hashEvidencePack(evidencePack)
          },
          candidates: [parsed]
        };
      }
    } catch (error) {
      throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
    }
  }

  hashEvidencePack(evidencePack) {
    const crypto = require('crypto');
    const content = JSON.stringify(evidencePack);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  validateCandidates(candidatesData) {
    if (!candidatesData.candidates || !Array.isArray(candidatesData.candidates)) {
      throw new Error('Response must include "candidates" array');
    }

    for (const candidate of candidatesData.candidates) {
      if (candidate.source !== 'inferred') {
        throw new Error('All candidates must have source: "inferred"');
      }

      if (
        typeof candidate.confidence !== 'number' ||
        candidate.confidence < 0 ||
        candidate.confidence > 1
      ) {
        throw new Error('All candidates must have confidence between 0.0 and 1.0');
      }

      if (!Array.isArray(candidate.evidence) || candidate.evidence.length === 0) {
        throw new Error('All candidates must have at least one evidence reference');
      }

      if (candidate.requires_human_confirmation !== true) {
        throw new Error('All candidates must have requires_human_confirmation: true');
      }

      // Validate evidence references
      for (const ev of candidate.evidence) {
        if (!ev.file || typeof ev.line !== 'number') {
          throw new Error('Evidence must have file and line number');
        }
      }
    }
  }
}

/**
 * Azure OpenAI Provider
 */
class AzureOpenAIProvider extends OpenAIProvider {
  constructor(config) {
    super(config);
    this.apiKey = process.env.AZURE_OPENAI_API_KEY;
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  }

  isConfigured() {
    return !!this.apiKey && !!this.endpoint;
  }

  async makeRequest(prompt, options) {
    // Similar to OpenAI but with Azure-specific endpoint
    throw new Error('Azure OpenAI provider not yet implemented');
  }
}

/**
 * Ollama Provider (local)
 */
class OllamaProvider extends AIProvider {
  constructor(config) {
    super(config);
    this.endpoint = config.customEndpoint || 'http://localhost:11434';
  }

  isConfigured() {
    return !!this.endpoint;
  }

  async inferIntent(evidencePack, options = {}) {
    throw new Error('Ollama provider not yet implemented');
  }
}

/**
 * Custom Provider
 */
class CustomProvider extends AIProvider {
  constructor(config) {
    super(config);
    this.endpoint = config.customEndpoint;
  }

  isConfigured() {
    return !!this.endpoint;
  }

  async inferIntent(evidencePack, options = {}) {
    throw new Error('Custom provider not yet implemented');
  }
}

/**
 * Provider Factory
 */
function createProvider(config) {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'azure-openai':
      return new AzureOpenAIProvider(config);
    case 'ollama':
      return new OllamaProvider(config);
    case 'custom':
      return new CustomProvider(config);
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}

module.exports = {
  AIProvider,
  OpenAIProvider,
  AzureOpenAIProvider,
  OllamaProvider,
  CustomProvider,
  createProvider
};
