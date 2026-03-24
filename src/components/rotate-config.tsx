import { View, Text, Pressable, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Image } from 'expo-image';
import { ImageAsset } from '@/src/types/image';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { triggerImpact } from '@/src/utils/haptics';

interface RotateConfigProps {
  image: ImageAsset;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onSetRotation: (degrees: number) => void;
  onToggleFlipH: () => void;
  onToggleFlipV: () => void;
}

export function RotateConfig({
  image,
  rotation,
  flipH,
  flipV,
  onRotateLeft,
  onRotateRight,
  onSetRotation,
  onToggleFlipH,
  onToggleFlipV,
}: RotateConfigProps) {
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: image.uri }}
          style={[
            styles.preview,
            {
              transform: [
                { rotate: `${rotation}deg` },
                { scaleX: flipH ? -1 : 1 },
                { scaleY: flipV ? -1 : 1 },
              ],
            },
          ]}
          contentFit="contain"
        />
      </View>

      <View style={styles.controls}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: iconColor }]}>ROTATE</Text>
          <View style={styles.buttonRow}>
            <Pressable
              testID="btn-rotate-left"
              onPress={() => {
                triggerImpact();
                onRotateLeft();
              }}
              style={[styles.actionButton, { borderColor }]}
            >
              <IconSymbol name="rotate.left" size={22} color={tint} />
              <Text style={[styles.buttonText, { color: textColor }]}>-90°</Text>
            </Pressable>
            <Pressable
              testID="btn-rotate-right"
              onPress={() => {
                triggerImpact();
                onRotateRight();
              }}
              style={[styles.actionButton, { borderColor }]}
            >
              <IconSymbol name="rotate.right" size={22} color={tint} />
              <Text style={[styles.buttonText, { color: textColor }]}>+90°</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                triggerImpact();
                onSetRotation(0);
              }}
              style={[styles.actionButton, { borderColor }]}
            >
              <Text style={[styles.buttonText, { color: textColor }]}>Reset</Text>
            </Pressable>
          </View>
        </View>

        {/* Free-angle slider */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={[styles.label, { color: iconColor }]}>ANGLE</Text>
            <Text style={[styles.angleValue, { color: tint }]}>{Math.round(rotation)}°</Text>
          </View>
          <Slider
            minimumValue={0}
            maximumValue={360}
            value={rotation}
            onValueChange={(val) => onSetRotation(Math.round(val))}
            minimumTrackTintColor={tint}
            maximumTrackTintColor={`${iconColor}40`}
            step={1}
          />
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: iconColor }]}>FLIP</Text>
          <View style={styles.buttonRow}>
            <Pressable
              onPress={() => {
                triggerImpact();
                onToggleFlipH();
              }}
              style={[
                styles.actionButton,
                {
                  borderColor: flipH ? tint : borderColor,
                  backgroundColor: flipH ? `${tint}15` : 'transparent',
                },
              ]}
            >
              <IconSymbol name="arrow.left.and.right" size={22} color={flipH ? tint : iconColor} />
              <Text style={[styles.buttonText, { color: flipH ? tint : textColor }]}>
                Horizontal
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                triggerImpact();
                onToggleFlipV();
              }}
              style={[
                styles.actionButton,
                {
                  borderColor: flipV ? tint : borderColor,
                  backgroundColor: flipV ? `${tint}15` : 'transparent',
                },
              ]}
            >
              <IconSymbol name="arrow.up.and.down" size={22} color={flipV ? tint : iconColor} />
              <Text style={[styles.buttonText, { color: flipV ? tint : textColor }]}>
                Vertical
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.info, { color: iconColor }]}>
          {Math.round(rotation)}° rotation
          {flipH ? ' • Flipped H' : ''}
          {flipV ? ' • Flipped V' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
  },
  preview: {
    width: '80%',
    height: '100%',
    borderRadius: 12,
  },
  controls: { gap: 16 },
  row: { gap: 8 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sliderSection: {
    gap: 4,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  angleValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  info: {
    fontSize: 13,
    textAlign: 'center',
  },
});
