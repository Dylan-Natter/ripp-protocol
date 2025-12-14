# Contributing to RIPP™

This page explains how to contribute to the RIPP protocol and its ecosystem.

## Ways to Contribute

There are many ways to contribute to RIPP:

- **Specification improvements** — Propose clarifications or enhancements to [SPEC.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/SPEC.md)
- **Schema refinements** — Suggest improvements to the JSON Schema
- **Examples** — Add real-world RIPP packet examples
- **Tooling** — Improve the CLI, VS Code extension, or create new tools
- **Documentation** — Fix typos, improve clarity, add guides
- **Bug reports** — Report issues with validation or documentation
- **Community support** — Help others in discussions and issues

---

## Before You Contribute

1. **Read the spec** — Understand RIPP's design principles by reading [SPEC.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/SPEC.md)
2. **Check existing issues** — Avoid duplication by searching [existing issues](https://github.com/Dylan-Natter/ripp-protocol/issues)
3. **Open an issue first** — For major changes, discuss your proposal before implementing

---

## How to Propose Spec Changes

RIPP is a **community-driven standard**. Spec changes require discussion and consensus.

### Process

1. **Open a spec change issue**
   - Use the [Spec Change template](https://github.com/Dylan-Natter/ripp-protocol/issues/new?template=spec_change.yml)
   - Provide clear rationale and use cases
   - Explain backward compatibility impact

2. **Community discussion**
   - Maintainers and community review the proposal
   - Feedback and alternatives are discussed
   - Consensus is reached (or proposal is declined)

3. **Implementation**
   - If approved, submit a pull request with changes
   - Update SPEC.md, schema, and examples
   - Update CHANGELOG.md

4. **Review and merge**
   - Spec changes require review from multiple maintainers
   - Once approved, changes are merged
   - Release notes are published

### What Requires Spec Change?

| Change Type | Requires Spec Change? |
|-------------|----------------------|
| New required field | ✅ Yes (MAJOR version) |
| New optional field | ✅ Yes (MINOR version) |
| New conformance level | ✅ Yes (MAJOR version) |
| Clarification in SPEC.md | ⚠️ Maybe (PATCH if non-normative) |
| Typo fix | ❌ No (documentation fix) |
| Example addition | ❌ No (documentation enhancement) |
| CLI feature | ❌ No (tooling, not spec) |

---

## How to Add New Validation Rules

Validation rules are defined in the JSON Schema and enforced by the RIPP CLI.

### Structural Validation (Schema)

1. **Propose change** — Open a spec change issue
2. **Update schema** — Modify `schema/ripp-1.0.schema.json`
3. **Add tests** — Ensure new rules are tested
4. **Update CLI** — Implement rule in `tools/ripp-cli/`
5. **Document** — Update SPEC.md with new requirement

**Example: Adding a new required field**

```json
// schema/ripp-1.0.schema.json
{
  "properties": {
    "new_field": {
      "type": "string",
      "description": "New required field"
    }
  },
  "required": ["new_field"]  // Add to required array
}
```

---

### Semantic Validation (Linting)

Linting rules are implemented in the CLI and do not require schema changes.

1. **Open issue** — Describe the lint rule and rationale
2. **Implement in CLI** — Add rule to `tools/ripp-cli/lib/linter.js`
3. **Add tests** — Ensure rule catches violations
4. **Document** — Update CLI README with new rule

**Example lint rules:**

- Check for placeholder text (TODO, TBD)
- Verify `schema_ref` consistency
- Warn on missing `out_of_scope`
- Flag vague acceptance test verification

---

## How to Contribute Examples

Good examples help new users understand RIPP.

### Adding an Example RIPP Packet

1. **Create packet** — Write a complete, realistic RIPP packet
2. **Validate** — Ensure it passes `ripp validate`
3. **Document** — Add comments explaining key sections
4. **Submit PR** — Place in `examples/` directory

**Requirements:**

- ✅ Valid against schema
- ✅ Demonstrates a specific use case
- ✅ Well-commented
- ✅ Uses realistic data (not "foo" and "bar")

**Naming convention:**

```
examples/
├── simple-feature.ripp.yaml       # Level 1
├── api-with-auth.ripp.yaml        # Level 2
└── multi-tenant-payments.ripp.yaml # Level 3
```

---

## How to Contribute to Tooling

### RIPP CLI

**Repository:** `tools/ripp-cli/`

**How to contribute:**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-command`
3. Implement feature
4. Add tests
5. Run linting: `npm run lint:fix`
6. Run tests: `npm test`
7. Update CLI README
8. Submit pull request

**Key files:**

- `index.js` — Main entry point
- `lib/validator.js` — Validation logic
- `lib/linter.js` — Linting rules
- `lib/packager.js` — Packaging logic
- `lib/analyzer.js` — Analysis logic

---

### VS Code Extension

**Repository:** `tools/vscode-extension/`

**How to contribute:**

1. Fork the repository
2. Install dependencies: `npm install`
3. Open in VS Code
4. Press `F5` to launch extension development host
5. Make changes
6. Test in development host
7. Submit pull request

**Key files:**

- `extension.js` — Main extension logic
- `package.json` — Extension manifest and commands

---

## Documentation Standards

### Writing Style

- ✅ **Clear and concise** — Avoid marketing fluff
- ✅ **Technical and precise** — Use correct terminology
- ✅ **Practical** — Include examples and use cases
- ❌ **Not verbose** — Respect reader's time

### Terminology

Use consistent terminology:

- **RIPP packet** — Not "RIPP file" or "RIPP document"
- **Validate** — Not "check" or "verify" (except for acceptance tests)
- **Level 1/2/3** — Not "tier" or "stage"
- **Schema** — Not "template" or "format"

### Markdown Formatting

- Use headings (`#`, `##`, `###`) for structure
- Use code blocks with syntax highlighting
- Use tables for comparisons
- Use bullet lists for clarity

**Example:**

```markdown
## Section Title

Brief introduction.

### Subsection

| Column 1 | Column 2 |
|----------|----------|
| Value A  | Value B  |

**Example:**

```yaml
ripp_version: '1.0'
packet_id: 'example'
```
```

---

## Pull Request Guidelines

### PR Title

Use clear, descriptive titles:

- ✅ "Add validation for duplicate packet_id"
- ✅ "Fix typo in SPEC.md section 3.2"
- ❌ "Update stuff"
- ❌ "Fix bug"

### PR Description

Include:

- **Motivation** — Why this change is needed
- **Changes** — What was changed
- **Testing** — How it was tested
- **References** — Related issues or discussions

**Template:**

```markdown
## Motivation

Addresses #123. Users reported confusion about X.

## Changes

- Added clarification to section Y
- Updated example in Z

## Testing

- Validated example against schema
- Reviewed by 2+ team members

Fixes #123
```

### PR Size

Keep PRs focused and atomic:

- ✅ One feature or fix per PR
- ✅ Related changes bundled together
- ❌ Multiple unrelated changes in one PR

---

## Commit Message Format

Use [conventional commits](https://www.conventionalcommits.org/):

```
type(scope): brief description

Longer explanation if needed.

Closes #123
```

**Types:**

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Code style (formatting, no logic change)
- `refactor` — Code refactoring
- `test` — Adding or updating tests
- `chore` — Maintenance tasks

**Examples:**

```
feat(cli): add --min-level flag to validate command

fix(schema): correct regex pattern for packet_id

docs(spec): clarify Level 2 conformance requirements

chore(deps): update ajv to 8.12.0
```

---

## Code Review Process

1. **Automated checks** — CI runs validation, linting, tests
2. **Maintainer review** — At least one maintainer reviews
3. **Feedback** — Maintainers may request changes
4. **Approval** — Once approved, maintainers merge
5. **Release** — Changes included in next release

**Timeline:** Reviews typically happen within 1-2 weeks. Be patient; maintainers are volunteers.

---

## Code Quality Standards

### Linting

```bash
# Check linting
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

**Config:** `.eslintrc.json`

### Formatting

```bash
# Check formatting
npm run format:check

# Auto-format code
npm run format
```

**Config:** `.prettierrc`

### Testing

```bash
# Run tests
npm test
```

**Expected:** All tests pass before submitting PR.

---

## Licensing

By contributing, you agree that your contributions will be licensed under the **MIT License**.

See [LICENSE](https://github.com/Dylan-Natter/ripp-protocol/blob/main/LICENSE) for details.

---

## Community Guidelines

- **Be respectful** — Assume good intent
- **Be constructive** — Focus on improvement, not criticism
- **Be patient** — Maintainers are volunteers
- **Be collaborative** — Work together toward better solutions

See [CODE_OF_CONDUCT.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/CODE_OF_CONDUCT.md) for full guidelines.

---

## Questions?

- **General questions** — Open a [discussion](https://github.com/Dylan-Natter/ripp-protocol/discussions)
- **Bug reports** — Open an [issue](https://github.com/Dylan-Natter/ripp-protocol/issues/new?template=bug_report.yml)
- **Feature requests** — Open an [issue](https://github.com/Dylan-Natter/ripp-protocol/issues/new?template=feature_request.yml)
- **Spec changes** — Open a [spec change issue](https://github.com/Dylan-Natter/ripp-protocol/issues/new?template=spec_change.yml)

---

## Recognition

Contributors are recognized in [AUTHORS.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/AUTHORS.md).

---

## Next Steps

- Read [GOVERNANCE.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/GOVERNANCE.md) for protocol governance
- See [Versioning & Compatibility](Versioning-and-Compatibility) for spec evolution
- Check [RIPP Specification](RIPP-Specification) for current version details
