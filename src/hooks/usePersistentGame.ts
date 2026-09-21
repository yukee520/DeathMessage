import { useCallback, useEffect, useState } from 'react';
import type { ChatSessionState } from '@/types/game';
import { getItem, setItem, StorageKeys } from '@/utils/storage';

export interface UsePersistentGameResult {
  isHydrated: boolean;
  saveSession: (caseId: string, session: ChatSessionState) => Promise<void>;
  loadSession: (caseId: string) => Promise<ChatSessionState | null>;
  clearSession: (caseId: string) => Promise<void>;
}

export function usePersistentGame(): UsePersistentGameResult {
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const saveSession = useCallback(
    async (caseId: string, session: ChatSessionState): Promise<void> => {
      const key = `${StorageKeys.GAME_STATE_PREFIX}${caseId}`;
      await setItem<ChatSessionState>(key, session);
    },
    [],
  );

  const loadSession = useCallback(
    async (caseId: string): Promise<ChatSessionState | null> => {
      const key = `${StorageKeys.GAME_STATE_PREFIX}${caseId}`;
      return await getItem<ChatSessionState>(key);
    },
    [],
  );

  const clearSession = useCallback(
    async (caseId: string): Promise<void> => {
      const key = `${StorageKeys.GAME_STATE_PREFIX}${caseId}`;
      await setItem<null>(key, null);
    },
    [],
  );

  return { isHydrated, saveSession, loadSession, clearSession };
}