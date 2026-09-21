import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { RootStackParamList } from '@/types/navigation';
import { useCaseDetail } from '@/hooks/useCaseDetail';
import { useGameStore } from '@/store/useGameStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { LoadingView, ErrorView } from '@/components/StateViews';
import AppCard from '@/components/AppCard';
import AppButton from '@/components/AppButton';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'Ending'>;

const RANK_COLOR: Record<string, string> = {
  S: '#F59E0B',
  A: '#10B981',
  B: '#2563EB',
  C: '#64748B',
  D: '#94A3B8',
  F: '#EF4444',
};

export default function EndingScreen(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { caseId, endingId } = route.params;

  const pkgQuery = useCaseDetail(caseId);
  const resetSession = useGameStore((s) => s.resetSession);
  const setActiveCase = useGameStore((s) => s.setActiveCase);
  const recordCompletion = usePlayerStore((s) => s.recordCaseCompletion);

  const ending = useMemo(
    () => pkgQuery.data?.endings.find((e) => e.id === endingId),
    [pkgQuery.data, endingId],
  );

  useEffect(() => {
    if (!ending) return;
    recordCompletion({
      caseId,
      endingId: ending.id,
      rank: ending.rank,
      completedAt: new Date().toISOString(),
      playDurationMs: 0,
    });
  }, [ending, caseId, recordCompletion]);

  const handleBackHome = useCallback((): void => {
    setActiveCase(null);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
    });
  }, [navigation, setActiveCase]);

  const handleReplay = useCallback((): void => {
    resetSession(caseId);
    navigation.replace('Chat', { caseId });
  }, [navigation, resetSession, caseId]);

  if (pkgQuery.isLoading) {
    return <LoadingView message="Revealing the truth…" />;
  }

  if (pkgQuery.isError || !pkgQuery.data) {
    return (
      <ErrorView
        title="Cannot load ending"
        message={pkgQuery.error?.message ?? 'Ending data is unavailable.'}
        onRetry={() => pkgQuery.refetch()}
      />
    );
  }

  if (!ending) {
    return (
      <ErrorView
        title="Ending not found"
        message="This ending no longer exists in the case file."
      />
    );
  }

  const rankColor = RANK_COLOR[ending.rank] ?? '#64748B';

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="items-center pt-6 pb-6">
          <View
            className="h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: rankColor + '20' }}
          >
            <Text
              className="text-5xl font-black"
              style={{ color: rankColor }}
            >
              {ending.rank}
            </Text>
          </View>
          <Text className="mt-4 text-xs font-bold uppercase tracking-[4px] text-muted dark:text-dark-muted">
            {ending.isTrueEnding ? 'True Ending' : 'Ending'}
          </Text>
          <Text className="mt-2 text-center text-2xl font-black text-text dark:text-dark-text">
            {ending.title}
          </Text>
        </View>

        <AppCard className="mb-5">
          <Text className="text-sm leading-6 text-text dark:text-dark-text">
            {ending.description}
          </Text>
        </AppCard>

        <AppCard className="mb-6">
          <View className="flex-row items-center">
            <Ionicons
              name={ending.isTrueEnding ? 'trophy' : 'information-circle-outline'}
              size={20}
              color={rankColor}
            />
            <Text className="ml-2 flex-1 text-xs text-muted dark:text-dark-muted">
              {ending.isTrueEnding
                ? 'You uncovered the complete truth of this case.'
                : 'There may be another path. Replay to discover it.'}
            </Text>
          </View>
        </AppCard>

        <View className="mb-3">
          <AppButton
            label="Replay this case"
            icon="refresh-outline"
            variant="secondary"
            fullWidth
            onPress={handleReplay}
          />
        </View>
        <View className="mb-3">
          <AppButton
            label="Back to home"
            icon="home-outline"
            fullWidth
            onPress={handleBackHome}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}