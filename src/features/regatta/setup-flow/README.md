# Regatta Setup Flow Module

This module defines the route/page boundary for regatta setup flow screens.

## Exports

- `RaceAgeCategoryPage`
- `RaceTypePage`
- `RaceDistancePage`
- `RaceBoatSizePage`
- `SetupBoardPage`

## Import Guideline

Consume setup flow pages from the regatta feature boundary:

```ts
import {
  RaceAgeCategoryPage,
  RaceTypePage,
  RaceDistancePage,
  RaceBoatSizePage,
  SetupBoardPage,
} from "../features/regatta";
```

Avoid deep imports from `pages/wizard/*` in route composition files.
