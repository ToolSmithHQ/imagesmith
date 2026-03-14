import { SHAPES, createShapePath, createBrushPath } from '@/src/constants/shapes';
import { Skia } from '@shopify/react-native-skia';

describe('SHAPES constant', () => {
  it('contains all 6 shape definitions', () => {
    expect(SHAPES).toHaveLength(6);
  });

  it('has correct ids', () => {
    const ids = SHAPES.map((s) => s.id);
    expect(ids).toEqual(['circle', 'triangle', 'star', 'heart', 'hexagon', 'brush']);
  });

  it('each shape has id, label, and icon', () => {
    for (const shape of SHAPES) {
      expect(shape.id).toBeTruthy();
      expect(shape.label).toBeTruthy();
      expect(shape.icon).toBeTruthy();
    }
  });
});

describe('createShapePath', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a circle path', () => {
    const path = createShapePath('circle', 200);
    expect(path.addCircle).toHaveBeenCalledWith(100, 100, 100);
  });

  it('creates a triangle path with 3 points', () => {
    const path = createShapePath('triangle', 200);
    expect(path.moveTo).toHaveBeenCalledWith(100, 0);
    expect(path.lineTo).toHaveBeenCalledWith(200, 200);
    expect(path.lineTo).toHaveBeenCalledWith(0, 200);
    expect(path.close).toHaveBeenCalled();
  });

  it('creates a star path with 10 points (5 outer + 5 inner)', () => {
    const path = createShapePath('star', 200);
    expect(path.moveTo).toHaveBeenCalledTimes(1);
    expect(path.lineTo).toHaveBeenCalledTimes(9);
    expect(path.close).toHaveBeenCalled();
  });

  it('creates a heart path with cubic curves', () => {
    const path = createShapePath('heart', 200);
    expect(path.cubicTo).toHaveBeenCalledTimes(2);
    expect(path.close).toHaveBeenCalled();
  });

  it('creates a hexagon path with 6 points', () => {
    const path = createShapePath('hexagon', 200);
    expect(path.moveTo).toHaveBeenCalledTimes(1);
    expect(path.lineTo).toHaveBeenCalledTimes(5);
    expect(path.close).toHaveBeenCalled();
  });

  it('returns a path object for each shape type', () => {
    const shapes = ['circle', 'triangle', 'star', 'heart', 'hexagon'] as const;
    for (const shape of shapes) {
      jest.clearAllMocks();
      const path = createShapePath(shape, 100);
      expect(path).toBeDefined();
      expect(Skia.Path.Make).toHaveBeenCalled();
    }
  });
});

describe('createBrushPath', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates path from single stroke with multiple points', () => {
    const strokes = [[
      { x: 0.1, y: 0.2 },
      { x: 0.3, y: 0.4 },
      { x: 0.5, y: 0.6 },
    ]];
    const path = createBrushPath(strokes, 1000, 800);
    expect(path.moveTo).toHaveBeenCalledWith(100, 160);
    expect(path.lineTo).toHaveBeenCalledWith(300, 320);
    expect(path.lineTo).toHaveBeenCalledWith(500, 480);
  });

  it('creates path from multiple strokes', () => {
    const strokes = [
      [{ x: 0.1, y: 0.1 }, { x: 0.2, y: 0.2 }],
      [{ x: 0.5, y: 0.5 }, { x: 0.6, y: 0.6 }],
    ];
    const path = createBrushPath(strokes, 100, 100);
    expect(path.moveTo).toHaveBeenCalledTimes(2);
    expect(path.lineTo).toHaveBeenCalledTimes(2);
  });

  it('handles single-point stroke as a tiny line for stroke cap rendering', () => {
    const strokes = [[{ x: 0.5, y: 0.5 }]];
    const path = createBrushPath(strokes, 200, 200);
    expect(path.moveTo).toHaveBeenCalledWith(100, 100);
    expect(path.lineTo).toHaveBeenCalledWith(100.1, 100);
  });

  it('skips empty strokes', () => {
    const strokes = [[], [{ x: 0.1, y: 0.1 }, { x: 0.2, y: 0.2 }]];
    const path = createBrushPath(strokes, 100, 100);
    expect(path.moveTo).toHaveBeenCalledTimes(1);
  });

  it('returns empty path for empty strokes array', () => {
    const path = createBrushPath([], 100, 100);
    expect(path.moveTo).not.toHaveBeenCalled();
    expect(path.lineTo).not.toHaveBeenCalled();
  });

  it('scales coordinates to image dimensions', () => {
    const strokes = [[{ x: 0.5, y: 0.5 }, { x: 1.0, y: 1.0 }]];
    const path = createBrushPath(strokes, 500, 300);
    expect(path.moveTo).toHaveBeenCalledWith(250, 150);
    expect(path.lineTo).toHaveBeenCalledWith(500, 300);
  });
});
