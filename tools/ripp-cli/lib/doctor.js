/**
 * RIPP Doctor - Health Check and Diagnostics
 *
 * Checks repository health and provides actionable fix-it commands
 * for common RIPP setup issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Run all health checks
 * @param {string} cwd - Current working directory
 * @returns {Object} Health check results
 */
function runHealthChecks(cwd = process.cwd()) {
  const checks = {
    nodeVersion: checkNodeVersion(),
    gitRepository: checkGitRepository(cwd),
    rippDirectory: checkRippDirectory(cwd),
    configFile: checkConfigFile(cwd),
    evidencePack: checkEvidencePack(cwd),
    candidates: checkCandidates(cwd),
    confirmedIntent: checkConfirmedIntent(cwd),
    schema: checkSchema(),
    cliVersion: checkCliVersion()
  };

  // Calculate overall health
  const total = Object.keys(checks).length;
  const passed = Object.values(checks).filter(c => c.status === 'pass').length;
  const warnings = Object.values(checks).filter(c => c.status === 'warning').length;

  return {
    checks,
    summary: {
      total,
      passed,
      warnings,
      failed: total - passed - warnings,
      healthy: passed === total
    }
  };
}

/**
 * Check Node.js version (>= 20.0.0)
 */
function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);

  if (major >= 20) {
    return {
      status: 'pass',
      message: `Node.js ${version}`,
      fix: null
    };
  } else {
    return {
      status: 'fail',
      message: `Node.js ${version} is too old`,
      fix: 'Install Node.js 20 or later: https://nodejs.org/',
      docs: 'https://dylan-natter.github.io/ripp-protocol/getting-started.html#prerequisites'
    };
  }
}

/**
 * Check if current directory is a Git repository
 */
function checkGitRepository(cwd) {
  try {
    const gitDir = path.join(cwd, '.git');
    if (fs.existsSync(gitDir)) {
      return {
        status: 'pass',
        message: 'Git repository detected',
        fix: null
      };
    } else {
      return {
        status: 'fail',
        message: 'Not a Git repository',
        fix: 'Initialize Git: git init',
        docs: 'https://git-scm.com/docs/git-init'
      };
    }
  } catch (error) {
    return {
      status: 'fail',
      message: 'Unable to check Git repository',
      fix: 'Ensure you are in a valid directory',
      docs: null
    };
  }
}

/**
 * Check if .ripp directory exists
 */
function checkRippDirectory(cwd) {
  const rippDir = path.join(cwd, '.ripp');
  if (fs.existsSync(rippDir) && fs.statSync(rippDir).isDirectory()) {
    return {
      status: 'pass',
      message: '.ripp directory exists',
      fix: null
    };
  } else {
    return {
      status: 'fail',
      message: '.ripp directory not found',
      fix: 'Initialize RIPP: ripp init',
      docs: 'https://dylan-natter.github.io/ripp-protocol/getting-started.html'
    };
  }
}

/**
 * Check if config.yaml exists
 */
function checkConfigFile(cwd) {
  const configPath = path.join(cwd, '.ripp', 'config.yaml');
  if (fs.existsSync(configPath)) {
    return {
      status: 'pass',
      message: 'config.yaml present',
      fix: null
    };
  } else {
    return {
      status: 'warning',
      message: 'config.yaml not found (using defaults)',
      fix: 'Initialize RIPP: ripp init',
      docs: 'https://dylan-natter.github.io/ripp-protocol/getting-started.html'
    };
  }
}

/**
 * Check if evidence pack exists
 */
function checkEvidencePack(cwd) {
  const evidenceIndex = path.join(cwd, '.ripp', 'evidence', 'index.yaml');
  if (fs.existsSync(evidenceIndex)) {
    return {
      status: 'pass',
      message: 'Evidence pack built',
      fix: null
    };
  } else {
    return {
      status: 'warning',
      message: 'Evidence pack not built',
      fix: 'Build evidence: ripp evidence build',
      docs: 'https://dylan-natter.github.io/ripp-protocol/getting-started.html#step-2-build-evidence'
    };
  }
}

/**
 * Check if candidates exist (discovery has run)
 */
function checkCandidates(cwd) {
  const candidatesDir = path.join(cwd, '.ripp', 'candidates');
  if (fs.existsSync(candidatesDir)) {
    const files = fs.readdirSync(candidatesDir);
    const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

    if (yamlFiles.length > 0) {
      return {
        status: 'pass',
        message: `${yamlFiles.length} candidate(s) found`,
        fix: null
      };
    } else {
      return {
        status: 'warning',
        message: 'No candidate files in candidates directory',
        fix: 'Run discovery: ripp discover (requires AI enabled)',
        docs: 'https://dylan-natter.github.io/ripp-protocol/getting-started.html#step-3-discover-intent'
      };
    }
  } else {
    return {
      status: 'warning',
      message: 'Discovery not run',
      fix: 'Run discovery: ripp discover (requires AI enabled)',
      docs: 'https://dylan-natter.github.io/ripp-protocol/getting-started.html#step-3-discover-intent'
    };
  }
}

