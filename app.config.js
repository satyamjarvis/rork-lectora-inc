import 'dotenv/config';

export default {
  expo: {
    name: "Lectora Inc",
    slug: "lectora",
    version: "1.0.8",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "app.rork.lectora",
      infoPlist: {
        NSCameraUsageDescription: "Lectora needs access to your camera to capture images of text that you want to transcribe and save as articles.",
        NSMicrophoneUsageDescription: "Lectora needs access to your microphone for audio transcription features when capturing images.",
        NSPhotoLibraryUsageDescription: "Lectora needs access to your photo library to let you select images to transcribe into articles."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "app.rork.lectora",
      permissions: [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      [
        "expo-router",
        {
          origin: "https://rork.com/"
        }
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Lectora needs access to your camera to capture images of text that you want to transcribe and save as articles.",
          microphonePermission: "Lectora needs access to your microphone for audio transcription features when capturing images.",
          recordAudioAndroid: true
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Lectora needs access to your photo library to let you select images to transcribe into articles."
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    updates: {
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0
    },
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY,
      EXPO_PUBLIC_RAPIDAPI_KEY: process.env.EXPO_PUBLIC_RAPIDAPI_KEY,
      EXPO_PUBLIC_RAPIDAPI_HOST: process.env.EXPO_PUBLIC_RAPIDAPI_HOST,
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    }
  }
};

