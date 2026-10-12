-- Existing CareOps360 databases: additive, rerunnable migration.
-- Does not modify existing toggle values or other application data.
BEGIN;

CREATE TABLE IF NOT EXISTS public.feature_toggles (
    feature_key varchar(100) PRIMARY KEY,
    enabled boolean NOT NULL DEFAULT true,
    updated_at timestamp NOT NULL DEFAULT now(),
    updated_by varchar(255)
);

COMMIT;
