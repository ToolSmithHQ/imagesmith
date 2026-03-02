import { Pressable, PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = { damping: 15, stiffness: 150 };

interface AnimatedPressableComponentProps extends PressableProps {
  scaleValue?: number;
}

export function AnimatedPressable({
  scaleValue = 0.97,
  style,
  onPressIn,
  onPressOut,
  children,
  ...props
}: AnimatedPressableComponentProps) {
  const pressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? scaleValue : 1, SPRING_CONFIG) }],
    opacity: withSpring(pressed.value ? 0.92 : 1, SPRING_CONFIG),
  }));

  return (
    <AnimatedPressableBase
      onPressIn={(e) => {
        pressed.value = true;
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = false;
        onPressOut?.(e);
      }}
      style={[animatedStyle, style as any]}
      {...props}
    >
      {children}
    </AnimatedPressableBase>
  );
}
