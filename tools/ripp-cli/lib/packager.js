/**
 * RIPP Packager
 *
 * Read-only artifact generator that creates normalized handoff artifacts.
 *
 * Guardrails:
 * - Does NOT modify source RIPP packets
 * - Validates input before packaging
 * - Generates normalized, clean output
 * - Supports multiple formats (JSON, YAML, Markdown, HTML)
 */

const yaml = require('js-yaml');

/**
 * Package a RIPP packet into a normalized artifact
 * @param {Object} packet - Validated RIPP packet
 * @param {Object} options - Packaging options
 * @returns {Object} Packaged result with metadata
 */
function packagePacket(packet, options = {}) {
  const normalized = normalizePacket(packet);

  const packaged = {
    _meta: {
      packaged_at: new Date().toISOString(),
      packaged_by: 'ripp-cli',
      source_level: packet.level,
      ripp_version: packet.ripp_version
    },
    ...normalized
  };

  return packaged;
}

/**
 * Normalize a RIPP packet by removing empty optional fields
 * and organizing data consistently
 */
function normalizePacket(packet) {
  const normalized = {};

  // Copy required metadata
  normalized.ripp_version = packet.ripp_version;
  normalized.packet_id = packet.packet_id;
  normalized.title = packet.title;
  normalized.created = packet.created;
  normalized.updated = packet.updated;
  normalized.status = packet.status;
  normalized.level = packet.level;

  // Copy optional version if present
  if (packet.version) {
    normalized.version = packet.version;
  }

  // Copy purpose (always required)
  normalized.purpose = { ...packet.purpose };

  // Copy ux_flow (always required)
  normalized.ux_flow = packet.ux_flow.map(step => ({ ...step }));

  // Copy data_contracts (always required)
  normalized.data_contracts = {};
  if (packet.data_contracts.inputs) {
    normalized.data_contracts.inputs = packet.data_contracts.inputs.map(entity => ({ ...entity }));
  }
  if (packet.data_contracts.outputs) {
    normalized.data_contracts.outputs = packet.data_contracts.outputs.map(entity => ({
      ...entity
    }));
  }

  // Copy Level 2+ fields if present
  if (packet.api_contracts) {
    normalized.api_contracts = packet.api_contracts.map(api => ({ ...api }));
  }

  if (packet.permissions) {
    normalized.permissions = packet.permissions.map(perm => ({ ...perm }));
  }

  if (packet.failure_modes) {
    normalized.failure_modes = packet.failure_modes.map(fm => ({ ...fm }));
  }

  // Copy Level 3 fields if present
  if (packet.audit_events) {
    normalized.audit_events = packet.audit_events.map(event => ({ ...event }));
  }

  if (packet.nfrs) {
    normalized.nfrs = { ...packet.nfrs };
  }

  if (packet.acceptance_tests) {
    normalized.acceptance_tests = packet.acceptance_tests.map(test => ({ ...test }));
  }

  return normalized;
}

/**
 * Format packaged packet as JSON
 */
function formatAsJson(packaged, options = {}) {
  const indent = options.pretty !== false ? 2 : 0;
  return JSON.stringify(packaged, null, indent);
}

/**
 * Format packaged packet as YAML
 */
function formatAsYaml(packaged, options = {}) {
  return yaml.dump(packaged, {
    indent: 2,
    lineWidth: 100,
    noRefs: true
  });
}

/**
 * Format packaged packet as Markdown
 */
