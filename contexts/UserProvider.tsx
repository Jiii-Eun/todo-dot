import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createId } from '@/lib/utils/id';
import {
  generateTag,
  parseDisplayName,
  validateDisplayName,
  validateNickname,
} from '@/lib/validation/nickname';
import {
  clearAllData,
  loadUser,
  saveUser,
} from '@/lib/local/storage';
import {
  createUserOnServer,
  deleteUserFromServer,
  ensureUserOnServer,
  fetchUserByDisplayName,
  fetchUserFromServer,
} from '@/lib/api/users';
import { isApiConfigured } from '@/lib/api/client';
import type { User } from '@/types/user';
import { formatUserDisplay } from '@/types/user';

export type EntryMode = 'create' | 'login';

interface UserContextValue {
  user: User | null;
  isLoading: boolean;
  displayName: string;
  entryMode: EntryMode;
  setEntryMode: (mode: EntryMode) => void;
  createUser: (nickname: string) => Promise<{ success: boolean; message: string }>;
  loginUser: (displayName: string) => Promise<{ success: boolean; message: string }>;
  switchAccount: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [entryMode, setEntryMode] = useState<EntryMode>('create');

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const localUser = await loadUser();
      if (!localUser) {
        setUser(null);
        return;
      }

      const remoteUser = await fetchUserFromServer(localUser.id);

      const stillLocal = await loadUser();
      if (!stillLocal || stillLocal.id !== localUser.id) {
        setUser(null);
        return;
      }

      if (remoteUser) {
        setUser({
          ...localUser,
          ...remoteUser,
          id: remoteUser.id || localUser.id,
        });
      } else {
        try {
          await ensureUserOnServer(localUser);
        } catch (error) {
          console.warn('[UserProvider] ensure user on server failed:', error);
        }
        setUser(localUser);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const createUser = useCallback(async (nickname: string) => {
    const validation = validateNickname(nickname);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const newUser: User = {
      id: createId(),
      nickname: nickname.trim(),
      tag: generateTag(),
      createdAt: new Date().toISOString(),
    };

    await saveUser(newUser);
    try {
      await createUserOnServer(newUser);
    } catch {
      return {
        success: false,
        message: '계정 생성에 실패했습니다. 네트워크 연결을 확인해 주세요.',
      };
    }
    setUser(newUser);
    return { success: true, message: '' };
  }, []);

  const loginUser = useCallback(async (displayNameInput: string) => {
    const validation = validateDisplayName(displayNameInput);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    if (!isApiConfigured) {
      return {
        success: false,
        message: '다른 기기에서 접속하려면 서버 연결이 필요합니다.',
      };
    }

    const parsed = parseDisplayName(displayNameInput);
    if (!parsed) {
      return { success: false, message: '닉네임#1234 형태로 입력해 주세요.' };
    }

    const remoteUser = await fetchUserByDisplayName(parsed.nickname, parsed.tag);
    if (!remoteUser) {
      return { success: false, message: '일치하는 계정을 찾을 수 없습니다.' };
    }

    await saveUser(remoteUser);
    setUser(remoteUser);
    return { success: true, message: '' };
  }, []);

  const switchAccount = useCallback(async () => {
    await clearAllData();
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!user) {
      return { success: false, message: '로그인된 계정이 없습니다.' };
    }

    try {
      await deleteUserFromServer(user.id);
      await clearAllData();
      setUser(null);
      return { success: true, message: '' };
    } catch {
      return {
        success: false,
        message: '계정 삭제에 실패했습니다. 네트워크 연결을 확인해 주세요.',
      };
    }
  }, [user]);

  const displayName = useMemo(
    () => (user ? formatUserDisplay(user) : ''),
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      displayName,
      entryMode,
      setEntryMode,
      createUser,
      loginUser,
      switchAccount,
      deleteAccount,
      refreshUser,
    }),
    [
      user,
      isLoading,
      displayName,
      entryMode,
      createUser,
      loginUser,
      switchAccount,
      deleteAccount,
      refreshUser,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
}
