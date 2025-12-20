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
// More conservative patterns to avoid false positives
const SECRET_PATTERNS = [
  /api[_-]?key[s]?\s*[:=]\s*['"]([^'"]+)['"]/gi,
  /secret[_-]?key[s]?\s*[:=]\s*['"]([^'"]+)['"]/gi,
  /password[s]?\s*[:=]\s*['"]([^'"]+)['"]/gi,
  /token[s]?\s*[:=]\s*['"]([^'"]+)['"]/gi,
  /bearer\s+([a-zA-Z0-9_\-\.]{20,})/gi, // Bearer tokens
  /sk-[a-zA-Z0-9]{32,}/gi, // OpenAI-style keys
  /ghp_[a-zA-Z0-9]{36,}/gi // GitHub tokens
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
  const { files, excludedCount } = await scanFiles(cwd, config.evidencePack);

  // Extract evidence from files
  const evidence = await extractEvidence(files, cwd);

  // Build index
  const index = {
    version: '1.0',
    created: new Date().toISOString(),
    stats: {
      totalFiles: files.length + excludedCount,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      includedFiles: files.length,
      excludedFiles: excludedCount
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
  let excludedCount = 0;
  const { includeGlobs, excludeGlobs, maxFileSize } = evidenceConfig;

  // Use glob with cwd option instead of joining paths
  // This ensures patterns work correctly on all platforms
  for (const pattern of includeGlobs) {
    const matches = await glob(pattern, {
      cwd: cwd,
      ignore: excludeGlobs,
      nodir: true,
      absolute: true
    });

    for (const filePath of matches) {
      try {
        const stats = fs.statSync(filePath);

        // Skip files that are too large
        if (stats.size > maxFileSize) {
          excludedCount++;
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
        excludedCount++;
        continue;
      }
    }
  }

  return { files, excludedCount };
}

/**
 * Detect file type based on path and extension
 */
function detectFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (filePath.includes('.github/workflows/')) {
    return 'workflow';
  }

  if (ext === '.json' && (filePath.includes('package.json') || filePath.includes('schema'))) {
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
    workflows: [],
    projectType: detectProjectType(files),
    keyInsights: extractKeyInsights(files, cwd),
    codeSnippets: extractKeyCodeSnippets(files)
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

/**
 * Detect project type from evidence
 */
function detectProjectType(files) {
  const indicators = {
    cli: 0,
    webApp: 0,
    api: 0,
    library: 0,
    protocol: 0
  };

  for (const file of files) {
    const content = file.content ? file.content.toLowerCase() : '';
    const path = file.path.toLowerCase();

    // CLI tool indicators
    if (path.includes('/bin/') || path.includes('cli') || path.includes('command')) indicators.cli += 3;
    if (content.includes('commander') || content.includes('yargs') || content.includes('process.argv')) indicators.cli += 2;
    if (path === 'package.json' && content.includes('"bin"')) indicators.cli += 4;

    // Web app indicators  
    if (path.includes('app/') || path.includes('pages/') || path.includes('components/')) indicators.webApp += 3;
    if (content.includes('react') || content.includes('vue') || content.includes('angular')) indicators.webApp += 2;
    if (path.includes('index.html') || path.includes('app.tsx')) indicators.webApp += 3;

    // API indicators
    if (path.includes('api/') || path.includes('routes/') || path.includes('controllers/')) indicators.api += 3;
    if (content.includes('express') || content.includes('fastify') || content.includes('koa')) indicators.api += 2;
    if (content.includes('@app.route') || content.includes('@route') || content.includes('router.')) indicators.api += 2;

    // Library indicators
    if (path === 'package.json' && !content.includes('"bin"') && !content.includes('"scripts"')) indicators.library += 2;
    if (path.includes('lib/') || path.includes('src/index')) indicators.library += 1;

    // Protocol/spec indicators
    if (path.includes('spec.md') || path.includes('protocol') || path.includes('rfc')) indicators.protocol += 4;
    if (path.includes('schema/') && path.includes('.json')) indicators.protocol += 2;
  }

  // Return type with highest score
  const sorted = Object.entries(indicators).sort((a, b) => b[1] - a[1]);
  return {
    primary: sorted[0][0],
    secondary: sorted[1][1] > 0 ? sorted[1][0] : null,
    confidence: sorted[0][1] > 5 ? 'high' : sorted[0][1] > 2 ? 'medium' : 'low',
    scores: indicators
  };
}

/**
 * Extract key insights from README, package.json, and main files
 */
function extractKeyInsights(files, cwd) {
  const insights = {
    purpose: null,
    description: null,
    mainFeatures: [],
    architecture: null
  };

  for (const file of files) {
    const path = file.path.toLowerCase();
    const content = file.content || '';

    // Extract from README
    if (path.includes('readme.md') || path.includes('readme.txt')) {
      // Extract first paragraph as description
      const lines = content.split('\n');
      let desc = '';
      for (const line of lines) {
        if (line.trim() && !line.startsWith('#') && !line.startsWith('[')) {
          desc += line.trim() + ' ';
          if (desc.length > 200) break;
        }
      }
      if (desc) insights.description = desc.slice(0, 300);

      // Extract features (look for bullet points or numbered lists)
      const featureMatch = content.match(/(?:features|capabilities|includes)[\s\S]{0,50}?\n((?:[-*]\s.+\n)+)/i);
      if (featureMatch) {
        insights.mainFeatures = featureMatch[1]
          .split('\n')
          .map(f => f.replace(/^[-*]\s+/, '').trim())
          .filter(f => f.length > 0)
          .slice(0, 5);
      }
    }

    // Extract from package.json
    if (path === 'package.json') {
      try {
        const pkg = JSON.parse(content);
        if (pkg.description && !insights.description) {
          insights.description = pkg.description;
        }
        if (pkg.name && !insights.purpose) {
          insights.purpose = `${pkg.name}: ${pkg.description || 'No description'}`;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    // Extract from SPEC files
    if (path.includes('spec.md') || path.includes('architecture.md')) {
      const purposeMatch = content.match(/(?:purpose|goal|objective)[\s:]+([^\n]{50,300})/i);
      if (purposeMatch && !insights.purpose) {
        insights.purpose = purposeMatch[1].trim();
      }
    }
  }

  return insights;
}

/**
 * Extract key code snippets (functions, classes, exports)
 */
function extractKeyCodeSnippets(files) {
  const snippets = [];
  let count = 0;
  const maxSnippets = 15;

  for (const file of files) {
    if (count >= maxSnippets) break;
    if (!file.content || file.type !== 'source') continue;

    const content = file.content;
    const path = file.path;

    // Extract function definitions (JavaScript/TypeScript)
    const funcMatches = content.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*{([^}]{0,200})/g);
    for (const match of funcMatches) {
      if (count >= maxSnippets) break;
      snippets.push({
        file: path,
        type: 'function',
        name: match[1],
        snippet: match[0].substring(0, 150)
      });
      count++;
    }

    // Extract class definitions
    const classMatches = content.matchAll(/(?:export\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?\s*{([^}]{0,150})/g);
    for (const match of classMatches) {
      if (count >= maxSnippets) break;
      snippets.push({
        file: path,
        type: 'class',
        name: match[1],
        snippet: match[0].substring(0, 150)
      });
      count++;
    }

    // Extract key comments (JSDoc, purpose statements)
    const commentMatches = content.matchAll(/\/\*\*\s*\n\s*\*\s*([^\n]{30,200})/g);
    for (const match of commentMatches) {
      if (count >= maxSnippets) break;
      if (match[1].toLowerCase().includes('purpose') || match[1].toLowerCase().includes('description')) {
        snippets.push({
          file: path,
          type: 'comment',
          snippet: match[1].trim()
        });
        count++;
      }
    }
  }

  return snippets.slice(0, maxSnippets);
}

module.exports = {
  buildEvidencePack,
  redactSecrets
};
