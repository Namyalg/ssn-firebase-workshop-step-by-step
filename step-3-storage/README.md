# Step 3: Cloud Storage - Image Uploads

## What's New in This Step

Building on step-2-firestore, we now add the ability to **upload images** with questions using Firebase Cloud Storage.

## Firebase Concepts Covered

| Concept | Code | File |
|---------|------|------|
| Storage Reference | `ref(storage, "path/to/file")` | chats/page.tsx |
| Upload File | `uploadBytes(imageRef, file)` | chats/page.tsx |
| Get Download URL | `getDownloadURL(imageRef)` | chats/page.tsx |

## What Changed from Step 2

| File | Change |
|------|--------|
| `src/lib/firebase.ts` | Added `getStorage` and `storage` export |
| `storage.rules` | NEW: Storage security rules |
| `src/app/chats/page.tsx` | Added image upload UI and logic |

## Key Code Snippets

### Initialize Storage
```typescript
import { getStorage } from "firebase/storage";
export const storage = getStorage(app);
```

### Upload Image
```typescript
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const imageRef = ref(storage, `conversations/${Date.now()}_${file.name}`);
await uploadBytes(imageRef, file);
const imageUrl = await getDownloadURL(imageRef);
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
2. Click "+ Ask a Question"
3. Fill in a question
4. Click "Click to upload an image" and select an image
5. See the image preview appear
6. Click "Post Question"
7. See the question with image in the list
8. Check Firebase Storage console - see the uploaded file

## Next Step

In **step-4-realtime**, we'll add upvoting with real-time updates across browsers.
