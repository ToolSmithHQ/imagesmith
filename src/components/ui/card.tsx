import { View, StyleSheet, ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  const background = useThemeColor({}, 'background');

  return (
    <View
      style={[styles.card, { backgroundColor: background }, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
