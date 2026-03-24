// Mock native modules that aren't available in test environment

jest.mock('@toolsmith/imagecore-native', () => ({
  ImageCore: {
    getImageInfo: jest.fn(() => ({ width: 100, height: 100, format: 'jpeg', hasExif: false, fileSize: 1024 })),
    decode: jest.fn(() => ({ width: 100, height: 100, free: jest.fn() })),
    encode: jest.fn(() => new ArrayBuffer(100)),
    convert: jest.fn(() => new ArrayBuffer(100)),
    jpegLosslessRotate: jest.fn(() => new ArrayBuffer(100)),
    jpegLosslessCrop: jest.fn(() => new ArrayBuffer(100)),
    jpegStripExif: jest.fn(() => new ArrayBuffer(100)),
    stripExif: jest.fn(() => new ArrayBuffer(100)),
    readExif: jest.fn(() => ({})),
    resize: jest.fn(() => ({ width: 50, height: 50, free: jest.fn() })),
    crop: jest.fn(() => ({ width: 50, height: 50, free: jest.fn() })),
    rotate: jest.fn(() => ({ width: 100, height: 100, free: jest.fn() })),
    flipHorizontal: jest.fn(() => ({ width: 100, height: 100, free: jest.fn() })),
    flipVertical: jest.fn(() => ({ width: 100, height: 100, free: jest.fn() })),
  },
  ImageFormat: {
    JPEG: 'jpeg', PNG: 'png', WEBP: 'webp', HEIC: 'heic',
    AVIF: 'avif', TIFF: 'tiff', BMP: 'bmp', GIF: 'gif',
  },
}));

jest.mock('@toolsmith/imagecore-files', () => ({
  convertFile: jest.fn(() => Promise.resolve('file:///mock/output.jpg')),
  compressFile: jest.fn(() => Promise.resolve('file:///mock/output.jpg')),
  resizeFile: jest.fn(() => Promise.resolve('file:///mock/output.jpg')),
  cropFile: jest.fn(() => Promise.resolve('file:///mock/output.jpg')),
  rotateFile: jest.fn(() => Promise.resolve('file:///mock/output.jpg')),
  flipFile: jest.fn(() => Promise.resolve('file:///mock/output.jpg')),
  losslessJpegRotate: jest.fn(() => Promise.resolve('file:///mock/output.jpg')),
  getFileImageInfo: jest.fn(() => Promise.resolve({ width: 100, height: 100, format: 'jpeg', hasExif: false, fileSize: 1024 })),
  stripFileExif: jest.fn(() => Promise.resolve('file:///mock/stripped.jpg')),
  readFileExif: jest.fn(() => Promise.resolve({})),
  readFileAsArrayBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(100))),
  writeArrayBufferToFile: jest.fn(() => 'file:///mock/output.jpg'),
  formatToExtension: jest.fn((f) => f === 'jpeg' ? 'jpg' : f),
  ImageFormat: {
    JPEG: 'jpeg', PNG: 'png', WEBP: 'webp', HEIC: 'heic',
    AVIF: 'avif', TIFF: 'tiff', BMP: 'bmp', GIF: 'gif',
  },
}));

jest.mock('expo-file-system', () => ({
  cacheDirectory: '/mock/cache/',
  documentDirectory: '/mock/documents/',
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, size: 1024 })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-file-system/next', () => ({
  File: jest.fn().mockImplementation(() => ({
    exists: true,
    size: 1024,
    create: jest.fn(),
    write: jest.fn(),
    base64: jest.fn(() => Promise.resolve('')),
    uri: 'file:///mock/test.jpg',
  })),
  Directory: jest.fn().mockImplementation(() => ({
    exists: true,
    create: jest.fn(),
  })),
  Paths: { cache: '/mock/cache' },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  saveToLibraryAsync: jest.fn(() => Promise.resolve()),
  createAssetAsync: jest.fn(() => Promise.resolve({ uri: 'mock://asset' })),
  getAlbumAsync: jest.fn(() => Promise.resolve(null)),
  createAlbumAsync: jest.fn(() => Promise.resolve()),
  addAssetsToAlbumAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock @shopify/react-native-skia
const mockPath = {
  moveTo: jest.fn().mockReturnThis(),
  lineTo: jest.fn().mockReturnThis(),
  close: jest.fn().mockReturnThis(),
  addCircle: jest.fn().mockReturnThis(),
  cubicTo: jest.fn().mockReturnThis(),
};

jest.mock('@shopify/react-native-skia', () => ({
  Skia: {
    Path: { Make: jest.fn(() => ({ ...mockPath })) },
    Color: jest.fn((c) => c),
    Paint: jest.fn(() => ({
      setColor: jest.fn(),
      setStyle: jest.fn(),
      setStrokeWidth: jest.fn(),
      setStrokeCap: jest.fn(),
      setStrokeJoin: jest.fn(),
      setAntiAlias: jest.fn(),
      setBlendMode: jest.fn(),
    })),
    Data: { fromBase64: jest.fn() },
    Image: { MakeImageFromEncoded: jest.fn() },
    Surface: { MakeOffscreen: jest.fn() },
    XYWHRect: jest.fn((x, y, w, h) => ({ x, y, width: w, height: h })),
  },
  ClipOp: { Intersect: 0, Difference: 1 },
  ImageFormat: { PNG: 'png', JPEG: 'jpeg' },
}));
