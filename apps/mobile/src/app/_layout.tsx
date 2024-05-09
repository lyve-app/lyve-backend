import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import { useFonts } from "expo-font";
import config from "../../tamagui.config";
import AuthProvider from "../components/providers/AuthProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useCallback } from "react";
import { Slot, SplashScreen } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

SplashScreen.preventAutoHideAsync();

export default function AppRootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf")
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider
          config={{
            clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID as string,
            realmUrl: process.env.EXPO_PUBLIC_KEYCLOAK_REALM_URL as string,
            scheme: "lyve-mobile"
          }}
        >
          <SafeAreaProvider onLayout={onLayoutRootView}>
            <Slot />
          </SafeAreaProvider>
        </AuthProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
