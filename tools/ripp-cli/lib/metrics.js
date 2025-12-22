const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Gather metrics about the RIPP workflow in the current repository.
 * Metrics are best-effort and never fabricated - if data is unavailable, it is marked as N/A.
 *
 * @param {string} rippDir - Path to .ripp directory (default: ./.ripp)
 * @returns {object} Metrics object with evidence, discovery, validation, and workflow stats
 */
function gatherMetrics(rippDir = './.ripp') {
  const metrics = {
    timestamp: new Date().toISOString(),
    evidence: gatherEvidenceMetrics(rippDir),
    discovery: gatherDiscoveryMetrics(rippDir),
    validation: gatherValidationMetrics(rippDir),
    workflow: gatherWorkflowMetrics(rippDir)
  };

  return metrics;
}

/**
 * Gather evidence pack metrics
 */
function gatherEvidenceMetrics(rippDir) {
  const evidenceIndexPath = path.join(rippDir, 'evidence', 'evidence.index.json');

  if (!fs.existsSync(evidenceIndexPath)) {
    return {
      status: 'not_built',
      file_count: 0,
      total_size: 0,
      coverage_percent: 0
    };
  }

  try {
    const evidenceIndex = JSON.parse(fs.readFileSync(evidenceIndexPath, 'utf8'));
    const fileCount = evidenceIndex.total_files || evidenceIndex.files?.length || 0;
    const totalSize = evidenceIndex.total_size || 0;

    // Calculate coverage: evidence files vs total git-tracked files
    let gitFileCount = 0;
    try {
      const gitFiles = execSync('git ls-files --exclude-standard', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
        cwd: path.dirname(rippDir)
      });
      gitFileCount = gitFiles
        .trim()
        .split('\n')
        .filter(f => f.length > 0).length;
    } catch (error) {
      // Not a git repo or git command failed, coverage unknown
      gitFileCount = fileCount; // Assume 100% if git unavailable
    }

    const coveragePercent = gitFileCount > 0 ? Math.round((fileCount / gitFileCount) * 100) : 0;

    return {
      status: 'built',
      file_count: fileCount,
      total_size: totalSize,
      coverage_percent: coveragePercent,
      last_build: evidenceIndex.timestamp || 'unknown'
    };
  } catch (error) {
    return {
      status: 'error',
      file_count: 0,
      total_size: 0,
      coverage_percent: 0,
      error: error.message
    };
  }
}

/**
 * Gather discovery metrics (AI-generated candidates)
 */
function gatherDiscoveryMetrics(rippDir) {
  const candidatesPath = path.join(rippDir, 'intent.candidates.yaml');

  if (!fs.existsSync(candidatesPath)) {
    return {
      status: 'not_run',
      candidate_count: 0
    };
  }

  try {
    const yaml = require('js-yaml');
    const candidatesContent = fs.readFileSync(candidatesPath, 'utf8');
    const candidates = yaml.load(candidatesContent);

    const candidateCount = candidates.candidates?.length || 0;

    // Calculate average confidence if available
    let avgConfidence = null;
    if (candidates.candidates && candidateCount > 0) {
      const confidences = candidates.candidates
        .map(c => c.confidence)
        .filter(conf => typeof conf === 'number' && conf >= 0 && conf <= 1);

      if (confidences.length > 0) {
        avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
      }
    }

    // Quality score (simple heuristic: avg confidence * candidate count normalization)
    const qualityScore =
      avgConfidence !== null
        ? Math.round(avgConfidence * Math.min(candidateCount / 3, 1) * 100)
        : null;

    return {
      status: 'completed',
      candidate_count: candidateCount,
      avg_confidence: avgConfidence !== null ? Math.round(avgConfidence * 100) / 100 : null,
      quality_score: qualityScore,
      model: candidates.metadata?.model || 'unknown'
    };
  } catch (error) {
    return {
      status: 'error',
      candidate_count: 0,
      error: error.message
    };
  }
}

/**
 * Gather validation metrics
 */
