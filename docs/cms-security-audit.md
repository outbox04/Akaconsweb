# AKACONS CMS & security audit — 2026-10-31

## Confirmed architecture

| Area | Current implementation | Notes |
| --- | --- | --- |
| Framework | Next.js 14 App Router, React 18, TypeScript | Pages and route handlers live in `src/app`. |
| Data/auth | Supabase Auth, PostgreSQL and Storage | Browser and server SSR clients already exist. |
| AI | OpenAI image generation/editing via server route | `sharp` processes masked images. |
| Public website | Static AKACONS website embedded in the Next public shell | Live editor publishes key/value content to Supabase. |
| Existing admin | Operations UI plus a new Website CMS surface | CMS is now served at `/admin/cms`. |

## High-priority findings and remediation status

| ID | Severity | Finding | Status |
| --- | --- | --- | --- |
| SEC-01 | High | `/admin/*` was accessible without server-side authorization. | Fixed in application: `src/app/admin/layout.tsx` requires an authenticated admin role. |
| SEC-02 | High | Kill-switch API had no authentication. | Fixed in application: server-side role check. |
| SEC-03 | High | Material RLS allowed every authenticated user to write catalog and storage data. | Remediated by migration `20261031000000_security_hardening.sql`; apply it before deployment. |
| SEC-04 | High | AI rendering route could be called without authorization and accepted excessive image payloads. | Fixed in application with role checks, payload/pixel limits, and non-sensitive failure responses. |
| SEC-05 | Medium | Security headers were absent. | Fixed in `next.config.mjs`; validate CSP with deployed third-party integrations. |
| SEC-06 | Medium | OpenAI client used a placeholder key fallback. | Fixed; requests now fail closed when `OPENAI_API_KEY` is missing. |

## Remaining delivery milestones

1. Apply and test the new Supabase migration in a non-production project.
2. Add CMS tables, article/editor APIs, audit/version history, media upload/WebP pipeline, lead management and content calendar.
3. Add route/API authorization regression tests and authenticated browser tests.
4. Validate CSP and RLS against the actual Supabase project, then deploy through preview before production.

## Deployment and rollback

- Back up the Supabase database before applying migrations.
- Run migrations in timestamp order through the Supabase migration workflow.
- Roll back application code by redeploying the previous commit. Database policy changes require a reviewed compensating migration; do not disable RLS as a rollback shortcut.
