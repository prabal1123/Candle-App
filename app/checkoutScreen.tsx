import React from "react";
import { View, Button, Alert } from "react-native";
import RazorpayCheckout from "react-native-razorpay";

// 🔹 Types for your app data
type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type User = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
};

// 🔹 Razorpay response types
type RazorpayPaymentData = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayError = {
  description?: string;
  code?: number;
  reason?: string;
};

// ✅ Main Component
export default function CheckoutScreen({
  cartItems,
  user,
}: {
  cartItems: CartItem[];
  user: User;
}) {
  const BACKEND_URL = "https://www.thehappycandles.com/"; // 🔁 change this to your backend base URL

  const amount = cartItems.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
    0
  );

  const startPayment = async (): Promise<void> => {
    try {
      // 1️⃣ Create unique receipt id
      const receipt = `receipt_${Date.now()}`;

      // 2️⃣ Create order on your backend
      const res = await fetch(`${BACKEND_URL}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount * 100, // in paise
          receipt,
          notes: { user_id: user?.id || "guest" },
        }),
      });

      const data = await res.json();
      if (!data?.id) {
        Alert.alert("Error", "Failed to create Razorpay order");
        console.error("Razorpay order error:", data);
        return;
      }

      // 3️⃣ Razorpay options
      const options = {
        description: "Candle App Purchase",
        image: "/Users/prabalsingh/Documents/Projects/Candle-Co/candle-app/assets/images/logo.png",
        currency: "INR",
        key: data.key_id, // from backend
        amount: amount * 100,
        name: "Candle App",
        order_id: data.id,
        prefill: {
          email: user?.email || "",
          contact: user?.phone || "",
          name: user?.name || "Guest User",
        },
        theme: { color: "#F37254" },
      };

      // 4️⃣ Open Razorpay modal
      RazorpayCheckout.open(options)
        .then(async (paymentData: RazorpayPaymentData) => {
          // ✅ Verify payment on your backend
          const verifyRes = await fetch(`${BACKEND_URL}/api/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...paymentData, // includes order_id, payment_id, signature
              local_receipt: receipt,
              user_id: user?.id,
              items: cartItems,
              customer_name: user?.name,
              phone: user?.phone,
              shipping_address: user?.address,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.ok) {
            Alert.alert("Success", "Payment successful! Order placed.");
            // 🧹 TODO: clear cart + navigate to confirmation screen
          } else {
            Alert.alert(
              "Payment verified, but order not saved",
              verifyData.error || "Unknown error"
            );
          }
        })
        .catch((err: RazorpayError) => {
          Alert.alert("Payment failed", err.description || "User cancelled payment");
          console.error("Razorpay error:", err);
        });
    } catch (err) {
      console.error("Checkout error:", err);
      Alert.alert("Error", "Payment process failed");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title={`Pay ₹${amount}`} onPress={startPayment} />
    </View>
  );
}
