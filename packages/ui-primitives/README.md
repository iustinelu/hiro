# packages/ui-primitives Ownership

- Purpose: Reusable UI primitives and feedback components.
- Prefer parity across web and mobile where possible.

## Exports

- Shared types/states: `@hiro/ui-primitives`
- Web primitives: `@hiro/ui-primitives/web`
- Mobile primitives: `@hiro/ui-primitives/mobile`

## Primitive API Summary

- `Button`: variants `primary | secondary | ghost | danger`, sizes `sm | md | lg`.
- `Input`: state `default | success | error | disabled` with helper text support.
- `Card`: tone `default | accent | warning`.
- `ListRow`: density `comfortable | compact`, long-text truncation support.
- `ModalSheet`: open/close, title/description, primary/secondary actions.
- `ChartContainer`: standard card-like wrapper for chart surfaces.
- `LoadingState` / `EmptyState` / `ErrorState`: reusable async states.

## Usage Examples

### Web

```tsx
import { WebButton, WebCard, WebLoadingState } from "@hiro/ui-primitives/web";

<WebCard title="Tasks">
  <WebButton label="Add Task" />
  <WebLoadingState />
</WebCard>;
```

### Mobile

```tsx
import { MobileButton, MobileCard, MobileLoadingState } from "@hiro/ui-primitives/mobile";

<MobileCard title="Tasks">
  <MobileButton label="Add Task" />
  <MobileLoadingState />
</MobileCard>;
```
