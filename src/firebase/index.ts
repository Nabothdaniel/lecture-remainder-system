import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ─────────────────────────────
// ✅ Required Environment Variables
// ─────────────────────────────
const requiredEnvVars = [
  "VITE_API_KEY",
  "VITE_AUTH_DOMAIN",
  "VITE_PROJECT_ID",
  "VITE_STORAGE_BUCKET",
  "VITE_MESSAGING_SENDER_ID",
  "VITE_APP_ID",
] as const;

type EnvVar = (typeof requiredEnvVars)[number];

// Check for missing env vars
const missingVars = requiredEnvVars.filter((key) => !import.meta.env[key]);
if (missingVars.length > 0) {
  console.error(`❌ Missing environment variables: ${missingVars.join(", ")}`);
  throw new Error("Missing Firebase environment variables.");
}

// ─────────────────────────────
// ✅ Firebase Config
// ─────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

// ─────────────────────────────
// ✅ Primary App (Main Project Instance)
// ─────────────────────────────
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// ─────────────────────────────
// ✅ Secondary Auth Instance (For account creation)
// ─────────────────────────────
let secondaryAuth;
try {
  const secondaryApp =
    getApps().find((a) => a.name === "Secondary") ||
    initializeApp(firebaseConfig, "Secondary");

  secondaryAuth = getAuth(secondaryApp);
} catch (err) {
  console.error("⚠️ Failed to initialize secondary auth:", err);
  secondaryAuth = auth; // fallback to main auth (safe default)
}

export { secondaryAuth };

export default app;
