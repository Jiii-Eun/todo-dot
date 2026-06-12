import type { Todo } from '@/types/todo';

export function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    const timeCompare = a.startTime.localeCompare(b.startTime);
    if (timeCompare !== 0) return timeCompare;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function calculateAchievementRate(todos: Todo[]): {
  percentage: number;
  completed: number;
  total: number;
} {
  const total = todos.length;
  if (total === 0) return { percentage: 0, completed: 0, total: 0 };
  const completed = todos.filter((t) => t.isCompleted).length;
  return {
    percentage: Math.round((completed / total) * 100),
    completed,
    total,
  };
}
