ClubsStorage and `useClubs` integration
=====================================

Overview
--------
This project includes a lightweight Firestore-backed storage utility at `src/utils/ClubsStorage.ts` and a React hook `useClubs` at `src/hooks/useClubs.ts`.

Behavior
--------
- When a user is authenticated (via `AuthContext`), `useClubs` subscribes to the Firestore collection `users/{uid}/clubs` and performs per-operation upserts/deletes so updates are written back to Firestore.
- When no user is present, `useClubs` falls back to `localStorage` (key `clubs`) and persists changes there.

Security & Rules
----------------
Add Firestore rules so that users can only read/write their own clubs, e.g.:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/clubs/{clubId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Usage
-----
Use the `useClubs` hook inside components that are descendants of `AuthProvider`.

Example:

```tsx
import useClubs from '../hooks/useClubs'

function Page() {
  const { clubs, createClub, addPaddler } = useClubs()
  // ...
}
```

Notes
-----
- When switching from anonymous/local usage to an authenticated session, `useClubs` does not automatically merge existing localStorage clubs into Firestore. If you want that behavior, add a migration step that reads `localStorage` and writes to Firestore after sign-in.
- Firestore methods assume correct Firebase initialization in `src/firebase.ts` and that the user is authenticated.
