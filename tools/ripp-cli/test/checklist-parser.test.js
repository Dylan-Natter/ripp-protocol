const assert = require('assert');
const {
  parseChecklist,
  buildConfirmedIntent,
  validateConfirmedBlocks
} = require('../lib/checklist-parser');

/**
 * Simple test runner for checklist parser
 * Runs without requiring mocha or other test frameworks
 */

// Test helpers
function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${error.message}`);
    return false;
  }
}

function runSuite(suiteName, tests) {
  console.log(`\n${suiteName}:`);
  let passed = 0;
  let failed = 0;

  for (const [name, fn] of Object.entries(tests)) {
    if (runTest(name, fn)) {
      passed++;
    } else {
      failed++;
    }
  }

  return { passed, failed };
}

// Test Suites
const parseChecklistTests = {
  'should parse a valid checklist with checked items': () => {
    const checklist = `# RIPP Intent Confirmation Checklist

Generated: 2025-12-22T10:00:00.000Z

Total Candidates: 2

## Instructions

1. Review each candidate below
2. Check the box [ ] if you accept the candidate (change to [x])
3. Edit the content as needed
4. Save this file and run \`ripp build --from-checklist\` to compile confirmed intent

---

## Candidate 1: purpose

- **Confidence**: 85.0%
- **Evidence**: 3 reference(s)

### Accept?

- [x] Accept this candidate

### Content

\`\`\`yaml
problem: Users need to upload files
solution: Implement file upload API
value: Faster file sharing
\`\`\`

### Evidence References

- \`src/upload.js:10\`

---

## Candidate 2: ux_flow

- **Confidence**: 75.0%
- **Evidence**: 2 reference(s)

### Accept?

- [ ] Accept this candidate

### Content

\`\`\`yaml
- step: 1
  actor: User
  action: Click upload button
\`\`\`

### Evidence References

- \`src/ui.js:20\`

---

`;

    const result = parseChecklist(checklist);

    assert.strictEqual(result.errors.length, 0, 'Should have no errors');
    assert.strictEqual(result.candidates.length, 1, 'Should have 1 checked candidate');
    assert.strictEqual(result.candidates[0].section, 'purpose');
    assert.strictEqual(result.candidates[0].candidateNum, '1');
    assert.strictEqual(result.candidates[0].content.problem, 'Users need to upload files');
  },

  'should handle empty checklist': () => {
    const result = parseChecklist('');
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(result.errors[0], 'Checklist file is empty');
  },

  'should handle checklist with no candidate sections': () => {
    const checklist = `# Some Title\n\nNo candidates here\n`;
    const result = parseChecklist(checklist);
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(result.errors[0], 'No candidate sections found in checklist');
  },

  'should handle no checked items': () => {
    const checklist = `# RIPP Intent Confirmation Checklist

## Candidate 1: purpose

- **Confidence**: 85.0%

### Accept?

- [ ] Accept this candidate

### Content

\`\`\`yaml
problem: test
\`\`\`

---

`;
    const result = parseChecklist(checklist);
    assert.strictEqual(result.candidates.length, 0, 'Should have no checked candidates');
  },

  'should handle malformed YAML': () => {
    const checklist = `# RIPP Intent Confirmation Checklist

## Candidate 1: purpose

- **Confidence**: 85.0%

### Accept?

- [x] Accept this candidate

### Content

\`\`\`yaml
problem: test
  invalid: : syntax
\`\`\`

---

`;
    const result = parseChecklist(checklist);
    assert.strictEqual(result.errors.length, 1);
    assert(result.errors[0].includes('Invalid YAML'), 'Should report YAML parse error');
  },

  'should handle missing YAML block': () => {
    const checklist = `# RIPP Intent Confirmation Checklist

## Candidate 1: purpose

- **Confidence**: 85.0%

### Accept?

- [x] Accept this candidate

### Content

No YAML block here

---

`;
    const result = parseChecklist(checklist);
    assert.strictEqual(result.errors.length, 1);
    assert(result.errors[0].includes('No YAML content block found'), 'Should report missing YAML');
  },

  'should handle Windows line endings': () => {
    const checklist = `# RIPP Intent Confirmation Checklist\r\n\r\n## Candidate 1: purpose\r\n\r\n- **Confidence**: 85.0%\r\n\r\n### Accept?\r\n\r\n- [x] Accept this candidate\r\n\r\n### Content\r\n\r\n\`\`\`yaml\r\nproblem: test\r\n\`\`\`\r\n\r\n---\r\n`;

    const result = parseChecklist(checklist);
    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.candidates.length, 1);
  },

  'should warn about duplicate sections': () => {
    const checklist = `# RIPP Intent Confirmation Checklist

## Candidate 1: purpose

### Accept?

- [x] Accept this candidate

### Content

\`\`\`yaml
problem: first
\`\`\`

---

## Candidate 2: purpose

### Accept?

- [x] Accept this candidate

### Content

\`\`\`yaml
problem: second
\`\`\`

---

`;
    const result = parseChecklist(checklist);
    assert.strictEqual(result.warnings.length, 1);
    assert(result.warnings[0].includes('Duplicate section'), 'Should warn about duplicate');
    assert.strictEqual(result.candidates.length, 1, 'Should only use first');
  }
};

