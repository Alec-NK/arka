# Components

Shared UI uses customized [shadcn/ui](https://ui.shadcn.com) source components backed by Radix and styled with Tailwind v4.

- `ui/`: shadcn primitives. Import named components directly; no barrels.
- Shared compositions (`guarded-dialog`, `date-picker`, `field-select`, `notice`) express reusable UI behavior without knowing routes, DTOs, or products.
- Product layout and supplier selection live in `views/_components/`. Single-page compositions stay beside their page.

`components.json` configures the registry and `@/` aliases. `utils/cn.ts` merges Tailwind classes. Use `pnpm dlx shadcn@latest add <component>` only after reviewing its generated changes: registry updates must not overwrite Arka's customized defaults or global theme.

## Preserve the design

`src/index.css` is the token source. Keep the existing colors, Inter font, spacing/radius scales, focus outline, shadows, and reduced-motion behavior. Semantic shadcn color aliases point to those tokens. In this app `text-muted` is the existing text color, so use `bg-canvas` for muted surfaces; never redefine `--color-muted` as a surface.

Buttons default to Arka's `secondary` variant. Standard controls are 46px tall, standard buttons have a 44px minimum height, and the login field stays 48px. `plain` buttons preserve bespoke layout/actions while sharing the primitive and composition API. Cards, tables and skeletons intentionally omit shadcn's stock padding, hover colors, and pulse animation. Layout remains Tailwind-based rather than adopting stock sidebar or dashboard templates.

## Behavior contracts

- `Dialog` handles dirty/busy dismissal and restores focus; its primitives handle portals, focus trapping and scroll locking. `ConfirmationDialog` stays controlled during asynchronous actions and failures.
- `FieldSelect` takes string values/options and emits the original domain value. Empty optional choices use a private UI sentinel; required choices use an empty placeholder and form validation.
- `DatePicker` takes/emits a date-only `YYYY-MM-DD` string (or an empty value), with Brazilian text entry and a localized calendar. Never serialize calendar choices through UTC `toISOString()`.
- Supplier selection uses server-side filtering with `Command shouldFilter={false}`, stable IDs, pagination and guarded inline creation.
- `Notice` adapts existing message/dismiss state to a single bottom-center Sonner notification. Page timers preserve the existing seven-second lifetime.

Run `pnpm test`, `pnpm lint`, `pnpm build`, and `pnpm test:e2e` after changing component behavior. Visual snapshots were captured before the migration and must not be updated merely to accept a regression.
