# Shared Widgets

This folder contains shared widget barrels for reusable display and selection widgets.

## Structure

- `headers/`
  - header-oriented widgets
- `labels/`
  - label/presentation widgets
- `lists/`
  - list and selection widgets
- `index.ts`
  - public shared widgets barrel

## Guideline

Import widgets through the shared barrel:

```ts
import { HeaderButtonsWidget, LabelWidget, ListWidget } from "../shared";
```
