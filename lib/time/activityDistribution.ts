import { parseTimeOnDate } from '@/lib/time/formatTime';
import type { Todo } from '@/types/todo';

const BUCKET_COUNT = 24;

export interface ActivityBucket {
  hour: number;
  value: number;
}

export function buildActivityDistribution(todos: Todo[]): ActivityBucket[] {
  const buckets = Array.from({ length: BUCKET_COUNT }, (_, hour) => ({
    hour,
    value: 0,
  }));

  for (const todo of todos) {
    const start = parseTimeOnDate(todo.targetDate, todo.startTime);
    const end = parseTimeOnDate(todo.targetDate, todo.endTime);
    const startHour = start.getHours();
    const endHour = Math.max(startHour + 1, end.getHours() + (end.getMinutes() > 0 ? 1 : 0));

    for (let hour = startHour; hour < Math.min(endHour, BUCKET_COUNT); hour += 1) {
      buckets[hour].value += 1;
    }
  }

  return buckets;
}

export const ACTIVITY_AXIS_LABELS = [0, 6, 12, 18, 24];
