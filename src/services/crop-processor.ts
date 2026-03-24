import { Skia, ClipOp } from '@shopify/react-native-skia';
import { File } from 'expo-file-system/next';
import { ImageAsset, CropOptions, ToolResult } from '@/src/types/image';
import { ImageFormat, FORMAT_MIME_MAP } from '@/src/types/formats';
import { createProcessingError } from '@/src/utils/error-handler';
import { ensureCacheDir, generateId, getFileSize } from '@/src/services/file-manager';
import { createShapePath, createBrushPath } from '@/src/constants/shapes';
import {
  cropFile,
  rotateFile,
  losslessJpegRotate,
  flipFile,
  getFileImageInfo,
  writeArrayBufferToFile,
  readFileAsArrayBuffer,
} from '@toolsmith/imagecore-files';

export async function cropRotateFlipImage(
  source: ImageAsset,
  options: CropOptions,
  onProgress?: (progress: number) => void,
  reEncodingQuality: number = 0.95,
): Promise<ToolResult> {
  const startTime = Date.now();
  ensureCacheDir();
  onProgress?.(0.1);

  // Shape crops still use Skia (imagecore doesn't do shape masks)
  if (options.shape) {
    return shapeCropImage(source, options, onProgress, startTime);
  }

  if (
    options.originX === 0 && options.originY === 0 &&
    options.width >= source.width && options.height >= source.height &&
    options.rotation === 0 && !options.flipHorizontal && !options.flipVertical
  ) {
    throw createProcessingError(
      'PROCESSING_FAILED',
      'No crop, rotation, or flip options selected',
      'Select at least one transformation to apply.',
    );
  }

  try {
    let currentUri = source.uri;
    const currentFormat = source.format;

    // Step 1: Crop
    const isCropped =
      options.originX > 0 ||
      options.originY > 0 ||
      options.width < source.width ||
      options.height < source.height;

    if (isCropped) {
      currentUri = await cropFile(
        currentUri,
        Math.round(options.originX),
        Math.round(options.originY),
        Math.round(options.width),
        Math.round(options.height),
        currentFormat,
        reEncodingQuality,
      );
    }

    onProgress?.(0.4);

    // Step 2: Rotate (only 90/180/270 supported by imagecore)
    if (options.rotation !== 0) {
      const normalized = ((options.rotation % 360) + 360) % 360;
      if (normalized === 90 || normalized === 180 || normalized === 270) {
        const rotation = normalized as 90 | 180 | 270;
        // Try lossless JPEG rotation first, fall back to pixel rotation
        let rotated = false;
        if (currentFormat === ImageFormat.JPEG) {
          try {
            currentUri = await losslessJpegRotate(currentUri, rotation);
            rotated = true;
          } catch {
            // File might not actually be JPEG (e.g., HEIC mislabeled) — fall back
          }
        }
        if (!rotated) {
          currentUri = await rotateFile(currentUri, rotation, currentFormat, reEncodingQuality);
        }
      }
    }

    onProgress?.(0.7);

    // Step 3: Flip
    if (options.flipHorizontal || options.flipVertical) {
      currentUri = await flipFile(
        currentUri,
        options.flipHorizontal,
        options.flipVertical,
        currentFormat,
        reEncodingQuality,
      );
    }

    onProgress?.(0.8);

    const fileSize = getFileSize(currentUri);
    const info = await getFileImageInfo(currentUri);

    const output: ImageAsset = {
      uri: currentUri,
      fileName: currentUri.split('/').pop() ?? 'cropped.png',
      format: currentFormat,
      width: info.width,
      height: info.height,
      fileSize,
      mimeType: FORMAT_MIME_MAP[currentFormat],
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
    console.error('[imagecore] crop/rotate/flip error:', error instanceof Error ? error.message : error);
    if (error && typeof error === 'object' && 'code' in error) throw error;
    throw createProcessingError(
      'PROCESSING_FAILED',
      error instanceof Error ? error.message : 'Crop failed',
    );
  }
}

/**
 * Shape crop using Skia — imagecore handles the rectangular crop,
 * Skia handles the shape clipping.
 */
async function shapeCropImage(
  source: ImageAsset,
  options: CropOptions,
  onProgress?: (progress: number) => void,
  startTime: number = Date.now(),
): Promise<ToolResult> {
  try {
    // Load source image into Skia
    let skImage = null;

    // Method 1: Load directly via Skia
    try {
      const sourceFile = new File(source.uri);
      const imageBase64 = await sourceFile.base64();
      const skData = Skia.Data.fromBase64(imageBase64);
      skImage = Skia.Image.MakeImageFromEncoded(skData);
    } catch {
      // Skia can't decode this format — try imagecore fallback
    }

    // Method 2: Convert via imagecore → JPEG → load into Skia
    if (!skImage) {
      try {
        const inputBuffer = await readFileAsArrayBuffer(source.uri);
        const { ImageCore } = require('@toolsmith/imagecore-native');
        // Use JPEG instead of PNG (avoids indexed color PNG issues)
        const jpegBuffer = ImageCore.convert(inputBuffer, { format: 'jpeg' as any, quality: 0.95 });
        const jpegUri = writeArrayBufferToFile(jpegBuffer, 'jpg');
        const jpegFile = new File(jpegUri);
        const jpegBase64 = await jpegFile.base64();
        const skData = Skia.Data.fromBase64(jpegBase64);
        skImage = Skia.Image.MakeImageFromEncoded(skData);
      } catch {
        // imagecore fallback also failed
      }
    }

    if (!skImage) {
      throw new Error('Failed to decode image for shape crop');
    }

    const isCropped =
      options.originX > 0 ||
      options.originY > 0 ||
      options.width < source.width ||
      options.height < source.height;

    // Crop region in source image coordinates
    const cropX = isCropped ? Math.round(options.originX) : 0;
    const cropY = isCropped ? Math.round(options.originY) : 0;
    const cropWidth = isCropped ? Math.round(options.width) : source.width;
    const cropHeight = isCropped ? Math.round(options.height) : source.height;

    onProgress?.(0.3);

    onProgress?.(0.5);

    const isBrush = options.shape === 'brush' && options.brushStrokes && options.brushStrokes.length > 0;
    const outW = isBrush ? cropWidth : Math.min(cropWidth, cropHeight);
    const outH = isBrush ? cropHeight : Math.min(cropWidth, cropHeight);

    const surface = Skia.Surface.MakeOffscreen(outW, outH)!;
    const canvas = surface.getCanvas();
    canvas.clear(Skia.Color('transparent'));

    const srcRect = Skia.XYWHRect(cropX, cropY, cropWidth, cropHeight);
    const dstRect = Skia.XYWHRect(0, 0, outW, outH);

    if (isBrush) {
      const maskSurface = Skia.Surface.MakeOffscreen(outW, outH)!;
      const maskCanvas = maskSurface.getCanvas();
      maskCanvas.clear(Skia.Color('transparent'));

      const brushPath = createBrushPath(options.brushStrokes!, outW, outH);
      const brushPaint = Skia.Paint();
      brushPaint.setColor(Skia.Color('white'));
      brushPaint.setStyle(1);
      const brushRadius = Math.max(outW, outH) * 0.03;
      brushPaint.setStrokeWidth(brushRadius * 2);
      brushPaint.setStrokeCap(1);
      brushPaint.setStrokeJoin(1);
      brushPaint.setAntiAlias(true);
      maskCanvas.drawPath(brushPath, brushPaint);

      const maskSnapshot = maskSurface.makeImageSnapshot();
      canvas.drawImageRect(skImage, srcRect, dstRect, Skia.Paint());

      const maskPaint = Skia.Paint();
      maskPaint.setBlendMode(10);
      canvas.drawImage(maskSnapshot, 0, 0, maskPaint);
    } else {
      const shapePath = createShapePath(options.shape!, outW);
      canvas.save();
      canvas.clipPath(shapePath, ClipOp.Intersect, true);
      canvas.drawImageRect(skImage, srcRect, dstRect, Skia.Paint());
      canvas.restore();
    }

    onProgress?.(0.7);

    const snapshot = surface.makeImageSnapshot();
    if (!snapshot) {
      throw new Error('Failed to create image snapshot from Skia surface');
    }

    // Read raw RGBA pixels from Skia surface (always works, unlike encodeToBase64)
    const pixelData = snapshot.readPixels(0, 0, {
      width: outW,
      height: outH,
      colorType: 4, // RGBA_8888
      alphaType: 3, // Unpremul
    });

    if (!pixelData) {
      throw new Error('Failed to read pixels from Skia snapshot');
    }

    // Encode raw RGBA pixels to PNG via imagecore
    const { ImageCore } = require('@toolsmith/imagecore-native');
    const rgbaBytes = pixelData instanceof Uint8Array ? pixelData : new Uint8Array(pixelData.buffer);

    // Create an ArrayBuffer with raw RGBA pixel data
    // We can't use ImageCore.decode() (expects encoded format), so we need to
    // create a BMP in memory (simplest uncompressed format) and decode that
    const bmpSize = 54 + rgbaBytes.length; // BMP header (54 bytes) + pixel data
    const bmp = new ArrayBuffer(bmpSize);
    const view = new DataView(bmp);

    // BMP file header (14 bytes)
    view.setUint8(0, 0x42); // 'B'
    view.setUint8(1, 0x4D); // 'M'
    view.setUint32(2, bmpSize, true); // file size
    view.setUint32(10, 54, true); // pixel data offset

    // BMP info header (40 bytes)
    view.setUint32(14, 40, true); // header size
    view.setInt32(18, outW, true); // width
    view.setInt32(22, -outH, true); // height (negative = top-down)
    view.setUint16(26, 1, true); // planes
    view.setUint16(28, 32, true); // bits per pixel (RGBA)
    view.setUint32(30, 0, true); // compression (none)

    // Copy RGBA pixels — BMP uses BGRA order
    const pixelStart = 54;
    for (let i = 0; i < rgbaBytes.length; i += 4) {
      view.setUint8(pixelStart + i + 0, rgbaBytes[i + 2]); // B
      view.setUint8(pixelStart + i + 1, rgbaBytes[i + 1]); // G
      view.setUint8(pixelStart + i + 2, rgbaBytes[i + 0]); // R
      view.setUint8(pixelStart + i + 3, rgbaBytes[i + 3]); // A
    }

    // Convert BMP→PNG via imagecore
    const pngBuffer = ImageCore.convert(bmp, { format: 'png' as any, quality: 1.0 });
    const outputUri = writeArrayBufferToFile(pngBuffer, 'png');

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
    console.error('[imagecore] shape crop error:', error instanceof Error ? error.message : error);
    throw createProcessingError(
      'PROCESSING_FAILED',
      error instanceof Error ? error.message : 'Shape crop failed',
    );
  }
}
