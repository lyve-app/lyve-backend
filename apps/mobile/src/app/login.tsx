import { YStack, Button, Text } from "tamagui";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../hooks/useAuth";

const LoginPage = () => {
  const { signIn } = useAuth();
  return (
    <SafeAreaView>
      <YStack>
        <Text>Login Page</Text>
        <Button onPress={() => signIn()}>Login</Button>
      </YStack>
    </SafeAreaView>
  );
};

export default LoginPage;
