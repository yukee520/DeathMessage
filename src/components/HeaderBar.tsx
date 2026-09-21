import React, { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export interface HeaderBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
  onBack?: () => void;
}

export default function HeaderBar({
  title,
  subtitle,
  showBack = false,
  right,
  onBack,
}: HeaderBarProps): JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBack = (): void => {
    if (onBack) {
      onBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View
      className="bg-card dark:bg-dark-card border-b border-border dark:border-dark-border"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center px-4 py-3">
        {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            className="mr-3 active:opacity-60"
          >
            <Ionicons name="chevron-back" size={26} color="#2563EB" />
          </Pressable>
        ) : null}
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-lg font-bold text-text dark:text-dark-text"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              className="mt-0.5 text-xs text-muted dark:text-dark-muted"
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View className="ml-3">{right}</View> : null}
      </View>
    </View>
  );
}