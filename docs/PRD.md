# WheresMaldives.com — Product Requirements Document

Version 1.0 | Proposed baseline | 10 November 2026

## Product overview and goals
A premium editorial media and destination discovery web application with a public website and staff-only administration surface. Goals: build editorial trust; enable publishing without developer help; create a structured searchable property directory; connect stories and places; capture newsletter subscriptions and enquiries; make SEO, accessibility, performance and security foundational.

## MVP non-goals
No booking engine, live availability/rate inventory, payments, consumer accounts, native apps, hotel-owner self-service, unattended third-party republishing or multilingual CMS.

## Personas
- Traveller: inspiration, reliable destination information and property/experience discovery.
- Industry reader: credible news, interviews, business developments and tourism intelligence.
- Journalist/contributor: draft, submit work, upload images and track review.
- Editor: review, revise, schedule and publish content.
- Commercial manager: handle partnership enquiries and later campaigns; no default access to editorial drafts.
- Administrator: configure users, roles and system settings.

## Information architecture
Public routes: `/`, `/news`, `/news/[slug]`, `/category/[slug]`, `/tag/[slug]`, `/authors/[slug]`, `/hotels`, `/hotels/[slug]`, `/destinations`, `/atolls/[slug]`, `/islands/[slug]`, `/experiences`, `/guides`, `/industry`, `/about`, `/editorial-policy`, `/contact`, `/advertise`.

Admin routes: `/admin`, `/admin/articles`, `/admin/articles/new`, `/admin/articles/[id]`, `/admin/authors`, `/admin/categories`, `/admin/tags`, `/admin/media`, `/admin/hotels`, `/admin/destinations`, `/admin/enquiries`, `/admin/users`.

## Functional requirements
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-001 | Homepage | Responsive editorial modules; graceful empty states |
| FR-002 | News index | Published stories, pagination and category filter |
| FR-003 | Article detail | Title, author, dates, body, image, related content and metadata |
| FR-004 | Author pages | Public profile and published work |
| FR-005 | Editorial workflow | Draft, in-review, approved, scheduled, published, archived |
| FR-006 | Publishing authorization | Only authorized editors/admins publish or schedule |
| FR-007 | Revisions | Changes auditable; prior revisions inspectable |
| FR-008 | Media library | Uploads, metadata, alt text, attribution and storage location |
| FR-009 | Hotel directory | Active, approved properties with pagination |
| FR-010 | Property profiles | Structured details, gallery, location, facilities and official links |
| FR-011 | Discovery filters | Atoll, property type and facility |
| FR-012 | Destinations | Atoll/island pages with related hotels and stories |
| FR-013 | Search | Relevant published articles and active properties |
| FR-014 | Newsletter | Consent, address validation and unsubscribe |
| FR-015 | Enquiries | Property/commercial enquiry with abuse controls |
| FR-016 | Authentication | Staff sign-in/sign-out |
| FR-017 | Authorization | Server-side role and record-scope checks |
| FR-018 | SEO | Metadata, canonical URLs, sitemap, robots and structured data |
| FR-019 | Analytics | Privacy-conscious page and conversion events |
| FR-020 | Audit | Sensitive admin and publishing actions recorded |

## Content model
Article fields: id, slug, title, excerpt, body, cover_media_id, status, content_type, author_id, primary_category_id, tags, seo_title, seo_description, canonical_url, published_at, scheduled_at, timestamps and disclosure_type for sponsored/affiliate content. Internal editorial notes must never be publicly exposed.

Property fields: id, slug, name, property_type, descriptions, atoll_id, island_id, coordinates, official website, booking URL, public contact, classification and source, room/villa count and verification metadata, listing status, featured status, verified_at/by and timestamps. Facilities and images use normalized tables. Unknown facts remain null, not guessed.

## Roles and permissions
| Capability | Admin | Editor | Journalist | Contributor | Commercial |
|---|---:|---:|---:|---:|---:|
| Manage users/roles | Yes | No | No | No | No |
| Read all drafts | Yes | Yes | Own/assigned | Own | No |
| Create article | Yes | Yes | Yes | Submit | No |
| Edit any article | Yes | Yes | No | No | No |
| Edit own article | Yes | Yes | Yes | Before submission | No |
| Publish/schedule | Yes | Yes | No | No | No |
| Manage properties | Yes | Yes | Assigned only | No | Read only/assigned |
| Manage enquiries | Yes | No by default | No | No | Yes |
| Manage campaigns | Yes | No by default | No | No | Yes |

Enforce permissions in server actions, route handlers and RLS; hiding a control is not authorization.

## Editorial workflow
Draft → In Review → Approved → Scheduled or Published. In Review may return to Draft. Scheduled becomes Published when due. Published may become Archived or Draft by an authorized editor. Every transition records actor, timestamp and prior/new state.

## Search and SEO
Server-side search, validated limits, indexed fields, only published/active records, pagination, URL-addressable filters. Public pages server-rendered with canonical metadata, Open Graph, sitemap, robots, breadcrumbs and truthful structured data. Never invent ratings, prices, availability or amenities in structured data.

## Non-functional requirements
Performance: responsive images, explicit dimensions, server rendering for editorial pages, controlled revalidation, Core Web Vitals monitoring, bounded queries.
Accessibility: semantic landmarks, heading order, keyboard navigation, visible focus, contrast, labels, useful errors and reduced-motion support.
Security: RLS on exposed tables, deny-by-default, server-only service credentials, shared validation, form rate limits/bot controls, safe rich-text sanitization, least-privilege storage and audit logs.
Reliability: automated authorization/publishing tests, committed migrations, separate staging/production, backups and restore procedure, error and uptime monitoring.

## Analytics events
Track article view/share, hotel profile view/outbound click/enquiry, newsletter subscribe, site search and destination view. Do not put sensitive personal data in analytics; respect consent.

## MVP release criteria
End-to-end editorial publishing; anonymous users cannot read drafts; hotel filters work; enquiry/newsletter flows tested; RLS and role tests pass; SEO validates; responsive/accessibility smoke checks pass; monitoring/backups documented; no unresolved critical/high findings after independent review.
