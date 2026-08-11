---
name: Drizzle push interactive prompts
description: Why drizzle-kit push hangs on prompts and how to keep it non-interactive
---

**Rule:** Every table that exists in the database must be declared in `lib/db/src/schema/` — even tables created via raw SQL at runtime (e.g. session logs from auth routes). Otherwise `drizzle-kit push` sees an unknown table and prompts to "rename" it into any newly added table, hanging non-interactive runs.

**Why:** ADM tables were blocked from provisioning because push prompted `user_session_logs → adm_action_items`. Declaring `user_session_logs` in the drizzle schema removed the prompt.

**How to apply:** If push prompts about adding a unique constraint to a populated table, apply the constraint manually with `ALTER TABLE ... ADD CONSTRAINT` (after checking for duplicates) — push then becomes a no-op. On a truly fresh/empty database, push creates everything with no prompts. Verify fresh provisioning by creating a scratch DB (`CREATE DATABASE x`) and pushing with `DATABASE_URL` pointed at it.
