// // components/PlaceOrderButton2.tsx
// import React from "react";
// import { TouchableOpacity, Text, Alert, Platform } from "react-native";
// import { supabase } from "@/lib/supabase";

// type Props = {
//   localOrder: any;                // { items, totals, customer, etc. }
//   backendUrl?: string;            // e.g. https://candle-app-lac.vercel.app/api
//   onPaid?: (payload: any) => void;
//   onError?: (err: any) => void;
//   style?: any;
// };

// const apiBase = (b?: string) =>
//   (b?.replace(/\/$/, "") || process.env.EXPO_PUBLIC_API_BASE?.replace(/\/$/, "") || "https://candle-app-lac.vercel.app/api");

// const paise = (order: any) => {
//   // your earlier resolver, simplified
//   const v =
//     order?.total_paise ??
//     order?.subtotal_paise ??
//     (Array.isArray(order?.items)
//       ? order.items.reduce((s: number, it: any) => s + Math.round((it.price_cents ?? it.price*100) * (it.qty ?? it.quantity ?? 1)), 0)
//       : null) ??
//     (order?.total != null ? Math.round(Number(order.total) * 100) : null);
//   return Number.isFinite(v) ? Number(v) : null;
// };

// export default function PlaceOrderButton2({ localOrder, backendUrl, onPaid, onError, style }: Props) {
//   const handlePress = async () => {
//     try {
//       const amount = paise(localOrder);
//       if (!amount || amount < 100) throw new Error(`Invalid amount (paise): ${amount}`);

//       // 1) Create server+DB order and Razorpay order
//       const base = apiBase(backendUrl);
//       const receipt = localOrder?.clientReference ?? localOrder?.id ?? `CANDLE-${Date.now()}`;
//       const { data: { session } = { data: undefined } } = await supabase.auth.getSession();
//       const headers: Record<string, string> = { "Content-Type": "application/json" };
//       if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

//       const createRes = await fetch(`${base}/create-order`, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({
//           amount, currency: "INR", receipt,
//           notes: localOrder?.notes ?? {},
//           raw_payload: {
//             items: localOrder?.items ?? null,
//             customer: localOrder?.customer ?? null,
//             shipping_address: localOrder?.shipping_address ?? localOrder?.customer?.address ?? null,
//           },
//         }),
//       });
//       const createJson = await createRes.json().catch(() => ({}));
//       if (!createRes.ok || !createJson?.id || !createJson?.order_number) {
//         throw new Error(createJson?.error || "create-order failed");
//       }

//       // 2) Full-page checkout (web) – use Razorpay script on this page
//       if (Platform.OS === "web") {
//         // @ts-ignore
//         const Razorpay = (window as any).Razorpay;
//         if (!Razorpay) {
//           throw new Error("Razorpay SDK not loaded. Include https://checkout.razorpay.com/v1/checkout.js");
//         }

//         await new Promise<void>((resolve, reject) => {
//           const rzp = new Razorpay({
//             key: createJson.key_id,
//             amount: createJson.amount,
//             currency: createJson.currency,
//             name: (localOrder?.customer?.name || "Candle App"),
//             description: "Order Payment",
//             order_id: createJson.id, // razorpay_order_id
//             handler: async (resp: any) => {
//               try {
//                 const verifyRes = await fetch(`${base}/verify-payment`, {
//                   method: "POST",
//                   headers,
//                   body: JSON.stringify({
//                     razorpay_order_id: resp.razorpay_order_id,
//                     razorpay_payment_id: resp.razorpay_payment_id,
//                     razorpay_signature: resp.razorpay_signature,
//                     // fields to persist:
//                     items: localOrder?.items ?? null,
//                     customer_name: localOrder?.customer?.name ?? null,
//                     phone: localOrder?.customer?.phone ?? null,
//                     shipping_address: localOrder?.shipping_address ?? localOrder?.customer?.address ?? null,
//                   }),
//                 });
//                 const verifyJson = await verifyRes.json().catch(() => ({}));
//                 if (!verifyRes.ok || !verifyJson?.ok) return reject(verifyJson);
//                 // Persist order_number for confirmation page
//                 try { sessionStorage.setItem("order_number", verifyJson.order_number); } catch {}
//                 onPaid?.(verifyJson);
//                 resolve();
//               } catch (e) { reject(e); }
//             },
//             modal: { ondismiss: () => reject(new Error("Checkout dismissed")) },
//           });
//           rzp.open();
//         });

//         return;
//       }

//       // 3) Native path – hand off to RN Razorpay SDK, then call verify endpoint similarly
//       throw new Error("Wire native Razorpay SDK then call /verify-payment with its response.");
//     } catch (e: any) {
//       onError?.(e);
//       Alert.alert("Payment", e?.message || String(e));
//     }
//   };

//   const label = (() => {
//     const a = paise(localOrder) ?? 0;
//     return (a / 100).toFixed(2);
//   })();

//   return (
//     <TouchableOpacity onPress={handlePress} style={[{ backgroundColor: "#111", padding: 12, borderRadius: 8, alignItems: "center" }, style]}>
//       <Text style={{ color: "#fff", fontWeight: "700" }}>Pay ₹{label}</Text>
//     </TouchableOpacity>
//   );
// }




