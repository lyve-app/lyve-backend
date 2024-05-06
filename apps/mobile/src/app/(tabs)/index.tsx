import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { Text } from "react-native";
import { Button, YStack } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";

const HomePage = () => {
  const { isLoggedIn, signIn, signOut, user } = useAuth();

  useEffect(() => {
    return;
  }, [user, isLoggedIn]);

  return (
    <SafeAreaView style={{ backgroundColor: "red" }}>
      <YStack padding="$3" backgroundColor="$color.background" height="100%">
        <Button>Login</Button>
        <Button>Logout</Button>
        {isLoggedIn && <Text>{JSON.stringify(user)}</Text>}
      </YStack>
    </SafeAreaView>
  );
};

export default HomePage;
