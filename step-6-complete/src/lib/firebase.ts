import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAI, getGenerativeModel } from "firebase/ai";
import { getRemoteConfig, fetchAndActivate, getValue } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firebase AI Logic
const ai = getAI(app);

// Default model (fallback)
export const geminiModel = getGenerativeModel(ai, { model: "gemini-2.0-flash" });

// Remote Config (client-side only)
export const remoteConfig = typeof window !== "undefined" ? getRemoteConfig(app) : null;

const DEFAULT_PROMPT = "Analyze the vibe of these anonymous questions from students. Give a brief, fun summary (2-3 sentences) of the overall mood and themes. Be encouraging!";

if (remoteConfig) {
  remoteConfig.settings.minimumFetchIntervalMillis = 0; // For development - fetch every time
  remoteConfig.defaultConfig = {
    ai_model: "gemini-3-flash-preview",
    vibe_prompt: DEFAULT_PROMPT,
  };
}

// Get AI config (model + prompt) from Remote Config
export const getAIConfig = async () => {
  if (!remoteConfig) {
    return {
      model: geminiModel,
      prompt: DEFAULT_PROMPT,
    };
  }

  await fetchAndActivate(remoteConfig);
  const modelName = getValue(remoteConfig, "ai_model").asString() || "gemini-2.0-flash";
  const prompt = getValue(remoteConfig, "vibe_prompt").asString() || DEFAULT_PROMPT;

  return {
    model: getGenerativeModel(ai, { model: modelName }),
    prompt,
  };
};

export default app;
