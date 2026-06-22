# CareOps360 — Horizon Payer Command Center

> From Operations to Outcomes — All in One Place

## Overview

**CareOps360** is an executive operations portal for Horizon BCBS (Blue Cross Blue Shield) payer leadership, built as a full-stack pnpm monorepo. Powered by IBM Application Management Services, it showcases real-time operational intelligence across all payer domains — from claims and members to vendor invoicing and app health.

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
7. **Vendor Invoice & Billing** (`/dashboard/vendor-invoices`) — IBM-scoped invoice tracking (Managed Services & Flex Services); work orders WO-MS-101–104 / WO-FS-201–204; aging analysis, payment status, admin actions (release/hold/processed), upload modal; extensible to other vendors
8. **Application Health** (`/dashboard/app-health`) — App inventory, incidents, batch jobs, interfaces, SLA
9. **IBM AMS Value** (`/dashboard/ibm-ams`) — Ticket trends, automation runbooks, cost savings
10. **Ask the Dashboard** (`/dashboard/ask`) — AI assistant for operational questions

## Skills & Enablement (`/dashboard/capability-uplift`) Tab Structure

- **Talent Plan** — Skill Readiness Heatmap, Role Transformation View, Resource Detail Table, Product Readiness Cards
- **POD Model Transformation** — extracted from Talent Plan; pod swimlane with phase columns, pilot selection, scenario planner, composition model
- **Product-Based Talent View** — product treemap + drill-down; uses same data filters as Talent Plan
- **Bootcamp Calendar** — IBM certification & learning calendar; starts from August 2026
- **Capability Maturity** — collapsible callout above the tabs (not a standalone tab); shows maturity progression and capability table

`PodModelTransformationTab` and `ProductBasedTalentViewTab` are named exports from `TalentPlan.tsx` that wrap their own data-fetching via `useTabData()` hook and provide `TalentDataContext`. "Pod Transformation" nav item removed from AppShell.

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
- `node scripts/generate-talent-pptx.mjs` — generate `Horizon_Talent_Transformation_Plan.pptx` (8-slide IBM-style executive deck) from `artifacts/api-server/data/talentPlan.json` plus live screenshots of the Capability Uplift → Talent Plan tabs (Skill Heatmap, Product Treemap, Role Transformation). Pass `--skip-shots` to reuse cached images in `screenshots/talent-deck/`.

## Database

PostgreSQL via Replit's built-in database (DATABASE_URL env var). Drizzle ORM is used for schema and queries in `lib/db`.

**35+ tables** spanning all dashboard domains:
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
- `talent_plan_resources`, `talent_plan_products`, `talent_plan_skills`, `talent_plan_role_transformation` — Talent Plan workflow (391 resources, 59 products, working `.xlsx` upload via `/api/talent-plan/upload`)
- `capability_kpis`, `capability_stages`, `capability_areas`, `capability_radar`, `capability_value_impact`, `capability_ai_certs`, `capability_training`, `capability_governance` — Capability Uplift page (8 endpoints under `/api/capability/*`; page reads everything from DB, no hardcoded constants)
- `page_kpis` — generic per-page KPI store powering the executive overview tiles

## Architecture

- Frontend is frontend-only (no DB) — all data comes from the API server
- Auth uses localStorage JWT pattern with Bearer token
- API routes serve realistic mock data (no DB needed for demo)
- Auto-refresh via React Query's refetchInterval (30 seconds)
- Role-based views (executive / ibm_delivery / admin)
- **Admin role**: `admin@horizon.com` (pwd `Horizon&IBM2026`) is the platform administrator. Sees the Administration nav group; non-admins do not. Administration page is double-gated (nav hidden + page-level role check that renders an Access Denied card for non-admins).
- **Admin dataset uploads (per-page)**: `/api/admin/datasets` lists 12 page-backed datasets (Talent Plan, Members, Claims, Prior Auth, Providers, Contact Center, Vendor Invoices, App Health, IBM AIOps, Roadmap, Executive Overview, Capability Uplift). For each dataset:
  - `GET /api/admin/datasets/:key/template` returns a multi-sheet `.xlsx` with the exact column layout, an Instructions sheet, and a snapshot of current data baked in (so the team always edits the right format).
  - `POST /api/admin/datasets/:key/upload` (multipart) parses the workbook, validates rows, **deletes existing rows in the matching DB tables and bulk-inserts the new ones**, then saves the source file + metadata.
  - `GET /api/admin/datasets/:key/download` returns the latest stored file.
  All routes require an admin Bearer token; uploadedBy is derived from the session (X-Uploader header is ignored).
- **Dataset framework**: `artifacts/api-server/src/lib/datasetEngine.ts` is a generic schema-driven template builder + workbook importer. Per-dataset schemas live in `artifacts/api-server/src/lib/datasetSchemas.ts` and declare `{ sheets: [{ sheetName, tableName, table, columns, sampleRows }] }`. Adding a new dataset = adding one entry to `DATASET_SCHEMAS`; the engine handles template generation, parsing, type coercion, validation warnings, and bulk insert (500-row chunks).
- **Administration UI** (`Administration.tsx`): two top-level tabs — "Page Datasets" (left list / right detail layout, with Download Template + Upload + Last Refresh + post-upload import counts table) and "Talent Plan (live workflow)" (preserves the existing template-driven flow). After a successful upload, all React Query caches are invalidated so the corresponding page refreshes from the new data on next load.
- **HelpHint + LastRefresh widgets**: Every dashboard page has two small widgets right under the page subtitle:
  - `LastRefresh` (compact pill) — shows "Last refreshed N min ago / vN" by reading `GET /api/admin/datasets/:key/metadata`. This metadata endpoint is `requireAuth` (not requireAdmin), so exec/ibm/admin all see it. Write endpoints (`POST .../upload`, `GET .../template`) remain `requireAdmin`.
  - `HelpHint` (HelpCircle icon → HoverCard) — admin-only (returns null for other roles). Popover shows what the page is, source DB tables, and a link to Administration.
  Components live in `artifacts/horizon-payer/src/components/admin/`.
- **Logout cache reset**: `AppShell.doLogout()` calls `queryClient.clear()` after removing the token, so role-cached data (most importantly `useGetCurrentUser`) does not leak into the next user session — required so the admin-only Upload Invoice button stays hidden after switching to exec.
- **Vendor Invoices Upload button**: now wrapped in `{isAdmin && ...}` so it is fully absent from the DOM for exec/ibm (no more disabled-with-toast UX).
