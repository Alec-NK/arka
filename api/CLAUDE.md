# Arka API

NestJS 12 · Prisma 7 · PostgreSQL 17 · pnpm 11 · TypeScript strict · native ES modules.

Read this before changing anything under `api/`. `src/modules/users/` is the reference
implementation of every layer: copy its shape for new modules.

## Commands

| Task | Command |
| --- | --- |
| Run everything (database + API with hot reload) | `docker compose up` |
| Run the API on the host against the compose database | `pnpm start:dev` |
| Change the schema | edit `prisma/schema.prisma`, then `pnpm prisma migrate dev --name <change>` (database must be up) |
| Regenerate the Prisma client only | `pnpm prisma generate` |
| Compile / lint / format | `pnpm build` / `pnpm lint` / `pnpm format` |
| Unit tests | `pnpm test` |

Routes live under `/api/v1/<resource>`. Health is `/health`. Swagger UI is `/docs`, the
OpenAPI document is `/docs-json`. The container applies migrations with `prisma migrate deploy`
on every start; `migrate dev` is only ever run from the host.

## Architecture: modular monolith

One application, one feature module per domain concept, three fixed layers inside each module.
The request flow is always:

```
HTTP -> controller -> service -> repository -> PrismaService
        DTO in        entity      entity        Prisma types
        DTO out
```

Never skip a layer. Never call a layer from the wrong direction.

### Layout

```
src/
  main.ts                 bootstrap: shutdown hooks, setupApp(), Swagger, listen
  app.setup.ts            HTTP conventions shared by main.ts (prefix, versioning)
  app.module.ts           ConfigModule, global pipe/filters/interceptor, feature modules
  config/                 env validation (class-validator) and registerAs() namespaces
  common/                 framework-level, cross-cutting, zero business rules
    dto/                  PaginationQueryDto, PaginationMetaDto
    filters/              AllExceptionsFilter + buildErrorResponse()
    interceptors/         LoggingInterceptor
    utils/                pure helpers (pagination)
    decorators/ guards/ pipes/   create when the first one is needed
  infra/                  everything that talks to the outside world
    prisma/               PrismaModule, PrismaService, PrismaExceptionFilter
    events/               WebSocket gateway / event bus (when needed)
  modules/
    health/               /health probe (version neutral, outside the prefix)
    users/                REFERENCE MODULE
      users.module.ts
      users.controller.ts
      users.service.ts
      users.repository.ts
      users.service.spec.ts
      dto/                create-user.dto.ts, update-user.dto.ts, user-response.dto.ts
      entities/           user.entity.ts (domain types + service inputs)
      mappers/            user.mapper.ts (pure functions)
  generated/prisma/       Prisma client output, gitignored, produced by `prisma generate`
prisma/
  schema.prisma, migrations/
```

### What goes where

| Layer | Lives here | Must not live here |
| --- | --- | --- |
| `*.controller.ts` | Routes, `@Body`/`@Query`/`@Param` DTOs, one service call per handler, mapping entity to response DTO. | Business rules, Prisma, try/catch of domain errors, `process.env`. |
| `*.service.ts` | Use cases and business rules. Orchestrates repositories. Throws Nest exceptions (`NotFoundException`, `ForbiddenException`). Returns entities. | HTTP types (`Request`, DTOs), Prisma calls, response formatting. |
| `*.repository.ts` | The only place that injects `PrismaService`. Methods named in domain terms (`findByEmail`). Returns entities through a mapper. | Business rules, HTTP exceptions, mapping to DTOs. |
| `dto/` | `class-validator` classes for requests. Explicit response DTO classes. snake_case fields. | Being imported by a service or repository. |
| `entities/` | Domain types the module reasons about, plus `Create…Input` / `Update…Input` for services. camelCase. | Prisma generated types, API field names. |
| `mappers/` | Pure functions: Prisma row to entity, entity to response DTO, request DTO to service input. | Side effects, injection, business rules. |
| `common/` | Guards, filters, interceptors, pipes, decorators, shared DTOs used by two or more modules. | Anything that knows a specific entity. |
| `infra/` | Prisma, WebSocket, mail, storage, external HTTP clients. | Business rules. |
| `config/` | `EnvironmentVariables` (validation) and `registerAs` namespaces. | Anything else. No `process.env` outside this folder. |

### Rules

