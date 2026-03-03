# Founder QA Workflow

1. Complete ticket scope and acceptance criteria.
2. Complete the architecture compliance checklist in both ticket and PR.
3. Prepare a Founder QA Quick Cycle:
   - exact commands,
   - exact route/screen/flow to open,
   - what to look for,
   - explicit pass/fail criteria.
4. Pause at founder QA stop-point.
5. Founder runs the provided quick cycle steps.
6. Capture QA result in the ticket/PR discussion.
7. Only then move status to `Done` and close the PR.

## Mandatory Rule

Do not mark implementation tickets as `Done` before founder QA sign-off.
Every implementation handoff must include the Founder QA Quick Cycle block.

## Emergency Bypass

Emergency bypass is allowed only for production-critical unblockers and requires:

1. Explicit risk statement in PR description.
2. Linked cleanup ticket ID created before merge.
3. Temporary deviation noted in ticket and PR templates.
