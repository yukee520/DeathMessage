import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppButton from './AppButton';

export interface LoadingViewProps {
  message?: string;
}

export function LoadingView({
  message = '加载中…',
}: LoadingViewProps): JSX.Element {
  return (
    <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background px-6">
      <ActivityIndicator size="large" color="#2563EB" />
      <Text className="mt-4 text-base text-muted dark:text-dark-muted">
        {message}
      </Text>
    </View>
  );
}

export interface ErrorViewProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorView({
  title = '出现了问题',
  message,
  onRetry,
}: ErrorViewProps): JSX.Element {
  return (
    <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background px-6">
      <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
      <Text className="mt-4 text-lg font-semibold text-text dark:text-dark-text">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm text-muted dark:text-dark-muted">
        {message}
      </Text>
      {onRetry ? (
        <View className="mt-6">
          <AppButton label="重试" icon="refresh" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

export interface EmptyViewProps {
  title?: string;
  message: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyView({
  title = '空空如也',
  message,
  icon = 'file-tray-outline',
  actionLabel,
  onAction,
}: EmptyViewProps): JSX.Element {
  return (
    <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background px-6">
      <Ionicons name={icon} size={48} color="#94A3B8" />
      <Text className="mt-4 text-lg font-semibold text-text dark:text-dark-text">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm text-muted dark:text-dark-muted">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <View className="mt-6">
          <AppButton label={actionLabel} icon="arrow-forward" onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}