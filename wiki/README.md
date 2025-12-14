# RIPP Protocol Wiki Content

This directory contains template content for the RIPP Protocol GitHub Wiki.

## Initializing the Wiki

GitHub wikis are separate git repositories that must be enabled through the GitHub UI first.

### Steps to Initialize

1. **Enable the Wiki** (if not already enabled):
   - Go to the repository Settings
   - Scroll to "Features" section
   - Check "Wikis"

2. **Create the First Wiki Page**:
   - Navigate to the Wiki tab in the GitHub repository
   - Click "Create the first page"
   - Title: `RIPP Tooling & Evolution Log`
   - Copy content from `wiki/RIPP-Tooling-Evolution-Log.md`
   - Save the page

3. **Alternative: Clone and Push** (after wiki is enabled):
   ```bash
   git clone https://github.com/Dylan-Natter/ripp-protocol.wiki.git
   cd ripp-protocol.wiki
   cp ../ripp-protocol/wiki/RIPP-Tooling-Evolution-Log.md ./RIPP-Tooling-Evolution-Log.md
   git add .
   git commit -m "Initialize wiki with tooling evolution log"
   git push
   ```

## Wiki Structure

The wiki is a **decision log**, not a specification. It documents:
- Design decisions for tooling extensions
- Rationale and trade-offs
- Historical context for current behavior
- Proposed features under discussion

**Important**: If wiki content conflicts with schema, SPEC.md, or public docs, the wiki is wrong.

## Contributing to the Wiki

Follow the contribution guidelines in the main wiki page. All wiki entries should:
- Include timestamps and status (Draft/Approved/Implemented)
- Link to authoritative sources
- Preserve historical context
- Defer to SPEC.md and schema when in doubt
