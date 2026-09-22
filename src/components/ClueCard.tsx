import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Clue } from '@/types/game';

export interface ClueCardProps {
  clue: Clue;
}

export default function ClueCard({ clue }: ClueCardProps): JSX.Element {
  return (
    <View className="my-2 self-start max-w-[90%] rounded-2xl border border-primary/40 bg-primary/5 dark:bg-primary/10 p-4">
      <View className="flex-row items-center">
        <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Ionicons name="search" size={16} color="#FFFFFF" />
        </View>
        <Text className="text-xs font-bold uppercase tracking-wider text-primary">
          获得线索
        </Text>
      </View>
      <Text className="mt-3 text-base font-semibold text-text dark:text-dark-text">
        {clue.title}
      </Text>
      <Text className="mt-1 text-sm leading-5 text-muted dark:text-dark-muted">
        {clue.description}
      </Text>
    </View>
  );
}