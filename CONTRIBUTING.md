# Contributing to RIPP

Thank you for your interest in contributing to the Regenerative Intent Prompting Protocol.

## Ways to Contribute

- **Specification improvements**: Propose clarifications or enhancements to SPEC.md
- **Schema refinements**: Suggest improvements to the JSON Schema
- **Examples**: Add real-world RIPP packet examples
- **Tooling**: Improve the validator CLI or create new tools
- **Documentation**: Fix typos, improve clarity, add guides
- **Bug reports**: Report issues with validation or documentation

## Before You Contribute

1. Read the [SPEC.md](SPEC.md) to understand RIPP's design principles
2. Check existing issues and pull requests to avoid duplication
3. For major changes, open an issue first to discuss your proposal

## Governance

The RIPP™ repository enforces intentional, reviewed contributions through branch protection and required workflows.

**Branch Protection:**

- The `main` branch is protected
- All changes must be made via pull requests
- Direct pushes to `main` are not permitted
- Force pushes to `main` are not permitted

**Review Requirements:**

- Pull requests require review before merging
- CODEOWNERS approvals may be required for certain paths
- Automated validation may be required as tooling evolves

This governance ensures that RIPP maintains its commitment to explicit, reviewed intent at every level—from specification to contribution workflow.

## Contribution Process

### For Documentation or Minor Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b improve/docs-clarity`
3. Make your changes
4. Test locally if applicable
5. Submit a pull request with a clear description

### For Specification Changes

1. Open an issue using the "Spec Change" template
2. Provide rationale and use cases
3. Allow time for community discussion
4. If consensus is reached, submit a pull request
5. Spec changes require review from multiple maintainers

### For Code Contributions

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-validator`
3. Write clear, documented code
4. Add tests if applicable
5. Run linting: `npm run lint` (or `npm run lint:fix` to auto-fix)
6. Check code formatting: `npm run format:check`
7. Ensure all tests pass: `npm test`
8. Update relevant documentation
9. Submit a pull request

## Code Quality

This repository uses ESLint for linting and Prettier for code formatting.

- **Linting**: `npm run lint` or `npm run lint:fix`
- **Formatting**: `npm run format:check` or `npm run format`
- **Tests**: `npm test`

Configuration files:

- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `.editorconfig` - Editor settings for consistent styling

## Pull Request Guidelines

- Use clear, descriptive titles
- Reference related issues: "Fixes #123" or "Addresses #456"
- Include motivation and context
- Keep changes focused and atomic
- Follow existing code style
- Update CHANGELOG.md for notable changes

## Commit Message Format

Use conventional commit format:

```
type(scope): brief description

Longer explanation if needed.

Closes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Code Review Process

- All submissions require review
- Maintainers may request changes
- Once approved, maintainers will merge
- Be patient; maintainers are volunteers

## Spec Versioning

RIPP uses semantic versioning:

- **MAJOR**: Breaking changes to required sections or validation rules
- **MINOR**: New optional sections or backward-compatible features
- **PATCH**: Clarifications, typo fixes, non-normative updates

## Questions?

Open a discussion issue or comment on existing issues. We're here to help.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
