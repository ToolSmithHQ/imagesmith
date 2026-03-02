import { create } from 'zustand';
import { ImageFormat } from '@/src/types/formats';
import {
  ImageAsset,
  ConversionOptions,
  CropOptions,
  ResizeOptions,
  CompressOptions,
  MetadataOptions,
  ToolResult,
  ToolType,
  ProcessingState,
} from '@/src/types/image';

interface ImageState {
  // Common
  sourceImage: ImageAsset | null;
  activeTool: ToolType;
  processingState: ProcessingState;
  currentResult: ToolResult | null;

  // Tool-specific options
  conversionOptions: ConversionOptions;
  cropOptions: CropOptions;
  resizeOptions: ResizeOptions;
  compressOptions: CompressOptions;
  metadataOptions: MetadataOptions;

  // Common actions
  setSourceImage: (image: ImageAsset) => void;
  setActiveTool: (tool: ToolType) => void;
  setProcessingState: (state: Partial<ProcessingState>) => void;
  setResult: (result: ToolResult) => void;
  reset: () => void;

  // Convert actions
  setTargetFormat: (format: ImageFormat) => void;
  setQuality: (quality: number) => void;
  setPreserveExif: (preserve: boolean) => void;

  // Crop actions
  setCropOptions: (options: Partial<CropOptions>) => void;
  setRotation: (degrees: number) => void;
  toggleFlipH: () => void;
  toggleFlipV: () => void;

  // Resize actions
  setResizeOptions: (options: Partial<ResizeOptions>) => void;

  // Compress actions
  setCompressQuality: (quality: number) => void;

  // Metadata actions
  setMetadataAction: (action: 'view' | 'strip') => void;
}

const DEFAULT_CONVERSION: ConversionOptions = {
  targetFormat: ImageFormat.PNG,
  quality: 0.9,
  preserveExif: true,
};

const DEFAULT_CROP: CropOptions = {
  originX: 0,
  originY: 0,
  width: 0,
  height: 0,
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
};

const DEFAULT_RESIZE: ResizeOptions = {
  width: 0,
  height: 0,
  lockAspectRatio: true,
};

const DEFAULT_COMPRESS: CompressOptions = {
  quality: 0.7,
};

const DEFAULT_METADATA: MetadataOptions = {
  action: 'view',
};

const DEFAULT_PROCESSING: ProcessingState = {
  status: 'idle',
  progress: 0,
};

export const useImageStore = create<ImageState>((set) => ({
  sourceImage: null,
  activeTool: 'convert',
  processingState: DEFAULT_PROCESSING,
  currentResult: null,
  conversionOptions: DEFAULT_CONVERSION,
  cropOptions: DEFAULT_CROP,
  resizeOptions: DEFAULT_RESIZE,
  compressOptions: DEFAULT_COMPRESS,
  metadataOptions: DEFAULT_METADATA,

  setSourceImage: (image) =>
    set({
      sourceImage: image,
      processingState: { status: 'configuring', progress: 0 },
      currentResult: null,
      cropOptions: {
        ...DEFAULT_CROP,
        width: image.width,
        height: image.height,
      },
      resizeOptions: {
        width: image.width,
        height: image.height,
        lockAspectRatio: true,
      },
    }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setProcessingState: (partial) =>
    set((state) => ({
      processingState: { ...state.processingState, ...partial },
    })),

  setResult: (result) =>
    set({
      currentResult: result,
      processingState: { status: 'complete', progress: 1 },
    }),

  reset: () =>
    set({
      sourceImage: null,
      conversionOptions: DEFAULT_CONVERSION,
      cropOptions: DEFAULT_CROP,
      resizeOptions: DEFAULT_RESIZE,
      compressOptions: DEFAULT_COMPRESS,
      metadataOptions: DEFAULT_METADATA,
      processingState: DEFAULT_PROCESSING,
      currentResult: null,
    }),

  // Convert
  setTargetFormat: (format) =>
    set((state) => ({
      conversionOptions: { ...state.conversionOptions, targetFormat: format },
    })),

  setQuality: (quality) =>
    set((state) => ({
      conversionOptions: { ...state.conversionOptions, quality },
    })),

  setPreserveExif: (preserve) =>
    set((state) => ({
      conversionOptions: { ...state.conversionOptions, preserveExif: preserve },
    })),

  // Crop
  setCropOptions: (options) =>
    set((state) => ({
      cropOptions: { ...state.cropOptions, ...options },
    })),

  setRotation: (degrees) =>
    set((state) => ({
      cropOptions: { ...state.cropOptions, rotation: degrees },
    })),

  toggleFlipH: () =>
    set((state) => ({
      cropOptions: {
        ...state.cropOptions,
        flipHorizontal: !state.cropOptions.flipHorizontal,
      },
    })),

  toggleFlipV: () =>
    set((state) => ({
      cropOptions: {
        ...state.cropOptions,
        flipVertical: !state.cropOptions.flipVertical,
      },
    })),

  // Resize
  setResizeOptions: (options) =>
    set((state) => ({
      resizeOptions: { ...state.resizeOptions, ...options },
    })),

  // Compress
  setCompressQuality: (quality) =>
    set((state) => ({
      compressOptions: { ...state.compressOptions, quality },
    })),

  // Metadata
  setMetadataAction: (action) => set({ metadataOptions: { action } }),
}));
