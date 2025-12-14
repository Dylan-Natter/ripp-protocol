#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { glob } = require('glob');

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
  
  // Schema validation errors
  if (!valid) {
    validate.errors.forEach(error => {
      const field = error.instancePath || 'root';
      const message = error.message;
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
    errors.push(`Packet is Level ${packet.level}, but minimum Level ${options.minLevel} is required`);
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
  
  results.forEach(result => {
    if (result.valid) {
      totalValid++;
      log(colors.green, '✓', `${result.file} is valid (Level ${result.level})`);
    } else {
      totalInvalid++;
      log(colors.red, '✗', result.file);
      result.errors.forEach(error => {
        console.log(`  ${colors.red}•${colors.reset} ${error}`);
      });
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
${colors.blue}RIPP CLI Validator v${pkg.version}${colors.reset}

${colors.green}Usage:${colors.reset}
  ripp validate <path>              Validate RIPP packets
  ripp validate <path> --min-level <1|2|3>
                                    Enforce minimum conformance level
  ripp --help                       Show this help message
  ripp --version                    Show version

${colors.green}Arguments:${colors.reset}
  <path>                            File or directory to validate

${colors.green}Options:${colors.reset}
  --min-level <1|2|3>               Enforce minimum RIPP level
  --quiet                           Suppress warnings
  --help                            Show help
  --version                         Show version

${colors.green}Examples:${colors.reset}
  ripp validate my-feature.ripp.yaml
  ripp validate features/
  ripp validate api/ --min-level 2

${colors.green}Exit Codes:${colors.reset}
  0                                 All packets valid
  1                                 Validation failures found

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
  
  if (command !== 'validate') {
    console.error(`${colors.red}Error: Unknown command '${command}'${colors.reset}`);
    console.error('Run \'ripp --help\' for usage information.');
    process.exit(1);
  }
  
  const pathArg = args[1];
  
  if (!pathArg) {
    console.error(`${colors.red}Error: Path argument required${colors.reset}`);
    console.error('Usage: ripp validate <path>');
    process.exit(1);
  }
  
  // Parse options
  const options = {
    minLevel: null,
    quiet: args.includes('--quiet')
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

main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
