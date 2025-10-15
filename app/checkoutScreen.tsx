import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, ActivityIndicator, Alert, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";

// ✅ adjust this import to your slice/action name
import { clearCart } from "@/features/cart/cartSlice";

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
  const navigation = useNavigation<any>();
  const webviewRef = useRef<WebView>(null);

  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "https://www.thehappycandles.com/"; // ← change to your API base

  const amountPaise = useMemo(
    () => cartItems.reduce((sum, it) => sum + it.price * it.quantity, 0) * 100,
    [cartItems]
  );

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

        // Inline HTML for Razorpay Checkout (no redirects)
        const checkoutHTML = `
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
              const r = new Razorpay(options);
              r.open();
            </script>
          </body>
          </html>
        `;
        setHtml(checkoutHTML);
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Payment initialization failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [amountPaise, BACKEND_URL, user?.email, user?.id, user?.name, user?.phone]);

  const onMessage = async (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.event === "payment_success") {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = msg.payload;

        // Verify on backend & create order record
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
          // 🧹 clear cart
          dispatch(clearCart());

          // 🔁 go to confirmation (adjust route & params to your app)
          navigation.replace("OrderConfirmation", {
            orderId: verifyData.orderId,
            orderNumber: verifyData.order_number,
            paymentId: razorpay_payment_id,
            amountPaise,
          });
        } else {
          Alert.alert("Verification failed", verifyData?.error || "Unknown error");
        }
      } else if (msg.event === "payment_cancel") {
        Alert.alert("Payment cancelled");
        navigation.goBack();
      }
    } catch (e) {
      console.error("onMessage parse error:", e);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" style={{ flex: 1 }} />
      ) : (
        html && (
          <WebView
            ref={webviewRef}
            originWhitelist={["*"]}
            source={{ html, baseUrl: Platform.OS === "web" ? window.location.origin : "https://local" }}
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
