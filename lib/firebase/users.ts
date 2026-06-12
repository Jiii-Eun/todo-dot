import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { COLLECTIONS, getFirestoreDb, isFirebaseConfigured } from '@/lib/firebase/client';
import type { User } from '@/types/user';

interface UserDocument {
  nickname: string;
  tag: number;
  createdAt: string;
}

function mapUser(id: string, data: UserDocument): User {
  return {
    id,
    nickname: data.nickname,
    tag: data.tag,
    createdAt: data.createdAt,
  };
}

export async function syncUserToServer(user: User): Promise<void> {
  if (!isFirebaseConfigured) return;
  const db = getFirestoreDb();
  if (!db) return;

  const payload: UserDocument = {
    nickname: user.nickname,
    tag: user.tag,
    createdAt: user.createdAt,
  };

  await setDoc(doc(db, COLLECTIONS.USERS, user.id), payload, { merge: true });
}

export async function deleteUserFromServer(userId: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  const db = getFirestoreDb();
  if (!db) return;

  const todosQuery = query(collection(db, COLLECTIONS.TODOS), where('userId', '==', userId));
  const rulesQuery = query(
    collection(db, COLLECTIONS.REPEAT_RULES),
    where('userId', '==', userId),
  );

  const [todoSnapshot, ruleSnapshot] = await Promise.all([
    getDocs(todosQuery),
    getDocs(rulesQuery),
  ]);

  await Promise.all([
    ...todoSnapshot.docs.map((snapshot) => deleteDoc(snapshot.ref)),
    ...ruleSnapshot.docs.map((snapshot) => deleteDoc(snapshot.ref)),
    deleteDoc(doc(db, COLLECTIONS.USERS, userId)),
  ]);
}

export async function fetchUserFromServer(userId: string): Promise<User | null> {
  if (!isFirebaseConfigured) return null;
  const db = getFirestoreDb();
  if (!db) return null;

  const snapshot = await getDoc(doc(db, COLLECTIONS.USERS, userId));
  if (!snapshot.exists()) return null;

  return mapUser(snapshot.id, snapshot.data() as UserDocument);
}

export async function fetchUserByDisplayName(
  nickname: string,
  tag: number,
): Promise<User | null> {
  if (!isFirebaseConfigured) return null;
  const db = getFirestoreDb();
  if (!db) return null;

  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.USERS),
      where('nickname', '==', nickname),
      where('tag', '==', tag),
    ),
  );

  if (snapshot.empty) return null;

  const userDoc = snapshot.docs[0];
  return mapUser(userDoc.id, userDoc.data() as UserDocument);
}
