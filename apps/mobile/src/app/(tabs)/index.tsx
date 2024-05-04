import { useContext, useEffect } from "react";
import { Button, Text, View } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import useAuth from "../../hooks/useAuth";

const HomePage = () => {
  const { isLoggedIn, signIn, signOut, user } = useAuth();

  useEffect(() => {
    return;
  }, [user, isLoggedIn]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Login!" onPress={() => signIn()} />
      <Button title="logout!" onPress={() => signOut()} />
      {isLoggedIn && <Text>{JSON.stringify(user)}</Text>}
    </View>
  );
};

export default HomePage;
