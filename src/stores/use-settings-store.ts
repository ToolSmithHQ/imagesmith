import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  defaultJpegQuality: number;
  preserveExifByDefault: boolean;
  theme: 'system' | 'light' | 'dark';
  hapticFeedback: boolean;

  setDefaultJpegQuality: (quality: number) => void;
  setPreserveExifByDefault: (preserve: boolean) => void;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  setHapticFeedback: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultJpegQuality: 0.9,
      preserveExifByDefault: true,
      theme: 'system',
      hapticFeedback: true,

      setDefaultJpegQuality: (quality) => set({ defaultJpegQuality: quality }),
      setPreserveExifByDefault: (preserve) =>
        set({ preserveExifByDefault: preserve }),
      setTheme: (theme) => set({ theme }),
      setHapticFeedback: (enabled) => set({ hapticFeedback: enabled }),
    }),
    {
      name: 'imagesmith-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
