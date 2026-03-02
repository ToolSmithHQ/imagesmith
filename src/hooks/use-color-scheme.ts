import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useSettingsStore } from '@/src/stores/use-settings-store';

export function useColorScheme(): 'light' | 'dark' {
  const systemScheme = useSystemColorScheme();
  const theme = useSettingsStore((s) => s.theme);

  if (theme === 'system') {
    return systemScheme ?? 'light';
  }
  return theme;
}
