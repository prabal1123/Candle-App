import React, { useRef, useState, useEffect } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";

export default function CheckoutScreen({ cartItems, user }: any) {
  const webviewRef = useRef<WebView>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "https://your-vercel-app.vercel.app"; // 🔁 change this

  // 🧠 Step 1: Create order on backend
  useEffect(() => {
    const createOrder = async () => {
      try {
        const amount = cartItems.reduce(
          (sum: number, item: any) => sum + item.price * item.quantity,
          0
        );

        const receipt = `receipt_${Date.now()}`;
        const response = await fetch(`${BACKEND_URL}/api/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amount * 100,
            receipt,
            notes: { user_id: user?.id || "guest" },
          }),
        });

        const data = await response.json();
        if (!data?.id) {
          Alert.alert("Error", "Failed to create Razorpay order");
          return;
        }

        // 🧩 Step 2: Build HTML checkout page
        const checkoutHTML = `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            </head>
            <body>
              <script>
                var options = {
                  "key": "${data.key_id}",
                  "amount": "${amount * 100}",
                  "currency": "INR",
                  "name": "Candle App",
                  "description": "Candle purchase",
                  "order_id": "${data.id}",
                  "prefill": {
                    "name": "${user?.name || "Guest User"}",
                    "email": "${user?.email || ""}",
                    "contact": "${user?.phone || ""}"
                  },
                  "theme": { "color": "#F37254" },
                  "handler": function (response) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      event: "payment_success",
                      payload: response
                    }));
                  },
                  "modal": {
                    "ondismiss": function() {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        event: "payment_cancel"
                      }));
                    }
                  }
                };
                var rzp1 = new Razorpay(options);
                rzp1.open();
              </script>
            </body>
          </html>
        `;
        setCheckoutUrl(`data:text/html;base64,${btoa(checkoutHTML)}`);
      } catch (err) {
        Alert.alert("Error", "Payment initialization failed");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    createOrder();
  }, []);

  // 🧠 Step 3: Handle Razorpay messages from WebView
  const onMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.event === "payment_success") {
        const paymentData = message.payload;

        const verifyRes = await fetch(`${BACKEND_URL}/api/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...paymentData,
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
        } else {
          Alert.alert("Verification failed", verifyData.error || "Unknown error");
        }
      } else if (message.event === "payment_cancel") {
        Alert.alert("Cancelled", "Payment was cancelled.");
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
        checkoutUrl && (
          <WebView
            ref={webviewRef}
            originWhitelist={["*"]}
            source={{ uri: checkoutUrl }}
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
