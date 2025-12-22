# RIPP Directory Structure Migration Guide

This guide helps you migrate from the legacy RIPP directory structure to the new, clearer layout introduced in v1.1.

## TL;DR

```bash
# Preview changes
ripp migrate --dry-run

# Apply migration
ripp migrate
```

## What Changed

### Directory Renaming

| Legacy Path      | New Path                | Purpose                           |
| ---------------- | ----------------------- | --------------------------------- |
| `ripp/features/` | `ripp/intent/`          | Human-authored intent (source)    |
| `ripp/handoffs/` | `ripp/output/handoffs/` | Validated packets (ready to ship) |
| `ripp/packages/` | `ripp/output/packages/` | Generated deliverables            |

### Why the Change?

**Old structure issues:**

- "features" was ambiguous (feature flags? feature branches?)
- Flat structure didn't distinguish source from generated
- "artifacts" terminology was confusing

**New structure benefits:**

- "intent" aligns with RIPP's core philosophy
- `output/` clearly groups generated content
- Self-documenting directory names
- Easier to exclude generated files in CI/backup/search

## Migration Steps

### Step 1: Check Current Structure

```bash
# See what legacy directories exist
ls -la ripp/
```

If you see `features/`, `handoffs/`, or `packages/` at the root level of `ripp/`, you're using the legacy structure.

### Step 2: Preview Migration

```bash
ripp migrate --dry-run
```

This shows what would happen without making changes. Example output:

```
✓ Would move:
  → Would move: ripp/features/ → ripp/intent/
  → Would move: ripp/handoffs/ → ripp/output/handoffs/
  → Would move: ripp/packages/ → ripp/output/packages/

✓ Would create:
  + Would create: ripp/output/
```

### Step 3: Apply Migration

```bash
ripp migrate
```

The migration tool will:

1. Rename `features/` → `intent/`
2. Create `output/` directory
3. Move `handoffs/` → `output/handoffs/`
4. Move `packages/` → `output/packages/`

**All file contents remain unchanged.** Only directories are moved.

### Step 4: Update Your Scripts

Update `package.json` scripts to use new paths:

**Before:**

```json
{
  "scripts": {
    "ripp:validate": "ripp validate ripp/features/",
    "ripp:package": "ripp package --in ripp/handoffs/my-feature.ripp.yaml --out ripp/packages/handoff.md"
  }
}
```

**After:**

```json
{
  "scripts": {
    "ripp:validate": "ripp validate ripp/intent/",
    "ripp:package": "ripp package --in ripp/output/handoffs/my-feature.ripp.yaml --out ripp/output/packages/handoff.md"
  }
}
```

### Step 5: Update Documentation

Search your project documentation for references to:

- `ripp/features/` → change to `ripp/intent/`
- `ripp/handoffs/` → change to `ripp/output/handoffs/`
- `ripp/packages/` → change to `ripp/output/packages/`

### Step 6: Commit Changes

```bash
git add ripp/
git commit -m "Migrate to new RIPP directory structure"
```

## Backward Compatibility

**The CLI still recognizes old paths.** You can continue using:

```bash
# Still works
ripp validate ripp/features/

# New way (recommended)
ripp validate ripp/intent/
```

However, you'll see warnings:

```
⚠ Warning: ripp/features/ is a legacy path. Use 'ripp migrate' to update.
```

## Conflict Resolution

### If Migration Detects Conflicts

If both old and new directories exist, the migration tool will warn you:

```
⚠ Warnings:
  ! Both ripp/features/ and ripp/intent/ exist. Manual merge required.
```

**Manual steps:**

1. Review contents of both directories
2. Merge manually: `cp -r ripp/features/* ripp/intent/`
3. Remove old directory: `rm -rf ripp/features/`
4. Run `ripp migrate` again

## Common Questions

### Do I need to migrate immediately?

No. The CLI maintains backward compatibility. Migrate when convenient.

### Will this break my CI/CD?

Not if you update your scripts (Step 4 above). The CLI itself still accepts old paths.

### What about my existing RIPP packets?

They remain unchanged. Only directory names change, not file contents or formats.

### Can I keep using old paths?

Yes, but:

- You'll see warnings
- New features may prioritize new paths
- Documentation assumes new structure

### What if I have custom tooling?

Update any scripts/tools that reference:

- `ripp/features/`
- `ripp/handoffs/`
- `ripp/packages/`

### Does this change the schema?

No. Packet format, validation rules, and schema are unchanged.

## Rollback

If you need to revert:

```bash
# Manual rollback
mv ripp/intent ripp/features
mv ripp/output/handoffs ripp/handoffs
mv ripp/output/packages ripp/packages
rmdir ripp/output
```

## New Projects

If you're starting a new project, run `ripp init` to create the new structure from the start:

```bash
ripp init
```

This creates:

```
ripp/
├── intent/                # Human-authored intent
├── output/
│   ├── handoffs/          # Validated packets
│   └── packages/          # Generated deliverables
└── README.md
```

## Support

- **Documentation**: [Directory Layout Guide]({{ '/directory-layout' | relative_url }})
- **Issues**: [GitHub Issues](https://github.com/Dylan-Natter/ripp-protocol/issues)
- **CLI Help**: `ripp migrate --help`

---

**Remember**: Migration is safe, backward-compatible, and reversible. The tool creates no new files—it only moves directories.
