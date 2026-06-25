import { WebInput } from "@hiro/ui-primitives/web";

const noop = () => {};
const wrap = { maxWidth: 320 } as const;

export const Default = () => (
  <div style={wrap}>
    <WebInput label="Chore name" value="Take out recycling" placeholder="e.g. Water the plants" onChangeText={noop} />
  </div>
);

export const Focused = () => (
  <div style={wrap}>
    <WebInput label="Household name" value="The Riverside Flat" forceFocused onChangeText={noop} />
  </div>
);

export const ErrorState = () => (
  <div style={wrap}>
    <WebInput label="Email" value="not-an-email" state="error" helperText="Enter a valid email address" onChangeText={noop} />
  </div>
);

export const SuccessState = () => (
  <div style={wrap}>
    <WebInput label="Invite code" value="HIRO-4821" state="success" helperText="Code accepted" onChangeText={noop} />
  </div>
);

export const Disabled = () => (
  <div style={wrap}>
    <WebInput label="Owner" value="Alex (you)" state="disabled" onChangeText={noop} />
  </div>
);
