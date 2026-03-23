# Regatta Paddlers Feature

This module contains the paddler list workflow for regatta setup.

## Structure

- `PaddlerListPage.tsx` — page container and orchestration
- `components/AddPaddlerModal.tsx` — add paddler dialog
- `components/ClubPaddlersModal.tsx` — club paddler selection dialog
- `types.ts` — paddler-focused local types
- `index.ts` — feature export

## Import Guideline

Use feature-level imports from consumers:

```ts
import { PaddlerListPage } from "../features/regatta";
```

This feature is now the canonical source for paddler setup pages.
