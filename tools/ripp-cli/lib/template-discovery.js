/**
 * Template-Based Intent Discovery
 * 
 * Intelligent fallback that works WITHOUT AI by:
 * 1. Analyzing evidence pack patterns
 * 2. Using heuristics and templates
 * 3. Generating reasonable starter candidates
 * 4. Allowing progressive enhancement with AI later
 * 
 * This ensures RIPP works out-of-the-box for everyone.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Discover intent using template-based heuristics (no AI required)
 */
async function templateDiscoverIntent(cwd, options = {}) {
  const evidencePath = path.join(cwd, '.ripp', 'evidence', 'evidence.index.json');
  
  if (!fs.existsSync(evidencePath)) {
    throw new Error('Evidence pack not found. Run "ripp evidence build" first.');
  }

  const evidencePack = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
  const targetLevel = options.targetLevel || 1;

  // Analyze evidence patterns
  const analysis = analyzePatterns(evidencePack);
  
  // Generate candidate using templates
  const candidate = generateFromTemplate(analysis, targetLevel, evidencePack);
  
  // Build candidates structure
  const candidates = {
    version: '1.0',
    created: new Date().toISOString(),
    generatedBy: {
      provider: 'template-discovery',
      method: 'pattern-based-heuristics',
      evidencePackHash: hashEvidencePack(evidencePack)
    },
    candidates: [candidate]
  };

  // Save to candidates file
  const candidatesPath = path.join(cwd, '.ripp', 'intent.candidates.yaml');
  fs.writeFileSync(candidatesPath, yaml.dump(candidates, { indent: 2 }), 'utf8');

  return {
    candidatesPath,
    totalCandidates: 1,
    method: 'template-based',
    needsReview: true
  };
}

/**
 * Analyze evidence pack for patterns and signals
 */
function analyzePatterns(evidencePack) {
  const evidence = evidencePack.evidence;
  
  return {
    // Technology detection
    hasAPI: evidence.routes && evidence.routes.length > 0,
    hasDatabase: evidence.schemas && evidence.schemas.length > 0,
    hasAuth: evidence.auth && evidence.auth.length > 0,
    hasWorkflows: evidence.workflows && evidence.workflows.length > 0,
    
    // Counts
    routeCount: evidence.routes?.length || 0,
    schemaCount: evidence.schemas?.length || 0,
    dependencyCount: evidence.dependencies?.length || 0,
    
    // Inferred patterns
    isWebApp: (evidence.routes?.length || 0) > 0,
    isLibrary: (evidence.routes?.length || 0) === 0 && evidence.dependencies?.length > 0,
    isCLI: evidence.dependencies?.some(d => d.name.includes('commander') || d.name.includes('yargs')),
    
    // Framework detection
    framework: detectFramework(evidence.dependencies || []),
    primaryLanguage: detectLanguage(evidencePack)
  };
}

/**
 * Detect web framework from dependencies
 */
function detectFramework(dependencies) {
  const depNames = dependencies.map(d => d.name.toLowerCase());
  
  if (depNames.includes('express')) return 'Express.js';
  if (depNames.includes('fastapi')) return 'FastAPI';
  if (depNames.includes('flask')) return 'Flask';
  if (depNames.includes('next')) return 'Next.js';
  if (depNames.includes('react')) return 'React';
  if (depNames.includes('vue')) return 'Vue.js';
  
  return 'unknown';
}

/**
 * Detect primary language
 */
function detectLanguage(evidencePack) {
  if (evidencePack.evidence.dependencies?.some(d => d.name.endsWith('.js') || d.name === 'node')) {
    return 'JavaScript/Node.js';
  }
  if (evidencePack.evidence.dependencies?.some(d => d.name.includes('python'))) {
    return 'Python';
  }
  return 'unknown';
}

/**
 * Generate candidate from template based on analysis
 */
function generateFromTemplate(analysis, targetLevel, evidencePack) {
  const candidate = {
    source: 'inferred',
    confidence: 0.65, // Lower confidence for template-based (honest assessment)
    purpose: generatePurpose(analysis),
    ux_flow: generateUXFlow(analysis),
    data_contracts: generateDataContracts(analysis, evidencePack),
    evidence: extractEvidence(evidencePack),
    requires_human_confirmation: true,
    metadata: {
      generation_method: 'template-based-heuristics',
      enhancement_available: 'Enable AI for higher-confidence analysis',
      confidence_note: 'Template-generated - please review and refine'
    }
  };

  // Add Level 2+ sections if requested
  if (targetLevel >= 2 && analysis.hasAPI) {
    candidate.api_contracts = generateAPIContracts(analysis, evidencePack);
    candidate.failure_modes = generateFailureModes(analysis);
  }

  return candidate;
}

/**
 * Generate purpose section from analysis
 */
