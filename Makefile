.PHONY: help deps clean prebuild run-android run-ios start test test-e2e test-e2e-convert test-e2e-ops lint typecheck release-apk release-ios push-samples-android push-samples-ios

# ── Setup ────────────────────────────────────────────────────────────── #

deps:
	npm install

clean:
	rm -rf ios android node_modules/.cache
	npx expo prebuild --clean

prebuild:
	npx expo prebuild --clean

prebuild-ios:
	npx expo prebuild --clean --platform ios

prebuild-android:
	npx expo prebuild --clean --platform android

# ── Run ──────────────────────────────────────────────────────────────── #

start:
	npx expo start

run-android:
	npx expo run:android

run-ios:
	npx expo run:ios

# ── Test ─────────────────────────────────────────────────────────────── #

test:
	npx jest

test-watch:
	npx jest --watch

test-e2e:
	maestro test .maestro/convert/ .maestro/operations/

test-e2e-convert:
	maestro test .maestro/convert/

test-e2e-ops:
	maestro test .maestro/operations/

push-samples-android:
	adb push tests/samples/* /sdcard/Download/

push-samples-ios:
	$(eval APP_CONTAINER := $(shell xcrun simctl get_app_container booted com.toolsmithlabs.imagesmith data 2>/dev/null))
	mkdir -p "$(APP_CONTAINER)/Documents"
	cp tests/samples/* "$(APP_CONTAINER)/Documents/"

# ── Lint & Type Check ────────────────────────────────────────────────── #

lint:
	npx expo lint

typecheck:
	npx tsc --noEmit

# ── Release ──────────────────────────────────────────────────────────── #

release-apk:
	cd android && ./gradlew assembleRelease
	@echo "APK: android/app/build/outputs/apk/release/app-release.apk"

release-ios-build:
	eas build --platform ios --profile production

release-ios-submit:
	eas submit --platform ios
