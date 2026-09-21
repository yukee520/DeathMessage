import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

export interface TypingIndicatorProps {
  visible: boolean;
}

interface DotProps {
  delay: number;
}

function Dot({ delay }: DotProps): JSX.Element {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={style}
      className="mx-0.5 h-2 w-2 rounded-full bg-muted dark:bg-dark-muted"
    />
  );
}

export default function TypingIndicator({
  visible,
}: TypingIndicatorProps): JSX.Element | null {
  if (!visible) return null;

  return (
    <View className="my-2 self-start flex-row items-center rounded-2xl rounded-bl-sm bg-card dark:bg-dark-card px-4 py-3">
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}