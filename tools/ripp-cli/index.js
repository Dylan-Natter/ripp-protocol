#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { glob } = require('glob');
const { lintPacket, generateJsonReport, generateMarkdownReport } = require('./lib/linter');
const { packagePacket, formatAsJson, formatAsYaml, formatAsMarkdown } = require('./lib/packager');
const { analyzeInput } = require('./lib/analyzer');
const { initRepository } = require('./lib/init');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

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
  if (results.length > 3 && !options.verbose) {
    console.log('┌──────────────────────────────────────────┬───────┬────────┬────────┐');
    console.log('│ File                                     │ Level │ Status │ Issues │');
    console.log('├──────────────────────────────────────────┼───────┼────────┼────────┤');
    
    results.forEach(result => {
      const fileName = result.file.length > 40 ? '...' + result.file.slice(-37) : result.file;
      const paddedFile = fileName.padEnd(40);
      const level = result.level ? result.level.toString().padEnd(5) : 'N/A  ';
      const status = result.valid ? '✓     ' : '✗     ';
      const statusColor = result.valid ? colors.green : colors.red;
      const issues = result.errors.length.toString().padEnd(6);
      
      console.log(`│ ${paddedFile} │ ${level} │ ${statusColor}${status}${colors.reset} │ ${issues} │`);
      
      if (result.valid) {
        totalValid++;
      } else {
        totalInvalid++;
      }
    });
    
    console.log('└──────────────────────────────────────────┴───────┴────────┴────────┘');
    console.log('');
    
    if (totalInvalid > 0) {
      log(colors.red, '✗', `${totalInvalid} of ${results.length} failed. Run with --verbose for details.`);
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
        console.log(`  ${colors.blue}💡 Tip:${colors.reset} Use level: 1 for basic contracts, or add missing sections for Level ${info.level}`);
        console.log(`  ${colors.blue}📖 Docs:${colors.reset} https://dylan-natter.github.io/ripp-protocol/ripp-levels.html`);
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
  ripp validate <path>              Validate RIPP packets
  ripp lint <path>                  Lint RIPP packets for best practices
  ripp package --in <file> --out <file>
                                    Package RIPP packet into normalized artifact
  ripp analyze <input> --output <file>
                                    Analyze code/schema and generate DRAFT RIPP packet
  ripp --help                       Show this help message
  ripp --version                    Show version

${colors.green}Init Options:${colors.reset}
  --force                           Overwrite existing files

${colors.green}Validate Options:${colors.reset}
  --min-level <1|2|3>               Enforce minimum RIPP level
  --quiet                           Suppress warnings

${colors.green}Lint Options:${colors.reset}
  --strict                          Treat warnings as errors
  --output <dir>                    Output directory for reports (default: reports/)

${colors.green}Package Options:${colors.reset}
  --in <file>                       Input RIPP packet file (required)
  --out <file>                      Output file path (required)
  --format <json|yaml|md>           Output format (auto-detected from extension)

${colors.green}Analyze Options:${colors.reset}
  <input>                           Input file (OpenAPI, JSON Schema)
  --output <file>                   Output DRAFT RIPP packet file (required)
  --packet-id <id>                  Packet ID for generated RIPP (default: analyzed)
  --target-level <1|2|3>            Target RIPP level (default: 1)

${colors.green}Examples:${colors.reset}
  ripp init
  ripp init --force
  ripp validate my-feature.ripp.yaml
  ripp validate features/
  ripp validate api/ --min-level 2
  ripp lint examples/
  ripp lint examples/ --strict
  ripp package --in feature.ripp.yaml --out handoff.md
  ripp package --in feature.ripp.yaml --out packaged.json --format json
  ripp analyze openapi.json --output draft-api.ripp.yaml
  ripp analyze openapi.json --output draft.ripp.yaml --target-level 2
  ripp analyze schema.json --output draft.ripp.yaml --packet-id my-api

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
  } else if (command === 'validate') {
    await handleValidateCommand(args);
  } else if (command === 'lint') {
    await handleLintCommand(args);
  } else if (command === 'package') {
    await handlePackageCommand(args);
  } else if (command === 'analyze') {
    await handleAnalyzeCommand(args);
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
      console.log('       "ripp:validate": "ripp validate ripp/features/"');
      console.log('     }');
      console.log('');
      console.log('  2. Create your first RIPP packet in ripp/features/');
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
    format: null
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
    // Load and validate the packet
    const packet = loadPacket(options.input);
    const schema = loadSchema();
    const validation = validatePacket(packet, schema, options.input);

    if (!validation.valid) {
      console.error(`${colors.red}Error: Input packet failed validation${colors.reset}`);
      validation.errors.forEach(error => {
        console.error(`  ${colors.red}•${colors.reset} ${error}`);
      });
      process.exit(1);
    }

    // Package the packet
    const packaged = packagePacket(packet);

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
    fs.writeFileSync(options.output, output);

    log(colors.green, '✓', `Packaged successfully: ${options.output}`);
    console.log(`  ${colors.gray}Format: ${options.format}${colors.reset}`);
    console.log(`  ${colors.gray}Level: ${packet.level}${colors.reset}`);
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
    targetLevel: 1  // Default to Level 1
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

main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
