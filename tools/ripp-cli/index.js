#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { glob } = require('glob');
const { execSync } = require('child_process');
const { lintPacket, generateJsonReport, generateMarkdownReport } = require('./lib/linter');
const { packagePacket, formatAsJson, formatAsYaml, formatAsMarkdown } = require('./lib/packager');
const { analyzeInput } = require('./lib/analyzer');
const { initRepository } = require('./lib/init');
const { loadConfig, checkAiEnabled } = require('./lib/config');
const { buildEvidencePack } = require('./lib/evidence');
const { discoverIntent } = require('./lib/discovery');
const { confirmIntent } = require('./lib/confirmation');
const { buildCanonicalArtifacts } = require('./lib/build');
const { migrateDirectoryStructure } = require('./lib/migrate');
const {
  gatherMetrics,
  formatMetricsText,
  loadMetricsHistory,
  saveMetricsHistory,
  formatMetricsHistory
} = require('./lib/metrics');
const { runHealthChecks, formatHealthCheckText } = require('./lib/doctor');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

// Configuration constants
const MIN_FILES_FOR_TABLE = 4;
const MAX_FILENAME_WIDTH = 40;
const TRUNCATED_FILENAME_PREFIX_LENGTH = 3;

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

function loadSchema() {
  const schemaPath = path.join(__dirname, '../../schema/ripp-1.0.schema.json');
  try {
    return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  } catch (error) {
    console.error(`${colors.red}Error: Could not load schema from ${schemaPath}${colors.reset}`);
    console.error(error.message);
    process.exit(1);
  }
}

function loadPacket(filePath) {
  const ext = path.extname(filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  try {
    if (ext === '.yaml' || ext === '.yml') {
      return yaml.load(content);
    } else if (ext === '.json') {
      return JSON.parse(content);
    } else {
      throw new Error(`Unsupported file extension: ${ext}`);
    }
  } catch (error) {
    throw new Error(`Failed to parse ${filePath}: ${error.message}`);
  }
}

function validatePacket(packet, schema, filePath, options = {}) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const validate = ajv.compile(schema);
  const valid = validate(packet);

  const errors = [];
  const warnings = [];
  const levelRequirements = {
    2: ['api_contracts', 'permissions', 'failure_modes'],
    3: ['api_contracts', 'permissions', 'failure_modes', 'audit_events', 'nfrs', 'acceptance_tests']
  };

  // Schema validation errors with enhanced messaging
  if (!valid) {
    validate.errors.forEach(error => {
      const field = error.instancePath || 'root';
      let message = error.message;

      // Enhanced error messages for level-based requirements
      if (error.keyword === 'required' && packet.level >= 2) {
        const missingProp = error.params.missingProperty;
        const level = packet.level;
        const isLevelRequirement = levelRequirements[level]?.includes(missingProp);

        if (isLevelRequirement) {
          message = `Level ${level} requires '${missingProp}' (missing)`;
          errors.push(message);
          return;
        }
      }

      // Improve "additional properties" errors
      if (error.keyword === 'additionalProperties') {
        const additionalProp = error.params.additionalProperty;
        message = `unexpected property '${additionalProp}'`;
        errors.push(`${field}: ${message}`);
        return;
      }

      errors.push(`${field}: ${message}`);
    });
  }

  // File naming convention check
  const basename = path.basename(filePath);
  if (!basename.match(/\.ripp\.(yaml|yml|json)$/)) {
    warnings.push('File does not follow naming convention (*.ripp.yaml or *.ripp.json)');
  }

  // packet_id format check
  if (packet.packet_id && !packet.packet_id.match(/^[a-z0-9-]+$/)) {
    errors.push('packet_id must be lowercase with hyphens only (kebab-case)');
  }

  // Minimum level enforcement
  if (options.minLevel && packet.level < options.minLevel) {
    errors.push(
      `Packet is Level ${packet.level}, but minimum Level ${options.minLevel} is required`
    );
  }

  // Check template files (allow them to have placeholder values)
  const isTemplate = basename.includes('template');
  if (isTemplate) {
    warnings.push('Template file detected - validation may show expected errors');
  }

  return { valid: errors.length === 0, errors, warnings, level: packet.level };
}

async function findRippFiles(pathArg) {
  const stats = fs.statSync(pathArg);

  if (stats.isFile()) {
    return [pathArg];
  } else if (stats.isDirectory()) {
    const pattern = path.join(pathArg, '**/*.ripp.{yaml,yml,json}');
    return await glob(pattern, { nodir: true });
  } else {
    throw new Error(`Invalid path: ${pathArg}`);
  }
}

