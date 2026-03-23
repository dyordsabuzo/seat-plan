# Shared UI

This folder contains reusable UI primitives that support route pages and features.

## Structure

- `actions/`
  - action buttons and links
- `cards/`
  - compact dashboard/stat cards
- `lists/`
  - selectable sidebar/list items
- `index.ts`
  - public shared UI barrel

## Guideline

Import from the barrel when consuming shared UI:

```ts
import { ActionButton, SummaryCard, SelectableSidebarItem } from "../shared";
```
