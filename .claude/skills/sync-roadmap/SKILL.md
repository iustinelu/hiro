---
name: sync-roadmap
description: Regenerate docs/roadmap.md from Linear — fetches all Hiro tickets, builds the Epic→Story→Impl hierarchy, computes per-epic progress, and writes a versioned progress map.
---

# Sync Roadmap

Regenerate `docs/roadmap.md` from Linear. Follow every step exactly, in order.

---

## Step 1 — Fetch all Linear issues

Call `mcp__linear-server__list_issues` with:

```json
{ "limit": 250, "includeArchived": true }
```

The result will be large. The MCP tool will save it to a temp file and return the path. Note that path — you will need it in Step 2.

---

## Step 2 — Parse the issue list with Python

Run the following Python script via `Bash`, substituting `<RESULT_FILE>` with the actual file path returned in Step 1. If Step 1 returned the data inline (not a file), write the JSON to `/tmp/linear_issues.json` first, then run the script against that path.

```bash
python3 - <<'PYEOF'
import json, sys, re

with open("<RESULT_FILE>") as f:
    raw = f.read()

# The MCP result is a JSON array of [{type, text}] objects — extract inner JSON
try:
    wrapper = json.loads(raw)
    if isinstance(wrapper, list) and wrapper and "text" in wrapper[0]:
        raw = wrapper[0]["text"]
except Exception:
    pass

try:
    data = json.loads(raw)
except Exception:
    m = re.search(r'\[[\s\S]*\]', raw)
    if m:
        data = json.loads(m.group(0))
    else:
        print("ERROR: could not parse JSON", file=sys.stderr)
        sys.exit(1)

# Normalise: data may be {"issues": [...]} or a bare list
if isinstance(data, dict) and "issues" in data:
    issues = data["issues"]
elif isinstance(data, list):
    issues = data
else:
    print("ERROR: unexpected shape", file=sys.stderr)
    sys.exit(1)

# NOTE: the `id` field IS the HIR-N identifier (e.g. "HIR-36")
# `status` is a plain string ("Done", "Backlog", "Todo", "In Progress")
# `parentId` is the HIR-N identifier of the parent issue

def hir_num(issue):
    m = re.search(r'HIR-(\d+)', issue.get("id", ""))
    return int(m.group(1)) if m else 0

# Exclude onboarding noise (HIR-1 through HIR-4)
issues = [i for i in issues if hir_num(i) >= 5]

STATUS_ICON = {
    "done": "✅",
    "completed": "✅",
    "in progress": "🔄",
    "todo": "📝",
    "backlog": "⏳",
    "cancelled": "🚫",
    "canceled": "🚫",
}

def icon(issue):
    s = (issue.get("status") or "backlog").lower()
    for k, v in STATUS_ICON.items():
        if k in s:
            return v
    return "⏳"

def is_done(issue):
    s = (issue.get("status") or "").lower()
    return "done" in s or "completed" in s

def is_active(issue):
    s = (issue.get("status") or "").lower()
    return "in progress" in s or "todo" in s

# Build id→issue map (keyed by HIR-N identifier)
by_id = {i["id"]: i for i in issues}

# Classify issues into epics, stories, impl by title prefix
def classify(issue):
    t = issue.get("title", "")
    if re.match(r'^E\d+\s', t) or re.match(r'^E\d+\s*[–-]', t):
        return "epic"
    if re.match(r'^S\d+\.\d+\s', t) or re.match(r'^S\d+\.\d+\s*[–-]', t):
        return "story"
    if re.match(r'^I\d+\s', t) or re.match(r'^I\d+\s*[–-]', t):
        return "impl"
    return "other"

epics  = [i for i in issues if classify(i) == "epic"]
stories = [i for i in issues if classify(i) == "story"]
impls  = [i for i in issues if classify(i) == "impl"]
others = [i for i in issues if classify(i) == "other"]

# Sort epics by E-number
def epic_num(issue):
    m = re.search(r'E(\d+)', issue.get("title",""))
    return int(m.group(1)) if m else 99

epics.sort(key=epic_num)

# Map story→its epic parent
def parent_id(issue):
    return issue.get("parentId")

story_to_epic = {}
for s in stories:
    pid = parent_id(s)
    if pid and pid in by_id:
        story_to_epic[s["id"]] = pid

impl_to_story = {}
for i in impls:
    pid = parent_id(i)
    if pid and pid in by_id:
        impl_to_story[i["id"]] = pid

# Per-epic impl counts
epic_impls = {e["id"]: [] for e in epics}
for impl in impls:
    sid = impl_to_story.get(impl["id"])
    if sid:
        eid = story_to_epic.get(sid)
    else:
        # impl may be directly under epic
        pid = parent_id(impl)
        eid = pid if pid in epic_impls else None
    if eid and eid in epic_impls:
        epic_impls[eid].append(impl)

# Total impl counts (for overall bar)
total_impl = len(impls)
done_impl  = sum(1 for i in impls if is_done(i))

def progress_bar(done, total, width=8):
    if total == 0:
        return "`░░░░░░░░ 0%`"
    pct = done / total
    filled = round(pct * width)
    bar = "█" * filled + "░" * (width - filled)
    return f"`{bar} {round(pct*100)}%`"

def issue_url(issue):
    return issue.get("url", f"https://linear.app/issue/{issue.get('id','?')}")

def md_link(issue):
    ident = issue.get("id", "?")
    url   = issue_url(issue)
    return f"[{ident}]({url})"

# "Now" section: impl tickets that are Todo or In Progress
now_tickets = [i for i in impls if is_active(i)]
# Sort by identifier number
now_tickets.sort(key=hir_num)

# Current epic: first epic that has active impl tickets
current_epic_title = "–"
for e in epics:
    eimpls = epic_impls.get(e["id"], [])
    if any(is_active(i) for i in eimpls):
        current_epic_title = e.get("title", "?")
        break
# If none active, find first with any todo/backlog impl
if current_epic_title == "–":
    for e in epics:
        eimpls = epic_impls.get(e["id"], [])
        if eimpls and not all(is_done(i) for i in eimpls):
            current_epic_title = e.get("title", "?")
            break

# ── Build output ──────────────────────────────────────────────
lines = []
from datetime import date
today = date.today().isoformat()

lines.append("# Hiro MVP Roadmap")
lines.append("")
lines.append(f"> Last synced: {today} · {done_impl}/{total_impl} impl tickets done")
lines.append("")
lines.append("## Overall Progress")
lines.append(progress_bar(done_impl, total_impl))
lines.append("")

# Now section
lines.append(f"## 📍 Now — {current_epic_title}")
if now_tickets:
    lines.append("| ID | Title | Status |")
    lines.append("|----|-------|--------|")
    for t in now_tickets:
        lines.append(f"| {md_link(t)} | {t.get('title','')} | {icon(t)} {(t.get('state',{}).get('name') or t.get('status','?'))} |")
else:
    lines.append("_No active implementation tickets — check backlog below._")
lines.append("")

# Epic progress table
lines.append("## 🗺️ Epic Progress")
lines.append("| Epic | Title | Progress | Done | Status |")
lines.append("|------|-------|----------|------|--------|")
for e in epics:
    eimpls = epic_impls.get(e["id"], [])
    e_done  = sum(1 for i in eimpls if is_done(i))
    e_total = len(eimpls)
    bar = progress_bar(e_done, e_total)
    # Epic status: done if all impls done AND epic itself done, else derive from impls
    if e_total == 0:
        e_status = icon(e)
    elif e_done == e_total:
        e_status = "✅"
    elif any(is_active(i) for i in eimpls):
        e_status = "🔄"
    else:
        e_status = "⏳"
    m = re.match(r'E(\d+)\s*[–-]\s*(.*)', e.get("title",""))
    epic_label = f"E{m.group(1)}" if m else e.get("identifier","?")
    epic_name  = m.group(2).strip() if m else e.get("title","?")
    lines.append(f"| {epic_label} | {epic_name} | {bar} | {e_done}/{e_total} | {e_status} |")
lines.append("")

# Full ticket tree (collapsible)
lines.append("## 📋 Full Ticket Tree")
lines.append("")

# Story map: story_id → list of impls
story_impls = {}
for impl in impls:
    sid = impl_to_story.get(impl["id"])
    if sid:
        story_impls.setdefault(sid, []).append(impl)

# Other tickets (no epic/story parent classification)
for e in epics:
    eimpls = epic_impls.get(e["id"], [])
    e_done  = sum(1 for i in eimpls if is_done(i))
    e_total = len(eimpls)
    done_marker = " ✅" if e_total > 0 and e_done == e_total else ""
    lines.append(f"<details><summary>{md_link(e)} – {e.get('title','')}{done_marker}</summary>")
    lines.append("")

    # Stories under this epic
    e_stories = [s for s in stories if story_to_epic.get(s["id"]) == e["id"]]
    e_stories.sort(key=lambda s: s.get("title",""))

    for s in e_stories:
        s_impls = story_impls.get(s["id"], [])
        s_impls.sort(key=hir_num)
        s_done = sum(1 for i in s_impls if is_done(i))
        s_marker = " ✅" if s_impls and s_done == len(s_impls) else ""
        lines.append(f"**{md_link(s)} – {s.get('title','')}**{s_marker}")
        lines.append("")
        if s_impls:
            lines.append("| ID | Title | Status |")
            lines.append("|----|-------|--------|")
            for impl in s_impls:
                lines.append(f"| {md_link(impl)} | {impl.get('title','')} | {icon(impl)} {(impl.get('state',{}).get('name') or impl.get('status','?'))} |")
            lines.append("")
        else:
            lines.append("_No implementation tickets yet._")
            lines.append("")

    # Impl tickets directly under this epic (no story parent)
    direct_impls = [i for i in eimpls if impl_to_story.get(i["id"]) not in [s["id"] for s in e_stories]]
    if direct_impls:
        direct_impls.sort(key=hir_num)
        lines.append("**Directly under epic:**")
        lines.append("")
        lines.append("| ID | Title | Status |")
        lines.append("|----|-------|--------|")
        for impl in direct_impls:
            lines.append(f"| {md_link(impl)} | {impl.get('title','')} | {icon(impl)} {(impl.get('state',{}).get('name') or impl.get('status','?'))} |")
        lines.append("")

    lines.append("</details>")
    lines.append("")

# Hotfix / unclassified tickets
unclassified = [i for i in others if hir_num(i) >= 5]
if unclassified:
    unclassified.sort(key=hir_num)
    lines.append("<details><summary>🔧 Hotfix / Unclassified</summary>")
    lines.append("")
    lines.append("| ID | Title | Status |")
    lines.append("|----|-------|--------|")
    for t in unclassified:
        lines.append(f"| {md_link(t)} | {t.get('title','')} | {icon(t)} {(t.get('state',{}).get('name') or t.get('status','?'))} |")
    lines.append("")
    lines.append("</details>")
    lines.append("")

print("\n".join(lines))
PYEOF
```

Capture the output and proceed to Step 3.

---

## Step 3 — Write `docs/roadmap.md`

Write the Python output to `docs/roadmap.md` using the `Write` tool (overwrite if it exists).

---

## Step 4 — Confirm

Print a one-line confirmation:

```
✅ docs/roadmap.md updated — N/M impl tickets done as of YYYY-MM-DD
```

Where N and M come from the script output's "Last synced" line.

---

## Notes

- **Idempotent**: running twice overwrites cleanly with current Linear state.
- **Exclusions**: HIR-1–HIR-4 (Linear onboarding) are skipped automatically.
- **Large response handling**: if `list_issues` returns data that exceeds the inline token limit, the MCP framework saves it to a temp file — the file path will appear in the tool result. Always use the file path, not inline JSON.
- **No code changes**: this skill only reads Linear and writes one markdown file.
