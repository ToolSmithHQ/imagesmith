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

// --- Tool types ---

export type ToolType = 'convert' | 'crop' | 'rotate' | 'resize' | 'compress' | 'metadata';

export interface ConversionOptions {
  targetFormat: ImageFormat;
  quality: number;
  preserveExif: boolean;
}

export interface CropOptions {
  originX: number;
  originY: number;
  width: number;
  height: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export interface ResizeOptions {
  width: number;
  height: number;
  lockAspectRatio: boolean;
}

export interface CompressOptions {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface MetadataOptions {
  action: 'view' | 'strip';
}

export type ToolOptions =
  | { tool: 'convert'; config: ConversionOptions }
  | { tool: 'crop'; config: CropOptions }
  | { tool: 'resize'; config: ResizeOptions }
  | { tool: 'compress'; config: CompressOptions }
  | { tool: 'metadata'; config: MetadataOptions };

// --- Results ---

export interface ToolResult {
  id: string;
  tool: ToolType;
  source: ImageAsset;
  output: ImageAsset;
  options: ToolOptions;
  processingTimeMs: number;
  timestamp: number;
}

/** @deprecated Use ToolResult instead */
export type ConversionResult = ToolResult;

export interface ExifData {
  [category: string]: { [key: string]: string | number | undefined };
}

export interface MetadataResult {
  id: string;
  source: ImageAsset;
  exifData: ExifData;
  timestamp: number;
}

// --- Processing state ---

export interface ProcessingState {
  status: 'idle' | 'picking' | 'configuring' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: ProcessingError;
}

export interface ProcessingError {
  code:
    | 'UNSUPPORTED_FORMAT'
    | 'FILE_TOO_LARGE'
    | 'PERMISSION_DENIED'
    | 'PROCESSING_FAILED'
    | 'SAVE_FAILED'
    | 'METADATA_READ_FAILED'
    | 'UNKNOWN';
  message: string;
  userMessage: string;
  recoverable: boolean;
}
