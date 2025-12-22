const fs = require('fs');
const path = require('path');
const { gatherMetrics, formatMetricsText } = require('../lib/metrics');

// Simple test framework
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  testsRun++;
  if (condition) {
    testsPassed++;
    console.log(`✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`✗ ${message}`);
  }
}

function runTests() {
  console.log('Running metrics tests...\n');

  // Test 1: gatherMetrics with non-existent directory
  console.log('Test 1: Non-existent RIPP directory');
  const metrics1 = gatherMetrics('/tmp/nonexistent/.ripp');
  assert(metrics1.evidence.status === 'not_built', 'Evidence status should be not_built');
  assert(metrics1.discovery.status === 'not_run', 'Discovery status should be not_run');
  assert(metrics1.validation.status === 'not_validated', 'Validation status should be not_validated');
  assert(metrics1.workflow.completion_percent === 0, 'Workflow completion should be 0%');
  console.log('');

  // Test 2: formatMetricsText produces output
  console.log('Test 2: Format metrics as text');
  const text = formatMetricsText(metrics1);
  assert(typeof text === 'string', 'Should return a string');
  assert(text.length > 0, 'Should not be empty');
  assert(text.includes('RIPP Workflow Metrics'), 'Should contain header');
  assert(text.includes('Evidence Pack:'), 'Should contain Evidence Pack section');
  assert(text.includes('Intent Discovery:'), 'Should contain Intent Discovery section');
  assert(text.includes('Validation:'), 'Should contain Validation section');
  assert(text.includes('Workflow Progress:'), 'Should contain Workflow Progress section');
  console.log('');

  // Test 3: Metrics with initialized config
  console.log('Test 3: Metrics with config.yaml present');
  const tmpDir = fs.mkdtempSync('/tmp/ripp-test-');
  const rippDir = path.join(tmpDir, '.ripp');
  fs.mkdirSync(rippDir, { recursive: true });
  fs.writeFileSync(path.join(rippDir, 'config.yaml'), 'ai:\n  enabled: true\n');
  
  const metrics2 = gatherMetrics(rippDir);
  assert(metrics2.workflow.steps.initialized === true, 'Should detect initialized config');
  assert(metrics2.workflow.completion_percent === 20, 'Should be 20% complete (1/5 steps)');
  
  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log('');

  // Test 4: Metrics structure
  console.log('Test 4: Metrics structure validation');
  const metrics3 = gatherMetrics('/tmp/nonexistent/.ripp');
  assert(typeof metrics3.timestamp === 'string', 'Should have timestamp');
  assert(typeof metrics3.evidence === 'object', 'Should have evidence object');
  assert(typeof metrics3.discovery === 'object', 'Should have discovery object');
  assert(typeof metrics3.validation === 'object', 'Should have validation object');
  assert(typeof metrics3.workflow === 'object', 'Should have workflow object');
  assert(typeof metrics3.workflow.completion_percent === 'number', 'Completion percent should be number');
  console.log('');

  // Summary
  console.log('='.repeat(60));
  console.log(`Tests run: ${testsRun}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  console.log('='.repeat(60));

  process.exit(testsFailed > 0 ? 1 : 0);
}

runTests();
