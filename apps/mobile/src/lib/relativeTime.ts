// Small, pure time formatters shared by the Tasks board and detail sheet.

/** Compact "just now / 5m ago / 3h ago / 2d ago" label for a past ISO timestamp. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Whole hours remaining until a future ISO timestamp (clamped at 0). */
export function hoursUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 3600000));
}
