const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const readline = require('readline');

/**
 * RIPP Intent Confirmation
 * Human confirmation workflow for candidate intent
 */

/**
 * Confirm candidates interactively
 */
async function confirmIntent(cwd, options = {}) {
  const candidatesPath = path.join(cwd, '.ripp', 'intent.candidates.yaml');

  if (!fs.existsSync(candidatesPath)) {
    throw new Error('No candidate intent found. Run "ripp discover" first.');
  }

  const candidatesContent = fs.readFileSync(candidatesPath, 'utf8');
  const candidates = yaml.load(candidatesContent);

  if (!candidates.candidates || candidates.candidates.length === 0) {
    throw new Error('No candidates found in intent.candidates.yaml');
  }

  // Auto-approve mode
  if (options.autoApprove) {
    return await autoApproveConfirm(cwd, candidates, options);
  }

  // Interactive mode
  if (options.interactive !== false) {
    return await interactiveConfirm(cwd, candidates, options);
  } else {
    // Generate markdown checklist mode
    return await generateChecklistConfirm(cwd, candidates);
  }
}

/**
 * Auto-approve candidates above confidence threshold
 */
async function autoApproveConfirm(cwd, candidates, options = {}) {
  const threshold = options.approvalThreshold || 0.75;
  const confirmed = [];
  const rejected = [];

  console.log(`Auto-approving candidates with confidence ≥ ${(threshold * 100).toFixed(0)}%...\n`);

  candidates.candidates.forEach((candidate, index) => {
    const sectionName = candidate.purpose?.problem ? 'purpose' : 'full-packet';
    
    if (candidate.confidence >= threshold) {
      // Build content object from candidate fields
      const content = {};
      const contentFields = [
        'purpose',
        'ux_flow',
        'data_contracts',
        'api_contracts',
        'permissions',
        'failure_modes',
        'audit_events',
        'nfrs',
        'acceptance_tests',
        'design_philosophy',
        'design_decisions',
        'constraints',
        'success_criteria'
      ];
      contentFields.forEach(field => {
        if (candidate[field]) {
          content[field] = candidate[field];
        }
      });

      confirmed.push({
        section: sectionName,
        source: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmed_by: options.user || 'auto-approve',
        original_confidence: candidate.confidence,
        evidence: candidate.evidence,
        content: content
      });

      console.log(`  ✓ Candidate ${index + 1}: ${sectionName} (${(candidate.confidence * 100).toFixed(1)}%)`);
    } else {
      rejected.push({
        section: sectionName,
        original_content: candidate,
        original_confidence: candidate.confidence,
        rejected_at: new Date().toISOString(),
        rejected_by: options.user || 'auto-approve',
        reason: `Below confidence threshold (${(candidate.confidence * 100).toFixed(1)}% < ${(threshold * 100).toFixed(0)}%)`
      });
      console.log(`  ✗ Candidate ${index + 1}: ${sectionName} (${(candidate.confidence * 100).toFixed(1)}% - below threshold)`);
    }
  });

  console.log('');

  if (confirmed.length === 0) {
    throw new Error(`No candidates met the confidence threshold of ${(threshold * 100).toFixed(0)}%. Lower the threshold or run without --auto-approve to manually review.`);
  }

  // Save confirmed intent
  const confirmedData = {
    version: '1.0',
    confirmed
  };

  const confirmedPath = path.join(cwd, '.ripp', 'intent.confirmed.yaml');
  fs.writeFileSync(confirmedPath, yaml.dump(confirmedData, { indent: 2 }), 'utf8');

  // Save rejected intent (optional)
  if (rejected.length > 0) {
    const rejectedData = {
      version: '1.0',
      rejected
    };

    const rejectedPath = path.join(cwd, '.ripp', 'intent.rejected.yaml');
    fs.writeFileSync(rejectedPath, yaml.dump(rejectedData, { indent: 2 }), 'utf8');
  }

  return {
    confirmedPath,
    confirmedCount: confirmed.length,
    rejectedCount: rejected.length
  };
}

/**
 * Interactive confirmation via terminal
 */
