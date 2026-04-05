const isProduction = process.env.APP_VARIANT === 'production';
const isHomolog = process.env.APP_VARIANT === 'homolog';

export default {
  expo: {
    name: isProduction ? "Reciclã" : `Reciclã (${process.env.APP_VARIANT || 'Dev'})`,
    slug: "recicla",
    scheme: "recicla",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,

    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      variant: process.env.APP_VARIANT || 'development'
    },

    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },

    ios: {
      supportsTablet: true
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.anonymous.myapp"
    },

    web: {
      favicon: "./assets/favicon.png"
    },

    plugins: ["expo-asset", "expo-font"]
  }
};
