import * as vscode from 'vscode';
import * as crypto from 'crypto';

/**
 * AI Provider interface matching CLI's AIProvider shape
 * This allows the extension to provide its own AI implementation
 * without modifying CLI code
 */
export interface AIProvider {
	inferIntent(evidencePack: EvidencePack, options?: InferOptions): Promise<CandidatesResponse>;
	isConfigured(): boolean;
}

export interface EvidencePack {
	version: string;
	created: string;
	stats: {
		totalFiles: number;
		totalSize: number;
		includedFiles: number;
		excludedFiles: number;
	};
	evidence: {
		dependencies: any[];
		routes: any[];
		schemas: any[];
		auth: any[];
		workflows: any[];
		projectType?: {
			primary: string;
			secondary: string | null;
			confidence: string;
			scores: Record<string, number>;
		};
		keyInsights?: {
			purpose: string | null;
			description: string | null;
			mainFeatures: string[];
			architecture: string | null;
		};
		codeSnippets?: Array<{
			file: string;
			type: string;
			name?: string;
			snippet: string;
		}>;
	};
	files?: Array<{
		path: string;
		hash: string;
		size: number;
		type: string;
	}>;
}

export interface InferOptions {
	targetLevel?: number;
	timeout?: number;
}

export interface CandidatesResponse {
	version: string;
	created: string;
	generatedBy: {
		provider: string;
		model: string;
		evidencePackHash: string;
	};
	candidates: IntentCandidate[];
}

export interface IntentCandidate {
	source: 'inferred';
	confidence: number;
	evidence: EvidenceReference[];
	requires_human_confirmation: true;
	[key: string]: any;
}

export interface EvidenceReference {
	file: string;
	line: number;
	snippet?: string;
}

/**
 * Configuration for Copilot Language Model provider
 */
export interface CopilotLmConfig {
	family?: string; // Preferred model family (e.g., 'gpt-4o')
	justification?: string; // Human-readable justification for model usage
	maxRetries?: number;
}

/**
 * Copilot Language Model Provider
 * 
 * Uses VS Code's Language Model API (vscode.lm) to access GitHub Copilot models.
 * This provider MUST only be called from user-initiated commands due to consent requirements.
 */
export class CopilotLmProvider implements AIProvider {
	private config: CopilotLmConfig;
	private outputChannel?: vscode.OutputChannel;

	constructor(config: CopilotLmConfig = {}, outputChannel?: vscode.OutputChannel) {
		this.config = {
			family: config.family || 'gpt-4o',
			justification: config.justification || 'Analyzing code evidence to discover RIPP intent',
			maxRetries: config.maxRetries || 3
		};
		this.outputChannel = outputChannel;
	}

	/**
	 * Check if Copilot models are available
	 * Note: This doesn't guarantee consent - that's checked at runtime during selectChatModels
	 */
	isConfigured(): boolean {
		// Copilot provider is "configured" if vscode.lm API is available
		// Actual availability is checked at runtime in inferIntent
		return typeof vscode.lm !== 'undefined' && typeof vscode.lm.selectChatModels === 'function';
	}

