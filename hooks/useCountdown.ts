import { useEffect, useRef, useState } from 'react';
import { isAfter, startOfDay } from 'date-fns';
import {
  calculateCountdown,
  parseDateString,
  parseTimeOnDate,
  toDateString,
} from '@/lib/time/formatTime';
import type { Todo } from '@/types/todo';

export function useCountdown(todo: Todo | null, viewingDate?: string) {
  const [now, setNow] = useState(() => new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!todo) {
    return {
      display: '00:00:00',
      progress: 0,
      isOvertime: false,
      isFinished: false,
      overtimeText: '',
      isWaiting: false,
    };
  }

  const today = toDateString(now);
  const todayDay = startOfDay(now);
  const sessionDate = viewingDate ?? today;
  const sessionDay = startOfDay(parseDateString(sessionDate));

  let countdownDate = today;

  if (isAfter(sessionDay, todayDay)) {
    countdownDate = sessionDate;
  } else if (isAfter(todayDay, sessionDay)) {
    countdownDate = today;
  } else {
    countdownDate = today;
  }

  const start = parseTimeOnDate(countdownDate, todo.startTime);
  const end = parseTimeOnDate(countdownDate, todo.endTime);
  const state = calculateCountdown(now, start, end);

  const overtimeMinutes = Math.ceil(Math.abs(end.getTime() - now.getTime()) / 60000);

  return {
    ...state,
    isWaiting: now < start,
    overtimeText: state.isOvertime ? `${overtimeMinutes}분 초과` : '',
  };
}
