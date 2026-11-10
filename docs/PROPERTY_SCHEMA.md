# Property and geography schema

## Scope
This schema is the Phase 3A foundation for Maldives destination and property discovery. It adds canonical atolls/islands, a verified property catalogue, facilities, approved-media metadata and private verification/status history. It does not seed geography, upload media, expose public routes or implement admin screens.

The migration is staged at supabase/pending/20261110130000_create_hotel_geography_schema.sql. It is not in supabase/migrations and must not be applied to a hosted project without an explicitly reviewed target, ledger, backup/rollback plan and owner approval.

## Tables

| Table | Purpose | Public visibility policy |
|---|---|---|
| atolls | Canonical atoll records and source metadata | Active records only, through server queries |
| islands | Canonical islands belonging to an atoll | Active records only, through server queries |
| properties | Resort, hotel and guesthouse records | Published + active + verified + known island |
| facilities | Normalized facility catalogue | Active records only |
| property_facilities | Property/facility association and verification | Verified association on a published property |
| property_media | Image URL/storage path, alt text, credit, focal point and review state | Approved media on a published property |
| property_verification_events | Immutable source/verifier history | Private |
| property_status_events | Actor-attributed lifecycle history | Private |

## Integrity rules
- Slugs are lowercase kebab-case and unique.
- Each island belongs to one atoll.
- A property's island_id/atoll_id pair must reference the same island/atoll relationship.
- Latitude and longitude are both present or both null, with valid global coordinate bounds.
- Website, booking and source URLs must be HTTP(S).
- A property cannot be verified without a named HTTP(S) source and verifier.
- A property cannot be published without verification, publication actor/time and a known island/atoll.
- Property media cannot be approved without reviewer/time and must have a storage path or HTTP(S) media URL.
- Facility claims require source and verifier before they are marked verified.

## Property lifecycle
draft → in_review → verified → published → archived

- Admin/editor can submit drafts, return in-review records to draft, verify with a source, publish verified properties, archive published properties and reopen archived records as drafts.
- A journalist may submit only a draft they created or are assigned to.
- Contributors and commercial users cannot transition property records.
- Verification and publication are separate events. The transition RPC reads the actor's role from profiles, accepts only a server-verified actor ID, locks the actor and property rows, and records status/verification history atomically.
- The RPC is invoker-security and executable only by service_role. Direct API roles have no table, schema or function grants under the server-only database boundary.

## Server query contract
Because the application server uses a Supabase secret key that bypasses RLS, public query helpers must explicitly filter:
- Atolls/islands/facilities: is_active = true.
- Properties: status = published, is_active = true, verified_at IS NOT NULL, published_at <= now().
- Facility associations: is_verified = true.
- Property media: review_status = approved.
- Never select private verification notes, assigned staff, internal status events or private contact fields into public page props.

The target schema enables RLS with zero policies and grants no direct table access to anon or authenticated; service_role receives only the server privileges required by the app. These grants are applied in the staged local-only migration and are not yet applied to hosted Supabase. The local posture is asserted by pgTAP in supabase/tests/hotel_discovery.test.sql.

## Server read model
The server-only read helpers live in src/lib/properties.ts; URL/filter normalization is isolated in src/lib/property-filters.ts. They fail closed on malformed filters and select only published, active, verified properties whose atoll and island are active. Facility associations must be verified and facilities active; media must be approved and have an HTTP(S) media URL. Query failures are surfaced to the route error boundary rather than disguised as an empty directory.

## Storage and data sourcing
No Storage bucket is created by this migration. Uploads are a later, separately reviewed slice. storage_path reserves a durable object path; external media_url is accepted only as HTTP(S) and still requires review approval. Do not seed atoll/island names, classifications, coordinates, facilities, ratings or property facts until the owner approves canonical sources. Unknown values remain null.
