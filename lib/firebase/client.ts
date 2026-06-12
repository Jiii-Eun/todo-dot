import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

function hasPlaceholder(value: string): boolean {
  return (
    value.length === 0 ||
    value.includes('your-') ||
    value === 'your-api-key' ||
    value === 'your-project-id'
  );
}

export const isFirebaseConfigured =
  !hasPlaceholder(firebaseConfig.apiKey) &&
  !hasPlaceholder(firebaseConfig.projectId) &&
  !hasPlaceholder(firebaseConfig.appId);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirestoreDb(): Firestore | null {
  if (!isFirebaseConfigured) return null;
  if (!db) {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;
    db = getFirestore(firebaseApp);
  }
  return db;
}

export const COLLECTIONS = {
  USERS: 'users',
  TODOS: 'todos',
  REPEAT_RULES: 'todo_repeat_rules',
} as const;