function formatAsMarkdown(packaged, options = {}) {
  let md = '';

  // Header
  md += `# ${packaged.title}\n\n`;
  md += `**Packet ID**: \`${packaged.packet_id}\`  \n`;
  md += `**Level**: ${packaged.level}  \n`;
  md += `**Status**: ${packaged.status}  \n`;
  md += `**Created**: ${packaged.created}  \n`;
  md += `**Updated**: ${packaged.updated}  \n`;

  if (packaged.version) {
    md += `**Version**: ${packaged.version}  \n`;
  }

  md += '\n---\n\n';

  // Packaging metadata
  md += '## Packaging Information\n\n';
  md += `This document was packaged by \`${packaged._meta.packaged_by}\` on ${packaged._meta.packaged_at}.\n\n`;
  md += '---\n\n';

  // Purpose
  md += '## Purpose\n\n';
  md += `### Problem\n${packaged.purpose.problem}\n\n`;
  md += `### Solution\n${packaged.purpose.solution}\n\n`;
  md += `### Value\n${packaged.purpose.value}\n\n`;

  if (packaged.purpose.out_of_scope) {
    md += `### Out of Scope\n${packaged.purpose.out_of_scope}\n\n`;
  }

  if (packaged.purpose.assumptions && packaged.purpose.assumptions.length > 0) {
    md += '### Assumptions\n\n';
    packaged.purpose.assumptions.forEach(assumption => {
      md += `- ${assumption}\n`;
    });
    md += '\n';
  }

  if (packaged.purpose.references && packaged.purpose.references.length > 0) {
    md += '### References\n\n';
    packaged.purpose.references.forEach(ref => {
      md += `- [${ref.title}](${ref.url})\n`;
    });
    md += '\n';
  }

  // UX Flow
  md += '## UX Flow\n\n';
  packaged.ux_flow.forEach(step => {
    md += `### Step ${step.step}: ${step.actor}\n\n`;
    md += `**Action**: ${step.action}\n\n`;
    if (step.trigger) md += `**Trigger**: ${step.trigger}\n\n`;
    if (step.result) md += `**Result**: ${step.result}\n\n`;
    if (step.condition) md += `**Condition**: ${step.condition}\n\n`;
  });

  // Data Contracts
  md += '## Data Contracts\n\n';

  if (packaged.data_contracts.inputs && packaged.data_contracts.inputs.length > 0) {
    md += '### Inputs\n\n';
    packaged.data_contracts.inputs.forEach(entity => {
      md += `#### ${entity.name}\n\n`;
      if (entity.description) md += `${entity.description}\n\n`;
      md += '| Field | Type | Required | Description |\n';
      md += '|-------|------|----------|-------------|\n';
      entity.fields.forEach(field => {
        md += `| ${field.name} | ${field.type} | ${field.required ? 'Yes' : 'No'} | ${field.description} |\n`;
      });
      md += '\n';
    });
  }

  if (packaged.data_contracts.outputs && packaged.data_contracts.outputs.length > 0) {
    md += '### Outputs\n\n';
    packaged.data_contracts.outputs.forEach(entity => {
      md += `#### ${entity.name}\n\n`;
      if (entity.description) md += `${entity.description}\n\n`;
      md += '| Field | Type | Required | Description |\n';
      md += '|-------|------|----------|-------------|\n';
      entity.fields.forEach(field => {
        md += `| ${field.name} | ${field.type} | ${field.required ? 'Yes' : 'No'} | ${field.description} |\n`;
      });
      md += '\n';
    });
  }

  // API Contracts (Level 2+)
  if (packaged.api_contracts) {
    md += '## API Contracts\n\n';
    packaged.api_contracts.forEach(api => {
      md += `### ${api.method} ${api.endpoint}\n\n`;
      md += `**Purpose**: ${api.purpose}\n\n`;

      if (api.request) {
        md += '**Request**:\n';
        if (api.request.content_type) md += `- Content-Type: ${api.request.content_type}\n`;
        if (api.request.schema_ref) md += `- Schema: ${api.request.schema_ref}\n`;
        md += '\n';
      }

      md += '**Response**:\n';
      md += `- Success: ${api.response.success.status}\n`;
      if (api.response.success.schema_ref) {
        md += `  - Schema: ${api.response.success.schema_ref}\n`;
      }
      md += '\n**Errors**:\n';
      api.response.errors.forEach(err => {
        md += `- ${err.status}: ${err.description}\n`;
      });
      md += '\n';
    });
  }

  // Permissions (Level 2+)
  if (packaged.permissions) {
    md += '## Permissions\n\n';
    packaged.permissions.forEach(perm => {
      md += `### ${perm.action}\n\n`;
      md += `**Required Roles**: ${perm.required_roles.join(', ')}\n\n`;
      if (perm.resource_scope) md += `**Resource Scope**: ${perm.resource_scope}\n\n`;
      md += `**Description**: ${perm.description}\n\n`;
    });
  }

  // Failure Modes (Level 2+)
  if (packaged.failure_modes) {
    md += '## Failure Modes\n\n';
    packaged.failure_modes.forEach(fm => {
      md += `### ${fm.scenario}\n\n`;
      md += `**Impact**: ${fm.impact}\n\n`;
      md += `**Handling**: ${fm.handling}\n\n`;
      md += `**User Message**: "${fm.user_message}"\n\n`;
    });
  }

  // Audit Events (Level 3)
  if (packaged.audit_events) {
    md += '## Audit Events\n\n';
    packaged.audit_events.forEach(event => {
      md += `### ${event.event}\n\n`;
      md += `**Severity**: ${event.severity}\n\n`;
      md += `**Purpose**: ${event.purpose}\n\n`;
      md += `**Includes**: ${event.includes.join(', ')}\n\n`;
      if (event.retention) md += `**Retention**: ${event.retention}\n\n`;
    });
  }

  // NFRs (Level 3)
  if (packaged.nfrs) {
    md += '## Non-Functional Requirements\n\n';

    if (packaged.nfrs.performance) {
      md += '### Performance\n\n';
      Object.keys(packaged.nfrs.performance).forEach(key => {
        md += `- **${key}**: ${packaged.nfrs.performance[key]}\n`;
      });
      md += '\n';
    }

    if (packaged.nfrs.scalability) {
      md += '### Scalability\n\n';
      Object.keys(packaged.nfrs.scalability).forEach(key => {
        md += `- **${key}**: ${packaged.nfrs.scalability[key]}\n`;
      });
      md += '\n';
    }

    if (packaged.nfrs.availability) {
      md += '### Availability\n\n';
      Object.keys(packaged.nfrs.availability).forEach(key => {
        md += `- **${key}**: ${packaged.nfrs.availability[key]}\n`;
      });
      md += '\n';
    }

    if (packaged.nfrs.security) {
      md += '### Security\n\n';
      Object.keys(packaged.nfrs.security).forEach(key => {
        md += `- **${key}**: ${packaged.nfrs.security[key]}\n`;
      });
      md += '\n';
    }

    if (packaged.nfrs.compliance) {
      md += '### Compliance\n\n';
      Object.keys(packaged.nfrs.compliance).forEach(key => {
        md += `- **${key}**: ${packaged.nfrs.compliance[key]}\n`;
      });
      md += '\n';
    }
  }

  // Acceptance Tests (Level 3)
  if (packaged.acceptance_tests) {
    md += '## Acceptance Tests\n\n';
    packaged.acceptance_tests.forEach(test => {
      md += `### ${test.test_id}: ${test.title}\n\n`;
      md += `**Given**: ${test.given}\n\n`;
      md += `**When**: ${test.when}\n\n`;
      md += `**Then**: ${test.then}\n\n`;
      md += '**Verification**:\n';
      test.verification.forEach(v => {
        md += `- ${v}\n`;
      });
      md += '\n';
    });
  }

  return md;
}

module.exports = {
  packagePacket,
  normalizePacket,
  formatAsJson,
  formatAsYaml,
  formatAsMarkdown
};
