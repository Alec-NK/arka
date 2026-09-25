# hooks

react-query hooks, one folder per entity, one file per operation.

```
hooks/
  <entity>/
    index.ts            # required barrel
    useGetEntity.ts
    useGetEntityList.ts # lists end in `List`
    useCreateEntity.ts
```

Rules:

- Name: `use + Method + Entity` (`useGetFileList`, `useCreateSession`).
- Types: `interface …Params`, `type …Result`.
- Query keys come from `QUERY_KEYS`.
- A hook calls a service from `infra/services/`, passes the result through a mapper and returns domain types from `src/types/`. It never returns a DTO.

Must not live here: UI logic, axios calls, DTO types.
