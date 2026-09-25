-- CreateTable
CREATE TABLE "transactions_type" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "transactions_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "transaction_type_id" TEXT NOT NULL,
    "amount" DECIMAL(19,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "transaction_date" DATE NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "reference" VARCHAR(120),
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "supplier_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_type_code_key" ON "transactions_type"("code");
CREATE INDEX "transactions_type_active_code_idx" ON "transactions_type" ("code" ASC, "id" ASC) WHERE "deleted_at" IS NULL;

-- CreateIndex
CREATE INDEX "transactions_transaction_type_id_idx" ON "transactions"("transaction_type_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_transaction_type_id_fkey" FOREIGN KEY ("transaction_type_id") REFERENCES "transactions_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_positive_amount" CHECK ("amount" > 0);
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_positive_version" CHECK ("version" > 0);
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_description_nonblank" CHECK (length(trim("description")) > 0);
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_usd_currency" CHECK ("currency" = 'USD');
ALTER TABLE "transactions_type" ADD CONSTRAINT "transactions_type_nonblank" CHECK (length(trim("code")) > 0 AND length(trim("name")) > 0);
ALTER TABLE "transactions_type" ADD CONSTRAINT "transactions_type_allowed_code" CHECK ("code" IN ('sale', 'purchase', 'expense'));
CREATE INDEX "transactions_active_date_idx" ON "transactions" ("user_id", "transaction_date" DESC, "id" DESC) WHERE "deleted_at" IS NULL;
CREATE INDEX "transactions_active_type_date_idx" ON "transactions" ("user_id", "transaction_type_id", "transaction_date" DESC, "id" DESC) WHERE "deleted_at" IS NULL;
INSERT INTO "transactions_type" ("id", "code", "name", "updated_at") VALUES
('10000000-0000-4000-8000-000000000004', 'sale', 'Sale', CURRENT_TIMESTAMP),
('10000000-0000-4000-8000-000000000005', 'purchase', 'Purchase', CURRENT_TIMESTAMP),
('10000000-0000-4000-8000-000000000002', 'expense', 'Expense', CURRENT_TIMESTAMP);

CREATE TRIGGER transactions_type_no_hard_delete
BEFORE DELETE ON "transactions_type"
FOR EACH ROW EXECUTE FUNCTION reject_hard_delete();

CREATE TRIGGER transactions_type_no_truncate
BEFORE TRUNCATE ON "transactions_type"
FOR EACH STATEMENT EXECUTE FUNCTION reject_hard_delete();

CREATE TRIGGER transactions_no_hard_delete
BEFORE DELETE ON "transactions"
FOR EACH ROW EXECUTE FUNCTION reject_hard_delete();

CREATE TRIGGER transactions_no_truncate
BEFORE TRUNCATE ON "transactions"
FOR EACH STATEMENT EXECUTE FUNCTION reject_hard_delete();

GRANT SELECT, INSERT, UPDATE ON "transactions_type" TO arka_app;
GRANT SELECT, INSERT, UPDATE ON "transactions" TO arka_app;
