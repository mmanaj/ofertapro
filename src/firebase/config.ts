// ─── Firebase configuration ───────────────────────────────────────────────────
// Uzupełnij zmienne w .env.local (skopiuj z .env.local.example).
// Jak zdobyć wartości:
//   1. https://console.firebase.google.com → wybierz projekt
//   2. Project Settings → General → Your apps → Add app → Web
//   3. Skopiuj firebaseConfig
//   4. Authentication → Sign-in method → Google → włącz
//      → Web client ID skopiuj do EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID

import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getFirestore } from 'firebase/firestore'; // ← uncomment in v1.1

const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY            ?? 'WSTAW_API_KEY',
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? 'WSTAW_AUTH_DOMAIN',
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID         ?? 'WSTAW_PROJECT_ID',
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? 'WSTAW_STORAGE_BUCKET',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? 'WSTAW_SENDER_ID',
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID             ?? 'WSTAW_APP_ID',
};

// Prevent re-initialization on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// initializeAuth (z AsyncStorage) musi być wywołane tylko raz.
// Przy hot-reload initializeAuth rzuci błąd – łapiemy go i wracamy do getAuth().
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}
export { auth };

// export const db = getFirestore(app); // ← uncomment in v1.1

export default app;
