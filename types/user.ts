export interface User {
  id: string;
  nickname: string;
  tag: number;
  createdAt: string;
}

export function formatUserDisplay(user: User): string {
  return `${user.nickname}#${user.tag}`;
}
