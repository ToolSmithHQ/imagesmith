import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/src/stores/use-settings-store';

export function triggerImpact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium,
) {
  if (!useSettingsStore.getState().hapticFeedback) return;
  Haptics.impactAsync(style);
}

export function triggerNotification(
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success,
) {
  if (!useSettingsStore.getState().hapticFeedback) return;
  Haptics.notificationAsync(type);
}
