import { useContext } from "react";
import { Button, Text, View } from "react-native";
import { AuthContext } from "../../context/AuthContext";

const HomePage = () => {
  const { isLoggedIn, signIn, authData } = useContext(AuthContext);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Login!" onPress={() => signIn()} />
      {isLoggedIn && <Text>{JSON.stringify(authData)}</Text>}
    </View>
  );
};

export default HomePage;
