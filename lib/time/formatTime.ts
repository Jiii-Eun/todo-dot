import { format, parse, differenceInSeconds, addDays, getDay, isAfter, isBefore, isEqual, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatDateDisplay(date: Date): string {
  return format(date, 'yyyy.MM.dd', { locale: ko });
}

export function formatDateLong(date: Date): string {
  return format(date, 'yyyy년 M월 d일 (EEE)', { locale: ko });
}

export function formatMonthYear(date: Date): string {
  return format(date, 'yyyy년 M월', { locale: ko });
}

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseDateString(value: string): Date {
  return parse(value, 'yyyy-MM-dd', new Date());
}

export function parseTimeOnDate(dateStr: string, timeStr: string): Date {
  return parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
}

export function formatDurationMinutes(start: Date, end: Date): string {
  const totalMinutes = Math.max(0, Math.round(differenceInSeconds(end, start) / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}분`;
  if (minutes === 0) return `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
}

export interface CountdownState {
  display: string;
  progress: number;
  isOvertime: boolean;
  isFinished: boolean;
}

export function calculateCountdown(
  now: Date,
  startTime: Date,
  endTime: Date,
): CountdownState {
  const totalSeconds = Math.max(1, differenceInSeconds(endTime, startTime));
  const remainingSeconds = differenceInSeconds(endTime, now);

  if (remainingSeconds > 0) {
    return {
      display: formatSeconds(remainingSeconds),
      progress: Math.min(1, Math.max(0, (totalSeconds - remainingSeconds) / totalSeconds)),
      isOvertime: false,
      isFinished: false,
    };
  }

  if (remainingSeconds === 0) {
    return {
      display: '00:00:00',
      progress: 1,
      isOvertime: false,
      isFinished: true,
    };
  }

  return {
    display: `+${formatSeconds(Math.abs(remainingSeconds))}`,
    progress: 1,
    isOvertime: true,
    isFinished: true,
  };
}

function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':');
}

export function formatOvertimeText(now: Date, endTime: Date): string {
  const overtimeMinutes = Math.ceil(Math.abs(differenceInSeconds(endTime, now)) / 60);
  return `${overtimeMinutes}분 초과`;
}

/** Monday = 0 … Sunday = 6 */
export function getMondayBasedDayIndex(date: Date): number {
  const sundayBased = getDay(date);
  return sundayBased === 0 ? 6 : sundayBased - 1;
}

export function getDatesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  let current = startOfDay(start);
  const last = startOfDay(end);
  while (!isAfter(current, last)) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

export function isDateInRepeatRange(
  date: Date,
  anchorDate: Date,
  repeatDate: string | null,
): boolean {
  const day = startOfDay(date);
  const anchor = startOfDay(anchorDate);
  if (isBefore(day, anchor)) return false;
  if (!repeatDate) return true;
  const end = startOfDay(parseDateString(repeatDate));
  return !isAfter(day, end);
}

export function datesMatch(a: Date, b: Date): boolean {
  return isEqual(startOfDay(a), startOfDay(b));
}
