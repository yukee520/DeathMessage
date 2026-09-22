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
      Alert.alert('没有可用结局', '此案件尚未定义结局。');
      return;
    }

    Alert.alert(
      `指认 ${suspect.name}？`,
      isGuilty
        ? '你很确定。但一旦做出选择，就无法回头。'
        : '你即将指认某人。此决定不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '指认',
          style: 'destructive',
          onPress: () => navigation.replace('Ending', { caseId, endingId }),
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
      <SafeAreaView
        className="flex-1 bg-background dark:bg-dark-background"
        edges={['top']}
      >
        <HeaderBar title="嫌疑人" showBack />
        <LoadingView message="加载嫌疑人列表…" />
      </SafeAreaView>
    );
  }

  if (pkgQuery.isError || !pkgQuery.data) {
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-dark-background"
        edges={['top']}
      >
        <HeaderBar title="嫌疑人" showBack />
        <ErrorView
          title="无法加载嫌疑人"
          message={pkgQuery.error?.message ?? '案件数据不可用。'}
          onRetry={() => pkgQuery.refetch()}
        />
      </SafeAreaView>
    );
  }

  const suspects = pkgQuery.data.suspects;
  const selected = suspects.find((s) => s.id === selectedId);

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={['top']}
    >
      <HeaderBar
        title="嫌疑人"
        subtitle={`共 ${suspects.length} 名相关人员`}
        showBack
      />

      <FlatList
        data={suspects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={renderSuspect}
        ListEmptyComponent={
          <EmptyView
            title="暂无嫌疑人"
            message="此案件没有定义嫌疑人。"
            icon="people-outline"
          />
        }
      />

      {selected ? (
        <View className="border-t border-border dark:border-dark-border bg-card dark:bg-dark-card px-4 py-3">
          <AppCard className="mb-3">
            <Text className="text-xs uppercase tracking-wider text-muted dark:text-dark-muted">
              你正在指认
            </Text>
            <Text className="mt-1 text-base font-bold text-text dark:text-dark-text">
              {selected.name}
            </Text>
            <Text className="mt-1 text-xs text-muted dark:text-dark-muted">
              {selected.description}
            </Text>
          </AppCard>
          <AppButton
            label="正式指认"
            icon="warning-outline"
            variant="danger"
            fullWidth
            onPress={handleAccuse}
          />
        </View>
      ) : (
        <View className="border-t border-border dark:border-dark-border bg-card dark:bg-dark-card px-4 py-3">
          <Text className="text-center text-xs text-muted dark:text-dark-muted">
            选择一个嫌疑人以继续。
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}