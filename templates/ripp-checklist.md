# RIPP Checklist: Definition of Done

Use this checklist to ensure your feature is RIPP-complete before marking it as "implemented."

## Pre-Implementation

- [ ] RIPP packet created and committed to version control
- [ ] Packet status set to `draft`
- [ ] RIPP level chosen based on feature risk/complexity (1, 2, or 3)
- [ ] All required sections for chosen level are complete
- [ ] RIPP packet passes schema validation (`ripp validate`)
- [ ] Team has reviewed the RIPP packet (async or in meeting)
- [ ] Edge cases and failure modes have been discussed
- [ ] Security and permissions have been reviewed
- [ ] Packet status updated to `approved`

## During Implementation

- [ ] Code implementation aligns with RIPP specification
- [ ] Data contracts match actual data structures
- [ ] API contracts match actual endpoints and responses
- [ ] Permission checks are implemented as specified
- [ ] Failure modes are handled as documented
- [ ] Audit events are logged as specified (if Level 3)
- [ ] NFRs are considered in implementation (if Level 3)

## Testing

- [ ] All acceptance tests from RIPP packet have been executed
- [ ] Additional edge cases identified during implementation are tested
- [ ] Performance testing completed if NFRs specified (Level 3)
- [ ] Security testing includes permission boundaries
- [ ] Failure mode testing confirms graceful degradation

## Documentation

- [ ] API documentation reflects API contracts from RIPP
- [ ] User-facing documentation includes UX flow
- [ ] Error messages match user_message fields from failure_modes
- [ ] RIPP packet is updated if implementation deviates from spec

## Pre-Merge

- [ ] Code review completed
- [ ] All tests passing (unit, integration, e2e)
- [ ] RIPP validation CI check passes
- [ ] No known security vulnerabilities
- [ ] RIPP packet status updated to `implemented`
- [ ] RIPP packet `updated` field reflects current date

## Post-Deployment

- [ ] Feature is deployed to production
- [ ] Monitoring/alerting configured (if applicable)
- [ ] Audit events are being logged correctly (Level 3)
- [ ] Performance metrics meet NFR targets (Level 3)
- [ ] Rollback plan tested or documented

## Optional Enhancements

- [ ] Usage analytics instrumented
- [ ] Feature flag configured for gradual rollout
- [ ] Runbook created for operations team
- [ ] Customer success team briefed on new feature

---

## Notes

**RIPP Level Guidance:**

- **Level 1**: Basic features, low risk, internal tools
- **Level 2**: Production features, customer-facing APIs, moderate risk
- **Level 3**: High-risk features (payments, auth, PII, multi-tenant)

**When to update the RIPP packet:**

- During implementation if you discover the spec is incorrect or incomplete
- After deployment if behavior changes in future iterations
- Never retroactively change an `implemented` packet to hide mistakes (create new version instead)

**Packet Lifecycle:**

1. `draft` - Work in progress, not yet reviewed
2. `approved` - Reviewed and ready for implementation
3. `implemented` - Code is in production
4. `deprecated` - Feature is being phased out or replaced

---

**Remember**: The RIPP packet is the source of truth. If the code doesn't match the packet, one of them is wrong.
