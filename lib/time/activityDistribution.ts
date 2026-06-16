import { endOfDay } from 'date-fns';
import { normalizeDateString, normalizeTimeString, parseDateString, parseTimeOnDate } from '@/lib/time/formatTime';
import type { Todo } from '@/types/todo';

const BUCKET_COUNT = 24;
const MS_PER_MINUTE = 60 * 1000;

/** 할 일 막대용 구분 색상 (id 해시로 안정적으로 배정) */
const ACTIVITY_BAR_COLORS = [
  '#8B5CF6',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
  '#F97316',
  '#6366F1',
  '#14B8A6',
  '#A855F7',
  '#84CC16',
  '#E879F9',
] as const;

export interface ActivityBucket {
  hour: number;
  value: number;
}

export interface TodoActivityBar {
  id: string;
  startMinutes: number;
  endMinutes: number;
  lane: number;
  color: string;
}

function hashStringToIndex(value: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

export function getActivityBarColor(todoId: string): string {
  return ACTIVITY_BAR_COLORS[hashStringToIndex(todoId, ACTIVITY_BAR_COLORS.length)];
}

function parseTimeToMinutes(time: string): number {
  const normalized = normalizeTimeString(time);
  const [hours, minutes] = normalized.split(':').map(Number);
  return hours * 60 + minutes;
}

function assignActivityBarLanes(
  bars: Array<Pick<TodoActivityBar, 'id' | 'startMinutes' | 'endMinutes'>>,
): TodoActivityBar[] {
  const sorted = [...bars].sort(
    (a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes,
  );
  const laneEnds: number[] = [];

  return sorted.map((bar) => {
    let lane = laneEnds.findIndex((endMinutes) => endMinutes <= bar.startMinutes);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(bar.endMinutes);
    } else {
      laneEnds[lane] = bar.endMinutes;
    }

    return {
      ...bar,
      lane,
      color: getActivityBarColor(bar.id),
    };
  });
}

export function buildTodoActivityBars(todos: Todo[]): TodoActivityBar[] {
  const seenIds = new Set<string>();
  const rawBars: Array<Pick<TodoActivityBar, 'id' | 'startMinutes' | 'endMinutes'>> = [];

  for (const todo of todos) {
    if (!todo.id || seenIds.has(todo.id)) continue;
    seenIds.add(todo.id);

    const startMinutes = parseTimeToMinutes(todo.startTime);
    const endMinutes = parseTimeToMinutes(todo.endTime);
    if (endMinutes <= startMinutes) continue;

    rawBars.push({
      id: todo.id,
      startMinutes,
      endMinutes,
    });
  }

  return assignActivityBarLanes(rawBars);
}

function getHourOverlapMinutes(
  dateStr: string,
  hour: number,
  start: Date,
  end: Date,
): number {
  const normalizedDate = normalizeDateString(dateStr);
  const bucketStart = parseTimeOnDate(normalizedDate, `${String(hour).padStart(2, '0')}:00`);
  const bucketEnd =
    hour === BUCKET_COUNT - 1
      ? endOfDay(parseDateString(normalizedDate))
      : parseTimeOnDate(normalizedDate, `${String(hour + 1).padStart(2, '0')}:00`);

  const overlapMs =
    Math.min(end.getTime(), bucketEnd.getTime()) - Math.max(start.getTime(), bucketStart.getTime());

  if (overlapMs <= 0) return 0;
  return overlapMs / MS_PER_MINUTE;
}

export function buildActivityDistribution(todos: Todo[]): ActivityBucket[] {
  const buckets = Array.from({ length: BUCKET_COUNT }, (_, hour) => ({
    hour,
    value: 0,
  }));

  const seenIds = new Set<string>();

  for (const todo of todos) {
    if (!todo.id || seenIds.has(todo.id)) continue;
    seenIds.add(todo.id);

    const dateStr = normalizeDateString(todo.targetDate);
    const start = parseTimeOnDate(dateStr, todo.startTime);
    const end = parseTimeOnDate(dateStr, todo.endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) continue;

    const startHour = start.getHours();
    const endHour = end.getHours() + (end.getMinutes() > 0 || end.getSeconds() > 0 ? 1 : 0);

    for (let hour = startHour; hour < Math.min(endHour, BUCKET_COUNT); hour += 1) {
      buckets[hour].value += getHourOverlapMinutes(dateStr, hour, start, end);
    }
  }

  return buckets;
}

export const ACTIVITY_AXIS_LABELS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

export interface ActivitySegment {
  startHour: number;
  endHour: number;
  value: number;
}

/** 연속된 활동 시간대를 하나의 막대 구간으로 묶음 */
export function buildActivitySegments(buckets: ActivityBucket[]): ActivitySegment[] {
  const segments: ActivitySegment[] = [];
  let startHour: number | null = null;
  let endHour = 0;
  let segmentValue = 0;

  for (const bucket of buckets) {
    if (bucket.value > 0) {
      if (startHour === null) startHour = bucket.hour;
      endHour = bucket.hour;
      segmentValue = Math.max(segmentValue, bucket.value);
      continue;
    }

    if (startHour !== null) {
      segments.push({ startHour, endHour, value: segmentValue });
      startHour = null;
      segmentValue = 0;
    }
  }

  if (startHour !== null) {
    segments.push({ startHour, endHour, value: segmentValue });
  }

  return segments;
}