function generatePurpose(analysis) {
  let problem, solution, value;

  if (analysis.isCLI) {
    problem = 'Developers need automated tooling to streamline repetitive tasks and improve workflow efficiency.';
    solution = `This CLI tool provides commands for common operations, built with ${analysis.framework || 'modern tooling'}.`;
    value = 'Reduces manual effort and ensures consistent execution of development tasks.';
  } else if (analysis.isWebApp) {
    problem = `Users need a ${analysis.framework} application to interact with backend services and data.`;
    solution = `Web application providing user interface and API integration using ${analysis.framework}.`;
    value = 'Enables users to perform operations through an intuitive web interface.';
  } else if (analysis.isLibrary) {
    problem = 'Developers need reusable components and utilities for common functionality.';
    solution = `Library providing modular ${analysis.primaryLanguage} components and APIs.`;
    value = 'Accelerates development by providing tested, reusable code.';
  } else {
    problem = 'Users need software functionality to solve specific domain problems.';
    solution = `Application built with ${analysis.primaryLanguage} providing domain-specific features.`;
    value = 'Delivers targeted functionality to address user requirements.';
  }

  return { problem, solution, value };
}

/**
 * Generate UX flow from analysis
 */
function generateUXFlow(analysis) {
  const flow = [];

  if (analysis.isCLI) {
    flow.push(
      {
        step: 1,
        actor: 'Developer',
        action: 'Invokes CLI command with required parameters',
        trigger: 'Need to execute automated task',
        result: 'Command processes input and performs operation'
      },
      {
        step: 2,
        actor: 'CLI',
        action: 'Validates input and executes core logic',
        result: 'Operation completes and outputs result'
      },
      {
        step: 3,
        actor: 'Developer',
        action: 'Reviews output and verifies success',
        result: 'Task completed successfully or error handled'
      }
    );
  } else if (analysis.isWebApp) {
    flow.push(
      {
        step: 1,
        actor: 'User',
        action: 'Accesses web application',
        trigger: 'User navigates to application URL',
        result: 'Application loads and displays interface'
      },
      {
        step: 2,
        actor: 'User',
        action: 'Interacts with UI to perform operation',
        result: 'System processes request and updates state'
      },
      {
        step: 3,
        actor: 'System',
        action: 'Returns response and updates UI',
        result: 'User sees result of operation'
      }
    );
  } else {
    flow.push(
      {
        step: 1,
        actor: 'User',
        action: 'Initiates operation through interface',
        trigger: 'User action or automated trigger',
        result: 'System begins processing'
      },
      {
        step: 2,
        actor: 'System',
        action: 'Executes business logic',
        result: 'Operation completes and returns result'
      }
    );
  }

  return flow;
}

/**
 * Generate data contracts from evidence
 */
function generateDataContracts(analysis, evidencePack) {
  const contracts = {
    inputs: [],
    outputs: []
  };

  // Generate inputs from route parameters or CLI args
  if (analysis.hasAPI) {
    contracts.inputs.push({
      name: 'RequestPayload',
      description: 'Input data for API request',
      fields: [
        {
          name: 'id',
          type: 'string',
          required: false,
          description: 'Resource identifier'
        }
      ]
    });
  }

  // Generate outputs
  contracts.outputs.push({
    name: 'Response',
    description: 'Operation result',
    fields: [
      {
        name: 'success',
        type: 'boolean',
        required: true,
        description: 'Indicates operation success'
      },
      {
        name: 'data',
        type: 'object',
        required: false,
        description: 'Response payload'
      }
    ]
  });

  return contracts;
}

/**
 * Generate API contracts (Level 2+)
 */
function generateAPIContracts(analysis, evidencePack) {
  const routes = evidencePack.evidence.routes || [];
  
  return routes.slice(0, 5).map(route => ({
    endpoint: route.path || '/api/resource',
    method: route.method || 'GET',
    description: `${route.method} operation on ${route.path}`,
    request: { type: 'object', description: 'Request body schema' },
    response: { type: 'object', description: 'Response body schema' }
  }));
}

/**
 * Generate failure modes (Level 2+)
 */
function generateFailureModes(analysis) {
  return [
    {
      scenario: 'Invalid input',
      trigger: 'User provides malformed or invalid data',
      impact: 'Operation fails with validation error',
      recovery: 'Return 400 Bad Request with detailed error message'
    },
    {
      scenario: 'Service unavailable',
      trigger: 'Downstream dependency is unreachable',
      impact: 'Request cannot be fulfilled',
      recovery: 'Return 503 Service Unavailable and retry with exponential backoff'
    }
  ];
}

/**
 * Extract evidence references
 */
function extractEvidence(evidencePack) {
  const evidence = [];
  
  // Add key files as evidence
  if (evidencePack.evidence.routes && evidencePack.evidence.routes.length > 0) {
    evidence.push({
      file: evidencePack.evidence.routes[0].file || 'routes/index.js',
      line: 1,
      snippet: 'Route definitions detected',
      reasoning: 'Application includes HTTP endpoints'
    });
  }

  if (evidencePack.evidence.dependencies && evidencePack.evidence.dependencies.length > 0) {
    evidence.push({
      file: 'package.json',
      line: 1,
      snippet: `${evidencePack.evidence.dependencies.length} dependencies`,
      reasoning: 'Technology stack identified from dependencies'
    });
  }

  return evidence;
}

/**
 * Hash evidence pack for traceability
 */
function hashEvidencePack(evidencePack) {
  const crypto = require('crypto');
  const content = JSON.stringify(evidencePack);
  return crypto.createHash('sha256').update(content).digest('hex');
}

module.exports = {
  templateDiscoverIntent,
  analyzePatterns
};
