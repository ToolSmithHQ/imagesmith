import { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { ImageAsset } from '@/src/types/image';

interface CropOverlayProps {
  image: ImageAsset;
  aspectRatio: number | null;
  onCropChange: (crop: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  }) => void;
}

const HANDLE_LEN = 22;
const HANDLE_THICK = 3;
const CORNER_HIT = 44;
const EDGE_HIT = 30;
const MIN_CROP = 40;
const INITIAL_CROP_RATIO = 0.85;

// Handles: 0=none 1=TL 2=TR 3=BL 4=BR 5=move 6=left 7=right 8=top 9=bottom

export function CropOverlay({
  image,
  aspectRatio,
  onCropChange,
}: CropOverlayProps) {
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Image display rect (container coords)
  const imgX = useSharedValue(0);
  const imgY = useSharedValue(0);
  const imgW = useSharedValue(0);
  const imgH = useSharedValue(0);
  const imgScale = useSharedValue(1);

  // Crop rect (container coords)
  const cx = useSharedValue(0);
  const cy = useSharedValue(0);
  const cw = useSharedValue(0);
  const ch = useSharedValue(0);

  // Gesture start context
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);
  const sw = useSharedValue(0);
  const sh = useSharedValue(0);
  const activeHandle = useSharedValue(0);

  const ar = useSharedValue(0);
  useEffect(() => {
    ar.value = aspectRatio ?? 0;
  }, [aspectRatio]);

  const reportCrop = useCallback(
    (ox: number, oy: number, w: number, h: number) => {
      onCropChange({
        originX: Math.max(0, Math.round(ox)),
        originY: Math.max(0, Math.round(oy)),
        width: Math.max(1, Math.round(w)),
        height: Math.max(1, Math.round(h)),
      });
    },
    [onCropChange],
  );

  const computeLayout = useCallback(
    (containerW: number, containerH: number) => {
      const s = Math.min(containerW / image.width, containerH / image.height);
      const dw = image.width * s;
      const dh = image.height * s;
      const ox = (containerW - dw) / 2;
      const oy = (containerH - dh) / 2;

      imgX.value = ox;
      imgY.value = oy;
      imgW.value = dw;
      imgH.value = dh;
      imgScale.value = s;

      if (aspectRatio !== null && aspectRatio > 0) {
        let cropW = dw;
        let cropH = dw / aspectRatio;
        if (cropH > dh) {
          cropH = dh;
          cropW = dh * aspectRatio;
        }
        cx.value = ox + (dw - cropW) / 2;
        cy.value = oy + (dh - cropH) / 2;
        cw.value = cropW;
        ch.value = cropH;
        reportCrop(
          (dw - cropW) / 2 / s,
          (dh - cropH) / 2 / s,
          cropW / s,
          cropH / s,
        );
      } else {
        // Free mode: start at 85% centered so edges are visible and draggable
        const cropW = dw * INITIAL_CROP_RATIO;
        const cropH = dh * INITIAL_CROP_RATIO;
        cx.value = ox + (dw - cropW) / 2;
        cy.value = oy + (dh - cropH) / 2;
        cw.value = cropW;
        ch.value = cropH;
        reportCrop(
          (dw - cropW) / 2 / s,
          (dh - cropH) / 2 / s,
          cropW / s,
          cropH / s,
        );
      }
    },
    [image, aspectRatio],
  );

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      setContainerSize({ w: width, h: height });
      computeLayout(width, height);
    },
    [computeLayout],
  );

  // Adjust crop when aspect ratio changes
  useEffect(() => {
    if (containerSize.w === 0) return;

    if (aspectRatio === null) {
      // Switching to free: set to 85% crop
      const cropW = imgW.value * INITIAL_CROP_RATIO;
      const cropH = imgH.value * INITIAL_CROP_RATIO;
      cx.value = imgX.value + (imgW.value - cropW) / 2;
      cy.value = imgY.value + (imgH.value - cropH) / 2;
      cw.value = cropW;
      ch.value = cropH;
      reportCrop(
        (imgW.value - cropW) / 2 / imgScale.value,
        (imgH.value - cropH) / 2 / imgScale.value,
        cropW / imgScale.value,
        cropH / imgScale.value,
      );
      return;
    }

    if (aspectRatio <= 0) return;

    const curCx = cx.value + cw.value / 2;
    const curCy = cy.value + ch.value / 2;

    let nw = cw.value;
    let nh = nw / aspectRatio;
    if (nh > imgH.value) {
      nh = imgH.value;
      nw = nh * aspectRatio;
    }
    if (nw > imgW.value) {
      nw = imgW.value;
      nh = nw / aspectRatio;
    }

    let nx = curCx - nw / 2;
    let ny = curCy - nh / 2;
    nx = Math.max(imgX.value, Math.min(nx, imgX.value + imgW.value - nw));
    ny = Math.max(imgY.value, Math.min(ny, imgY.value + imgH.value - nh));

    cx.value = nx;
    cy.value = ny;
    cw.value = nw;
    ch.value = nh;

    reportCrop(
      (nx - imgX.value) / imgScale.value,
      (ny - imgY.value) / imgScale.value,
      nw / imgScale.value,
      nh / imgScale.value,
    );
  }, [aspectRatio]);

  const pan = Gesture.Pan()
    .minDistance(4)
    .onStart((e) => {
      'worklet';
      sx.value = cx.value;
      sy.value = cy.value;
      sw.value = cw.value;
      sh.value = ch.value;

      const ex = e.x;
      const ey = e.y;
      const x1 = cx.value;
      const y1 = cy.value;
      const x2 = cx.value + cw.value;
      const y2 = cy.value + ch.value;

      // Check corners first (highest priority)
      const d1 = Math.sqrt((ex - x1) * (ex - x1) + (ey - y1) * (ey - y1));
      const d2 = Math.sqrt((ex - x2) * (ex - x2) + (ey - y1) * (ey - y1));
      const d3 = Math.sqrt((ex - x1) * (ex - x1) + (ey - y2) * (ey - y2));
      const d4 = Math.sqrt((ex - x2) * (ex - x2) + (ey - y2) * (ey - y2));

      const dMin = Math.min(d1, d2, d3, d4);

      if (dMin < CORNER_HIT) {
        if (dMin === d1) activeHandle.value = 1;
        else if (dMin === d2) activeHandle.value = 2;
        else if (dMin === d3) activeHandle.value = 3;
        else activeHandle.value = 4;
        return;
      }

      // Check edges (second priority)
      const nearLeft = Math.abs(ex - x1) < EDGE_HIT && ey > y1 + CORNER_HIT && ey < y2 - CORNER_HIT;
      const nearRight = Math.abs(ex - x2) < EDGE_HIT && ey > y1 + CORNER_HIT && ey < y2 - CORNER_HIT;
      const nearTop = Math.abs(ey - y1) < EDGE_HIT && ex > x1 + CORNER_HIT && ex < x2 - CORNER_HIT;
      const nearBottom = Math.abs(ey - y2) < EDGE_HIT && ex > x1 + CORNER_HIT && ex < x2 - CORNER_HIT;

      if (nearLeft) activeHandle.value = 6;
      else if (nearRight) activeHandle.value = 7;
      else if (nearTop) activeHandle.value = 8;
      else if (nearBottom) activeHandle.value = 9;
      else if (ex >= x1 && ex <= x2 && ey >= y1 && ey <= y2) {
        // Inside crop area = move
        activeHandle.value = 5;
      } else {
        activeHandle.value = 0;
      }
    })
    .onUpdate((e) => {
      'worklet';
      const h = activeHandle.value;
      if (h === 0) return;

      const ratio = ar.value;
      const bx1 = imgX.value;
      const by1 = imgY.value;
      const bx2 = imgX.value + imgW.value;
      const by2 = imgY.value + imgH.value;

      if (h === 5) {
        let nx = sx.value + e.translationX;
        let ny = sy.value + e.translationY;
        nx = Math.max(bx1, Math.min(nx, bx2 - sw.value));
        ny = Math.max(by1, Math.min(ny, by2 - sh.value));
        cx.value = nx;
        cy.value = ny;
        // Report on every update for real-time feedback
        runOnJS(reportCrop)(
          (nx - imgX.value) / imgScale.value,
          (ny - imgY.value) / imgScale.value,
          sw.value / imgScale.value,
          sh.value / imgScale.value,
        );
        return;
      }

      let nx = sx.value;
      let ny = sy.value;
      let nw = sw.value;
      let nh = sh.value;

      // Corner drags
      if (h === 1) {
        nx += e.translationX;
        ny += e.translationY;
        nw -= e.translationX;
        nh -= e.translationY;
      } else if (h === 2) {
        ny += e.translationY;
        nw += e.translationX;
        nh -= e.translationY;
      } else if (h === 3) {
        nx += e.translationX;
        nw -= e.translationX;
        nh += e.translationY;
      } else if (h === 4) {
        nw += e.translationX;
        nh += e.translationY;
      }
      // Edge drags
      else if (h === 6) {
        nx += e.translationX;
        nw -= e.translationX;
      } else if (h === 7) {
        nw += e.translationX;
      } else if (h === 8) {
        ny += e.translationY;
        nh -= e.translationY;
      } else if (h === 9) {
        nh += e.translationY;
      }

      // Aspect ratio constraint
      if (ratio > 0) {
        if (h === 6 || h === 7) {
          // Horizontal edge drag: adjust height from width, center vertically
          const centerY = ny + nh / 2;
          nh = nw / ratio;
          ny = centerY - nh / 2;
        } else if (h === 8 || h === 9) {
          // Vertical edge drag: adjust width from height, center horizontally
          const centerX = nx + nw / 2;
          nw = nh * ratio;
          nx = centerX - nw / 2;
        } else {
          // Corner drag: adjust height from width
          const targetH = nw / ratio;
          if (h === 1 || h === 2) {
            ny = ny + nh - targetH;
          }
          nh = targetH;
        }
      }

      // Min size
      if (nw < MIN_CROP) {
        nw = MIN_CROP;
        if (h === 1 || h === 3 || h === 6) nx = sx.value + sw.value - MIN_CROP;
      }
      if (nh < MIN_CROP) {
        nh = MIN_CROP;
        if (h === 1 || h === 2 || h === 8) ny = sy.value + sh.value - MIN_CROP;
      }

      // Clamp to image bounds
      if (nx < bx1) {
        nw -= bx1 - nx;
        nx = bx1;
      }
      if (ny < by1) {
        nh -= by1 - ny;
        ny = by1;
      }
      if (nx + nw > bx2) nw = bx2 - nx;
      if (ny + nh > by2) nh = by2 - ny;

      cx.value = nx;
      cy.value = ny;
      cw.value = Math.max(MIN_CROP, nw);
      ch.value = Math.max(MIN_CROP, nh);

      // Report on every update for real-time feedback
      runOnJS(reportCrop)(
        (nx - imgX.value) / imgScale.value,
        (ny - imgY.value) / imgScale.value,
        Math.max(MIN_CROP, nw) / imgScale.value,
        Math.max(MIN_CROP, nh) / imgScale.value,
      );
    })
    .onEnd(() => {
      'worklet';
      runOnJS(reportCrop)(
        (cx.value - imgX.value) / imgScale.value,
        (cy.value - imgY.value) / imgScale.value,
        cw.value / imgScale.value,
        ch.value / imgScale.value,
      );
    });

  // --- Animated styles ---

  // Dark overlays
  const topOverlay = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: Math.max(0, cy.value),
  }));

  const bottomOverlay = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: cy.value + ch.value,
    left: 0,
    right: 0,
    bottom: 0,
  }));

  const leftOverlay = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: cy.value,
    left: 0,
    width: Math.max(0, cx.value),
    height: ch.value,
  }));

  const rightOverlay = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: cy.value,
    left: cx.value + cw.value,
    right: 0,
    height: ch.value,
  }));

  // Crop border + grid container
  const cropAreaStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: cy.value,
    left: cx.value,
    width: cw.value,
    height: ch.value,
  }));

  // Corner handles
  const tlStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: cy.value,
    left: cx.value,
    width: HANDLE_LEN,
    height: HANDLE_LEN,
  }));

  const trStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: cy.value,
    left: cx.value + cw.value - HANDLE_LEN,
    width: HANDLE_LEN,
    height: HANDLE_LEN,
  }));

  const blStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: cy.value + ch.value - HANDLE_LEN,
    left: cx.value,
    width: HANDLE_LEN,
    height: HANDLE_LEN,
  }));

  const brStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: cy.value + ch.value - HANDLE_LEN,
    left: cx.value + cw.value - HANDLE_LEN,
    width: HANDLE_LEN,
    height: HANDLE_LEN,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={styles.container} onLayout={onLayout}>
        <Image
          source={{ uri: image.uri }}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
        />

        {/* Dark overlays */}
        <Animated.View
          style={[topOverlay, styles.overlay]}
          pointerEvents="none"
        />
        <Animated.View
          style={[bottomOverlay, styles.overlay]}
          pointerEvents="none"
        />
        <Animated.View
          style={[leftOverlay, styles.overlay]}
          pointerEvents="none"
        />
        <Animated.View
          style={[rightOverlay, styles.overlay]}
          pointerEvents="none"
        />

        {/* Crop border + grid */}
        <Animated.View
          style={[cropAreaStyle, styles.cropBorder]}
          pointerEvents="none"
        >
          <View style={[styles.gridLineH, { top: '33.33%' }]} />
          <View style={[styles.gridLineH, { top: '66.66%' }]} />
          <View style={[styles.gridLineV, { left: '33.33%' }]} />
          <View style={[styles.gridLineV, { left: '66.66%' }]} />
        </Animated.View>

        {/* Corner handles (L-brackets) */}
        <Animated.View
          style={[tlStyle, styles.handleTL]}
          pointerEvents="none"
        />
        <Animated.View
          style={[trStyle, styles.handleTR]}
          pointerEvents="none"
        />
        <Animated.View
          style={[blStyle, styles.handleBL]}
          pointerEvents="none"
        />
        <Animated.View
          style={[brStyle, styles.handleBR]}
          pointerEvents="none"
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  cropBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  handleTL: {
    borderTopWidth: HANDLE_THICK,
    borderLeftWidth: HANDLE_THICK,
    borderColor: 'white',
  },
  handleTR: {
    borderTopWidth: HANDLE_THICK,
    borderRightWidth: HANDLE_THICK,
    borderColor: 'white',
  },
  handleBL: {
    borderBottomWidth: HANDLE_THICK,
    borderLeftWidth: HANDLE_THICK,
    borderColor: 'white',
  },
  handleBR: {
    borderBottomWidth: HANDLE_THICK,
    borderRightWidth: HANDLE_THICK,
    borderColor: 'white',
  },
});
