import * as assert from 'assert';
import { CopilotLmProvider, EvidencePack, CopilotNotAvailableError } from '../ai/copilotLmProvider';

/**
 * Mock VS Code Language Model API for testing
 */
class MockLanguageModelChat {
	vendor = 'copilot';
	family = 'gpt-4o';
	id = 'copilot-gpt-4o';

	private responseText: string;

	constructor(responseText: string) {
		this.responseText = responseText;
	}

	async sendRequest(_messages: any[], _options: any, _token: any) {
		return {
			text: this.streamText(this.responseText)
		};
	}

	private async *streamText(text: string) {
		// Simulate streaming by yielding chunks
		const chunkSize = 50;
		for (let i = 0; i < text.length; i += chunkSize) {
			yield text.substring(i, i + chunkSize);
		}
	}
}

/**
 * Mock vscode module for testing
 */
const mockVscode = {
	lm: {
		selectChatModels: async (_selector: any) => {
			// Return mock model by default
			return [new MockLanguageModelChat(JSON.stringify({
				version: '1.0',
				candidates: [{
					source: 'inferred',
					confidence: 0.8,
					evidence: [{ file: 'test.ts', line: 1 }],
					requires_human_confirmation: true,
					purpose: {
						problem: 'Test problem',
						solution: 'Test solution',
						value: 'Test value'
					}
				}]
			}))];
		}
	},
	LanguageModelChatMessage: {
		User: (content: string) => ({ role: 'user', content }),
		Assistant: (content: string) => ({ role: 'assistant', content })
	},
	LanguageModelError: class extends Error {
		constructor(message: string) {
			super(message);
		}
	}
};

// Mock the vscode import
(global as any).vscode = mockVscode;

