const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { glob } = require('glob');
const yaml = require('js-yaml');

/**
 * RIPP Evidence Pack Builder
 * Scans repository and extracts high-signal facts for intent discovery
 */

// Secret patterns for redaction (best-effort)
const SECRET_PATTERNS = [
  /api[_-]?key[s]?\s*[:=]\s*['"]([^'"]+)['"]/gi,
  /secret[_-]?key[s]?\s*[:=]\s*['"]([^'"]+)['"]/gi,
  /password[s]?\s*[:=]\s*['"]([^'"]+)['"]/gi,
  /token[s]?\s*[:=]\s*['"]([^'"]+)['"]/gi,
  /[a-z0-9]{32,}/gi // Long alphanumeric strings (potential keys)
];

/**
 * Build evidence pack from repository
 */
async function buildEvidencePack(cwd, config) {
  const evidenceDir = path.join(cwd, '.ripp', 'evidence');

  // Create evidence directory
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  // Scan files
  const files = await scanFiles(cwd, config.evidencePack);

  // Extract evidence from files
  const evidence = await extractEvidence(files, cwd);

  // Build index
  const index = {
    version: '1.0',
    created: new Date().toISOString(),
    stats: {
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      includedFiles: files.length,
      excludedFiles: 0 // Could track this if needed
    },
    includePatterns: config.evidencePack.includeGlobs,
    excludePatterns: config.evidencePack.excludeGlobs,
    files: files.map(f => ({
      path: f.path,
      hash: f.hash,
      size: f.size,
      type: f.type
    })),
    evidence
  };

  // Write index
  const indexPath = path.join(evidenceDir, 'evidence.index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');

  // Copy relevant files to evidence directory (optional, for provenance)
  // For now, we just keep the index with hashes

  return { index, evidenceDir, indexPath };
}

/**
 * Scan files matching include/exclude patterns
 */
async function scanFiles(cwd, evidenceConfig) {
  const files = [];
  const { includeGlobs, excludeGlobs, maxFileSize } = evidenceConfig;

  // Build combined pattern
  const patterns = includeGlobs.map(pattern => path.join(cwd, pattern));

  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      ignore: excludeGlobs.map(ex => path.join(cwd, ex)),
      nodir: true,
      absolute: true
    });

    for (const filePath of matches) {
      try {
        const stats = fs.statSync(filePath);

        // Skip files that are too large
        if (stats.size > maxFileSize) {
          continue;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        const relativePath = path.relative(cwd, filePath);

        files.push({
          path: relativePath,
          absolutePath: filePath,
          hash,
          size: stats.size,
          type: detectFileType(relativePath),
          content
        });
      } catch (error) {
        // Skip files we can't read
        continue;
      }
    }
  }

  return files;
}

/**
 * Detect file type based on path and extension
 */
function detectFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (filePath.includes('.github/workflows/')) {
    return 'workflow';
  }

  if (
    ext === '.json' &&
    (filePath.includes('package.json') || filePath.includes('schema'))
  ) {
    return 'config';
  }

  if (ext === '.sql' || filePath.includes('migration') || filePath.includes('schema')) {
    return 'schema';
  }

  if (['.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.go', '.java', '.cs'].includes(ext)) {
    return 'source';
  }

  return 'other';
}

/**
 * Extract high-signal evidence from files
 */
async function extractEvidence(files, cwd) {
  const evidence = {
    dependencies: [],
    routes: [],
    schemas: [],
    auth: [],
    workflows: []
  };

  for (const file of files) {
    try {
      // Extract dependencies
      if (file.path.includes('package.json')) {
        const deps = extractDependencies(file);
        evidence.dependencies.push(...deps);
      }

      // Extract routes (best-effort pattern matching)
      if (file.type === 'source') {
        const routes = extractRoutes(file);
        evidence.routes.push(...routes);

        // Extract auth signals
        const auth = extractAuthSignals(file);
        evidence.auth.push(...auth);
      }

      // Extract schemas
      if (file.type === 'schema' || file.path.includes('model')) {
        const schemas = extractSchemas(file);
        evidence.schemas.push(...schemas);
      }

      // Extract workflows
      if (file.type === 'workflow') {
        const workflow = extractWorkflow(file);
        if (workflow) {
          evidence.workflows.push(workflow);
        }
      }
    } catch (error) {
      // Skip files with extraction errors
      continue;
    }
  }

  return evidence;
}

