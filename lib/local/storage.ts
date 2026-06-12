import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';
import type { Todo, TodoRepeatRule } from '@/types/todo';
import type { User } from '@/types/user';

export async function loadUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  return JSON.parse(raw) as User;
}

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.USER);
}

export async function loadTodos(): Promise<Todo[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.TODOS);
  if (!raw) return [];
  return JSON.parse(raw) as Todo[];
}

export async function saveTodos(todos: Todo[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
}

export async function loadRepeatRules(): Promise<TodoRepeatRule[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.REPEAT_RULES);
  if (!raw) return [];
  return JSON.parse(raw) as TodoRepeatRule[];
}

export async function saveRepeatRules(rules: TodoRepeatRule[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.REPEAT_RULES, JSON.stringify(rules));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.USER,
    STORAGE_KEYS.TODOS,
    STORAGE_KEYS.REPEAT_RULES,
  ]);
}
