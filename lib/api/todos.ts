import { ApiError, apiRequest, isApiConfigured } from '@/lib/api/client';
import { mapRepeatRuleList, mapTodoList, resolveId } from '@/lib/api/mappers';
import { isValidUuid } from '@/lib/api/validation';
import type { Todo, TodoRepeatRule } from '@/types/todo';

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

async function upsertRepeatRules(rules: TodoRepeatRule[], userId: string): Promise<void> {
  if (rules.length === 0) return;

  const payloads = rules.map((rule) => toRepeatRulePayload(rule, userId));

  try {
    await apiRequest('/todo-repeat-rules/bulk-upsert', {
      method: 'POST',
      userId,
      body: {
        userId,
        repeatRules: payloads,
      },
    });
    return;
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  await Promise.all(
    payloads.map((payload) =>
      apiRequest(`/todo-repeat-rules/${payload.id}`, {
        method: 'PUT',
        userId,
        body: payload,
      }),
    ),
  );
}

async function deleteRepeatRules(ruleIds: string[], userId: string): Promise<void> {
  if (ruleIds.length === 0) return;

  try {
    await apiRequest('/todo-repeat-rules/bulk-delete', {
      method: 'POST',
      userId,
      body: { userId, ids: ruleIds },
    });
    return;
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  await Promise.all(
    ruleIds.map((id) =>
      apiRequest(`/todo-repeat-rules/${id}`, {
        method: 'DELETE',
        userId,
      }).catch(() => undefined),
    ),
  );
}

export async function syncTodosToServer(
  todos: Todo[],
  rules: TodoRepeatRule[],
  userId: string,
): Promise<void> {
  if (!isApiConfigured || !isValidUuid(userId)) return;

  const syncedTodos = prepareTodosForSync(todos, userId);
  const syncedTodoIds = new Set(syncedTodos.map((todo) => todo.id));
  const syncedRules = prepareRulesForSync(rules, syncedTodoIds);

  if (syncedTodos.length === 0 && syncedRules.length === 0) return;

  if (syncedTodos.length > 0) {
    await apiRequest('/todos/bulk-upsert', {
      method: 'POST',
      userId,
      body: { userId, todos: syncedTodos },
    });
  }

  if (syncedRules.length > 0) {
    await upsertRepeatRules(syncedRules, userId);
  }
}

export async function fetchTodosFromServer(userId: string): Promise<{
  todos: Todo[];
  rules: TodoRepeatRule[];
}> {
  if (!isApiConfigured || !isValidUuid(userId)) return { todos: [], rules: [] };

  const [todoData, ruleData] = await Promise.all([
    apiRequest<unknown>(`/todos?userId=${encodeURIComponent(userId)}`, { userId }),
    apiRequest<unknown>(`/todo-repeat-rules?userId=${encodeURIComponent(userId)}`, { userId }),
  ]);

  return {
    todos: mapTodoList(todoData),
    rules: mapRepeatRuleList(ruleData),
  };
}

export async function deleteTodosFromServer(
  todoIds: string[],
  ruleIds: string[],
  userId?: string,
): Promise<void> {
  if (!isApiConfigured || (todoIds.length === 0 && ruleIds.length === 0)) return;
  if (!isValidUuid(userId)) return;

  if (todoIds.length > 0) {
    await apiRequest('/todos/bulk-delete', {
      method: 'POST',
      userId,
      body: { userId, ids: todoIds },
    });
  }

  await deleteRepeatRules(ruleIds, userId);
}

export { getSeriesTodoIds } from '@/lib/todo/repeat';
