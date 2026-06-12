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
import type { Todo, TodoRepeatRule } from '@/types/todo';

interface TodoDocument {
  userId: string;
  title: string;
  description: string | null;
  priority: number;
  startTime: string;
  endTime: string;
  targetDate: string;
  isCompleted: boolean;
  seriesId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RepeatRuleDocument {
  todoId: string;
  userId: string;
  repeatEnabled: boolean;
  repeatDays: number[];
  repeatDate: string | null;
  createdAt: string;
}

function mapTodo(id: string, data: TodoDocument): Todo {
  return {
    id,
    userId: data.userId,
    title: data.title,
    description: data.description,
    priority: data.priority as Todo['priority'],
    startTime: data.startTime,
    endTime: data.endTime,
    targetDate: data.targetDate,
    isCompleted: data.isCompleted,
    seriesId: data.seriesId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function mapRepeatRule(id: string, data: RepeatRuleDocument): TodoRepeatRule {
  return {
    id,
    todoId: data.todoId,
    repeatEnabled: data.repeatEnabled,
    repeatDays: data.repeatDays,
    repeatDate: data.repeatDate,
    createdAt: data.createdAt,
  };
}

function todoToDocument(todo: Todo): TodoDocument {
  return {
    userId: todo.userId,
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    startTime: todo.startTime,
    endTime: todo.endTime,
    targetDate: todo.targetDate,
    isCompleted: todo.isCompleted,
    seriesId: todo.seriesId,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  };
}

function ruleToDocument(rule: TodoRepeatRule, userId: string): RepeatRuleDocument {
  return {
    todoId: rule.todoId,
    userId,
    repeatEnabled: rule.repeatEnabled,
    repeatDays: rule.repeatDays,
    repeatDate: rule.repeatDate,
    createdAt: rule.createdAt,
  };
}

export async function syncTodosToServer(
  todos: Todo[],
  rules: TodoRepeatRule[],
): Promise<void> {
  if (!isFirebaseConfigured) return;
  const db = getFirestoreDb();
  if (!db) return;

  await Promise.all([
    ...todos.map((todo) =>
      setDoc(doc(db, COLLECTIONS.TODOS, todo.id), todoToDocument(todo), { merge: true }),
    ),
    ...rules.map((rule) => {
      const userId = todos.find((todo) => todo.id === rule.todoId)?.userId ?? todos[0]?.userId;
      if (!userId) return Promise.resolve();
      return setDoc(
        doc(db, COLLECTIONS.REPEAT_RULES, rule.id),
        ruleToDocument(rule, userId),
        { merge: true },
      );
    }),
  ]);
}

export async function fetchTodosFromServer(userId: string): Promise<{
  todos: Todo[];
  rules: TodoRepeatRule[];
}> {
  if (!isFirebaseConfigured) return { todos: [], rules: [] };
  const db = getFirestoreDb();
  if (!db) return { todos: [], rules: [] };

  const [todoSnapshot, ruleSnapshot] = await Promise.all([
    getDocs(query(collection(db, COLLECTIONS.TODOS), where('userId', '==', userId))),
    getDocs(query(collection(db, COLLECTIONS.REPEAT_RULES), where('userId', '==', userId))),
  ]);

  return {
    todos: todoSnapshot.docs.map((snapshot) =>
      mapTodo(snapshot.id, snapshot.data() as TodoDocument),
    ),
    rules: ruleSnapshot.docs.map((snapshot) =>
      mapRepeatRule(snapshot.id, snapshot.data() as RepeatRuleDocument),
    ),
  };
}

export async function deleteTodosFromServer(todoIds: string[], ruleIds: string[]): Promise<void> {
  if (!isFirebaseConfigured || (todoIds.length === 0 && ruleIds.length === 0)) return;
  const db = getFirestoreDb();
  if (!db) return;

  await Promise.all([
    ...todoIds.map((id) => deleteDoc(doc(db, COLLECTIONS.TODOS, id))),
    ...ruleIds.map((id) => deleteDoc(doc(db, COLLECTIONS.REPEAT_RULES, id))),
  ]);
}

export { getSeriesTodoIds } from '@/lib/todo/repeat';
