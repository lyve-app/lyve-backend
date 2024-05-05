import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from "@react-navigation/native";
import { Stack } from "expo-router/stack";
import * as WebBrowser from "expo-web-browser";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";

import config from "../../tamagui.config";
import AuthProvider from "../components/providers/AuthProvider";

WebBrowser.maybeCompleteAuthSession();

export default function AppRootLayout() {
  const colorScheme = useColorScheme();

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
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        {/* </AuthProvider> */}
      </ThemeProvider>
    </TamaguiProvider>
  );
}
