import React from "react";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "#676D75",
        headerShown: false,
        tabBarStyle: {
          height: 83,
          borderWidth: 1,
          borderColor: "#151718",
          borderTopColor: "#151718",
          backgroundColor: "#151718",
          paddingHorizontal: 16
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "300",
          marginBottom: 20
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather size={size} name="home" color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Feather size={size} name="search" color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="stream"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <Feather
              size={28}
              name="video"
              color={color}
              style={{
                color: "white",
                backgroundColor: "#8A4BF9",
                borderRadius: 50,
                padding: 18,
                marginBottom: 35
              }}
            />
          )
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notification",
          tabBarIcon: ({ color, size }) => (
            <Feather size={size} name="bell" color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather size={size} name="user" color={color} />
          )
        }}
      />
    </Tabs>
  );
}
