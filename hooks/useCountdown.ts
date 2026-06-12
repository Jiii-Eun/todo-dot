import { useEffect, useRef, useState } from 'react';
import { calculateCountdown, parseTimeOnDate } from '@/lib/time/formatTime';
import type { Todo } from '@/types/todo';

export function useCountdown(todo: Todo | null) {
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
    };
  }

  const start = parseTimeOnDate(todo.targetDate, todo.startTime);
  const end = parseTimeOnDate(todo.targetDate, todo.endTime);
  const state = calculateCountdown(now, start, end);

  return {
    ...state,
    overtimeText: state.isOvertime ? `${Math.ceil(Math.abs(end.getTime() - now.getTime()) / 60000)}분 초과` : '',
  };
}
