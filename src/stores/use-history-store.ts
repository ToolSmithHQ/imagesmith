import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConversionResult } from '@/src/types/image';

interface HistoryState {
  conversions: ConversionResult[];
  addConversion: (result: ConversionResult) => void;
  removeConversion: (id: string) => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      conversions: [],

      addConversion: (result) =>
        set((state) => ({
          conversions: [result, ...state.conversions].slice(0, MAX_HISTORY),
        })),

      removeConversion: (id) =>
        set((state) => ({
          conversions: state.conversions.filter((c) => c.id !== id),
        })),

      clearHistory: () => set({ conversions: [] }),
    }),
    {
      name: 'imagesmith-history',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
