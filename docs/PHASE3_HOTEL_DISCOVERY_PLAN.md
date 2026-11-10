# Phase 3 — Hotel and destination discovery implementation plan

**Status:** Phase 3A is merged; PR #20 implements the owner-approved Atoll Atlas public discovery screens (hotel directory, property profiles and geography pages). Hosted Supabase remains unchanged  
**Product plan:** `docs/IMPLEMENTATION_PLAN.md`, Phase 3  
**Gap baseline:** `docs/IMPLEMENTATION_GAP_REVIEW.md`, Gate 2

## Outcome

Turn the existing editorial site into a useful Maldives discovery platform: visitors can browse verified accommodation, understand where it is located, and move from a property to its island and atoll. Staff can curate records without publishing unverified claims.

This phase is not a booking engine. Do not model live room inventory, nightly rates, availability, payments, reservation holds, traveller accounts or owner self-service.

## Phase 3A completion evidence

- PR #14 merged the server-only Supabase access boundary.
- PR #17 merged the normalized atoll/island/property/facility/media metadata schema and lifecycle/verification history.
- PR #18 merged server-only public read helpers and validated URL filter normalization.
- Combined validation passed: lint, typecheck, unit tests, production build, clean local Supabase reset, staged SQL application and 71 pgTAP assertions.
- The SQL is still staged under `supabase/pending/`. Do not apply it to hosted Supabase without a separately reviewed target, backup/rollback plan and explicit owner approval.

## Phase 3B — Atoll Atlas public property discovery

**Owner decision, 11 November 2026:** Direction A — Atoll Atlas. The selected hierarchy is a photography-led, atoll-first hotel directory with prominent search and compact filters. See `design/README.md` for the approved visual direction and tokens.

The first implementation slice ships `/hotels` and `/hotels/[slug]`, with URL-addressable filters, verified-only results, approved media, safe outbound links, metadata and sitemap entries. The public screens must not imply live prices, availability, ratings or endorsements. Where no verified property records are published, show an honest empty state; never seed fictional hotels.

## Phase 3C — Destination discovery

Build `/destinations`, `/atolls/[slug]` and `/islands/[slug]` after the hotel directory/profile slice is reviewed. The Atoll Atlas direction keeps the atoll as the top-level geography and lets visitors move from atoll to island to verified property.

## Design approval evidence

Direction A has been selected by the owner. Preserve the existing Red Hat Display / Red Hat Text typography and WheresMaldives ocean/lagoon brand vocabulary. The Figma artboard is a reference; the product kit in `design/tokens.css` and `design/kit.css` is the implementation source of truth.

Acceptance for this gate:
- Editable desktop and mobile screen specimens, not flattened screenshots.
- Realistic fixture content with clear image attribution placeholders; do not invent property facts.
- Directory, property profile and destination page structure.
- Tokenized type, color, spacing, radius, elevation and motion foundations with contrast evidence.
- Desktop and phone captures, loading/empty/error states, keyboard focus and reduced-motion notes.
- Owner selection is recorded in `design/README.md`; remaining visual validation is completed against the running app before this stage is called done.

## Jobs and first public surfaces

| Visitor job | Screen | Screen's one question | Primary action |
|---|---|---|---|
| Find a place to stay | `/hotels` | Which properties match my location and stay preferences? | Open a property |
| Evaluate a property | `/hotels/[slug]` | What is this place, where is it, and what can I verify about it? | Visit its official site or outbound booking page |
| Understand the geography | `/destinations` | Which atolls and islands can I explore? | Open an atoll |
| Explore an atoll | `/atolls/[slug]` | Which islands and properties are in this atoll? | Open an island or property |
| Explore an island | `/islands/[slug]` | What is this island like, and where can I stay? | Open a property or related guide |

Admin jobs (later slice): find a property needing review; verify its source and location; edit its profile and media; publish or archive it. These belong in `/admin/hotels` and a property editor, not in public-facing controls.

## Proposed domain model

Use a normalized geography and property model. Exact column definitions and enum names are finalized in the migration PR after reviewing the existing migrations, generated types, current RLS/grant conventions and local database catalog.

- **Atolls:** canonical name, slug, optional short description and ordering; source/provenance fields for canonical facts.
- **Islands:** canonical name, slug, required atoll relation, island classification where sourced, optional description and ordering; provenance for factual fields.
- **Properties:** name, unique slug, property type (initially resort, hotel, guesthouse), lifecycle status (draft, in review, verified, published, archived), required island relation where known, description, address/location details, coordinates when verified, official website and optional outbound booking URL.
- **Property media:** property relation, image URL/storage path, alt text, credit/source, sort order and focal position. Publicly visible media must be approved with the property.
- **Facilities:** normalized facility catalogue and property join table; avoid free-text filters.
- **Verification provenance:** source name/URL, verification timestamp and staff profile for each reviewed property. Preserve unknown facts as null; do not infer coordinates, classifications, star ratings, amenities or contact details.

A property may have an unknown island only if the product owner explicitly accepts an unlocated record; it must not appear in island-specific results until its geography is verified. The first implementation should prefer requiring an island before a property can be published.

### Public visibility and trust

- Anonymous visitors see only published, active records and approved public media.
- Draft, in-review, verified-but-unpublished and archived records remain unavailable publicly.
- Verification is not publication: staff approval and public visibility are separate states.
- Never imply a property is available, endorsed, rated or officially affiliated without sourced evidence.
- Outbound booking links are destinations only; no availability or rate claims are made.
- Keep external URLs validated and render them with safe link attributes.
- Do not expose staff notes, private contact details or verification workflow internals on public pages.

