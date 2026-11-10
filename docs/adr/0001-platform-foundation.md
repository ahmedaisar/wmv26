# ADR-0001: Platform foundation

- Status: Accepted as implementation baseline
- Date: 2026-11-10

## Context
WheresMaldives requires a premium public media experience, editorial CMS, relational property directory, authentication and secure admin workflows. Owner selected Next.js App Router and Supabase.

## Decision
Use one TypeScript Next.js App Router application backed by Supabase PostgreSQL, Auth and Storage. Public pages use server rendering and controlled caching. Staff operations are authenticated, authorized server-side and enforced through RLS. MVP uses a custom editorial CMS and excludes booking inventory and payment processing.

## Consequences
Shared code and domain contracts across public/admin. RLS, migration discipline and server-side authorization are non-negotiable. Public content is indexable. The custom CMS creates ownership of workflows and tests. Booking integrations wait for a validated commercial need.
