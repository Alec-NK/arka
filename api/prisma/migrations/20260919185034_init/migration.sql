-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_active_created_at_idx" ON "users" ("created_at" DESC, "id" DESC) WHERE "deleted_at" IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'arka_app') THEN
        CREATE ROLE arka_app LOGIN PASSWORD 'arka_app';
    END IF;
END
$$;

ALTER ROLE arka_app WITH LOGIN PASSWORD 'arka_app' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
DO $$
BEGIN
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO arka_app', current_database());
END
$$;
GRANT USAGE ON SCHEMA public TO arka_app;

CREATE OR REPLACE FUNCTION reject_hard_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'Hard deletion is disabled for table %', TG_TABLE_NAME
        USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE TRIGGER users_no_hard_delete
BEFORE DELETE ON "users"
FOR EACH ROW EXECUTE FUNCTION reject_hard_delete();

CREATE TRIGGER users_no_truncate
BEFORE TRUNCATE ON "users"
FOR EACH STATEMENT EXECUTE FUNCTION reject_hard_delete();

GRANT SELECT, INSERT, UPDATE ON "users" TO arka_app;
