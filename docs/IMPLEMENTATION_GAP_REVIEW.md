# WheresMaldives.com — Product Implementation Gap Review

**Reviewed:** 10 November 2026  
**Repository:** https://github.com/ahmedaisar/wmv26  
**Main baseline:** `1cc7c2e2b569370b0ae9edae66aab4a0c3c021a0`  
**Open implementation PR:** [#8 — Editorial admin workspace](https://github.com/ahmedaisar/wmv26/pull/8), head `a13d42dcff2238ccddd7cadffc3948ec5f400a7f`.

This review compares `docs/PRD.md` and `docs/IMPLEMENTATION_PLAN.md` with the actual route tree, migrations, open PRs and connected Supabase state. It is a code/document inventory, not a claim that every page has been browser-tested.

## Executive assessment

The current product is an **editorial foundation**, not yet the full Maldives media and discovery platform described in the PRD.

On `main` today:
- Public homepage, news listing and article detail.
- Supabase identity/profile and editorial data foundations.
- Staff sign-in, role lookup and a minimal protected admin dashboard.
- SEO metadata, robots and sitemap.

Open PR #8 adds:
- Article list, basic plaintext draft creation, article detail/revision listing, workflow actions, and author listing/creation.
- A narrowly scoped draft RPC, direct-write privilege hardening, and anonymous helper-grant revocation.

Still absent:
- Public category, tag and author pages.
- Hotel/property directory and property detail pages.
- Atoll, island and destination pages.
- Experiences and guides pages.
- Search across editorial and property content.
- Newsletter signup, consent, verification and unsubscribe.
- Contact, commercial and property enquiry flows.
- Media library, uploads and image metadata workflows.
- Admin categories/tags, hotels, destinations, enquiries, newsletter and user-management areas.
- Analytics, source-attributed tourism intelligence, campaign management and audit console.

## Observed baseline

| Area | Observed state |
|---|---|
| `main` app routes | `/`, `/news`, `/news/[slug]`, `/admin`, `/admin/sign-in`, `/admin/access-denied`, `/robots.txt`, `/sitemap.xml` |
| PR #8 additional routes | `/admin/articles`, `/admin/articles/new`, `/admin/articles/[id]`, `/admin/authors`, `/admin/authors/new` |
| Main migrations | Profile, editorial schema, editorial workflow, article presentation |
| PR #8 migrations | Draft RPC, RPC-only editorial writes, revoke anon execute on `current_app_role()` |
| Hosted Supabase | Active/healthy, eight public tables: profiles, authors, categories, tags, articles, article_tags, article_revisions, article_status_events |
| Hosted Supabase Storage | Zero buckets |
| Open feature PRs | PR #8 only |
| Production deployment | READY after site URL fallback fix |
| Latest admin preview | READY for PR #8 head `a13d42d` |
| Latest PR #8 CI | Passed: lint/typecheck/tests/build, clean local migration reset/pgTAP, Taste editorial design deal |

**Release boundary:** the hosted database has not been migrated with PR #8's three pending admin migrations. A READY preview is not proof of live staff sign-in or authenticated admin operations. Do not apply hosted migrations until the exact target and rollout are reviewed.

## PRD route coverage

| PRD route/capability | Current evidence | Status |
|---|---|---|
| `/` | Public homepage with discovery links and latest stories | Implemented; partial modules |
| `/news` | Published listing with lead story, grid and empty state | Implemented; pagination/category filter not yet present |
| `/news/[slug]` | Article, byline, disclosure, SEO and body rendering | Implemented; related content/share limited |
| `/category/[slug]` | No route | Missing |
| `/tag/[slug]` | No route | Missing |
| `/authors/[slug]` | No route | Missing |
| `/hotels` | Homepage link only | Missing |
| `/hotels/[slug]` | No route | Missing |
| `/destinations` | Homepage link only | Missing |
| `/atolls/[slug]` | No route | Missing |
| `/islands/[slug]` | No route | Missing |
| `/experiences` | No route | Missing |
| `/guides` | No route | Missing |
| `/industry` | No route | Missing |
| `/about` | No route | Missing |
| `/editorial-policy` | No route | Missing |
| `/contact` | No route | Missing |
| `/advertise` | No route | Missing |
| Search | Postgres article search vector exists; no user-facing search page/API | Backend only |
| Newsletter | No table, API, page or provider integration | Missing |
| Enquiries | No table, API, page or abuse controls | Missing |
| Analytics | No events/provider integration | Missing |
| Audit | Editorial status events exist; no general audit log/console | Partial |

## Admin coverage

| PRD admin capability | Current evidence | Status |
|---|---|---|
| `/admin` dashboard | Role-aware dashboard in PR #8 | Implemented in PR, not merged |
| `/admin/articles` | Search/status/pagination and permitted transitions | Implemented in PR; needs hosted staff testing |
| `/admin/articles/new` | Plaintext paragraphs mapped to JSONB and RPC create | Partial; no rich-text/block editor or inline media |
| `/admin/articles/[id]` | Detail, status actions and latest revision metadata | Partial; no content editing, compare or restore |
| `/admin/authors` | List and create | Partial; no full edit/deactivate workflow |
| `/admin/categories` | No route | Missing |
| `/admin/tags` | No route | Missing |
| `/admin/media` | No route/storage bucket | Missing |
| `/admin/hotels` | No route/schema | Missing |
| `/admin/destinations` | No route/schema | Missing |
| `/admin/enquiries` | No route/schema | Missing |
| `/admin/users` | No route or safe role-management workflow | Missing |

## Corrections to the original phase status

1. **Phase 0 (product foundation):** complete enough; the original foundation PR is merged.
2. **Phase 1 (application foundation):** substantially complete; bootstrap, Supabase clients, auth, CI and production hosting exist.
3. **Phase 2 (Editorial MVP):** not complete. PR #8 only closes part of the admin gap. Public category/tag/author routes, full article editing, media management, complete revisions and authenticated end-to-end release evidence remain.
4. **Phase 3 (Hotel and destination discovery):** not started. Core schema, reference geography, property management, public listing/profile, destination pages, filters and enquiry flow are missing.
5. **Phase 4 (Audience and intelligence):** not started. Consent, newsletter lifecycle, analytics and sourced tourism data do not exist.
6. **Phase 5 (Monetization):** not started. Advertiser/campaign records, media kit, sponsored placements and reporting do not exist.

## Recommended implementation sequence

### Gate 0 — Close editorial admin safely (PR #8)
- Complete PR #8 integration against corrected `main` and keep its full CI green.
- Review SECURITY DEFINER RPCs, grants, RLS and the transition matrix.
- Apply the three pending admin migrations only after the hosted target and rollout are explicitly reviewed.
- Provision one editor and one contributor account through the trusted operator process.
- Test sign-in, denied roles, private draft creation, author scope, review, approval and publishing against hosted Supabase.
- Restore the Taste browser visual gate and capture desktop/mobile screenshots; the Taste art-direction deal is not that browser gate.
- Correct stale docs that describe the transition RPC as SECURITY INVOKER or direct table writes.

**Exit:** authenticated editorial publishing works end-to-end; anonymous users cannot access drafts; role checks pass; production preview and SEO are verified.

### Gate 1 — Finish the editorial product slice
1. Public category, tag and author routes with published-only queries, canonical metadata and pagination.
2. Article editing with structured block editor, safe preview, revision compare/restore and attribution.
3. Media library foundation: public published assets vs private draft uploads, MIME/size validation, alt text, photographer/credit and focal position.
4. Category and tag administration, taxonomy assignment and related content.
5. Search page with URL-addressable filters, returning only published editorial content (property joins after Phase 3).

**Exit:** author/category/tag discovery works; editors can prepare and revise a complete article with controlled media; search exposes only public content.

### Gate 2 — Hotel and destination discovery (Phase 3)
1. Reviewed schema for atolls, islands, property types, hotels, facilities, hotel-facilities joins, hotel media and verification provenance.
2. Seed canonical atoll/island reference data only from approved sources; keep unknown facts null.
3. Admin property CRUD and states for draft/review/verified/active, with location, source, verified_by and verified_at.
4. Public `/hotels` directory: pagination and atoll, island, property type and facility filters.
5. Public `/hotels/[slug]` profile: gallery, facilities, location, official site and outbound booking URL; no invented availability/rates.
6. `/destinations`, `/atolls/[slug]` and `/islands/[slug]` with related stories and active properties.
7. Property/commercial enquiry with validation, spam/rate controls, consent, persistence and staff inbox.

**Exit:** operators can verify/publish properties; travellers can find and inspect properties/destinations; provenance, permissions and enquiry abuse controls pass tests.

### Gate 3 — Audience and intelligence (Phase 4)
1. Newsletter subscriber/consent model, verification, unsubscribe token lifecycle and suppression list.
2. Provider adapter/webhook handling with idempotency and retries; keep secrets server-side.
3. Privacy-conscious analytics with consent and no PII in event payloads.
4. Tourism intelligence model for source, reporting period, last-updated time, geography and metric definition.
5. Visualizations that display source and reporting date; never invent statistics.

**Exit:** subscription/unsubscribe works end-to-end; metrics identify provenance/timeframe; analytics respect privacy choices.

### Gate 4 — Commercial foundations (Phase 5)
1. Media kit and advertising/editorial policy.
2. Advertisers, contacts, campaign/placement schedules and creative assets.
3. Sponsored/affiliate labels remain visible across page, cards and newsletter contexts.
4. Placement reporting and click attribution with duplicate/bot controls.
5. Commercial role remains isolated from drafts and publishing by RLS and server checks.

**Exit:** paid placements are disclosed, commercial workflows reconcile and editorial independence remains enforced.

## Release-wide quality requirements

- Small feature branches and reviewable PRs.
- PE-MCP `app-lifecycle` defines phase done-when; `ui-design` is mandatory for product screens; `supabase-production` and `saas-authorization` gate schema/permission work.
- CI: lint, typecheck, unit tests, production build, clean Supabase reset and pgTAP.
- Browser: actual preview/browser validation at 1440, 1024, 768 and 390 widths; keyboard/focus, reduced motion, forms and loading/empty/error states; retain screenshots.
- Database: no hosted writes until migration diff, target, rollback, backup and authorization tests are reviewed.
- Security: no draft exposure; every route/action/RPC rechecks role and record scope; no privileged keys in the browser.
- SEO: canonical metadata, robots, sitemap and structured data match real records.
- Operations: provider secrets, backup/restore, uptime/error monitoring and rollback documented.

## Explicit non-goals retained

No booking engine, live room availability/rates, payment processing, traveller accounts, owner self-service, native apps, multilingual CMS or unattended third-party content republication in these phases.
