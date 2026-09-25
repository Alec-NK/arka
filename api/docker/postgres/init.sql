-- Runs once, when the PostgreSQL volume is first created.
-- Creates the restricted runtime role used by the API.
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'arka_app') THEN
        CREATE ROLE arka_app LOGIN PASSWORD 'arka_app';
    END IF;
END
$$;
ALTER ROLE arka_app WITH LOGIN PASSWORD 'arka_app' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
