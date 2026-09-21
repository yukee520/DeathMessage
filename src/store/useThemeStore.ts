import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      setMode: (mode: ThemeMode) => set({ mode }),
      toggle: () => {
        const current = get().mode;
        const next: ThemeMode =
          current === 'dark' ? 'light' : current === 'light' ? 'system' : 'dark';
        set({ mode: next });
      },
    }),
    {
      name: '@dm/theme',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);