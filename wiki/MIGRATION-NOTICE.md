# Wiki Content Migration Notice

**⚠️ This directory is deprecated.**

## New Location

Wiki content has been moved to the canonical location:

**`/docs/wiki/`**

## Why the Change?

As part of the documentation governance enforcement system, all wiki content now lives in `/docs/wiki/` to ensure:

- Documentation is versioned with code
- Changes go through PR review
- No silent drift between repo and wiki
- Automated publishing to GitHub Wiki

## What to Do

If you were linking to or editing files in `/wiki/`, please use `/docs/wiki/` instead.

### For Contributors

- **Edit files in** `/docs/wiki/`
- **Submit PRs** for documentation changes
- **After merge** to `main`, wiki auto-publishes

### For Maintainers

This `/wiki/` directory can be removed after confirming all references are updated.

## Migration Completed

- [x] All wiki content copied to `/docs/wiki/`
- [x] Auto-publish workflow created
- [x] CODEOWNERS updated
- [x] CONTRIBUTING.md updated
- [x] PR template updated

See `/docs/README.md` for the complete documentation governance model.
