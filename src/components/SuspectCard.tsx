import React from 'react';
import { View, Text, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Suspect } from '@/types/game';
import AppCard from './AppCard';

export interface SuspectCardProps {
  suspect: Suspect;
  selected?: boolean;
  onPress?: () => void;
}

export default function SuspectCard({
  suspect,
  selected = false,
  onPress,
}: SuspectCardProps): JSX.Element {
  return (
    <AppCard
      onPress={onPress}
      className={[
        'mb-3',
        selected ? 'border-primary border-2' : '',
      ].join(' ')}
    >
      <View className="flex-row items-center">
        <View className="mr-3 h-16 w-16 overflow-hidden rounded-full bg-border dark:bg-dark-border">
          {suspect.avatarUrl ? (
            <Image
              source={{ uri: suspect.avatarUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Ionicons name="person" size={28} color="#94A3B8" />
            </View>
          )}
        </View>

        <View className="flex-1">
          <Text className="text-base font-bold text-text dark:text-dark-text">
            {suspect.name}
          </Text>
          {suspect.relation ? (
            <Text className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
              {suspect.relation}
            </Text>
          ) : null}
          <Text
            numberOfLines={2}
            className="mt-1 text-sm text-muted dark:text-dark-muted"
          >
            {suspect.description}
          </Text>
        </View>

        {selected ? (
          <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
        ) : null}
      </View>
    </AppCard>
  );
}