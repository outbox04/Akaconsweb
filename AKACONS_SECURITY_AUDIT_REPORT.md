# AKACONS Security Audit Report

Audit date: 2026-10-31. Scope was the repository checkout only: Next.js application code, committed Supabase migrations, dependency manifest/lockfile, and local build/type checks. No production systems, Supabase project, user accounts, storage objects, deployment configuration, or destructive tests were accessed.

## Executive summary

The application has server-side Supabase authentication primitives and admin checks, but the audit found authorization and RLS hardening work that must be deployed together before treating CMS/CRM data as protected. Code changes in this checkout now validate privileged content/material writes, block cross-origin state-changing requests, constrain request sizes, apply a per-instance render/estimate abuse backstop, and restrict the only server-side external image fetch to an expected provider host.

This is **not** a certification that the website is completely secure. In particular, the new RLS migration has not been applied or tested against a real Supabase project, and `npm audit` still reports Critical/High vulnerable dependency paths.

## Attack-surface inventory

| Surface | Access model observed | Status |
| --- | --- | --- |
| Public pages | `/`, collection, contact, price and AI pages | PASS for static review; no sensitive server data observed |
| Admin pages | `/admin/**` | Server layout calls `requireAdmin`; FIXED in existing working tree |
| Material import | `POST /api/admin/materials/import` | Admin role, same-origin and schema/size checks; FIXED |
| Site publishing | `GET/PUT /api/site-content` | Public read is intentional; PUT requires admin role and now validates payload/origin; FIXED |
| AI render | `POST /api/render/jobs` | Authorized operational roles, bounded input, provider URL allowlist and timeout; FIXED/PARTIAL rate limit |
| Estimate calculator | `POST /api/estimates` | Public calculation endpoint; bounded request and per-instance throttling; FIXED/PARTIAL rate limit |
| Supabase tables | CRM, render, estimates, quotes, catalogue, audit/config, CMS content | Migration required; PARTIAL until applied and verified |
| Storage | `material-assets` public-read bucket | Admin-only mutation policy in prior hardening migration; NOT TESTED against live project |
| AI/OpenAI | Server-only `OPENAI_API_KEY` | No key was printed or accessed; static review PASS |

## Findings and remediation

| ID | Severity | Evidence | Impact | Status |
| --- | --- | --- | --- | --- |
| SEC-01 | High | `src/app/admin/**` is now protected by `src/app/admin/layout.tsx` and API authorization helpers | Unauthenticated/non-admin CMS access | FIXED in working tree; authentication requires live retest |
| SEC-02 | High | Original material migration granted all authenticated users write access; `20261031000000_security_hardening.sql` replaces it with role checks | Catalog and asset tampering | FIXED by pending migration |
| SEC-03 | High | Initial schema enabled RLS for only a subset of tenant tables, without coverage for multiple child/config tables | Cross-tenant or unintended data access depending on existing policies | FIXED by pending `20261031010000_complete_rls_hardening.sql` |
| SEC-04 | High | `POST /api/render/jobs` previously fetched provider URLs without host, redirect, timeout, or response-size restrictions | SSRF/resource exhaustion if an untrusted URL entered the flow | FIXED in route handler |
| SEC-05 | Medium | Privileged material import accepted unconstrained object fields and returned raw exception messages | Mass assignment/input abuse and internal error leakage | FIXED with Zod validation, body cap and generic validation response |
| SEC-06 | Medium | CMS publish accepted arbitrary record keys and had no explicit origin check | Cross-site mutation and unbounded CMS keys | FIXED with origin, size and key/value validation |
| SEC-07 | Medium | Render and estimate endpoints had no application-level abuse backstop | Cost/CPU abuse | PARTIAL: per-instance limiter added; deploy a shared rate limiter for production |
| SEC-08 | Critical | `npm audit --omit=dev --audit-level=high` still reports vulnerable dependency paths after the lockfile resolved Next.js 14.2.35; a supported major upgrade is required by the audit | Potential RCE/DoS/SSRF depending on deployment/version | OPEN: do not deploy until reviewed dependency upgrades are complete |

## Database security report

`20261031010000_complete_rls_hardening.sql` enables RLS for all application tables introduced by the initial schema and adds organization-scoped policies for tenant roots and parent-derived policies for child rows. It leaves public reads only for intended catalogue lookup data and existing published website/material content.

Before deployment, run these tests in a non-production Supabase project with two users in different organizations:

1. Anonymous: verify private CRM/render/quote/audit/config tables return no rows and reject mutation.
2. User A: verify reads and writes succeed only for User A's organization.
3. User A: change every resource UUID to User B's; verify SELECT/INSERT/UPDATE/DELETE are denied.
4. Non-admin authenticated user: verify catalogue/storage mutations are denied.
5. Admin: verify approved material mutations succeed and public material reads still work.
6. Verify `user_roles` cannot be inserted, updated, or deleted by the user being evaluated.

Database backups, recovery posture, deployed storage objects, RPC functions, views, grants, Realtime, and actual policy combinations were not available and are **NOT TESTED**.

## Code changes in this audit

- `src/lib/security/request.ts`: origin, content-length, no-store response and in-process rate-limit helpers.
- `src/lib/validation/admin.ts`: bounded strict shapes for CMS publication and material import.
- `src/app/api/admin/materials/import/route.ts`: protected, validated administrative mutation.
- `src/app/api/site-content/route.ts`: protected, validated publishing mutation.
- `src/app/api/render/jobs/route.ts`: request controls and safe external provider retrieval.
- `src/app/api/estimates/route.ts` and `src/lib/validation/schemas.ts`: request/range controls.
- `supabase/migrations/20261031010000_complete_rls_hardening.sql`: complete RLS/policy coverage migration.

## Verification results

| Check | Result |
| --- | --- |
| `npm run test:clean` | PASS |
| `npm run build` | INCOMPLETE: concurrent local Next/Node processes prevented a clean completion signal |
| Static secret scan of application/config files | PASS: no service-role key or hard-coded credential found |
| `npm audit --omit=dev --audit-level=high` | FAIL: 1 Critical and 6 High findings reported |
| Live authorization/RLS/storage tests | NOT TESTED: no Supabase credentials/project scope supplied |
| Dynamic security scan / production penetration test | NOT TESTED: no authorized target supplied |

## Residual risks and deployment checklist

1. Run a reviewed dependency upgrade, then re-run build and `npm audit`. The local lockfile resolved Next.js 14.2.35, but the audit still requires a supported major upgrade; the attempted Sharp update was blocked by a file lock.
2. Review the required breaking upgrades for `@supabase/ssr`, `zod`, and OpenAI before applying them; do not use `npm audit fix --force` blindly.
3. Back up the database, apply migrations in timestamp order, and execute the RLS matrix above in staging. Roll back policy changes with a reviewed compensating migration; never disable RLS as a rollback.
4. Configure a shared, identity-aware rate limiter (for example at the edge) for rendering and imports. The implemented limiter resets per process and is only a fallback.
5. Confirm CSP against deployed integrations. It currently retains `unsafe-inline` for existing Next/legacy assets; migrate to nonce/hash CSP before claiming strong XSS mitigation.
6. Restrict or remove the public legacy preview bundle at `public/akacons-website-source` if it is not deliberately public; it contains client-side simulated access controls and should not host confidential content.
7. Rotate relevant credentials immediately if secret scanning outside this repository or Git history identifies exposure.

## Rollback plan

Redeploy the preceding application release if a regression occurs. For database changes, create and review a compensating migration that restores the prior policies only; preserve business data, backups, and RLS. Do not use destructive resets or broad grants as an emergency workaround.