/**
 * Extract dependencies from package.json
 */
function extractDependencies(file) {
  const deps = [];

  try {
    const pkg = JSON.parse(file.content);

    if (pkg.dependencies) {
      for (const [name, version] of Object.entries(pkg.dependencies)) {
        deps.push({
          name,
          version,
          type: 'runtime',
          source: file.path
        });
      }
    }

    if (pkg.devDependencies) {
      for (const [name, version] of Object.entries(pkg.devDependencies)) {
        deps.push({
          name,
          version,
          type: 'dev',
          source: file.path
        });
      }
    }
  } catch (error) {
    // Invalid JSON, skip
  }

  return deps;
}

/**
 * Extract API routes (best-effort pattern matching)
 */
function extractRoutes(file) {
  const routes = [];
  const lines = file.content.split('\n');

  // Common patterns for Express, FastAPI, etc.
  const routePatterns = [
    /\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
    /@(Get|Post|Put|Delete|Patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
    /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
    /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi
  ];

  lines.forEach((line, index) => {
    for (const pattern of routePatterns) {
      pattern.lastIndex = 0; // Reset regex
      const match = pattern.exec(line);
      if (match) {
        const method = match[1].toUpperCase();
        const routePath = match[2];

        routes.push({
          method,
          path: routePath,
          source: `${file.path}:${index + 1}`,
          snippet: redactSecrets(line.trim())
        });
      }
    }
  });

  return routes;
}

/**
 * Extract auth/permission signals
 */
function extractAuthSignals(file) {
  const signals = [];
  const lines = file.content.split('\n');

  const authPatterns = [
    { pattern: /(authenticate|auth|requireAuth|isAuthenticated)/i, type: 'middleware' },
    { pattern: /(authorize|checkPermission|requireRole|hasRole)/i, type: 'guard' },
    { pattern: /(jwt|bearer|oauth|session)/i, type: 'config' }
  ];

  lines.forEach((line, index) => {
    for (const { pattern, type } of authPatterns) {
      if (pattern.test(line)) {
        signals.push({
          type,
          source: `${file.path}:${index + 1}`,
          snippet: redactSecrets(line.trim())
        });
        break; // Only one signal per line
      }
    }
  });

  return signals;
}

/**
 * Extract schema definitions (best-effort)
 */
function extractSchemas(file) {
  const schemas = [];

  // Try to detect schema type
  if (file.path.includes('migration')) {
    schemas.push({
      name: path.basename(file.path, path.extname(file.path)),
      type: 'migration',
      source: file.path,
      snippet: redactSecrets(file.content.substring(0, 500))
    });
  } else if (file.path.includes('model')) {
    schemas.push({
      name: path.basename(file.path, path.extname(file.path)),
      type: 'model',
      source: file.path,
      snippet: redactSecrets(file.content.substring(0, 500))
    });
  }

  return schemas;
}

/**
 * Extract workflow configuration
 */
function extractWorkflow(file) {
  try {
    const workflow = yaml.load(file.content);

    if (workflow && workflow.name) {
      return {
        name: workflow.name,
        triggers: Object.keys(workflow.on || {}),
        source: file.path
      };
    }
  } catch (error) {
    // Invalid YAML, skip
  }

  return null;
}

/**
 * Redact potential secrets from text (best-effort)
 */
function redactSecrets(text) {
  let redacted = text;

  for (const pattern of SECRET_PATTERNS) {
    pattern.lastIndex = 0; // Reset regex
    redacted = redacted.replace(pattern, (match, p1) => {
      if (p1 && p1.length > 8) {
        return match.replace(p1, '[REDACTED]');
      }
      return match;
    });
  }

  return redacted;
}

module.exports = {
  buildEvidencePack,
  redactSecrets
};
