import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationFeedbackType } from 'expo-haptics';
import { useImageStore } from '@/src/stores/use-image-store';
import { useSettingsStore } from '@/src/stores/use-settings-store';
import { useImagePickerHook } from '@/src/hooks/use-image-picker';
import { ImagePickerView } from '@/src/components/image-picker-view';
import { CropOverlay } from '@/src/components/crop-overlay';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { AnimatedPressable } from '@/src/components/ui/animated-pressable';
import { Button } from '@/src/components/ui/button';
import { QualitySlider } from '@/src/components/ui/quality-slider';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { triggerImpact, triggerNotification } from '@/src/utils/haptics';
import { ImageAsset, ToolResult, ShapeType } from '@/src/types/image';
import { ImageFormat } from '@/src/types/formats';
import { SHAPES } from '@/src/constants/shapes';
import { compressImage } from '@/src/services/compress-processor';
import { resizeImage } from '@/src/services/resize-processor';
import { cropRotateFlipImage } from '@/src/services/crop-processor';
import { convertImage } from '@/src/services/image-processor';
import { stripMetadata } from '@/src/services/metadata-processor';
import { saveToGallery, shareImage } from '@/src/services/file-manager';
import { FORMAT_DISPLAY } from '@/src/constants/formats';
import { Typography, Spacing, Radius, Elevation } from '@/src/constants/theme';

type EditorTool = 'crop' | 'rotate' | 'resize' | 'compress' | 'strip';

const EDITOR_TOOLS: { id: EditorTool; icon: string; label: string }[] = [
  { id: 'crop', icon: 'crop', label: 'Crop' },
  { id: 'rotate', icon: 'rotate.right', label: 'Rotate' },
  { id: 'resize', icon: 'arrow.up.left.and.arrow.down.right', label: 'Resize' },
  { id: 'compress', icon: 'arrow.down.right.and.arrow.up.left', label: 'Compress' },
  { id: 'strip', icon: 'info.circle', label: 'Strip' },
];

