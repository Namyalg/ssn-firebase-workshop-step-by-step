# Step 4: Real-time Updates - Upvoting

## What's New in This Step

Building on step-3-storage, we now add **upvoting with real-time updates** using Firestore's `onSnapshot` listener.

## Firebase Concepts Covered

| Concept | Code | File |
|---------|------|------|
| Real-time Listener | `onSnapshot(query, callback)` | chats/page.tsx |
| Update Document | `updateDoc(docRef, data)` | chats/page.tsx |
| Array Union | `arrayUnion(value)` | chats/page.tsx |
| Array Remove | `arrayRemove(value)` | chats/page.tsx |

## What Changed from Step 3

| File | Change |
|------|--------|
| `firestore.rules` | Added `allow update` for conversations |
| `src/app/chats/page.tsx` | Added upvote button, onSnapshot listener |

## Key Code Snippets

### Real-time Listener
```typescript
const unsubscribe = onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "modified") {
      // Update local state with new upvote counts
    }
  });
});

return () => unsubscribe(); // Cleanup on unmount
```

### Upvote with Array Operations
```typescript
// Add upvote
await updateDoc(convoRef, {
  upvotes: convo.upvotes + 1,
  upvotedBy: arrayUnion(user.uid),
});

// Remove upvote
await updateDoc(convoRef, {
  upvotes: convo.upvotes - 1,
  upvotedBy: arrayRemove(user.uid),
});
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
   Edit `.env.local` with your Firebase project credentials.

3. **Deploy rules:**
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## What to Demo

1. Sign in with Google
2. Open the app in **two browser tabs** (or two different browsers)
3. In tab 1, click the upvote arrow on a question
4. Watch tab 2 - the upvote count updates **instantly without refresh**
5. Click again to remove your upvote - both tabs sync in real-time

This demonstrates Firebase's real-time capabilities - changes sync across all connected clients automatically.

## Next Step

In **step-5-ai**, we'll add an AI-powered "Vibe Check" feature using Firebase AI Logic.
