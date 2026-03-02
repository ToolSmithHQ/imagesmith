import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { ImpactFeedbackStyle } from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { triggerImpact } from '@/src/utils/haptics';
import { useThemeColor } from '@/src/hooks/use-theme-color';

const SPRING_CONFIG = { damping: 15, stiffness: 150 };

export function HapticTab(props: BottomTabBarButtonProps) {
  const { children, style, onPressIn, accessibilityState, ...rest } = props;
  const focused = accessibilityState?.selected ?? false;
  const tintContainer = useThemeColor({}, 'tintContainer');

  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, SPRING_CONFIG);
  }, [focused]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: 0.7 + progress.value * 0.3 }],
  }));

  return (
    <PlatformPressable
      {...rest}
      accessibilityState={accessibilityState}
      style={style}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          triggerImpact(ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    >
      <Animated.View
        style={[styles.pill, { backgroundColor: tintContainer }, pillStyle]}
      />
      {children}
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 16,
    right: 16,
    borderRadius: 14,
  },
});
