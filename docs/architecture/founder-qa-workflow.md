# Founder QA Workflow

1. Complete ticket scope and acceptance criteria.
2. Complete the architecture compliance checklist in both ticket and PR.
3. Pause at founder QA stop-point.
4. Founder runs manual QA steps from the ticket.
5. Capture QA result in the ticket/PR discussion.
6. Only then move status to `Done` and close the PR.

## Mandatory Rule

Do not mark implementation tickets as `Done` before founder QA sign-off.

## Emergency Bypass

Emergency bypass is allowed only for production-critical unblockers and requires:

1. Explicit risk statement in PR description.
2. Linked cleanup ticket ID created before merge.
3. Temporary deviation noted in ticket and PR templates.
