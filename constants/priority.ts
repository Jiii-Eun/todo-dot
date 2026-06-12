export const PRIORITY = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
} as const;

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

export const PRIORITY_LABELS: Record<Priority, string> = {
  [PRIORITY.LOW]: '낮음',
  [PRIORITY.MEDIUM]: '보통',
  [PRIORITY.HIGH]: '높음',
};

export const PRIORITY_STARS: Record<Priority, string> = {
  [PRIORITY.LOW]: '☆',
  [PRIORITY.MEDIUM]: '⭐',
  [PRIORITY.HIGH]: '⭐⭐',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  [PRIORITY.LOW]: '#94A3B8',
  [PRIORITY.MEDIUM]: '#F59E0B',
  [PRIORITY.HIGH]: '#EF4444',
};

export const REPEAT_DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const;

/** 0 = Monday … 6 = Sunday */
export const REPEAT_DAY_INDICES = [0, 1, 2, 3, 4, 5, 6] as const;
