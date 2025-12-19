const fs = require('fs');
const path = require('path');

/**
 * Migrate RIPP directory structure from legacy to new layout
 *
 * Legacy structure:
 *   ripp/features/     → ripp/intent/
 *   ripp/handoffs/     → ripp/output/handoffs/
 *   ripp/packages/     → ripp/output/packages/
 *
 * New structure:
 *   ripp/intent/                 (human-authored intent)
 *   ripp/output/handoffs/        (finalized packets)
 *   ripp/output/packages/        (generated outputs)
 */
function migrateDirectoryStructure({ dryRun = false } = {}) {
  const cwd = process.cwd();
  const results = {
    moved: [],
    created: [],
    skipped: [],
    warnings: []
  };

  console.log('🔍 Scanning for legacy RIPP directories...\n');

  const rippDir = path.join(cwd, 'ripp');
  if (!fs.existsSync(rippDir)) {
    results.warnings.push('No ripp/ directory found. Run "ripp init" first.');
    return results;
  }

  // Check legacy directories
  const legacyFeatures = path.join(rippDir, 'features');
  const legacyHandoffs = path.join(rippDir, 'handoffs');
  const legacyPackages = path.join(rippDir, 'packages');

  // New directories
  const newIntent = path.join(rippDir, 'intent');
  const newOutput = path.join(rippDir, 'output');
  const newHandoffs = path.join(newOutput, 'handoffs');
  const newPackages = path.join(newOutput, 'packages');

  let hasLegacy = false;

  /**
   * Safely move directory with cross-device support
   */
  function safeMove(source, dest, description) {
    try {
      // Try rename first (faster, atomic)
      fs.renameSync(source, dest);
      results.moved.push(`Moved: ${description}`);
    } catch (error) {
      // If rename fails (cross-device), use copy+remove
      if (error.code === 'EXDEV') {
        fs.cpSync(source, dest, { recursive: true });
        fs.rmSync(source, { recursive: true });
        results.moved.push(`Moved: ${description}`);
      } else {
        throw error;
      }
    }
  }

  // 1. Migrate features/ → intent/
  if (fs.existsSync(legacyFeatures)) {
    hasLegacy = true;
    if (fs.existsSync(newIntent)) {
      results.warnings.push('Both ripp/features/ and ripp/intent/ exist. Manual merge required.');
    } else {
      if (dryRun) {
        results.moved.push('Would move: ripp/features/ → ripp/intent/');
      } else {
        safeMove(legacyFeatures, newIntent, 'ripp/features/ → ripp/intent/');
      }
    }
  }

  // 2. Create output/ directory if needed
  if (fs.existsSync(legacyHandoffs) || fs.existsSync(legacyPackages)) {
    hasLegacy = true;
    if (!fs.existsSync(newOutput)) {
      if (dryRun) {
        results.created.push('Would create: ripp/output/');
      } else {
        fs.mkdirSync(newOutput, { recursive: true });
        results.created.push('Created: ripp/output/');
      }
    }
  }

  // 3. Migrate handoffs/ → output/handoffs/
  if (fs.existsSync(legacyHandoffs)) {
    if (fs.existsSync(newHandoffs)) {
      results.warnings.push(
        'Both ripp/handoffs/ and ripp/output/handoffs/ exist. Manual merge required.'
      );
    } else {
      if (dryRun) {
        results.moved.push('Would move: ripp/handoffs/ → ripp/output/handoffs/');
      } else {
        safeMove(legacyHandoffs, newHandoffs, 'ripp/handoffs/ → ripp/output/handoffs/');
      }
    }
  }

  // 4. Migrate packages/ → output/packages/
  if (fs.existsSync(legacyPackages)) {
    if (fs.existsSync(newPackages)) {
      results.warnings.push(
        'Both ripp/packages/ and ripp/output/packages/ exist. Manual merge required.'
      );
    } else {
      if (dryRun) {
        results.moved.push('Would move: ripp/packages/ → ripp/output/packages/');
      } else {
        safeMove(legacyPackages, newPackages, 'ripp/packages/ → ripp/output/packages/');
        results.moved.push('Moved: ripp/packages/ → ripp/output/packages/');
      }
    }
  }

  if (!hasLegacy) {
    results.skipped.push('No legacy directories found. Already using new structure!');
  }

  return results;
}

/**
 * Detect if repository uses legacy directory structure
 */
function detectLegacyStructure(cwd = process.cwd()) {
  const rippDir = path.join(cwd, 'ripp');

  if (!fs.existsSync(rippDir)) {
    return { hasLegacy: false, directories: [] };
  }

  const legacyDirs = [];

  const legacyFeatures = path.join(rippDir, 'features');
  const legacyHandoffs = path.join(rippDir, 'handoffs');
  const legacyPackages = path.join(rippDir, 'packages');

  if (fs.existsSync(legacyFeatures)) {
    legacyDirs.push('ripp/features/');
  }
  if (fs.existsSync(legacyHandoffs)) {
    legacyDirs.push('ripp/handoffs/');
  }
  if (fs.existsSync(legacyPackages)) {
    legacyDirs.push('ripp/packages/');
  }

  return {
    hasLegacy: legacyDirs.length > 0,
    directories: legacyDirs
  };
}

/**
 * Get search paths supporting both legacy and new structures
 * Returns an array of paths to search for RIPP packets
 */
function getSearchPaths(basePath, cwd = process.cwd()) {
  const paths = [];

  // Normalize base path - handle both with and without 'ripp/' prefix
  let normalized = basePath;
  if (normalized.startsWith('ripp/')) {
    normalized = normalized.replace(/^ripp\//, '');
  }

  // Map of legacy → new paths
  const pathMappings = {
    features: ['intent', 'features'],
    intent: ['intent', 'features'],
    handoffs: ['output/handoffs', 'handoffs'],
    'output/handoffs': ['output/handoffs', 'handoffs'],
    packages: ['output/packages', 'packages'],
    'output/packages': ['output/packages', 'packages']
  };

  const mappings = pathMappings[normalized] || [normalized];

  for (const mapping of mappings) {
    const fullPath = path.join(cwd, 'ripp', mapping);
    if (fs.existsSync(fullPath)) {
      paths.push(fullPath);
    }
  }

  return paths;
}

module.exports = {
  migrateDirectoryStructure,
  detectLegacyStructure,
  getSearchPaths
};
