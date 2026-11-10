# Taste Skill workflow

WheresMaldives uses Leonxlnx/taste-skill for frontend art direction and browser-based visual quality checks. The selected upstream revision is pinned to Taste Skill 2.5.1 (commit f6b76575f949707b4e3c37cd86cb44b0b98643e8) so design reviews are reproducible.

## Install for an agent
Run the upstream installer in the project:
```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

Node.js 22+ and Chrome, Edge or Chromium are required for browser inspection.

## Admin application design deal
The staff CMS is an application interface, so use page kind software and trade saas:
```bash
bash scripts/taste-deal.sh software saas
```
The first Taste Skill deal for the software/saas page returned palette `white-link-blue` and type pairing `geist` (Geist + Geist Mono, `wght` axis). The first picked moment is `marquee-row`: an accessible, pausable horizontal row of editorial workflow terms, with static fallbacks on phone and reduced motion. The admin implementation uses those first choices and a soft radius. The exact generated CSS root block is retained in `public/taste-skill/assets/tokens.css`; the script fetches the pinned upstream revision and runs the official deal/css/moment commands. Generated history stays under the ignored .taste-skill folder.

The public WheresMaldives publisher website is a service-kind site; do not reuse the admin app's software design deal for public editorial pages. Deal it separately with page kind service and trade agency/editorial publisher when that surface is designed.

## Required workflow for a UI PR
1. Read the upstream SKILL.md plus references/system.md, references/layout-v4.md, references/sections.md, references/copy.md and references/copy-voice.md.
2. Record the brief, page kind, main user action, screen plan, dealt palette/type, hero and moments.
3. Build the actual product UI, not generic dashboard fragments. Use truthful empty states until real content exists.
4. Run copy-lint and the skill's browser gate against the running app. For Next.js dynamic routes, do not claim static-export validation.
5. Attach screenshots at desktop, tablet and mobile widths and report gate status and any unverified checks.

Taste Skill supplements PE MCP ui-design, app-lifecycle, Supabase security and release review.