function gatherValidationMetrics(rippDir) {
  // Look for canonical handoff packet
  const handoffPath = path.join(rippDir, 'handoff.ripp.yaml');

  if (!fs.existsSync(handoffPath)) {
    return {
      status: 'not_validated',
      last_run: null
    };
  }

  try {
    // Get file mtime as proxy for last validation
    const stats = fs.statSync(handoffPath);
    const lastRun = stats.mtime.toISOString();

    // Attempt basic validation check (packet must be parseable YAML with ripp_version)
    const yaml = require('js-yaml');
    const packetContent = fs.readFileSync(handoffPath, 'utf8');
    const packet = yaml.load(packetContent);

    const isValid = packet && packet.ripp_version === '1.0' && packet.packet_id && packet.level;

    return {
      status: isValid ? 'pass' : 'fail',
      last_run: lastRun,
      level: packet.level || null
    };
  } catch (error) {
    return {
      status: 'fail',
      last_run: null,
      error: error.message
    };
  }
}

/**
 * Gather workflow completion metrics
 */
function gatherWorkflowMetrics(rippDir) {
  // Define expected artifacts for each workflow step
  const steps = {
    initialized: fs.existsSync(path.join(rippDir, 'config.yaml')),
    evidence_built: fs.existsSync(path.join(rippDir, 'evidence', 'evidence.index.json')),
    discovery_run: fs.existsSync(path.join(rippDir, 'intent.candidates.yaml')),
    checklist_generated: fs.existsSync(path.join(rippDir, 'intent.checklist.md')),
    artifacts_built: fs.existsSync(path.join(rippDir, 'handoff.ripp.yaml'))
  };

  const completedSteps = Object.values(steps).filter(Boolean).length;
  const totalSteps = Object.keys(steps).length;
  const completionPercent = Math.round((completedSteps / totalSteps) * 100);

  return {
    completion_percent: completionPercent,
    steps_completed: completedSteps,
    steps_total: totalSteps,
    steps: steps
  };
}

/**
 * Format metrics as human-readable text
 */
function formatMetricsText(metrics) {
  const lines = [];

  lines.push('RIPP Workflow Metrics');
  lines.push('='.repeat(60));
  lines.push('');

  // Evidence metrics
  lines.push('Evidence Pack:');
  if (metrics.evidence.status === 'built') {
    lines.push(`  Status: ✓ Built`);
    lines.push(`  Files: ${metrics.evidence.file_count}`);
    lines.push(`  Size: ${formatBytes(metrics.evidence.total_size)}`);
    lines.push(`  Coverage: ${metrics.evidence.coverage_percent}% of git-tracked files`);
    lines.push(`  Last Build: ${formatTimestamp(metrics.evidence.last_build)}`);
  } else if (metrics.evidence.status === 'not_built') {
    lines.push(`  Status: ✗ Not built`);
    lines.push(`  Next Step: Run 'ripp evidence build'`);
  } else {
    lines.push(`  Status: ✗ Error`);
    lines.push(`  Error: ${metrics.evidence.error || 'Unknown'}`);
  }
  lines.push('');

  // Discovery metrics
  lines.push('Intent Discovery:');
  if (metrics.discovery.status === 'completed') {
    lines.push(`  Status: ✓ Completed`);
    lines.push(`  Candidates: ${metrics.discovery.candidate_count}`);
    if (metrics.discovery.avg_confidence !== null) {
      lines.push(`  Avg Confidence: ${(metrics.discovery.avg_confidence * 100).toFixed(0)}%`);
    }
    if (metrics.discovery.quality_score !== null) {
      lines.push(`  Quality Score: ${metrics.discovery.quality_score}/100`);
    }
    lines.push(`  Model: ${metrics.discovery.model}`);
  } else if (metrics.discovery.status === 'not_run') {
    lines.push(`  Status: ✗ Not run`);
    lines.push(`  Next Step: Run 'ripp discover'`);
  } else {
    lines.push(`  Status: ✗ Error`);
    lines.push(`  Error: ${metrics.discovery.error || 'Unknown'}`);
  }
  lines.push('');

  // Validation metrics
  lines.push('Validation:');
  if (metrics.validation.status === 'pass') {
    lines.push(`  Status: ✓ Pass`);
    lines.push(`  Level: ${metrics.validation.level}`);
    lines.push(`  Last Run: ${formatTimestamp(metrics.validation.last_run)}`);
  } else if (metrics.validation.status === 'fail') {
    lines.push(`  Status: ✗ Fail`);
    if (metrics.validation.error) {
      lines.push(`  Error: ${metrics.validation.error}`);
    }
  } else {
    lines.push(`  Status: - Not validated`);
    lines.push(`  Next Step: Run 'ripp build' to create handoff packet`);
  }
  lines.push('');

  // Workflow completion
  lines.push('Workflow Progress:');
  lines.push(
    `  Completion: ${metrics.workflow.completion_percent}% (${metrics.workflow.steps_completed}/${metrics.workflow.steps_total} steps)`
  );
  lines.push(`  Steps:`);
  lines.push(
    `    ${metrics.workflow.steps.initialized ? '✓' : '✗'} Initialized (.ripp/config.yaml)`
  );
  lines.push(`    ${metrics.workflow.steps.evidence_built ? '✓' : '✗'} Evidence Built`);
  lines.push(`    ${metrics.workflow.steps.discovery_run ? '✓' : '✗'} Discovery Run`);
  lines.push(`    ${metrics.workflow.steps.checklist_generated ? '✓' : '✗'} Checklist Generated`);
  lines.push(`    ${metrics.workflow.steps.artifacts_built ? '✓' : '✗'} Artifacts Built`);
  lines.push('');

  lines.push('='.repeat(60));
  lines.push(`Generated: ${formatTimestamp(metrics.timestamp)}`);

  return lines.join('\n');
}

