import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createId } from '@/lib/utils/id';
import { formatTime, toDateString } from '@/lib/time/formatTime';
import {
  loadRepeatRules,
  loadTodos,
  saveRepeatRules,
  saveTodos,
} from '@/lib/local/storage';
import {
  buildRepeatOccurrences,
  getSeriesTodoIds,
} from '@/lib/todo/repeat';
import {
  deleteTodosFromServer,
  fetchTodosFromServer,
  syncTodosToServer,
} from '@/lib/firebase/todos';
import { sortTodos } from '@/lib/time/sortTodos';
import { useUserContext } from '@/contexts/UserProvider';
import type { Todo, TodoFormValues, TodoRepeatRule } from '@/types/todo';
import { PRIORITY } from '@/constants/priority';

interface TodoContextValue {
  todos: Todo[];
  isLoading: boolean;
  getTodosForDate: (date: Date) => Todo[];
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
  const { user } = useUserContext();
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
    await deleteTodosFromServer(removedTodoIds, removedRuleIds);
    await syncTodosToServer(nextTodos, nextRules);
    setTodos(nextTodos);
    setRepeatRules(nextRules);
  }, [todos, repeatRules]);

  const refreshTodos = useCallback(async () => {
    if (!user) {
      setTodos([]);
      setRepeatRules([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const localTodos = (await loadTodos()).filter((t) => t.userId === user.id);
      const localRules = await loadRepeatRules();
      const remote = await fetchTodosFromServer(user.id);

      const mergedTodos =
        remote.todos.length >= localTodos.length ? remote.todos : localTodos;
      const mergedRules =
        remote.rules.length >= localRules.length ? remote.rules : localRules;

      setTodos(mergedTodos.filter((t) => t.userId === user.id));
      setRepeatRules(mergedRules);
      await saveTodos(mergedTodos);
      await saveRepeatRules(mergedRules);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshTodos();
  }, [refreshTodos]);

  const getTodosForDate = useCallback(
    (date: Date) => {
      if (!user) return [];
      const dateStr = toDateString(date);
      const filtered = todos.filter(
        (todo) => todo.userId === user.id && todo.targetDate === dateStr,
      );
      return sortTodos(filtered);
    },
    [todos, user],
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

      const seriesId = existing.seriesId ?? existing.id;
      const remaining = todos.filter(
        (t) => t.seriesId !== seriesId && t.id !== seriesId,
      );
      const remainingRules = repeatRules.filter((r) => r.todoId !== seriesId && r.todoId !== id);

      const updated = buildTodoFromForm(values, user.id, {
        ...existing,
        id: seriesId,
        seriesId: values.repeatEnabled ? seriesId : null,
      });

      let nextTodos = [...remaining];
      let nextRules = [...remainingRules];

      if (values.repeatEnabled) {
        const rule = buildRepeatRule(seriesId, values);
        const occurrences = buildRepeatOccurrences(updated, rule);
        nextTodos = [...nextTodos, ...occurrences];
        nextRules = [...nextRules, rule];
      } else {
        nextTodos = [...nextTodos, updated];
      }

      await persist(nextTodos, nextRules);
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
