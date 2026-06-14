import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  buildRepeatOccurrences,
  expandTodosForDate,
  getSeriesTodoIds,
} from '@/lib/todo/repeat';
import {
  loadRepeatRules,
  loadTodos,
  saveRepeatRules,
  saveTodos,
} from '@/lib/local/storage';
import { formatTime, toDateString } from '@/lib/time/formatTime';
import { createId } from '@/lib/utils/id';
import {
  deleteTodosFromServer,
  fetchTodosFromServer,
  syncTodosToServer,
} from '@/lib/api/todos';
import { syncUserToServer } from '@/lib/api/users';
import { sortTodos } from '@/lib/time/sortTodos';
import { useUserContext } from '@/contexts/UserProvider';
import type { Todo, TodoFormValues, TodoRepeatRule } from '@/types/todo';
import { PRIORITY } from '@/constants/priority';

interface TodoContextValue {
  todos: Todo[];
  isLoading: boolean;
  getTodosForDate: (date: Date) => Todo[];
  getRepeatRuleForSeries: (seriesId: string) => TodoRepeatRule | null;
  getRepeatRuleForTodo: (todo: Todo) => TodoRepeatRule | null;
  createTodo: (values: TodoFormValues) => Promise<void>;
  updateTodo: (id: string, values: TodoFormValues) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTodo: (id: string, deleteSeries: boolean) => Promise<void>;
  refreshTodos: () => Promise<void>;
}

const TodoContext = createContext<TodoContextValue | null>(null);

function buildTodoFromForm(
  values: TodoFormValues,
  userId: string,
  existing?: Todo,
): Todo {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? createId(),
    userId,
    title: values.title.trim(),
    description: values.description.trim() || null,
    priority: values.priority,
    startTime: formatTime(values.startTime),
    endTime: formatTime(values.endTime),
    targetDate: values.targetDate,
    isCompleted: existing?.isCompleted ?? false,
    seriesId: existing?.seriesId ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function mergeByUpdatedAt<T extends { id: string; updatedAt?: string }>(
  localItems: T[],
  remoteItems: T[],
): T[] {
  const map = new Map<string, T>();

  for (const item of localItems) {
    if (item.id) map.set(item.id, item);
  }

  for (const item of remoteItems) {
    if (!item.id) continue;
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
      continue;
    }

    const existingUpdatedAt = existing.updatedAt ?? '';
    const nextUpdatedAt = item.updatedAt ?? '';
    map.set(item.id, nextUpdatedAt >= existingUpdatedAt ? item : existing);
  }

  return Array.from(map.values());
}

function mergeRepeatRules(localRules: TodoRepeatRule[], remoteRules: TodoRepeatRule[]): TodoRepeatRule[] {
  const map = new Map<string, TodoRepeatRule>();

  const ruleScore = (rule: TodoRepeatRule) =>
    (rule.repeatDays?.length ?? 0) * 10 + (rule.repeatDate ? 1 : 0);

  for (const rule of [...localRules, ...remoteRules]) {
    if (!rule.id) continue;

    const existing = map.get(rule.id);
    if (!existing) {
      map.set(rule.id, rule);
      continue;
    }

    map.set(rule.id, ruleScore(rule) >= ruleScore(existing) ? rule : existing);
  }

  return Array.from(map.values());
}

