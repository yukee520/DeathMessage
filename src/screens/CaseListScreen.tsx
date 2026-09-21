import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
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
        status = record.version < entry.version ? 'update-available' : 'downloaded';
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
        'Delete case data?',
        `"${entry.title}" will be removed from this device. Progress in this case will be kept but the story files will be gone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
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
      if (entry.status === 'downloaded' || entry.status === 'update-available') {
        navigation.navigate('CaseDetail', { caseId: entry.id });
      } else {
        navigation.navigate('CaseDetail', { caseId: entry.id });
      }
    },
    [navigation],
  );

  if (remote.isLoading && !remote.data) {
    return <LoadingView message="Loading case files…" />;
  }

  if (remote.isError && !remote.data) {
    return (
      <ErrorView
        title="Cannot load cases"
        message={remote.error?.message ?? 'Please check your connection.'}
        onRetry={() => remote.refetch()}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top']}>
      <HeaderBar
        title="Cases"
        subtitle="Download stories to play offline"
        right={
          <Text className="text-xs text-muted dark:text-dark-muted">
            {merged.length} case{merged.length === 1 ? '' : 's'}
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
            title="No cases available"
            message="The content server has no cases yet. Pull down to refresh."
            icon="folder-open-outline"
            actionLabel="Refresh"
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