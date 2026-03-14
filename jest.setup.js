// Mock native modules that aren't available in test environment

jest.mock('react-native-compressor', () => ({
  Image: { compress: jest.fn() },
  getImageMetaData: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg', PNG: 'png' },
  FlipType: { Horizontal: 'horizontal', Vertical: 'vertical' },
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
    open: () => ({
      readBytes: () => new Uint8Array(32),
      close: () => {},
    }),
  })),
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
