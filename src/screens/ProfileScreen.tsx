import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { RootStackParamList } from '@/types/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useDownloadedCases } from '@/hooks/useDownloadedCases';
import { formatDuration, formatFileSize } from '@/utils/format';
import HeaderBar from '@/components/HeaderBar';
import AppCard from '@/components/AppCard';
import StatRow from '@/components/StatRow';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const profile = usePlayerStore((s) => s.profile);
  const downloaded = useDownloadedCases();

  const totalStorage = useMemo<number>(
    () =>
      (downloaded.data ?? []).reduce(
        (acc, r) => acc + (r.sizeBytes || 0),
        0,
      ),
    [downloaded.data],
  );

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={['top']}
    >
      <HeaderBar
        title="个人档案"
        subtitle="你的侦探记录"
        right={
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            className="h-9 w-9 items-center justify-center rounded-full bg-background dark:bg-dark-background"
          >
            <Ionicons name="settings-outline" size={18} color="#64748B" />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <AppCard className="mb-4">
          <View className="flex-row items-center">
            <View className="mr-4 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Ionicons name="person" size={32} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-text dark:text-dark-text">
                {profile.displayName}
              </Text>
              <Text className="mt-0.5 text-xs text-muted dark:text-dark-muted">
                注册于 {new Date(profile.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </AppCard>

        <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
          统计
        </Text>
        <AppCard className="mb-5">
          <StatRow
            icon="briefcase-outline"
            label="已开始案件"
            value={profile.stats.totalCasesStarted}
          />
          <StatRow
            icon="checkmark-done-outline"
            label="已完成案件"
            value={profile.stats.totalCasesCompleted}
            iconColor="#10B981"
          />
          <StatRow
            icon="search-outline"
            label="已发现线索"
            value={profile.stats.totalCluesFound}
            iconColor="#F59E0B"
          />
          <StatRow
            icon="ribbon-outline"
            label="已解锁结局"
            value={profile.stats.totalEndingsUnlocked}
            iconColor="#8B5CF6"
          />
          <StatRow
            icon="time-outline"
            label="总游玩时长"
            value={formatDuration(profile.stats.totalPlayTimeMs)}
          />
        </AppCard>

        <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
          下载
        </Text>
        <AppCard
          className="mb-5"
          onPress={() => navigation.navigate('Downloads')}
        >
          <StatRow
            icon="cloud-download-outline"
            label="已下载案件"
            value={(downloaded.data ?? []).length}
          />
          <StatRow
            icon="save-outline"
            label="占用存储"
            value={formatFileSize(totalStorage)}
          />
        </AppCard>

        <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
          成就
        </Text>
        <AppCard>
          {profile.achievements.length === 0 ? (
            <Text className="text-sm text-muted dark:text-dark-muted">
              尚未解锁任何成就。继续调查吧。
            </Text>
          ) : (
            profile.achievements.map((a) => (
              <StatRow
                key={a.id}
                icon={a.icon || 'trophy-outline'}
                label={a.title}
                value="已解锁"
                iconColor="#F59E0B"
              />
            ))
          )}
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}