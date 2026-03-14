import * as ImageManipulator from 'expo-image-manipulator';
import { Skia, ImageFormat as SkiaImageFormat, ClipOp } from '@shopify/react-native-skia';
import { File, Paths, Directory } from 'expo-file-system/next';
import { ImageAsset, CropOptions, ToolResult } from '@/src/types/image';
import { ImageFormat } from '@/src/types/formats';
import { createProcessingError } from '@/src/utils/error-handler';
import { ensureCacheDir, generateId, getFileSize } from '@/src/services/file-manager';
import { createShapePath, createBrushPath } from '@/src/constants/shapes';
import { getSaveOptions, getOutputFormat, getOutputMimeType } from '@/src/utils/save-format';

export async function cropRotateFlipImage(
  source: ImageAsset,
  options: CropOptions,
  onProgress?: (progress: number) => void,
  reEncodingQuality: number = 0.95,
): Promise<ToolResult> {
  const startTime = Date.now();
  ensureCacheDir();
  onProgress?.(0.1);

  // If shape crop, use Skia-based processing
  if (options.shape) {
    return shapeCropImage(source, options, onProgress, startTime);
  }

  const actions: ImageManipulator.Action[] = [];

  // Crop (only if not full image)
  const isCropped =
    options.originX > 0 ||
    options.originY > 0 ||
    options.width < source.width ||
    options.height < source.height;

  if (isCropped) {
    actions.push({
      crop: {
        originX: options.originX,
        originY: options.originY,
        width: options.width,
        height: options.height,
      },
    });
  }

  // Rotate
  if (options.rotation !== 0) {
    actions.push({ rotate: options.rotation });
  }

  // Flip
  if (options.flipHorizontal) {
    actions.push({ flip: ImageManipulator.FlipType.Horizontal });
  }
  if (options.flipVertical) {
    actions.push({ flip: ImageManipulator.FlipType.Vertical });
  }

  if (actions.length === 0) {
    throw createProcessingError(
      'PROCESSING_FAILED',
      'No crop, rotation, or flip options selected',
      'Select at least one transformation to apply.',
    );
  }

  onProgress?.(0.3);

  try {
    const saveOptions = getSaveOptions(source.format, reEncodingQuality);
    const outputFormat = getOutputFormat(source.format);

    const result = await ImageManipulator.manipulateAsync(
      source.uri,
      actions,
      saveOptions,
    );

    onProgress?.(0.8);

    const fileSize = getFileSize(result.uri);
    const output: ImageAsset = {
      uri: result.uri,
      fileName: result.uri.split('/').pop() ?? 'cropped.png',
      format: outputFormat,
      width: result.width,
      height: result.height,
      fileSize,
      mimeType: getOutputMimeType(source.format),
    };

    onProgress?.(1.0);

    return {
      id: generateId(),
      tool: 'crop',
      source,
      output,
      options: { tool: 'crop', config: options },
      processingTimeMs: Date.now() - startTime,
      timestamp: Date.now(),
    };
  } catch (error) {
    throw createProcessingError(
      'PROCESSING_FAILED',
      error instanceof Error ? error.message : 'Crop failed',
    );
  }
}

