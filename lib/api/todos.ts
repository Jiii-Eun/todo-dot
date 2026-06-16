import { ApiError, apiRequest, isApiConfigured } from '@/lib/api/client';
import {
  mapIdList,
  mapRepeatRuleList,
  mapTodoList,
  resolveId,
} from '@/lib/api/mappers';
import { isValidUuid } from '@/lib/api/validation';
import type { Todo, TodoRepeatRule } from '@/types/todo';

type TodoPatch = Partial<
  Pick<
    Todo,
  | 'title'
  | 'description'
  | 'priority'
  | 'startTime'
  | 'endTime'
  | 'targetDate'
  | 'isCompleted'
  | 'seriesId'
  >
>;

function toTodoCreatePayload(todo: Todo) {
  return {
    id: todo.id,
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

function toTodoPatch(todo: Todo): TodoPatch {
  return {
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    startTime: todo.startTime,
    endTime: todo.endTime,
    targetDate: todo.targetDate,
    isCompleted: todo.isCompleted,
    seriesId: todo.seriesId,
  };
}

function toRepeatRulePayload(rule: TodoRepeatRule, userId: string) {
  return {
    id: rule.id,
    todoId: rule.todoId,
    userId,
    repeatEnabled: rule.repeatEnabled,
    repeatDays: rule.repeatDays,
    repeatDate: rule.repeatDate,
    createdAt: rule.createdAt,
  };
}

function toRepeatRulePatch(rule: TodoRepeatRule) {
  return {
    todoId: rule.todoId,
    repeatEnabled: rule.repeatEnabled,
    repeatDays: rule.repeatDays,
    repeatDate: rule.repeatDate,
  };
}

function prepareTodosForSync(todos: Todo[], userId: string): Todo[] {
  return todos
    .filter((todo) => Boolean(resolveId(todo)))
    .map((todo) => ({ ...todo, userId }));
}

function prepareRulesForSync(
  rules: TodoRepeatRule[],
  syncedTodoIds: Set<string>,
): TodoRepeatRule[] {
  return rules.filter(
    (rule) => Boolean(resolveId(rule)) && isValidUuid(rule.todoId) && syncedTodoIds.has(rule.todoId),
  );
}

function diffByUpdatedAt(previous: Todo[], next: Todo[]) {
  const previousMap = new Map(previous.map((todo) => [todo.id, todo]));

  const added = next.filter((todo) => !previousMap.has(todo.id));
  const updated = next.filter((todo) => {
    const prev = previousMap.get(todo.id);
    return prev != null && prev.updatedAt !== todo.updatedAt;
  });
  const removedIds = previous
    .filter((todo) => !next.some((item) => item.id === todo.id))
    .map((todo) => todo.id);

  return { added, updated, removedIds };
}

function diffRepeatRules(previous: TodoRepeatRule[], next: TodoRepeatRule[]) {
  const previousMap = new Map(previous.map((rule) => [rule.id, rule]));

  return next.filter((rule) => {
    const prev = previousMap.get(rule.id);
    if (!prev) return true;
    return (
      prev.todoId !== rule.todoId ||
      prev.repeatEnabled !== rule.repeatEnabled ||
      prev.repeatDays.join(',') !== rule.repeatDays.join(',') ||
      prev.repeatDate !== rule.repeatDate
    );
  });
}

export async function createTodoOnServer(todo: Todo, userId: string): Promise<void> {
  if (!isApiConfigured() || !isValidUuid(userId)) return;

  try {
    await apiRequest('/todos', {
      method: 'POST',
      userId,
      body: toTodoCreatePayload(todo),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      await updateTodoOnServer(todo.id, toTodoPatch(todo), userId);
      return;
    }
    throw error;
  }
}

export async function updateTodoOnServer(
  todoId: string,
  patch: TodoPatch,
  userId: string,
): Promise<void> {
  if (!isApiConfigured() || !isValidUuid(userId) || !isValidUuid(todoId)) return;

  await apiRequest(`/todos/${todoId}`, {
    method: 'PATCH',
    userId,
    body: patch,
  });
}

export async function deleteTodoOnServer(todoId: string, userId: string): Promise<void> {
  if (!isApiConfigured() || !isValidUuid(userId) || !isValidUuid(todoId)) return;

  await apiRequest<void>(`/todos/${todoId}`, {
    method: 'DELETE',
    userId,
  });
}

export async function bulkUpsertTodosOnServer(todos: Todo[], userId: string): Promise<void> {
  if (!isApiConfigured() || !isValidUuid(userId)) return;

  const syncedTodos = prepareTodosForSync(todos, userId);
  if (syncedTodos.length === 0) return;

  await apiRequest('/todos/bulk-upsert', {
    method: 'PATCH',
    userId,
    body: { userId, todos: syncedTodos },
  });
}

export async function bulkDeleteTodosOnServer(todoIds: string[], userId: string): Promise<void> {
  if (!isApiConfigured() || !isValidUuid(userId) || todoIds.length === 0) return;

  const ids = todoIds.filter((id) => isValidUuid(id));
  if (ids.length === 0) return;

  if (ids.length === 1) {
    await deleteTodoOnServer(ids[0], userId);
    return;
  }

  await apiRequest('/todos/bulk-delete', {
    method: 'DELETE',
    userId,
    body: { userId, ids },
  });
}

export async function upsertRepeatRuleOnServer(
  rule: TodoRepeatRule,
  userId: string,
): Promise<void> {
  if (!isApiConfigured() || !isValidUuid(userId) || !isValidUuid(rule.id)) return;

  await apiRequest(`/todo-repeat-rules/${rule.id}`, {
    method: 'PATCH',
    userId,
    body: toRepeatRulePatch(rule),
  });
}

export async function bulkUpsertRepeatRulesOnServer(
  rules: TodoRepeatRule[],
  userId: string,
): Promise<void> {
  if (!isApiConfigured() || !isValidUuid(userId) || rules.length === 0) return;

  const payloads = rules.map((rule) => toRepeatRulePayload(rule, userId));

  try {
    await apiRequest('/todo-repeat-rules/bulk-upsert', {
      method: 'PATCH',
      userId,
      body: { userId, repeatRules: payloads },
    });
    return;
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  await Promise.all(payloads.map((payload) => upsertRepeatRuleOnServer(
    {
      id: payload.id,
      todoId: payload.todoId,
      repeatEnabled: payload.repeatEnabled,
      repeatDays: payload.repeatDays,
      repeatDate: payload.repeatDate,
      createdAt: payload.createdAt ?? new Date().toISOString(),
    },
    userId,
  )));
}

/** 로컬 변경분을 REST 메서드에 맞게 서버에 반영한다. */
export async function syncTodoChangesToServer(
  previousTodos: Todo[],
  nextTodos: Todo[],
  previousRules: TodoRepeatRule[],
  nextRules: TodoRepeatRule[],
  userId: string,
): Promise<void> {
  if (!isApiConfigured() || !isValidUuid(userId)) return;

  const { added, updated, removedIds } = diffByUpdatedAt(previousTodos, nextTodos);
  const changedRules = diffRepeatRules(previousRules, nextRules);

  if (removedIds.length > 0) {
    await bulkDeleteTodosOnServer(removedIds, userId);
  }

  for (const todo of added) {
    await createTodoOnServer(todo, userId);
  }

  for (const todo of updated) {
    await updateTodoOnServer(todo.id, toTodoPatch(todo), userId);
  }

  if (changedRules.length === 1) {
    await upsertRepeatRuleOnServer(changedRules[0], userId);
  } else if (changedRules.length > 1) {
    await bulkUpsertRepeatRulesOnServer(changedRules, userId);
  }
}

/** 오프라인 동기화 등 전체 상태를 일괄 저장한다. */
export async function syncTodosToServer(
  todos: Todo[],
  rules: TodoRepeatRule[],
  userId: string,
): Promise<void> {
  if (!isApiConfigured() || !isValidUuid(userId)) return;

  const syncedTodos = prepareTodosForSync(todos, userId);
  const syncedTodoIds = new Set(syncedTodos.map((todo) => todo.id));
  const syncedRules = prepareRulesForSync(rules, syncedTodoIds);

  if (syncedTodos.length === 0 && syncedRules.length === 0) return;

  if (syncedTodos.length > 0) {
    await bulkUpsertTodosOnServer(syncedTodos, userId);
  }

  if (syncedRules.length > 0) {
    await bulkUpsertRepeatRulesOnServer(syncedRules, userId);
  }
}

export async function fetchTodosFromServer(userId: string): Promise<{
  todos: Todo[];
  rules: TodoRepeatRule[];
}> {
  if (!isApiConfigured() || !isValidUuid(userId)) return { todos: [], rules: [] };

  const [todoData, ruleData] = await Promise.all([
    apiRequest<unknown>(`/todos?userId=${encodeURIComponent(userId)}`, { userId }),
    apiRequest<unknown>(`/todo-repeat-rules?userId=${encodeURIComponent(userId)}`, { userId }),
  ]);

  return {
    todos: mapTodoList(todoData),
    rules: mapRepeatRuleList(ruleData),
  };
}

export async function fetchSeriesTodoIdsFromServer(
  seriesId: string,
  userId: string,
): Promise<string[]> {
  if (!isApiConfigured() || !isValidUuid(userId) || !isValidUuid(seriesId)) return [];

  const data = await apiRequest<unknown>(
    `/todos/series/${encodeURIComponent(seriesId)}/ids`,
    { userId },
  );

  return mapIdList(data, ['ids']);
}

export { getSeriesTodoIds } from '@/lib/todo/repeat';
