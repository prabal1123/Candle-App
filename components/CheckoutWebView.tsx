// components/CheckoutWebView.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { createUrl } from '@/lib/api';

export default function CheckoutWebView({ amountInPaise = 10000, onSuccess }: any) {
  const [order, setOrder] = useState<any>(null);
  const webRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(createUrl('/create-order'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amountInPaise, order: localOrder })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Create order failed');
        setOrder(data);
      } catch (err: any) {
        console.error(err);
        Alert.alert('Error', err.message || 'Could not create order');
      }
    })();
  }, [amountInPaise]);

  if (!order) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  const html = `
  <!doctype html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </head>
    <body>
      <script>
        const options = {
          "key": "${order.key_id}",
          "amount": "${order.amount}",
          "currency": "${order.currency}",
          "name": "Candle App",
          "description": "Order Payment",
          "order_id": "${order.id}",
          handler: function (response){
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', payload: response }));
          },
          modal: {
            ondismiss: function(){
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'dismiss' }));
            }
          }
        };
        const rzp = new Razorpay(options);
        rzp.open();
      </script>
    </body>
  </html>
  `;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={['*']}
        ref={webRef}
        source={{ html }}
        onMessage={async (event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.type === 'success') {
              const resp = await fetch(createUrl('/verify-payment'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg.payload)
              });
              const js = await resp.json();
              if (js.ok) {
                onSuccess?.(js);
              } else {
                Alert.alert('Payment verification failed', JSON.stringify(js));
              }
            } else if (msg.type === 'dismiss') {
              Alert.alert('Checkout closed');
            }
          } catch (err) {
            console.error(err);
          }
        }}
      />
    </View>
  );
}
