/**
 * RIPP AI Provider - World Class Intent and Functionality Analysis
 *
 * Unified AI provider using GitHub Copilot / OpenAI for intent inference.
 * Single, streamlined flow for analyzing code evidence and generating
 * production-ready RIPP intent candidates.
 */

/**
 * Copilot AI Provider
 * Primary implementation for world-class intent discovery and analysis.
 */
class CopilotProvider {
  constructor(config) {
    this.config = config;
    // Try GitHub token first (for GitHub Models), fallback to OpenAI key
    this.githubToken = process.env.GITHUB_TOKEN || this.getGitHubToken();
    this.openaiKey = process.env.OPENAI_API_KEY;
    
    // Prefer GitHub Models if token available, fallback to OpenAI
    this.useGitHubModels = !!this.githubToken;
    this.apiKey = this.useGitHubModels ? this.githubToken : this.openaiKey;
  }

  getGitHubToken() {
    // Try to get token from gh CLI
    try {
      const { execSync } = require('child_process');
      const token = execSync('gh auth token', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
      return token || null;
    } catch {
      return null;
    }
  }

  isConfigured() {
    return !!this.apiKey;
  }

  getEndpoint() {
    if (this.useGitHubModels) {
      return 'https://models.inference.ai.azure.com/chat/completions';
    }
    return 'https://api.openai.com/v1/chat/completions';
  }

  getProviderName() {
    return this.useGitHubModels ? 'github-models' : 'openai';
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
      system: `You are a RIPP (Regenerative Intent Prompting Protocol) World-Class Intent Analysis Engine.

Your mission: Generate production-ready intent candidates with exceptional accuracy and insight.

WORLD-CLASS ANALYSIS STANDARDS:
1. Every candidate MUST include:
   - source: "inferred"
   - confidence: 0.0-1.0 (be rigorous - only high scores for clear evidence)
   - evidence: detailed {file, line, snippet} references showing WHY you're confident
   - requires_human_confirmation: true

2. SECURITY-CRITICAL SECTIONS (NEVER guess):
   - Permissions: Mark as "unknown" - requires security review
   - Tenancy: Mark as "unknown" - multi-tenant implications
   - Audit requirements: Mark as "unknown" - compliance critical

3. CONFIDENCE CALIBRATION (be conservative):
   - 0.95-1.0: Direct, explicit code evidence (function names, clear implementations)
   - 0.85-0.95: Strong patterns with multiple corroborating signals
   - 0.75-0.85: Clear inference from structure and conventions
   - 0.60-0.75: Reasonable deduction, some ambiguity
   - Below 0.60: Too uncertain - don't include

4. EVIDENCE QUALITY:
   - Include specific code snippets that support your analysis
   - Reference actual file paths and line numbers
   - Explain the reasoning behind each inference
   - Cross-reference multiple evidence sources when possible

5. BUSINESS VALUE FOCUS:
   - Purpose: Articulate the REAL problem being solved (not just technical description)
   - Solution: Describe HOW the system solves it (architecture, approach)
   - Value: Specify CONCRETE value delivered (user outcomes, business impact)

6. OUTPUT FORMAT:
   - Valid JSON matching intent-candidates schema
   - No markdown, no explanations outside the JSON
   - Structured for automated processing and validation`,

      user: `Analyze this codebase evidence and generate Level ${targetLevel} RIPP candidate intent with world-class precision:

EVIDENCE SUMMARY:
- Dependencies: ${evidencePack.evidence.dependencies.length} packages
- Routes/Endpoints: ${evidencePack.evidence.routes.length} identified
- Data Schemas: ${evidencePack.evidence.schemas.length} structures
- Auth Signals: ${evidencePack.evidence.auth.length} security indicators
- Workflows: ${evidencePack.evidence.workflows.length} business processes

DETAILED EVIDENCE:
${JSON.stringify(evidencePack.evidence, null, 2)}

ANALYSIS TARGETS (Level ${targetLevel}):
Core Sections (Required):
- purpose: Define problem, solution, and business value with clarity
- ux_flow: Map complete user journey with triggers, actions, and results
- data_contracts: Specify inputs/outputs with precise field definitions

${
  targetLevel >= 2
    ? `Advanced Sections (Level 2+):
- api_contracts: Document all endpoints with methods, params, responses
- failure_modes: Identify error scenarios and recovery strategies
- nfrs: Define performance, security, and reliability requirements`
    : ''
}

${
  targetLevel >= 3
    ? `Expert Sections (Level 3):
- permissions: Role-based access controls (mark "unknown" if unclear)
- audit_events: Compliance logging requirements
- acceptance_tests: Testable success criteria`
    : ''
}

DELIVERABLE:
Return ONLY valid JSON matching the intent-candidates schema. Focus on:
1. High-confidence analysis backed by concrete evidence
2. Business-value orientation (not just technical description)
3. Production-ready candidates suitable for immediate review
4. Clear reasoning traceable to specific code artifacts

NO markdown formatting. NO explanatory text. PURE JSON output.`,

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

    const endpoint = this.getEndpoint();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`
    };

    // Add extra headers for GitHub Models
    if (this.useGitHubModels) {
      headers['extra-parameters'] = 'pass-through';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      
      // Debug: Log the raw response
      if (process.env.DEBUG_AI) {
        console.log('\n=== DEBUG: Raw API Response ===');
        console.log(JSON.stringify(data, null, 2));
        console.log('=== END DEBUG ===\n');
      }
      
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

      // Debug: Show parsed structure
      if (process.env.DEBUG_AI) {
        console.log('\n=== DEBUG: Parsed Response ===');
        console.log(JSON.stringify(parsed, null, 2).substring(0, 500));
        console.log('=== END DEBUG ===\n');
      }

      const providerName = this.getProviderName();
      const baseMetadata = {
        version: '1.0',
        created: new Date().toISOString(),
        generatedBy: {
          provider: providerName,
          model: this.config.model || 'gpt-4o',
          evidencePackHash: this.hashEvidencePack(evidencePack)
        }
      };

      let candidates = [];
      
      // Handle different response formats
      if (parsed.intent_candidates) {
        // GitHub Models format: {intent_candidates: [...]}
        candidates = parsed.intent_candidates;
      } else if (Array.isArray(parsed)) {
        candidates = parsed;
      } else if (parsed.candidates) {
        candidates = parsed.candidates;
      } else {
        candidates = [parsed];
      }

      // Merge multiple candidates into one unified candidate if needed
      if (candidates.length > 1) {
        const unified = {
          source: 'inferred',
          confidence: Math.max(...candidates.map(c => c.confidence || 0.5)),
          evidence: candidates.flatMap(c => c.evidence || []),
          requires_human_confirmation: true
        };

        // Merge all sections from candidates
        for (const candidate of candidates) {
          Object.keys(candidate).forEach(key => {
            if (!['id', 'source', 'confidence', 'evidence', 'requires_human_confirmation'].includes(key)) {
              unified[key] = candidate[key];
            }
          });
        }

        candidates = [unified];
      }

      // Ensure all candidates have required fields
      candidates = candidates.map(c => ({
        source: c.source || 'inferred',
        confidence: c.confidence || 0.5,
        evidence: c.evidence || [],
        requires_human_confirmation: c.requires_human_confirmation !== false,
        ...c
      }));

      return {
        ...baseMetadata,
        candidates
      };
    } catch (error) {
      throw new Error(`Failed to parse AI response as JSON: ${error.message}\nResponse: ${response.substring(0, 500)}`);
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
        throw new Error(`Candidate must have source: "inferred", got: ${candidate.source}`);
      }

      if (
        typeof candidate.confidence !== 'number' ||
        candidate.confidence < 0 ||
        candidate.confidence > 1
      ) {
        throw new Error('All candidates must have confidence between 0.0 and 1.0');
      }

      // Evidence is recommended but not required (allow empty array)
      if (!Array.isArray(candidate.evidence)) {
        throw new Error('Candidate must have evidence array (can be empty)');
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
 * Provider Factory - Creates Copilot AI provider instance
 */
function createProvider(config) {
  return new CopilotProvider(config);
}

module.exports = {
  CopilotProvider,
  createProvider
};
