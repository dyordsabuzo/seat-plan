# Shared Modals

This folder contains shared modal barrels for reusable dialog components.

## Structure

- `dialogs/`
  - confirmation and creation dialogs
- `exports/`
  - export-focused modal flows
- `index.ts`
  - public shared modals barrel

## Guideline

Import modals through the shared barrel:

```ts
import { ConfirmModal, CreateRegattaModal, ExportRacesModal } from "../shared";
```
