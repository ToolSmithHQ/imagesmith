# Image Smith

Privacy-friendly image tools for iOS and Android. All processing happens on your device — nothing is uploaded.

## Features

- **Format Conversion** — Convert between JPEG, PNG, WebP, HEIC, BMP, TIFF, and AVIF
- **Crop** — Rectangular crop with aspect ratio presets (Free, 1:1, 4:3, 3:2, 16:9)
- **Shape Crop** — Crop to circle, triangle, star, heart, or hexagon shapes
- **Brush Crop** — Freehand paint the area to keep, everything else becomes transparent
- **Rotate / Flip** — Rotate by any angle, flip horizontal or vertical
- **Resize** — Custom dimensions with aspect ratio lock
- **Compress** — Reduce file size with adjustable quality
- **Strip Metadata** — Remove EXIF data (GPS, camera info, timestamps)
- **Editor** — Multi-tool editor: apply multiple operations in sequence with undo, then export as JPEG, PNG, or WebP
- **Quality Control** — Adjustable quality slider for lossy formats
- **Conversion History** — View past operations with thumbnails and stats
- **Dark Mode** — System, light, or dark theme
- **Haptic Feedback** — Configurable tactile feedback

### Supported Conversions

| Source | Targets | Platform |
|--------|---------|----------|
| JPEG | PNG, WebP | iOS + Android |
| PNG | JPEG, WebP | iOS + Android |
| WebP | PNG, JPEG | iOS + Android |
| HEIC | JPEG, PNG | iOS + Android |
| BMP | PNG | iOS + Android |
| TIFF | JPEG, PNG | iOS only |
| AVIF | JPEG, PNG | iOS + Android |

## Tech Stack

- **Expo SDK 54**
- **React Native 0.81** + React 19 + React Compiler
- **expo-router** — file-based navigation
- **Zustand** — state management with AsyncStorage persistence
- **expo-image-manipulator** — format conversion, crop, rotate, flip, resize
- **@shopify/react-native-skia** — GPU-accelerated shape/brush crop with path clipping
- **react-native-compressor** — image compression

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
  utils/                      # Format detection, conversion matrix, save format, error handling
  hooks/                      # Image picker, tool processing orchestration
  stores/                     # Zustand stores (image, history, settings)
  components/                 # UI components (crop overlay, rotate config, format picker, etc.)
  constants/                  # Format definitions, tool definitions, shape definitions, theme
  types/                      # TypeScript types
```