suite('CopilotLmProvider Tests', () => {
	let provider: CopilotLmProvider;
	let mockEvidencePack: EvidencePack;

	setup(() => {
		provider = new CopilotLmProvider({
			family: 'gpt-4o',
			justification: 'Testing',
			maxRetries: 1
		});

		mockEvidencePack = {
			version: '1.0',
			created: new Date().toISOString(),
			stats: {
				totalFiles: 10,
				totalSize: 50000,
				includedFiles: 8,
				excludedFiles: 2
			},
			evidence: {
				dependencies: [{ name: 'test-dep', version: '1.0.0' }],
				routes: [{ path: '/api/test', method: 'GET' }],
				schemas: [],
				auth: [],
				workflows: []
			}
		};
	});

	test('isConfigured returns true when vscode.lm is available', () => {
		assert.strictEqual(provider.isConfigured(), true);
	});

	test('inferIntent returns valid candidates structure', async function() {
		this.timeout(5000); // Increase timeout for async operations

		const result = await provider.inferIntent(mockEvidencePack, { targetLevel: 1 });

		assert.ok(result);
		assert.strictEqual(result.version, '1.0');
		assert.ok(result.created);
		assert.ok(result.generatedBy);
		assert.strictEqual(result.generatedBy.provider, 'copilot');
		assert.ok(Array.isArray(result.candidates));
		assert.ok(result.candidates.length > 0);

		// Validate candidate structure
		const candidate = result.candidates[0];
		assert.strictEqual(candidate.source, 'inferred');
		assert.ok(typeof candidate.confidence === 'number');
		assert.ok(candidate.confidence >= 0 && candidate.confidence <= 1);
		assert.ok(Array.isArray(candidate.evidence));
		assert.strictEqual(candidate.requires_human_confirmation, true);
	});

	test('validateCandidates throws on invalid source', () => {
		const invalidCandidates = {
			version: '1.0',
			created: new Date().toISOString(),
			generatedBy: { provider: 'test', model: 'test', evidencePackHash: 'test' },
			candidates: [{
				source: 'manual', // Should be 'inferred'
				confidence: 0.8,
				evidence: [{ file: 'test.ts', line: 1 }],
				requires_human_confirmation: true
			}]
		};

		assert.throws(() => {
			(provider as any).validateCandidates(invalidCandidates);
		}, /source: "inferred"/);
	});

	test('validateCandidates throws on invalid confidence', () => {
		const invalidCandidates = {
			version: '1.0',
			created: new Date().toISOString(),
			generatedBy: { provider: 'test', model: 'test', evidencePackHash: 'test' },
			candidates: [{
				source: 'inferred',
				confidence: 1.5, // Out of range
				evidence: [{ file: 'test.ts', line: 1 }],
				requires_human_confirmation: true
			}]
		};

		assert.throws(() => {
			(provider as any).validateCandidates(invalidCandidates);
		}, /confidence between 0.0 and 1.0/);
	});

	test('validateCandidates throws on missing evidence', () => {
		const invalidCandidates = {
			version: '1.0',
			created: new Date().toISOString(),
			generatedBy: { provider: 'test', model: 'test', evidencePackHash: 'test' },
			candidates: [{
				source: 'inferred',
				confidence: 0.8,
				evidence: [], // Empty
				requires_human_confirmation: true
			}]
		};

		assert.throws(() => {
			(provider as any).validateCandidates(invalidCandidates);
		}, /at least one evidence reference/);
	});

	test('validateCandidates throws when requires_human_confirmation is false', () => {
		const invalidCandidates = {
			version: '1.0',
			created: new Date().toISOString(),
			generatedBy: { provider: 'test', model: 'test', evidencePackHash: 'test' },
			candidates: [{
				source: 'inferred',
				confidence: 0.8,
				evidence: [{ file: 'test.ts', line: 1 }],
				requires_human_confirmation: false // Should be true
			}]
		};

		assert.throws(() => {
			(provider as any).validateCandidates(invalidCandidates);
		}, /requires_human_confirmation: true/);
	});

	test('parseResponse handles JSON with markdown code blocks', () => {
		const responseWithMarkdown = '```json\n{"candidates": []}\n```';
		const mockModel = new MockLanguageModelChat('test');
		
		const result = (provider as any).parseResponse(responseWithMarkdown, mockEvidencePack, mockModel);
		
		assert.ok(result);
		assert.ok(Array.isArray(result.candidates));
	});

	test('parseResponse wraps array responses in standard structure', () => {
		const arrayResponse = JSON.stringify([{
			source: 'inferred',
			confidence: 0.8,
			evidence: [{ file: 'test.ts', line: 1 }],
			requires_human_confirmation: true
		}]);
		
		const mockModel = new MockLanguageModelChat('test');
		const result = (provider as any).parseResponse(arrayResponse, mockEvidencePack, mockModel);
		
		assert.ok(result);
		assert.strictEqual(result.version, '1.0');
		assert.ok(result.generatedBy);
		assert.ok(Array.isArray(result.candidates));
		assert.strictEqual(result.candidates.length, 1);
	});

	test('inferIntent throws CopilotNotAvailableError when no models available', async function() {
		this.timeout(5000);

		// Override selectChatModels to return empty array
		const originalSelectChatModels = mockVscode.lm.selectChatModels;
		mockVscode.lm.selectChatModels = async () => [];

		try {
			await assert.rejects(
				async () => {
					await provider.inferIntent(mockEvidencePack, { targetLevel: 1 });
				},
				CopilotNotAvailableError
			);
		} finally {
			// Restore original function
			mockVscode.lm.selectChatModels = originalSelectChatModels;
		}
	});

	test('buildPrompt includes target level information', () => {
		const prompt = (provider as any).buildPrompt(mockEvidencePack, { targetLevel: 2 });
		
		assert.ok(prompt.system);
		assert.ok(prompt.user);
		assert.ok(prompt.user.includes('Level 2'));
		assert.ok(prompt.user.includes('api_contracts'));
	});

	test('buildPrompt excludes advanced sections for level 1', () => {
		const prompt = (provider as any).buildPrompt(mockEvidencePack, { targetLevel: 1 });
		
		assert.ok(!prompt.user.includes('api_contracts'));
		assert.ok(!prompt.user.includes('failure_modes'));
	});
});
