import { Redirect, Stack, router } from "expo-router";

import { ActivityIndicator } from "react-native";
import useAuth from "../../hooks/useAuth";
import { YStack } from "tamagui";
import { useEffect } from "react";

export default function AppLayout() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator />
      </YStack>
    );
  }

  // Only require authentication within the (app) group's layout as users

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
