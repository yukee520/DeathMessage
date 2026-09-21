import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { RootStackParamList } from '@/types/navigation';
import type { MergedCaseEntry } from '@/types/content';
import { useRemoteCases } from '@/hooks/useRemoteCases';
import { useDownloadedCases } from '@/hooks/useDownloadedCases';
import { useDownloadCase } from '@/hooks/useDownloadCase';
import { useCaseDetail } from '@/hooks/useCaseDetail';
import { useGameStore } from '@/store/useGameStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { LoadingView, ErrorView, EmptyView } from '@/components/StateViews';
import HeaderBar from '@/components/HeaderBar';
import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import DownloadProgressBar from '@/components/DownloadProgressBar';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'CaseDetail'>;

export default function CaseDetailScreen(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const caseId = route.params.caseId;

  const remote = useRemoteCases();
  const downloaded = useDownloadedCases();
  const downloader = useDownloadCase();
  const pkgQuery = useCaseDetail(caseId);
  const setActiveCase = useGameStore((s) => s.setActiveCase);
  const ensureSession = useGameStore((s) => s.ensureSession);
  const recordCaseStart = usePlayerStore((s) => s.recordCaseStart);

  const remoteEntry = useMemo(
    () => remote.data?.cases.find((c) => c.id === caseId),
    [remote.data, caseId],
  );

  const localRecord = useMemo(
    () => (downloaded.data ?? []).find((r) => r.id === caseId),
    [downloaded.data, caseId],
  );

  const status: MergedCaseEntry['status'] = useMemo(() => {
    if (downloader.isDownloading(caseId)) return 'downloading';
    if (downloader.errorOf(caseId)) return 'error';
    if (!localRecord) return 'not-downloaded';
    if (remoteEntry && localRecord.version < remoteEntry.version) return 'update-available';
    return 'downloaded';
  }, [caseId, downloader, localRecord, remoteEntry]);

  const handleDownload = useCallback((): void => {
    if (!remoteEntry) return;
    void downloader.start(remoteEntry);
  }, [remoteEntry, downloader]);

  const handleDelete = useCallback((): void => {
    Alert.alert(
      'Delete this case?',
      'The story files will be removed from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void downloader.remove(caseId);
          },
        },
      ],
    );
  }, [caseId, downloader]);

  const handleStart = useCallback((): void => {
    if (!pkgQuery.data) return;
    setActiveCase(caseId);
    ensureSession(caseId, pkgQuery.data.startChapterId);
    recordCaseStart();
    navigation.navigate('Chat', { caseId });
  }, [pkgQuery.data, caseId, setActiveCase, ensureSession, recordCaseStart, navigation]);

  if (!remoteEntry && remote.isLoading) {
    return <LoadingView message="Loading case…" />;
  }

  if (!remoteEntry) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top']}>
        <HeaderBar title="Case not found" showBack />
        <EmptyView
          title="This case is unavailable"
          message="It may have been removed from the content server."
          icon="alert-circle-outline"
          actionLabel="Back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const isReady = status === 'downloaded' || status === 'update-available';
  const cover = remoteEntry.coverUrl;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top']}>
      <HeaderBar
        title={remoteEntry.title}
        subtitle={remoteEntry.subtitle}
        showBack
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <AppCard className="mb-4" padded={false}>
          <View className="h-44 w-full items-center justify-center rounded-t-2xl bg-border dark:bg-dark-border">
            <Ionicons name="skull-outline" size={64} color="#94A3B8" />
          </View>
          <View className="p-4">
            <View className="flex-row flex-wrap">
              <View className="mr-2 rounded-full bg-primary/10 px-3 py-1">
                <Text className="text-xs font-semibold capitalize text-primary">
                  {remoteEntry.difficulty}
                </Text>
              </View>
              {remoteEntry.tags.map((tag) => (
                <View
                  key={tag}
                  className="mr-2 mb-1 rounded-full bg-border dark:bg-dark-border px-3 py-1"
                >
                  <Text className="text-xs text-muted dark:text-dark-muted">
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
            <Text className="mt-3 text-sm leading-6 text-muted dark:text-dark-muted">
              {pkgQuery.data?.intro ??
                'Download this case to read the full intro, suspects and clues.'}
            </Text>
          </View>
        </AppCard>

        {status === 'downloading' ? (
          <AppCard className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-text dark:text-dark-text">
              Downloading…
            </Text>
            <DownloadProgressBar percent={downloader.progressOf(caseId)} />
          </AppCard>
        ) : null}

        {status === 'error' ? (
          <AppCard className="mb-4 border-danger">
            <Text className="text-sm font-semibold text-danger">Download failed</Text>
            <Text className="mt-1 text-xs text-muted dark:text-dark-muted">
              {downloader.errorOf(caseId) ?? 'Unknown error'}
            </Text>
          </AppCard>
        ) : null}

        {pkgQuery.data && isReady ? (
          <AppCard className="mb-4">
            <Text className="text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
              Case File
            </Text>
            <View className="mt-3 flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-lg font-bold text-text dark:text-dark-text">
                  {pkgQuery.data.chapters.length}
                </Text>
                <Text className="text-xs text-muted dark:text-dark-muted">
                  Chapters
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-lg font-bold text-text dark:text-dark-text">
                  {pkgQuery.data.suspects.length}
                </Text>
                <Text className="text-xs text-muted dark:text-dark-muted">
                  Suspects
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-lg font-bold text-text dark:text-dark-text">
                  {pkgQuery.data.endings.length}
                </Text>
                <Text className="text-xs text-muted dark:text-dark-muted">
                  Endings
                </Text>
              </View>
            </View>
          </AppCard>
        ) : null}

        {isReady ? (
          <View className="mb-3">
            <AppButton
              label={status === 'update-available' ? 'Play (new version ready)' : 'Start investigation'}
              icon="play"
              fullWidth
              onPress={handleStart}
            />
          </View>
        ) : null}

        {status === 'not-downloaded' ? (
          <View className="mb-3">
            <AppButton
              label="Download case"
              icon="download-outline"
              fullWidth
              onPress={handleDownload}
              disabled={downloader.isDownloading(caseId)}
            />
          </View>
        ) : null}

        {status === 'update-available' ? (
          <View className="mb-3">
            <AppButton
              label="Update to latest version"
              icon="refresh"
              variant="secondary"
              fullWidth
              onPress={handleDownload}
              disabled={downloader.isDownloading(caseId)}
            />
          </View>
        ) : null}

        {status === 'error' ? (
          <View className="mb-3">
            <AppButton
              label="Retry download"
              icon="reload-outline"
              variant="danger"
              fullWidth
              onPress={handleDownload}
            />
          </View>
        ) : null}

        {localRecord ? (
          <View className="mb-3">
            <AppButton
              label="Delete case data"
              icon="trash-outline"
              variant="ghost"
              fullWidth
              onPress={handleDelete}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}