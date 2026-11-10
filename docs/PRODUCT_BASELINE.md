# WheresMaldives.com — Product Foundation

Version 1.0 | 10 November 2026

## Product
Premium independent Maldives travel and hospitality media combined with hotel and destination discovery. Positioning: **The Maldives. Beyond the Ordinary.**

## Audiences
International travellers, hospitality professionals, resort/hotel operators, travel trade and investors.

## MVP
Editorial homepage, article/category/author pages, custom CMS, media library, searchable property directory, hotel profiles, atoll/island pages, basic destination guides, SEO, newsletter capture, enquiries and staff roles.

## Explicit non-goals
No booking engine, live rates/inventory, payments, consumer accounts, native apps, hotel-owner self-service or unattended third-party news scraping in MVP.

## Business model
Clearly labelled sponsored editorial, enhanced property listings, hotel campaigns, display and newsletter advertising, affiliate referrals, content production and later tourism reports.

## Product requirements
- Public content is server-rendered, crawlable, canonicalized and structured with accurate metadata.
- Anonymous visitors can read only published articles and active properties.
- Editorial workflow: draft, in review, approved, scheduled, published, archived.
- Only authorized editors/admins can publish or schedule.
- Properties have normalized atoll/island relationships, facilities, image galleries and source/verification metadata.
- Unknown property facts remain null rather than inferred.
- Search and directory filters are server-side and paginated.
- Newsletter and enquiry flows validate inputs, record consent and apply abuse controls.
- All privileged actions are authorized server-side and protected by Supabase RLS.

## Personas and roles
Admin, Editor, Journalist, Contributor and Commercial Manager. Commercial access is isolated from unpublished editorial drafts by default. Contributors submit work; they do not publish.

## Architecture
Next.js App Router + TypeScript + Tailwind + shadcn/ui. Supabase PostgreSQL, Auth and Storage. Zod validation, React Hook Form, Vitest, Playwright, Vercel hosting, Resend (when configured), and privacy-conscious analytics.

Public reads use Server Components and controlled revalidation. Mutations use Server Actions or Route Handlers, validate inputs, enforce role/record scope, and write audit events. RLS is deny-by-default. Service-role secrets remain server-only.

## Database domains
Identity: profiles, authors. Editorial: articles, article_revisions, categories, tags, article_tags. Media: media_assets. Geography: atolls, islands. Properties: hotels, hotel_images, facilities, hotel_facilities. Audience/operations: newsletter_subscribers, enquiries, audit_logs. Commercial records are deferred.

## Design direction
Premium editorial hospitality media. Photography-led, strong typography and grid, restrained ocean/lagoon/sand palette, accessible contrast, purposeful motion, responsive layouts. Public pages and admin share design tokens but use different densities. Preserve image licensing and attribution.

Initial token proposals: ocean ink #102F43, lagoon #2C8991, sand #E9E2D4, paper #FAF9F6, ink #17232B. Validate WCAG AA and final choices through visual design work.

## Taste Skill
Install current `design-taste-frontend` from https://github.com/Leonxlnx/taste-skill:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

The upstream README requires Node.js 22+ and Chrome, Edge or Chromium for its browser inspection. Follow the skill's current project-start and inspection instructions. PE MCP `ui-design` remains mandatory; Taste Skill supplements it.

## SEO and distribution
Canonical URLs, page metadata, Open Graph, sitemap, robots, breadcrumbs, article structured data and truthful property structured data. Tourism data stories cite source, reporting period and update timestamp.

## Delivery stages
0. Product foundation and architecture.
1. App bootstrap, Taste Skill, design system, Supabase client/migration foundation, auth and CI.
2. Editorial schema/RLS, public editorial pages, admin CMS, workflow, SEO.
3. Hotels, atolls/islands, directory/search/filters and enquiries.
4. Newsletter, analytics and source-attributed tourism intelligence.
5. Advertisers, sponsored placements, affiliate attribution and reporting.

## Quality gates
Build/lint/typecheck/tests; anonymous and role-based RLS tests; no exposed secrets; migration review; responsive browser checks at 1440, 1024, 768 and 390px; accessibility checks; SEO validation; independent review before release.

## Initial success targets
Planning targets to reassess after 90 days live: 3–5 quality stories/week, work toward 100 verified properties, first 1,000 newsletter subscribers, routine publishing without developers, first qualified hotel partnerships. These are targets, not guarantees.

## Unresolved setup choices
Supabase project/region, Vercel project/domain, newsletter and analytics provider, rich-text editor, image pipeline and staff role assignments must be provisioned/approved before production configuration.