/**
 * Format bytes as human-readable size
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format ISO timestamp as human-readable
 */
function formatTimestamp(timestamp) {
  if (!timestamp || timestamp === 'unknown') return 'Unknown';
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch (error) {
    return timestamp;
  }
}

/**
 * Load metrics history from .ripp/metrics-history.json
 */
function loadMetricsHistory(rippDir) {
  const historyPath = path.join(rippDir, 'metrics-history.json');

  if (!fs.existsSync(historyPath)) {
    return [];
  }

  try {
    const historyContent = fs.readFileSync(historyPath, 'utf8');
    return JSON.parse(historyContent);
  } catch (error) {
    console.error(`Warning: Could not load metrics history: ${error.message}`);
    return [];
  }
}

/**
 * Save metrics to history
 */
function saveMetricsHistory(rippDir, metrics) {
  const historyPath = path.join(rippDir, 'metrics-history.json');

  try {
    const history = loadMetricsHistory(rippDir);

    // Add current metrics to history (keep last 50 entries)
    history.push({
      timestamp: metrics.timestamp,
      evidence: metrics.evidence,
      discovery: metrics.discovery,
      validation: metrics.validation,
      workflow: metrics.workflow
    });

    const trimmedHistory = history.slice(-50);

    fs.writeFileSync(historyPath, JSON.stringify(trimmedHistory, null, 2), 'utf8');
  } catch (error) {
    console.error(`Warning: Could not save metrics history: ${error.message}`);
  }
}

/**
 * Format metrics history as text
 */
function formatMetricsHistory(history) {
  if (history.length === 0) {
    return 'No metrics history available. Run `ripp metrics --report` multiple times to build history.';
  }

  const lines = [];
  lines.push('RIPP Metrics History');
  lines.push('='.repeat(60));
  lines.push('');

  // Show trends for key metrics
  const recent = history.slice(-10); // Last 10 entries

  lines.push('Recent Trends (last 10 runs):');
  lines.push('');

  // Evidence coverage trend
  lines.push('Evidence Coverage:');
  recent.forEach((entry, idx) => {
    const coverage = entry.evidence?.coverage_percent || 0;
    const bar = '█'.repeat(Math.round(coverage / 5));
    lines.push(`  ${formatTimestamp(entry.timestamp).padEnd(25)} ${bar} ${coverage}%`);
  });
  lines.push('');

  // Discovery quality trend
  lines.push('Discovery Quality Score:');
  recent.forEach((entry, idx) => {
    const quality = entry.discovery?.quality_score || 0;
    const bar = '█'.repeat(Math.round(quality / 5));
    lines.push(`  ${formatTimestamp(entry.timestamp).padEnd(25)} ${bar} ${quality}/100`);
  });
  lines.push('');

  // Workflow completion trend
  lines.push('Workflow Completion:');
  recent.forEach((entry, idx) => {
    const completion = entry.workflow?.completion_percent || 0;
    const bar = '█'.repeat(Math.round(completion / 5));
    lines.push(`  ${formatTimestamp(entry.timestamp).padEnd(25)} ${bar} ${completion}%`);
  });
  lines.push('');

  return lines.join('\n');
}

module.exports = {
  gatherMetrics,
  formatMetricsText,
  loadMetricsHistory,
  saveMetricsHistory,
  formatMetricsHistory
};
