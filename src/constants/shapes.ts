import { Skia, SkPath } from '@shopify/react-native-skia';
import { ShapeType } from '@/src/types/image';

export interface ShapeDefinition {
  id: ShapeType;
  label: string;
  icon: string;
}

export const SHAPES: ShapeDefinition[] = [
  { id: 'circle', label: 'Circle', icon: 'circle' },
  { id: 'triangle', label: 'Triangle', icon: 'triangle' },
  { id: 'star', label: 'Star', icon: 'star' },
  { id: 'heart', label: 'Heart', icon: 'heart' },
  { id: 'hexagon', label: 'Hexagon', icon: 'hexagon' },
  { id: 'brush', label: 'Brush', icon: 'paintbrush' },
];

export function createShapePath(shape: ShapeType, size: number): SkPath {
  const path = Skia.Path.Make();
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  switch (shape) {
    case 'circle':
      path.addCircle(cx, cy, r);
      break;

    case 'triangle': {
      path.moveTo(cx, 0);
      path.lineTo(size, size);
      path.lineTo(0, size);
      path.close();
      break;
    }

    case 'star': {
      const points = 5;
      const outerR = r;
      const innerR = r * 0.382;
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const radius = i % 2 === 0 ? outerR : innerR;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      path.close();
      break;
    }

    case 'heart': {
      const w = size;
      const h = size;
      path.moveTo(w / 2, h * 0.25);
      path.cubicTo(w * 0.15, 0, 0, h * 0.35, w / 2, h);
      path.moveTo(w / 2, h * 0.25);
      path.cubicTo(w * 0.85, 0, w, h * 0.35, w / 2, h);
      path.close();
      break;
    }

    case 'hexagon': {
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 6;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      path.close();
      break;
    }
  }

  return path;
}

export function createBrushPath(
  strokes: { x: number; y: number }[][],
  width: number,
  height: number,
): SkPath {
  const path = Skia.Path.Make();
  for (const stroke of strokes) {
    if (stroke.length === 0) continue;
    path.moveTo(stroke[0].x * width, stroke[0].y * height);
    if (stroke.length === 1) {
      // Single dot — tiny line so stroke cap renders
      path.lineTo(stroke[0].x * width + 0.1, stroke[0].y * height);
      continue;
    }
    for (let i = 1; i < stroke.length; i++) {
      path.lineTo(stroke[i].x * width, stroke[i].y * height);
    }
  }
  return path;
}
