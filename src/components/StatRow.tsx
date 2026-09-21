import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface StatRowProps {
  icon: string;
  label: string;
  value: string | number;
  iconColor?: string;
}

export default function StatRow({
  icon,
  label,
  value,
  iconColor = '#2563EB',
}: StatRowProps): JSX.Element {
  return (
    <View className="flex-row items-center justify-between border-b border-border dark:border-dark-border py-3 last:border-b-0">
      <View className="flex-row items-center">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <Text className="text-sm text-text dark:text-dark-text">{label}</Text>
      </View>
      <Text className="text-sm font-bold text-text dark:text-dark-text">
        {value}
      </Text>
    </View>
  );
}