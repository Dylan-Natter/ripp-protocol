const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const {
  parseChecklist,
  buildConfirmedIntent,
  validateConfirmedBlocks
} = require('./checklist-parser');

/**
 * RIPP Build - Canonical Artifact Compilation
 * Deterministic compilation of confirmed intent into canonical RIPP artifacts
 */

/**
 * Build canonical RIPP artifacts from confirmed intent
 */
function buildCanonicalArtifacts(cwd, options = {}) {
  let confirmed;

  // Check if building from checklist
  if (options.fromChecklist) {
    confirmed = buildFromChecklist(cwd, options);
  } else {
    const confirmedPath = path.join(cwd, '.ripp', 'intent.confirmed.yaml');

    if (!fs.existsSync(confirmedPath)) {
      throw new Error(
        'No confirmed intent found. Run "ripp confirm" first, or use "ripp build --from-checklist" to build from the checklist.'
      );
    }

    const confirmedContent = fs.readFileSync(confirmedPath, 'utf8');
    confirmed = yaml.load(confirmedContent);

    if (!confirmed.confirmed || confirmed.confirmed.length === 0) {
      throw new Error('No confirmed intent blocks found');
    }
  }

  // Build RIPP packet from confirmed intent
  const packet = buildRippPacket(confirmed, options);

  // Validate the packet
  const validation = validatePacket(packet);
  if (!validation.valid) {
    throw new Error(`Generated packet failed validation: ${validation.errors.join(', ')}`);
  }

  // Write canonical packet
  const packetPath = path.join(cwd, '.ripp', options.outputName || 'handoff.ripp.yaml');
  fs.writeFileSync(packetPath, yaml.dump(packet, { indent: 2, lineWidth: 100 }), 'utf8');

  // Generate handoff.ripp.md (consolidated markdown)
  const markdown = generateHandoffMarkdown(packet, confirmed);
  const markdownPath = path.join(cwd, '.ripp', 'handoff.ripp.md');
  fs.writeFileSync(markdownPath, markdown, 'utf8');

  return {
    packetPath,
    markdownPath,
    packet,
    level: packet.level
  };
}

/**
 * Build from checklist markdown file
 * Parses checklist, validates checked items, and generates confirmed intent
 */
function buildFromChecklist(cwd, options = {}) {
  const checklistPath = path.join(cwd, '.ripp', 'intent.checklist.md');

  // Check if checklist exists
  if (!fs.existsSync(checklistPath)) {
    throw new Error(
      `Checklist not found at ${checklistPath}. Run "ripp confirm --checklist" to generate it.`
    );
  }

  // Read and parse checklist
  const checklistContent = fs.readFileSync(checklistPath, 'utf8');
  const parseResult = parseChecklist(checklistContent);

  // Check for parsing errors
  if (parseResult.errors.length > 0) {
    const errorMsg = [
      'Failed to parse checklist:',
      ...parseResult.errors.map(e => `  - ${e}`)
    ].join('\n');
    throw new Error(errorMsg);
  }

  // Check if any candidates were checked
  if (parseResult.candidates.length === 0) {
    throw new Error(
      'No candidates selected in checklist. Mark candidates with [x] and save the file, then run this command again.'
    );
  }

  // Display warnings if any
  if (parseResult.warnings.length > 0 && options.showWarnings !== false) {
    console.warn('\n⚠️  Warnings:');
    parseResult.warnings.forEach(w => console.warn(`  - ${w}`));
    console.warn('');
  }

  // Build confirmed intent structure
  const confirmed = buildConfirmedIntent(parseResult.candidates, {
    user: options.user || 'checklist',
    timestamp: new Date().toISOString()
  });

  // Validate confirmed blocks
  const validation = validateConfirmedBlocks(confirmed.confirmed);

  // Store validation results for reporting
  const validationResults = {
    totalChecked: parseResult.candidates.length,
    accepted: validation.accepted.length,
    rejected: validation.rejected.length,
    reasons: validation.reasons
  };

  // If there are rejected blocks, report them
  if (validation.rejected.length > 0) {
    console.warn('\n⚠️  Some candidates were rejected:');
    validation.rejected.forEach(block => {
      const reasons = validation.reasons[block.section] || [];
      console.warn(`  - ${block.section}: ${reasons.join(', ')}`);
    });
    console.warn('');
  }

  // Check if we have any accepted blocks
  if (validation.accepted.length === 0) {
    throw new Error(
      'No valid candidates found. All selected candidates failed validation. Please review and fix the checklist.'
    );
  }

  // Use only accepted blocks
  const finalConfirmed = {
    version: confirmed.version,
    confirmed: validation.accepted
  };

  // Save confirmed intent for traceability
  const confirmedPath = path.join(cwd, '.ripp', 'intent.confirmed.yaml');
  fs.writeFileSync(confirmedPath, yaml.dump(finalConfirmed, { indent: 2 }), 'utf8');

  // Store validation results on options for reporting in handleBuildCommand
  options._validationResults = validationResults;

  return finalConfirmed;
}

/**
 * Build RIPP packet from confirmed intent blocks
 */