function printResults(results, options) {
  console.log('');

  let totalValid = 0;
  let totalInvalid = 0;
  const levelMissingFields = new Map(); // Track missing fields by level

  // Show summary table for multiple files when not verbose
  if (results.length >= MIN_FILES_FOR_TABLE && !options.verbose) {
    console.log('┌──────────────────────────────────────────┬───────┬────────┬────────┐');
    console.log('│ File                                     │ Level │ Status │ Issues │');
    console.log('├──────────────────────────────────────────┼───────┼────────┼────────┤');

    results.forEach(result => {
      const fileName =
        result.file.length > MAX_FILENAME_WIDTH
          ? '...' + result.file.slice(-(MAX_FILENAME_WIDTH - TRUNCATED_FILENAME_PREFIX_LENGTH))
          : result.file;
      const paddedFile = fileName.padEnd(MAX_FILENAME_WIDTH);
      const level = result.level ? result.level.toString().padEnd(5) : 'N/A  ';
      const status = result.valid ? '✓     ' : '✗     ';
      const statusColor = result.valid ? colors.green : colors.red;
      const issues = result.errors.length.toString().padEnd(6);

      console.log(
        `│ ${paddedFile} │ ${level} │ ${statusColor}${status}${colors.reset} │ ${issues} │`
      );

      if (result.valid) {
        totalValid++;
      } else {
        totalInvalid++;
      }
    });

    console.log('└──────────────────────────────────────────┴───────┴────────┴────────┘');
    console.log('');

    if (totalInvalid > 0) {
      log(
        colors.red,
        '✗',
        `${totalInvalid} of ${results.length} failed. Run with --verbose for details.`
      );
    } else {
      log(colors.green, '✓', `All ${totalValid} RIPP packets are valid.`);
    }

    console.log('');
    return;
  }

  // Detailed output for verbose mode or small number of files
  results.forEach(result => {
    if (result.valid) {
      totalValid++;
      log(colors.green, '✓', `${result.file} is valid (Level ${result.level})`);
    } else {
      totalInvalid++;
      const levelInfo = result.level ? ` (Level ${result.level})` : '';
      log(colors.red, '✗', `${result.file}${levelInfo}`);
      result.errors.forEach(error => {
        console.log(`  ${colors.red}•${colors.reset} ${error}`);

        // Track level-based missing fields
        const match = error.match(/Level (\d) requires '(\w+)'/);
        if (match) {
          const level = match[1];
          const field = match[2];
          if (!levelMissingFields.has(result.file)) {
            levelMissingFields.set(result.file, { level, fields: [] });
          }
          levelMissingFields.get(result.file).fields.push(field);
        }
      });

      // Add helpful tips for level-based errors
      if (levelMissingFields.has(result.file)) {
        const info = levelMissingFields.get(result.file);
        console.log('');
        console.log(
          `  ${colors.blue}💡 Tip:${colors.reset} Use level: 1 for basic contracts, or add missing sections for Level ${info.level}`
        );
        console.log(
          `  ${colors.blue}📖 Docs:${colors.reset} https://dylan-natter.github.io/ripp-protocol/ripp-levels.html`
        );
      }
    }

    if (result.warnings.length > 0 && !options.quiet) {
      result.warnings.forEach(warning => {
        console.log(`  ${colors.yellow}⚠${colors.reset} ${warning}`);
      });
    }
  });

  console.log('');

  if (totalInvalid > 0) {
    log(colors.red, '✗', `${totalInvalid} of ${results.length} RIPP packets failed validation.`);
  } else {
    log(colors.green, '✓', `All ${totalValid} RIPP packets are valid.`);
  }

  console.log('');
}

function showHelp() {
  const pkg = require('./package.json');
  console.log(`
${colors.blue}RIPP CLI v${pkg.version}${colors.reset}

${colors.green}Commands:${colors.reset}
  ripp init                         Initialize RIPP in your repository
  ripp migrate                      Migrate legacy directory structure to new layout
  ripp validate <path>              Validate RIPP packets
  ripp lint <path>                  Lint RIPP packets for best practices
  ripp package --in <file> --out <file>
                                    Package RIPP packet into normalized artifact
  ripp analyze <input> --output <file>
                                    Analyze code/schema and generate DRAFT RIPP packet

${colors.blue}vNext - Intent Discovery Mode:${colors.reset}
  ripp evidence build               Build evidence pack from repository
  ripp discover                     Infer candidate intent (requires AI enabled)
  ripp confirm                      Confirm candidate intent (interactive)
  ripp build                        Build canonical RIPP artifacts from confirmed intent
  ripp metrics                      Display workflow analytics and health metrics
  ripp doctor                       Run health checks and diagnostics

  ripp --help                       Show this help message
  ripp --version                    Show version

${colors.green}Init Options:${colors.reset}
  --force                           Overwrite existing files

${colors.green}Migrate Options:${colors.reset}
  --dry-run                         Preview changes without moving files

${colors.green}Evidence Build Options:${colors.reset}
  (Uses configuration from .ripp/config.yaml)

${colors.green}Discover Options:${colors.reset}
  --target-level <1|2|3>            Target RIPP level (default: 1)
  (Requires: ai.enabled=true in config AND RIPP_AI_ENABLED=true)

${colors.green}Confirm Options:${colors.reset}
  --interactive                     Interactive confirmation mode (default)
  --checklist                       Generate markdown checklist for manual review
  --user <id>                       User identifier for confirmation

${colors.green}Build Options:${colors.reset}
  --from-checklist                  Build from intent.checklist.md (after manual review)
  --packet-id <id>                  Packet ID for generated RIPP (default: discovered-intent)
  --title <title>                   Title for generated RIPP packet
  --output-name <file>              Output file name (default: handoff.ripp.yaml)
  --user <id>                       User identifier for confirmation tracking

${colors.green}Metrics Options:${colors.reset}
  --report                          Write metrics to .ripp/metrics.json
  --history                         Show metrics trends from previous runs

${colors.green}Validate Options:${colors.reset}
  --min-level <1|2|3>               Enforce minimum RIPP level
  --quiet                           Suppress warnings
  --verbose                         Show detailed output for all files

${colors.green}Lint Options:${colors.reset}
  --strict                          Treat warnings as errors
  --output <dir>                    Output directory for reports (default: reports/)

${colors.green}Package Options:${colors.reset}
  --in <file>                       Input RIPP packet file (required)
  --out <file>                      Output file path (required)
  --format <json|yaml|md>           Output format (auto-detected from extension)
  --package-version <version>       Version string for the package (e.g., 1.0.0)
  --force                           Overwrite existing output file without versioning
  --skip-validation                 Skip validation entirely
  --warn-on-invalid                 Validate but continue packaging on errors

${colors.green}Analyze Options:${colors.reset}
  <input>                           Input file (OpenAPI, JSON Schema)
  --output <file>                   Output DRAFT RIPP packet file (required)
  --packet-id <id>                  Packet ID for generated RIPP (default: analyzed)
  --target-level <1|2|3>            Target RIPP level (default: 1)

${colors.green}Examples:${colors.reset}
  ripp init
  ripp init --force
  ripp migrate
  ripp migrate --dry-run
  ripp validate my-feature.ripp.yaml
  ripp validate ripp/intent/
  ripp validate ripp/intent/ --min-level 2
  ripp lint ripp/intent/
  ripp lint ripp/intent/ --strict
  ripp package --in feature.ripp.yaml --out handoff.md
  ripp package --in feature.ripp.yaml --out handoff.md --package-version 1.0.0
  ripp package --in feature.ripp.yaml --out handoff.md --force
  ripp package --in feature.ripp.yaml --out handoff.md --warn-on-invalid
  ripp package --in feature.ripp.yaml --out packaged.json --format json
  ripp analyze openapi.json --output draft-api.ripp.yaml
  ripp analyze openapi.json --output draft.ripp.yaml --target-level 2
  ripp analyze schema.json --output draft.ripp.yaml --packet-id my-api

${colors.blue}Intent Discovery Examples:${colors.reset}
  ripp evidence build
  RIPP_AI_ENABLED=true ripp discover --target-level 2
  ripp confirm --interactive
  ripp confirm --checklist
  ripp build
  ripp build --from-checklist
  ripp build --from-checklist --packet-id my-feature --title "My Feature"

${colors.gray}Note: Legacy paths (features/, handoffs/, packages/) are supported for backward compatibility.${colors.reset}

${colors.green}Exit Codes:${colors.reset}
  0                                 All checks passed
  1                                 Validation or lint failures found

${colors.gray}Learn more: https://dylan-natter.github.io/ripp-protocol${colors.reset}
`);
}

