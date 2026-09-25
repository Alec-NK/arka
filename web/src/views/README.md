# Views

All pages live in `views/<PageName>/` and default-export a lazy-loaded page. Page-specific components, helpers, assets, and state live alongside the page in `_components/`, `_utils/`, `_assets/`, and `_context/`. Shared product layout and navigation live in `views/_components/`. Generic reused components belong in `components/`. Style pages and components with Tailwind utility classes; shared design tokens live in `src/index.css`. Routes and guards stay in their own layers. Do not create frontend modules or features folders.
