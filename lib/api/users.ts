import { ApiError, apiRequest, isApiConfigured } from '@/lib/api/client';
import { mapUserResponse } from '@/lib/api/mappers';
import type { User } from '@/types/user';

export async function syncUserToServer(user: User): Promise<void> {
  if (!isApiConfigured) return;

  await apiRequest('/users', {
    method: 'POST',
    body: {
      id: user.id,
      nickname: user.nickname,
      tag: user.tag,
      createdAt: user.createdAt,
    },
  });
}

export async function deleteUserFromServer(userId: string): Promise<void> {
  if (!isApiConfigured || !userId) return;

  await apiRequest<void>(`/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function fetchUserFromServer(userId: string): Promise<User | null> {
  if (!isApiConfigured || !userId) return null;

  try {
    const data = await apiRequest<unknown>(`/users/${userId}`);
    return mapUserResponse(data, userId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function fetchUserByDisplayName(
  nickname: string,
  tag: number,
): Promise<User | null> {
  if (!isApiConfigured) return null;

  try {
    const data = await apiRequest<unknown>('/users/login', {
      method: 'POST',
      body: { nickname, tag },
    });
    return mapUserResponse(data);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return null;
    }
    throw error;
  }
}
