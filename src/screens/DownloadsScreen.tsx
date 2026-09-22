import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { RootStackParamList } from '@/types/navigation';
import type { DownloadedCaseRecord } from '@/types/content';
import { useDownloadedCases } from '@/hooks/useDownloadedCases';
import { useRemoteCases } from '@/hooks/useRemoteCases';
import { useDownloadCase } from '@/hooks/useDownloadCase';
import { formatDateTime, formatFileSize } from '@/utils/format';
import HeaderBar from '@/components/HeaderBar';
import AppCard from '@/components/AppCard';
import AppButton from '@/components/AppButton';
import { EmptyView, LoadingView } from '@/components/StateViews';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DownloadsScreen(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const downloaded = useDownloadedCases();
  const remote = useRemoteCases();
  const downloader = useDownloadCase();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      await Promise.all([downloaded.refetch(), remote.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [downloaded, remote]);

  const totalSize = useMemo<number>(
    () =>
      (downloaded.data ?? []).reduce(
        (acc, r) => acc + (r.sizeBytes || 0),
        0,
      ),
    [downloaded.data],
  );

  const handleDelete = useCallback(
    (record: DownloadedCaseRecord): void => {
      const entry = remote.data?.cases.find((c) => c.id === record.id);
      Alert.alert(
        '删除案件数据？',
        `「${entry?.title ?? record.id}」将从本设备移除。`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '删除',
            style: 'destructive',
            onPress: () => {
              void downloader.remove(record.id);
            },
          },
        ],
      );
    },
    [remote.data, downloader],
  );

  if (downloaded.isLoading && !downloaded.data) {
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-dark-background"
        edges={['top']}
      >
        <HeaderBar title="下载管理" showBack />
        <LoadingView message="加载下载记录…" />
      </SafeAreaView>
    );
  }

  const records = downloaded.data ?? [];

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={['top']}
    >
      <HeaderBar
        title="下载管理"
        subtitle={`${records.length} 个案件 • ${formatFileSize(totalSize)}`}
        showBack
      />
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
        ListEmptyComponent={
          <EmptyView
            title="暂无下载"
            message="你下载的案件会出现在这里，可离线游玩。"
            icon="cloud-download-outline"
            actionLabel="浏览案件"
            onAction={() => navigation.navigate('Tabs', { screen: 'Cases' })}
          />
        }
        renderItem={({ item }) => {
          const entry = remote.data?.cases.find((c) => c.id === item.id);
          const hasUpdate = entry ? entry.version > item.version : false;
          return (
            <AppCard className="mb-3">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#2563EB"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-base font-bold text-text dark:text-dark-text"
                  >
                    {entry?.title ?? item.id}
                  </Text>
                  <Text className="mt-0.5 text-xs text-muted dark:text-dark-muted">
                    v{item.version} • {formatFileSize(item.sizeBytes)} •{' '}
                    {formatDateTime(item.downloadedAt)}
                  </Text>
                </View>
              </View>

              {hasUpdate ? (
                <View className="mt-3 flex-row items-center rounded-xl bg-amber-500/10 px-3 py-2">
                  <Ionicons
                    name="arrow-up-circle-outline"
                    size={16}
                    color="#F59E0B"
                  />
                  <Text className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                    有新版本（v{entry?.version}）
                  </Text>
                </View>
              ) : null}

              <View className="mt-3 flex-row flex-wrap gap-2">
                <AppButton
                  label="开始"
                  icon="play"
                  onPress={() =>
                    navigation.navigate('Chat', { caseId: item.id })
                  }
                />
                {hasUpdate && entry ? (
                  <AppButton
                    label="更新"
                    icon="refresh-outline"
                    variant="secondary"
                    onPress={() => {
                      void downloader.start(entry);
                    }}
                  />
                ) : null}
                <AppButton
                  label="删除"
                  icon="trash-outline"
                  variant="ghost"
                  onPress={() => handleDelete(item)}
                />
              </View>
            </AppCard>
          );
        }}
      />
    </SafeAreaView>
  );
}