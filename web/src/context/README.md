# context

Zustand stores for cross-cutting identity: auth session, organization, active product.

Must not live here:

- Feature or UI state. Use local state or the page's `_context/`.
- State shared by several pages. That goes in `views/_context/`.
