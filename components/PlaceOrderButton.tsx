// // app/components/PlaceOrderButton.tsx
// import React, { useState } from 'react';
// import { Pressable, Text, Alert, ActivityIndicator, Platform } from 'react-native';

// type Props = {
//   localOrder: any; // full order object created on client and sent to server
//   backendUrl?: string; // optional backend base URL (defaults to http://localhost:4242)
//   onPaid?: (verifyPayload: any) => void;
//   onError?: (err: any) => void;
// };

// export default function PlaceOrderButton({ localOrder, backendUrl, onPaid, onError }: Props) {
//   const [loading, setLoading] = useState(false);
//   const BACKEND = backendUrl || 'http://localhost:4242';

//   const loadRazorpayScript = async () => {
//     if (typeof window === 'undefined') return false;
//     if ((window as any).Razorpay) return true;

//     return new Promise((resolve, reject) => {
//       const script = document.createElement('script');
//       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//       script.onload = () => resolve(true);
//       script.onerror = () => reject(new Error('Razorpay script failed to load'));
//       document.body.appendChild(script);
//     });
//   };

//   const startPayment = async () => {
//     if (Platform.OS !== 'web') {
//       Alert.alert('Payment', 'Razorpay web checkout is only available on web builds.');
//       return;
//     }

//     setLoading(true);
//     try {
//       // 1) send order to server which will persist & create razorpay order
//       const placeResp = await fetch(`${BACKEND}/place-order`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ order: localOrder }),
//       });

//       if (!placeResp.ok) {
//         const txt = await placeResp.text();
//         throw new Error(`place-order failed: ${placeResp.status} ${txt}`);
//       }

//       const { razorpayOrder } = await placeResp.json();
//       if (!razorpayOrder || !razorpayOrder.id) throw new Error('invalid razorpay order returned');

//       // 2) load script
//       await loadRazorpayScript();

//       // 3) open Razorpay checkout
//       const options = {
//         key: (import.meta.env && import.meta.env.VITE_RAZORPAY_KEY_ID) || (window as any).RAZORPAY_KEY_ID || '',
//         amount: razorpayOrder.amount,
//         currency: razorpayOrder.currency,
//         name: 'Candle Co',
//         description: `Order ${localOrder.id}`,
//         order_id: razorpayOrder.id,
//         handler: async function (response: any) {
//           // verify on server
//           try {
//             const verifyResp = await fetch(`${BACKEND}/verify-payment`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_signature: response.razorpay_signature,
//                 local_receipt: localOrder.id,
//               }),
//             });

//             const verifyJson = await verifyResp.json();
//             if (verifyResp.ok && verifyJson.verified) {
//               Alert.alert('Payment success', 'Payment verified and order placed.');
//               onPaid && onPaid(verifyJson);
//             } else {
//               Alert.alert('Payment verification failed', JSON.stringify(verifyJson));
//               onError && onError(verifyJson);
//             }
//           } catch (err: any) {
//             Alert.alert('Verification error', err.message || String(err));
//             onError && onError(err);
//           }
//         },
//         prefill: {
//           name: localOrder.customer?.name,
//           contact: localOrder.customer?.phone,
//         },
//         notes: {
//           receipt: localOrder.id,
//         },
//         theme: { color: '#111' },
//       };

//       const rzp = new (window as any).Razorpay(options);
//       rzp.open();
//     } catch (err: any) {
//       console.error('PlaceOrderButton error', err);
//       Alert.alert('Payment error', err.message || String(err));
//       onError && onError(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Pressable onPress={startPayment} style={{ padding: 12, backgroundColor: '#111', borderRadius: 8 }}>
//       {loading ? (
//         <ActivityIndicator />
//       ) : (
//         <Text style={{ color: '#fff', textAlign: 'center' }}>Pay ₹{localOrder?.total ?? '---'}</Text>
//       )}
//     </Pressable>
//   );
// }




// app/components/PlaceOrderButton.tsx
import React, { useState } from 'react';
import { Pressable, Text, Alert, ActivityIndicator, Platform } from 'react-native';

type Props = {
  localOrder: any; // full order object created on client and sent to server
  backendUrl?: string; // optional backend base URL (defaults to http://localhost:4242)
  onPaid?: (verifyPayload: any) => void;
  onError?: (err: any) => void;
};

export default function PlaceOrderButton({ localOrder, backendUrl, onPaid, onError }: Props) {
  const [loading, setLoading] = useState(false);
  const BACKEND = backendUrl || (typeof window !== 'undefined' ? (window as any).BACKEND_URL || 'http://localhost:4242' : 'http://localhost:4242');

  const loadRazorpayScript = async () => {
    if (typeof window === 'undefined') return false;
    if ((window as any).Razorpay) return true;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Razorpay script failed to load'));
      document.body.appendChild(script);
    });
  };

  const getRazorpayKey = () => {
    // Safe runtime lookup. Prefer window.RAZORPAY_KEY_ID or a short alias __RZP_KEY.
    if (typeof window === 'undefined') return '';
    const win = window as any;
    return win.RAZORPAY_KEY_ID || win.__RZP_KEY || win.__RAZORPAY_KEY || '';
  };

  const startPayment = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Payment', 'Razorpay web checkout is only available on web builds.');
      return;
    }

    setLoading(true);
    try {
      // 1) send order to server which will persist & create razorpay order
      const placeResp = await fetch(`${BACKEND}/place-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: localOrder }),
      });

      if (!placeResp.ok) {
        const txt = await placeResp.text();
        throw new Error(`place-order failed: ${placeResp.status} ${txt}`);
      }

      const { razorpayOrder } = await placeResp.json();
      if (!razorpayOrder || !razorpayOrder.id) throw new Error('invalid razorpay order returned');

      // 2) load script
      await loadRazorpayScript();

      // 3) open Razorpay checkout
      const options = {
        key: getRazorpayKey(),
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Candle Co',
        description: `Order ${localOrder.id}`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          // verify on server
          try {
            const verifyResp = await fetch(`${BACKEND}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                local_receipt: localOrder.id,
              }),
            });

            const verifyJson = await verifyResp.json();
            if (verifyResp.ok && verifyJson.verified) {
              Alert.alert('Payment success', 'Payment verified and order placed.');
              onPaid && onPaid(verifyJson);
            } else {
              Alert.alert('Payment verification failed', JSON.stringify(verifyJson));
              onError && onError(verifyJson);
            }
          } catch (err: any) {
            Alert.alert('Verification error', err.message || String(err));
            onError && onError(err);
          }
        },
        prefill: {
          name: localOrder.customer?.name,
          contact: localOrder.customer?.phone,
        },
        notes: {
          receipt: localOrder.id,
        },
        theme: { color: '#111' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('PlaceOrderButton error', err);
      Alert.alert('Payment error', err.message || String(err));
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable onPress={startPayment} style={{ padding: 12, backgroundColor: '#111', borderRadius: 8 }}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={{ color: '#fff', textAlign: 'center' }}>Pay ₹{localOrder?.total ?? '---'}</Text>
      )}
    </Pressable>
  );
}
