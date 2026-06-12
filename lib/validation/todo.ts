import { isTimeAfter } from '@/lib/time/compareTime';
import { startOfDay } from 'date-fns';

export interface TodoValidation {
  valid: boolean;
  message: string;
}

export function validateTodoTimes(startTime: Date, endTime: Date): TodoValidation {
  if (!isTimeAfter(endTime, startTime)) {
    return { valid: false, message: '종료 시간은 시작 시간보다 늦어야 합니다.' };
  }
  return { valid: true, message: '' };
}

export function validateTodoTitle(title: string): TodoValidation {
  if (!title.trim()) {
    return { valid: false, message: '제목을 입력해 주세요.' };
  }
  return { valid: true, message: '' };
}

export function validateRepeatDays(repeatEnabled: boolean, repeatDays: number[]): TodoValidation {
  if (repeatEnabled && repeatDays.length === 0) {
    return { valid: false, message: '반복 요일을 하나 이상 선택해 주세요.' };
  }
  return { valid: true, message: '' };
}

export function validateRepeatEndDate(
  repeatEnabled: boolean,
  repeatDate: Date | null,
  anchorDate?: Date,
): TodoValidation {
  if (!repeatEnabled || !repeatDate) {
    return { valid: true, message: '' };
  }
  if (anchorDate && startOfDay(repeatDate) < startOfDay(anchorDate)) {
    return { valid: false, message: '종료일은 선택한 날짜 이후여야 합니다.' };
  }
  return { valid: true, message: '' };
}
