-- Persist each user's chosen theme on their profiles row so it follows them
-- across devices. Client storage (cookie/localStorage/SecureStore) remains the
-- instant first-paint fast path; this column is the cross-device source of truth.

-- ─── Add theme to profiles ────────────────────────────────────────────────
-- Nullable, no default: null = "no DB preference yet, use the client default".
-- Existing RLS (profiles_select_self / profiles_update_self, scoped on
-- user_id = auth.uid()) already covers this column — no new policy needed.

alter table public.profiles
  add column if not exists theme text
  check (theme is null or theme in ('aurora', 'daylight', 'superchore', 'neon'));
