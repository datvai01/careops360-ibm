---
name: Role gating conventions
description: Auth role values and the admin gating rule for Horizon Payer frontend/backend
---
Rule: the only admin role value is `"admin"` (user admin@horizon.com). Frontend admin gates (AppShell adminOnly nav, Administration page, Knowledge Data Sources tab) must check `user?.role === "admin"` to match backend `requireAdmin`.

**Why:** A design subagent once "fixed" gating to `executive`/`it`, locking out real admins while exposing admin UI to executives (backend still 403'd). Caught by code review + e2e.

**How to apply:** When delegating frontend work that touches role checks, state explicitly that admin = role "admin" and review the diff for gating changes. Note: OpenAPI UserRole enum must include `admin` (added Jul 2026).
