import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from "@react-navigation/native";
import { Stack } from "expo-router/stack";
import * as WebBrowser from "expo-web-browser";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import { useFonts } from "expo-font";

import config from "../../tamagui.config";
import AuthProvider from "../components/providers/AuthProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export default function AppRootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf")
  });

  useEffect(() => {
    if (loaded) {
      // can hide splash screen here
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        {/* <AuthProvider
          config={{
            clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID as string,
            realmUrl: process.env.EXPO_PUBLIC_KEYCLOAK_REALM_URL as string,
            scheme: "lyve-mobile"
          }}
        > */}
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaProvider>
        {/* </AuthProvider> */}
      </ThemeProvider>
    </TamaguiProvider>
  );
}
