import type { FeedbackState } from "./types";

export interface StateMessage {
  title: string;
  description?: string;
  retryLabel?: string;
}

export const defaultStateMessages: Record<FeedbackState, StateMessage> = {
  loading: { title: "Loading...", description: "Just a moment while we gather your updates." },
  empty: {
    title: "Nothing here yet",
    description: "Add your first item to bring this area to life."
  },
  error: {
    title: "Something went wrong",
    description: "Please retry. If this keeps happening, refresh the page.",
    retryLabel: "Retry"
  }
};
