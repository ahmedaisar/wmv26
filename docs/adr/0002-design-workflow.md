# ADR-0002: Design workflow and Taste Skill

- Status: Accepted
- Date: 2026-11-10

## Context
Owner requested premium editorial UI and selected Leonxlnx/taste-skill.

## Decision
Use current `design-taste-frontend` skill from https://github.com/Leonxlnx/taste-skill as a supplemental design workflow. Install with:
```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```
Follow current upstream instructions and project-start/inspection commands. Node.js 22+ and Chrome, Edge or Chromium are needed for browser inspection. PE MCP `ui-design` remains mandatory for product screens. PE skills govern product, security, lifecycle and release.

## Consequences
Design direction is prepared rather than improvised; key pages receive browser inspection and responsive checks. Output must be adapted for an editorial media platform and accessibility. Installation is not claimed until run in the actual build environment.
