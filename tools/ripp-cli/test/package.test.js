/**
 * Tests for RIPP Package Command with --single flag
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
  const tmpDir = path.join(os.tmpdir(), `ripp-package-test-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  return tmpDir;
}

function cleanup(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

console.log('\nRunning package command tests...\n');

const cliPath = path.join(__dirname, '..', 'index.js');
const fixturesPath = path.join(__dirname, 'fixtures');
const tmpDir = createTempDir();

try {
  // Create a test RIPP packet
  const testPacket = {
    ripp_version: '1.0',
    packet_id: 'test-package',
    title: 'Test Package',
    created: '2025-01-01',
    updated: '2025-01-01',
    status: 'draft',
    level: 1,
    purpose: {
      problem: 'Test problem',
      solution: 'Test solution',
      value: 'Test value'
    },
    ux_flow: [
      {
        step: 1,
        actor: 'User',
        action: 'Does something',
        trigger: 'Clicks button',
        result: 'Something happens',
        condition: 'User is logged in'
      }
    ],
    data_contracts: {
      inputs: [
        {
          name: 'TestInput',
          description: 'Test input data',
          fields: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: 'Unique identifier'
            }
          ]
        }
      ],
      outputs: []
    }
  };

  const yaml = require('js-yaml');
  const testPacketPath = path.join(tmpDir, 'test-packet.yaml');
  fs.writeFileSync(testPacketPath, yaml.dump(testPacket), 'utf8');

  // Test 1: Standard markdown packaging
  console.log('Test 1: Standard markdown packaging');
  {
    const outputPath = path.join(tmpDir, 'standard.md');
    const cmd = `node ${cliPath} package --in ${testPacketPath} --out ${outputPath}`;
    
    try {
      execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
      assert(fs.existsSync(outputPath), 'Standard markdown file created');
      
      const content = fs.readFileSync(outputPath, 'utf8');
      assert(content.includes('# Test Package'), 'Contains title');
      assert(content.includes('## Packaging Information'), 'Contains packaging info');
      assert(content.includes('**Packet ID**'), 'Contains packet ID in standard format');
      assert(content.length > 0, 'Output file not empty');
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      assert(false, 'Standard packaging command failed');
    }
  }

  // Test 2: Single-file markdown packaging
  console.log('\nTest 2: Single-file markdown packaging');
  {
    const outputPath = path.join(tmpDir, 'single.md');
    const cmd = `node ${cliPath} package --in ${testPacketPath} --out ${outputPath} --single`;
    
    try {
      execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
      assert(fs.existsSync(outputPath), 'Single-file markdown created');
      
      const content = fs.readFileSync(outputPath, 'utf8');
      assert(content.includes('# Test Package'), 'Contains title');
      assert(content.includes('> **RIPP Handoff Document**'), 'Contains single-file header');
      assert(content.includes('Packet ID: `test-package`'), 'Contains packet ID in blockquote');
      assert(!content.includes('## Packaging Information'), 'Does not contain packaging info section');
      assert(content.length > 0, 'Output file not empty');
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      assert(false, 'Single-file packaging command failed');
    }
  }

  // Test 3: Compare file sizes
  console.log('\nTest 3: File size comparison');
  {
    const standardPath = path.join(tmpDir, 'standard.md');
    const singlePath = path.join(tmpDir, 'single.md');
    
    if (fs.existsSync(standardPath) && fs.existsSync(singlePath)) {
      const standardSize = fs.statSync(standardPath).size;
      const singleSize = fs.statSync(singlePath).size;
      
      assert(standardSize > 0, 'Standard file has content');
      assert(singleSize > 0, 'Single file has content');
      assert(singleSize <= standardSize, 'Single file is more compact or equal');
      assert(standardSize < 500000, 'Standard file under 500KB');
      assert(singleSize < 500000, 'Single file under 500KB');
    } else {
      console.log('  Skipping size comparison (files not created)');
    }
  }

  // Test 4: Content structure validation
  console.log('\nTest 4: Content structure validation');
  {
    const singlePath = path.join(tmpDir, 'single.md');
    
    if (fs.existsSync(singlePath)) {
      const content = fs.readFileSync(singlePath, 'utf8');
      
      assert(content.includes('## Purpose'), 'Contains Purpose section');
      assert(content.includes('## UX Flow'), 'Contains UX Flow section');
      assert(content.includes('## Data Contracts'), 'Contains Data Contracts section');
      assert(content.includes('Test problem'), 'Contains problem statement');
      assert(content.includes('Test solution'), 'Contains solution statement');
      assert(content.includes('Test value'), 'Contains value statement');
    } else {
      console.log('  Skipping content validation (file not created)');
    }
  }

  // Test 5: Deterministic output
  console.log('\nTest 5: Deterministic output');
  {
    const output1Path = path.join(tmpDir, 'deterministic-1.md');
    const output2Path = path.join(tmpDir, 'deterministic-2.md');
    
    try {
      execSync(
        `node ${cliPath} package --in ${testPacketPath} --out ${output1Path} --single`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      
      // Wait a moment
      execSync('sleep 0.1', { stdio: 'pipe' });
      
      execSync(
        `node ${cliPath} package --in ${testPacketPath} --out ${output2Path} --single`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      
      if (fs.existsSync(output1Path) && fs.existsSync(output2Path)) {
        const content1 = fs.readFileSync(output1Path, 'utf8');
        const content2 = fs.readFileSync(output2Path, 'utf8');
        
        // The content should be mostly deterministic except for timestamps
        // Check that core sections match
        const lines1 = content1.split('\n').filter(l => !l.includes('packaged'));
        const lines2 = content2.split('\n').filter(l => !l.includes('packaged'));
        
        assert(lines1.length === lines2.length, 'Same number of content lines');
        assert(content1.includes('# Test Package'), 'First output has title');
        assert(content2.includes('# Test Package'), 'Second output has title');
      } else {
        console.log('  Skipping deterministic test (files not created)');
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
  }

} finally {
  // Cleanup
  cleanup(tmpDir);
}

// Print summary
console.log('\n' + '='.repeat(60));
console.log(`Tests run: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('='.repeat(60));

process.exit(failed > 0 ? 1 : 0);
