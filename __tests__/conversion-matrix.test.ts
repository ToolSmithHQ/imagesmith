import {
  getAvailableTargets,
  isConversionSupported,
} from '@/src/utils/conversion-matrix';
import { ImageFormat } from '@/src/types/formats';

describe('conversion-matrix', () => {
  describe('getAvailableTargets', () => {
    it('returns all other formats for JPEG source', () => {
      const targets = getAvailableTargets(ImageFormat.JPEG);
      expect(targets).toContain(ImageFormat.PNG);
      expect(targets).toContain(ImageFormat.WEBP);
      expect(targets).toContain(ImageFormat.HEIC);
      expect(targets).toContain(ImageFormat.AVIF);
      expect(targets).toContain(ImageFormat.TIFF);
      expect(targets).toContain(ImageFormat.BMP);
      expect(targets).not.toContain(ImageFormat.JPEG);
    });

    it('returns all other formats for PNG source', () => {
      const targets = getAvailableTargets(ImageFormat.PNG);
      expect(targets).toContain(ImageFormat.JPEG);
      expect(targets).not.toContain(ImageFormat.PNG);
    });

    it('includes HEIC and AVIF as targets', () => {
      const targets = getAvailableTargets(ImageFormat.JPEG);
      expect(targets).toContain(ImageFormat.HEIC);
      expect(targets).toContain(ImageFormat.AVIF);
    });

    it('returns empty for GIF (not in supported list)', () => {
      const targets = getAvailableTargets(ImageFormat.GIF);
      expect(targets).toHaveLength(0);
    });
  });

  describe('isConversionSupported', () => {
    it('returns true for all supported format pairs', () => {
      expect(isConversionSupported(ImageFormat.JPEG, ImageFormat.PNG)).toBe(true);
      expect(isConversionSupported(ImageFormat.PNG, ImageFormat.JPEG)).toBe(true);
      expect(isConversionSupported(ImageFormat.HEIC, ImageFormat.JPEG)).toBe(true);
      expect(isConversionSupported(ImageFormat.JPEG, ImageFormat.AVIF)).toBe(true);
      expect(isConversionSupported(ImageFormat.BMP, ImageFormat.TIFF)).toBe(true);
    });

    it('returns false for self-conversion', () => {
      expect(isConversionSupported(ImageFormat.JPEG, ImageFormat.JPEG)).toBe(false);
    });

    it('returns false for GIF', () => {
      expect(isConversionSupported(ImageFormat.GIF, ImageFormat.PNG)).toBe(false);
    });
  });
});
