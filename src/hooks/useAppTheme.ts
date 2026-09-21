import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/store/useThemeStore';

export interface AppTheme {
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    muted: string;
    danger: string;
    success: string;
    border: string;
    darkBackground: string;
    darkCard: string;
    darkText: string;
    darkMuted: string;
    darkBorder: string;
  };
}

export function useAppTheme(): AppTheme {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  return {
    isDark,
    colors: {
      primary: '#2563EB',
      secondary: '#64748B',
      background: '#F8FAFC',
      card: '#FFFFFF',
      text: '#0F172A',
      muted: '#94A3B8',
      danger: '#EF4444',
      success: '#10B981',
      border: '#E2E8F0',
      darkBackground: '#0F172A',
      darkCard: '#1E293B',
      darkText: '#F1F5F9',
      darkMuted: '#64748B',
      darkBorder: '#334155',
    },
  };
}