/**
 * RIPP Linter
 *
 * Best-practice checker that runs AFTER schema validation.
 * Performs deterministic checks NOT covered by the JSON Schema.
 *
 * Guardrails:
 * - Does NOT reimplement schema validation
 * - Does NOT modify source packets
 * - Checks conventions and best practices only
 */

/**
 * Lint a RIPP packet for best practices
 * @param {Object} packet - Validated RIPP packet
 * @param {string} filePath - Path to the packet file
 * @returns {Object} Lint result with errors and warnings
 */
function lintPacket(packet, filePath) {
  const errors = [];
  const warnings = [];

  // Rule 1: Check for missing critical optional sections
  checkCriticalSections(packet, warnings);

  // Rule 2: Check for missing non_goals (best practice)
  checkNonGoals(packet, warnings);

  // Rule 3: Check for undefined ID references
  checkIdReferences(packet, errors);

  // Rule 4: Check for placeholder text
  checkPlaceholders(packet, warnings);

  // Rule 5: Check for missing verification.done_when in acceptance tests (Level 3)
  checkVerification(packet, warnings);

  return {
    errors,
    warnings,
    errorCount: errors.length,
    warningCount: warnings.length
  };
}

/**
 * Check for missing critical optional sections
 */
function checkCriticalSections(packet, warnings) {
  const level = packet.level || 1;

  // purpose.out_of_scope is recommended
  if (!packet.purpose?.out_of_scope) {
    warnings.push({
      rule: 'missing-out-of-scope',
      severity: 'warn',
      message:
        "Missing 'purpose.out_of_scope' - explicitly defining what is NOT included improves clarity",
      location: 'purpose.out_of_scope'
    });
  }

  // purpose.assumptions is recommended
  if (!packet.purpose?.assumptions || packet.purpose.assumptions.length === 0) {
    warnings.push({
      rule: 'missing-assumptions',
      severity: 'warn',
      message: "Missing 'purpose.assumptions' - documenting assumptions prevents surprises",
      location: 'purpose.assumptions'
    });
  }

  // For Level 2+, check security-related NFRs
  if (level >= 2 && packet.nfrs && !packet.nfrs.security) {
    warnings.push({
      rule: 'missing-security-nfrs',
      severity: 'warn',
      message: "Missing 'nfrs.security' - security requirements should be explicit for Level 2+",
      location: 'nfrs.security'
    });
  }
}

/**
 * Check for missing non_goals (deprecated - now called out_of_scope)
 */
function checkNonGoals(packet, warnings) {
  // This is handled by out_of_scope check above
  // Kept as separate function for future expansion
}

/**
 * Check for undefined ID references in cross-references
 */
function checkIdReferences(packet, errors) {
  // Collect all defined IDs
  const definedIds = new Set();

  // Add test IDs from acceptance_tests
  if (packet.acceptance_tests) {
    packet.acceptance_tests.forEach(test => {
      if (test.test_id) {
        definedIds.add(test.test_id);
      }
    });
  }

  // Add entity names from data_contracts
  if (packet.data_contracts) {
    if (packet.data_contracts.inputs) {
      packet.data_contracts.inputs.forEach(entity => {
        if (entity.name) {
          definedIds.add(entity.name);
        }
      });
    }
    if (packet.data_contracts.outputs) {
      packet.data_contracts.outputs.forEach(entity => {
        if (entity.name) {
          definedIds.add(entity.name);
        }
      });
    }
  }

  // Check for schema_ref references in api_contracts
  if (packet.api_contracts) {
    packet.api_contracts.forEach((api, idx) => {
      // Check request schema_ref
      if (api.request?.schema_ref && !definedIds.has(api.request.schema_ref)) {
        errors.push({
          rule: 'undefined-schema-ref',
          severity: 'error',
          message: `Undefined schema reference '${api.request.schema_ref}' in api_contracts[${idx}].request.schema_ref`,
          location: `api_contracts[${idx}].request.schema_ref`,
          reference: api.request.schema_ref
        });
      }

      // Check response schema_ref
      if (api.response?.success?.schema_ref && !definedIds.has(api.response.success.schema_ref)) {
        errors.push({
          rule: 'undefined-schema-ref',
          severity: 'error',
          message: `Undefined schema reference '${api.response.success.schema_ref}' in api_contracts[${idx}].response.success.schema_ref`,
          location: `api_contracts[${idx}].response.success.schema_ref`,
          reference: api.response.success.schema_ref
        });
      }
    });
  }
}

