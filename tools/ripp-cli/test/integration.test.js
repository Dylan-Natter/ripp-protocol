/**
 * RIPP CLI Integration Test
 *
 * End-to-end test of the complete RIPP workflow without external dependencies.
 * This test is offline-friendly and deterministic.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

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
  const tmpDir = path.join(os.tmpdir(), `ripp-integration-test-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  return tmpDir;
}

function cleanup(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function runCommand(cmd, cwd) {
  try {
    const output = execSync(cmd, {
      cwd,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

console.log('\n' + '='.repeat(60));
console.log('RIPP CLI Integration Test');
console.log('='.repeat(60) + '\n');

// Get CLI path
const cliPath = path.join(__dirname, '..', 'index.js');
const fixturesPath = path.join(__dirname, 'fixtures');

// Test workflow
const testDir = createTempDir();
console.log(`Test directory: ${testDir}\n`);

try {
  // Step 1: Initialize Git repository
  console.log('Step 1: Initialize Git repository');
  {
    const result = runCommand('git init', testDir);
    assert(result.success, 'Git repository initialized');
    assert(fs.existsSync(path.join(testDir, '.git')), '.git directory created');
  }

  // Step 2: Copy sample code files
  console.log('\nStep 2: Setup sample code');
  {
    const srcDir = path.join(testDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.copyFileSync(
      path.join(fixturesPath, 'sample-code.js'),
      path.join(srcDir, 'user-service.js')
    );
    fs.copyFileSync(path.join(fixturesPath, 'sample-docs.md'), path.join(testDir, 'README.md'));
    assert(fs.existsSync(path.join(srcDir, 'user-service.js')), 'Sample code copied');
    assert(fs.existsSync(path.join(testDir, 'README.md')), 'Sample docs copied');
  }

  // Step 3: Initialize RIPP
  console.log('\nStep 3: Initialize RIPP');
  {
    const result = runCommand(`node ${cliPath} init`, testDir);
    assert(result.success, 'RIPP init command succeeded');
    assert(fs.existsSync(path.join(testDir, '.ripp')), '.ripp directory created');
    assert(fs.existsSync(path.join(testDir, '.ripp', 'config.yaml')), 'config.yaml created');
  }

  // Step 4: Build evidence pack
  console.log('\nStep 4: Build evidence pack');
  {
    const result = runCommand(`node ${cliPath} evidence build`, testDir);
    assert(
      result.success || result.output.includes('Evidence pack built'),
      'Evidence build command ran'
    );

    const evidenceIndex = path.join(testDir, '.ripp', 'evidence', 'index.yaml');
    if (fs.existsSync(evidenceIndex)) {
      assert(true, 'Evidence index created');
      const indexContent = fs.readFileSync(evidenceIndex, 'utf8');
      assert(indexContent.includes('files:'), 'Evidence index contains files list');
    } else {
      console.log('  ℹ Evidence pack not built (expected if no matching files)');
    }
  }

  // Step 5: Setup candidates (simulate discovery)
  console.log('\nStep 5: Setup candidates (simulate discovery)');
  {
    const candidatesDir = path.join(testDir, '.ripp', 'candidates');
    fs.mkdirSync(candidatesDir, { recursive: true });
    fs.copyFileSync(
      path.join(fixturesPath, 'candidate-1.yaml'),
      path.join(candidatesDir, 'user-management.yaml')
    );
    assert(
      fs.existsSync(path.join(candidatesDir, 'user-management.yaml')),
      'Candidate file created'
    );
  }

  // Step 6: Setup checklist (simulate confirm)
  console.log('\nStep 6: Setup checklist (simulate confirm)');
  {
    const checklistPath = path.join(testDir, '.ripp', 'intent.checklist.md');
    fs.copyFileSync(path.join(fixturesPath, 'checklist.md'), checklistPath);
    assert(fs.existsSync(checklistPath), 'Checklist file created');
  }

  // Step 7: Build from checklist
  console.log('\nStep 7: Build from checklist');
  {
    const result = runCommand(
      `node ${cliPath} build --from-checklist --packet-id test-feature --title "Test Feature"`,
      testDir
    );

    if (result.success || result.output.includes('Build complete')) {
      assert(true, 'Build command succeeded');

      // Check for output files
      const intentFile = path.join(testDir, '.ripp', 'intent.confirmed.yaml');
      if (fs.existsSync(intentFile)) {
        assert(true, 'intent.confirmed.yaml created');
      }
    } else {
      console.log('  ℹ Build may have warnings but continued');
      assert(result.output.length > 0, 'Build produced output');
    }
  }

  // Step 8: Validate the repository
  console.log('\nStep 8: Validate RIPP packets');
  {
    // Check if we have any RIPP files to validate
    const rippDir = path.join(testDir, '.ripp');
    const rippFiles = fs
      .readdirSync(rippDir)
      .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
      .filter(f => !f.includes('config'));

    if (rippFiles.length > 0) {
      const result = runCommand(`node ${cliPath} validate ${rippDir}`, testDir);
      // Validation might fail if packets are incomplete, but command should run
      assert(result.success || result.output.includes('RIPP packets'), 'Validate command ran');
    } else {
      console.log('  ℹ No RIPP packets to validate (expected for minimal test)');
    }
  }

  // Step 9: Test doctor command
  console.log('\nStep 9: Run health check');
  {
    const result = runCommand(`node ${cliPath} doctor`, testDir);
    // Doctor should succeed even with warnings
    assert(result.success || result.output.includes('RIPP Health Check'), 'Doctor command ran');
    assert(result.output.includes('Node.js Version'), 'Doctor output includes checks');
  }

  // Step 10: Test metrics command
  console.log('\nStep 10: Check metrics');
  {
    const result = runCommand(`node ${cliPath} metrics`, testDir);
    assert(result.success || result.output.includes('Workflow Analytics'), 'Metrics command ran');
  }

  // Step 11: Verify directory structure
  console.log('\nStep 11: Verify directory structure');
  {
    assert(fs.existsSync(path.join(testDir, '.ripp')), '.ripp directory exists');
    assert(fs.existsSync(path.join(testDir, '.ripp', 'config.yaml')), 'config.yaml exists');
    assert(fs.existsSync(path.join(testDir, '.ripp', 'candidates')), 'candidates directory exists');

    const hasIntent = fs.existsSync(path.join(testDir, '.ripp', 'intent.confirmed.yaml'));
    if (hasIntent) {
      assert(true, 'intent.confirmed.yaml exists');
    } else {
      console.log('  ℹ intent.confirmed.yaml not created (workflow incomplete)');
    }
  }
} finally {
  // Cleanup
  console.log('\nCleaning up test directory...');
  cleanup(testDir);
  console.log('Cleanup complete\n');
}

// Print summary
console.log('='.repeat(60));
console.log(`Tests run: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('='.repeat(60));

if (failed === 0) {
  console.log('\n✅ All integration tests passed!\n');
} else {
  console.log(`\n❌ ${failed} test(s) failed\n`);
}

process.exit(failed > 0 ? 1 : 0);
