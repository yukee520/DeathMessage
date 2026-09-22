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

const THEME_LABEL: Record<'system' | 'light' | 'dark', string> = {
  system: '跟随系统',
  light: '浅色',
  dark: '深色',
};

const FONT_LABEL: Record<'small' | 'medium' | 'large', string> = {
  small: '小',
  medium: '中',
  large: '大',
};

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
      text1: '内容源已保存',
      position: 'bottom',
    });
  }, [contentUrl, settings, queryClient]);

  const handleResetContentUrl = useCallback((): void => {
    setContentUrl(CONTENT_BASE_URL);
    settings.setContentBaseUrl(CONTENT_BASE_URL);
    void queryClient.invalidateQueries({ queryKey: ['remote-cases'] });
    Toast.show({
      type: 'success',
      text1: '已恢复默认内容源',
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
      text1: 'LLM 设置已保存',
      text2: '之后的回复将使用新配置。',
      position: 'bottom',
    });
  }, [settings, llmEndpoint, llmApiKey, llmModel]);

  const handleClearCache = useCallback((): void => {
    Alert.alert(
      '清除缓存？',
      '将清除本地缓存的查询数据。已下载的案件会保留。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: () => {
            queryClient.clear();
            clearDownloads();
            Toast.show({
              type: 'success',
              text1: '缓存已清除',
              position: 'bottom',
            });
          },
        },
      ],
    );
  }, [queryClient, clearDownloads]);

  const handleResetProgress = useCallback((): void => {
    Alert.alert(
      '重置所有进度？',
      '所有游戏进度与档案统计将被清空。已下载的案件会保留。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重置',
          style: 'destructive',
          onPress: () => {
            resetAllSessions();
            resetProfile();
            Toast.show({
              type: 'success',
              text1: '进度已重置',
              position: 'bottom',
            });
          },
        },
      ],
    );
  }, [resetAllSessions, resetProfile]);

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={['top']}
    >
      <HeaderBar title="设置" showBack />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
          外观
        </Text>
        <AppCard className="mb-5">
          <Text className="text-sm font-semibold text-text dark:text-dark-text">
            主题模式
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
                    'text-sm font-semibold',
                    theme.mode === mode
                      ? 'text-white'
                      : 'text-text dark:text-dark-text',
                  ].join(' ')}
                >
                  {THEME_LABEL[mode]}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-4 border-t border-border dark:border-dark-border pt-3">
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              字体大小
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
                      'text-sm font-semibold',
                      settings.fontSize === size
                        ? 'text-white'
                        : 'text-text dark:text-dark-text',
                    ].join(' ')}
                  >
                    {FONT_LABEL[size]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </AppCard>

        <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
          内容源
        </Text>
        <AppCard className="mb-5">
          <Text className="text-sm font-semibold text-text dark:text-dark-text">
            案件索引 URL
          </Text>
          <Text className="mt-1 text-xs text-muted dark:text-dark-muted">
            你的 GitHub 内容仓库的基础地址。
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
            <AppButton
              label="保存"
              icon="save-outline"
              onPress={handleSaveContentUrl}
            />
            <AppButton
              label="恢复默认"
              icon="refresh-outline"
              variant="secondary"
              onPress={handleResetContentUrl}
            />
          </View>
        </AppCard>

        <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
          LLM 配置
        </Text>
        <AppCard className="mb-5">
          <Text className="text-sm font-semibold text-text dark:text-dark-text">
            OpenAI 兼容接口地址
          </Text>
          <Text className="mt-1 text-xs text-muted dark:text-dark-muted">
            你的后端代理地址。留空则使用内置的默认回复。
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
            API 密钥
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
            模型
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
              label="保存 LLM 设置"
              icon="save-outline"
              onPress={handleSaveLLM}
              fullWidth
            />
          </View>
        </AppCard>

        <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
          反馈
        </Text>
        <AppCard className="mb-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-semibold text-text dark:text-dark-text">
                音效
              </Text>
              <Text className="text-xs text-muted dark:text-dark-muted">
                氛围音与消息提示音。
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
                震动反馈
              </Text>
              <Text className="text-xs text-muted dark:text-dark-muted">
                关键操作时震动。
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
          危险操作
        </Text>
        <AppCard className="mb-8">
          <AppButton
            label="清除缓存"
            icon="trash-outline"
            variant="secondary"
            fullWidth
            onPress={handleClearCache}
          />
          <View className="mt-3">
            <AppButton
              label="重置所有进度"
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
            死亡信息 v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}