function showVersion() {
  const pkg = require('./package.json');
  console.log(`ripp-cli v${pkg.version}`);
}

/**
 * Apply a version string to a file path
 * Examples:
 *   applyVersionToPath('handoff.zip', '1.0.0') => 'handoff-v1.0.0.zip'
 *   applyVersionToPath('handoff.md', '2.1.0') => 'handoff-v2.1.0.md'
 */
function applyVersionToPath(filePath, version) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);

  // Remove existing version suffix if present
  const cleanBase = base.replace(/-v\d+(\.\d+)*$/, '');

  // Add version prefix if not already present
  const versionStr = version.startsWith('v') ? version : `v${version}`;

  const newBase = `${cleanBase}-${versionStr}${ext}`;
  return path.join(dir, newBase);
}

/**
 * Get the next auto-increment version path
 * Examples:
 *   handoff.zip exists => handoff-v2.zip
 *   handoff-v2.zip exists => handoff-v3.zip
 */
function getNextVersionPath(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);

  // Remove existing version suffix if present
  const cleanBase = base.replace(/-v\d+$/, '');

  let version = 2; // Start with v2 since v1 is the existing file
  let newPath;

  do {
    newPath = path.join(dir, `${cleanBase}-v${version}${ext}`);
    version++;
  } while (fs.existsSync(newPath));

  return newPath;
}

/**
 * Get git information from the current repository
 * Returns null if not in a git repo or git is not available
 */
function getGitInfo() {
  try {
    // Check if we're in a git repo
    execSync('git rev-parse --git-dir', { stdio: 'pipe' });

    const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

    return {
      commit,
      branch
    };
  } catch (error) {
    // Not in a git repo or git not available
    return null;
  }
}

async function handleMigrateCommand(args) {
  const dryRun = args.includes('--dry-run');

  console.log(`${colors.blue}RIPP Directory Migration${colors.reset}\n`);
  console.log('This will update your RIPP directory structure to the new layout:\n');
  console.log(
    `  ${colors.gray}ripp/features/  ${colors.reset}→ ${colors.green}ripp/intent/${colors.reset}`
  );
  console.log(
    `  ${colors.gray}ripp/handoffs/  ${colors.reset}→ ${colors.green}ripp/output/handoffs/${colors.reset}`
  );
  console.log(
    `  ${colors.gray}ripp/packages/  ${colors.reset}→ ${colors.green}ripp/output/packages/${colors.reset}\n`
  );

  if (dryRun) {
    console.log(`${colors.yellow}ℹ DRY RUN MODE: No files will be moved${colors.reset}\n`);
  }

  try {
    const results = migrateDirectoryStructure({ dryRun });

    // Print moved directories
    if (results.moved.length > 0) {
      console.log(`${colors.green}✓ ${dryRun ? 'Would move' : 'Moved'}:${colors.reset}`);
      results.moved.forEach(msg => {
        console.log(`  ${colors.green}→${colors.reset} ${msg}`);
      });
      console.log('');
    }

    // Print created directories
    if (results.created.length > 0) {
      console.log(`${colors.green}✓ ${dryRun ? 'Would create' : 'Created'}:${colors.reset}`);
      results.created.forEach(msg => {
        console.log(`  ${colors.green}+${colors.reset} ${msg}`);
      });
      console.log('');
    }

    // Print skipped
    if (results.skipped.length > 0) {
      console.log(`${colors.blue}ℹ Info:${colors.reset}`);
      results.skipped.forEach(msg => {
        console.log(`  ${colors.blue}•${colors.reset} ${msg}`);
      });
      console.log('');
    }

    // Print warnings
    if (results.warnings.length > 0) {
      console.log(`${colors.yellow}⚠ Warnings:${colors.reset}`);
      results.warnings.forEach(msg => {
        console.log(`  ${colors.yellow}!${colors.reset} ${msg}`);
      });
      console.log('');
    }

    // Final summary
    if (results.warnings.length > 0) {
      log(
        colors.yellow,
        '⚠',
        'Migration completed with warnings. Please review conflicts manually.'
      );
      console.log('');
      process.exit(0);
    } else if (results.moved.length > 0 || results.created.length > 0) {
      if (dryRun) {
        log(colors.blue, 'ℹ', 'Dry run complete. Run without --dry-run to apply changes.');
      } else {
        log(colors.green, '✓', 'Migration complete!');
        console.log('');
        console.log(`${colors.blue}Next steps:${colors.reset}`);
        console.log('  1. Update your package.json scripts to use new paths');
        console.log('  2. Update any documentation referencing old paths');
        console.log('  3. Commit the changes to your repository');
      }
      console.log('');
      process.exit(0);
    } else {
      log(colors.green, '✓', 'Already using new directory structure. No migration needed.');
      console.log('');
      process.exit(0);
    }
  } catch (error) {
    console.error(`${colors.red}Migration failed: ${error.message}${colors.reset}`);
    if (error.stack) {
      console.error(`${colors.gray}${error.stack}${colors.reset}`);
    }
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    process.exit(0);
  }

  const command = args[0];

  if (command === 'init') {
    await handleInitCommand(args);
  } else if (command === 'migrate') {
    await handleMigrateCommand(args);
  } else if (command === 'validate') {
    await handleValidateCommand(args);
  } else if (command === 'lint') {
    await handleLintCommand(args);
  } else if (command === 'package') {
    await handlePackageCommand(args);
  } else if (command === 'analyze') {
    await handleAnalyzeCommand(args);
  } else if (command === 'evidence' && args[1] === 'build') {
    await handleEvidenceBuildCommand(args);
  } else if (command === 'discover') {
    await handleDiscoverCommand(args);
  } else if (command === 'confirm') {
    await handleConfirmCommand(args);
  } else if (command === 'build') {
    await handleBuildCommand(args);
  } else if (command === 'metrics') {
    await handleMetricsCommand(args);
  } else if (command === 'doctor') {
    handleDoctorCommand(args);
  } else {
    console.error(`${colors.red}Error: Unknown command '${command}'${colors.reset}`);
    console.error("Run 'ripp --help' for usage information.");
    process.exit(1);
  }
}

