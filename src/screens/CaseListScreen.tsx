import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import type { MergedCaseEntry, RemoteCaseEntry } from '@/types/content';
import { useRemoteCases } from '@/hooks/useRemoteCases';
import { useDownloadedCases } from '@/hooks/useDownloadedCases';
import { useDownloadCase } from '@/hooks/useDownloadCase';
import { LoadingView, ErrorView, EmptyView } from '@/components/StateViews';
import CaseListItem from '@/components/CaseListItem';
import HeaderBar from '@/components/HeaderBar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CaseListScreen(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const remote = useRemoteCases();
  const downloaded = useDownloadedCases();
  const downloader = useDownloadCase();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const merged = useMemo<MergedCaseEntry[]>(() => {
    const remoteList: RemoteCaseEntry[] = remote.data?.cases ?? [];
    const localRecords = downloaded.data ?? [];

    return remoteList.map((entry) => {
      const record = localRecords.find((r) => r.id === entry.id);
      let status: MergedCaseEntry['status'] = 'not-downloaded';
      if (downloader.isDownloading(entry.id)) {
        status = 'downloading';
      } else if (downloader.errorOf(entry.id)) {
        status = 'error';
      } else if (record) {
        status =
          record.version < entry.version ? 'update-available' : 'downloaded';
      }
      return {
        ...entry,
        status,
        localVersion: record?.version,
        progressPercent: downloader.progressOf(entry.id),
      };
    });
  }, [remote.data, downloaded.data, downloader]);

  const handleRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      await Promise.all([remote.refetch(), downloaded.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [remote, downloaded]);

  const handleDownload = useCallback(
    (entry: MergedCaseEntry): void => {
      void downloader.start(entry);
    },
    [downloader],
  );

  const handleDelete = useCallback(
    (entry: MergedCaseEntry): void => {
      Alert.alert(
        '删除案件数据？',
        `「${entry.title}」将从本设备移除。此案件的进度会保留，但剧情文件会被删除。`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '删除',
            style: 'destructive',
            onPress: () => {
              void downloader.remove(entry.id);
            },
          },
        ],
      );
    },
    [downloader],
  );

  const handleOpen = useCallback(
    (entry: MergedCaseEntry): void => {
      navigation.navigate('CaseDetail', { caseId: entry.id });
    },
    [navigation],
  );

  if (remote.isLoading && !remote.data) {
    return <LoadingView message="正在加载案件列表…" />;
  }

  if (remote.isError && !remote.data) {
    return (
      <ErrorView
        title="无法加载案件"
        message={remote.error?.message ?? '请检查你的网络连接。'}
        onRetry={() => remote.refetch()}
      />
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={['top']}
    >
      <HeaderBar
        title="案件"
        subtitle="下载剧情后可离线游玩"
        right={
          <Text className="text-xs text-muted dark:text-dark-muted">
            共 {merged.length} 个案件
          </Text>
        }
      />
      <FlatList
        data={merged}
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
            title="暂无可用案件"
            message="内容服务器上还没有案件。下拉刷新试试。"
            icon="folder-open-outline"
            actionLabel="刷新"
            onAction={() => remote.refetch()}
          />
        }
        renderItem={({ item }) => (
          <CaseListItem
            entry={item}
            onPress={() => handleOpen(item)}
            onDownload={() => handleDownload(item)}
            onUpdate={() => handleDownload(item)}
            onDelete={() => handleDelete(item)}
            isDownloading={downloader.isDownloading(item.id)}
            progressPercent={downloader.progressOf(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}