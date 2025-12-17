# RIPP vNext Example: Express API Intent Discovery

This example demonstrates using RIPP Intent Discovery Mode to extract intent from an existing Express.js API.

## Workflow Overview

Evidence Build → AI Discovery → Human Confirmation → Canonical Build

## Quick Start

```bash
# 1. Initialize RIPP
ripp init

# 2. Build evidence pack
ripp evidence build

# 3. Discover intent (AI-assisted)
RIPP_AI_ENABLED=true ripp discover --target-level 2

# 4. Confirm candidates
ripp confirm

# 5. Build canonical packet
ripp build --packet-id user-api --title "User API"

# 6. Validate and package
ripp validate .ripp/handoff.ripp.yaml
ripp package --in .ripp/handoff.ripp.yaml --out handoff.md
```

See [INTENT-DISCOVERY-MODE.md](../../docs/INTENT-DISCOVERY-MODE.md) for detailed documentation.
