# Database handoff

## Choose the correct path

| File | Purpose | Target |
| --- | --- | --- |
| `schema-current.sql` | Complete schema-only snapshot of the development database at handoff | **Empty** PostgreSQL database |
| `migrations/001_feature_toggles.sql` | Add the latest portal feature settings table | Existing CareOps360 database |
| `schema.sql` | Historical schema dump with accumulated additions, retained for compatibility | Legacy reference only |
| `../lib/db/src/schema/` | Application's typed Drizzle schema definitions | Development |

The snapshot contains tables, indexes, constraints, and sequences, but **no rows,
passwords, connection strings, ownership assignments, or access grants**. It does
not seed users or application data. It reflects development, not a verified
production schema. Review it against the team's target environment.

## Fresh database

Use a supported PostgreSQL server and a `psql` client at least as recent as the
`pg_dump` version recorded in the snapshot header. Supply `DATABASE_URL` through
your team's secret-management process, not in source control.

```sh
psql "$DATABASE_URL" -X --set ON_ERROR_STOP=on --single-transaction \
  --file db/schema-current.sql
```

Run the snapshot only against an empty database. It deliberately has no DROP
statements and is not an upgrade or repeatable migration.

## Existing database: latest feature-toggle change

Back up the target database first and review the SQL with the DBA.

```sh
psql "$DATABASE_URL" -X --set ON_ERROR_STOP=on \
  --file db/migrations/001_feature_toggles.sql
```

This migration is additive and rerunnable; it does not reset saved settings.
`IF NOT EXISTS` does not repair an incompatible pre-existing table definition.
The application defaults missing feature override rows to enabled. No seed is
needed for feature toggles. Executive Overview and Administration are recovery
routes and must remain available.

## Verification

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'feature_toggles'
ORDER BY ordinal_position;
```

Expect `feature_key`, `enabled`, `updated_at`, and `updated_by`.
The migration and fresh snapshot should be tested on disposable databases first.
Do not run the project's seed scripts merely to apply DDL: seeding can replace
demo data.

## Download package

The downloadable ZIP contains this README, the current schema snapshot, and the
numbered migration. Generated ZIPs live in `generated-artifacts/`, outside Git.
No production database changes are performed by packaging these files.
