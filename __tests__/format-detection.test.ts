import { detectFormat, detectFromExtension } from '@/src/utils/format-detection';
import { ImageFormat } from '@/src/types/formats';

describe('detectFormat / detectFromExtension', () => {
  // JPEG
  it('detects .jpg as JPEG', () => {
    expect(detectFormat('file:///photos/image.jpg')).toBe(ImageFormat.JPEG);
  });

  it('detects .jpeg as JPEG', () => {
    expect(detectFormat('file:///photos/image.jpeg')).toBe(ImageFormat.JPEG);
  });

  // PNG
  it('detects .png as PNG', () => {
    expect(detectFormat('file:///photos/image.png')).toBe(ImageFormat.PNG);
  });

  // WebP
  it('detects .webp as WebP', () => {
    expect(detectFormat('file:///photos/image.webp')).toBe(ImageFormat.WEBP);
  });

  // HEIC
  it('detects .heic as HEIC', () => {
    expect(detectFormat('file:///photos/image.heic')).toBe(ImageFormat.HEIC);
  });

  it('detects .heif as HEIC', () => {
    expect(detectFormat('file:///photos/image.heif')).toBe(ImageFormat.HEIC);
  });

  // BMP
  it('detects .bmp as BMP', () => {
    expect(detectFormat('file:///photos/image.bmp')).toBe(ImageFormat.BMP);
  });

  // TIFF
  it('detects .tiff as TIFF', () => {
    expect(detectFormat('file:///photos/image.tiff')).toBe(ImageFormat.TIFF);
  });

  it('detects .tif as TIFF', () => {
    expect(detectFormat('file:///photos/image.tif')).toBe(ImageFormat.TIFF);
  });

  // AVIF
  it('detects .avif as AVIF', () => {
    expect(detectFormat('file:///photos/image.avif')).toBe(ImageFormat.AVIF);
  });

  // GIF
  it('detects .gif as GIF', () => {
    expect(detectFormat('file:///photos/image.gif')).toBe(ImageFormat.GIF);
  });

  // Edge cases
  it('returns null for unknown extension', () => {
    expect(detectFormat('file:///photos/image.xyz')).toBeNull();
  });

  it('returns null for no extension', () => {
    expect(detectFormat('file:///photos/image')).toBeNull();
  });

  it('strips query parameters before detection', () => {
    expect(detectFormat('file:///photos/image.jpg?width=100&height=100')).toBe(
      ImageFormat.JPEG,
    );
  });

  it('is case insensitive', () => {
    expect(detectFormat('file:///photos/IMAGE.JPG')).toBe(ImageFormat.JPEG);
    expect(detectFormat('file:///photos/IMAGE.PNG')).toBe(ImageFormat.PNG);
    expect(detectFormat('file:///photos/IMAGE.WEBP')).toBe(ImageFormat.WEBP);
  });

  it('handles URIs with paths containing dots', () => {
    expect(detectFormat('file:///my.photos/vacation/image.png')).toBe(
      ImageFormat.PNG,
    );
  });

  it('detectFromExtension is the same as detectFormat', () => {
    const uri = 'file:///photos/test.jpg';
    expect(detectFromExtension(uri)).toBe(detectFormat(uri));
  });
});
