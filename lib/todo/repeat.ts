import { addDays } from 'date-fns';
import { createId } from '@/lib/utils/id';
import {
  getDatesInRange,
  getMondayBasedDayIndex,
  isDateInRepeatRange,
  normalizeDateString,
  parseDateString,
  toDateString,
} from '@/lib/time/formatTime';
import type { Todo, TodoRepeatRule, TodoWithRepeat } from '@/types/todo';

/** 종료일만 설정된 경우(repeatDays 비어 있음) 매일 반복 */
export function isDailyRepeatUntilEnd(rule: TodoRepeatRule): boolean {
  return rule.repeatEnabled && rule.repeatDays.length === 0 && rule.repeatDate !== null;
}

function matchesRepeatWeekday(rule: TodoRepeatRule, date: Date): boolean {
  if (isDailyRepeatUntilEnd(rule)) return true;
  if (rule.repeatDays.length === 0) return false;
  return rule.repeatDays.includes(getMondayBasedDayIndex(date));
}

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
    if (normalizeDateString(todo.targetDate) !== dateStr) continue;

    const seriesKey = todo.seriesId ?? todo.id;
    const rule = ruleMap.get(seriesKey) ?? null;
    result.push({ ...todo, repeatRule: rule });
    seenSeriesOnDate.add(seriesKey);
  }

  for (const rule of ruleMap.values()) {
    const seriesKey = rule.todoId;
    if (seenSeriesOnDate.has(seriesKey)) continue;

    const seriesRoot = todos.find((todo) => todo.id === seriesKey);
    if (!seriesRoot) continue;

    const anchor = parseDateString(normalizeDateString(seriesRoot.targetDate));

    if (
      matchesRepeatWeekday(rule, targetDate) &&
      isDateInRepeatRange(targetDate, anchor, rule.repeatDate)
    ) {
      result.push({
        ...seriesRoot,
        targetDate: dateStr,
        repeatRule: rule,
      });
      seenSeriesOnDate.add(seriesKey);
    }
  }

  return result;
}

export function buildRepeatOccurrences(template: Todo, rule: TodoRepeatRule): Todo[] {
  if (!rule.repeatEnabled) return [template];

  const start = parseDateString(template.targetDate);
  const end = rule.repeatDate ? parseDateString(rule.repeatDate) : addDays(start, 56);
  const dates = getDatesInRange(start, end);
  const seriesId = template.seriesId ?? template.id;
  const occurrences: Todo[] = [];

  for (const date of dates) {
    if (!matchesRepeatWeekday(rule, date)) continue;

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
