# Arka API

NestJS + Prisma + PostgreSQL, run with Docker. Architecture and coding rules live in [CLAUDE.md](./CLAUDE.md).

## Run everything

```bash
docker compose up
```

This starts PostgreSQL, waits until it is healthy, then starts the API container, which:

1. installs dependencies (only if the lockfile changed),
2. generates the Prisma client,
3. applies pending migrations (`prisma migrate deploy`),
4. starts NestJS in watch mode. Edits under `src/` reload automatically.

On a new database, run `pnpm seed:demo` from this directory after the containers are
healthy to create the demo user and reference transactions. The frontend selects a user
by email at `/login`; the demo account is `alex@example.test`.

| What | URL |
| --- | --- |
| API | http://localhost:3000/api/v1 |
| Users (reference module) | http://localhost:3000/api/v1/users |
| Health | http://localhost:3000/health |
| Swagger UI / OpenAPI | http://localhost:3000/docs / http://localhost:3000/docs-json |
| PostgreSQL | localhost:5446, user `arka`, password `arka`, database `arka` |

Ports and credentials can be changed in `.env` (copy from `.env.example`).

## Currency and suppliers

Transactions use BRL exclusively. Amounts remain decimal strings with two decimal
places in API payloads, for example `"1234.56"`; the frontend displays `R$ 1.234,56`.
The BRL migration relabels existing USD records without converting or changing their
numeric amounts. Deploy the migration with the updated API and frontend together.

The transaction types are `sale` (Venda), `purchase` (Compra), and `expense`
(Despesa). A sale adds to the balance. A purchase of inventory for resale and an
operating expense both subtract from it. The transaction list summary returns
`sales`, `purchases`, `expenses`, and `net`, with `net = sales - purchases - expenses`.
Every application table ends with `created_at`, `updated_at`, and `deleted_at` in
that order.

Suppliers are private to the authenticated user and store a name. Use
`GET /api/v1/suppliers` with `search`, `page`, and `page_size` to list them,
`GET /api/v1/suppliers/:id` to read one, `POST /api/v1/suppliers` with `{ "name": "Fornecedor" }`
to create one, and `PATCH /api/v1/suppliers/:id` with `name` and the current `version`
to rename one. Stale updates return 409. There is no supplier deletion endpoint.

Transaction create and update payloads accept an optional `supplier_id`. Omitting
it on update preserves the existing association; passing `null` removes it. Only
suppliers owned by the current user can be linked. Responses include `supplier_id`
and `supplier: { id, name }`, or `null` when unlinked. Renaming a supplier changes
the displayed name on all its linked transactions.

On the frontend, the sidebar links to `/suppliers`, where suppliers are created
and edited. Transaction forms select existing suppliers and link to that page.

## Development user context

`POST /api/v1/session` accepts `{ "email": "alex@example.test" }` and returns the
matching user when it exists. Subsequent requests send that user's ID in the
`X-User-Id` header. This is a development context selector only: it does not issue
password credentials or JWTs, and production rejects the selector.

## Database changes

Edit `prisma/schema.prisma`, then create a migration from the host while the database is up:

```bash
pnpm prisma migrate dev --name <describe-change>
```

The container applies committed migrations on every start.

## Development commands

```bash
pnpm install          # install deps locally (IDE support and host-side tooling)
pnpm start:dev        # run the API on the host against the Docker database
pnpm build            # compile to dist/
pnpm lint             # oxlint
pnpm format           # prettier
pnpm test             # unit tests (vitest)
```

## Production image

```bash
docker build --target production -t arka-api .
```

The production image runs `prisma migrate deploy` and then `node dist/main` as the non-root `node` user.