	/**
	 * Infer intent from evidence pack using Copilot language models
	 * 
	 * @param evidencePack Evidence pack to analyze
	 * @param options Inference options
	 * @param cancellationToken Optional cancellation token
	 * @returns Promise<CandidatesResponse> with inferred candidates
	 */
	async inferIntent(
		evidencePack: EvidencePack,
		options: InferOptions = {},
		cancellationToken?: vscode.CancellationToken
	): Promise<CandidatesResponse> {
		this.log('Starting intent inference with Copilot...');

		if (!this.isConfigured()) {
			throw new Error('VS Code Language Model API is not available. Please update VS Code to a newer version.');
		}

		// Select Copilot models
		const models = await vscode.lm.selectChatModels({
			vendor: 'copilot',
			family: this.config.family
		});

		if (models.length === 0) {
			throw new CopilotNotAvailableError(
				'No Copilot models available. Please install GitHub Copilot extension and sign in.'
			);
		}

		const model = models[0];
		this.log(`Using model: ${model.vendor}/${model.family} (${model.id})`);

		// Build prompt
		const prompt = this.buildPrompt(evidencePack, options);

		// Attempt inference with retries
		const maxRetries = this.config.maxRetries || 3;
		let lastError: Error | null = null;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				this.log(`Inference attempt ${attempt}/${maxRetries}`);

				const response = await this.makeRequest(model, prompt, cancellationToken);
				const candidates = this.parseResponse(response, evidencePack, model);

				// Validate structure
				this.validateCandidates(candidates);

				this.log('Intent inference successful');
				return candidates;

			} catch (error) {
				lastError = error as Error;
				this.log(`Attempt ${attempt} failed: ${lastError.message}`);

				// Don't retry on cancellation or certain errors
				if (cancellationToken?.isCancellationRequested) {
					throw new Error('Intent inference was cancelled');
				}

				if (error instanceof CopilotNotAvailableError || 
					error instanceof CopilotPermissionError) {
					throw error; // Don't retry permission/availability errors
				}

				if (attempt < maxRetries) {
					// Add feedback for next attempt
					prompt.feedback = lastError.message;
				}
			}
		}

		throw new Error(`Failed to infer intent after ${maxRetries} attempts: ${lastError?.message}`);
	}

	/**
	 * Build prompt messages for Copilot
	 */
	private buildPrompt(evidencePack: EvidencePack, options: InferOptions) {
		const targetLevel = options.targetLevel || 1;
		const projectType = evidencePack.evidence.projectType?.primary || 'unknown';
		const insights: any = evidencePack.evidence.keyInsights || {};
		const snippets: any[] = evidencePack.evidence.codeSnippets || [];

		const systemPrompt = `You are a RIPP (Regenerative Intent Prompting Protocol) intent inference assistant.

Your task is to analyze ${projectType} project evidence and generate a complete RIPP packet structure.

PROJECT CONTEXT:
Type: ${projectType}
${insights.purpose ? `Purpose: ${insights.purpose}` : ''}
${insights.description ? `Description: ${insights.description}` : ''}
${insights.mainFeatures?.length ? `Features:\n${insights.mainFeatures.map((f: string) => `  - ${f}`).join('\n')}` : ''}

RIPP PACKET STRUCTURE:
A RIPP packet documents intent for a feature/system with these sections:
- purpose: {problem, solution, value} - WHY this exists
- ux_flow: [steps] - HOW users interact
- data_contracts: {inputs, outputs} - WHAT data flows through

CRITICAL RULES:
1. Generate ONE complete RIPP candidate, not multiple sparse fragments
2. Base purpose on actual project purpose/description from evidence
3. Infer ux_flow from project type:
   - CLI: steps = commands/subcommands workflow
   - API: steps = endpoint interaction flow
   - Web App: steps = user navigation flow
   - Library: steps = developer integration flow
4. Extract data_contracts from code signatures, schemas, types
5. Use ACTUAL evidence (code snippets, dependencies, file names)
6. Set confidence 0.7-0.9 for strong evidence, 0.5-0.7 for inferred

DO NOT output "unknown" or empty fields. If uncertain, make educated inference from evidence.`;

		const userPrompt = `Generate a complete Level ${targetLevel} RIPP packet for this ${projectType} project:

EVIDENCE SUMMARY:
- Files Analyzed: ${evidencePack.files?.length || 0}
- Dependencies: ${evidencePack.evidence.dependencies?.length || 0}
- Code Snippets: ${snippets.length}
${evidencePack.evidence.routes?.length ? `- API Routes: ${evidencePack.evidence.routes.length}` : ''}

KEY DEPENDENCIES:
${evidencePack.evidence.dependencies?.slice(0, 8).map((d: any) => `  - ${d.name}${d.version ? '@' + d.version : ''}`).join('\n') || 'None'}

CODE INSIGHTS:
${snippets.slice(0, 5).map((s: any) => `  [${s.type}] ${s.name || ''}: ${s.snippet?.substring(0, 80) || ''}`).join('\n') || 'Limited code analysis'}

REQUIRED OUTPUT:
Return a single complete RIPP candidate with this EXACT structure:

{
  "candidates": [{
    "source": "inferred",
    "confidence": 0.8,
    "purpose": {
      "problem": "Describe the problem this ${projectType} solves (2-3 sentences)",
      "solution": "Describe how it solves the problem, mention key dependencies/technologies",
      "value": "Describe the value/benefits to users"
    },
    "ux_flow": [
      {"step": 1, "actor": "User/Developer", "action": "First action in typical usage", "result": "What happens"},
      {"step": 2, "actor": "System/CLI", "action": "System response", "result": "Outcome"},
      {"step": 3, "action": "Continue logical flow..."}
    ],
    "data_contracts": {
      "inputs": [{
        "name": "PrimaryInput",
        "description": "Main input to the ${projectType}",
        "fields": [
          {"name": "field1", "type": "string", "required": true, "description": "Key field"}
        ]
      }],
      "outputs": [{
        "name": "PrimaryOutput",
        "description": "Main output from the ${projectType}",
        "fields": [
          {"name": "result", "type": "object", "description": "Output structure"}
        ]
      }]
    },
    "evidence": [
      {"file": "package.json", "line": 1},
      {"file": "main-file.js", "line": 10, "snippet": "relevant code"}
    ],
    "requires_human_confirmation": true
  }]
}

CRITICAL: Return ONLY valid JSON. No markdown, no explanations. Fill ALL fields with meaningful content based on evidence.`;

		return {
			system: systemPrompt,
			user: userPrompt,
			feedback: null as string | null
		};
	}

	/**
	 * Make request to Copilot language model
	 */
	private async makeRequest(
		model: vscode.LanguageModelChat,
		prompt: { system: string; user: string; feedback: string | null },
		cancellationToken?: vscode.CancellationToken
	): Promise<string> {
		const messages = [
			vscode.LanguageModelChatMessage.User(prompt.system),
			vscode.LanguageModelChatMessage.User(prompt.user)
		];

		if (prompt.feedback) {
			messages.push(
				vscode.LanguageModelChatMessage.User(
					`Previous attempt failed validation: ${prompt.feedback}\nPlease fix and try again.`
				)
			);
		}

		try {
			const requestOptions: vscode.LanguageModelChatRequestOptions = {
				justification: this.config.justification || 'Analyzing code to discover intent',
			};

			const response = await model.sendRequest(messages, requestOptions, cancellationToken);

			// Collect response text
			let responseText = '';
			for await (const chunk of response.text) {
				if (cancellationToken?.isCancellationRequested) {
					throw new Error('Request cancelled');
				}
				responseText += chunk;
			}

			return responseText;

		} catch (error) {
			if (error instanceof vscode.LanguageModelError) {
				if (error.message.includes('model not found') || error.message.includes('NotFound')) {
					throw new CopilotNotAvailableError('Copilot model not found. Please ensure GitHub Copilot is installed and enabled.');
				} else if (error.message.includes('permission') || error.message.includes('NoPermissions')) {
					throw new CopilotPermissionError('No permission to access Copilot. Please sign in to GitHub Copilot.');
				} else if (error.message.includes('blocked') || error.message.includes('Blocked')) {
					throw new CopilotPermissionError('Request was blocked. This may be due to content filtering or rate limits.');
				} else {
					throw new Error(`Copilot error: ${error.message}`);
				}
			}
			throw error;
		}
	}

	/**
	 * Parse Copilot response into candidates structure
	 */
	private parseResponse(
		response: string,
		evidencePack: EvidencePack,
		model: vscode.LanguageModelChat
	): CandidatesResponse {
		try {
			// Remove markdown code blocks if present
			let cleanResponse = response.trim();
			if (cleanResponse.startsWith('```json')) {
				cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
			} else if (cleanResponse.startsWith('```')) {
				cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
			}

			const parsed = JSON.parse(cleanResponse);

			// Wrap in standard structure if needed
			if (Array.isArray(parsed)) {
				return {
					version: '1.0',
					created: new Date().toISOString(),
					generatedBy: {
						provider: 'copilot',
						model: `${model.vendor}/${model.family}`,
						evidencePackHash: this.hashEvidencePack(evidencePack)
					},
					candidates: parsed
				};
			} else if (parsed.candidates) {
				return {
					version: '1.0',
					created: new Date().toISOString(),
					generatedBy: {
						provider: 'copilot',
						model: `${model.vendor}/${model.family}`,
						evidencePackHash: this.hashEvidencePack(evidencePack)
					},
					...parsed
				};
			} else {
				return {
					version: '1.0',
					created: new Date().toISOString(),
					generatedBy: {
						provider: 'copilot',
						model: `${model.vendor}/${model.family}`,
						evidencePackHash: this.hashEvidencePack(evidencePack)
					},
					candidates: [parsed]
				};
			}
		} catch (error) {
			throw new Error(`Failed to parse Copilot response as JSON: ${(error as Error).message}`);
		}
	}

	/**
	 * Validate and fix candidates structure
	 */
	private validateCandidates(candidatesData: CandidatesResponse): void {
		if (!candidatesData.candidates || !Array.isArray(candidatesData.candidates)) {
			throw new Error('Response must include "candidates" array');
		}

		for (const candidate of candidatesData.candidates) {
			// Auto-fix missing source field
			if (!candidate.source) {
				candidate.source = 'inferred';
				this.log('Auto-fixed missing source field to "inferred"');
			}
			
			if (candidate.source !== 'inferred') {
				throw new Error('All candidates must have source: "inferred"');
			}

			// Auto-fix missing or invalid confidence
			if (typeof candidate.confidence !== 'number' || isNaN(candidate.confidence)) {
				candidate.confidence = 0.7; // Default to medium confidence
				this.log('Auto-fixed missing/invalid confidence to 0.7');
			}
			
			if (
				candidate.confidence < 0 ||
				candidate.confidence > 1
			) {
				// Clamp to valid range
				candidate.confidence = Math.max(0, Math.min(1, candidate.confidence));
				this.log(`Auto-fixed confidence to ${candidate.confidence}`);
			}

			// Auto-fix missing evidence array
			if (!Array.isArray(candidate.evidence)) {
				candidate.evidence = [];
				this.log('Auto-fixed missing evidence array');
			}
			
			if (candidate.evidence.length === 0) {
				throw new Error('All candidates must have at least one evidence reference');
			}

			if (candidate.requires_human_confirmation !== true) {
				candidate.requires_human_confirmation = true;
				this.log('Auto-fixed requires_human_confirmation to true');
			}

			// Validate evidence references
			for (const ev of candidate.evidence) {
				if (!ev.file || typeof ev.line !== 'number') {
					throw new Error('Evidence must have file and line number');
				}
			}
		}

		// Quality validation - check if output is actually useful
		this.validateQuality(candidatesData);
	}

	/**
	 * Validate quality of generated candidates
	 */
	private validateQuality(candidatesData: CandidatesResponse): void {
		if (candidatesData.candidates.length === 0) {
			throw new Error('No candidates generated - quality too low');
		}

		const candidate = candidatesData.candidates[0];
		let qualityScore = 0;
		const issues: string[] = [];

		// Check if purpose is meaningful
		if (candidate.purpose) {
			const purpose = candidate.purpose as any;
			if (purpose.problem && purpose.problem !== 'unknown' && purpose.problem.length > 20) {
				qualityScore += 3;
			} else {
				issues.push('purpose.problem is empty or too short');
			}
			
			if (purpose.solution && purpose.solution !== 'unknown' && purpose.solution.length > 20) {
				qualityScore += 3;
			} else {
				issues.push('purpose.solution is empty or too short');
			}
			
			if (purpose.value && purpose.value !== 'unknown' && purpose.value.length > 15) {
				qualityScore += 2;
			} else {
				issues.push('purpose.value is missing or too short');
			}
		} else {
			issues.push('purpose section is missing');
		}

		// Check if ux_flow is present and meaningful
		if (candidate.ux_flow) {
			const flow = candidate.ux_flow as any;
			if (Array.isArray(flow) && flow.length >= 3) {
				qualityScore += 2;
			} else if (flow === 'unknown' || (Array.isArray(flow) && flow.length < 2)) {
				issues.push('ux_flow is sparse (needs at least 3 steps)');
			}
		} else {
			issues.push('ux_flow is missing');
		}

		// Check if data_contracts exist
		if (candidate.data_contracts) {
			const contracts = candidate.data_contracts as any;
			if (contracts.inputs || contracts.outputs) {
				qualityScore += 2;
			}
		}

		// Confidence check
		if (candidate.confidence >= 0.6) {
			qualityScore += 1;
		}

		this.log(`Quality score: ${qualityScore}/11 (issues: ${issues.length})`);
		
		// Minimum quality threshold
		if (qualityScore < 5) {
			throw new Error(`Generated candidates quality too low (score: ${qualityScore}/11). Issues: ${issues.join(', ')}`);
		}
	}

	/**
	 * Hash evidence pack for provenance tracking
	 */
	private hashEvidencePack(evidencePack: EvidencePack): string {
		const content = JSON.stringify(evidencePack);
		return crypto.createHash('sha256').update(content).digest('hex');
	}

	/**
	 * Log message to output channel
	 */
	private log(message: string): void {
		if (this.outputChannel) {
			this.outputChannel.appendLine(`[Copilot LM] ${message}`);
		}
	}
}

/**
 * Custom error for Copilot not being available
 */
export class CopilotNotAvailableError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'CopilotNotAvailableError';
	}
}

/**
 * Custom error for Copilot permission issues
 */
export class CopilotPermissionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'CopilotPermissionError';
	}
}
