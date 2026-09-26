-- Empty descriptions are allowed; the API normalizes omitted descriptions to an empty string.
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_description_nonblank";
