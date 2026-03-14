import { Platform } from 'react-native';
import {
  getConversionPath,
  getAvailableTargets,
  isConversionSupported,
} from '@/src/utils/conversion-matrix';
import { ImageFormat } from '@/src/types/formats';

// Default Platform.OS is 'ios' in jest-expo

describe('conversion-matrix', () => {
  describe('getAvailableTargets', () => {
    it('returns PNG for JPEG source', () => {
      const targets = getAvailableTargets(ImageFormat.JPEG);
      expect(targets).toContain(ImageFormat.PNG);
    });

    it('returns JPEG for PNG source', () => {
      const targets = getAvailableTargets(ImageFormat.PNG);
      expect(targets).toContain(ImageFormat.JPEG);
    });

    it('returns both PNG and JPEG for WebP source', () => {
      const targets = getAvailableTargets(ImageFormat.WEBP);
      expect(targets).toContain(ImageFormat.PNG);
      expect(targets).toContain(ImageFormat.JPEG);
    });

    it('returns JPEG and PNG for HEIC source', () => {
      const targets = getAvailableTargets(ImageFormat.HEIC);
      expect(targets).toContain(ImageFormat.JPEG);
      expect(targets).toContain(ImageFormat.PNG);
    });

    it('returns PNG for BMP source', () => {
      const targets = getAvailableTargets(ImageFormat.BMP);
      expect(targets).toContain(ImageFormat.PNG);
    });

    it('returns empty array for GIF (no conversions defined)', () => {
      const targets = getAvailableTargets(ImageFormat.GIF);
      expect(targets).toHaveLength(0);
    });

    it('does not include HEIC as a target (no library supports HEIC encoding)', () => {
      const targets = getAvailableTargets(ImageFormat.JPEG);
      expect(targets).not.toContain(ImageFormat.HEIC);
    });
  });

  describe('getConversionPath', () => {
    it('returns a path for JPEG → PNG', () => {
      const path = getConversionPath(ImageFormat.JPEG, ImageFormat.PNG);
      expect(path).not.toBeNull();
      expect(path!.library).toBe('expo-image-manipulator');
    });

    it('returns a path for HEIC → JPEG', () => {
      const path = getConversionPath(ImageFormat.HEIC, ImageFormat.JPEG);
      expect(path).not.toBeNull();
      expect(path!.library).toBe('expo-image-manipulator');
    });

    it('returns null for unsupported conversion (JPEG → JPEG)', () => {
      const path = getConversionPath(ImageFormat.JPEG, ImageFormat.JPEG);
      expect(path).toBeNull();
    });

    it('returns null for unsupported conversion (GIF → PNG)', () => {
      const path = getConversionPath(ImageFormat.GIF, ImageFormat.PNG);
      expect(path).toBeNull();
    });

    it('returns a path for AVIF → JPEG', () => {
      const path = getConversionPath(ImageFormat.AVIF, ImageFormat.JPEG);
      expect(path).not.toBeNull();
      expect(path!.phase).toBe(2);
    });
  });

  describe('isConversionSupported', () => {
    it('returns true for supported conversions', () => {
      expect(isConversionSupported(ImageFormat.JPEG, ImageFormat.PNG)).toBe(true);
      expect(isConversionSupported(ImageFormat.PNG, ImageFormat.JPEG)).toBe(true);
      expect(isConversionSupported(ImageFormat.HEIC, ImageFormat.JPEG)).toBe(true);
    });

    it('returns false for unsupported conversions', () => {
      expect(isConversionSupported(ImageFormat.JPEG, ImageFormat.JPEG)).toBe(false);
      expect(isConversionSupported(ImageFormat.GIF, ImageFormat.PNG)).toBe(false);
    });

    it('matches getConversionPath result', () => {
      const supported = isConversionSupported(ImageFormat.JPEG, ImageFormat.PNG);
      const path = getConversionPath(ImageFormat.JPEG, ImageFormat.PNG);
      expect(supported).toBe(path !== null);
    });
  });
});
