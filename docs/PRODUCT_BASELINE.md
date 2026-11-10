# WheresMaldives.com Product Baseline

Version 1.0 — 10 November 2026

## Vision
A trusted independent premium media and discovery brand covering Maldives travel and hospitality.

**Positioning:** The Maldives. Beyond the Ordinary.

## Audience
International travellers, hospitality professionals, hotel/resort operators, travel trade and investors.

## MVP
- Premium responsive editorial website.
- Articles, categories, tags, authors and editorial media.
- Custom editorial CMS with draft, review, scheduling and publishing.
- Searchable hotel/property directory and verified profiles.
- Atoll, island and destination pages.
- SEO, newsletter capture and enquiry forms.
- Staff authentication, authorization and audit trail.

## Not MVP
Booking engine, room inventory, availability/rates, payments, consumer accounts, mobile apps, owner self-service, multilingual CMS or automatic third-party news republishing.

## Architecture
Next.js App Router, TypeScript, Tailwind, shadcn/ui, Supabase PostgreSQL/Auth/Storage, Zod, Vitest, Playwright. Public content uses server rendering and controlled caching. Admin mutations are validated and authorized server-side. RLS is deny-by-default. Service keys remain server-only.

## Design
Premium editorial hospitality aesthetic. Photography-led composition, strong typography and disciplined grids. Suggested initial tokens: ocean #102F43, lagoon #2C8991, sand #E9E2D4, paper #FAF9F6, ink #17232B. Validate contrast and final choices using PE ui-design workflow and Taste Skill.

## Taste Skill
Install the upstream skill:

    npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"

It requires Node.js 22+ and Chrome/Edge/Chromium for browser inspection. Follow the installed skill's current project-start and visual-check instructions. This supplements, not replaces, PE MCP workflow.

## Delivery phases
0. Product foundation and architecture.
1. App bootstrap, design system, Taste Skill, Supabase foundation, auth and CI.
2. Editorial database/RLS, public pages and CMS.
3. Hotels, islands, atolls, search and enquiries.
4. Newsletter, analytics and source-attributed tourism data.
5. Advertising, sponsored placements and affiliate tracking.

## Quality gates
Build, lint, typecheck and tests; RLS tests for anon and each role; no exposed secrets; migration review; visual checks at 1440/1024/768/390; accessibility; SEO; independent review before release.

## Targets (planning only)
3–5 quality stories weekly, work toward 100 verified properties, first 1,000 newsletter subscribers and first hotel partnerships after launch. Reassess after 90 days of actual operation.
