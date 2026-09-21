import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Achievement,
  CaseCompletion,
  PlayerProfile,
  StatBlock,
} from '@/types/player';

interface PlayerState {
  profile: PlayerProfile;
  setDisplayName: (name: string) => void;
  recordCaseStart: () => void;
  recordCaseCompletion: (completion: CaseCompletion) => void;
  addCluesFound: (count: number) => void;
  addPlayTime: (ms: number) => void;
  unlockAchievement: (achievement: Achievement) => void;
  resetProfile: () => void;
}

const EMPTY_STATS: StatBlock = {
  totalCasesStarted: 0,
  totalCasesCompleted: 0,
  totalPlayTimeMs: 0,
  totalCluesFound: 0,
  totalEndingsUnlocked: 0,
};

function createEmptyProfile(): PlayerProfile {
  return {
    displayName: 'Detective',
    createdAt: new Date().toISOString(),
    stats: { ...EMPTY_STATS },
    completions: [],
    achievements: [],
  };
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      profile: createEmptyProfile(),
      setDisplayName: (name: string) =>
        set((state) => ({
          profile: { ...state.profile, displayName: name.trim() || 'Detective' },
        })),
      recordCaseStart: () =>
        set((state) => ({
          profile: {
            ...state.profile,
            stats: {
              ...state.profile.stats,
              totalCasesStarted: state.profile.stats.totalCasesStarted + 1,
            },
          },
        })),
      recordCaseCompletion: (completion: CaseCompletion) =>
        set((state) => {
          const already = state.profile.completions.find(
            (c) => c.caseId === completion.caseId && c.endingId === completion.endingId,
          );
          const completions = already
            ? state.profile.completions
            : [...state.profile.completions, completion];
          const uniqueCaseIds = new Set(completions.map((c) => c.caseId));
          const uniqueEndingIds = new Set(completions.map((c) => c.endingId));
          return {
            profile: {
              ...state.profile,
              completions,
              stats: {
                ...state.profile.stats,
                totalCasesCompleted: uniqueCaseIds.size,
                totalEndingsUnlocked: uniqueEndingIds.size,
              },
            },
          };
        }),
      addCluesFound: (count: number) =>
        set((state) => ({
          profile: {
            ...state.profile,
            stats: {
              ...state.profile.stats,
              totalCluesFound: state.profile.stats.totalCluesFound + count,
            },
          },
        })),
      addPlayTime: (ms: number) =>
        set((state) => ({
          profile: {
            ...state.profile,
            stats: {
              ...state.profile.stats,
              totalPlayTimeMs: state.profile.stats.totalPlayTimeMs + ms,
            },
          },
        })),
      unlockAchievement: (achievement: Achievement) =>
        set((state) => {
          if (state.profile.achievements.some((a) => a.id === achievement.id)) {
            return state;
          }
          return {
            profile: {
              ...state.profile,
              achievements: [
                ...state.profile.achievements,
                { ...achievement, unlockedAt: new Date().toISOString() },
              ],
            },
          };
        }),
      resetProfile: () => set({ profile: createEmptyProfile() }),
    }),
    {
      name: '@dm/player_profile',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);