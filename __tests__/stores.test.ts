import { useImageStore } from '@/src/stores/use-image-store';
import { ImageFormat } from '@/src/types/formats';
import { ImageAsset } from '@/src/types/image';

const mockImage: ImageAsset = {
  uri: 'file:///mock/image.jpg',
  fileName: 'image.jpg',
  format: ImageFormat.JPEG,
  width: 1920,
  height: 1080,
  fileSize: 2048000,
  mimeType: 'image/jpeg',
};

describe('useImageStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useImageStore.getState().reset();
  });

  it('starts with null source image', () => {
    expect(useImageStore.getState().sourceImage).toBeNull();
  });

  it('starts with convert as active tool', () => {
    expect(useImageStore.getState().activeTool).toBe('convert');
  });

  describe('setSourceImage', () => {
    it('sets the source image', () => {
      useImageStore.getState().setSourceImage(mockImage);
      expect(useImageStore.getState().sourceImage).toEqual(mockImage);
    });

    it('sets processing state to configuring', () => {
      useImageStore.getState().setSourceImage(mockImage);
      expect(useImageStore.getState().processingState.status).toBe('configuring');
    });

    it('clears previous result', () => {
      useImageStore.getState().setSourceImage(mockImage);
      expect(useImageStore.getState().currentResult).toBeNull();
    });

    it('initializes crop options with image dimensions', () => {
      useImageStore.getState().setSourceImage(mockImage);
      const crop = useImageStore.getState().cropOptions;
      expect(crop.width).toBe(1920);
      expect(crop.height).toBe(1080);
      expect(crop.originX).toBe(0);
      expect(crop.originY).toBe(0);
    });

    it('initializes resize options with image dimensions', () => {
      useImageStore.getState().setSourceImage(mockImage);
      const resize = useImageStore.getState().resizeOptions;
      expect(resize.width).toBe(1920);
      expect(resize.height).toBe(1080);
      expect(resize.lockAspectRatio).toBe(true);
    });
  });

  describe('setActiveTool', () => {
    it('changes the active tool', () => {
      useImageStore.getState().setActiveTool('crop');
      expect(useImageStore.getState().activeTool).toBe('crop');
    });
  });

  describe('conversion options', () => {
    it('sets target format', () => {
      useImageStore.getState().setTargetFormat(ImageFormat.PNG);
      expect(useImageStore.getState().conversionOptions.targetFormat).toBe(
        ImageFormat.PNG,
      );
    });

    it('sets quality', () => {
      useImageStore.getState().setQuality(0.5);
      expect(useImageStore.getState().conversionOptions.quality).toBe(0.5);
    });

    it('sets preserveExif', () => {
      useImageStore.getState().setPreserveExif(false);
      expect(useImageStore.getState().conversionOptions.preserveExif).toBe(false);
    });
  });

  describe('crop options', () => {
    it('sets crop region', () => {
      useImageStore.getState().setCropOptions({ originX: 100, originY: 50 });
      const crop = useImageStore.getState().cropOptions;
      expect(crop.originX).toBe(100);
      expect(crop.originY).toBe(50);
    });

    it('sets rotation to any angle', () => {
      useImageStore.getState().setRotation(45);
      expect(useImageStore.getState().cropOptions.rotation).toBe(45);
    });

    it('toggles flipH', () => {
      expect(useImageStore.getState().cropOptions.flipHorizontal).toBe(false);
      useImageStore.getState().toggleFlipH();
      expect(useImageStore.getState().cropOptions.flipHorizontal).toBe(true);
      useImageStore.getState().toggleFlipH();
      expect(useImageStore.getState().cropOptions.flipHorizontal).toBe(false);
    });

    it('toggles flipV', () => {
      expect(useImageStore.getState().cropOptions.flipVertical).toBe(false);
      useImageStore.getState().toggleFlipV();
      expect(useImageStore.getState().cropOptions.flipVertical).toBe(true);
    });
  });

  describe('compress options', () => {
    it('sets compress quality', () => {
      useImageStore.getState().setCompressQuality(0.3);
      expect(useImageStore.getState().compressOptions.quality).toBe(0.3);
    });
  });

  describe('metadata options', () => {
    it('sets metadata action', () => {
      useImageStore.getState().setMetadataAction('strip');
      expect(useImageStore.getState().metadataOptions.action).toBe('strip');
    });
  });

  describe('reset', () => {
    it('resets all state to defaults', () => {
      useImageStore.getState().setSourceImage(mockImage);
      useImageStore.getState().setActiveTool('crop');
      useImageStore.getState().setRotation(90);
      useImageStore.getState().reset();

      const state = useImageStore.getState();
      expect(state.sourceImage).toBeNull();
      // activeTool is intentionally NOT reset (tool screen persists)
      expect(state.cropOptions.rotation).toBe(0);
      expect(state.processingState.status).toBe('idle');
      expect(state.currentResult).toBeNull();
    });
  });
});
