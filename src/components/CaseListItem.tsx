import React from 'react';
import { View, Text, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { MergedCaseEntry } from '@/types/content';
import AppCard from './AppCard';
import AppButton from './AppButton';
import DownloadProgressBar from './DownloadProgressBar';

export interface CaseListItemProps {
  entry: MergedCaseEntry;
  onPress: () => void;
  onDownload: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  isDownloading: boolean;
  progressPercent: number;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#10B981',
  normal: '#2563EB',
  hard: '#F59E0B',
  nightmare: '#EF4444',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: '轻松',
  normal: '普通',
  hard: '困难',
  nightmare: '噩梦',
};

const STATUS_LABEL: Record<string, string> = {
  'not-downloaded': '未下载',
  downloading: '下载中',
  downloaded: '可开始',
  'update-available': '有更新',
  error: '下载失败',
};

export default function CaseListItem({
  entry,
  onPress,
  onDownload,
  onUpdate,
  onDelete,
  isDownloading,
  progressPercent,
}: CaseListItemProps): JSX.Element {
  const statusColor =
    entry.status === 'downloaded'
      ? '#10B981'
      : entry.status === 'update-available'
      ? '#F59E0B'
      : entry.status === 'error'
      ? '#EF4444'
      : '#64748B';

  const difficultyColor = DIFFICULTY_COLOR[entry.difficulty] ?? '#64748B';
  const difficultyText =
    DIFFICULTY_LABEL[entry.difficulty] ?? entry.difficulty;

  return (
    <AppCard onPress={onPress} className="mb-3">
      <View className="flex-row">
        <View className="mr-3 h-24 w-24 overflow-hidden rounded-xl bg-border dark:bg-dark-border">
          {entry.coverUrl ? (
            <Image
              source={{ uri: entry.coverUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Ionicons name="skull-outline" size={36} color="#94A3B8" />
            </View>
          )}
        </View>

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-base font-bold text-text dark:text-dark-text"
          >
            {entry.title}
          </Text>
          <Text
            numberOfLines={2}
            className="mt-0.5 text-xs text-muted dark:text-dark-muted"
          >
            {entry.subtitle}
          </Text>

          <View className="mt-2 flex-row items-center flex-wrap">
            <View
              className="mr-2 rounded-full px-2 py-0.5"
              style={{ backgroundColor: difficultyColor + '20' }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: difficultyColor }}
              >
                {difficultyText}
              </Text>
            </View>
            <View className="flex-row items-center">
              <View
                className="mr-1 h-2 w-2 rounded-full"
                style={{ backgroundColor: statusColor }}
              />
              <Text className="text-xs" style={{ color: statusColor }}>
                {isDownloading
                  ? `${STATUS_LABEL.downloading} ${progressPercent.toFixed(0)}%`
                  : STATUS_LABEL[entry.status] ?? ''}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {isDownloading ? (
        <View className="mt-3">
          <DownloadProgressBar percent={progressPercent} />
        </View>
      ) : null}

      <View className="mt-3 flex-row flex-wrap gap-2">
        {entry.status === 'not-downloaded' ? (
          <AppButton
            label="下载"
            icon="download-outline"
            onPress={onDownload}
            disabled={isDownloading}
          />
        ) : null}

        {entry.status === 'downloaded' ? (
          <>
            <AppButton label="开始" icon="play" onPress={onPress} />
            <AppButton
              label="删除"
              icon="trash-outline"
              variant="secondary"
              onPress={onDelete}
            />
          </>
        ) : null}

        {entry.status === 'update-available' ? (
          <>
            <AppButton label="更新" icon="refresh" onPress={onUpdate} />
            <AppButton
              label="开始"
              icon="play"
              variant="secondary"
              onPress={onPress}
            />
          </>
        ) : null}

        {entry.status === 'error' ? (
          <AppButton
            label="重试"
            icon="reload-outline"
            variant="danger"
            onPress={onDownload}
          />
        ) : null}
      </View>
    </AppCard>
  );
}