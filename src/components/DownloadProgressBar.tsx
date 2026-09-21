import React from 'react';
import { View, Text } from 'react-native';

export interface DownloadProgressBarProps {
  percent: number;
  showLabel?: boolean;
}

export default function DownloadProgressBar({
  percent,
  showLabel = true,
}: DownloadProgressBarProps): JSX.Element {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <View>
      <View className="h-2 w-full overflow-hidden rounded-full bg-border dark:bg-dark-border">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${clamped}%` }}
        />
      </View>
      {showLabel ? (
        <Text className="mt-1 text-right text-xs text-muted dark:text-dark-muted">
          {clamped.toFixed(0)}%
        </Text>
      ) : null}
    </View>
  );
}