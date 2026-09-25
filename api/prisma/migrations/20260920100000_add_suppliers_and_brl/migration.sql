BEGIN;

CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_name_nonblank" CHECK (length(trim("name")) > 0);
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_positive_version" CHECK ("version" > 0);
CREATE INDEX "suppliers_user_id_name_idx" ON "suppliers" ("user_id", "name", "id") WHERE "deleted_at" IS NULL;

CREATE TRIGGER suppliers_no_hard_delete
BEFORE DELETE ON "suppliers"
FOR EACH ROW EXECUTE FUNCTION reject_hard_delete();

CREATE TRIGGER suppliers_no_truncate
BEFORE TRUNCATE ON "suppliers"
FOR EACH STATEMENT EXECUTE FUNCTION reject_hard_delete();

GRANT SELECT, INSERT, UPDATE ON "suppliers" TO arka_app;

ALTER TABLE "transactions" DROP CONSTRAINT "transactions_usd_currency";
UPDATE "transactions" SET "currency" = 'BRL';
ALTER TABLE "transactions" ALTER COLUMN "currency" SET DEFAULT 'BRL';
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_brl_currency" CHECK ("currency" = 'BRL');
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "transactions_supplier_id_idx" ON "transactions"("supplier_id");

COMMIT;
