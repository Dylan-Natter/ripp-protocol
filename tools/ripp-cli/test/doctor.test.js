/**
 * Tests for RIPP Doctor (Health Checks)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { runHealthChecks, formatHealthCheckText } = require('../lib/doctor');

// Test counter
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.log(`✗ ${message}`);
    failed++;
  }
}

function createTempDir() {
  const tmpDir = path.join(os.tmpdir(), `ripp-test-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  return tmpDir;
}

function cleanup(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Test 1: Health checks in non-RIPP directory
console.log('\nTest 1: Non-RIPP directory');
{
  const tmpDir = createTempDir();

  // Create git directory
  fs.mkdirSync(path.join(tmpDir, '.git'));

  const results = runHealthChecks(tmpDir);

  assert(results.checks.nodeVersion.status === 'pass', 'Node version check should pass');
  assert(results.checks.gitRepository.status === 'pass', 'Git repository check should pass');
  assert(results.checks.rippDirectory.status === 'fail', 'RIPP directory check should fail');
  assert(results.checks.configFile.status === 'warning', 'Config check should be warning');
  assert(results.summary.total === 9, 'Should have 9 total checks');

  cleanup(tmpDir);
}

// Test 2: Health checks in initialized RIPP directory
console.log('\nTest 2: Initialized RIPP directory');
{
  const tmpDir = createTempDir();

  // Create git directory
  fs.mkdirSync(path.join(tmpDir, '.git'));

  // Create .ripp directory with config
  const rippDir = path.join(tmpDir, '.ripp');
  fs.mkdirSync(rippDir, { recursive: true });
  fs.writeFileSync(path.join(rippDir, 'config.yaml'), 'rippVersion: "1.0"\n', 'utf8');

  const results = runHealthChecks(tmpDir);

  assert(results.checks.nodeVersion.status === 'pass', 'Node version check should pass');
  assert(results.checks.gitRepository.status === 'pass', 'Git repository check should pass');
  assert(results.checks.rippDirectory.status === 'pass', 'RIPP directory check should pass');
  assert(results.checks.configFile.status === 'pass', 'Config check should pass');
  assert(results.checks.evidencePack.status === 'warning', 'Evidence pack should be warning');

  cleanup(tmpDir);
}

// Test 3: Health checks with evidence pack
console.log('\nTest 3: RIPP with evidence pack');
{
  const tmpDir = createTempDir();

  // Create git directory
  fs.mkdirSync(path.join(tmpDir, '.git'));

  // Create .ripp directory with config and evidence
  const rippDir = path.join(tmpDir, '.ripp');
  fs.mkdirSync(path.join(rippDir, 'evidence'), { recursive: true });
  fs.writeFileSync(path.join(rippDir, 'config.yaml'), 'rippVersion: "1.0"\n', 'utf8');
  fs.writeFileSync(path.join(rippDir, 'evidence', 'index.yaml'), 'files: []\n', 'utf8');

  const results = runHealthChecks(tmpDir);

  assert(results.checks.evidencePack.status === 'pass', 'Evidence pack check should pass');
  assert(results.checks.candidates.status === 'warning', 'Candidates should be warning');

  cleanup(tmpDir);
}

// Test 4: Health checks with candidates
console.log('\nTest 4: RIPP with candidates');
{
  const tmpDir = createTempDir();

  // Create git directory
  fs.mkdirSync(path.join(tmpDir, '.git'));

  // Create .ripp directory with candidates
  const rippDir = path.join(tmpDir, '.ripp');
  fs.mkdirSync(path.join(rippDir, 'candidates'), { recursive: true });
  fs.writeFileSync(path.join(rippDir, 'config.yaml'), 'rippVersion: "1.0"\n', 'utf8');
  fs.writeFileSync(
    path.join(rippDir, 'candidates', 'feature-1.yaml'),
    'title: Test\n',
    'utf8'
  );

  const results = runHealthChecks(tmpDir);

  assert(results.checks.candidates.status === 'pass', 'Candidates check should pass');
  assert(results.checks.confirmedIntent.status === 'warning', 'Confirmed intent should be warning');

  cleanup(tmpDir);
}

// Test 5: Complete RIPP setup
console.log('\nTest 5: Complete RIPP setup');
{
  const tmpDir = createTempDir();

  // Create git directory
  fs.mkdirSync(path.join(tmpDir, '.git'));

  // Create complete .ripp directory
  const rippDir = path.join(tmpDir, '.ripp');
  fs.mkdirSync(path.join(rippDir, 'evidence'), { recursive: true });
  fs.mkdirSync(path.join(rippDir, 'candidates'), { recursive: true });
  fs.writeFileSync(path.join(rippDir, 'config.yaml'), 'rippVersion: "1.0"\n', 'utf8');
  fs.writeFileSync(path.join(rippDir, 'evidence', 'index.yaml'), 'files: []\n', 'utf8');
  fs.writeFileSync(
    path.join(rippDir, 'candidates', 'feature-1.yaml'),
    'title: Test\n',
    'utf8'
  );
  fs.writeFileSync(path.join(rippDir, 'intent.confirmed.yaml'), 'purpose: {}\n', 'utf8');

  const results = runHealthChecks(tmpDir);

  assert(results.checks.rippDirectory.status === 'pass', 'RIPP directory should pass');
  assert(results.checks.configFile.status === 'pass', 'Config should pass');
  assert(results.checks.evidencePack.status === 'pass', 'Evidence pack should pass');
  assert(results.checks.candidates.status === 'pass', 'Candidates should pass');
  assert(results.checks.confirmedIntent.status === 'pass', 'Confirmed intent should pass');

  cleanup(tmpDir);
}

// Test 6: Format health check text
console.log('\nTest 6: Format health check text');
{
  const tmpDir = createTempDir();
  fs.mkdirSync(path.join(tmpDir, '.git'));

  const results = runHealthChecks(tmpDir);
  const text = formatHealthCheckText(results);

  assert(typeof text === 'string', 'Should return a string');
  assert(text.length > 0, 'Should not be empty');
  assert(text.includes('RIPP Health Check'), 'Should include header');
  assert(text.includes('Node.js Version'), 'Should include Node.js check');
  assert(text.includes('Git Repository'), 'Should include Git check');
  assert(text.includes('Next Steps'), 'Should include next steps for failures');

  cleanup(tmpDir);
}

// Test 7: Non-git directory
console.log('\nTest 7: Non-git directory');
{
  const tmpDir = createTempDir();
  // Don't create .git directory

  const results = runHealthChecks(tmpDir);

  assert(results.checks.gitRepository.status === 'fail', 'Git repository check should fail');
  assert(results.checks.gitRepository.fix !== null, 'Should provide fix suggestion');

  cleanup(tmpDir);
}

// Test 8: Summary calculation
console.log('\nTest 8: Summary calculation');
{
  const tmpDir = createTempDir();
  fs.mkdirSync(path.join(tmpDir, '.git'));

  const results = runHealthChecks(tmpDir);

  assert(typeof results.summary.total === 'number', 'Total should be a number');
  assert(typeof results.summary.passed === 'number', 'Passed should be a number');
  assert(typeof results.summary.warnings === 'number', 'Warnings should be a number');
  assert(typeof results.summary.failed === 'number', 'Failed should be a number');
  assert(typeof results.summary.healthy === 'boolean', 'Healthy should be a boolean');
  assert(
    results.summary.total === results.summary.passed + results.summary.warnings + results.summary.failed,
    'Total should equal sum of passed, warnings, and failed'
  );

  cleanup(tmpDir);
}

// Print summary
console.log('\n' + '='.repeat(60));
console.log(`Tests run: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('='.repeat(60));

process.exit(failed > 0 ? 1 : 0);
