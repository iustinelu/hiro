export type FeedbackState = "loading" | "empty" | "error";

export interface StateMessage {
  title: string;
  description?: string;
  retryLabel?: string;
}

export const defaultStateMessages: Record<FeedbackState, StateMessage> = {
  loading: { title: "Loading..." },
  empty: { title: "Nothing here yet", description: "Add your first item to get started." },
  error: { title: "Something went wrong", description: "Please try again.", retryLabel: "Retry" }
};
