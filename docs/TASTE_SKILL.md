# Taste Skill workflow

WheresMaldives uses Leonxlnx/taste-skill for frontend art direction and browser-based visual quality checks. The selected upstream revision is pinned to Taste Skill 2.5.1 (commit f6b76575f949707b4e3c37cd86cb44b0b98643e8) so a design review is reproducible.

## Install for an agent
Run the upstream installer in the project:
```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

Node.js 22+ and Chrome, Edge or Chromium are required for the browser inspection scripts.

## Deal the admin application design
The staff CMS is an application interface, so use page kind software and trade saas:
```bash
bash scripts/taste-deal.sh software saas
```
The script fetches the pinned upstream commit, runs start.mjs deal, and records the choice in the ignored .taste-skill/history.json. Follow the skill's rule: take the first palette and first type pairing unless either conflicts with real brand assets. Then run the printed css command (or set TASTE_PALETTE and TASTE_TYPE when rerunning the script) and keep the emitted root block unchanged.

The public WheresMaldives publisher website is a service-kind site; do not reuse the admin app's software design deal for public editorial pages. Deal it separately with page kind service and trade agency/editorial publisher when that surface is designed.

## Required workflow for a UI PR
1. Read the upstream SKILL.md plus references/system.md, references/layout-v4.md, references/sections.md, references/copy.md and references/copy-voice.md.
2. Record the brief, page kind, main user action, screen plan, dealt palette/type, hero and moments.
3. Build the actual product UI, not generic dashboard fragments. Use truthful empty states until real content exists.
4. Run copy-lint and the skill's browser checks/gate against the running app or built page. For Next.js dynamic routes, do not claim static-export validation.
5. Attach screenshots at desktop, tablet and mobile widths and report the gate status and any unverified checks.

The script and CI deal are reproducibility helpers; they do not replace PE MCP ui-design, app-lifecycle, Supabase security or release review.
