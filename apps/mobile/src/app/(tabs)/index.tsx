import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { Text, View } from "react-native";
import { Button, YStack, SizableText } from "tamagui";

const HomePage = () => {
  const { isLoggedIn, signIn, signOut, user } = useAuth();

  useEffect(() => {
    return;
  }, [user, isLoggedIn]);

  return (
    <YStack padding="$3" backgroundColor="$color.background" flex={1}>
      <Button>Login</Button>
      <Button>Logout</Button>
      <View>{isLoggedIn && <Text>{JSON.stringify(user)}</Text>}</View>
    </YStack>
  );
};

export default HomePage;
