// app/privacy.tsx
import React from "react";
import { ScrollView, View, Text } from "react-native";
import { Stack } from "expo-router";

export default function Privacy(): JSX.Element {
  return (
    <ScrollView
      contentContainerStyle={{
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
      }}
    >
      {/* Use the global header; just set the page title here */}
      <Stack.Screen options={{ title: "Privacy Policy — Happy Candles" }} />

      <View
        style={{
          maxWidth: 960,
          width: "100%",
          alignSelf: "center",
          gap: 12,
        }}
      >
        <Text
          style={{
            color: "#181411",
            fontSize: 28,
            fontWeight: "700",
            letterSpacing: -0.3,
            marginBottom: 8,
          }}
        >
          Privacy Policy
        </Text>

        {/* Information We Collect */}
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          Information We Collect
        </Text>
        <Text style={{ color: "#181411", fontSize: 16, lineHeight: 24 }}>
          We collect information that you provide directly to us, such as when you
          create an account, place an order, or contact us. This information may
          include your name, email address, shipping address, and payment details.
        </Text>

        {/* How We Use Your Information */}
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          How We Use Your Information
        </Text>
        <Text style={{ color: "#181411", fontSize: 16, lineHeight: 24 }}>
          We use the information we collect to process your orders, communicate
          with you about your purchases, and provide customer support. We may also
          use your information to send you promotional emails about new products
          or special offers, but you can opt out of these communications at any time.
        </Text>

        {/* Data Security */}
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          Data Security
        </Text>
        <Text style={{ color: "#181411", fontSize: 16, lineHeight: 24 }}>
          We take reasonable measures to protect your personal information from
          unauthorized access, use, or disclosure. This includes using secure
          servers and encryption technologies to safeguard your data.
        </Text>

        {/* Your Rights */}
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          Your Rights
        </Text>
        <Text style={{ color: "#181411", fontSize: 16, lineHeight: 24 }}>
          You have the right to access, correct, or delete your personal
          information. You can also object to the processing of your data or
          request that we restrict the use of your information. To exercise
          these rights, please contact us using the information provided in the
          “Contact Us” section.
        </Text>

        {/* Changes to This Policy */}
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          Changes to This Policy
        </Text>
        <Text style={{ color: "#181411", fontSize: 16, lineHeight: 24 }}>
          We may update this privacy policy from time to time. We will notify you
          of any significant changes by posting the new policy on our website and
          updating the “Last Updated” date.
        </Text>

        {/* Last Updated */}
        <Text
          style={{
            color: "#887563",
            fontSize: 14,
            marginTop: 8,
            marginBottom: 24,
          }}
        >
          Last Updated: October 26, 2024
        </Text>

        {/* Brand note */}
        <Text
          style={{
            color: "#887563",
            fontSize: 14,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          © 2025 Happy Candles. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}
