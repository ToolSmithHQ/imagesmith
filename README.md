# Image Smith

Privacy-friendly image tools for iOS and Android. All processing happens on your device — nothing is uploaded.

## Features

- **Format Conversion** — Convert between JPEG, PNG, WebP, HEIC, BMP, TIFF, and AVIF
- **Crop** — Rectangular crop with aspect ratio presets (Free, 1:1, 4:3, 3:2, 16:9)
- **Shape Crop** — Crop to circle, triangle, star, heart, or hexagon shapes
- **Brush Crop** — Freehand paint the area to keep, everything else becomes transparent
- **Rotate / Flip** — Rotate 90/180/270 degrees, flip horizontal or vertical
- **Lossless JPEG Operations** — Rotate and crop JPEG without quality loss (DCT block rearrangement)
- **Resize** — Custom dimensions with aspect ratio lock (Lanczos, bilinear, nearest-neighbor)
- **Compress** — Reduce file size with adjustable quality
- **Strip Metadata** — Remove EXIF data (GPS, camera info, timestamps) — binary strip for JPEG (no re-encode)
- **Editor** — Multi-tool editor: apply multiple operations in sequence with undo, then export as JPEG, PNG, or WebP
- **Quality Control** — Adjustable quality slider for lossy formats
- **Conversion History** — View past operations with thumbnails and stats
- **Dark Mode** — System, light, or dark theme
- **Haptic Feedback** — Configurable tactile feedback

### Supported Conversions

| Format | Decode | Encode | Notes |
|--------|--------|--------|-------|
| JPEG | iOS + Android | iOS + Android | Lossless rotate/crop/EXIF strip via libjpeg-turbo |
| PNG | iOS + Android | iOS + Android | Lossless, compression level control |
| WebP | iOS + Android | iOS + Android | Lossy + lossless modes |
| HEIC | iOS + Android | iOS + Android | iOS: ImageIO, Android: HeifWriter |
| BMP | iOS + Android | iOS + Android | Built-in codec, no external dep |
| TIFF | iOS + Android | iOS + Android | DEFLATE compression |
| AVIF | Not yet supported | Not yet supported | AVIF codec not yet cross-compiled for mobile |

> **Note:** PNG, BMP, and TIFF are lossless formats — rotate, crop, and resize operations on these formats produce zero quality loss.

### Android: HEIC/AVIF files from Gallery

When picking HEIC or AVIF images via **"Choose from Gallery"** on Android, the OS may auto-convert them to JPEG before handing the file to the app. This is Android's `MediaStore` / `ContentResolver` behavior — it transcodes HEIC/AVIF to JPEG for compatibility with apps that don't support these formats. The file you receive is already JPEG, not the original HEIC.

To work with the actual HEIC/AVIF file, use **"Browse Files"** (document picker) instead — it returns the raw file without conversion.

## Tech Stack

- **Expo SDK 54**
- **React Native 0.81** + React 19 + React Compiler
- **expo-router** — file-based navigation
- **Zustand** — state management with AsyncStorage persistence
- **@toolsmith/imagecore-native** — C/C++ image processing via JSI (libjpeg-turbo, libpng, libwebp, libtiff + platform APIs for HEIC)
- **@shopify/react-native-skia** — GPU-accelerated shape/brush crop with path clipping

## Getting Started

### Prerequisites

- Node.js 18+
- Android Studio (for Android) or Xcode (for iOS)

### Install

```bash
npm install
```

### Run (Development Build)

This app uses native modules and requires a development build (not Expo Go).

```bash
npx expo prebuild

npx expo run:android

npx expo run:ios
```

### Build Standalone APK

```bash
cd android && ./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Build for iOS

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

## Tests

### Unit Tests (Jest)

```bash
npx jest
```

Tests TypeScript logic: format detection, conversion matrix, stores, error handling. (86 tests)

### E2E Tests (Maestro)

Requires [Maestro CLI](https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli) and a running Android emulator or iOS simulator with the app installed.

```bash
# Install Maestro
brew tap mobile-dev-inc/tap
brew install mobile-dev-inc/tap/maestro

# Push sample images to Android emulator
adb push tests/samples/* /sdcard/Download/

# Run all conversion tests (42 tests — all 7 format pairs)
maestro test .maestro/convert/

# Run all operation tests (35 tests — crop/resize/compress/rotate/metadata for each format)
maestro test .maestro/operations/

# Run a single test
maestro test .maestro/convert/01_jpeg_to_png.yaml

# Run everything
maestro test .maestro/convert/ .maestro/operations/
```

> **Note:** AVIF tests will fail on both iOS and Android (AVIF codec not yet cross-compiled for mobile). All other format combinations should pass.

## Project Structure

```
app/                          # Screens (expo-router)
  (tabs)/                     # Tab navigation: Home, History, Settings
  convert/                    # Conversion flow: Pick, Processing, Result
  crop/                       # Crop flow (rectangular + shape + brush)
  rotate/                     # Rotate / Flip flow
  resize/                     # Resize flow
  compress/                   # Compress flow
  metadata/                   # Metadata view / strip flow
  editor/                     # Multi-tool editor
src/
  services/                   # Processors (crop, resize, compress, convert, metadata)
    imagecore-bridge.ts       # File URI <-> ArrayBuffer bridge for imagecore
  utils/                      # Format detection, conversion matrix, error handling
  hooks/                      # Image picker, tool processing orchestration
  stores/                     # Zustand stores (image, history, settings)
  components/                 # UI components (crop overlay, rotate config, format picker, etc.)
  constants/                  # Format definitions, tool definitions, shape definitions, theme
  types/                      # TypeScript types
```
