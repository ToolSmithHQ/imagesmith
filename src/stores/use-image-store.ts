import { create } from 'zustand';
import { ImageFormat } from '@/src/types/formats';
import {
  ImageAsset,
  ConversionOptions,
  ConversionResult,
  ProcessingState,
} from '@/src/types/image';

interface ImageState {
  sourceImage: ImageAsset | null;
  conversionOptions: ConversionOptions;
  processingState: ProcessingState;
  currentResult: ConversionResult | null;

  setSourceImage: (image: ImageAsset) => void;
  setTargetFormat: (format: ImageFormat) => void;
  setQuality: (quality: number) => void;
  setPreserveExif: (preserve: boolean) => void;
  setProcessingState: (state: Partial<ProcessingState>) => void;
  setResult: (result: ConversionResult) => void;
  reset: () => void;
}

const DEFAULT_OPTIONS: ConversionOptions = {
  targetFormat: ImageFormat.PNG,
  quality: 0.9,
  preserveExif: true,
};

const DEFAULT_PROCESSING: ProcessingState = {
  status: 'idle',
  progress: 0,
};

export const useImageStore = create<ImageState>((set) => ({
  sourceImage: null,
  conversionOptions: DEFAULT_OPTIONS,
  processingState: DEFAULT_PROCESSING,
  currentResult: null,

  setSourceImage: (image) =>
    set({
      sourceImage: image,
      processingState: { status: 'configuring', progress: 0 },
      currentResult: null,
    }),

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
      conversionOptions: DEFAULT_OPTIONS,
      processingState: DEFAULT_PROCESSING,
      currentResult: null,
    }),
}));