async function handleInitCommand(args) {
  const options = {
    force: args.includes('--force')
  };

  console.log(`${colors.blue}Initializing RIPP in repository...${colors.reset}\n`);

  try {
    const results = initRepository(options);

    // Print created files
    if (results.created.length > 0) {
      console.log(`${colors.green}✓ Created:${colors.reset}`);
      results.created.forEach(file => {
        console.log(`  ${colors.green}+${colors.reset} ${file}`);
      });
      console.log('');
    }

    // Print skipped files
    if (results.skipped.length > 0) {
      console.log(`${colors.yellow}ℹ Skipped:${colors.reset}`);
      results.skipped.forEach(file => {
        console.log(`  ${colors.yellow}•${colors.reset} ${file}`);
      });
      console.log('');
    }

    // Print errors
    if (results.errors.length > 0) {
      console.log(`${colors.red}✗ Errors:${colors.reset}`);
      results.errors.forEach(error => {
        console.log(`  ${colors.red}•${colors.reset} ${error}`);
      });
      console.log('');
    }

    // Final summary
    if (results.errors.length > 0) {
      log(colors.red, '✗', 'RIPP initialization completed with errors');
      process.exit(1);
    } else {
      log(colors.green, '✓', 'RIPP initialization complete!');
      console.log('');
      console.log(`${colors.blue}Next steps:${colors.reset}`);
      console.log('  1. Add this script to your package.json:');
      console.log('');
      console.log('     "scripts": {');
      console.log('       "ripp:validate": "ripp validate ripp/intent/"');
      console.log('     }');
      console.log('');
      console.log('  2. Create your first RIPP packet in ripp/intent/');
      console.log('  3. Validate it: npm run ripp:validate');
      console.log('  4. Commit the changes to your repository');
      console.log('');
      console.log(
        `${colors.gray}Learn more: https://dylan-natter.github.io/ripp-protocol${colors.reset}`
      );
      console.log('');
      process.exit(0);
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

async function handleValidateCommand(args) {
  const pathArg = args[1];

  if (!pathArg) {
    console.error(`${colors.red}Error: Path argument required${colors.reset}`);
    console.error('Usage: ripp validate <path>');
    process.exit(1);
  }

  // Parse options
  const options = {
    minLevel: null,
    quiet: args.includes('--quiet'),
    verbose: args.includes('--verbose')
  };

  const minLevelIndex = args.indexOf('--min-level');
  if (minLevelIndex !== -1 && args[minLevelIndex + 1]) {
    options.minLevel = parseInt(args[minLevelIndex + 1]);
    if (![1, 2, 3].includes(options.minLevel)) {
      console.error(`${colors.red}Error: --min-level must be 1, 2, or 3${colors.reset}`);
      process.exit(1);
    }
  }

  // Check if path exists
  if (!fs.existsSync(pathArg)) {
    console.error(`${colors.red}Error: Path not found: ${pathArg}${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.blue}Validating RIPP packets...${colors.reset}`);

  const schema = loadSchema();
  const files = await findRippFiles(pathArg);

  if (files.length === 0) {
    console.log(`${colors.yellow}No RIPP files found in ${pathArg}${colors.reset}`);
    process.exit(0);
  }

  const results = [];

  for (const file of files) {
    try {
      const packet = loadPacket(file);
      const result = validatePacket(packet, schema, file, options);
      results.push({
        file: path.relative(process.cwd(), file),
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings,
        level: result.level
      });
    } catch (error) {
      results.push({
        file: path.relative(process.cwd(), file),
        valid: false,
        errors: [error.message],
        warnings: [],
        level: null
      });
    }
  }

  printResults(results, options);

  const hasFailures = results.some(r => !r.valid);
  process.exit(hasFailures ? 1 : 0);
}

async function handleLintCommand(args) {
  const pathArg = args[1];

  if (!pathArg) {
    console.error(`${colors.red}Error: Path argument required${colors.reset}`);
    console.error('Usage: ripp lint <path>');
    process.exit(1);
  }

  // Parse options
  const options = {
    strict: args.includes('--strict'),
    outputDir: 'reports/'
  };

  const outputIndex = args.indexOf('--output');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    options.outputDir = args[outputIndex + 1];
  }

  // Ensure output directory ends with /
  if (!options.outputDir.endsWith('/')) {
    options.outputDir += '/';
  }

  // Check if path exists
  if (!fs.existsSync(pathArg)) {
    console.error(`${colors.red}Error: Path not found: ${pathArg}${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.blue}Linting RIPP packets...${colors.reset}`);

  const schema = loadSchema();
  const files = await findRippFiles(pathArg);

  if (files.length === 0) {
    console.log(`${colors.yellow}No RIPP files found in ${pathArg}${colors.reset}`);
    process.exit(0);
  }

  const results = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of files) {
    try {
      const packet = loadPacket(file);

      // First validate against schema
      const validation = validatePacket(packet, schema, file);

      if (!validation.valid) {
        // Skip linting if schema validation fails
        console.log(
          `${colors.yellow}⚠${colors.reset} ${path.relative(process.cwd(), file)} - Skipped (schema validation failed)`
        );
        continue;
      }

      // Run linter on valid packets
      const lintResult = lintPacket(packet, file);

      results.push({
        file: path.relative(process.cwd(), file),
        errors: lintResult.errors,
        warnings: lintResult.warnings,
        errorCount: lintResult.errorCount,
        warningCount: lintResult.warningCount
      });

      totalErrors += lintResult.errorCount;
      totalWarnings += lintResult.warningCount;

      // Print inline results
      if (lintResult.errorCount === 0 && lintResult.warningCount === 0) {
        log(colors.green, '✓', `${path.relative(process.cwd(), file)} - No issues`);
      } else {
        if (lintResult.errorCount > 0) {
          log(
            colors.red,
            '✗',
            `${path.relative(process.cwd(), file)} - ${lintResult.errorCount} error(s), ${lintResult.warningCount} warning(s)`
          );
        } else {
          log(
            colors.yellow,
            '⚠',
            `${path.relative(process.cwd(), file)} - ${lintResult.warningCount} warning(s)`
          );
        }
      }
    } catch (error) {
      console.log(
        `${colors.red}✗${colors.reset} ${path.relative(process.cwd(), file)} - Parse error: ${error.message}`
      );
    }
  }

  console.log('');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
  }

  // Write JSON report
  const jsonReport = generateJsonReport(results);
  const jsonPath = path.join(options.outputDir, 'lint.json');
  fs.writeFileSync(jsonPath, jsonReport);

  // Write Markdown report
  const mdReport = generateMarkdownReport(results);
  const mdPath = path.join(options.outputDir, 'lint.md');
  fs.writeFileSync(mdPath, mdReport);

  console.log('');

  // Summary
  if (totalErrors > 0) {
    log(colors.red, '✗', `Found ${totalErrors} error(s) and ${totalWarnings} warning(s)`);
  } else if (totalWarnings > 0) {
    log(colors.yellow, '⚠', `Found ${totalWarnings} warning(s)`);
  } else {
    log(colors.green, '✓', 'All packets passed linting checks');
  }

  console.log('');
  console.log(`${colors.blue}📊 Reports generated:${colors.reset}`);
  console.log(`  ${colors.gray}•${colors.reset} ${jsonPath} (machine-readable)`);
  console.log(`  ${colors.gray}•${colors.reset} ${mdPath} (human-readable)`);
  console.log('');
  console.log(`${colors.gray}View: cat ${mdPath}${colors.reset}`);

  console.log('');

  // Exit with appropriate code
  const hasFailures = totalErrors > 0 || (options.strict && totalWarnings > 0);
  process.exit(hasFailures ? 1 : 0);
}

async function handlePackageCommand(args) {
  // Parse options
  const options = {
    input: null,
    output: null,
    format: null,
    version: null,
    force: args.includes('--force'),
    skipValidation: args.includes('--skip-validation'),
    warnOnInvalid: args.includes('--warn-on-invalid')
  };

  const inIndex = args.indexOf('--in');
  if (inIndex !== -1 && args[inIndex + 1]) {
    options.input = args[inIndex + 1];
  }

  const outIndex = args.indexOf('--out');
  if (outIndex !== -1 && args[outIndex + 1]) {
    options.output = args[outIndex + 1];
  }

  const formatIndex = args.indexOf('--format');
  if (formatIndex !== -1 && args[formatIndex + 1]) {
    options.format = args[formatIndex + 1].toLowerCase();
  }

  const versionIndex = args.indexOf('--package-version');
  if (versionIndex !== -1 && args[versionIndex + 1]) {
    options.version = args[versionIndex + 1];
  }

  // Validate required options
  if (!options.input) {
    console.error(`${colors.red}Error: --in <file> is required${colors.reset}`);
    console.error('Usage: ripp package --in <file> --out <file>');
    process.exit(1);
  }

  if (!options.output) {
    console.error(`${colors.red}Error: --out <file> is required${colors.reset}`);
    console.error('Usage: ripp package --in <file> --out <file>');
    process.exit(1);
  }

  // Check if input exists
  if (!fs.existsSync(options.input)) {
    console.error(`${colors.red}Error: Input file not found: ${options.input}${colors.reset}`);
    process.exit(1);
  }

  // Auto-detect format from output extension if not specified
  if (!options.format) {
    const ext = path.extname(options.output).toLowerCase();
    if (ext === '.json') {
      options.format = 'json';
    } else if (ext === '.yaml' || ext === '.yml') {
      options.format = 'yaml';
    } else if (ext === '.md') {
      options.format = 'md';
    } else {
      console.error(
        `${colors.red}Error: Unable to detect format from extension. Use --format <json|yaml|md>${colors.reset}`
      );
      process.exit(1);
    }
  }

  // Validate format
  if (!['json', 'yaml', 'md'].includes(options.format)) {
    console.error(
      `${colors.red}Error: Invalid format '${options.format}'. Must be json, yaml, or md${colors.reset}`
    );
    process.exit(1);
  }

  console.log(`${colors.blue}Packaging RIPP packet...${colors.reset}`);

  try {
    // Load the packet
    const packet = loadPacket(options.input);
    const schema = loadSchema();

    // Validation handling
    let validation = { valid: true, errors: [], warnings: [] };
    let validationStatus = 'unvalidated';

    if (!options.skipValidation) {
      validation = validatePacket(packet, schema, options.input);

      if (!validation.valid) {
        validationStatus = 'invalid';

        if (options.warnOnInvalid) {
          // Warn but continue
          console.log(
            `${colors.yellow}⚠ Warning: Input packet has validation errors${colors.reset}`
          );
          validation.errors.forEach(error => {
            console.log(`  ${colors.yellow}•${colors.reset} ${error}`);
          });
          console.log('');
        } else {
          // Fail on validation error (default behavior)
          console.error(`${colors.red}Error: Input packet failed validation${colors.reset}`);
          validation.errors.forEach(error => {
            console.error(`  ${colors.red}•${colors.reset} ${error}`);
          });
          console.log('');
          console.log(
            `${colors.blue}💡 Tip:${colors.reset} Use --warn-on-invalid to package anyway, or --skip-validation to skip validation`
          );
          process.exit(1);
        }
      } else {
        validationStatus = 'valid';
      }
    }

    // Determine final output path with versioning
    let finalOutputPath = options.output;

    if (!options.force && fs.existsSync(options.output)) {
      // File exists and --force not specified, apply versioning
      if (options.version) {
        // Explicit version provided
        finalOutputPath = applyVersionToPath(options.output, options.version);
      } else {
        // Auto-increment version
        finalOutputPath = getNextVersionPath(options.output);
      }

      console.log(
        `${colors.yellow}ℹ${colors.reset} Output file exists. Versioning applied: ${path.basename(finalOutputPath)}`
      );
      console.log('');
    } else if (options.version) {
      // Explicit version provided, use it even if file doesn't exist
      finalOutputPath = applyVersionToPath(options.output, options.version);
    }

    // Get git information if available
    const gitInfo = getGitInfo();

    // Package the packet with enhanced metadata
    const packaged = packagePacket(packet, {
      version: options.version,
      gitInfo,
      validationStatus,
      validationErrors: validation.errors.length,
      sourceFile: path.basename(options.input)
    });

    // Format according to requested format
    let output;
    if (options.format === 'json') {
      output = formatAsJson(packaged, { pretty: true });
    } else if (options.format === 'yaml') {
      output = formatAsYaml(packaged);
    } else if (options.format === 'md') {
      output = formatAsMarkdown(packaged);
    }

    // Write to output file
    fs.writeFileSync(finalOutputPath, output);

    log(colors.green, '✓', `Packaged successfully: ${finalOutputPath}`);
    console.log(`  ${colors.gray}Format: ${options.format}${colors.reset}`);
    console.log(`  ${colors.gray}Level: ${packet.level}${colors.reset}`);
    if (options.version) {
      console.log(`  ${colors.gray}Package Version: ${options.version}${colors.reset}`);
    }
    if (validationStatus !== 'valid') {
      console.log(`  ${colors.gray}Validation: ${validationStatus}${colors.reset}`);
    }
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

async function handleAnalyzeCommand(args) {
  const inputPath = args[1];

  // Parse options
  const options = {
    output: null,
    packetId: 'analyzed',
    targetLevel: 1 // Default to Level 1
  };

  const outputIndex = args.indexOf('--output');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    options.output = args[outputIndex + 1];
  }

  const packetIdIndex = args.indexOf('--packet-id');
  if (packetIdIndex !== -1 && args[packetIdIndex + 1]) {
    options.packetId = args[packetIdIndex + 1];
  }

  const targetLevelIndex = args.indexOf('--target-level');
  if (targetLevelIndex !== -1 && args[targetLevelIndex + 1]) {
    options.targetLevel = parseInt(args[targetLevelIndex + 1]);
    if (![1, 2, 3].includes(options.targetLevel)) {
      console.error(`${colors.red}Error: --target-level must be 1, 2, or 3${colors.reset}`);
      process.exit(1);
    }
  }

  // Validate required options
  if (!inputPath) {
    console.error(`${colors.red}Error: Input file argument required${colors.reset}`);
    console.error('Usage: ripp analyze <input> --output <file>');
    process.exit(1);
  }

  if (!options.output) {
    console.error(`${colors.red}Error: --output <file> is required${colors.reset}`);
    console.error('Usage: ripp analyze <input> --output <file>');
    process.exit(1);
  }

  // Check if input exists
  if (!fs.existsSync(inputPath)) {
    console.error(`${colors.red}Error: Input file not found: ${inputPath}${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.blue}Analyzing input...${colors.reset}`);
  console.log(
    `${colors.yellow}⚠${colors.reset} Generated packets are DRAFTS and require human review\n`
  );

  try {
    // Analyze the input
    const draftPacket = analyzeInput(inputPath, {
      packetId: options.packetId,
      targetLevel: options.targetLevel
    });

    // Auto-detect output format
    const ext = path.extname(options.output).toLowerCase();
    let output;

    if (ext === '.yaml' || ext === '.yml') {
      output = yaml.dump(draftPacket, { indent: 2, lineWidth: 100 });
    } else if (ext === '.json') {
      output = JSON.stringify(draftPacket, null, 2);
    } else {
      // Default to YAML
      output = yaml.dump(draftPacket, { indent: 2, lineWidth: 100 });
    }

    // Write to output file
    fs.writeFileSync(options.output, output);

    log(colors.green, '✓', `DRAFT packet generated: ${options.output}`);
    console.log(`  ${colors.gray}Status: draft (requires human review)${colors.reset}`);
    console.log(`  ${colors.gray}Level: ${draftPacket.level}${colors.reset}`);
    console.log('');

    console.log(`${colors.yellow}⚠ IMPORTANT:${colors.reset}`);
    console.log('  This is a DRAFT generated from observable code/schema facts.');
    console.log('  Review and refine all TODO items before use.');
    console.log('  Pay special attention to:');
    console.log('    - Purpose (problem, solution, value)');
    console.log('    - UX Flow (user-facing steps)');
    if (draftPacket.level >= 2) {
      console.log('    - Permissions and failure modes');
    }
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);

    // Provide better error messages for unsupported formats
    if (error.message.includes('Failed to parse') || error.message.includes('Unsupported')) {
      console.log('');
      console.log(`${colors.blue}ℹ Supported formats:${colors.reset}`);
      console.log('  • OpenAPI/Swagger (.json, .yaml)');
      console.log('  • JSON Schema (.json)');
      console.log('');
    }

    process.exit(1);
  }
}

async function handleEvidenceBuildCommand() {
  const cwd = process.cwd();

  console.log(`${colors.blue}Building evidence pack...${colors.reset}\n`);

  try {
    const config = loadConfig(cwd);
    const result = await buildEvidencePack(cwd, config);

    log(colors.green, '✓', 'Evidence pack built successfully');
    console.log(`  ${colors.gray}Index: ${result.indexPath}${colors.reset}`);
    console.log(`  ${colors.gray}Files: ${result.index.stats.includedFiles}${colors.reset}`);
    console.log(
      `  ${colors.gray}Size: ${(result.index.stats.totalSize / 1024).toFixed(2)} KB${colors.reset}`
    );
    console.log('');

    console.log(`${colors.blue}Evidence Summary:${colors.reset}`);
    console.log(
      `  ${colors.gray}Dependencies: ${result.index.evidence.dependencies.length}${colors.reset}`
    );
    console.log(`  ${colors.gray}Routes: ${result.index.evidence.routes.length}${colors.reset}`);
    console.log(`  ${colors.gray}Schemas: ${result.index.evidence.schemas.length}${colors.reset}`);
    console.log(
      `  ${colors.gray}Auth Signals: ${result.index.evidence.auth.length}${colors.reset}`
    );
    console.log(
      `  ${colors.gray}Workflows: ${result.index.evidence.workflows.length}${colors.reset}`
    );
    console.log('');

    console.log(`${colors.yellow}⚠ Note:${colors.reset} Evidence pack contains code snippets.`);
    console.log('  Best-effort secret redaction applied, but review before sharing.');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

async function handleDiscoverCommand(args) {
  const cwd = process.cwd();

  // Parse options
  const options = {
    targetLevel: 1
  };

  const targetLevelIndex = args.indexOf('--target-level');
  if (targetLevelIndex !== -1 && args[targetLevelIndex + 1]) {
    options.targetLevel = parseInt(args[targetLevelIndex + 1]);
    if (![1, 2, 3].includes(options.targetLevel)) {
      console.error(`${colors.red}Error: --target-level must be 1, 2, or 3${colors.reset}`);
      process.exit(1);
    }
  }

  console.log(`${colors.blue}Discovering intent from evidence...${colors.reset}\n`);

  try {
    // Check AI is enabled
    const config = loadConfig(cwd);
    const aiCheck = checkAiEnabled(config);

    if (!aiCheck.enabled) {
      console.error(`${colors.red}Error: AI is not enabled${colors.reset}`);
      console.error(`  ${aiCheck.reason}`);
      console.log('');
      console.log(`${colors.blue}To enable AI:${colors.reset}`);
      console.log('  1. Set ai.enabled: true in .ripp/config.yaml');
      console.log('  2. Set RIPP_AI_ENABLED=true environment variable');
      console.log('  3. Set provider API key (e.g., OPENAI_API_KEY)');
      console.log('');
      process.exit(1);
    }

    console.log(`${colors.gray}AI Provider: ${config.ai.provider}${colors.reset}`);
    console.log(`${colors.gray}Model: ${config.ai.model}${colors.reset}`);
    console.log(`${colors.gray}Target Level: ${options.targetLevel}${colors.reset}`);
    console.log('');

    const result = await discoverIntent(cwd, options);

    log(colors.green, '✓', 'Intent discovery complete');
    console.log(`  ${colors.gray}Candidates: ${result.totalCandidates}${colors.reset}`);
    console.log(`  ${colors.gray}Output: ${result.candidatesPath}${colors.reset}`);
    console.log('');

    console.log(`${colors.yellow}⚠ IMPORTANT:${colors.reset}`);
    console.log('  All candidates are INFERRED and require human confirmation.');
    console.log('  Run "ripp confirm" to review and approve candidates.');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

async function handleConfirmCommand(args) {
  const cwd = process.cwd();

  // Parse options
  const options = {
    interactive: !args.includes('--checklist'),
    user: null
  };

  const userIndex = args.indexOf('--user');
  if (userIndex !== -1 && args[userIndex + 1]) {
    options.user = args[userIndex + 1];
  }

  console.log(`${colors.blue}Confirming candidate intent...${colors.reset}\n`);

  try {
    const result = await confirmIntent(cwd, options);

    if (result.checklistPath) {
      log(colors.green, '✓', `Checklist generated: ${result.checklistPath}`);
      console.log('');
      console.log(`${colors.blue}Next steps:${colors.reset}`);
      console.log('  1. Review and edit the checklist');
      console.log('  2. Mark accepted candidates with [x]');
      console.log('  3. Save the file');
      console.log('  4. Run "ripp build --from-checklist" to compile confirmed intent');
      console.log('');
    } else {
      log(colors.green, '✓', 'Intent confirmation complete');
      console.log(`  ${colors.gray}Confirmed: ${result.confirmedCount}${colors.reset}`);
      console.log(`  ${colors.gray}Rejected: ${result.rejectedCount}${colors.reset}`);
      console.log(`  ${colors.gray}Output: ${result.confirmedPath}${colors.reset}`);
      console.log('');

      if (result.confirmedCount > 0) {
        console.log(`${colors.blue}Next steps:${colors.reset}`);
        console.log('  Run "ripp build" to compile canonical RIPP artifacts');
        console.log('');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

async function handleBuildCommand(args) {
  const cwd = process.cwd();

  // Parse options
  const options = {
    packetId: null,
    title: null,
    outputName: null,
    fromChecklist: args.includes('--from-checklist')
  };

  const packetIdIndex = args.indexOf('--packet-id');
  if (packetIdIndex !== -1 && args[packetIdIndex + 1]) {
    options.packetId = args[packetIdIndex + 1];
  }

  const titleIndex = args.indexOf('--title');
  if (titleIndex !== -1 && args[titleIndex + 1]) {
    options.title = args[titleIndex + 1];
  }

  const outputNameIndex = args.indexOf('--output-name');
  if (outputNameIndex !== -1 && args[outputNameIndex + 1]) {
    options.outputName = args[outputNameIndex + 1];
  }

  const userIndex = args.indexOf('--user');
  if (userIndex !== -1 && args[userIndex + 1]) {
    options.user = args[userIndex + 1];
  }

  if (options.fromChecklist) {
    console.log(`${colors.blue}Building from checklist...${colors.reset}\n`);
  } else {
    console.log(`${colors.blue}Building canonical RIPP artifacts...${colors.reset}\n`);
  }

  try {
    const result = buildCanonicalArtifacts(cwd, options);

    // Display summary of checklist processing if applicable
    if (options.fromChecklist && options._validationResults) {
      const vr = options._validationResults;
      console.log(`${colors.blue}Checklist Summary:${colors.reset}`);
      console.log(`  ${colors.gray}Total checked: ${vr.totalChecked}${colors.reset}`);
      console.log(`  ${colors.green}✓ Accepted: ${vr.accepted}${colors.reset}`);
      if (vr.rejected > 0) {
        console.log(`  ${colors.yellow}⚠ Rejected: ${vr.rejected}${colors.reset}`);
      }
      console.log('');
    }

    log(colors.green, '✓', 'Build complete');
    console.log(`  ${colors.gray}RIPP Packet: ${result.packetPath}${colors.reset}`);
    console.log(`  ${colors.gray}Handoff MD: ${result.markdownPath}${colors.reset}`);
    console.log(`  ${colors.gray}Level: ${result.level}${colors.reset}`);
    console.log('');

    console.log(`${colors.blue}Next steps:${colors.reset}`);
    console.log('  1. Review generated artifacts');
    console.log('  2. Run "ripp validate .ripp/" to validate');
    console.log('  3. Run "ripp package" to create handoff.zip');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    if (options.fromChecklist) {
      console.log('');
      console.log(`${colors.blue}Troubleshooting:${colors.reset}`);
      console.log('  1. Verify checklist file exists: .ripp/intent.checklist.md');
      console.log('  2. Ensure at least one candidate is marked with [x]');
      console.log('  3. Check YAML blocks for syntax errors');
      console.log('  4. Run "ripp confirm --checklist" to regenerate checklist');
    }
    console.log('');
    process.exit(1);
  }
}

async function handleMetricsCommand(args) {
  const cwd = process.cwd();
  const rippDir = path.join(cwd, '.ripp');

  // Parse options
  const options = {
    report: args.includes('--report'),
    history: args.includes('--history')
  };

  // Check if .ripp directory exists
  if (!fs.existsSync(rippDir)) {
    console.error(`${colors.red}Error: RIPP directory not found${colors.reset}`);
    console.error('Run "ripp init" to initialize RIPP in this repository');
    process.exit(1);
  }

  try {
    if (options.history) {
      // Show metrics history
      const history = loadMetricsHistory(rippDir);
      console.log(formatMetricsHistory(history));
      process.exit(0);
    }

    // Gather current metrics
    const metrics = gatherMetrics(rippDir);

    // Display metrics
    console.log(formatMetricsText(metrics));

    // Write report if requested
    if (options.report) {
      const reportPath = path.join(rippDir, 'metrics.json');
      fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2), 'utf8');

      // Save to history
      saveMetricsHistory(rippDir, metrics);

      console.log('');
      log(colors.green, '✓', `Metrics report saved to ${reportPath}`);
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

function handleDoctorCommand(args) {
  const cwd = process.cwd();

  console.log(`${colors.blue}Running RIPP health checks...${colors.reset}`);
  console.log('');

  try {
    const results = runHealthChecks(cwd);
    console.log(formatHealthCheckText(results));

    // Exit with non-zero if there are critical failures
    const hasCriticalFailures = Object.values(results.checks).some(
      check => check.status === 'fail'
    );

    process.exit(hasCriticalFailures ? 1 : 0);
  } catch (error) {
    console.error(`${colors.red}Error running health checks: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
