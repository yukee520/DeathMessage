import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONTENT_BASE_URL } from '@/api/content';

interface SettingsState {
  contentBaseUrl: string;
  llmEndpoint: string;
  llmApiKey: string;
  llmModel: string;
  llmTimeoutMs: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  setContentBaseUrl: (url: string) => void;
  setLLM: (config: {
    endpoint?: string;
    apiKey?: string;
    model?: string;
    timeoutMs?: number;
  }) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  reset: () => void;
}

const DEFAULTS = {
  contentBaseUrl: CONTENT_BASE_URL,
  llmEndpoint: '',
  llmApiKey: '',
  llmModel: 'gpt-4o-mini',
  llmTimeoutMs: 60000,
  soundEnabled: true,
  hapticsEnabled: true,
  fontSize: 'medium' as const,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setContentBaseUrl: (url: string) =>
        set({ contentBaseUrl: url.trim() || CONTENT_BASE_URL }),
      setLLM: (config) =>
        set((state) => ({
          llmEndpoint:
            config.endpoint !== undefined ? config.endpoint.trim() : state.llmEndpoint,
          llmApiKey:
            config.apiKey !== undefined ? config.apiKey.trim() : state.llmApiKey,
          llmModel:
            config.model !== undefined ? config.model.trim() : state.llmModel,
          llmTimeoutMs:
            config.timeoutMs !== undefined ? config.timeoutMs : state.llmTimeoutMs,
        })),
      setSoundEnabled: (enabled: boolean) => set({ soundEnabled: enabled }),
      setHapticsEnabled: (enabled: boolean) => set({ hapticsEnabled: enabled }),
      setFontSize: (size) => set({ fontSize: size }),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: '@dm/settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);