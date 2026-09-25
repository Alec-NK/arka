# Arka

Monorepo with two independent pnpm 11 projects. There is no root `package.json`: run commands inside each folder.

| Folder | Stack | Conventions |
| --- | --- | --- |
| `web/` | React 19, TypeScript, Vite 8, Tailwind CSS 4 | `web/src/<layer>/README.md` describes what each layer may and may not contain |
| `api/` | NestJS 12, Prisma 7, PostgreSQL 17, Docker Compose | `api/CLAUDE.md`, read it before touching the API |

## Shared contract

- The API speaks snake_case JSON under `/api/v1`. The web keeps raw API shapes in `web/src/infra/dto/` and converts them to camelCase domain types in `web/src/infra/mappers/`. Nothing outside `infra/` on either side sees the other side's field names.
- OpenAPI for the API is served at `http://localhost:3000/docs-json` while it runs.

## Start

```bash
cd api && docker compose up     # PostgreSQL + API with hot reload, migrations applied
cd web && pnpm dev              # frontend
```
