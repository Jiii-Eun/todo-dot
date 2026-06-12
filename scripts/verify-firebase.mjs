import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

const envText = readFileSync('.env', 'utf8');
const env = Object.fromEntries(
  envText
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    })
);

const config = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('프로젝트 ID:', config.projectId ?? '(없음)');
console.log('환경 변수 6개:', Object.values(config).every(Boolean) ? 'OK' : '누락');

const app = initializeApp(config);
const db = getFirestore(app);
const ref = doc(db, '_connection_test', 'ping');

try {
  await setDoc(ref, { ok: true, at: new Date().toISOString() });
  const snap = await getDoc(ref);
  await deleteDoc(ref);
  console.log('Firestore 읽기/쓰기:', snap.exists() ? '성공' : '실패');
} catch (err) {
  console.error('Firestore 연결 실패:', err.code ?? err.message);
  process.exit(1);
}