### Authorization and data boundaries

- Follow the existing staff identity source (`profiles.role`); never trust user-editable metadata.
- Define a resource × operation × role matrix before adding write paths.
- Enforce every staff mutation server-side and at the database boundary; hiding controls is not authorization.
- Explicitly document anonymous SELECT, authenticated SELECT and write grants for each new table. Keep RLS enabled and default-deny where the existing product access model permits.
- Avoid broad SECURITY DEFINER functions. Any required function must have a narrow purpose, pinned empty search path, exact grants and end-to-end SQL tests.
- Property writers may prepare and submit records; only the designated reviewing roles may verify and publish. Commercial users do not gain editorial draft access.
- No hosted migration or hosted seed operation is part of implementation PRs without a separately reviewed target, migration diff, backup/rollback plan and explicit owner go-ahead.

## Delivery slices

### 3A — Geography and property schema

- Add atolls, islands, properties, facilities, property-facility joins and property media.
- Add indexes for slug, lifecycle/status, geography joins and directory filters.
- Add integrity constraints for normalized slugs, valid coordinate ranges, required relations and status/timestamp consistency.
- Add explicit grants/RLS and a role/operation matrix.
- Extend generated TypeScript database types from the migration source.
- Add local Supabase reset and pgTAP coverage for public visibility, role access, invalid state changes and foreign-key/integrity rules.
- Seed only canonical geography with cited/approved sources; if a source is not yet approved, ship the empty schema and do not invent seed records.

**Acceptance:** clean local reset succeeds; anonymous cannot read unpublished records or unapproved media; each staff role has only its documented capabilities; invalid coordinates and invalid publication states are rejected.

### 3B — Public property directory and profiles

- Build `/hotels` and `/hotels/[slug]` using the existing public design tokens and components.
- URL-addressable filters: atoll, island, property type and facility.
- Use stable pagination and deterministic sorting; no unbounded result sets.
- Property profiles show only verified/public fields, approved gallery assets, facilities, island/atoll breadcrumbs and sourced outbound links.
- Add canonical metadata, sitemap coverage and truthful structured data only where fields support it.
- Include explicit loading, empty, error and no-results states.

**Acceptance:** filters compose and survive refresh/share; pagination is stable; unpublished properties never appear in list, search, metadata or sitemap; mobile and desktop layouts are checked.

### 3C — Destination discovery

- Build `/destinations`, `/atolls/[slug]` and `/islands/[slug]`.
- Show related published properties and published editorial stories only.
- Add canonical metadata, breadcrumbs and sitemap coverage.
- Empty states must not fabricate island facts or imply inventory exists.

**Acceptance:** geography relationships are correct; inactive/unpublished records are not exposed; related content links resolve; responsive and accessibility checks pass.

### 3D — Staff property operations

- Build `/admin/hotels` and property create/edit/review workflows.
- Preserve source URL, verifier, verification timestamp and status history.
- Add media upload only after storage buckets, MIME/size limits, path ownership, alt text and credit handling are reviewed.
- Add tests for each allowed and refused role transition.

**Acceptance:** staff can create, review, verify, publish and archive a property without direct table writes outside the approved server/database path.

### 3E — Enquiries (separate security-sensitive slice)

- Add property/commercial enquiry forms, server validation, persistence, consent and staff inbox.
- Add rate limiting, abuse controls, safe email delivery, idempotency and retention policy.
- Do not expose private enquiry details to anonymous users or unrelated staff.

**Acceptance:** duplicate/replayed requests do not duplicate effects; abuse controls are tested; consent and retention are documented; inbox permissions pass the role matrix.

## Test and release evidence

Every data feature requires, at minimum:

- Local clean migration reset and pgTAP.
- Anonymous/public visibility tests for every lifecycle state.
- Role matrix tests for every read/write/transition.
- Invalid and boundary input tests (including coordinate bounds and malformed external URLs).
- Cross-record identity tests: a property cannot be attached to an unrelated island/atoll or media record.
- Public route smoke tests for signed-out visitors and every new route.
- Browser checks at 1440, 1024, 768 and 390 widths, keyboard/focus and reduced motion.
- Screenshots for the public directory, property profile and destination pages.
- SEO/sitemap assertions proving only published records are included.
- A post-deploy, write-free smoke test against the preview.

CI success alone is not a substitute for browser visual review or owner click-through.

## Decisions to resolve before the first screen

1. **Public property taxonomy:** start with resort, hotel and guesthouse; add other property classes only with a real use case.
2. **Property publication authority:** recommended: admin/editor can verify and publish; journalist/contributor can draft and submit; commercial cannot publish or access editorial drafts.
3. **Geography source:** owner approves the canonical source(s) before reference data is seeded. No inferred or scraped facts.
4. **Property imagery:** use only licensed/permissioned assets with source and credit. Storage/upload workflow is a separate gate.
5. **Outbound booking links:** optional and clearly labelled; no claim that the destination is an official booking partner.

The data model and security plan can be reviewed independently of visual direction. Before building the public/admin screens, apply PE `ui-design`, produce the jobs map and artboards from the actual kit, and get the owner's design approval. Do not treat a passing CI run as visual approval.

## Dependencies and exclusions

- The public category/tag/author taxonomy routes were delivered and merged in PR #12.
- The editorial admin workspace in PR #8 remains a separate release/migration decision.
- This plan does not authorize hosted Supabase changes, staff account provisioning, property data imports, image licensing or production release.