const TOOL_LABELS: Record<EditorTool, string> = {
  crop: 'Cropped',
  rotate: 'Rotated',
  resize: 'Resized',
  compress: 'Compressed',
  strip: 'Stripped',
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export default function EditorScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const surfaceContainer = useThemeColor({}, 'surfaceContainer');
  const surfaceContainerLow = useThemeColor({}, 'surfaceContainerLow');
  const surfaceContainerHigh = useThemeColor({}, 'surfaceContainerHigh');
  const tintContainer = useThemeColor({}, 'tintContainer');
  const onTintContainer = useThemeColor({}, 'onTintContainer');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');
  const surfaceDim = useThemeColor({}, 'surfaceDim');

  const { sourceImage, reset: resetImageStore } = useImageStore();
  const { reEncodingQuality, setReEncodingQuality } = useSettingsStore();
  const { pickFromGallery } = useImagePickerHook();

  const [currentImage, setCurrentImage] = useState<ImageAsset | null>(null);
  const [imageStack, setImageStack] = useState<ImageAsset[]>([]);
  const [operations, setOperations] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<EditorTool | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [compressQuality, setCompressQuality] = useState(0.7);
  const [resizeW, setResizeW] = useState(0);
  const [resizeH, setResizeH] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [cropRegion, setCropRegion] = useState({
    originX: 0,
    originY: 0,
    width: 0,
    height: 0,
  });
  const [editorShape, setEditorShape] = useState<ShapeType | null>(null);
  const [editorBrushStrokes, setEditorBrushStrokes] = useState<{ x: number; y: number }[][]>([]);
  const [exportFormat, setExportFormat] = useState<ImageFormat | null>(null);

  const isFirstRender = useRef(true);

  useEffect(() => {
    resetImageStore();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (sourceImage) {
      setCurrentImage(sourceImage);
      setImageStack([]);
      setOperations([]);
      setActiveTool(null);
      setExportFormat(null);
      setResizeW(sourceImage.width);
      setResizeH(sourceImage.height);
      setEditorShape(null);
      setEditorBrushStrokes([]);
    }
  }, [sourceImage]);

  const selectTool = (tool: EditorTool) => {
    triggerImpact();
    if (activeTool === tool) {
      setActiveTool(null);
      return;
    }
    setActiveTool(tool);
    setEditorShape(null);
    if (currentImage) {
      if (tool === 'resize') {
        setResizeW(currentImage.width);
        setResizeH(currentImage.height);
      }
      if (tool === 'rotate') {
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
      }
    }
  };

  const handleApply = async () => {
    if (!currentImage || !activeTool) return;
    setProcessing(true);
    try {
      let result: ToolResult;
      switch (activeTool) {
        case 'compress':
          result = await compressImage(currentImage, { quality: compressQuality });
          break;
        case 'resize':
          result = await resizeImage(currentImage, {
            width: resizeW,
            height: resizeH,
            lockAspectRatio: lockAspect,
          }, undefined, reEncodingQuality);
          break;
        case 'rotate':
          result = await cropRotateFlipImage(currentImage, {
            originX: 0,
            originY: 0,
            width: currentImage.width,
            height: currentImage.height,
            rotation,
            flipHorizontal: flipH,
            flipVertical: flipV,
            shape: null,
          }, undefined, reEncodingQuality);
          break;
        case 'strip':
          result = await stripMetadata(currentImage);
          break;
        case 'crop':
          result = await cropRotateFlipImage(currentImage, {
            ...cropRegion,
            rotation: 0,
            flipHorizontal: false,
            flipVertical: false,
            shape: editorShape,
            brushStrokes: editorShape === 'brush' ? editorBrushStrokes : undefined,
          }, undefined, reEncodingQuality);
          break;
        default:
          return;
      }

      setImageStack((prev) => [...prev, currentImage]);
      setCurrentImage(result.output);
      setOperations((prev) => [...prev, TOOL_LABELS[activeTool]]);
      setActiveTool(null);
      triggerNotification();
    } catch {
      triggerNotification(NotificationFeedbackType.Error);
      Alert.alert('Error', 'Processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleUndo = () => {
    if (imageStack.length === 0) return;
    triggerImpact();
    setCurrentImage(imageStack[imageStack.length - 1]);
    setImageStack((prev) => prev.slice(0, -1));
    setOperations((prev) => prev.slice(0, -1));
    setActiveTool(null);
  };

  const getExportUri = async (): Promise<string> => {
    if (!currentImage) throw new Error('No image');
    if (!exportFormat || exportFormat === currentImage.format) return currentImage.uri;
    const result = await convertImage(currentImage, {
      targetFormat: exportFormat,
      quality: 0.95,
      preserveExif: true,
    });
    return result.output.uri;
  };

  const handleSave = async () => {
    if (!currentImage) return;
    setSaving(true);
    try {
      const uri = await getExportUri();
      await saveToGallery(uri);
      triggerNotification();
      Alert.alert('Saved', 'Image saved to your gallery.');
    } catch {
      triggerNotification(NotificationFeedbackType.Error);
      Alert.alert('Save Failed', 'Could not save. Check gallery permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!currentImage) return;
    try {
      const uri = await getExportUri();
      await shareImage(uri);
    } catch {
      Alert.alert('Share Failed', 'Could not share the image.');
    }
  };

  if (!currentImage) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.pickerContent}
          showsVerticalScrollIndicator={false}
        >
          <ImagePickerView />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const aspectRatio = currentImage.width / currentImage.height;
  const formatDisplay = FORMAT_DISPLAY[currentImage.format];

  const handleResizeW = (text: string) => {
    const w = parseInt(text, 10) || 0;
    setResizeW(w);
    if (lockAspect && w > 0) setResizeH(Math.round(w / aspectRatio));
  };

  const handleResizeH = (text: string) => {
    const h = parseInt(text, 10) || 0;
    setResizeH(h);
    if (lockAspect && h > 0) setResizeW(Math.round(h * aspectRatio));
  };

  const canApply = (() => {
    if (!activeTool || processing) return false;
    switch (activeTool) {
      case 'resize':
        return resizeW > 0 && resizeH > 0 && (resizeW !== currentImage.width || resizeH !== currentImage.height);
      case 'rotate':
        return rotation !== 0 || flipH || flipV;
      case 'crop':
        return (
          (editorShape === 'brush' ? editorBrushStrokes.length > 0 : editorShape !== null) ||
          cropRegion.originX > 0 ||
          cropRegion.originY > 0 ||
          cropRegion.width < currentImage.width ||
          cropRegion.height < currentImage.height
        );
      default:
        return true;
    }
  })();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
      <View style={styles.editor}>
        {/* Preview */}
        <View style={[styles.previewArea, { backgroundColor: surfaceDim }]}>
          {activeTool === 'crop' ? (
            <CropOverlay
              key={`${currentImage.uri}-${editorShape}`}
              image={currentImage}
              aspectRatio={editorShape && editorShape !== 'brush' ? 1 : null}
              shape={editorShape}
              onCropChange={setCropRegion}
              onBrushStrokes={setEditorBrushStrokes}
            />
          ) : activeTool === 'rotate' ? (
            <View style={styles.rotatePreview}>
              <Image
                source={{ uri: currentImage.uri }}
                style={[
                  styles.rotateImage,
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
          ) : (
            <Image
              source={{ uri: currentImage.uri }}
              style={StyleSheet.absoluteFill}
              contentFit="contain"
            />
          )}
        </View>

        {/* Image info bar */}
        <View style={[styles.infoBar, { backgroundColor: surfaceContainer }]}>
          <View style={[styles.formatBadge, { backgroundColor: formatDisplay.color }]}>
            <Text style={styles.formatBadgeText}>{formatDisplay.label}</Text>
          </View>
          <Text style={[styles.infoDimensions, { color: textColor }]}>
            {currentImage.width} x {currentImage.height}
          </Text>
          <View style={[styles.infoDot, { backgroundColor: onSurfaceVariant }]} />
          <Text style={[styles.infoSize, { color: onSurfaceVariant }]}>
            {formatFileSize(currentImage.fileSize)}
          </Text>
          {imageStack.length > 0 && (
            <Pressable onPress={handleUndo} style={styles.undoBtn}>
              <IconSymbol name="arrow.uturn.backward" size={16} color={tint} />
            </Pressable>
          )}
        </View>

        {/* Operations applied */}
        {operations.length > 0 && (
          <ScrollView
            horizontal
            style={styles.operationsRow}
            contentContainerStyle={styles.operationsContent}
            showsHorizontalScrollIndicator={false}
          >
            {operations.map((op, i) => (
              <View
                key={i}
                style={[styles.opChip, { backgroundColor: tintContainer }]}
              >
                <Text style={[styles.opChipText, { color: tint }]}>{op}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Bottom panel — tools or config */}
        <View style={[styles.bottomPanel, { backgroundColor: surfaceContainer }]}>
          {/* Tool grid — always visible */}
          {!activeTool ? (
            <>
              <View style={styles.toolGrid}>
                {EDITOR_TOOLS.map((tool) => (
                  <AnimatedPressable
                    key={tool.id}
                    onPress={() => selectTool(tool.id)}
                    style={[styles.toolGridItem, { backgroundColor: surfaceContainerLow }]}
                  >
                    <View style={[styles.toolIconWrap, { backgroundColor: tintContainer }]}>
                      <IconSymbol name={tool.icon as any} size={22} color={onTintContainer} />
                    </View>
                    <Text style={[styles.toolGridLabel, { color: textColor }]}>
                      {tool.label}
                    </Text>
                  </AnimatedPressable>
                ))}
              </View>

              <Text style={[styles.hint, { color: onSurfaceVariant }]}>
                Tap a tool to start editing
              </Text>

              {/* Save/Share when operations exist */}
              {operations.length > 0 && (
                <>
                  <View style={styles.exportFormatSection}>
                    <Text style={[styles.exportFormatLabel, { color: onSurfaceVariant }]}>
                      Save as
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.exportFormatRow}
                    >
                      {(() => {
                        const currentFmt = currentImage?.format ?? ImageFormat.JPEG;
                        const currentDisplay = FORMAT_DISPLAY[currentFmt];
                        const formats: { format: ImageFormat | null; label: string; color: string }[] = [
                          { format: null, label: currentDisplay.label, color: currentDisplay.color },
                        ];
                        const convertible = [ImageFormat.JPEG, ImageFormat.PNG, ImageFormat.WEBP] as const;
                        for (const fmt of convertible) {
                          if (fmt !== currentFmt) {
                            formats.push({ format: fmt, label: FORMAT_DISPLAY[fmt].label, color: FORMAT_DISPLAY[fmt].color });
                          }
                        }
                        return formats.map((f) => {
                          const active = exportFormat === f.format;
                          return (
                            <Pressable
                              key={f.label}
                              onPress={() => { triggerImpact(); setExportFormat(f.format); }}
                              style={[
                                styles.exportChip,
                                { backgroundColor: active ? tintContainer : surfaceContainerLow },
                              ]}
                            >
                              <View style={[styles.exportDot, { backgroundColor: f.color }]} />
                              <Text style={[styles.exportChipText, { color: active ? tint : textColor }]}>
                                {f.label}
                              </Text>
                            </Pressable>
                          );
                        });
                      })()}
                    </ScrollView>
                  </View>
                  <View style={styles.saveRow}>
                    <View style={{ flex: 1 }}>
                      <Button
                        variant="primary"
                        title={saving ? 'Saving...' : 'Save to Gallery'}
                        onPress={handleSave}
                        disabled={saving}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button variant="secondary" title="Share" onPress={handleShare} />
                    </View>
                  </View>
                </>
              )}

              <Pressable onPress={pickFromGallery} style={styles.changeImageRow}>
                <IconSymbol name="arrow.triangle.2.circlepath" size={14} color={tint} />
                <Text style={[styles.changeImageText, { color: tint }]}>
                  Change Image
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              {/* Active tool header */}
              <View style={styles.configHeader}>
                <Pressable onPress={() => setActiveTool(null)} style={styles.backBtn}>
                  <IconSymbol name="chevron.left" size={16} color={tint} />
                </Pressable>
                <Text style={[styles.configTitle, { color: textColor }]}>
                  {EDITOR_TOOLS.find(t => t.id === activeTool)?.label}
                </Text>
                <View style={{ width: 32 }} />
              </View>

              {/* Config panels */}
              {activeTool === 'compress' && (
                <View style={styles.configBody}>
                  <QualitySlider
                    value={compressQuality}
                    onValueChange={setCompressQuality}
                    label="Compression Quality"
                    min={0.1}
                  />
                </View>
              )}

              {activeTool === 'resize' && (
                <View style={styles.configBody}>
                  <View style={styles.resizeRow}>
                    <View style={styles.resizeInput}>
                      <Text style={[styles.inputLabel, { color: onSurfaceVariant }]}>Width</Text>
                      <TextInput
                        style={[styles.input, { color: textColor, backgroundColor: surfaceContainerLow, borderColor: surfaceContainerHigh }]}
                        value={String(resizeW)}
                        onChangeText={handleResizeW}
                        keyboardType="number-pad"
                        selectTextOnFocus
                      />
                    </View>
                    <AnimatedPressable
                      onPress={() => {
                        triggerImpact();
                        setLockAspect(!lockAspect);
                      }}
                      style={[styles.lockBtn, { backgroundColor: lockAspect ? tintContainer : surfaceContainerLow }]}
                    >
                      <IconSymbol
                        name={lockAspect ? 'lock.fill' : 'lock.open'}
                        size={16}
                        color={lockAspect ? onTintContainer : iconColor}
                      />
                    </AnimatedPressable>
                    <View style={styles.resizeInput}>
                      <Text style={[styles.inputLabel, { color: onSurfaceVariant }]}>Height</Text>
                      <TextInput
                        style={[styles.input, { color: textColor, backgroundColor: surfaceContainerLow, borderColor: surfaceContainerHigh }]}
                        value={String(resizeH)}
                        onChangeText={handleResizeH}
                        keyboardType="number-pad"
                        selectTextOnFocus
                      />
                    </View>
                  </View>
                  <QualitySlider
                    value={reEncodingQuality}
                    onValueChange={setReEncodingQuality}
                  />
                </View>
              )}

              {activeTool === 'rotate' && (
                <View style={styles.configBody}>
                  <View style={styles.sliderRow}>
                    <Text style={[styles.configLabel, { color: textColor }]}>Angle</Text>
                    <Text style={[styles.configValue, { color: tint }]}>{Math.round(rotation)}°</Text>
                  </View>
                  <Slider
                    minimumValue={0}
                    maximumValue={360}
                    value={rotation}
                    onValueChange={(v) => setRotation(Math.round(v))}
                    minimumTrackTintColor={tint}
                    maximumTrackTintColor={surfaceContainerHigh}
                    step={1}
                  />
                  <View style={styles.quickActions}>
                    <AnimatedPressable
                      onPress={() => { triggerImpact(); setRotation(((rotation - 90) % 360 + 360) % 360); }}
                      style={[styles.quickBtn, { backgroundColor: surfaceContainerLow }]}
                    >
                      <IconSymbol name="rotate.left" size={18} color={textColor} />
                      <Text style={[styles.quickBtnText, { color: textColor }]}>-90°</Text>
                    </AnimatedPressable>
                    <AnimatedPressable
                      onPress={() => { triggerImpact(); setRotation((rotation + 90) % 360); }}
                      style={[styles.quickBtn, { backgroundColor: surfaceContainerLow }]}
                    >
                      <IconSymbol name="rotate.right" size={18} color={textColor} />
                      <Text style={[styles.quickBtnText, { color: textColor }]}>+90°</Text>
                    </AnimatedPressable>
                    <AnimatedPressable
                      onPress={() => { triggerImpact(); setFlipH(!flipH); }}
                      style={[styles.quickBtn, { backgroundColor: flipH ? tintContainer : surfaceContainerLow }]}
                    >
                      <IconSymbol name="arrow.left.and.right" size={18} color={flipH ? tint : textColor} />
                      <Text style={[styles.quickBtnText, { color: flipH ? tint : textColor }]}>Flip H</Text>
                    </AnimatedPressable>
                    <AnimatedPressable
                      onPress={() => { triggerImpact(); setFlipV(!flipV); }}
                      style={[styles.quickBtn, { backgroundColor: flipV ? tintContainer : surfaceContainerLow }]}
                    >
                      <IconSymbol name="arrow.up.and.down" size={18} color={flipV ? tint : textColor} />
                      <Text style={[styles.quickBtnText, { color: flipV ? tint : textColor }]}>Flip V</Text>
                    </AnimatedPressable>
                  </View>
                  <QualitySlider
                    value={reEncodingQuality}
                    onValueChange={setReEncodingQuality}
                  />
                </View>
              )}

              {activeTool === 'crop' && (
                <View style={styles.configBody}>
                  <Text style={[styles.configHint, { color: onSurfaceVariant }]}>
                    Drag corners or edges to adjust the crop area
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.shapesRow}
                  >
                    <Pressable
                      onPress={() => { triggerImpact(); setEditorShape(null); }}
                      style={[
                        styles.shapeChip,
                        { backgroundColor: editorShape === null ? tintContainer : surfaceContainerLow },
                      ]}
                    >
                      <Text style={[styles.shapeChipText, { color: editorShape === null ? tint : textColor }]}>
                        None
                      </Text>
                    </Pressable>
                    {SHAPES.map((s) => {
                      const active = editorShape === s.id;
                      return (
                        <Pressable
                          key={s.id}
                          onPress={() => { triggerImpact(); setEditorShape(s.id); setEditorBrushStrokes([]); }}
                          style={[
                            styles.shapeChip,
                            { backgroundColor: active ? tintContainer : surfaceContainerLow },
                          ]}
                        >
                          <IconSymbol name={s.icon as any} size={16} color={active ? tint : onSurfaceVariant} />
                          <Text style={[styles.shapeChipText, { color: active ? tint : textColor }]}>
                            {s.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                  <QualitySlider
                    value={reEncodingQuality}
                    onValueChange={setReEncodingQuality}
                  />
                </View>
              )}

              {activeTool === 'strip' && (
                <View style={styles.configBody}>
                  <View style={[styles.stripInfo, { backgroundColor: surfaceContainerLow }]}>
                    <IconSymbol name="info.circle" size={20} color={tint} />
                    <Text style={[styles.stripText, { color: onSurfaceVariant }]}>
                      Removes all EXIF metadata (GPS, camera info, timestamps) from the image
                    </Text>
                  </View>
                </View>
              )}

              {/* Apply button */}
              <View style={styles.applyRow}>
                {processing ? (
                  <View style={styles.processingRow}>
                    <ActivityIndicator color={tint} />
                    <Text style={[styles.processingText, { color: onSurfaceVariant }]}>Processing...</Text>
                  </View>
                ) : (
                  <Button
                    variant="primary"
                    title="Apply"
                    onPress={handleApply}
                    disabled={!canApply}
                  />
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pickerContent: { padding: Spacing.xl, flexGrow: 1, gap: Spacing.xxl },
  editor: { flex: 1 },

  // Preview
  previewArea: {
    flex: 1,
  },
  rotatePreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotateImage: {
    width: '80%',
    height: '80%',
  },

  // Info bar
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  formatBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  formatBadgeText: {
    ...Typography.labelSmall,
    color: '#fff',
    fontWeight: '700',
  },
  infoDimensions: {
    ...Typography.labelMedium,
    fontWeight: '600',
  },
  infoDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  infoSize: {
    ...Typography.labelMedium,
    flex: 1,
  },
  undoBtn: {
    padding: Spacing.xs,
  },

  // Operations chips
  operationsRow: {
    maxHeight: 36,
  },
  operationsContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  opChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  opChipText: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },

  // Bottom panel
  bottomPanel: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
    ...Elevation.level3,
  },

  // Tool grid
  toolGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  toolGridItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  toolIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolGridLabel: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  hint: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  changeImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  changeImageText: {
    ...Typography.labelLarge,
  },
  saveRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  exportFormatSection: {
    gap: Spacing.xs,
  },
  exportFormatLabel: {
    ...Typography.labelSmall,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exportFormatRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  exportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
  },
  exportDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exportChipText: {
    ...Typography.labelMedium,
    fontWeight: '600',
  },

  // Config header
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  configTitle: {
    ...Typography.titleMedium,
  },
  configBody: {
    gap: Spacing.md,
  },
  configLabel: {
    ...Typography.bodyMedium,
    fontWeight: '500',
  },
  configValue: {
    ...Typography.titleMedium,
  },
  configHint: {
    ...Typography.bodySmall,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Resize
  resizeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  resizeInput: {
    flex: 1,
    gap: Spacing.xs,
  },
  inputLabel: {
    ...Typography.labelSmall,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    ...Typography.titleMedium,
    textAlign: 'center',
  },
  lockBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },

  // Rotate quick actions
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    gap: 2,
  },
  quickBtnText: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },

  // Shapes
  shapesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  shapeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
  },
  shapeChipText: {
    ...Typography.labelMedium,
    fontWeight: '600',
  },

  // Strip
  stripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
  },
  stripText: {
    ...Typography.bodySmall,
    flex: 1,
  },

  // Apply / actions
  applyRow: {
    paddingTop: Spacing.xs,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  processingText: {
    ...Typography.bodyMedium,
  },
});
