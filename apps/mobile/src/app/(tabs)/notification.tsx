import { router } from "expo-router";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NotificationPage = () => {
  return (
    <SafeAreaView>
      <Text>
        <Button title="welcome" onPress={() => router.navigate("/welcome")} />
      </Text>
    </SafeAreaView>
  );
};

export default NotificationPage;
