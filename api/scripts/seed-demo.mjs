import { existsSync } from 'node:fs';
import pg from 'pg';
if (existsSync('.env')) process.loadEnvFile('.env');
if (process.env.NODE_ENV === 'production') throw new Error('Demo data cannot be seeded in production');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query('BEGIN');
  const userId = '20000000-0000-4000-8000-000000000001';
  const existingUser = (await client.query('SELECT deleted_at FROM users WHERE id = $1', [userId])).rows[0];
  if (existingUser?.deleted_at) throw new Error('The demo user is archived; rebuild the disposable database before seeding');
  if (!existingUser) await client.query(`INSERT INTO users (id, email, name, updated_at) VALUES ($1, 'alex@example.test', 'Alex', NOW())`, [userId]);
  const types = (await client.query('SELECT id, code, deleted_at FROM transactions_type')).rows;
  const rows = [
    ['2025-05-30', 'Venda para ACME Corp', 'sale', '5200.00', 'INV-1024', 'Venda realizada em maio.'],
    ['2025-05-28', 'Aluguel do escritório — maio de 2025', 'expense', '2400.00', null, null],
    ['2025-05-27', 'Assinatura de software — Notion', 'expense', '120.00', null, null],
    ['2025-05-26', 'Mercadorias para revenda — Distribuidora Alfa', 'purchase', '1500.00', 'NF-1024', null],
    ['2025-05-23', 'Venda para Bright Solutions', 'sale', '3840.00', 'INV-1023', null],
    ['2025-05-21', 'Material de escritório — Staples', 'expense', '85.60', null, null],
    ['2025-05-20', 'Conta de luz — Eletricidade', 'expense', '110.20', null, null],
    ['2025-05-19', 'Reposição de estoque — Atacado Central', 'purchase', '250.00', 'NF-1023', null],
  ];
  for (const [index, [date, description, code, amount, reference, notes]] of rows.entries()) {
    const id = `30000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
    const type = types.find(type => type.code === code);
    if (!type || type.deleted_at) throw new Error(`The ${code} transaction type is missing or archived; rebuild the disposable database before seeding`);
    const existingTransaction = (await client.query('SELECT deleted_at FROM transactions WHERE id = $1', [id])).rows[0];
    if (existingTransaction?.deleted_at) throw new Error(`The demo transaction ${id} is archived; rebuild the disposable database before seeding`);
    if (!existingTransaction) await client.query(`INSERT INTO transactions (id, user_id, transaction_type_id, amount, transaction_date, description, reference, notes, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`, [id, userId, type.id, amount, date, description, reference, notes]);
  }
  await client.query('COMMIT');
  console.log('Demo records ready. Sign in at /login with alex@example.test. Open /transactions?from=2025-05-01&to=2025-05-31&selected=30000000-0000-4000-8000-000000000001');
} catch (error) { await client.query('ROLLBACK'); throw error; }
finally { await client.end(); }
