# components

Components reused by two or more pages, features or modules, sorted by atomic level.

| Folder | Holds |
| --- | --- |
| `atom/` | Smallest building blocks: button, input, badge. |
| `molecule/` | Small compositions of atoms: form field, search bar. |
| `organism/` | Larger self-contained sections: header, data table, side panel. |

Rules:

- Props-only, generic names.
- Nothing here knows a route, a product or a DTO.
- Single-use components stay next to their page in `views/<Page>/_components/`.
- Style components with Tailwind utility classes. Shared design tokens live in `src/index.css`.
- No barrels (`index.ts`) in components.