async function shapeCropImage(
  source: ImageAsset,
  options: CropOptions,
  onProgress?: (progress: number) => void,
  startTime: number = Date.now(),
): Promise<ToolResult> {
  try {
    // Step 1: Crop to bounding box first using ImageManipulator
    const isCropped =
      options.originX > 0 ||
      options.originY > 0 ||
      options.width < source.width ||
      options.height < source.height;

    let croppedUri = source.uri;
    let cropWidth = options.width || source.width;
    let cropHeight = options.height || source.height;

    if (isCropped) {
      const cropResult = await ImageManipulator.manipulateAsync(
        source.uri,
        [{
          crop: {
            originX: options.originX,
            originY: options.originY,
            width: options.width,
            height: options.height,
          },
        }],
        { format: ImageManipulator.SaveFormat.PNG },
      );
      croppedUri = cropResult.uri;
      cropWidth = cropResult.width;
      cropHeight = cropResult.height;
    }

    onProgress?.(0.3);

    // Step 2: Load image data into Skia
    const croppedFile = new File(croppedUri);
    const imageBase64 = await croppedFile.base64();
    const skData = Skia.Data.fromBase64(imageBase64);
    const skImage = Skia.Image.MakeImageFromEncoded(skData);

    if (!skImage) {
      throw new Error('Failed to decode image for shape crop');
    }

    onProgress?.(0.5);

    // Step 3: Create offscreen surface and draw with shape clip
    const isBrush = options.shape === 'brush' && options.brushStrokes && options.brushStrokes.length > 0;
    const outW = isBrush ? cropWidth : Math.min(cropWidth, cropHeight);
    const outH = isBrush ? cropHeight : Math.min(cropWidth, cropHeight);

    const surface = Skia.Surface.MakeOffscreen(outW, outH)!;
    const canvas = surface.getCanvas();

    // Clear to transparent
    canvas.clear(Skia.Color('transparent'));

    const srcRect = Skia.XYWHRect(0, 0, cropWidth, cropHeight);
    const dstRect = Skia.XYWHRect(0, 0, outW, outH);

    if (isBrush) {
      // For brush: draw image first, then use DstIn with thick stroke mask
      // Step A: Create a mask surface with the brush strokes
      const maskSurface = Skia.Surface.MakeOffscreen(outW, outH)!;
      const maskCanvas = maskSurface.getCanvas();
      maskCanvas.clear(Skia.Color('transparent'));

      const brushPath = createBrushPath(options.brushStrokes!, outW, outH);
      const brushPaint = Skia.Paint();
      brushPaint.setColor(Skia.Color('white'));
      brushPaint.setStyle(1); // Stroke
      const brushRadius = Math.max(outW, outH) * 0.03;
      brushPaint.setStrokeWidth(brushRadius * 2);
      brushPaint.setStrokeCap(1); // Round
      brushPaint.setStrokeJoin(1); // Round
      brushPaint.setAntiAlias(true);
      maskCanvas.drawPath(brushPath, brushPaint);

      const maskSnapshot = maskSurface.makeImageSnapshot();

      // Step B: Draw the source image
      canvas.drawImageRect(skImage, srcRect, dstRect, Skia.Paint());

      // Step C: Apply mask using DstIn (keeps image only where mask is opaque)
      const maskPaint = Skia.Paint();
      maskPaint.setBlendMode(10); // DstIn
      canvas.drawImage(maskSnapshot, 0, 0, maskPaint);
    } else {
      // For predefined shapes: clip to shape path and draw image
      const shapePath = createShapePath(options.shape!, outW);
      canvas.save();
      canvas.clipPath(shapePath, ClipOp.Intersect, true);
      canvas.drawImageRect(skImage, srcRect, dstRect, Skia.Paint());
      canvas.restore();
    }

    onProgress?.(0.7);

    // Step 4: Export as PNG (must be PNG for transparency)
    const snapshot = surface.makeImageSnapshot();
    const pngData = snapshot.encodeToBase64(SkiaImageFormat.PNG, 100);

    const cacheDir = new Directory(Paths.cache, 'imagesmith');
    const outputFileName = `${generateId()}_shape.png`;
    const outputFile = new File(cacheDir, outputFileName);
    outputFile.create();
    outputFile.write(pngData, { encoding: 'base64' });
    const outputUri = outputFile.uri;

    onProgress?.(0.9);

    const fileSize = getFileSize(outputUri);
    const output: ImageAsset = {
      uri: outputUri,
      fileName: outputUri.split('/').pop() ?? 'shape-crop.png',
      format: ImageFormat.PNG,
      width: outW,
      height: outH,
      fileSize,
      mimeType: 'image/png',
    };

    onProgress?.(1.0);

    return {
      id: generateId(),
      tool: 'crop',
      source,
      output,
      options: { tool: 'crop', config: options },
      processingTimeMs: Date.now() - startTime,
      timestamp: Date.now(),
    };
  } catch (error) {
    throw createProcessingError(
      'PROCESSING_FAILED',
      error instanceof Error ? error.message : 'Shape crop failed',
    );
  }
}
