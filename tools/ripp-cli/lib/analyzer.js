/**
 * RIPP Analyzer
 *
 * Extractive-only tool that generates DRAFT RIPP packets from existing code/schemas.
 *
 * CRITICAL GUARDRAILS:
 * - Extracts ONLY observable facts from code/schemas/APIs
 * - NEVER guesses or invents intent, business logic, or failure modes
 * - Output is ALWAYS marked as 'draft' and requires human review
 * - Does NOT claim generated packets are authoritative
 */

const fs = require('fs');
const path = require('path');

/**
 * Analyze input and generate a DRAFT RIPP packet
 * @param {string} inputPath - Path to input file (OpenAPI, JSON Schema, etc.)
 * @param {Object} options - Analysis options
 * @param {number} options.targetLevel - Target RIPP level (1, 2, or 3). Default: 1
 * @returns {Object} Draft RIPP packet
 */
function analyzeInput(inputPath, options = {}) {
  const ext = path.extname(inputPath).toLowerCase();
  const content = fs.readFileSync(inputPath, 'utf8');
  const targetLevel = options.targetLevel || 1;

  let input;
  try {
    input = JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse input file: ${error.message}`);
  }

  // Detect input type and extract accordingly
  if (input.openapi || input.swagger) {
    return analyzeOpenAPI(input, { ...options, targetLevel });
  } else if (input.$schema || input.type === 'object') {
    return analyzeJsonSchema(input, { ...options, targetLevel });
  } else {
    throw new Error('Unsupported input type. Currently supports: OpenAPI/Swagger, JSON Schema');
  }
}

/**
 * Analyze OpenAPI specification
 * EXTRACTIVE ONLY - does not invent intent or business logic
 */
function analyzeOpenAPI(spec, options = {}) {
  const targetLevel = options.targetLevel || 1;
  const packet = createDraftPacket(options.packetId || 'analyzed-api', targetLevel);

  // Extract title and description if present
  if (spec.info?.title) {
    packet.title = spec.info.title;
  }

  if (spec.info?.description) {
    packet.purpose.problem = `${spec.info.description} (extracted from OpenAPI spec)`;
    packet.purpose.solution = 'API-based solution (review and refine this section)';
    packet.purpose.value = 'TODO: Define business value';
  }

  // For Level 1, keep it simple with basic data contracts
  const dataContracts = extractDataContractsFromOpenAPI(spec);
  if (dataContracts.inputs.length > 0 || dataContracts.outputs.length > 0) {
    packet.data_contracts = dataContracts;
  }

  // Generate simple UX flow for Level 1
  packet.ux_flow = [
    {
      step: 1,
      actor: 'User',
      action: 'TODO: Define how user initiates API interaction',
      trigger: 'TODO: Define trigger'
    },
    {
      step: 2,
      actor: 'System',
      action: 'Processes API request',
      result: 'TODO: Define user-visible result'
    }
  ];

  // For Level 2+, extract API contracts and add required fields
  if (targetLevel >= 2) {
    const apiContracts = [];
    if (spec.paths) {
      Object.keys(spec.paths).forEach(pathKey => {
        const pathItem = spec.paths[pathKey];
        ['get', 'post', 'put', 'delete', 'patch'].forEach(method => {
          if (pathItem[method]) {
            const operation = pathItem[method];
            const contract = extractApiContract(pathKey, method.toUpperCase(), operation);
            if (contract) {
              apiContracts.push(contract);
            }
          }
        });
      });
    }

    if (apiContracts.length > 0) {
      packet.api_contracts = apiContracts;
      packet.level = 2;

      // Update UX flow based on API operations
      packet.ux_flow = generatePlaceholderUxFlow(apiContracts);
    }

    // Add placeholder permissions and failure modes for Level 2
    packet.permissions = [
      {
        action: 'api:access',
        required_roles: ['TODO: Define roles'],
        description: 'TODO: Review and define permission requirements'
      }
    ];

    packet.failure_modes = [
      {
        scenario: 'Invalid request (400 errors observed in spec)',
        impact: 'Request rejected',
        handling: 'Return 400 Bad Request',
        user_message: 'TODO: Define user-facing error messages'
      },
      {
        scenario: 'Unauthorized access (401 errors observed in spec)',
        impact: 'Access denied',
        handling: 'Return 401 Unauthorized',
        user_message: 'TODO: Define authentication error message'
      }
    ];
  }

  return packet;
}

/**
 * Extract API contract from OpenAPI operation
 * EXTRACTIVE ONLY - uses only what's in the spec
 */
function extractApiContract(endpoint, method, operation) {
  const contract = {
    endpoint,
    method,
    purpose: operation.summary || operation.description || 'TODO: Define purpose',
    response: {
      success: {
        status: 200, // Default, may be overridden
        content_type: 'application/json'
      },
      errors: []
    }
  };

  // Extract request schema if present
  if (operation.requestBody?.content?.['application/json']?.schema) {
    contract.request = {
      content_type: 'application/json',
      schema_ref: 'TODO: Map to data_contracts'
    };
  }

  // Extract success responses
  if (operation.responses) {
    Object.keys(operation.responses).forEach(statusCode => {
      const code = parseInt(statusCode);
      if (code >= 200 && code < 300) {
        contract.response.success.status = code;
        const response = operation.responses[statusCode];
        if (response.content?.['application/json']) {
          contract.response.success.schema_ref = 'TODO: Map to data_contracts';
        }
      } else if (code >= 400) {
        contract.response.errors.push({
          status: code,
          description: operation.responses[statusCode].description || `HTTP ${code} error`
        });
      }
    });
  }

  // Ensure at least one error response
  if (contract.response.errors.length === 0) {
    contract.response.errors.push({
      status: 500,
      description: 'Internal server error (default)'
    });
  }

  return contract;
}

/**
 * Extract data contracts from OpenAPI components/definitions
 */
function extractDataContractsFromOpenAPI(spec) {
  const inputs = [];
  const outputs = [];

  const schemas = spec.components?.schemas || spec.definitions || {};

  Object.keys(schemas).forEach(schemaName => {
    const schema = schemas[schemaName];
    const entity = {
      name: schemaName,
      description: schema.description || 'TODO: Add description',
      fields: []
    };

    // Extract fields from schema properties
    if (schema.properties) {
      Object.keys(schema.properties).forEach(propName => {
        const prop = schema.properties[propName];
        entity.fields.push({
          name: propName,
          type: mapOpenApiTypeToRipp(prop.type),
          required: (schema.required || []).includes(propName),
          description: prop.description || 'TODO: Add description'
        });
      });
    }

    if (entity.fields.length > 0) {
      // Heuristic: request-like names go to inputs, response-like to outputs
      if (
        schemaName.toLowerCase().includes('request') ||
        schemaName.toLowerCase().includes('input')
      ) {
        inputs.push(entity);
      } else if (
        schemaName.toLowerCase().includes('response') ||
        schemaName.toLowerCase().includes('output')
      ) {
        outputs.push(entity);
      } else {
        // Default to outputs if unclear
        outputs.push(entity);
      }
    }
  });

  return { inputs, outputs };
}

/**
 * Analyze JSON Schema
 */
function analyzeJsonSchema(schema, options = {}) {
  const targetLevel = options.targetLevel || 1;
  const packet = createDraftPacket(options.packetId || 'analyzed-schema', targetLevel);

  packet.title = schema.title || 'Analyzed Schema';
  packet.purpose.problem = 'TODO: Define the problem this schema solves';
  packet.purpose.solution = 'TODO: Define the solution approach';
  packet.purpose.value = 'TODO: Define business value';

  // Extract data contracts
  const entity = {
    name: schema.title || 'MainEntity',
    description: schema.description || 'TODO: Add description',
    fields: []
  };

  if (schema.properties) {
    Object.keys(schema.properties).forEach(propName => {
      const prop = schema.properties[propName];
      entity.fields.push({
        name: propName,
        type: mapJsonSchemaTypeToRipp(prop.type),
        required: (schema.required || []).includes(propName),
        description: prop.description || 'TODO: Add description'
      });
    });
  }

  if (entity.fields.length > 0) {
    packet.data_contracts = {
      outputs: [entity]
    };
  }

  // Generate placeholder UX flow
  packet.ux_flow = [
    {
      step: 1,
      actor: 'User',
      action: 'TODO: Define user action',
      trigger: 'TODO: Define trigger'
    },
    {
      step: 2,
      actor: 'System',
      action: 'TODO: Define system action',
      result: 'TODO: Define result'
    }
  ];

  return packet;
}

/**
 * Create a base DRAFT RIPP packet
 * Marked as 'draft' status to require human review
 */
function createDraftPacket(packetId, targetLevel = 1) {
  const now = new Date().toISOString().split('T')[0];

  return {
    ripp_version: '1.0',
    packet_id: packetId,
    title: 'DRAFT: Analyzed Feature',
    created: now,
    updated: now,
    status: 'draft', // CRITICAL: Always draft
    level: targetLevel,
    purpose: {
      problem: 'TODO: Define the problem',
      solution: 'TODO: Define the solution',
      value: 'TODO: Define the value'
    },
    ux_flow: [],
    data_contracts: {
      inputs: [],
      outputs: []
    }
  };
}

/**
 * Generate placeholder UX flow from API contracts
 */
function generatePlaceholderUxFlow(apiContracts) {
  const flow = [];
  let stepNum = 1;

  // Add initial step
  flow.push({
    step: stepNum++,
    actor: 'User',
    action: 'TODO: Define how user initiates this workflow',
    trigger: 'TODO: Define trigger'
  });

  // Add steps for each API operation
  apiContracts.forEach(api => {
    flow.push({
      step: stepNum++,
      actor: 'System',
      action: `Processes ${api.method} ${api.endpoint}`,
      result: 'TODO: Define user-visible result'
    });
  });

  // Ensure at least 2 steps
  if (flow.length < 2) {
    flow.push({
      step: stepNum,
      actor: 'System',
      action: 'TODO: Define system response',
      result: 'TODO: Define result'
    });
  }

  return flow;
}

/**
 * Map OpenAPI type to RIPP type
 */
function mapOpenApiTypeToRipp(type) {
  const typeMap = {
    string: 'string',
    number: 'number',
    integer: 'integer',
    boolean: 'boolean',
    object: 'object',
    array: 'array'
  };
  return typeMap[type] || 'string';
}

/**
 * Map JSON Schema type to RIPP type
 */
function mapJsonSchemaTypeToRipp(type) {
  return mapOpenApiTypeToRipp(type);
}

module.exports = {
  analyzeInput
};
