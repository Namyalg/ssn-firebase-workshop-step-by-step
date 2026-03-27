# Step 2: Firestore - Posting & Reading Questions

## What's New in This Step

Building on step-1-auth, we now add the ability to **post questions** and **view all questions** using Firestore.

## Firebase Concepts Covered

| Concept | Code | File |
|---------|------|------|
| Create Document | `addDoc(collection(db, "conversations"), data)` | chats/page.tsx |
| Read Collection | `getDocs(query(...))` | chats/page.tsx |
| Query with Ordering | `query(collection, orderBy("createdAt", "desc"))` | chats/page.tsx |
| Server Timestamp | `serverTimestamp()` | chats/page.tsx |

## What Changed from Step 1

| File | Change |
|------|--------|
| `firestore.rules` | Added conversations collection rules |
| `src/app/chats/page.tsx` | Full conversations page with form |

## Key Code Snippets

### Creating a Question
```typescript
await addDoc(collection(db, "conversations"), {
  question: newQuestion.trim(),
  description: newDescription.trim(),
  authorAnonId: userProfile.anonymousId,
  authorUID: user?.uid,
  createdAt: serverTimestamp(),
});
```

### Reading Questions
```typescript
const q = query(
  collection(db, "conversations"),
  orderBy("createdAt", "desc")
);
const snapshot = await getDocs(q);
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

3. **Deploy Firestore rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## What to Demo

1. Sign in with Google
2. Click "+ Ask a Question"
3. Fill in a question and description
4. Click "Post Question"
5. See the question appear in the list
6. Check Firestore console - see the conversation document
7. Refresh the page - questions persist

## Next Step

In **step-3-storage**, we'll add the ability to upload images with questions.