// components/PlaceOrderButton2.tsx
import React from "react";
import { TouchableOpacity, Text, Alert, Platform } from "react-native";
import { supabase } from "@/lib/supabase";

type Props = {
  localOrder: any;                // { items, totals, customer, shipping_address, ... }
  backendUrl?: string;            // e.g. https://thehappycandles.com/api
  onPaid?: (payload: any) => void;
  onError?: (err: any) => void;
  style?: any;
};

const apiBase = (b?: string) =>
  (b?.replace(/\/$/, "") || process.env.EXPO_PUBLIC_API_BASE?.replace(/\/$/, "") || "https://candle-app-lac.vercel.app/api");

const paise = (order: any) => {
  const v =
    order?.total_paise ??
    order?.subtotal_paise ??
    (Array.isArray(order?.items)
      ? order.items.reduce((s: number, it: any) => s + Math.round((it.price_cents ?? it.price * 100) * (it.qty ?? it.quantity ?? 1)), 0)
      : null) ??
    (order?.total != null ? Math.round(Number(order.total) * 100) : null);
  return Number.isFinite(v) ? Number(v) : null;
};

export default function PlaceOrderButton2({ localOrder, backendUrl, onPaid, onError, style }: Props) {
  const handlePress = async () => {
    try {
      const amount = paise(localOrder);
      if (!amount || amount < 100) throw new Error(`Invalid amount (paise): ${amount}`);

      const base = apiBase(backendUrl);
      const receipt = localOrder?.clientReference ?? localOrder?.id ?? `CANDLE-${Date.now()}`;

      const { data: { session } = { data: undefined } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

      // 1) Create Razorpay order
      const createRes = await fetch(`${base}/create-order`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          amount, currency: "INR", receipt,
          notes: localOrder?.notes ?? {},
          raw_payload: {
            items: localOrder?.items ?? null,
            customer: localOrder?.customer ?? null,
            shipping_address: localOrder?.shipping_address ?? localOrder?.customer?.address ?? null,
          },
        }),
      });
      const createJson = await createRes.json().catch(() => ({}));
      if (!createRes.ok || !createJson?.id || !createJson?.order_number) {
        throw new Error(createJson?.error || "create-order failed");
      }

      // 2) Web checkout → verify
      if (Platform.OS === "web") {
        // @ts-ignore
        const Razorpay = (window as any).Razorpay;
        if (!Razorpay) throw new Error("Razorpay SDK not loaded. Include https://checkout.razorpay.com/v1/checkout.js");

        await new Promise<void>((resolve, reject) => {
          const rzp = new Razorpay({
            key: createJson.key_id,
            amount: createJson.amount,
            currency: createJson.currency,
            name: (localOrder?.customer?.name || "Candle App"),
            description: "Order Payment",
            order_id: createJson.id, // razorpay_order_id
            handler: async (resp: any) => {
              try {
                const verifyRes = await fetch(`${base}/verify-payment`, {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    razorpay_order_id: resp.razorpay_order_id,
                    razorpay_payment_id: resp.razorpay_payment_id,
                    razorpay_signature: resp.razorpay_signature,
                    local_receipt: receipt, // 👈 keep same order_number end-to-end
                    items: localOrder?.items ?? null,
                    customer_name: localOrder?.customer?.name ?? null,
                    phone: localOrder?.customer?.phone ?? null,
                    shipping_address: localOrder?.shipping_address ?? localOrder?.customer?.address ?? null,
                    notes: localOrder?.notes ?? null,
                  }),
                });
                const verifyJson = await verifyRes.json().catch(() => ({}));
                if (!verifyRes.ok || !verifyJson?.ok) return reject(verifyJson);
                try { sessionStorage.setItem("order_number", verifyJson.order_number); } catch {}
                onPaid?.(verifyJson);
                if (typeof window !== "undefined") {
                  window.location.assign(`/confirmation?order_number=${encodeURIComponent(verifyJson.order_number)}`);
                }
                resolve();
              } catch (e) { reject(e); }
            },
            modal: { ondismiss: () => reject(new Error("Checkout dismissed")) },
            prefill: {
              name: localOrder?.customer?.name || "",
              contact: localOrder?.customer?.phone || "",
              email: localOrder?.customer?.email || "",
            },
            notes: localOrder?.notes || {},
          });
          rzp.open();
        });

        return;
      }

      // 3) Native path: integrate RN Razorpay SDK, then call /verify-payment with its response
      throw new Error("Wire native Razorpay SDK then call /verify-payment with its response.");
    } catch (e: any) {
      onError?.(e);
      Alert.alert("Payment", e?.message || String(e));
    }
  };

  const label = (() => {
    const a = paise(localOrder) ?? 0;
    return (a / 100).toFixed(2);
  })();

  return (
    <TouchableOpacity onPress={handlePress} style={[{ backgroundColor: "#111", padding: 12, borderRadius: 8, alignItems: "center" }, style]}>
      <Text style={{ color: "#fff", fontWeight: "700" }}>Pay ₹{label}</Text>
    </TouchableOpacity>
  );
}
