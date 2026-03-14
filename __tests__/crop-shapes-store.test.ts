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

describe('crop shape options in store', () => {
  beforeEach(() => {
    useImageStore.getState().reset();
  });

  it('default crop options have shape: null', () => {
    const crop = useImageStore.getState().cropOptions;
    expect(crop.shape).toBeNull();
  });

  it('default crop options have no brushStrokes', () => {
    const crop = useImageStore.getState().cropOptions;
    expect(crop.brushStrokes).toBeUndefined();
  });

  it('sets shape via setCropOptions', () => {
    useImageStore.getState().setCropOptions({ shape: 'circle' });
    expect(useImageStore.getState().cropOptions.shape).toBe('circle');
  });

  it('sets all predefined shape types', () => {
    const shapes = ['circle', 'triangle', 'star', 'heart', 'hexagon'] as const;
    for (const shape of shapes) {
      useImageStore.getState().setCropOptions({ shape });
      expect(useImageStore.getState().cropOptions.shape).toBe(shape);
    }
  });

  it('sets brush shape with brush strokes', () => {
    const strokes = [
      [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }],
      [{ x: 0.5, y: 0.6 }, { x: 0.7, y: 0.8 }],
    ];
    useImageStore.getState().setCropOptions({ shape: 'brush', brushStrokes: strokes });
    const crop = useImageStore.getState().cropOptions;
    expect(crop.shape).toBe('brush');
    expect(crop.brushStrokes).toEqual(strokes);
    expect(crop.brushStrokes).toHaveLength(2);
  });

  it('clears shape back to null', () => {
    useImageStore.getState().setCropOptions({ shape: 'star' });
    useImageStore.getState().setCropOptions({ shape: null });
    expect(useImageStore.getState().cropOptions.shape).toBeNull();
  });

  it('clears brushStrokes when switching shapes', () => {
    const strokes = [[{ x: 0.1, y: 0.2 }]];
    useImageStore.getState().setCropOptions({ shape: 'brush', brushStrokes: strokes });
    useImageStore.getState().setCropOptions({ shape: 'circle', brushStrokes: undefined });
    const crop = useImageStore.getState().cropOptions;
    expect(crop.shape).toBe('circle');
    expect(crop.brushStrokes).toBeUndefined();
  });

  it('preserves other crop options when setting shape', () => {
    useImageStore.getState().setSourceImage(mockImage);
    useImageStore.getState().setCropOptions({ originX: 50, originY: 30 });
    useImageStore.getState().setCropOptions({ shape: 'heart' });
    const crop = useImageStore.getState().cropOptions;
    expect(crop.shape).toBe('heart');
    expect(crop.originX).toBe(50);
    expect(crop.originY).toBe(30);
    expect(crop.width).toBe(1920);
    expect(crop.height).toBe(1080);
  });

  it('reset clears shape and brushStrokes', () => {
    useImageStore.getState().setCropOptions({
      shape: 'brush',
      brushStrokes: [[{ x: 0.5, y: 0.5 }]],
    });
    useImageStore.getState().reset();
    const crop = useImageStore.getState().cropOptions;
    expect(crop.shape).toBeNull();
    expect(crop.brushStrokes).toBeUndefined();
  });

  it('setSourceImage resets shape to null', () => {
    useImageStore.getState().setCropOptions({ shape: 'star' });
    useImageStore.getState().setSourceImage(mockImage);
    expect(useImageStore.getState().cropOptions.shape).toBeNull();
  });
});

describe('rotate tool in store', () => {
  beforeEach(() => {
    useImageStore.getState().reset();
  });

  it('can set activeTool to rotate', () => {
    useImageStore.getState().setActiveTool('rotate');
    expect(useImageStore.getState().activeTool).toBe('rotate');
  });

  it('rotate tool uses cropOptions for rotation state', () => {
    useImageStore.getState().setActiveTool('rotate');
    useImageStore.getState().setRotation(90);
    expect(useImageStore.getState().cropOptions.rotation).toBe(90);
  });

  it('rotate tool uses cropOptions for flip state', () => {
    useImageStore.getState().setActiveTool('rotate');
    useImageStore.getState().toggleFlipH();
    useImageStore.getState().toggleFlipV();
    expect(useImageStore.getState().cropOptions.flipHorizontal).toBe(true);
    expect(useImageStore.getState().cropOptions.flipVertical).toBe(true);
  });
});
