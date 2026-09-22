import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface ChatInputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInputBar({
  onSend,
  disabled = false,
  placeholder = '输入你的回复…',
}: ChatInputBarProps): JSX.Element {
  const [text, setText] = useState<string>('');

  const handleSend = (): void => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-row items-end border-t border-border dark:border-dark-border bg-card dark:bg-dark-card px-3 py-2">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          multiline
          editable={!disabled}
          className="mr-2 max-h-28 flex-1 rounded-2xl border border-border dark:border-dark-border bg-background dark:bg-dark-background px-4 py-2 text-base text-text dark:text-dark-text"
        />
        <Pressable
          onPress={handleSend}
          disabled={disabled || text.trim().length === 0}
          className={[
            'h-11 w-11 items-center justify-center rounded-full bg-primary',
            disabled || text.trim().length === 0
              ? 'opacity-40'
              : 'active:opacity-80',
          ].join(' ')}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}