# infra

Everything that talks to the outside world. Nothing outside `infra/` may import a DTO.

| Folder | Holds | Must not hold |
| --- | --- | --- |
| `services/` | `XService extends BaseService`, private constructor, static `getInstance()` singleton, public async methods with DTOs in and out. Kebab-case files, exported from `index.ts` (required barrel). | Business rules, mapping, React. |
| `dto/` | Raw API shapes. | Anything imported outside `infra/`. |
| `mappers/` | Pure functions DTO -> domain type and domain type -> payload. | Side effects. |
| `events/` | WebSocket connection, subscriptions, event type definitions. | Feature handlers (those subscribe from hooks). |

Services own axios. They receive and return DTOs and do nothing else.
Mappers are the only bridge between `infra/dto/` and `src/types/`.
