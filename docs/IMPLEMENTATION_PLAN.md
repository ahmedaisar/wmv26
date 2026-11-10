# WheresMaldives.com — Implementation Plan

Version 1.0 | Reviewable PR delivery | Repository: https://github.com/ahmedaisar/wmv26

## Working agreements
- `main` is production and protected by convention.
- Changes go through feature branches and pull requests; no routine direct commits to `main`.
- Each PR states purpose, scope, acceptance criteria, actual checks, security/data implications and rollback notes.
- Include screenshots for UI changes.
- Run the appropriate PE skill before each class of work.
- A phase is complete only when its exit criteria have evidence.
- Do not invent Supabase, hosting, DNS or email credentials; use placeholders until configured.

## PE workflow
1. `product:start-here` to locate the next lifecycle action.
2. `product:propose`, `market-segments`, `competitor-analysis` and related skills when refining product choices.
3. `app-stack:app-lifecycle` for stage and done-when gates.
4. `app-stack:ui-design` for screens and design systems; Taste Skill supplements art direction and browser checks.
5. `app-stack:supabase-production` for migrations, RLS, grants and data access.
6. `app-stack:saas-authorization` for roles and permissions.
7. `ai-shipping:shipping-artifacts` to keep architecture, permissions and deployment evidence aligned.
8. `ai-shipping:code-review`, `independent-review` and `ship-check` before release.

PE MCP governs product, lifecycle, security and release workflow. Taste Skill does not replace PE gates.

## Phase 0 — Product foundation (current)
Deliverables: proposal, PRD, architecture/ADRs, design direction, implementation plan, repo working agreements.
Exit: scope/non-goals documented, security principles reviewed, design process documented, foundation PR reviewed and merged.

## Phase 1 — Application foundation
1. `chore/app-bootstrap`: Next.js App Router, TypeScript, lint/test scripts, README and `.env.example`.
2. `chore/taste-skill`: install or document reproducible skill setup; record source/version and verify command.
3. `feat/design-foundation`: tokens, typography, layout primitives and responsive shell.
4. `feat/supabase-foundation`: server-only client boundary, env validation, deny-all target grants and explicit migration promotion workflow (PR #14).
5. `feat/auth-foundation`: staff sign-in, profile lookup and role checks.
6. `feat/ci`: lint, typecheck and test automation.
Exit: app starts from documented steps; build/lint/typecheck/tests pass; no secrets committed; RLS/least privilege in place; staging configurable.

## Phase 2 — Editorial MVP
PRs for editorial schema/RLS; public home/editorial shell; article/category/tag/author routes; admin dashboard/list; editor/media/revisions; review-schedule-publish workflow; SEO/sitemap/structured data. Public category/tag/author routes were delivered in PR #12. The server-only Supabase access boundary is being established in PR #14 before the editorial admin PR #8 is adapted and merged.
Exit: editors publish end-to-end; anonymous users cannot read drafts; metadata/sitemap validate; visual/accessibility checks pass.

## Phase 3 — Hotel and destination discovery
PRs for atoll/island/property schema; hotel admin; profiles/galleries; directory/search/filters; destination pages; enquiries.
Exit: staff can verify properties; visitors can find properties; provenance retained; enquiry flow abuse-resistant.

## Phase 4 — Audience and intelligence
PRs for newsletter/consent; analytics; source-attributed tourism data process and visualizations; distribution improvements.
Exit: subscription/unsubscribe verified; privacy-conscious metrics; statistics show source, reporting period and update date.

## Phase 5 — Monetization
PRs for media kit; advertiser/campaign records; sponsored placements; affiliate attribution and reporting.
Exit: paid placements disclosed; commercial access isolated from drafts; campaign reporting reconciles.

## PR template expectations
Summary; scope/exclusions; observable acceptance criteria; commands actually run; security/data implications; UI screenshots; risks and rollback.

## Initial foundation PR
Title: `docs: establish WheresMaldives product and engineering foundation`
Files: README, product proposal, PRD, architecture, design system, implementation plan, ADRs and PR template. This PR documents the foundation; it does not claim that app code, Supabase, hosting or Taste Skill has been installed or deployed.