/**
 * Check for placeholder text that should be replaced
 */
function checkPlaceholders(packet, warnings) {
  const placeholderPatterns = [
    /\bTODO\b/i,
    /\bTBD\b/i,
    /\bFIXME\b/i,
    /lorem ipsum/i,
    /\bplaceholder\b/i,
    /\bexample\.com\b/i
  ];

  function checkValue(value, path) {
    if (typeof value === 'string') {
      placeholderPatterns.forEach(pattern => {
        if (pattern.test(value)) {
          warnings.push({
            rule: 'placeholder-text',
            severity: 'warn',
            message: `Possible placeholder text found: "${value.substring(0, 50)}..."`,
            location: path,
            pattern: pattern.toString()
          });
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item, idx) => checkValue(item, `${path}[${idx}]`));
      } else {
        Object.keys(value).forEach(key => checkValue(value[key], `${path}.${key}`));
      }
    }
  }

  // Scan entire packet for placeholders
  checkValue(packet, 'root');
}

/**
 * Check for missing or incomplete verification in acceptance tests
 */
function checkVerification(packet, warnings) {
  if (packet.level === 3 && packet.acceptance_tests) {
    packet.acceptance_tests.forEach((test, idx) => {
      // Check if verification array is empty
      if (!test.verification || test.verification.length === 0) {
        warnings.push({
          rule: 'missing-verification',
          severity: 'warn',
          message: `Acceptance test '${test.test_id || idx}' has no verification steps`,
          location: `acceptance_tests[${idx}].verification`
        });
      } else {
        // Check for vague verification steps
        test.verification.forEach((step, stepIdx) => {
          if (step.length < 10 || (/\b(check|verify|ensure)\b/i.test(step) && step.length < 20)) {
            warnings.push({
              rule: 'vague-verification',
              severity: 'warn',
              message: `Verification step may be too vague: "${step}"`,
              location: `acceptance_tests[${idx}].verification[${stepIdx}]`
            });
          }
        });
      }
    });
  }
}

/**
 * Generate a lint report in JSON format
 */
function generateJsonReport(results) {
  return JSON.stringify(
    {
      summary: {
        totalFiles: results.length,
        filesWithErrors: results.filter(r => r.errorCount > 0).length,
        filesWithWarnings: results.filter(r => r.warningCount > 0).length,
        totalErrors: results.reduce((sum, r) => sum + r.errorCount, 0),
        totalWarnings: results.reduce((sum, r) => sum + r.warningCount, 0)
      },
      results: results.map(r => ({
        file: r.file,
        errorCount: r.errorCount,
        warningCount: r.warningCount,
        errors: r.errors,
        warnings: r.warnings
      }))
    },
    null,
    2
  );
}

/**
 * Generate a lint report in Markdown format
 */
function generateMarkdownReport(results) {
  let md = '# RIPP Lint Report\n\n';

  const totalFiles = results.length;
  const filesWithErrors = results.filter(r => r.errorCount > 0).length;
  const filesWithWarnings = results.filter(r => r.warningCount > 0).length;
  const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);

  md += '## Summary\n\n';
  md += `- **Total Files**: ${totalFiles}\n`;
  md += `- **Files with Errors**: ${filesWithErrors}\n`;
  md += `- **Files with Warnings**: ${filesWithWarnings}\n`;
  md += `- **Total Errors**: ${totalErrors}\n`;
  md += `- **Total Warnings**: ${totalWarnings}\n\n`;

  md += '---\n\n';

  md += '## Files\n\n';

  results.forEach(result => {
    md += `### ${result.file}\n\n`;

    if (result.errorCount === 0 && result.warningCount === 0) {
      md += '✅ No issues found\n\n';
    } else {
      if (result.errors.length > 0) {
        md += '#### Errors\n\n';
        result.errors.forEach(error => {
          md += `- **[${error.rule}]** ${error.message}\n`;
          md += `  - Location: \`${error.location}\`\n`;
          if (error.reference) {
            md += `  - Reference: \`${error.reference}\`\n`;
          }
        });
        md += '\n';
      }

      if (result.warnings.length > 0) {
        md += '#### Warnings\n\n';
        result.warnings.forEach(warning => {
          md += `- **[${warning.rule}]** ${warning.message}\n`;
          md += `  - Location: \`${warning.location}\`\n`;
        });
        md += '\n';
      }
    }
  });

  return md;
}

module.exports = {
  lintPacket,
  generateJsonReport,
  generateMarkdownReport
};
