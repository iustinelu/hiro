# HIR-44 + HIR-45: Budget & Shared Expenses — Design Spec

**Date:** 2026-04-11
**Tickets:** HIR-44 (expense schema + add flow), HIR-45 (monthly summaries + charts)
**Branch:** `hir-44/budget-expenses`

## Purpose

Fast, practical household expense tracking. Members log shared expenses, see who paid what, and navigate monthly summaries. Optimized for quick entry — most sessions are "add an expense and go."

## Schema

### `expenses`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| household_id | uuid FK → households | on delete cascade |
| title | text not null | expense description |
| amount | numeric(10,2) not null | check > 0 |
| date | date not null | when expense occurred |
| payer_profile_id | uuid FK → profiles | who paid |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

RLS: All CRUD scoped to `current_household_ids()`. Any household member can log expenses for any payer.

### `expense_participants`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| expense_id | uuid FK → expenses | on delete cascade |
| profile_id | uuid FK → profiles | on delete restrict |
| share | numeric(10,2) not null | check > 0 |
| created_at | timestamptz | default now() |

RLS: SELECT/INSERT scoped via expense → household membership.

### `create_expense` RPC

SECURITY DEFINER. Validates caller + payer + participants are household members. Creates expense + splits amount equally (with remainder cent to first participant). Returns `{ expense_id }`.

### Indexes

- `(household_id, date DESC)` on expenses
- `(expense_id)` on expense_participants

## Domain Types

```typescript
interface Expense {
  id: Uuid;
  householdId: Uuid;
  title: string;
  amount: number;
  date: string;
  payerProfileId: Uuid;
  payerDisplayName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseParticipant {
  profileId: Uuid;
  displayName: string | null;
  share: number;
}

interface MonthlyBreakdown {
  month: string;
  totalAmount: number;
  expenseCount: number;
  byPayer: Array<{ profileId: Uuid; displayName: string | null; totalPaid: number }>;
}
```

## Service Layer: `expenseService.ts`

- `createExpense(householdId, title, amount, date, payerProfileId, participantIds)` → RPC call
- `getMonthExpenses(householdId, year, month)` → expense list with payer names
- `getMonthlyBreakdown(householdId, year, month)` → aggregated totals + per-payer
- `deleteExpense(expenseId)` → cascade deletes participants

## UI Structure

### Components

1. `page.tsx` — server component (auth guard)
2. `BudgetDashboard.tsx` — orchestrator with month navigation state
3. `ExpenseAddModal.tsx` — form: title, amount, date, payer chips, participant chips
4. `MonthSummary.tsx` — 2 KPI tiles + per-payer horizontal bars
5. `ExpenseList.tsx` — month's expenses with delete action
6. `budget.module.css` — styles

### UX Decisions

- Default payer = current user
- Default participants = all household members (equal split)
- No custom split amounts for MVP
- No edit — delete and re-create
- Currency: `$` prefix, 2 decimals
- Month navigation: prev/next buttons

## Verification

1. `npm run check` passes
2. Add expense with multiple participants → appears in list with correct amount
3. Delete expense → removed from list
4. Month navigation shows correct totals
5. Per-payer breakdown bars are proportional
6. Empty month shows friendly message
7. Denial tests: anon cannot read/write expenses
