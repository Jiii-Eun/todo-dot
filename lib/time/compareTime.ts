import { compareAsc, setHours, setMinutes, startOfDay } from 'date-fns';

export function compareTimeOnly(a: Date, b: Date): number {
  const base = startOfDay(new Date());
  const aTime = setMinutes(setHours(base, a.getHours()), a.getMinutes());
  const bTime = setMinutes(setHours(base, b.getHours()), b.getMinutes());
  return compareAsc(aTime, bTime);
}

export function isTimeAfter(a: Date, b: Date): boolean {
  return compareTimeOnly(a, b) > 0;
}

export function applyTimeToDate(base: Date, hours: number, minutes: number): Date {
  const next = new Date(base);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function addMinutesToTime(date: Date, minutesToAdd: number): Date {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutesToAdd);
  return next;
}

/** 종료 시간 23:00 선택 시 해당 시간대 끝(23:59)으로 맞춤 */
export function normalizeEndTimeSelection(date: Date): Date {
  if (date.getHours() === 23 && date.getMinutes() === 0) {
    return applyTimeToDate(date, 23, 59);
  }
  return date;
}
