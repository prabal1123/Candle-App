// // app/contact.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Stack } from "expo-router";
import { contactStyles as styles } from "../styles/contactStyles"; // <-- separate styles file

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Contact(): JSX.Element {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit() {
    console.log("Contact submit:", { name, email, message });
  }

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      {/* Let the global navbar from your layout handle navigation */}
      <Stack.Screen options={{ title: "Contact Candle Co" }} />

      {/* Content */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.container}>
          <View style={styles.intro}>
            <View style={styles.introText}>
              <Text style={styles.title}>Contact Us</Text>
              <Text style={styles.subtitle}>
                We'd love to hear from you! Whether you have a question about our products,
                need assistance with an order, or just want to share your thoughts, please don't
                hesitate to reach out. Fill out the form below, or use the contact information provided.
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                placeholder="Your Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor="#887563"
                accessible
                accessibilityLabel="Name"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="Your Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#887563"
                accessible
                accessibilityLabel="Email"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formField, { width: Math.min(480, SCREEN_WIDTH - 48) }]}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                placeholder="Your Message"
                value={message}
                onChangeText={setMessage}
                style={[styles.input, styles.textarea]}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor="#887563"
                accessible
                accessibilityLabel="Message"
              />
            </View>
          </View>

          <View style={styles.submitRow}>
            <Pressable style={styles.submitButton} onPress={onSubmit} accessibilityRole="button">
              <Text style={styles.submitText}>Submit</Text>
            </Pressable>
          </View>

          {/* Contact Info */}
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.paragraph}>Email: support@thehappycandle.com</Text>
          <Text style={styles.paragraph}>Phone: +91 9823675423</Text>
          <Text style={styles.paragraph}>Address: 123 Hyderabad</Text>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}
