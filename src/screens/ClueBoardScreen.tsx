import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Clue } from '@/types/game';
import { useGameStore } from '@/store/useGameStore';
import { useRemoteCases } from '@/hooks/useRemoteCases';
import { useCaseDetail } from '@/hooks/useCaseDetail';
import HeaderBar from '@/components/HeaderBar';
import AppCard from '@/components/AppCard';
import { EmptyView, LoadingView, ErrorView } from '@/components/StateViews';

type TabKey = 'unlocked' | 'locked';

const EMPTY_ARRAY: string[] = [];

export default function ClueBoardScreen(): JSX.Element {
  const activeCaseId = useGameStore((s) => s.activeCaseId);
  const remote = useRemoteCases();
  const pkgQuery = useCaseDetail(activeCaseId ?? undefined);
  const [tab, setTab] = useState<TabKey>('unlocked');

  const unlockedIds = useGameStore(
    (s) => s.sessions[activeCaseId ?? '']?.unlockedClueIds,
  );
  const safeUnlockedIds = unlockedIds ?? EMPTY_ARRAY;

  const allClues = useMemo<Clue[]>(
    () => pkgQuery.data?.clues ?? [],
    [pkgQuery.data],
  );

  const unlocked = useMemo<Clue[]>(
    () => allClues.filter((c) => safeUnlockedIds.includes(c.id)),
    [allClues, safeUnlockedIds],
  );

  const locked = useMemo<Clue[]>(
    () => allClues.filter((c) => !safeUnlockedIds.includes(c.id)),
    [allClues, safeUnlockedIds],
  );

  const data = tab === 'unlocked' ? unlocked : locked;
  const activeEntry = remote.data?.cases.find((c) => c.id === activeCaseId);

  const renderClue = useCallback(
    ({ item }: { item: Clue }): JSX.Element => {
      const isLocked = tab === 'locked';
      return (
        <AppCard className="mb-3">
          <View className="flex-row items-center">
            <View
              className={[
                'mr-3 h-10 w-10 items-center justify-center rounded-full',
                isLocked ? 'bg-border dark:bg-dark-border' : 'bg-primary/10',
              ].join(' ')}
            >
              <Ionicons
                name={isLocked ? 'lock-closed-outline' : (item.icon ?? 'search')}
                size={20}
                color={isLocked ? '#94A3B8' : '#2563EB'}
              />
            </View>
            <View className="flex-1">
              <Text
                className={[
                  'text-base font-semibold',
                  isLocked
                    ? 'text-muted dark:text-dark-muted'
                    : 'text-text dark:text-dark-text',
                ].join(' ')}
              >
                {isLocked ? '???' : item.title}
              </Text>
              <Text
                numberOfLines={isLocked ? 1 : 3}
                className="mt-0.5 text-xs text-muted dark:text-dark-muted"
              >
                {isLocked ? '继续调查以解锁此线索。' : item.description}
              </Text>
            </View>
          </View>
        </AppCard>
      );
    },
    [tab],
  );

  if (!activeCaseId) {
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-dark-background"
        edges={['top']}
      >
        <HeaderBar title="线索板" subtitle="未选择案件" />
        <EmptyView
          title="暂无进行中的案件"
          message="开始一个案件后，你收集到的线索会显示在这里。"
          icon="search-outline"
        />
      </SafeAreaView>
    );
  }

  if (pkgQuery.isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-dark-background"
        edges={['top']}
      >
        <HeaderBar title="线索板" />
        <LoadingView message="加载线索中…" />
      </SafeAreaView>
    );
  }

  if (pkgQuery.isError || !pkgQuery.data) {
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-dark-background"
        edges={['top']}
      >
        <HeaderBar title="线索板" />
        <ErrorView
          title="无法加载线索"
          message={pkgQuery.error?.message ?? '案件文件不可用。'}
          onRetry={() => pkgQuery.refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={['top']}
    >
      <HeaderBar
        title="线索板"
        subtitle={activeEntry?.title ?? pkgQuery.data.title}
      />

      <View className="px-4 pt-4">
        <View className="flex-row rounded-full bg-card dark:bg-dark-card p-1 border border-border dark:border-dark-border">
          <Pressable
            onPress={() => setTab('unlocked')}
            className={[
              'flex-1 items-center rounded-full py-2',
              tab === 'unlocked' ? 'bg-primary' : '',
            ].join(' ')}
          >
            <Text
              className={[
                'text-sm font-semibold',
                tab === 'unlocked'
                  ? 'text-white'
                  : 'text-muted dark:text-dark-muted',
              ].join(' ')}
            >
              已解锁 ({unlocked.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('locked')}
            className={[
              'flex-1 items-center rounded-full py-2',
              tab === 'locked' ? 'bg-primary' : '',
            ].join(' ')}
          >
            <Text
              className={[
                'text-sm font-semibold',
                tab === 'locked'
                  ? 'text-white'
                  : 'text-muted dark:text-dark-muted',
              ].join(' ')}
            >
              未解锁 ({locked.length})
            </Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={renderClue}
        ListEmptyComponent={
          <EmptyView
            title={tab === 'unlocked' ? '尚未收集线索' : '没有隐藏的线索'}
            message={
              tab === 'unlocked'
                ? '继续对话即可获得新线索。'
                : '此案件的所有线索都已被发现。'
            }
            icon={
              tab === 'unlocked' ? 'search-outline' : 'checkmark-done-outline'
            }
          />
        }
      />
    </SafeAreaView>
  );
}