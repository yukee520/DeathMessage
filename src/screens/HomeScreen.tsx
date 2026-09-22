import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { RootStackParamList } from '@/types/navigation';
import type { MergedCaseEntry } from '@/types/content';
import { useRemoteCases } from '@/hooks/useRemoteCases';
import { useDownloadedCases } from '@/hooks/useDownloadedCases';
import { useGameStore } from '@/store/useGameStore';
import { LoadingView, ErrorView } from '@/components/StateViews';
import AppCard from '@/components/AppCard';
import AppButton from '@/components/AppButton';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const remote = useRemoteCases();
  const downloaded = useDownloadedCases();
  const activeCaseId = useGameStore((s) => s.activeCaseId);

  const isLoading = remote.isLoading || downloaded.isLoading;
  const isError = remote.isError;

  if (isLoading) {
    return <LoadingView message="正在准备案件文件…" />;
  }

  if (isError) {
    return (
      <ErrorView
        title="无法连接内容服务器"
        message={remote.error?.message ?? '请检查你的网络连接。'}
        onRetry={() => {
          remote.refetch();
          downloaded.refetch();
        }}
      />
    );
  }

  const downloadedIds = new Set((downloaded.data ?? []).map((r) => r.id));
  const remoteCases = remote.data?.cases ?? [];

  const featured: MergedCaseEntry[] = remoteCases.slice(0, 3).map((c) => {
    const record = (downloaded.data ?? []).find((r) => r.id === c.id);
    const status = !record
      ? 'not-downloaded'
      : record.version < c.version
      ? 'update-available'
      : 'downloaded';
    return {
      ...c,
      status,
      localVersion: record?.version,
    };
  });

  const activeCase = remoteCases.find((c) => c.id === activeCaseId);

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={['top']}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-5 pt-4 pb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-black text-text dark:text-dark-text">
                死亡信息
              </Text>
              <Text className="mt-1 text-sm text-muted dark:text-dark-muted">
                每一条消息，都可能是遗言。
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('Settings')}
              className="h-10 w-10 items-center justify-center rounded-full bg-card dark:bg-dark-card"
            >
              <Ionicons name="settings-outline" size={20} color="#64748B" />
            </Pressable>
          </View>
        </View>

        {activeCase ? (
          <View className="px-5">
            <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
              继续游戏
            </Text>
            <AppCard className="mb-6">
              <Text className="text-lg font-bold text-text dark:text-dark-text">
                {activeCase.title}
              </Text>
              <Text
                numberOfLines={2}
                className="mt-1 text-sm text-muted dark:text-dark-muted"
              >
                {activeCase.subtitle}
              </Text>
              <View className="mt-4">
                <AppButton
                  label="继续调查"
                  icon="play"
                  onPress={() =>
                    navigation.navigate('Chat', { caseId: activeCase.id })
                  }
                />
              </View>
            </AppCard>
          </View>
        ) : null}

        <View className="px-5">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
              精选案件
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Tabs', { screen: 'Cases' })}
            >
              <Text className="text-xs font-semibold text-primary">查看全部</Text>
            </Pressable>
          </View>

          {featured.length === 0 ? (
            <AppCard>
              <Text className="text-sm text-muted dark:text-dark-muted">
                当前没有可用的案件。请在「案件」标签页下拉刷新。
              </Text>
            </AppCard>
          ) : (
            featured.map((c) => (
              <AppCard
                key={c.id}
                className="mb-3"
                onPress={() =>
                  navigation.navigate('CaseDetail', { caseId: c.id })
                }
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text
                      numberOfLines={1}
                      className="text-base font-bold text-text dark:text-dark-text"
                    >
                      {c.title}
                    </Text>
                    <Text
                      numberOfLines={2}
                      className="mt-0.5 text-xs text-muted dark:text-dark-muted"
                    >
                      {c.subtitle}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </View>
              </AppCard>
            ))
          )}
        </View>

        <View className="mt-6 px-5">
          <AppCard>
            <View className="flex-row items-center">
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#2563EB"
              />
              <Text className="ml-2 flex-1 text-xs text-muted dark:text-dark-muted">
                新的案件与剧情会从内容服务器自动下载。无需更新 App。
              </Text>
            </View>
          </AppCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}