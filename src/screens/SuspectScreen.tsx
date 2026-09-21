import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import type { Suspect } from '@/types/game';
import { useCaseDetail } from '@/hooks/useCaseDetail';
import { LoadingView, ErrorView, EmptyView } from '@/components/StateViews';
import HeaderBar from '@/components/HeaderBar';
import SuspectCard from '@/components/SuspectCard';
import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'Suspects'>;

export default function SuspectScreen(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { caseId } = route.params;
  const pkgQuery = useCaseDetail(caseId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleAccuse = useCallback((): void => {
    if (!selectedId || !pkgQuery.data) return;
    const suspect = pkgQuery.data.suspects.find((s) => s.id === selectedId);
    if (!suspect) return;

    const isGuilty = suspect.isGuilty === true;
    const endingId = isGuilty
      ? pkgQuery.data.endings.find((e) => e.isTrueEnding)?.id ??
        pkgQuery.data.endings[0]?.id
      : pkgQuery.data.endings.find((e) => !e.isTrueEnding)?.id ??
        pkgQuery.data.endings[0]?.id;

    if (!endingId) {
      Alert.alert('No ending available', 'This case has no endings defined.');
      return;
    }

    Alert.alert(
      `Accuse ${suspect.name}?`,
      isGuilty
        ? 'You feel certain. There is no turning back.'
        : 'You are about to accuse someone. This decision is final.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accuse',
          style: 'destructive',
          onPress: () =>
            navigation.replace('Ending', { caseId, endingId }),
        },
      ],
    );
  }, [selectedId, pkgQuery.data, navigation, caseId]);

  const renderSuspect = useCallback(
    ({ item }: { item: Suspect }): JSX.Element => (
      <SuspectCard
        suspect={item}
        selected={selectedId === item.id}
        onPress={() => setSelectedId(item.id)}
      />
    ),
    [selectedId],
  );

  if (pkgQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top']}>
        <HeaderBar title="Suspects" showBack />
        <LoadingView message="Loading suspect list…" />
      </SafeAreaView>
    );
  }

  if (pkgQuery.isError || !pkgQuery.data) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top']}>
        <HeaderBar title="Suspects" showBack />
        <ErrorView
          title="Cannot load suspects"
          message={pkgQuery.error?.message ?? 'Case data is unavailable.'}
          onRetry={() => pkgQuery.refetch()}
        />
      </SafeAreaView>
    );
  }

  const suspects = pkgQuery.data.suspects;
  const selected = suspects.find((s) => s.id === selectedId);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top']}>
      <HeaderBar
        title="Suspects"
        subtitle={`${suspects.length} person${suspects.length === 1 ? '' : 's'} of interest`}
        showBack
      />

      <FlatList
        data={suspects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={renderSuspect}
        ListEmptyComponent={
          <EmptyView
            title="No suspects"
            message="This case has no suspects defined."
            icon="people-outline"
          />
        }
      />

      {selected ? (
        <View className="border-t border-border dark:border-dark-border bg-card dark:bg-dark-card px-4 py-3">
          <AppCard className="mb-3">
            <Text className="text-xs uppercase tracking-wider text-muted dark:text-dark-muted">
              Accusing
            </Text>
            <Text className="mt-1 text-base font-bold text-text dark:text-dark-text">
              {selected.name}
            </Text>
            <Text className="mt-1 text-xs text-muted dark:text-dark-muted">
              {selected.description}
            </Text>
          </AppCard>
          <AppButton
            label="Make the accusation"
            icon="warning-outline"
            variant="danger"
            fullWidth
            onPress={handleAccuse}
          />
        </View>
      ) : (
        <View className="border-t border-border dark:border-dark-border bg-card dark:bg-dark-card px-4 py-3">
          <Text className="text-center text-xs text-muted dark:text-dark-muted">
            Select a suspect to proceed.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}