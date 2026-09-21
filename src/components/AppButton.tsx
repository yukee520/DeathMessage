import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_CLASS: Record<AppButtonVariant, string> = {
  primary: 'bg-primary dark:bg-primary',
  secondary:
    'bg-card dark:bg-dark-card border border-border dark:border-dark-border',
  danger: 'bg-danger dark:bg-danger',
  ghost: 'bg-transparent',
};

const VARIANT_TEXT_CLASS: Record<AppButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-text dark:text-dark-text',
  danger: 'text-white',
  ghost: 'text-primary',
};

export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: AppButtonProps): JSX.Element {
  const isDisabled = disabled || loading;
  const textClass = VARIANT_TEXT_CLASS[variant];
  const iconColor =
    variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#2563EB';

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center px-5 py-3 rounded-xl',
        VARIANT_CLASS[variant],
        fullWidth ? 'w-full' : 'self-start',
        isDisabled ? 'opacity-50' : 'active:opacity-80',
      ].join(' ')}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? '#2563EB' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={iconColor}
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text className={`text-base font-semibold ${textClass}`}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}