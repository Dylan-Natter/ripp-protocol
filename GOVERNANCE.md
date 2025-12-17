# Governance

## Overview

The Regenerative Intent Prompting Protocol (RIPP) is an open standard. This document describes how the protocol is maintained and evolved.

## Principles

1. **Openness**: All decisions are made in public through GitHub issues and pull requests
2. **Merit**: Contributions are evaluated on technical merit and alignment with RIPP's goals
3. **Stability**: The specification prioritizes backward compatibility and clear versioning
4. **Simplicity**: Complexity is added only when necessary to solve real problems

## Roles

### Contributors

Anyone who submits a pull request, reports an issue, or participates in discussions.

### Maintainers

Individuals with commit access who review and merge contributions. Maintainers are expected to:

- Review pull requests with technical rigor
- Maintain the quality and coherence of the specification
- Engage constructively with the community
- Uphold the Code of Conduct

Current maintainers are listed in the repository's CODEOWNERS file (if present) or can be identified by their merge permissions.

### Specification Reviewers

For major specification changes, multiple maintainers must review and approve before merging.

## Decision Making

### Minor Changes

Documentation fixes, examples, tooling improvements, and clarifications can be merged by a single maintainer after review.

### Major Changes

Changes to required sections, validation rules, or core concepts require:

1. An issue proposing the change with rationale
2. Community discussion period (minimum 1 week)
3. Approval from multiple maintainers
4. Version increment following semantic versioning

### Disputes

If consensus cannot be reached, maintainers will make a decision based on:

- Alignment with RIPP's core principles
- Impact on existing adopters
- Technical merit
- Community feedback

## Versioning

RIPP follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes that require updates to existing RIPP packets
- **MINOR**: New optional features or sections
- **PATCH**: Clarifications, fixes, non-normative updates

## Evolution of Governance

This governance model may evolve as the project grows. Changes to governance require broad consensus and will be documented in this file.

## Adding Maintainers

New maintainers are added by consensus of existing maintainers based on:

- Sustained, high-quality contributions
- Understanding of RIPP's principles
- Commitment to the project's success
- Alignment with the Code of Conduct

## Removing Maintainers

Maintainers may step down voluntarily at any time. In cases of inactivity or Code of Conduct violations, existing maintainers may vote to remove a maintainer.

## Communication

- **GitHub Issues**: For proposals, bug reports, and discussions
- **Pull Requests**: For all changes to the repository
- **Discussions**: For general questions and community interaction

## License

All contributions are made under the MIT License as specified in LICENSE.