function buildRepeatRule(todoId: string, values: TodoFormValues, existing?: TodoRepeatRule): TodoRepeatRule {
  return {
    id: existing?.id ?? createId(),
    todoId,
    repeatEnabled: values.repeatEnabled,
    repeatDays: values.repeatDays,
    repeatDate: values.repeatDate ? toDateString(values.repeatDate) : null,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isUserLoading } = useUserContext();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [repeatRules, setRepeatRules] = useState<TodoRepeatRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const persist = useCallback(async (nextTodos: Todo[], nextRules: TodoRepeatRule[]) => {
    const removedTodoIds = todos
      .filter((todo) => !nextTodos.some((next) => next.id === todo.id))
      .map((todo) => todo.id);
    const removedRuleIds = repeatRules
      .filter((rule) => !nextRules.some((next) => next.id === rule.id))
      .map((rule) => rule.id);

    await saveTodos(nextTodos);
    await saveRepeatRules(nextRules);
    setTodos(nextTodos);
    setRepeatRules(nextRules);

    if (!user?.id) return;

    try {
      await syncUserToServer(user);
      await deleteTodosFromServer(removedTodoIds, removedRuleIds, user.id);
      await syncTodosToServer(nextTodos, nextRules, user.id);
    } catch (error) {
      console.warn('[TodoProvider] API sync failed:', error);
    }
  }, [todos, repeatRules, user]);

  const refreshTodos = useCallback(async () => {
    if (isUserLoading || !user?.id) {
      if (!isUserLoading && !user) {
        setTodos([]);
        setRepeatRules([]);
      }
      setIsLoading(isUserLoading);
      return;
    }

    setIsLoading(true);
    try {
      const localTodos = (await loadTodos()).filter((t) => t.userId === user.id);
      const localRules = await loadRepeatRules();
      const remote = await fetchTodosFromServer(user.id);

      const mergedTodos = mergeByUpdatedAt(localTodos, remote.todos);
      const mergedRules = mergeRepeatRules(localRules, remote.rules);

      setTodos(mergedTodos.filter((t) => t.userId === user.id));
      setRepeatRules(mergedRules);
      await saveTodos(mergedTodos);
      await saveRepeatRules(mergedRules);
    } finally {
      setIsLoading(false);
    }
  }, [user, isUserLoading]);

  useEffect(() => {
    void refreshTodos();
  }, [refreshTodos]);

  const getRepeatRuleForSeries = useCallback(
    (seriesId: string) => repeatRules.find((rule) => rule.todoId === seriesId) ?? null,
    [repeatRules],
  );

  const getRepeatRuleForTodo = useCallback(
    (todo: Todo) => {
      const seriesId = todo.seriesId ?? todo.id;
      return repeatRules.find((rule) => rule.todoId === seriesId) ?? null;
    },
    [repeatRules],
  );

  const getTodosForDate = useCallback(
    (date: Date) => {
      if (!user) return [];
      const dateStr = toDateString(date);
      const userTodos = todos.filter((todo) => todo.userId === user.id);
      const expanded = expandTodosForDate(userTodos, repeatRules, dateStr);
      return sortTodos(expanded.map(({ repeatRule: _repeatRule, ...todo }) => todo));
    },
    [todos, repeatRules, user],
  );

  const createTodo = useCallback(
    async (values: TodoFormValues) => {
      if (!user) return;

      const template = buildTodoFromForm(values, user.id);
      template.seriesId = values.repeatEnabled ? template.id : null;

      let nextTodos = [...todos];
      let nextRules = [...repeatRules];

      if (values.repeatEnabled) {
        const rule = buildRepeatRule(template.id, values);
        const occurrences = buildRepeatOccurrences(template, rule);
        nextTodos = [...nextTodos, ...occurrences];
        nextRules = [...nextRules, rule];
      } else {
        nextTodos = [...nextTodos, template];
      }

      await persist(nextTodos, nextRules);
    },
    [user, todos, repeatRules, persist],
  );

  const updateTodo = useCallback(
    async (id: string, values: TodoFormValues) => {
      if (!user) return;

      const existing = todos.find((t) => t.id === id);
      if (!existing) return;

      const anchorDateStr = values.targetDate;

      if (!existing.seriesId && !values.repeatEnabled) {
        const nextTodos = todos.map((todo) =>
          todo.id === id ? buildTodoFromForm(values, user.id, existing) : todo,
        );
        await persist(nextTodos, repeatRules);
        return;
      }

      const seriesId = existing.seriesId ?? existing.id;
      const existingRule = repeatRules.find((rule) => rule.todoId === seriesId);
      const seriesRoot = todos.find((todo) => todo.id === seriesId) ?? existing;

      const outsideSeries = todos.filter(
        (todo) => todo.seriesId !== seriesId && todo.id !== seriesId,
      );
      const pastSeriesTodos = todos.filter(
        (todo) =>
          (todo.seriesId === seriesId || todo.id === seriesId) && todo.targetDate < anchorDateStr,
      );
      const nextRules = repeatRules.filter((rule) => rule.todoId !== seriesId);

      if (!values.repeatEnabled) {
        const single = buildTodoFromForm(values, user.id, {
          ...existing,
          seriesId: null,
          targetDate: anchorDateStr,
        });
        await persist([...outsideSeries, ...pastSeriesTodos, single], nextRules);
        return;
      }

      const updated = buildTodoFromForm(values, user.id, {
        ...seriesRoot,
        id: seriesId,
        seriesId,
        targetDate: anchorDateStr,
      });
      const rule = buildRepeatRule(seriesId, values, existingRule);
      const occurrences = buildRepeatOccurrences(updated, rule);

      await persist([...outsideSeries, ...pastSeriesTodos, ...occurrences], [...nextRules, rule]);
    },
    [user, todos, repeatRules, persist],
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      const nextTodos = todos.map((todo) =>
        todo.id === id
          ? { ...todo, isCompleted: !todo.isCompleted, updatedAt: new Date().toISOString() }
          : todo,
      );
      await persist(nextTodos, repeatRules);
    },
    [todos, repeatRules, persist],
  );

  const deleteTodo = useCallback(
    async (id: string, deleteSeries: boolean) => {
      const target = todos.find((t) => t.id === id);
      if (!target) return;

      let nextTodos: Todo[];
      let nextRules: TodoRepeatRule[];

      if (deleteSeries && target.seriesId) {
        const seriesIds = getSeriesTodoIds(todos, target.seriesId);
        nextTodos = todos.filter((t) => !seriesIds.includes(t.id));
        nextRules = repeatRules.filter((r) => !seriesIds.includes(r.todoId));
      } else if (deleteSeries) {
        nextTodos = todos.filter((t) => t.id !== id && t.seriesId !== id);
        nextRules = repeatRules.filter((r) => r.todoId !== id);
      } else {
        nextTodos = todos.filter((t) => t.id !== id);
        nextRules = repeatRules;
      }

      await persist(nextTodos, nextRules);
    },
    [todos, repeatRules, persist],
  );

  const value = useMemo(
    () => ({
      todos,
      isLoading,
      getTodosForDate,
      getRepeatRuleForSeries,
      getRepeatRuleForTodo,
      createTodo,
      updateTodo,
      toggleComplete,
      deleteTodo,
      refreshTodos,
    }),
    [
      todos,
      isLoading,
      getTodosForDate,
      getRepeatRuleForSeries,
      getRepeatRuleForTodo,
      createTodo,
      updateTodo,
      toggleComplete,
      deleteTodo,
      refreshTodos,
    ],
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodoContext(): TodoContextValue {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext must be used within TodoProvider');
  }
  return context;
}

export function createDefaultFormValues(date: Date): TodoFormValues {
  const base = new Date(date);
  base.setHours(9, 0, 0, 0);
  const end = new Date(date);
  end.setHours(10, 0, 0, 0);

  return {
    title: '',
    description: '',
    priority: PRIORITY.MEDIUM,
    startTime: base,
    endTime: end,
    targetDate: toDateString(date),
    repeatEnabled: false,
    repeatDays: [],
    repeatDate: null,
  };
}
