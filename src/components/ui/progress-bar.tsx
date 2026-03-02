import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useThemeColor } from '@/src/hooks/use-theme-color';

interface ProgressBarProps {
  progress: number; // 0-1
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const tint = useThemeColor({}, 'tint');
  const surfaceContainerHigh = useThemeColor({}, 'surfaceContainerHigh');

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${Math.min(Math.max(progress, 0), 1) * 100}%`, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    }),
  }));

  return (
    <View style={[styles.track, { backgroundColor: surfaceContainerHigh }]}>
      <Animated.View
        style={[styles.fill, { backgroundColor: tint }, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
