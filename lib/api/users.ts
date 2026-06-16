import { ApiError, apiRequest, isApiConfigured } from '@/lib/api/client';
import { mapUserResponse } from '@/lib/api/mappers';
import type { User } from '@/types/user';

function userPayload(user: User) {
  return {
    id: user.id,
    nickname: user.nickname,
    tag: user.tag,
    createdAt: user.createdAt,
  };
}

/** 신규 가입 시 1회 호출. 409 등 실패 시 예외를 그대로 던진다. */
export async function createUserOnServer(user: User): Promise<void> {
  if (!isApiConfigured()) return;

  await apiRequest('/users', {
    method: 'POST',
    body: userPayload(user),
  });
}

/** 로컬에만 있는 계정을 서버에 등록. 이미 있으면 POST를 건너뛴다. */
export async function ensureUserOnServer(user: User): Promise<void> {
  if (!isApiConfigured()) return;

  const existing = await fetchUserFromServer(user.id);
  if (existing) return;

  try {
    await apiRequest('/users', {
      method: 'POST',
      body: userPayload(user),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return;
    }
    throw error;
  }
}

export async function deleteUserFromServer(userId: string): Promise<void> {
  if (!isApiConfigured() || !userId) return;

  await apiRequest<void>(`/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function fetchUserFromServer(userId: string): Promise<User | null> {
  if (!isApiConfigured() || !userId) return null;

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
  if (!isApiConfigured()) return null;

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
