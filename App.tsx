import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useColorScheme } from 'react-native';
import RootNavigator from '@/navigation/RootNavigator';
import { useThemeStore } from '@/store/useThemeStore';
import './global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    },
  },
});

function AppInner(): JSX.Element {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  useEffect(() => {
    // noop: reserved for future theme side-effects (e.g., status bar animation)
  }, [isDark]);

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: '#0F172A',
          card: '#1E293B',
          text: '#F1F5F9',
          border: '#334155',
          primary: '#2563EB',
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: '#F8FAFC',
          card: '#FFFFFF',
          text: '#0F172A',
          border: '#E2E8F0',
          primary: '#2563EB',
        },
      };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0F172A' : '#F8FAFC'}
      />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppInner />
          <Toast />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}