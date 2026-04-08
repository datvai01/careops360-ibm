# Horizon Payer Command Center

## Overview

IBM-managed executive operations portal for Horizon BCBS (Blue Cross Blue Shield) leadership, built as a full-stack pnpm monorepo. Showcases IBM Application Management Services value across all payer operations domains.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (artifacts/horizon-payer)
- **Backend**: Express 5 + Node.js (artifacts/api-server)
- **API contract**: OpenAPI 3.1 → Orval codegen
- **Routing**: Wouter
- **Charts**: Recharts
- **Theme**: next-themes (dark/light mode)
- **Validation**: Zod (zod/v4), drizzle-zod
- **Logging**: Pino
- **Build**: esbuild (API), Vite (frontend)

## Demo Login Credentials

- **exec@horizon.com** / demo123 — Executive Leadership (CEO view)
- **ops@horizon.com** / demo123 — Operations Leadership
- **it@horizon.com** / demo123 — IT Leadership / CIO Dashboard
- **ibm@horizon.com** / demo123 — IBM AMS Delivery Manager

## Dashboard Sections

1. **Executive Overview** (`/dashboard`) — Enterprise KPIs, trend charts, alerts, AI insights
2. **Member Enrollment** (`/dashboard/members`) — Enrollment trends, product/region breakdown, exception queue
3. **Claims Operations** (`/dashboard/claims`) — Claims queue, denial reasons, aging, LOB breakdown
4. **Prior Authorization** (`/dashboard/prior-auth`) — PA KPIs, backlog aging, reviewer workload
5. **Provider Operations** (`/dashboard/providers`) — Provider directory, credentialing, issues
6. **Contact Center** (`/dashboard/contact-center`) — ASA, FCR, call volume, abandonment rate
7. **Vendor Invoice & Billing** (`/dashboard/vendor-invoices`) — Invoice tracking by vendor (XYZ Systems, IBM, ABC Corp), work order, and service category; aging analysis, payment status, exceptions/mismatches
8. **Application Health** (`/dashboard/app-health`) — App inventory, incidents, batch jobs, interfaces, SLA
9. **IBM AMS Value** (`/dashboard/ibm-ams`) — Ticket trends, automation runbooks, cost savings
10. **Ask the Dashboard** (`/dashboard/ask`) — AI assistant for operational questions

## Key Files

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `artifacts/api-server/src/routes/` — All API route handlers (auth, executive, members, claims, priorauth, providers, contactcenter, finance [vendor invoices], applications, ibmams)
- `artifacts/horizon-payer/src/pages/` — All frontend pages
- `artifacts/horizon-payer/src/components/layout/` — AppShell, sidebar, header

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/horizon-payer run dev` — run frontend locally
- `pnpm --filter @workspace/db run push` — push Drizzle schema to PostgreSQL
- `pnpm --filter @workspace/db run seed` — seed the database with realistic demo data

## Database

PostgreSQL via Replit's built-in database (DATABASE_URL env var). Drizzle ORM is used for schema and queries in `lib/db`.

**27 tables** spanning all dashboard domains:
- `users` — auth/login (4 demo accounts)
- `executive_alerts`, `daily_trends`, `ai_insights` — executive dashboard data
- `member_enrollments`, `member_exceptions` — member operations
- `claims`, `claims_denial_reasons`, `claims_lob_stats`, `claims_aging` — claims operations (500 seeded claims)
- `priorauth_aging`, `priorauth_procedures`, `priorauth_reviewers` — prior auth workflow
- `providers`, `provider_issues` — provider directory & issues
- `contactcenter_call_reasons`, `contactcenter_hourly` — contact center volume
- `finance_billing_exceptions`, `finance_premium_trend` — finance & billing
- `applications`, `incidents`, `batch_jobs`, `interfaces`, `sla_compliance` — application health
- `ibmams_runbooks`, `ibmams_savings_trend`, `ibmams_ticket_trends` — IBM AMS value

## Architecture

- Frontend is frontend-only (no DB) — all data comes from the API server
- Auth uses localStorage JWT pattern with Bearer token
- API routes serve realistic mock data (no DB needed for demo)
- Auto-refresh via React Query's refetchInterval (30 seconds)
- Role-based views (executive/operations/it/ibm_delivery)
