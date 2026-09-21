import React, { ReactNode } from 'react';
import { Pressable, View, ViewStyle, StyleProp } from 'react-native';

export interface AppCardProps {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function AppCard({
  children,
  onPress,
  className = '',
  padded = true,
  style,
}: AppCardProps): JSX.Element {
  const baseClass = [
    'bg-card dark:bg-dark-card rounded-2xl border border-border dark:border-dark-border',
    padded ? 'p-4' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${baseClass} active:opacity-80`}
        style={style}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={baseClass} style={style}>
      {children}
    </View>
  );
}