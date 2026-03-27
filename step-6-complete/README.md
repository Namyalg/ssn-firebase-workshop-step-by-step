# Step 6: Remote Config for AI Model Selection

## What's New in This Step

Building on step-5-ai, we now add **Firebase Remote Config** to dynamically configure which AI model the Vibe Check feature uses - without redeploying the app.

## Firebase Concepts Covered

| Concept | Code | File |
|---------|------|------|
| Initialize Remote Config | `getRemoteConfig(app)` | lib/firebase.ts |
| Fetch & Activate | `fetchAndActivate(remoteConfig)` | lib/firebase.ts |
| Get Value | `getValue(remoteConfig, "ai_model")` | lib/firebase.ts |
| Default Config | `remoteConfig.defaultConfig = { ... }` | lib/firebase.ts |

## What Changed from Step 5

| File | Change |
|------|--------|
| `src/lib/firebase.ts` | Added Remote Config, `getConfiguredModel()` function |
| `src/app/chats/page.tsx` | Uses dynamic model, displays model name in results |

## Key Code Snippets

### Initialize Remote Config
```typescript
import { getRemoteConfig, fetchAndActivate, getValue } from "firebase/remote-config";

export const remoteConfig = typeof window !== "undefined" ? getRemoteConfig(app) : null;

if (remoteConfig) {
  remoteConfig.settings.minimumFetchIntervalMillis = 0; // For development
  remoteConfig.defaultConfig = {
    ai_model: "gemini-2.0-flash",
    vibe_prompt: "Analyze the vibe of these questions...",
  };
}
```

### Get Config from Remote Config
```typescript
export const getAIConfig = async () => {
  if (!remoteConfig) return { model: geminiModel, prompt: DEFAULT_PROMPT };

  await fetchAndActivate(remoteConfig);
  const modelName = getValue(remoteConfig, "ai_model").asString();
  const prompt = getValue(remoteConfig, "vibe_prompt").asString();

  return {
    model: getGenerativeModel(ai, { model: modelName }),
    prompt,
  };
};
```

### Use Dynamic Model and Prompt
```typescript
const handleVibeCheck = async () => {
  const { model, prompt } = await getAIConfig();
  const fullPrompt = `${prompt}\n\nQuestions:\n- ${questions}`;
  const result = await model.generateContent(fullPrompt);
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

4. **Set up Remote Config:**
   - Go to Firebase Console > Remote Config
   - Create parameter `ai_model` with value `gemini-2.0-flash`
   - Create parameter `vibe_prompt` with your custom prompt
   - Publish the changes

5. **Deploy rules:**
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

## What to Demo

1. Sign in with Google and create some questions
2. Click **"Vibe Check"** - note the model name shown in results
3. Go to Firebase Console > Remote Config
4. Change `ai_model` to a different model (e.g., `gemini-1.5-pro`)
5. Change `vibe_prompt` to something fun (e.g., "Respond like a pirate analyzing these questions!")
6. Click **Publish changes**
7. Back in the app, click **"Vibe Check"** again
8. The new model and prompt take effect - **no app redeploy needed!**

This demonstrates Remote Config's power: change app behavior instantly from the Firebase Console without pushing new code.

## Workshop Complete!

Congratulations! You've built a full-featured app using:
- **Authentication** - Google Sign-in
- **Firestore** - Storing users and conversations
- **Storage** - Image uploads
- **Real-time Updates** - Live upvote syncing
- **AI Logic** - Generative AI integration
- **Remote Config** - Dynamic configuration
