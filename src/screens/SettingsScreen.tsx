import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Switch,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeStore } from '@/store/useThemeStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useGameStore } from '@/store/useGameStore';
import { useDownloadStore } from '@/store/useDownloadStore';
import { CONTENT_BASE_URL } from '@/api/content';
import HeaderBar from '@/components/HeaderBar';
import AppCard from '@/components/AppCard';
import AppButton from '@/components/AppButton';

export default function SettingsScreen(): JSX.Element {
  const settings = useSettingsStore();
  const theme = useThemeStore();
  const resetProfile = usePlayerStore((s) => s.resetProfile);
  const resetAllSessions = useGameStore((s) => s.resetAll);
  const clearDownloads = useDownloadStore((s) => s.clearAll);
  const queryClient = useQueryClient();

  const [contentUrl, setContentUrl] = useState<string>(settings.contentBaseUrl);
  const [llmEndpoint, setLlmEndpoint] = useState<string>(settings.llmEndpoint);
  const [llmApiKey, setLlmApiKey] = useState<string>(settings.llmApiKey);
  const [llmModel, setLlmModel] = useState<string>(settings.llmModel);

  const handleSaveContentUrl = useCallback((): void => {
    settings.setContentBaseUrl(contentUrl);
    void queryClient.invalidateQueries({ queryKey: ['remote-cases'] });
    Toast.show({
      type: 'success',
      text1: 'Content source saved',
      position: 'bottom',
    });
  }, [contentUrl, settings, queryClient]);

  const handleResetContentUrl = useCallback((): void => {
    setContentUrl(CONTENT_BASE_URL);
    settings.setContentBaseUrl(CONTENT_BASE_URL);
    void queryClient.invalidateQueries({ queryKey: ['remote-cases'] });
    Toast.show({
      type: 'success',
      text1: 'Reset to default source',
      position: 'bottom',
    });
  }, [settings, queryClient]);

  const handleSaveLLM = useCallback((): void => {
    settings.setLLM({
      endpoint: llmEndpoint,
      apiKey: llmApiKey,
      model: llmModel,
    });
    Toast.show({
      type: 'success',
      text1: 'LLM settings saved',
      text2: 'New replies will use these settings.',
      position: 'bottom',
    });
  }, [settings, llmEndpoint, llmApiKey, llmModel]);

  const handleClearCache = useCallback((): void => {
    Alert.alert(
      'Clear cache?',
      'This clears locally cached query data. Downloaded cases are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            queryClient.clear();
            clearDownloads();
            Toast.show({
              type: 'success',
              text1: 'Cache cleared',
              position: 'bottom',
            });
          },
        },
      ],
    );
  }, [queryClient, clearDownloads]);

  const handleResetProgress = useCallback((): void => {
    Alert.alert(
      'Reset all progress?',
      'All game sessions and profile stats will be erased. Downloaded cases are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetAllSessions();
            resetProfile();
            Toast.show({
              type: 'success',
              text1: 'Progress reset',
              position: 'bottom',
            });
          },
        },
      ],
    );
  }, [resetAllSessions, resetProfile]);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top']}>
      <HeaderBar title="Settings" showBack />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
          Appearance
        </Text>
        <AppCard className="mb-5">
          <Text className="text-sm font-semibold text-text dark:text-dark-text">
            Theme mode
          </Text>
          <View className="mt-3 flex-row">
            {(['system', 'light', 'dark'] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => theme.setMode(mode)}
                className={[
                  'mr-2 flex-1 items-center rounded-xl border py-2',
                  theme.mode === mode
                    ? 'border-primary bg-primary'
                    : 'border-border dark:border-dark-border',
                ].join(' ')}
              >
                <Text
                  className={[
                    'text-sm font-semibold capitalize',
                    theme.mode === mode
                      ? 'text-white'
                      : 'text-text dark:text-dark-text',
                  ].join(' ')}
                >
                  {mode}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-4 border-t border-border dark:border-dark-border pt-3">
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              Font size
            </Text>
            <View className="mt-3 flex-row">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <Pressable
                  key={size}
                  onPress={() => settings.setFontSize(size)}
                  className={[
                    'mr-2 flex-1 items-center rounded-xl border py-2',
                    settings.fontSize === size
                      ? 'border-primary bg-primary'
                      : 'border-border dark:border-dark-border',
                  ].join(' ')}
                >
                  <Text
                    className={[
                      'text-sm font-semibold capitalize',
                      settings.fontSize === size
                        ? 'text-white'
                        : 'text-text dark:text-dark-text',
                    ].join(' ')}
                  >
                    {size}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </AppCard>

        <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
          Content Source
        </Text>
        <AppCard className="mb-5">
          <Text className="text-sm font-semibold text-text dark:text-dark-text">
            Case index URL
          </Text>
          <Text className="mt-1 text-xs text-muted dark:text-dark-muted">
            Base URL of your GitHub content repository.
          </Text>
          <TextInput
            value={contentUrl}
            onChangeText={setContentUrl}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={CONTENT_BASE_URL}
            placeholderTextColor="#94A3B8"
            className="mt-3 rounded-xl border border-border dark:border-dark-border bg-background dark:bg-dark-background px-3 py-2 text-xs text-text dark:text-dark-text"
          />
          <View className="mt-3 flex-row flex-wrap gap-2">
            <AppButton label="Save" icon="save-outline" onPress={handleSaveContentUrl} />
            <AppButton
              label="Reset"
              icon="refresh-outline"
              variant="secondary"
              onPress={handleResetContentUrl}
            />
          </View>
        </AppCard>

        <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
          LLM Configuration
        </Text>
        <AppCard className="mb-5">
          <Text className="text-sm font-semibold text-text dark:text-dark-text">
            OpenAI-compatible endpoint
          </Text>
          <Text className="mt-1 text-xs text-muted dark:text-dark-muted">
            Your backend proxy URL. Leave blank to use built-in fallback replies.
          </Text>
          <TextInput
            value={llmEndpoint}
            onChangeText={setLlmEndpoint}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="https://your-proxy.example.com/v1/chat/completions"
            placeholderTextColor="#94A3B8"
            className="mt-3 rounded-xl border border-border dark:border-dark-border bg-background dark:bg-dark-background px-3 py-2 text-xs text-text dark:text-dark-text"
          />

          <Text className="mt-4 text-sm font-semibold text-text dark:text-dark-text">
            API key
          </Text>
          <TextInput
            value={llmApiKey}
            onChangeText={setLlmApiKey}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            placeholder="sk-..."
            placeholderTextColor="#94A3B8"
            className="mt-2 rounded-xl border border-border dark:border-dark-border bg-background dark:bg-dark-background px-3 py-2 text-xs text-text dark:text-dark-text"
          />

          <Text className="mt-4 text-sm font-semibold text-text dark:text-dark-text">
            Model
          </Text>
          <TextInput
            value={llmModel}
            onChangeText={setLlmModel}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="gpt-4o-mini"
            placeholderTextColor="#94A3B8"
            className="mt-2 rounded-xl border border-border dark:border-dark-border bg-background dark:bg-dark-background px-3 py-2 text-xs text-text dark:text-dark-text"
          />

          <View className="mt-4">
            <AppButton
              label="Save LLM settings"
              icon="save-outline"
              onPress={handleSaveLLM}
              fullWidth
            />
          </View>
        </AppCard>

        <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
          Feedback
        </Text>
        <AppCard className="mb-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-semibold text-text dark:text-dark-text">
                Sound effects
              </Text>
              <Text className="text-xs text-muted dark:text-dark-muted">
                Atmosphere and message tones.
              </Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={settings.setSoundEnabled}
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            />
          </View>
          <View className="mt-4 flex-row items-center justify-between border-t border-border dark:border-dark-border pt-3">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-semibold text-text dark:text-dark-text">
                Haptics
              </Text>
              <Text className="text-xs text-muted dark:text-dark-muted">
                Vibration on key actions.
              </Text>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={settings.setHapticsEnabled}
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            />
          </View>
        </AppCard>

        <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
          Danger Zone
        </Text>
        <AppCard className="mb-8">
          <AppButton
            label="Clear cache"
            icon="trash-outline"
            variant="secondary"
            fullWidth
            onPress={handleClearCache}
          />
          <View className="mt-3">
            <AppButton
              label="Reset all progress"
              icon="warning-outline"
              variant="danger"
              fullWidth
              onPress={handleResetProgress}
            />
          </View>
        </AppCard>

        <View className="items-center">
          <Ionicons name="skull-outline" size={28} color="#94A3B8" />
          <Text className="mt-2 text-xs text-muted dark:text-dark-muted">
            Death Message v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}