/**
 * Check if confirmed intent exists
 */
function checkConfirmedIntent(cwd) {
  const intentPath = path.join(cwd, '.ripp', 'intent.confirmed.yaml');
  if (fs.existsSync(intentPath)) {
    return {
      status: 'pass',
      message: 'Intent confirmed',
      fix: null
    };
  } else {
    return {
      status: 'warning',
      message: 'Intent not confirmed',
      fix: 'Confirm intent: ripp confirm --checklist (then ripp build --from-checklist)',
      docs: 'https://dylan-natter.github.io/ripp-protocol/getting-started.html#step-4-confirm-intent'
    };
  }
}

/**
 * Check if RIPP schema is accessible
 */
function checkSchema() {
  try {
    const projectRoot = path.resolve(__dirname, '../../..');
    const schemaPath = path.join(projectRoot, 'schema', 'ripp-1.0.schema.json');
    if (fs.existsSync(schemaPath)) {
      return {
        status: 'pass',
        message: 'RIPP schema accessible',
        fix: null
      };
    } else {
      return {
        status: 'warning',
        message: 'RIPP schema not found locally',
        fix: 'Schema will be loaded from repository when needed',
        docs: 'https://dylan-natter.github.io/ripp-protocol/schema/ripp-1.0.schema.json'
      };
    }
  } catch (error) {
    return {
      status: 'warning',
      message: 'Unable to check schema',
      fix: null,
      docs: null
    };
  }
}

/**
 * Check CLI version
 */
function checkCliVersion() {
  try {
    const pkg = require('../package.json');
    return {
      status: 'pass',
      message: `ripp-cli v${pkg.version}`,
      fix: null
    };
  } catch (error) {
    return {
      status: 'warning',
      message: 'Unable to determine CLI version',
      fix: null,
      docs: null
    };
  }
}

/**
 * Format health check results as text
 */
function formatHealthCheckText(results) {
  const { checks, summary } = results;

  let output = '\n';
  output += '🔍 RIPP Health Check\n';
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  // Overall summary
  if (summary.healthy) {
    output += '✅ All checks passed!\n\n';
  } else {
    output += `📊 Summary: ${summary.passed}/${summary.total} checks passed`;
    if (summary.warnings > 0) {
      output += `, ${summary.warnings} warnings`;
    }
    if (summary.failed > 0) {
      output += `, ${summary.failed} failed`;
    }
    output += '\n\n';
  }

  // Individual checks
  for (const [name, check] of Object.entries(checks)) {
    const icon = check.status === 'pass' ? '✓' : check.status === 'warning' ? '⚠' : '✗';
    const statusColor = check.status === 'pass' ? '' : check.status === 'warning' ? '⚠ ' : '✗ ';

    output += `${icon} ${formatCheckName(name)}: ${check.message}\n`;

    if (check.fix) {
      output += `  → Fix: ${check.fix}\n`;
    }

    if (check.docs) {
      output += `  → Docs: ${check.docs}\n`;
    }

    output += '\n';
  }

  // Next steps
  if (!summary.healthy) {
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += '💡 Next Steps:\n\n';

    const failedChecks = Object.entries(checks)
      .filter(([_, check]) => check.status === 'fail')
      .map(([_, check]) => check.fix)
      .filter(fix => fix !== null);

    if (failedChecks.length > 0) {
      failedChecks.forEach((fix, idx) => {
        output += `  ${idx + 1}. ${fix}\n`;
      });
    } else {
      output += '  All critical checks passed. Address warnings to improve workflow.\n';
    }

    output += '\n';
  }

  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += 'For more help: https://dylan-natter.github.io/ripp-protocol/getting-started.html\n';

  return output;
}

/**
 * Format check name for display
 */
function formatCheckName(name) {
  const names = {
    nodeVersion: 'Node.js Version',
    gitRepository: 'Git Repository',
    rippDirectory: 'RIPP Directory',
    configFile: 'Configuration',
    evidencePack: 'Evidence Pack',
    candidates: 'Intent Candidates',
    confirmedIntent: 'Confirmed Intent',
    schema: 'RIPP Schema',
    cliVersion: 'CLI Version'
  };
  return names[name] || name;
}

module.exports = {
  runHealthChecks,
  formatHealthCheckText
};