1. **Prisma stays in `infra/` and repositories.** Types from `src/generated/prisma` may be imported only by `*.repository.ts`, `mappers/`, and `infra/prisma/`. Everything else uses entities.
2. **Modules depend on services, never on repositories.** Module A imports `BModule` and injects `BService`. `exports: [XService]` only. If two modules need each other, extract a third or use events.
3. **Requests are validated globally.** `ValidationPipe` runs with `whitelist`, `forbidNonWhitelisted`, `transform` and implicit conversion. Every body and query has a DTO class. Unknown fields are a 400.
4. **Errors have one shape.** `{ status_code, error, message, path, timestamp }`, built by `buildErrorResponse()`. `AllExceptionsFilter` handles `HttpException` and unknown errors. `PrismaExceptionFilter` maps `P2002` to 409, `P2025` to 404, `P2003` to 400. Rely on database constraints for uniqueness; do not pre-check in the service. Nest evaluates global filters from the last registered to the first, so in `app.module.ts` the Prisma filter must stay registered after the catch-all.
5. **Config is validated at boot.** New variable: add it to `EnvironmentVariables` in `config/env.validation.ts` and to a `registerAs` namespace. Inject with `@Inject(xConfig.KEY) cfg: ConfigType<typeof xConfig>`.
6. **No `index.ts` barrels.** Import files directly. Barrels plus Nest DI cause circular import failures.
7. **Tests follow the layers.** Services get `*.spec.ts` next to them, with the repository replaced through `{ provide: XRepository, useValue: mock }`. Mappers are pure and trivial to test. Keep tests isolated from the database and external services through focused mocks.
8. **Health is the only route outside `/api/v1`.** Everything else is versioned. Register new global behaviour in `app.setup.ts` so application entry points stay consistent.
9. **No comments in code.** Source files (`src/`, `prisma/schema.prisma`, `prisma.config.ts`, `vitest.config.ts`) contain no `//` or `/* */` comments, including JSDoc. Express intent with names, types and small functions. Knowledge a comment would carry belongs in this file or in `README.md`. When touching a file that still has comments, remove them. Generated files (`src/generated/`, `prisma/migrations/`) and infrastructure files (`Dockerfile`, `compose.yaml`, `docker/`, `.env*`) are outside this rule.

### Conventions

- **ES modules.** Relative imports end with `.js` even though the files are `.ts`. Top-level `await` is allowed.
- **`import type`** for anything used only as a type. Regular imports for what Nest needs at runtime: injected providers and the DTO classes used in `@Body()` / `@Query()`. Mixing these up breaks dependency injection or validation silently.
- **Naming.** kebab-case files with the Nest suffix (`users.repository.ts`). Module folder and route are plural (`users`), entity is singular (`User`). Mapper functions are `toXEntity`, `toXResponse`, `toCreateXInput`.
- **JSON contract is snake_case.** DTO fields are `created_at`, query params are `page_size`. Entities and code are camelCase. The mapper is the only place that converts. Dates are ISO-8601 strings in responses.
- **Pagination.** `?page=&page_size=` (defaults 1 and 20, max 100) in, `{ data, meta: { page, page_size, total, total_pages } }` out. Controllers turn the query DTO into `OffsetPagination` with `toOffsetPagination()` before calling the service.
- **Booleans in query strings** need `@Transform`, because implicit conversion turns the string `"false"` into `true`.
- **Swagger** comes from the `@nestjs/swagger` CLI plugin (see `nest-cli.json`): DTO classes and their `class-validator` decorators become schemas. Add `@ApiTags('<resource>')` on controllers. Do not hand-write `@ApiProperty`; if a field needs a description, use `@ApiProperty({ description })` on that field only.
- **Prisma schema.** Tables `@@map("snake_case_plural")`, columns `@map("snake_case")`, ids `String @id @default(uuid())`, always `createdAt` and `updatedAt`. After editing: `pnpm prisma migrate dev --name <change>`, commit the migration folder.
- **Formatting.** Prettier (`pnpm format`) and oxlint (`pnpm lint`) must pass before finishing a change. Check that no comments were introduced: `grep -rnE '^\s*(//|/\*)' --include='*.ts' src | grep -v src/generated` must print nothing.

### Adding a module

1. `mkdir -p src/modules/<name>/{dto,entities,mappers}` (or `pnpm nest g module modules/<name>` and add the folders).
2. Model in `prisma/schema.prisma`, then `pnpm prisma migrate dev --name add_<name>`.
3. `entities/<name>.entity.ts`: the entity and `Create<Name>Input` / `Update<Name>Input`.
4. `dto/`: `create-<name>.dto.ts`, `update-<name>.dto.ts` (`PartialType` from `@nestjs/swagger`), `<name>-response.dto.ts`.
5. `mappers/<name>.mapper.ts`.
6. `<name>.repository.ts`, `<name>.service.ts`, `<name>.controller.ts`, `<name>.module.ts` (export the service).
7. Register the module in `app.module.ts`.
8. `<name>.service.spec.ts` beside the service.
9. `pnpm format && pnpm lint && pnpm build && pnpm test`.

## Tooling notes

- pnpm 11 reads build-script approvals from `pnpm-workspace.yaml` (`allowBuilds`), not from `package.json`. A new dependency with a build script must be added there or `pnpm install` fails.
- `prisma` and `@prisma/client` must stay on the same version. The `latest` npm tag of `prisma` currently points at an 8.0 release candidate; stay on 7.x until 8 is stable.
- `prisma` is a runtime dependency on purpose: the containers run `prisma migrate deploy` at start.
- `.env` is for the host and is gitignored. Inside compose the API receives its environment from `compose.yaml`.
