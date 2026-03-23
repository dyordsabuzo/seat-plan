# Frontend Architecture

This project is organized by **feature/domain first**, with `shared` for reusable UI/building blocks.

## Folder Responsibilities

- `features/`
  - Domain modules (business-aligned): `regatta`, `clubs`, `boat`
  - Each feature should expose a clear `index.ts` public API.
  - Feature consumers should import from feature barrels, not deep file paths.

- `shared/`
  - Reusable cross-feature UI/layout/forms/modals/widgets
  - Provides stable imports via:
    - `shared/ui`
    - `shared/modals`
    - `shared/widgets`
    - `shared/layout`
    - `shared/forms`
    - `shared/index.ts` (combined)

- `pages/`
  - Route-level composition only (minimal business logic)
  - Prefer wiring feature components and shared UI here.

- `context/`, `hooks/`, `utils/`, `types/`, `enums/`, `common/`
  - App-wide platform/supporting layers.

- `legacy/`
  - Isolated legacy/experimental code (`legacy/refactor`, `legacy/board`).
  - Avoid adding new production code here.
  - Migrate references to `features/*` and `shared/*` when touching related code.
  - Active app routes and primary UI should not import from `legacy/*`.

## Import Guidelines

Prefer:

```ts
import { RaceBoard, PaddlersPanel } from "../features/regatta";
import { Container, Tabs, ConfirmModal } from "../shared";
```

Avoid:

```ts
import Container from "../components/basic/Container";
import RacesPanel from "../components/complex/RacesPanel";
```

## Practical Rule

When adding code:

1. Put domain logic/UI in a `features/<domain>` module.
2. Put reusable generic UI in `shared`.
3. Keep `pages` thin and orchestration-focused.
4. Export through `index.ts` barrels to keep imports readable and consistent.
5. Treat `legacy/*` as archive code only, not an extension point for new work.
