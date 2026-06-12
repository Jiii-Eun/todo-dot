import { useEffect, useMemo, useRef, useState } from 'react';
import { isAfter, isBefore, startOfDay } from 'date-fns';
import {
  calculateCountdown,
  parseDateString,
  parseTimeOnDate,
  toDateString,
} from '@/lib/time/formatTime';
import type { Todo } from '@/types/todo';

const EMPTY_STATE = {
  display: '00:00:00',
  progress: 0,
  isOvertime: false,
  isFinished: false,
  isWaiting: false,
  isDayEnded: false,
  isPastSession: false,
  overtimeText: '',
} as const;

const ENDED_STATE = {
  display: '00:00:00',
  progress: 1,
  isOvertime: false,
  isFinished: true,
  isWaiting: false,
  isDayEnded: true,
  overtimeText: '',
} as const;

export function useCountdown(todo: Todo | null, viewingDate?: string) {
  const [now, setNow] = useState(() => new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const snapshot = useMemo(() => {
    if (!todo) {
      return { ...EMPTY_STATE };
    }

    const todayStr = toDateString(now);
    const todayDay = startOfDay(now);
    const sessionDate = viewingDate ?? todayStr;
    const sessionDay = startOfDay(parseDateString(sessionDate));

    if (isAfter(todayDay, sessionDay)) {
      return { ...ENDED_STATE, isPastSession: true };
    }

    const start = parseTimeOnDate(sessionDate, todo.startTime);
    const end = parseTimeOnDate(sessionDate, todo.endTime);

    if (!isBefore(now, end)) {
      return { ...ENDED_STATE, isPastSession: false };
    }

    const state = calculateCountdown(now, start, end);

    return {
      ...state,
      isWaiting: isBefore(now, start),
      isDayEnded: false,
      isPastSession: false,
      isOvertime: false,
      overtimeText: '',
    };
  }, [todo, viewingDate, now]);

  const needsTick = todo != null && !snapshot.isDayEnded;

  useEffect(() => {
    if (!needsTick) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [needsTick]);

  return snapshot;
}