async function interactiveConfirm(cwd, candidates) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const confirmed = [];
  const rejected = [];

  console.log('\n=== RIPP Intent Confirmation ===');
  console.log(`Found ${candidates.candidates.length} candidate(s)\n`);

  for (let i = 0; i < candidates.candidates.length; i++) {
    const candidate = candidates.candidates[i];

    console.log(`\n--- Candidate ${i + 1}/${candidates.candidates.length} ---`);
    const sectionName = candidate.purpose?.problem ? 'purpose' : 'full-packet';
    console.log(`Section: ${sectionName}`);
    console.log(`Confidence: ${(candidate.confidence * 100).toFixed(1)}%`);
    console.log(`Evidence: ${candidate.evidence.length} reference(s)`);
    console.log('\nContent:');
    // Build content object from candidate fields
    const content = {};
    const contentFields = [
      'purpose',
      'ux_flow',
      'data_contracts',
      'api_contracts',
      'permissions',
      'failure_modes',
      'audit_events',
      'nfrs',
      'acceptance_tests',
      'design_philosophy',
      'design_decisions',
      'constraints',
      'success_criteria'
    ];
    contentFields.forEach(field => {
      if (candidate[field]) {
        content[field] = candidate[field];
      }
    });
    console.log(yaml.dump(content, { indent: 2 }));

    const answer = await question(rl, '\nAccept this candidate? (y/n/e to edit/s to skip): ');

    if (answer.toLowerCase() === 'y') {
      // Build content object from candidate fields
      const content = {};
      const contentFields = [
        'purpose',
        'ux_flow',
        'data_contracts',
        'api_contracts',
        'permissions',
        'failure_modes',
        'audit_events',
        'nfrs',
        'acceptance_tests',
        'design_philosophy',
        'design_decisions',
        'constraints',
        'success_criteria'
      ];
      contentFields.forEach(field => {
        if (candidate[field]) {
          content[field] = candidate[field];
        }
      });

      confirmed.push({
        section: candidate.purpose?.problem ? 'purpose' : 'full-packet',
        source: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmed_by: options.user || 'unknown',
        original_confidence: candidate.confidence,
        evidence: candidate.evidence,
        content: content
      });
      console.log('✓ Accepted');
    } else if (answer.toLowerCase() === 'e') {
      console.log('Manual editing not yet supported. Skipping...');
      // TODO: Open editor for manual changes
    } else if (answer.toLowerCase() === 's') {
      console.log('⊘ Skipped');
    } else {
      rejected.push({
        section: candidate.section,
        original_content: candidate.content,
        original_confidence: candidate.confidence,
        rejected_at: new Date().toISOString(),
        rejected_by: options.user || 'unknown'
      });
      console.log('✗ Rejected');
    }
  }

  rl.close();

  // Save confirmed intent
  const confirmedData = {
    version: '1.0',
    confirmed
  };

  const confirmedPath = path.join(cwd, '.ripp', 'intent.confirmed.yaml');
  fs.writeFileSync(confirmedPath, yaml.dump(confirmedData, { indent: 2 }), 'utf8');

  // Save rejected intent (optional)
  if (rejected.length > 0) {
    const rejectedData = {
      version: '1.0',
      rejected
    };

    const rejectedPath = path.join(cwd, '.ripp', 'intent.rejected.yaml');
    fs.writeFileSync(rejectedPath, yaml.dump(rejectedData, { indent: 2 }), 'utf8');
  }

  return {
    confirmedPath,
    confirmedCount: confirmed.length,
    rejectedCount: rejected.length
  };
}

/**
 * Generate markdown checklist for manual confirmation
 */
async function generateChecklistConfirm(cwd, candidates) {
  const checklistPath = path.join(cwd, '.ripp', 'intent.checklist.md');

  let markdown = '# RIPP Intent Confirmation Checklist\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += `Total Candidates: ${candidates.candidates.length}\n\n`;
  markdown += '## Instructions\n\n';
  markdown += '1. Review each candidate below\n';
  markdown += '2. Check the box [ ] if you accept the candidate (change to [x])\n';
  markdown += '3. Edit the content as needed\n';
  markdown +=
    '4. Save this file and run `ripp build --from-checklist` to compile confirmed intent\n\n';
  markdown += '---\n\n';

  candidates.candidates.forEach((candidate, index) => {
    // Extract section name from purpose or use generic identifier
    const sectionName = candidate.purpose?.problem ? 'purpose' : 'full-packet';

    markdown += `## Candidate ${index + 1}: ${sectionName}\n\n`;
    markdown += `- **Confidence**: ${(candidate.confidence * 100).toFixed(1)}%\n`;
    markdown += `- **Evidence**: ${candidate.evidence.length} reference(s)\n\n`;

    markdown += '### Accept?\n\n';
    markdown += '- [ ] Accept this candidate\n\n';

    markdown += '### Content\n\n';
    markdown += '```yaml\n';
    // Build content object from candidate fields (purpose, ux_flow, data_contracts, etc.)
    const content = {};
    const contentFields = [
      'purpose',
      'ux_flow',
      'data_contracts',
      'api_contracts',
      'permissions',
      'failure_modes',
      'audit_events',
      'nfrs',
      'acceptance_tests',
      'design_philosophy',
      'design_decisions',
      'constraints',
      'success_criteria'
    ];
    contentFields.forEach(field => {
      if (candidate[field]) {
        content[field] = candidate[field];
      }
    });
    markdown += yaml.dump(content, { indent: 2 });
    markdown += '```\n\n';

    markdown += '### Evidence References\n\n';
    candidate.evidence.forEach(ev => {
      markdown += `- \`${ev.file}:${ev.line}\`\n`;
      if (ev.snippet) {
        markdown += `  \`\`\`\n  ${ev.snippet}\n  \`\`\`\n`;
      }
    });

    markdown += '\n---\n\n';
  });

  fs.writeFileSync(checklistPath, markdown, 'utf8');

  return {
    checklistPath,
    totalCandidates: candidates.candidates.length
  };
}

/**
 * Helper to ask questions in readline
 */
function question(rl, prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

module.exports = {
  confirmIntent,
  autoApproveConfirm,
  interactiveConfirm,
  generateChecklistConfirm
};