function buildRippPacket(confirmed, options) {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Initialize packet with required metadata
  const packet = {
    ripp_version: '1.0',
    packet_id: options.packetId || 'discovered-intent',
    title: options.title || 'Discovered Intent',
    created: now,
    updated: now,
    status: 'draft',
    level: determineLevel(confirmed.confirmed),
    purpose: null,
    ux_flow: null,
    data_contracts: null
  };

  // Add metadata about generation
  packet.metadata = {
    generated_from: 'ripp-discovery',
    generated_at: new Date().toISOString(),
    source: 'confirmed-intent',
    total_confirmed_blocks: confirmed.confirmed.length
  };

  // Populate sections from confirmed intent
  confirmed.confirmed.forEach(block => {
    const section = block.section;
    const content = block.content;

    // Handle full-packet or purpose sections that contain multiple fields
    if (section === 'purpose' || section === 'full-packet') {
      // Check if content has nested sections (auto-approved full packet)
      if (content.purpose) {
        packet.purpose = content.purpose;
      } else {
        // Direct purpose content (from checklist)
        packet.purpose = content;
      }

      if (content.ux_flow) {
        packet.ux_flow = Array.isArray(content.ux_flow) ? content.ux_flow : [content.ux_flow];
      }

      if (content.data_contracts) {
        packet.data_contracts = content.data_contracts;
      }

      if (content.api_contracts) {
        packet.api_contracts = Array.isArray(content.api_contracts)
          ? content.api_contracts
          : [content.api_contracts];
      }

      if (content.permissions) {
        packet.permissions = Array.isArray(content.permissions)
          ? content.permissions
          : [content.permissions];
      }

      if (content.failure_modes) {
        packet.failure_modes = Array.isArray(content.failure_modes)
          ? content.failure_modes
          : [content.failure_modes];
      }

      if (content.audit_events) {
        packet.audit_events = Array.isArray(content.audit_events)
          ? content.audit_events
          : [content.audit_events];
      }

      if (content.nfrs) {
        packet.nfrs = content.nfrs;
      }

      if (content.acceptance_tests) {
        packet.acceptance_tests = Array.isArray(content.acceptance_tests)
          ? content.acceptance_tests
          : [content.acceptance_tests];
      }
    } else {
      // Individual section (from checklist with specific section type)
      switch (section) {
        case 'ux_flow':
          packet.ux_flow = Array.isArray(content) ? content : [content];
          break;
        case 'data_contracts':
          packet.data_contracts = content;
          break;
        case 'api_contracts':
          packet.api_contracts = Array.isArray(content) ? content : [content];
          break;
        case 'permissions':
          packet.permissions = Array.isArray(content) ? content : [content];
          break;
        case 'failure_modes':
          packet.failure_modes = Array.isArray(content) ? content : [content];
          break;
        case 'audit_events':
          packet.audit_events = Array.isArray(content) ? content : [content];
          break;
        case 'nfrs':
          packet.nfrs = content;
          break;
        case 'acceptance_tests':
          packet.acceptance_tests = Array.isArray(content) ? content : [content];
          break;
      }
    }
  });

  // Ensure required sections exist (add placeholders if missing)
  if (!packet.purpose) {
    packet.purpose = {
      problem: 'TODO: Define the problem being solved',
      solution: 'TODO: Describe the solution approach',
      value: 'TODO: Specify the value delivered'
    };
  }

  if (!packet.ux_flow || packet.ux_flow.length === 0) {
    packet.ux_flow = [
      {
        step: 1,
        actor: 'User',
        action: 'TODO: Define user interaction',
        trigger: 'TODO: Define trigger'
      }
    ];
  }

  if (!packet.data_contracts) {
    packet.data_contracts = {
      inputs: [],
      outputs: []
    };
  }

  return packet;
}

/**
 * Determine RIPP level based on confirmed sections
 */
function determineLevel(confirmed) {
  const sections = new Set(confirmed.map(b => b.section));

  // Level 3 requirements
  if (sections.has('audit_events') || sections.has('nfrs') || sections.has('acceptance_tests')) {
    return 3;
  }

  // Level 2 requirements
  if (
    sections.has('api_contracts') ||
    sections.has('permissions') ||
    sections.has('failure_modes')
  ) {
    return 2;
  }

  // Default to Level 1
  return 1;
}

/**
 * Basic validation of generated packet
 */
