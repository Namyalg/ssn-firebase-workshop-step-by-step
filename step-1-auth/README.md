# Step 1: Authentication

## What You'll Learn

In this step, we set up **Firebase Authentication** with Google Sign-in and create user profiles with anonymous IDs.

## Firebase Concepts Covered

| Concept | Code | File |
|---------|------|------|
| Google Sign-in | `signInWithPopup(auth, googleProvider)` | AuthContext.tsx |
| Auth State Listener | `onAuthStateChanged(auth, callback)` | AuthContext.tsx |
| Sign Out | `signOut(auth)` | AuthContext.tsx |
| Create Document | `setDoc(doc(db, "users", id), data)` | AuthContext.tsx |
| Read Document | `getDoc(doc(db, "users", id))` | AuthContext.tsx |

## Key Files

```
src/
├── lib/
│   ├── firebase.ts      # Firebase initialization (Auth + Firestore)
│   └── anonId.ts        # Anonymous ID generator ("CuriousPanda_42")
├── contexts/
│   └── AuthContext.tsx  # Auth state management
└── app/
    ├── page.tsx         # Login page
    └── chats/page.tsx   # Welcome page after login
```

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Firebase credentials:**
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your Firebase project credentials.

3. **Deploy Firestore rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

## What to Demo

1. Click "Sign in with Google"
2. Complete the Google OAuth flow
3. Notice your anonymous ID in the navbar (e.g., "CuriousPanda_42")
4. Check Firestore console - see your user document created
5. Click "Sign Out" and sign back in - same anonymous ID persists

## Next Step

In **step-2-firestore**, we'll add the ability to post and view questions.
