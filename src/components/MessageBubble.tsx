import React from 'react';
import { View, Text } from 'react-native';
import type { GameMessage, MessageMood } from '@/types/game';
import { useSettingsStore } from '@/store/useSettingsStore';

export interface MessageBubbleProps {
  message: GameMessage;
  senderName?: string;
}

const MOOD_ACCENT: Record<MessageMood, string> = {
  calm: 'border-l-secondary',
  fearful: 'border-l-purple-500',
  angry: 'border-l-danger',
  sad: 'border-l-blue-400',
  neutral: 'border-l-border dark:border-l-dark-border',
  hostile: 'border-l-danger',
};

function fontSizeClass(size: 'small' | 'medium' | 'large'): string {
  if (size === 'small') return 'text-sm';
  if (size === 'large') return 'text-lg';
  return 'text-base';
}

export default function MessageBubble({
  message,
  senderName,
}: MessageBubbleProps): JSX.Element {
  const fontSize = useSettingsStore((s) => s.fontSize);
  const textSize = fontSizeClass(fontSize);

  if (message.type === 'system') {
    return (
      <View className="my-3 items-center px-6">
        <View className="rounded-full bg-border dark:bg-dark-border px-3 py-1">
          <Text className="text-xs italic text-muted dark:text-dark-muted">
            {message.text}
          </Text>
        </View>
      </View>
    );
  }

  const isOutgoing = message.type === 'outgoing';
  const accent = message.mood ? MOOD_ACCENT[message.mood] : MOOD_ACCENT.neutral;

  return (
    <View
      className={[
        'my-2 max-w-[85%]',
        isOutgoing ? 'self-end items-end' : 'self-start items-start',
      ].join(' ')}
    >
      {!isOutgoing && senderName ? (
        <Text className="mb-1 ml-2 text-xs font-semibold text-secondary dark:text-dark-muted">
          {senderName}
        </Text>
      ) : null}
      <View
        className={[
          'rounded-2xl px-4 py-3 border-l-4',
          isOutgoing
            ? 'bg-primary dark:bg-primary rounded-br-sm'
            : 'bg-card dark:bg-dark-card rounded-bl-sm',
          isOutgoing ? 'border-l-transparent' : accent,
        ].join(' ')}
      >
        <Text
          className={[
            textSize,
            'leading-6',
            isOutgoing ? 'text-white' : 'text-text dark:text-dark-text',
          ].join(' ')}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
}