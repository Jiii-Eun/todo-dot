import type { Todo, TodoRepeatRule } from '@/types/todo';
import type { User } from '@/types/user';
import { normalizeDateString, normalizeTimeString } from '@/lib/time/formatTime';

export type WithMongoId = {
  id?: string;
  _id?: string;
};

export function resolveId(entity: WithMongoId, fallbackId?: string): string | null {
  const id = entity.id ?? entity._id ?? fallbackId;
  if (!id || id === 'undefined') return null;
  return id;
}

export function unwrapRecord<T extends object>(
  data: unknown,
  wrapperKeys: string[],
): T | null {
  if (!data || typeof data !== 'object') return null;

  if (Array.isArray(data)) return null;

  const record = data as Record<string, unknown>;

  for (const key of wrapperKeys) {
    const nested = record[key];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return nested as T;
    }
  }

  return record as T;
}

export function unwrapList<T>(data: unknown, listKeys: string[]): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (typeof data !== 'object') return [];

  const record = data as Record<string, unknown>;

  for (const key of listKeys) {
    const nested = record[key];
    if (Array.isArray(nested)) return nested as T[];
  }

  return [];
}

interface UserResponse extends WithMongoId {
  nickname?: string;
  tag?: number;
  createdAt?: string;
}

export function mapUserResponse(data: unknown, fallbackId?: string): User | null {
  const payload = unwrapRecord<UserResponse>(data, ['user']);
  if (!payload) return null;

  const id = resolveId(payload, fallbackId);
  const tag =
    typeof payload.tag === 'string' ? Number.parseInt(payload.tag, 10) : payload.tag;

  if (
    !id ||
    !payload.nickname ||
    tag == null ||
    Number.isNaN(tag) ||
    !payload.createdAt
  ) {
    return null;
  }

  return {
    id,
    nickname: payload.nickname.trim(),
    tag,
    createdAt: payload.createdAt,
  };
}

interface TodoResponse extends WithMongoId {
  userId?: string;
  title?: string;
  description?: string | null;
  priority?: number;
  startTime?: string;
  endTime?: string;
  targetDate?: string;
  isCompleted?: boolean;
  seriesId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export function mapTodoResponse(data: unknown, fallbackId?: string): Todo | null {
  const payload = unwrapRecord<TodoResponse>(data, ['todo']);
  if (!payload) return null;

  const id = resolveId(payload, fallbackId);
  if (
    !id ||
    !payload.userId ||
    !payload.title ||
    payload.priority == null ||
    !payload.startTime ||
    !payload.endTime ||
    !payload.targetDate ||
    payload.isCompleted == null ||
    !payload.createdAt ||
    !payload.updatedAt
  ) {
    return null;
  }

  return {
    id,
    userId: payload.userId,
    title: payload.title,
    description: payload.description ?? null,
    priority: payload.priority as Todo['priority'],
    startTime: normalizeTimeString(payload.startTime),
    endTime: normalizeTimeString(payload.endTime),
    targetDate: normalizeDateString(payload.targetDate),
    isCompleted: payload.isCompleted,
    seriesId: payload.seriesId ?? null,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
  };
}

interface RepeatRuleResponse extends WithMongoId {
  todoId?: string;
  repeatEnabled?: boolean;
  repeatDays?: number[];
  repeatDate?: string | null;
  createdAt?: string;
}

export function mapRepeatRuleResponse(data: unknown, fallbackId?: string): TodoRepeatRule | null {
  const payload = unwrapRecord<RepeatRuleResponse>(data, ['repeatRule', 'rule']);
  if (!payload) return null;

  const id = resolveId(payload, fallbackId);
  if (
    !id ||
    !payload.todoId ||
    payload.repeatEnabled == null ||
    !payload.repeatDays ||
    !payload.createdAt
  ) {
    return null;
  }

  return {
    id,
    todoId: payload.todoId,
    repeatEnabled: payload.repeatEnabled,
    repeatDays: payload.repeatDays,
    repeatDate: payload.repeatDate ?? null,
    createdAt: payload.createdAt,
  };
}

export function mapTodoList(data: unknown): Todo[] {
  return unwrapList<TodoResponse>(data, ['todos', 'items'])
    .map((item) => mapTodoResponse(item))
    .filter((item): item is Todo => item !== null);
}

export function mapRepeatRuleList(data: unknown): TodoRepeatRule[] {
  return unwrapList<RepeatRuleResponse>(data, ['repeatRules', 'rules', 'items'])
    .map((item) => mapRepeatRuleResponse(item))
    .filter((item): item is TodoRepeatRule => item !== null);
}

export function mapIdList(data: unknown, listKeys: string[]): string[] {
  return unwrapList<WithMongoId>(data, listKeys)
    .map((item) => resolveId(item))
    .filter((id): id is string => id !== null);
}
