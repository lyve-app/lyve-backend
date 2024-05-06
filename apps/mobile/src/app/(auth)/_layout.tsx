import { Redirect, Stack } from "expo-router";

import { ActivityIndicator } from "react-native";
import useAuth from "../../hooks/useAuth";

export default function AppLayout() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return <ActivityIndicator />;
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
