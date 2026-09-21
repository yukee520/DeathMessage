import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Choice } from '@/types/game';

export interface ChoiceButtonProps {
  choice: Choice;
  onPress: (choice: Choice) => void;
  disabled?: boolean;
}

export default function ChoiceButton({
  choice,
  onPress,
  disabled = false,
}: ChoiceButtonProps): JSX.Element {
  return (
    <Pressable
      onPress={disabled ? undefined : () => onPress(choice)}
      disabled={disabled}
      className={[
        'my-1.5 flex-row items-center rounded-xl border border-primary/30 bg-card dark:bg-dark-card px-4 py-3',
        disabled ? 'opacity-50' : 'active:opacity-70',
      ].join(' ')}
    >
      <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-primary/10">
        <Ionicons name="chatbubble-ellipses-outline" size={14} color="#2563EB" />
      </View>
      <Text className="flex-1 text-base text-text dark:text-dark-text">
        {choice.text}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </Pressable>
  );
}