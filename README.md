# Image Smith

Privacy-friendly image tools for iOS and Android. All processing happens on your device — nothing is uploaded.

## Features

- **Format Conversion** — Convert between JPEG, PNG, WebP, HEIC, BMP, TIFF, and AVIF
- **Quality Control** — Adjustable quality slider for lossy formats
- **Metadata Preservation** — Option to keep or strip EXIF data
- **Conversion History** — View past conversions with thumbnails and stats
- **Dark Mode** — System, light, or dark theme
- **Haptic Feedback** — Configurable tactile feedback

### Supported Conversions

| Source | Targets | Platform |
|--------|---------|----------|
| JPEG | PNG | iOS + Android |
| PNG | JPEG | iOS + Android |
| WebP | PNG, JPEG | iOS + Android |
| HEIC | JPEG, PNG | iOS + Android |
| BMP | PNG | iOS + Android |
| JPEG, PNG | HEIC | iOS only |
| TIFF | JPEG, PNG | iOS only |
| AVIF | JPEG, PNG | iOS + Android |

## Tech Stack

- **Expo SDK 54**
- **React Native 0.81** + React 19 + React Compiler
- **expo-router** — file-based navigation
- **Zustand** — state management with AsyncStorage persistence
- **expo-image-manipulator** — core format conversion
- **react-native-heic-converter** — HEIC decode
- **react-native-compressor** — HEIC encode (iOS)

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

The debug APK requires Metro bundler running. To build a standalone APK with the JS bundle embedded:

```bash
cd android && ./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

Transfer this to your phone and install, or use:

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Project Structure

```
app/                          # Screens (expo-router)
  (tabs)/                     # Tab navigation: Home, History, Settings
  convert/                    # Conversion flow: Pick, Processing, Result
src/
  services/                   # Image processor, file manager
  utils/                      # Format detection, conversion matrix, error handling
  hooks/                      # Image picker, conversion orchestration
  stores/                     # Zustand stores (image, history, settings)
  components/                 # UI components (button, chip, card, etc.)
  constants/                  # Format definitions, tool definitions
  types/                      # TypeScript types
constants/                    # Theme colors
```