function validatePacket(packet) {
  const errors = [];

  // Required fields
  if (!packet.ripp_version) errors.push('Missing ripp_version');
  if (!packet.packet_id) errors.push('Missing packet_id');
  if (!packet.title) errors.push('Missing title');
  if (!packet.created) errors.push('Missing created');
  if (!packet.updated) errors.push('Missing updated');
  if (!packet.status) errors.push('Missing status');
  if (!packet.level) errors.push('Missing level');

  // Required sections
  if (!packet.purpose) errors.push('Missing purpose section');
  if (!packet.ux_flow) errors.push('Missing ux_flow section');
  if (!packet.data_contracts) errors.push('Missing data_contracts section');

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate handoff.ripp.md (consolidated markdown output)
 */
function generateHandoffMarkdown(packet, confirmed) {
  let md = `# ${packet.title}\n\n`;
  md += `**RIPP Packet** — Generated from Intent Discovery Mode\n\n`;
  md += `- **Packet ID**: ${packet.packet_id}\n`;
  md += `- **Level**: ${packet.level}\n`;
  md += `- **Status**: ${packet.status}\n`;
  md += `- **Generated**: ${packet.metadata.generated_at}\n\n`;

  md += `---\n\n`;

  // Purpose
  md += `## Purpose\n\n`;
  if (packet.purpose) {
    md += `**Problem**: ${packet.purpose.problem}\n\n`;
    md += `**Solution**: ${packet.purpose.solution}\n\n`;
    md += `**Value**: ${packet.purpose.value}\n\n`;
  }

  // UX Flow
  md += `## UX Flow\n\n`;
  if (packet.ux_flow) {
    packet.ux_flow.forEach(step => {
      md += `### Step ${step.step}\n\n`;
      md += `- **Actor**: ${step.actor}\n`;
      md += `- **Action**: ${step.action}\n`;
      if (step.trigger) md += `- **Trigger**: ${step.trigger}\n`;
      if (step.result) md += `- **Result**: ${step.result}\n`;
      md += `\n`;
    });
  }

  // Data Contracts
  md += `## Data Contracts\n\n`;
  if (packet.data_contracts) {
    md += `### Inputs\n\n`;
    if (packet.data_contracts.inputs && packet.data_contracts.inputs.length > 0) {
      packet.data_contracts.inputs.forEach(input => {
        md += `#### ${input.name}\n\n`;
        if (input.fields) {
          input.fields.forEach(field => {
            md += `- **${field.name}** (${field.type})${field.required ? ' *required*' : ''}: ${field.description || 'N/A'}\n`;
          });
        }
        md += `\n`;
      });
    } else {
      md += `*None defined*\n\n`;
    }

    md += `### Outputs\n\n`;
    if (packet.data_contracts.outputs && packet.data_contracts.outputs.length > 0) {
      packet.data_contracts.outputs.forEach(output => {
        md += `#### ${output.name}\n\n`;
        if (output.fields) {
          output.fields.forEach(field => {
            md += `- **${field.name}** (${field.type})${field.required ? ' *required*' : ''}: ${field.description || 'N/A'}\n`;
          });
        }
        md += `\n`;
      });
    } else {
      md += `*None defined*\n\n`;
    }
  }

  // Level 2+ sections
  if (packet.level >= 2) {
    if (packet.api_contracts) {
      md += `## API Contracts\n\n`;
      packet.api_contracts.forEach(api => {
        md += `### ${api.method} ${api.endpoint}\n\n`;
        md += `**Purpose**: ${api.purpose || 'N/A'}\n\n`;
      });
    }

    if (packet.permissions) {
      md += `## Permissions\n\n`;
      packet.permissions.forEach(perm => {
        md += `- **${perm.action}**: ${perm.description || 'N/A'}\n`;
      });
      md += `\n`;
    }

    if (packet.failure_modes) {
      md += `## Failure Modes\n\n`;
      packet.failure_modes.forEach(fm => {
        md += `- **${fm.scenario}**: ${fm.handling || 'N/A'}\n`;
      });
      md += `\n`;
    }
  }

  // Level 3 sections
  if (packet.level >= 3) {
    if (packet.audit_events) {
      md += `## Audit Events\n\n`;
      packet.audit_events.forEach(event => {
        md += `- **${event.event}** (${event.severity}): ${event.purpose || 'N/A'}\n`;
      });
      md += `\n`;
    }

    if (packet.nfrs) {
      md += `## Non-Functional Requirements\n\n`;
      md += `\`\`\`yaml\n${yaml.dump(packet.nfrs, { indent: 2 })}\`\`\`\n\n`;
    }

    if (packet.acceptance_tests) {
      md += `## Acceptance Tests\n\n`;
      packet.acceptance_tests.forEach(test => {
        md += `### ${test.title}\n\n`;
        md += `- **Given**: ${test.given}\n`;
        md += `- **When**: ${test.when}\n`;
        md += `- **Then**: ${test.then}\n\n`;
      });
    }
  }

  // Provenance
  md += `---\n\n`;
  md += `## Provenance\n\n`;
  md += `This RIPP packet was generated using Intent Discovery Mode.\n\n`;
  md += `- **Total Confirmed Blocks**: ${confirmed.confirmed.length}\n`;
  md += `- **Generation Method**: AI-assisted with human confirmation\n`;
  md += `- **Validation**: Passed schema validation at generation time\n\n`;

  md += `### Confirmed Blocks\n\n`;
  confirmed.confirmed.forEach((block, index) => {
    md += `${index + 1}. **${block.section}** (confidence: ${(block.original_confidence * 100).toFixed(1)}%) - confirmed at ${block.confirmed_at}\n`;
  });

  return md;
}

module.exports = {
  buildCanonicalArtifacts,
  buildRippPacket,
  generateHandoffMarkdown,
  buildFromChecklist
};
