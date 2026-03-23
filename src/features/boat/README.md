# Boat Feature Module

This folder is the domain boundary for boat layout/balance functionality.

## Structure

- `components/`
  - `BoatStructure.tsx` (entry component export)
  - `BoatLayoutPanel.tsx`
  - `BoatStatisticsPanel.tsx`
  - `ReserveSlideOutPanel.tsx`
- `utils/`
  - `boatStructure.ts` (shared helpers for seat-item synchronization and row mapping)
- `index.ts`
  - barrel exports for feature consumers

## Import Guideline

Prefer importing from the feature barrel:

```ts
import { BoatStructure } from "../features/boat";
```

instead of deep `components/boat/*` paths.

## Goal

- Keep boat logic and UI discoverable in one domain
- Reduce duplicate helper logic
- Improve dependency tracing and maintenance
