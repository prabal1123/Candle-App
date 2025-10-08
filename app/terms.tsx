// app/terms.tsx
import React from "react";
import { ScrollView, View, Text } from "react-native";
import { Stack } from "expo-router";

export default function Terms(): JSX.Element {
  return (
    <ScrollView
      contentContainerStyle={{
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
      }}
    >
      {/* Uses your global header; only sets the title here */}
      <Stack.Screen options={{ title: "Terms of Service — Happy Candles" }} />

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
          Terms of Service
        </Text>

        {/* 1. Acceptance of Terms */}
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          1. Acceptance of Terms
        </Text>
        <Text style={{ color: "#181411", fontSize: 16, lineHeight: 24 }}>
          By accessing or using the Happy Candles website, you agree to be bound by
          these Terms of Service. If you do not agree to these terms, please do not
          use our website.
        </Text>

        {/* 2. Products and Orders */}
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          2. Products and Orders
        </Text>
        <Text style={{ color: "#181411", fontSize: 16, lineHeight: 24 }}>
          We offer a variety of aromatic candles for sale. All orders are subject to
          acceptance and availability. We reserve the right to refuse or cancel any
          order for any reason, including limitations on quantities available for
          purchase, inaccuracies, or errors in product or pricing information.
        </Text>

        {/* 3. Pricing and Payment */}
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          3. Pricing and Payment
        </Text>
        <Text style={{ color: "#181411", fontSize: 16, lineHeight: 24 }}>
          Prices for our products are subject to change without notice. We accept
          various forms of payment as indicated on our website. Payment must be
          received in full before an order is processed and shipped.
        </Text>

        {/* 4. Shipping and Delivery */}
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          4. Shipping and Delivery
        </Text>
        <Text style={{ color: "#181411", fontSize: 16, lineHeight: 24 }}>
          We aim to ship orders promptly, but delivery times may vary depending on
          your location. We are not responsible for delays caused by shipping
          carriers or unforeseen circumstances.
        </Text>

        {/* 5. Returns and Refunds */}
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          5. Returns and Refunds
        </Text>
        <Text style={{ color: "#181411", fontSize: 16, lineHeight: 24 }}>
          If you are not satisfied with your purchase, you may return it within 30
          days of receipt for a refund or exchange, subject to our return policy.
          Products must be returned in their original condition.
        </Text>

        {/* 6. Intellectual Property */}
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          6. Intellectual Property
        </Text>
        <Text style={{ color: "#181411", fontSize: 16, lineHeight: 24 }}>
          All content on this website, including text, images, and logos, is the
          property of Happy Candles and is protected by copyright and other
          intellectual property laws. You may not use our content without our
          express written permission.
        </Text>

        {/* 7. Limitation of Liability */}
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          7. Limitation of Liability
        </Text>
        <Text style={{ color: "#181411", fontSize: 16, lineHeight: 24 }}>
          Happy Candles shall not be liable for any direct, indirect, incidental,
          special, or consequential damages resulting from the use or inability to
          use our website or products.
        </Text>

        {/* 8. Governing Law */}
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          8. Governing Law
        </Text>
        <Text style={{ color: "#181411", fontSize: 16, lineHeight: 24 }}>
          These Terms of Service shall be governed by and construed in accordance
          with the laws of the jurisdiction in which Happy Candles is located.
        </Text>

        {/* 9. Changes to Terms */}
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          9. Changes to Terms
        </Text>
        <Text style={{ color: "#181411", fontSize: 16, lineHeight: 24 }}>
          We reserve the right to modify these Terms of Service at any time. Any
          changes will be effective immediately upon posting on our website. Your
          continued use of the website constitutes acceptance of the revised terms.
        </Text>

        {/* Footer note to mirror your HTML footer copy */}
        <Text
          style={{
            color: "#887563",
            fontSize: 14,
            textAlign: "center",
            marginTop: 24,
            marginBottom: 8,
          }}
        >
          © 2024 Happy Candles. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}
