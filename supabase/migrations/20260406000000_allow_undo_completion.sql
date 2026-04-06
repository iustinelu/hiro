-- HIR-39: allow undo of recent task completions
--
-- Users can delete only their own completions, and only within 5 minutes.
-- After that window, the ledger is immutable.

create policy task_completions_delete_own_recent
on public.task_completions for delete
using (
  completed_by_profile_id = public.current_profile_id()
  and completed_at > now() - interval '5 minutes'
);
