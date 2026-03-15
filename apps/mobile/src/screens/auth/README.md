# screens/auth

Mobile auth UI. Single `AuthScreen` component manages sign-in / sign-up / forgot-password views via local state (no navigation stack dependency).

**Owner:** mobile app layer
**Rendered by:** `RootNavigator` when session is absent

Auth logic lives in `src/lib/authService.ts`.