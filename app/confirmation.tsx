import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, ActivityIndicator, Alert, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { useDispatch } from "react-redux";
import { clearCart } from "@/features/cart/cartSlice";
import { router } from "expo-router";

type CartItem = { id: string; name: string; price: number; quantity: number };
type User = { id?: string; name?: string; email?: string; phone?: string; address?: string };

export default function CheckoutScreen({
  cartItems,
  user,
}: {
  cartItems: CartItem[];
  user: User;
}) {
  const dispatch = useDispatch();
  const webviewRef = useRef<WebView>(null);

  const [checkoutHTML, setCheckoutHTML] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "https://www.thehappycandles.com/"; // 🔁 change to your backend base URL

  const amountPaise = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100,
    [cartItems]
  );

  // 🧩 Step 1: Create Razorpay order on backend
  useEffect(() => {
    (async () => {
      try {
        const receipt = `receipt_${Date.now()}`;
        const res = await fetch(`${BACKEND_URL}/api/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountPaise,
            receipt,
            notes: { user_id: user?.id || "guest" },
          }),
        });

        const data = await res.json();
        if (!data?.id || !data?.key_id) {
          Alert.alert("Error", "Failed to create Razorpay order");
          console.error("create-order response:", data);
          return;
        }

        // 🧩 Step 2: Build HTML for Razorpay Checkout
        const html = `
          <!doctype html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
          </head>
          <body>
            <script>
              const options = {
                key: "${data.key_id}",
                amount: "${amountPaise}",
                currency: "INR",
                name: "Candle App",
                description: "Order Payment",
                order_id: "${data.id}",
                prefill: {
                  name: "${user?.name || "Guest User"}",
                  email: "${user?.email || ""}",
                  contact: "${user?.phone || ""}"
                },
                theme: { color: "#F37254" },
                handler: function (response) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    event: "payment_success",
                    payload: response
                  }));
                },
                modal: {
                  ondismiss: function () {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      event: "payment_cancel"
                    }));
                  }
                }
              };
              const rzp = new Razorpay(options);
              rzp.open();
            </script>
          </body>
          </html>
        `;
        setCheckoutHTML(html);
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Payment initialization failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [amountPaise, BACKEND_URL, user?.id, user?.name, user?.email, user?.phone]);

  // 🧠 Step 3: Handle messages from Razorpay WebView
  const onMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.event === "payment_success") {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = message.payload;

        // ✅ Verify payment with backend
        const verifyRes = await fetch(`${BACKEND_URL}/api/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            user_id: user?.id,
            items: cartItems,
            customer_name: user?.name,
            phone: user?.phone,
            shipping_address: user?.address,
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyData?.ok) {
          // ✅ Clear cart
          dispatch(clearCart());

          // ✅ Navigate to confirmation screen with order info
          router.replace({
            pathname: "/confirmation",
            params: {
              orderId: verifyData.orderId,
              order_number: verifyData.order_number,
            },
          });
        } else {
          Alert.alert("Verification failed", verifyData?.error || "Unknown error");
        }
      } else if (message.event === "payment_cancel") {
        Alert.alert("Payment cancelled");
        router.back();
      }
    } catch (err) {
      console.error("onMessage error:", err);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#F37254" style={{ flex: 1 }} />
      ) : (
        checkoutHTML && (
          <WebView
            ref={webviewRef}
            originWhitelist={["*"]}
            source={{
              html: checkoutHTML,
              baseUrl: Platform.OS === "web" ? window.location.origin : "https://local",
            }}
            onMessage={onMessage}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
          />
        )
      )}
    </View>
  );
}
