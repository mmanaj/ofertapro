// ─── Firebase configuration ───────────────────────────────────────────────────
// Replace these placeholder values with your actual Firebase project config.
// How to get it:
//   1. Go to https://console.firebase.google.com
//   2. Create (or select) your project
//   3. Project Settings → General → Your apps → Add app → Web
//   4. Copy the firebaseConfig object below
//
// After filling in, also:
//   - Enable Authentication → Google provider
//   - (v1.1) Enable Firestore Database in test mode

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore'; // ← uncomment in v1.1

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'WSTAW_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'WSTAW_AUTH_DOMAIN',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'WSTAW_PROJECT_ID',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'WSTAW_STORAGE_BUCKET',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? 'WSTAW_SENDER_ID',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? 'WSTAW_APP_ID',
};

// Prevent re-initialization on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
// export const db = getFirestore(app); // ← uncomment in v1.1

export default app;
