import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAuth } from "@/features/auth/AuthProvider";

export default function AccountScreen() {
  const { user, signOut } = useAuth();

  return (
    <View>
      {user ? (
        <>
          <Text>Welcome, {user.email}</Text>
          <Pressable onPress={signOut}>
            <Text>Logout</Text>
          </Pressable>
        </>
      ) : (
        <Text>You’re not signed in</Text>
      )}
    </View>
  );
}
