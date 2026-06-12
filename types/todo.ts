import type { Priority } from '@/constants/priority';

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: Priority;
  startTime: string;
  endTime: string;
  targetDate: string;
  isCompleted: boolean;
  seriesId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TodoRepeatRule {
  id: string;
  todoId: string;
  repeatEnabled: boolean;
  repeatDays: number[];
  repeatDate: string | null;
  createdAt: string;
}

export interface TodoFormValues {
  title: string;
  description: string;
  priority: Priority;
  startTime: Date;
  endTime: Date;
  targetDate: string;
  repeatEnabled: boolean;
  repeatDays: number[];
  repeatDate: Date | null;
}

export interface TodoWithRepeat extends Todo {
  repeatRule: TodoRepeatRule | null;
}
