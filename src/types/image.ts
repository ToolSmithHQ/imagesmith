import { ImageFormat } from './formats';

export interface ImageAsset {
  uri: string;
  fileName: string;
  format: ImageFormat;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
}

export interface ConversionOptions {
  targetFormat: ImageFormat;
  quality: number; // 0-1 for lossy formats
  preserveExif: boolean;
}

export interface ConversionResult {
  id: string;
  source: ImageAsset;
  output: ImageAsset;
  options: ConversionOptions;
  processingTimeMs: number;
  timestamp: number;
}

export interface ProcessingState {
  status: 'idle' | 'picking' | 'configuring' | 'processing' | 'complete' | 'error';
  progress: number; // 0-1
  error?: ProcessingError;
}

export interface ProcessingError {
  code:
    | 'UNSUPPORTED_FORMAT'
    | 'FILE_TOO_LARGE'
    | 'PERMISSION_DENIED'
    | 'PROCESSING_FAILED'
    | 'SAVE_FAILED'
    | 'UNKNOWN';
  message: string;
  userMessage: string;
  recoverable: boolean;
}
