# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Development commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## UI and browser tests

The app uses locally owned shadcn/ui components with Arka's existing Tailwind tokens. See [component conventions](src/components/README.md) before adding or updating primitives.

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Playwright starts Vite automatically and intercepts API requests with deterministic fixtures. Tests do not require or modify a database. The E2E suite covers validation, keyboard controls, nested overlays, draft/conflict recovery, responsive layouts and API payloads. Reports are written to the ignored `playwright-report/` and `test-results/` directories.

Visual comparisons run separately with `pnpm test:visual`. Snapshot images are local-only and ignored by Git. The existing local baselines were captured on macOS Chromium before the migration and cover Login, Transactions, Suppliers and supplier forms at 390, 1100 and 1440 pixels. On a fresh checkout, establish local baselines with `pnpm test:visual --update-snapshots` before making further UI changes, then compare with the same platform/browser. Do not regenerate baselines merely to accept an unexplained visual regression.
