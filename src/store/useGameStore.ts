import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatSessionState } from '@/types/game';

interface GameState {
  sessions: Record<string, ChatSessionState>;
  activeCaseId: string | null;
  setActiveCase: (caseId: string | null) => void;
  getSession: (caseId: string) => ChatSessionState | undefined;
  ensureSession: (caseId: string, startChapterId: string) => ChatSessionState;
  setChapter: (caseId: string, chapterId: string) => void;
  revealMessage: (caseId: string, messageId: string) => void;
  recordChoice: (caseId: string, choiceId: string) => void;
  unlockClue: (caseId: string, clueId: string) => void;
  hasClue: (caseId: string, clueId: string) => boolean;
  resetSession: (caseId: string) => void;
  resetAll: () => void;
}

function createEmptySession(caseId: string, chapterId: string): ChatSessionState {
  return {
    caseId,
    chapterId,
    revealedMessageIds: [],
    selectedChoiceIds: [],
    unlockedClueIds: [],
    isTyping: false,
    isAwaitingLLM: false,
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      sessions: {},
      activeCaseId: null,
      setActiveCase: (caseId) => set({ activeCaseId: caseId }),
      getSession: (caseId: string) => get().sessions[caseId],
      ensureSession: (caseId: string, startChapterId: string): ChatSessionState => {
        const existing = get().sessions[caseId];
        if (existing) return existing;
        const fresh = createEmptySession(caseId, startChapterId);
        set((state) => ({
          sessions: { ...state.sessions, [caseId]: fresh },
        }));
        return fresh;
      },
      setChapter: (caseId: string, chapterId: string) =>
        set((state) => {
          const existing = state.sessions[caseId] ?? createEmptySession(caseId, chapterId);
          return {
            sessions: {
              ...state.sessions,
              [caseId]: {
                ...existing,
                chapterId,
                revealedMessageIds: [],
              },
            },
          };
        }),
      revealMessage: (caseId: string, messageId: string) =>
        set((state) => {
          const existing = state.sessions[caseId];
          if (!existing) return state;
          if (existing.revealedMessageIds.includes(messageId)) return state;
          return {
            sessions: {
              ...state.sessions,
              [caseId]: {
                ...existing,
                revealedMessageIds: [...existing.revealedMessageIds, messageId],
              },
            },
          };
        }),
      recordChoice: (caseId: string, choiceId: string) =>
        set((state) => {
          const existing = state.sessions[caseId];
          if (!existing) return state;
          if (existing.selectedChoiceIds.includes(choiceId)) return state;
          return {
            sessions: {
              ...state.sessions,
              [caseId]: {
                ...existing,
                selectedChoiceIds: [...existing.selectedChoiceIds, choiceId],
              },
            },
          };
        }),
      unlockClue: (caseId: string, clueId: string) =>
        set((state) => {
          const existing = state.sessions[caseId];
          if (!existing) return state;
          if (existing.unlockedClueIds.includes(clueId)) return state;
          return {
            sessions: {
              ...state.sessions,
              [caseId]: {
                ...existing,
                unlockedClueIds: [...existing.unlockedClueIds, clueId],
              },
            },
          };
        }),
      hasClue: (caseId: string, clueId: string): boolean => {
        const session = get().sessions[caseId];
        return session ? session.unlockedClueIds.includes(clueId) : false;
      },
      resetSession: (caseId: string) =>
        set((state) => {
          const next = { ...state.sessions };
          delete next[caseId];
          return { sessions: next };
        }),
      resetAll: () => set({ sessions: {}, activeCaseId: null }),
    }),
    {
      name: '@dm/game_store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);