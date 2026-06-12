import { addDays } from 'date-fns';
import { createId } from '@/lib/utils/id';
import {
  getDatesInRange,
  getMondayBasedDayIndex,
  isDateInRepeatRange,
  parseDateString,
  toDateString,
} from '@/lib/time/formatTime';
import type { Todo, TodoRepeatRule, TodoWithRepeat } from '@/types/todo';

export function expandTodosForDate(
  todos: Todo[],
  rules: TodoRepeatRule[],
  dateStr: string,
): TodoWithRepeat[] {
  const targetDate = parseDateString(dateStr);
  const ruleMap = new Map(rules.filter((r) => r.repeatEnabled).map((r) => [r.todoId, r]));
  const result: TodoWithRepeat[] = [];
  const seenSeriesOnDate = new Set<string>();

  for (const todo of todos) {
    const rule = ruleMap.get(todo.id) ?? null;

    if (todo.targetDate === dateStr) {
      result.push({ ...todo, repeatRule: rule });
      if (todo.seriesId) seenSeriesOnDate.add(todo.seriesId);
      continue;
    }

    if (!rule || !todo.seriesId || seenSeriesOnDate.has(todo.seriesId)) continue;

    const anchor = parseDateString(todo.targetDate);
    const weekday = getMondayBasedDayIndex(targetDate);

    if (
      rule.repeatDays.includes(weekday) &&
      isDateInRepeatRange(targetDate, anchor, rule.repeatDate)
    ) {
      result.push({
        ...todo,
        targetDate: dateStr,
        repeatRule: rule,
      });
      seenSeriesOnDate.add(todo.seriesId);
    }
  }

  return result;
}

export function buildRepeatOccurrences(template: Todo, rule: TodoRepeatRule): Todo[] {
  if (!rule.repeatEnabled || rule.repeatDays.length === 0) return [template];

  const start = parseDateString(template.targetDate);
  const end = rule.repeatDate ? parseDateString(rule.repeatDate) : addDays(start, 56);
  const dates = getDatesInRange(start, end);
  const seriesId = template.seriesId ?? template.id;
  const occurrences: Todo[] = [];

  for (const date of dates) {
    const weekday = getMondayBasedDayIndex(date);
    if (!rule.repeatDays.includes(weekday)) continue;

    const dateStr = toDateString(date);
    occurrences.push({
      ...template,
      id: dateStr === template.targetDate ? template.id : createId(),
      targetDate: dateStr,
      seriesId,
    });
  }

  return occurrences.length > 0 ? occurrences : [template];
}

export function getSeriesTodoIds(todos: Todo[], seriesId: string): string[] {
  return todos.filter((t) => t.seriesId === seriesId || t.id === seriesId).map((t) => t.id);
}
