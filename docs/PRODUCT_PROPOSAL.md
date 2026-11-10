# WheresMaldives.com — Product Proposal

Version 1.0 | 10 November 2026 | Proposed baseline

## Executive summary
WheresMaldives.com is an independent digital media company and web platform focused on Maldives tourism, hospitality, travel and destination discovery. It combines editorial journalism, hotel and destination discovery, tourism intelligence and commercial partnerships.

The first release establishes an editorial brand, publishing operation and verified property directory. It is not a generic booking engine; booking transactions and live inventory are deferred.

## Vision, mission and positioning
**Vision:** Become one of the most trusted and recognizable independent digital media and discovery brands covering the Maldives.

**Mission:** Help people discover the Maldives while connecting travellers, hospitality professionals, hotels and the wider tourism industry through useful journalism and technology.

**Positioning:** The Maldives. Beyond the Ordinary.

## Strategic pillars
1. Editorial authority: original journalism, resort openings, interviews, industry reporting and destination stories.
2. Discovery: structured hotels, resorts, guesthouses, atolls, islands and experiences.
3. Intelligence: tourism data stories with transparent sources and reporting periods.
4. Commerce: sponsored editorial, listings, hotel campaigns, qualified enquiries and affiliate referrals.
5. Community: relationships with professionals, contributors, photographers and travellers.

## Audiences
| Audience | Core job |
|---|---|
| International travellers | Understand the Maldives, discover stays and plan a trip |
| Hospitality professionals | Follow openings, appointments, industry developments and trends |
| Hotel and resort operators | Reach relevant audiences, promote properties and generate qualified enquiries |
| Travel trade and investors | Monitor tourism indicators, market developments and investment |

## Differentiation
WheresMaldives should not be another press-release feed or generic resort directory. Its distinctiveness comes from independent reporting, internationally accessible property discovery, original interviews and photography, local perspectives, sourced tourism data and editorial-property connections. Paid placements must be clearly distinguished from independent editorial decisions.

## Product surfaces
**Public website:** homepage, news and article pages, categories, tags, author pages, hotel directory and profiles, atoll/island/destination pages, experiences, guides, tourism intelligence, newsletter, enquiries, about, editorial policy, contact and commercial pages.

**Administration:** editorial dashboard, article creation/review/scheduling/publishing, authors, categories, tags, media library, hotel and destination management, enquiries, newsletter operations, later campaigns, roles and audit trail.

## Business model
Potential revenue streams after audience foundations: clearly labelled sponsored editorial, enhanced listings, hotel campaigns, display advertising, newsletter sponsorship, affiliate referrals, content production packages and paid tourism reports.

## MVP boundaries
**Include:** responsive editorial website; CMS with drafts/review/publishing; articles/authors/categories/tags/media; searchable property directory and profiles; atoll/island structure; basic destination pages; SEO; newsletter capture; enquiry forms; staff authentication and authorization.

**Exclude initially:** booking engine, room inventory, payments, traveller accounts, owner self-service, native apps, multilingual publishing (English first), unattended third-party content scraping or auto-publication.

## Success measures
Initial planning targets to reassess after 90 days live: 3–5 quality stories weekly; work toward 100 verified property profiles; first 1,000 newsletter subscribers; crawlable public content; editors publishing without developer assistance; first qualified hotel partnerships. These are targets, not existing results or guarantees.

## Risks and mitigations
| Risk | Mitigation |
|---|---|
| Generic content | Original reporting and defined editorial voice |
| Incorrect property facts | Source, verification status and last-verified date |
| Image copyright | Licensed/permissioned assets and attribution |
| Weak organic discovery | Technical SEO and useful topic clusters |
| Excessive scope | Explicit MVP non-goals and phase gates |
| Commercial pressure | Editorial and sponsored-content policies |
| Unauthorized access | Server-side authorization and Supabase RLS |

## Decisions
Identity: hybrid media and discovery. Audience: international travellers and Maldives hospitality industry. Brand: premium editorial. Initial language: English. Application: Next.js App Router and Supabase. Delivery: small GitHub PRs with review and release gates.
