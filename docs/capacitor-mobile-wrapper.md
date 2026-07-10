# Capacitor Mobile Wrapper

This project now includes a Capacitor wrapper so mobile builds can use native device features, especially contact access for chat sharing.

## Installed packages

- `@capacitor/core`
- `@capacitor/cli`
- `@capacitor/android`
- `@capacitor/ios`
- `@capacitor-community/contacts`

## Config

The wrapper config lives in [capacitor.config.ts](/home/duke-of-wezelton/Documents/KaraAds/capacitor.config.ts).

By default, the native shell loads the live app from:

```txt
https://karaads.com
```

You can point it somewhere else during build time with:

```bash
CAP_SERVER_URL=https://your-staging-domain.com npm run mobile:build
```

## Commands

```bash
npm run cap:add:android
npm run cap:add:ios
npm run mobile:build
npm run cap:open:android
npm run cap:open:ios
```

## Native contact sharing

Chat contact sharing now prefers the Capacitor native contacts plugin on Android and iOS.

Web behavior:

- supported browsers: browser contact picker
- unsupported browsers: `.vcf` file fallback

Native behavior:

- Android/iOS Capacitor app: native contacts permission + native contact picker

## iOS note

Add a contacts usage description in `ios/App/App/Info.plist` after generating the iOS project:

```xml
<key>NSContactsUsageDescription</key>
<string>KaraAds uses your contacts so you can share saved contacts in chat.</string>
```

## Android note

After generating the Android project, confirm the contacts permission is present in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.READ_CONTACTS" />
```

The installed contacts plugin typically manages the native integration, but it is still worth verifying the generated platform files once.
