// app/product/add.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function AddProductPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");

  function handleSubmit() {
    // Replace with real API call to create product.
    if (!title || !price) {
      Alert.alert("Validation", "Please add a title and price.");
      return;
    }
    // Fake save:
    console.log("Saving product:", { title, price, desc });
    Alert.alert("Saved", "Product created (mock).");
    router.push("/product");
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>Add Product</Text>

      <Text style={{ marginBottom: 6 }}>Title</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Product title" style={{ borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, marginBottom: 12 }} />

      <Text style={{ marginBottom: 6 }}>Price (INR)</Text>
      <TextInput value={price} onChangeText={setPrice} placeholder="499" keyboardType="numeric" style={{ borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, marginBottom: 12 }} />

      <Text style={{ marginBottom: 6 }}>Description</Text>
      <TextInput value={desc} onChangeText={setDesc} placeholder="Short description" multiline style={{ borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, marginBottom: 18, minHeight: 80 }} />

      <Pressable onPress={handleSubmit} style={{ backgroundColor: "#111", padding: 14, borderRadius: 8 }}>
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>Create Product</Text>
      </Pressable>
    </ScrollView>
  );
}
