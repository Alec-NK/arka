UPDATE "transactions_type"
SET "name" = CASE "code"
  WHEN 'sale' THEN 'Venda'
  WHEN 'purchase' THEN 'Compra'
  WHEN 'expense' THEN 'Despesa'
  ELSE "name"
END,
"updated_at" = CURRENT_TIMESTAMP
WHERE "code" IN ('sale', 'purchase', 'expense');
