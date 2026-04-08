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
7. **Finance & Billing** (`/dashboard/finance`) — Premium trends, billing exceptions, reconciliation
8. **Application Health** (`/dashboard/app-health`) — App inventory, incidents, batch jobs, interfaces, SLA
9. **IBM AMS Value** (`/dashboard/ibm-ams`) — Ticket trends, automation runbooks, cost savings
10. **Ask the Dashboard** (`/dashboard/ask`) — AI assistant for operational questions

## Key Files

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `artifacts/api-server/src/routes/` — All API route handlers (auth, executive, members, claims, priorauth, providers, contactcenter, finance, applications, ibmams)
- `artifacts/horizon-payer/src/pages/` — All frontend pages
- `artifacts/horizon-payer/src/components/layout/` — AppShell, sidebar, header

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/horizon-payer run dev` — run frontend locally

## Architecture

- Frontend is frontend-only (no DB) — all data comes from the API server
- Auth uses localStorage JWT pattern with Bearer token
- API routes serve realistic mock data (no DB needed for demo)
- Auto-refresh via React Query's refetchInterval (30 seconds)
- Role-based views (executive/operations/it/ibm_delivery)
