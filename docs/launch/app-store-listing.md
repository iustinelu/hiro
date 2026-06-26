# App Store / Play listing copy — Hiro: Household Hero

Copy-paste source for App Store Connect + Google Play. Grounded in the actual feature set
(tasks → points → progress/leaderboard → rewards, shared budget/expense splitting, households).
Character limits noted per field; counts verified for the Apple limits.

---

## App name
`Hiro: Household Hero`  *(already set; 20/30 chars)*

## Subtitle  *(Apple, ≤30 chars)*
`Chores, points & shared bills`  *(29)*

Alternates:
- `Turn chores into a team game`  *(28)*
- `The household chore game`  *(24)*

## Promotional Text  *(Apple, ≤170 chars — editable anytime without review)*
```
Make housework feel less like a chore. Assign tasks, earn points, split the bills, and cash in rewards — together. Your household, finally on the same page.
```
*(155 chars)*

## Keywords  *(Apple, ≤100 chars, comma-separated, NO spaces between words)*
```
chore,chores,household,family,roommate,tasks,cleaning,points,rewards,budget,expenses,split,allowance,chart
```
*(≈99 chars — verify counter in App Store Connect; trim "chart" or "allowance" if it's over)*
> Don't repeat words already in the app name/subtitle ("hero", "bills") — Apple indexes those
> separately, so spend keyword space on new terms.

## Description  *(Apple ≤4000; Play "Full description" ≤4000)*
```
Hiro turns the endless to-do list of running a home into something your whole household actually wants to play.

Assign the chores, earn points for getting them done, climb the leaderboard, and trade your points for real rewards. Whether it's a family with kids, a couple, or a flat full of roommates, Hiro keeps everyone on the same page — and makes pulling your weight feel good.

WHY HOUSEHOLDS LOVE HIRO

• Shared tasks, zero nagging
Set up recurring chores — daily, weekly, or your own custom schedule. Everyone sees what's theirs and what's done, so the mental load stops landing on one person.

• Points that make it a game
Every completed task earns points. Watch the leaderboard, track your streaks, and see exactly who's carrying the team this week.

• Rewards worth playing for
Spend earned points on rewards your household sets together — screen time, a night off dishes, allowance, a treat. You decide what's worth it.

• Split the bills, fairly
Log shared expenses, split them across the household, and see a clean monthly breakdown. Supports EUR, GBP, RON, and USD.

• Made for your people
Invite your household with a simple link. Everyone gets their own profile — and their own look, with personal color themes so the app feels like theirs.

Hiro is the household hero your home has been waiting for. Set it up once, and let the game run.
```

## What's New  *(for v1.0)*
```
Welcome to Hiro 1.0! Assign chores, earn points, split shared bills, and redeem rewards — all in one place for your whole household. We'd love your feedback.
```

---

## Google Play extra fields
- **Short description** *(≤80 chars)*: `Turn household chores into a game — tasks, points, rewards & shared bills.` *(73)*
- **Category**: Lifestyle (alt: Productivity)
- **Content rating**: complete the IARC questionnaire — no objectionable content → expect "Everyone".

---

## URLs (both stores require)
- **Support URL**: needed — e.g. the deployed web app `/support` page or a simple mailto/contact page.
- **Marketing URL** *(optional, Apple)*: the Vercel web app URL once live.
- **Privacy Policy URL**: **REQUIRED by both stores.** Must be live before submission. Host on the
  web app (e.g. `/privacy`) — see the App Privacy section below for what it must disclose.

---

## App Privacy answers (Apple "App Privacy" + Play "Data safety")

What Hiro actually collects (via Supabase auth + the `profiles`/`households`/tasks/expenses/rewards
tables). **No analytics SDK, no ads SDK, no third-party trackers are installed**, so the answer to
"used for tracking" is **No** across the board.

| Data type | Collected? | Linked to user? | Purpose | Used to track? |
|---|---|---|---|---|
| Email address | Yes | Yes | App Functionality (account/auth) | No |
| Name / display name | Yes | Yes | App Functionality (profile, household) | No |
| User Content (tasks, expenses, rewards, activity) | Yes | Yes | App Functionality | No |
| User ID (identifier) | Yes | Yes | App Functionality | No |
| Purchases / payment info | No | — | — | — |
| Location | No | — | — | — |
| Contacts | No | — | — | — |
| Usage data / analytics | No | — | — | — |

- **Data is NOT used to track users across other apps/websites.**
- **Data is NOT shared with third parties** beyond the hosting processor (Supabase) acting on your
  behalf — that's "collected", not "shared", in Apple's terms.
- Account deletion: Apple requires apps with account creation to offer in-app account deletion.
  ⚠️ **Open item** — confirm Hiro has an in-app "delete account" path, or add one before review
  (common rejection reason).

### Privacy policy must state (minimum)
Who you are; what's collected (email, name, household/task/expense content); why (to run the app);
that it's stored via Supabase (EU region); that users can request deletion; a contact email.
