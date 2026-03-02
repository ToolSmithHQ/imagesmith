import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#64D2FF';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    surface: '#F5F5F5',
    surfaceElevated: '#FFFFFF',
    border: '#E0E0E0',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    // Tonal surfaces
    surfaceDim: '#E8E8EA',
    surfaceContainer: '#F0F0F2',
    surfaceContainerLow: '#F5F5F7',
    surfaceContainerHigh: '#E6E6E9',
    onSurfaceVariant: '#49454F',
    outline: '#CAC4D0',
    outlineVariant: '#E0DBE8',
    tintContainer: '#D6F0F9',
    onTintContainer: '#064E65',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    border: '#38383A',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    // Tonal surfaces
    surfaceDim: '#111214',
    surfaceContainer: '#1E1F22',
    surfaceContainerLow: '#1A1B1E',
    surfaceContainerHigh: '#282A2D',
    onSurfaceVariant: '#CAC4D0',
    outline: '#49454F',
    outlineVariant: '#36343B',
    tintContainer: '#0E3D4D',
    onTintContainer: '#A8EEFF',
  },
};

export const Typography = {
  displayLarge: { fontSize: 34, fontWeight: '700' as const, lineHeight: 40, letterSpacing: -0.5 },
  headlineMedium: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  titleLarge: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  titleMedium: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  labelLarge: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20, letterSpacing: 0.1 },
  labelMedium: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.3 },
  labelSmall: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.5 },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const Elevation = {
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
