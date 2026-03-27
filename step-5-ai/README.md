# Step 5: AI-Powered Vibe Check

## What's New in This Step

Building on step-4-realtime, we now add **Firebase AI Logic** to analyze the mood of all questions with a "Vibe Check" button.

## Firebase Concepts Covered

| Concept | Code | File |
|---------|------|------|
| Initialize AI | `getAI(app)` | lib/firebase.ts |
| Get Generative Model | `getGenerativeModel(ai, { model: "gemini-2.0-flash" })` | lib/firebase.ts |
| Generate Content | `geminiModel.generateContent(prompt)` | chats/page.tsx |

## What Changed from Step 4

| File | Change |
|------|--------|
| `src/lib/firebase.ts` | Added AI imports and geminiModel export |
| `src/app/chats/page.tsx` | Added Vibe Check button and AI analysis |

## Key Code Snippets

### Initialize AI Model
```typescript
import { getAI, getGenerativeModel } from "firebase/ai";

const ai = getAI(app);
export const geminiModel = getGenerativeModel(ai, { model: "gemini-3.0-flash-preview" });
```

### Generate AI Content
```typescript
const handleVibeCheck = async () => {
  const questions = conversations.map((c) => c.question).join("\n- ");
  const prompt = `Analyze the vibe of these questions...`;

  const result = await geminiModel.generateContent(prompt);
  setVibeResult(result.response.text());
};
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

3. **Enable Firebase AI Logic:**
   - Go to Firebase Console > AI Logic
   - Enable the API for your project

4. **Deploy rules:**
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## What to Demo

1. Sign in with Google
2. Create a few questions with different tones (curious, frustrated, excited)
3. Click the **"Vibe Check"** button
4. Watch as AI analyzes all questions and summarizes the overall mood
5. Add more questions and run Vibe Check again to see the analysis change

This demonstrates Firebase AI Logic - integrating generative AI directly into your Firebase app without managing separate API keys.

## Next Step

In **step-6-complete**, we'll add Remote Config to let users choose between different AI models.
