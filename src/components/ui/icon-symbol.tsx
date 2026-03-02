// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'clock.fill': 'schedule',
  'clock': 'schedule',
  'gearshape.fill': 'settings',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.left.forwardslash.chevron.right': 'code',
  'paperplane.fill': 'send',
  // Tools
  'arrow.2.squarepath': 'swap-horiz',
  'crop': 'crop',
  'rotate.right': 'rotate-right',
  'rotate.left': 'rotate-left',
  'arrow.down.right.and.arrow.up.left': 'compress',
  'arrow.up.left.and.arrow.down.right': 'zoom-out-map',
  'info.circle': 'info-outline',
  // Picker / Utility
  'photo.on.rectangle': 'add-photo-alternate',
  'folder': 'folder',
  'lock.fill': 'lock',
  'lock.open': 'lock-open',
  'arrow.left.and.right': 'swap-horiz',
  'arrow.up.and.down': 'swap-vert',
  // Editor
  'slider.horizontal.3': 'tune',
  'arrow.uturn.backward': 'undo',
  'arrow.triangle.2.circlepath': 'autorenew',
  'arrow.down': 'arrow-downward',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
