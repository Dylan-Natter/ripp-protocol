# Security Policy

## Reporting a Vulnerability

The RIPP Protocol is a specification and tooling project. Security issues are taken seriously.

### What to Report

- Vulnerabilities in the validator CLI or other tooling
- Security flaws in example code or templates
- Issues that could lead to unsafe defaults in RIPP packets
- Documentation that could encourage insecure practices

### How to Report

**For security vulnerabilities, please do NOT open a public issue.**

Instead, please report security issues by:

1. Opening a private security advisory on GitHub (preferred)
2. Emailing the maintainers directly (if listed in package.json or GOVERNANCE.md)

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 72 hours
- **Status Update**: Within 1 week
- **Resolution**: Depends on severity and complexity

### Disclosure Policy

- We follow coordinated disclosure principles
- Security issues will be disclosed after a fix is available
- Credit will be given to reporters unless anonymity is requested

### Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

### Security Best Practices for RIPP Users

When creating RIPP packets:

1. **Permissions**: Always explicitly define permission requirements
2. **Data Contracts**: Validate all inputs and outputs
3. **Failure Modes**: Document security-related failure scenarios
4. **Audit Events**: Include security-relevant events in audit logging
5. **Secrets**: Never include secrets or credentials in RIPP files

### Security Considerations for Tooling

- Validate all inputs when processing RIPP files
- Sanitize file paths to prevent directory traversal
- Use secure defaults in all code generation
- Avoid executing arbitrary code from RIPP packets

## Security in the Specification

RIPP itself is a documentation standard. The specification encourages:

- Explicit permission modeling
- Comprehensive audit logging
- Failure mode analysis
- Secure-by-default patterns

Following the RIPP specification helps teams build more secure systems by making security requirements explicit and reviewable.
