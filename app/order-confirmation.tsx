// app/order-confirmation.tsx
import React from "react";
import { View, Text, Button } from "react-native";
import { Link } from "expo-router";

export default function OrderConfirmation() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Order Confirmed</Text>
      <Text style={{ marginTop: 12 }}>Thanks — your order was placed (demo).</Text>

      <View style={{ marginTop: 20 }}>
        <Link href="/">
          <Button title="Back to shop" onPress={() => {}} />
        </Link>
      </View>
    </View>
  );
}
