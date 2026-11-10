# WheresMaldives.com

Premium Maldives travel media and discovery platform.

**Positioning:** The Maldives. Beyond the Ordinary.

## Stack
Next.js App Router, TypeScript, Tailwind CSS and Supabase (Postgres, Auth and Storage). The public editorial foundation and staff identity foundation are implemented. The editorial admin workspace remains under review; its additional hosted migrations and staff end-to-end verification are not yet released.

## Local development
Requires Node.js 22+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Quality scripts
- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
- `npm test` — Vitest
- `npm run format:check` — Prettier check

## Taste Skill
Install the selected frontend design skill in your agent environment:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

The upstream workflow requires Node.js 22+ and Chrome, Edge or Chromium for browser inspection. Follow the installed skill's current project-start and visual-review instructions. PE MCP `ui-design` remains the governing product design workflow.

## Environment
Copy `.env.example` to `.env.local`. Use the connected Supabase project's public URL and anon key in local development. Never commit real secrets. A service-role key, if later required, must remain server-only.

## Project docs
See `docs/` for the product baseline, proposal, requirements, architecture, design direction and implementation plan. All implementation changes are delivered through pull requests.

## Editorial data model
See `docs/EDITORIAL_SCHEMA.md` for the content tables, publishing states and database access policies.

See `docs/EDITORIAL_WORKFLOW.md` for the atomic article transition RPC and publication rules.

Design workflow: see `docs/TASTE_SKILL.md` and run `bash scripts/taste-deal.sh software saas` for the admin app.

CI currently runs lint, typecheck, unit tests, production build, a clean local Supabase migration reset, pgTAP and the configured Taste Skill art-direction deal. It does **not** run the Taste Skill browser visual gate. Browser validation and screenshots must be reported separately and must not be described as passing until actually run.
