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
  clearUser,
  loadUser,
  saveUser,
} from '@/lib/local/storage';
import {
  deleteUserFromServer,
  fetchUserByDisplayName,
  fetchUserFromServer,
  syncUserToServer,
} from '@/lib/firebase/users';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import type { User } from '@/types/user';
import { formatUserDisplay } from '@/types/user';

interface UserContextValue {
  user: User | null;
  isLoading: boolean;
  displayName: string;
  createUser: (nickname: string) => Promise<{ success: boolean; message: string }>;
  loginUser: (displayName: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const localUser = await loadUser();
      if (localUser) {
        const remoteUser = await fetchUserFromServer(localUser.id);
        setUser(remoteUser ?? localUser);
      } else {
        setUser(null);
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
    await syncUserToServer(newUser);
    setUser(newUser);
    return { success: true, message: '' };
  }, []);

  const loginUser = useCallback(async (displayNameInput: string) => {
    const validation = validateDisplayName(displayNameInput);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    if (!isFirebaseConfigured) {
      return {
        success: false,
        message: '다른 기기에서 접속하려면 Firebase 연동이 필요합니다.',
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

  const logout = useCallback(async () => {
    await clearAllData();
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (user) {
      await deleteUserFromServer(user.id);
    }
    await clearAllData();
    await clearUser();
    setUser(null);
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
      createUser,
      loginUser,
      logout,
      deleteAccount,
      refreshUser,
    }),
    [user, isLoading, displayName, createUser, loginUser, logout, deleteAccount, refreshUser],
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
