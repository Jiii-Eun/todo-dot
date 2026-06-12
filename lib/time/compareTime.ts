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