const buildConfirmedIntentTests = {
  'should build confirmed intent structure': () => {
    const candidates = [
      {
        section: 'purpose',
        confidence: 0.85,
        content: { problem: 'test' }
      }
    ];

    const result = buildConfirmedIntent(candidates, {
      user: 'testuser',
      timestamp: '2025-12-22T10:00:00.000Z'
    });

    assert.strictEqual(result.version, '1.0');
    assert.strictEqual(result.confirmed.length, 1);
    assert.strictEqual(result.confirmed[0].section, 'purpose');
    assert.strictEqual(result.confirmed[0].confirmed_by, 'testuser');
    assert.strictEqual(result.confirmed[0].source, 'confirmed');
  }
};

const validateConfirmedBlocksTests = {
  'should accept valid blocks': () => {
    const confirmed = [
      {
        section: 'purpose',
        original_confidence: 0.85,
        content: { problem: 'Valid problem', solution: 'Valid solution' }
      }
    ];

    const result = validateConfirmedBlocks(confirmed);
    assert.strictEqual(result.accepted.length, 1);
    assert.strictEqual(result.rejected.length, 0);
  },

  'should reject blocks with unknown section types': () => {
    const confirmed = [
      {
        section: 'invalid_section',
        content: { test: 'data' }
      }
    ];

    const result = validateConfirmedBlocks(confirmed);
    assert.strictEqual(result.accepted.length, 0);
    assert.strictEqual(result.rejected.length, 1);
    assert(
      result.reasons.invalid_section[0].includes('Unknown section'),
      'Should report unknown section'
    );
  },

  'should reject blocks with placeholder values': () => {
    const confirmed = [
      {
        section: 'purpose',
        content: { problem: 'TODO: define this' }
      }
    ];

    const result = validateConfirmedBlocks(confirmed);
    assert.strictEqual(result.rejected.length, 1);
    assert(result.reasons.purpose[0].includes('placeholder'), 'Should detect placeholder');
  },

  'should reject blocks with empty content': () => {
    const confirmed = [
      {
        section: 'purpose',
        content: {}
      }
    ];

    const result = validateConfirmedBlocks(confirmed);
    assert.strictEqual(result.rejected.length, 1);
    assert(result.reasons.purpose[0].includes('empty'), 'Should detect empty content');
  },

  'should reject blocks with low confidence': () => {
    const confirmed = [
      {
        section: 'purpose',
        original_confidence: 0.3,
        content: { problem: 'test' }
      }
    ];

    const result = validateConfirmedBlocks(confirmed);
    assert.strictEqual(result.rejected.length, 1);
    assert(result.reasons.purpose[0].includes('Low confidence'), 'Should detect low confidence');
  }
};

// Main runner
if (require.main === module) {
  console.log('Running checklist parser tests...');

  let totalPassed = 0;
  let totalFailed = 0;

  const results1 = runSuite('parseChecklist', parseChecklistTests);
  totalPassed += results1.passed;
  totalFailed += results1.failed;

  const results2 = runSuite('buildConfirmedIntent', buildConfirmedIntentTests);
  totalPassed += results2.passed;
  totalFailed += results2.failed;

  const results3 = runSuite('validateConfirmedBlocks', validateConfirmedBlocksTests);
  totalPassed += results3.passed;
  totalFailed += results3.failed;

  console.log(`\n${totalPassed} passed, ${totalFailed} failed`);
  process.exit(totalFailed > 0 ? 1 : 0);
}

module.exports = {
  parseChecklistTests,
  buildConfirmedIntentTests,
  validateConfirmedBlocksTests
};
