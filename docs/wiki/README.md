# RIPP Protocol Wiki Content (Source of Truth)

This directory is the **canonical source** for all RIPP Protocol GitHub Wiki content. 

**Important**: This is the authoritative location. The GitHub Wiki is a published view only. All edits must be made here in the main repository, not directly in the GitHub Wiki.

## Wiki Pages

This directory contains 15 comprehensive wiki pages:

1. **Home.md** - Main landing page with RIPP overview and quick links
2. **Getting-Started.md** - Installation, initialization, and first validation
3. **Core-Concepts.md** - Regenerative Intent, repo-native artifacts, determinism
4. **RIPP-Specification.md** - Overview of spec, versioning, compatibility
5. **Schema-Reference.md** - Field-by-field schema documentation
6. **CLI-Reference.md** - Complete CLI command documentation
7. **Validation-Rules.md** - What validation enforces and common errors
8. **GitHub-Integration.md** - PR validation flow and Action setup
9. **VS-Code-Extension.md** - Extension capabilities and safety guarantees
10. **Monorepos-and-Advanced-Layouts.md** - Workspace layouts and limitations
11. **Design-Philosophy.md** - Why RIPP is minimal, human intent as control
12. **FAQ.md** - Common questions and answers
13. **Versioning-and-Compatibility.md** - Version strategy and upgrades
14. **Contributing-to-RIPP.md** - How to contribute and propose changes
15. **Glossary.md** - Key term definitions

## Governance Model

- **Source of Truth**: `/docs/wiki/` in the main repository
- **Published View**: GitHub Wiki (automatically synced)
- **Edit Policy**: All changes must go through PR review in the main repo
- **Automation**: Wiki is auto-synced on merge to `main` branch

## Publishing to GitHub Wiki

The GitHub Wiki is automatically synchronized from this directory via GitHub Actions. Manual publishing is only needed for initial setup or troubleshooting.

### Option 1: Enable Wiki and Create Pages via UI

1. **Enable the Wiki**:
   - Go to repository Settings
   - Scroll to "Features" section
   - Check "Wikis"

2. **Create pages manually**:
   - Navigate to Wiki tab
   - Click "Create the first page"
   - Copy content from corresponding `.md` file
   - Save and repeat for each page

### Option 2: Clone Wiki Repo and Push All Pages (Recommended)

1. **Enable the Wiki** (see above)

2. **Clone the wiki repository**:

   ```bash
   git clone https://github.com/Dylan-Natter/ripp-protocol.wiki.git
   cd ripp-protocol.wiki
   ```

3. **Copy all wiki pages**:

   ```bash
   cp ../ripp-protocol/wiki/Home.md ./Home.md
   cp ../ripp-protocol/wiki/Getting-Started.md ./Getting-Started.md
   cp ../ripp-protocol/wiki/Core-Concepts.md ./Core-Concepts.md
   cp ../ripp-protocol/wiki/RIPP-Specification.md ./RIPP-Specification.md
   cp ../ripp-protocol/wiki/Schema-Reference.md ./Schema-Reference.md
   cp ../ripp-protocol/wiki/CLI-Reference.md ./CLI-Reference.md
   cp ../ripp-protocol/wiki/Validation-Rules.md ./Validation-Rules.md
   cp ../ripp-protocol/wiki/GitHub-Integration.md ./GitHub-Integration.md
   cp ../ripp-protocol/wiki/VS-Code-Extension.md ./VS-Code-Extension.md
   cp ../ripp-protocol/wiki/Monorepos-and-Advanced-Layouts.md ./Monorepos-and-Advanced-Layouts.md
   cp ../ripp-protocol/wiki/Design-Philosophy.md ./Design-Philosophy.md
   cp ../ripp-protocol/wiki/FAQ.md ./FAQ.md
   cp ../ripp-protocol/wiki/Versioning-and-Compatibility.md ./Versioning-and-Compatibility.md
   cp ../ripp-protocol/wiki/Contributing-to-RIPP.md ./Contributing-to-RIPP.md
   cp ../ripp-protocol/wiki/Glossary.md ./Glossary.md
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Add comprehensive RIPP wiki documentation"
   git push
   ```

### Option 3: Automated Script

```bash
#!/bin/bash
# Copy all wiki pages to GitHub wiki repository

WIKI_REPO="https://github.com/Dylan-Natter/ripp-protocol.wiki.git"
WIKI_DIR="ripp-protocol.wiki"

# Clone wiki repo
git clone $WIKI_REPO
cd $WIKI_DIR

# Copy all wiki pages
for file in ../ripp-protocol/wiki/*.md; do
  filename=$(basename "$file")
  if [ "$filename" != "README.md" ] && [ "$filename" != "RIPP-Tooling-Evolution-Log.md" ]; then
    cp "$file" "./$filename"
  fi
done

# Commit and push
git add .
git commit -m "Add comprehensive RIPP wiki documentation"
git push

cd ..
```

## Wiki Structure

The wiki provides comprehensive documentation covering:

- **Getting Started** - Installation and first steps
- **Core Concepts** - Foundational principles
- **Reference** - Detailed spec, schema, and CLI documentation
- **Integration** - GitHub Actions, VS Code, monorepos
- **Philosophy** - Design principles and rationale
- **Community** - FAQ, glossary, contributing

## Authoritative Sources

The wiki is documentation, not specification. When in conflict:

1. **Schema** (`schema/ripp-1.0.schema.json`) - Source of truth for packet structure
2. **SPEC.md** - Source of truth for protocol behavior
3. **README.md** - Source of truth for project overview
4. **Wiki** - Supplementary documentation and guides

**Important**: If wiki content conflicts with schema or SPEC.md, the schema/spec is correct.

## Maintaining the Wiki

### Updating Wiki Pages

1. Update the corresponding `.md` file in `wiki/` directory
2. Submit PR with changes
3. After merge, update GitHub wiki:
   ```bash
   cd ripp-protocol.wiki
   cp ../ripp-protocol/wiki/[PageName].md ./[PageName].md
   git add [PageName].md
   git commit -m "Update [PageName]"
   git push
   ```

### Adding New Pages

1. Create new `.md` file in `wiki/` directory
2. Follow existing page structure and style
3. Update `Home.md` with link to new page
4. Submit PR
5. After merge, publish to GitHub wiki

## Style Guidelines

All wiki pages follow these guidelines:

- **Clear and precise** - Technical, not marketing
- **Skimmable** - Headings, bullets, tables
- **Concrete examples** - No abstract descriptions
- **No fluff** - Respect reader's time
- **Consistent terminology** - See Glossary

## Contributing

To contribute to wiki documentation:

1. Update `.md` files in `wiki/` directory
2. Submit PR via normal contribution process
3. After merge, wiki maintainers will publish to GitHub wiki

See [Contributing-to-RIPP.md](Contributing-to-RIPP.md) for full guidelines.
