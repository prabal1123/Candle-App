// // app/checkout.tsx
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Pressable,
//   Alert,
//   ActivityIndicator,
//   ScrollView,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { useAuth } from "@/features/auth/AuthProvider";
// import { clearCart } from "@/features/cart/cartSlice";
// import { useAppSelector, useAppDispatch } from "../store"; // adjust if needed

// // Payment button
// import PlaceOrderButton from "@/components/PlaceOrderButton";

// const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:4242";

// /** Helpers for money conversions **/
// const toPaise = (valueInRupees: number) => Math.round(valueInRupees * 100);
// const paiseToRupeesStr = (paise: number) => (paise / 100).toFixed(2);

// export default function CheckoutScreen() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   const items = useAppSelector((s) => s.cart?.items ?? []);
//   const dispatch = useAppDispatch();

//   // Compute subtotal in paise (robust: prefer price_cents, otherwise use price in rupees)
//   const subtotalPaise = items.reduce((sum, it) => {
//     const qty = Number(it.quantity ?? it.qty ?? 1);
//     const cents =
//       typeof it.price_cents === "number"
//         ? Math.round(it.price_cents)
//         : typeof it.price === "number"
//         ? Math.round(it.price * 100)
//         : toPaise(Number(it.price ?? 0));
//     return sum + cents * Math.max(1, qty);
//   }, 0);

//   // also keep subtotal rupees for display
//   const subtotal = Number((subtotalPaise / 100).toFixed(2));

//   // form
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [placing, setPlacing] = useState(false);

//   const [localOrder, setLocalOrder] = useState<any | null>(null);
//   const [processingPayment, setProcessingPayment] = useState(false);

//   // auth guard
//   useEffect(() => {
//     if (!loading && !user) {
//       router.replace({
//         pathname: "/auth/login" as any,
//         params: { redirectTo: "/checkout" },
//       } as any);
//     }
//   }, [user, loading]);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//         <ActivityIndicator />
//         <Text style={{ marginTop: 8 }}>Checking authentication...</Text>
//       </View>
//     );
//   }

//   if (!user) return null;

//   if (items.length === 0) {
//     return (
//       <View style={{ flex: 1, padding: 16 }}>
//         <Text style={{ fontSize: 18, fontWeight: "600" }}>
//           Your cart is empty.
//         </Text>
//         <Pressable onPress={() => router.replace("/")} style={{ marginTop: 12 }}>
//           <Text style={{ color: "#111" }}>Go shopping</Text>
//         </Pressable>
//       </View>
//     );
//   }

//   const validate = () => {
//     if (!name.trim()) return "Please enter your name";
//     if (!phone.trim()) return "Please enter a phone number";
//     if (!address.trim()) return "Please enter delivery address";
//     if (items.length === 0) return "Your cart is empty";
//     return null;
//   };

//   // prepare local order
//   const prepareOrder = async () => {
//     const err = validate();
//     if (err) {
//       Alert.alert("Missing information", err);
//       return;
//     }

//     setPlacing(true);
//     try {
//       // Build items with price_cents included
//       const orderItems = items.map((it: any) => {
//         const qty = Number(it.quantity ?? it.qty ?? 1);
//         const priceCents =
//           typeof it.price_cents === "number"
//             ? Math.round(it.price_cents)
//             : typeof it.price === "number"
//             ? Math.round(it.price * 100)
//             : toPaise(Number(it.price ?? 0));

//         return {
//           productId: it.id ?? it.productId,
//           name: it.name ?? it.title,
//           qty,
//           price_cents: priceCents,
//           // include human-friendly rupees price too if you want
//           price: Number((priceCents / 100).toFixed(2)),
//         };
//       });

//       // compute totals
//       const subtotalPaiseLocal = orderItems.reduce(
//         (sum: number, it: any) => sum + (it.price_cents ?? 0) * (it.qty ?? 1),
//         0
//       );
//       const shippingPaise = 0; // adjust logic if needed
//       const totalPaise = subtotalPaiseLocal + shippingPaise;

//       const order = {
//         clientReference: `CANDLE-${Date.now()}`,
//         userId: user?.id ?? null,
//         items: orderItems,
//         subtotal: Number((subtotalPaiseLocal / 100).toFixed(2)), // rupees for display
//         subtotal_paise: subtotalPaiseLocal, // paise for payment/backend
//         shipping: Number((shippingPaise / 100).toFixed(2)), // rupees
//         shipping_paise: shippingPaise,
//         total: Number((totalPaise / 100).toFixed(2)), // rupees
//         total_paise: totalPaise, // paise
//         customer: { name, phone, address },
//         createdAt: new Date().toISOString(),
//       };

//       setLocalOrder(order);
//     } catch (e: any) {
//       console.error("Prepare order failed:", e);
//       Alert.alert("Order error", e?.message ?? String(e));
//     } finally {
//       setPlacing(false);
//     }
//   };

//   // ✅ FIXED: now only clears cart + redirects, no extra verify call
//   const handlePaymentSuccess = async (verifyResponse: any) => {
//     setProcessingPayment(true);
//     try {
//       if (!verifyResponse?.ok || !verifyResponse?.orderId) {
//         throw new Error("Payment verified but no orderId returned");
//       }

//       const orderId = String(verifyResponse.orderId);

//       // Success: backend already verified & persisted
//       dispatch(clearCart());

//       // Go to confirmation screen
//       router.replace({ pathname: "/confirmation", params: { orderId } } as any);
//     } catch (e: any) {
//       console.error("Post-payment handling failed", e);
//       Alert.alert("Error", e?.message ?? String(e));
//     } finally {
//       setProcessingPayment(false);
//     }
//   };

//   const handlePaymentError = (err: any) => {
//     console.warn("Payment error", err);
//     Alert.alert("Payment error", typeof err === "string" ? err : JSON.stringify(err));
//   };

//   return (
//     <ScrollView contentContainerStyle={{ padding: 16 }}>
//       <Text style={{ fontSize: 22, fontWeight: "700" }}>Checkout</Text>

//       <View style={{ marginTop: 12 }}>
//         <Text style={{ fontWeight: "600" }}>Name</Text>
//         <TextInput
//           value={name}
//           onChangeText={setName}
//           placeholder="Full name"
//           style={{
//             borderWidth: 1,
//             borderColor: "#ddd",
//             padding: 10,
//             borderRadius: 8,
//             marginTop: 6,
//           }}
//         />
//       </View>

//       <View style={{ marginTop: 12 }}>
//         <Text style={{ fontWeight: "600" }}>Phone</Text>
//         <TextInput
//           value={phone}
//           onChangeText={setPhone}
//           placeholder="Mobile number"
//           keyboardType="phone-pad"
//           style={{
//             borderWidth: 1,
//             borderColor: "#ddd",
//             padding: 10,
//             borderRadius: 8,
//             marginTop: 6,
//           }}
//         />
//       </View>

//       <View style={{ marginTop: 12 }}>
//         <Text style={{ fontWeight: "600" }}>Address</Text>
//         <TextInput
//           value={address}
//           onChangeText={setAddress}
//           placeholder="Delivery address"
//           multiline
//           style={{
//             borderWidth: 1,
//             borderColor: "#ddd",
//             padding: 10,
//             borderRadius: 8,
//             marginTop: 6,
//             height: 110,
//             textAlignVertical: "top",
//           }}
//         />
//       </View>

//       <View
//         style={{
//           marginTop: 18,
//           padding: 12,
//           backgroundColor: "#fafafa",
//           borderRadius: 8,
//         }}
//       >
//         <Text style={{ fontWeight: "600" }}>Summary</Text>
//         <Text>Items: {items.length}</Text>
//         <Text>Subtotal: ₹{subtotal.toFixed(2)}</Text>
//         <Text>Total: ₹{subtotal.toFixed(2)}</Text>
//       </View>

//       <View style={{ marginTop: 18 }}>
//         {!localOrder ? (
//           <Pressable
//             onPress={prepareOrder}
//             disabled={placing}
//             style={{
//               backgroundColor: placing ? "#ccc" : "#111",
//               paddingVertical: 12,
//               borderRadius: 8,
//               alignItems: "center",
//             }}
//           >
//             <Text style={{ color: "#fff", fontWeight: "700" }}>
//               {placing ? "Preparing order..." : "Place order"}
//             </Text>
//           </Pressable>
//         ) : (
//           <View>
//             <Text style={{ marginBottom: 8 }}>Proceed to payment</Text>

//             <PlaceOrderButton
//               localOrder={localOrder}
//               backendUrl={BACKEND_URL}
//               onPaid={(verifyResponse: any) => handlePaymentSuccess(verifyResponse)}
//               onError={(err: any) => handlePaymentError(err)}
//             />

//             <View style={{ marginTop: 12 }}>
//               <Pressable
//                 onPress={() => setLocalOrder(null)}
//                 style={{ paddingVertical: 8, alignItems: "center" }}
//               >
//                 <Text style={{ color: "#666" }}>Cancel / Edit order</Text>
//               </Pressable>
//             </View>
//           </View>
//         )}
//       </View>

//       {processingPayment && (
//         <View style={{ marginTop: 12 }}>
//           <ActivityIndicator />
//           <Text style={{ textAlign: "center", marginTop: 8 }}>
//             Processing payment & saving order...
//           </Text>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// app/checkout.tsx
// components/PlaceOrderButton.tsx
import React from "react";
import { Platform, TouchableOpacity, Text, Alert } from "react-native";
import { supabase } from "@/lib/supabase";

type Customer = { name?: string; phone?: string; address?: string };

type Props = {
  localOrder: any;
  backendUrl?: string;
  customer?: Customer;
  userId?: string | null;
  notes?: any;
  onPaid?: (verifyResponse: any) => void;
  onError?: (err: any) => void;
  style?: any;
};

const MIN_AMOUNT_PAISA = 100; // ₹1

/** API base: env first, then your deployed Vercel URL */
const DEFAULT_API_BASE =
  process.env.EXPO_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://candle-app-lac.vercel.app/api";

function apiBase(backendUrl?: string) {
  return (backendUrl?.replace(/\/$/, "") || DEFAULT_API_BASE) as string;
}

/** Resolve total (in paise) from localOrder */
function resolveAmountPaise(localOrder: any): number | null {
  if (!localOrder) return null;

  if (Number.isFinite(localOrder?.total_paise)) return Math.round(localOrder.total_paise);
  if (Number.isFinite(localOrder?.subtotal_paise)) return Math.round(localOrder.subtotal_paise);

  if (Array.isArray(localOrder?.items) && localOrder.items.length > 0) {
    try {
      const total = localOrder.items.reduce((sum: number, it: any) => {
        const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
        if (Number.isFinite(it.price_cents)) return sum + Math.round(it.price_cents) * qty;
        if (Number.isFinite(it.price)) return sum + Math.round(it.price * 100) * qty;
        return sum;
      }, 0);
      if (total > 0) return total;
    } catch {}
  }

  for (const f of ["total", "subtotal", "amount"] as const) {
    const v = localOrder?.[f];
    if (v != null && !Number.isNaN(Number(v))) return Math.round(Number(v) * 100);
  }

  return null;
}

function paiseToRupeesStr(paise?: number | null) {
  if (typeof paise !== "number" || Number.isNaN(paise)) return "0.00";
  return (paise / 100).toFixed(2);
}

export default function PlaceOrderButton({
  localOrder,
  backendUrl,
  customer,
  userId: userIdProp,
  notes,
  onPaid,
  onError,
  style,
}: Props) {
  const getAmountInPaise = (): number | null => {
    try {
      const p = resolveAmountPaise(localOrder);
      return p ?? null;
    } catch (e) {
      console.error("[PlaceOrderButton] getAmountInPaise error", e);
      return null;
    }
  };

  const getUserId = async (): Promise<string | null> => {
    if (userIdProp) return userIdProp;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) return null;
      return data?.user?.id ?? null;
    } catch {
      return null;
    }
  };

  const handlePress = async () => {
    console.log("[PlaceOrderButton] click");
    try {
      const amountInPaise = getAmountInPaise();
      if (!amountInPaise || amountInPaise < MIN_AMOUNT_PAISA) {
        const msg = `Amount must be ≥ ${MIN_AMOUNT_PAISA} paise. Got: ${String(amountInPaise)}`;
        onError?.({ ok: false, error: msg });
        Alert.alert("Invalid amount", msg);
        return;
      }

      const base = apiBase(backendUrl);
      const isWeb = Platform.OS === "web";

      const receipt = localOrder?.clientReference ?? localOrder?.id ?? `CANDLE-${Date.now()}`;
      const userId = await getUserId();

      // Normalize customer + shipping details
      const cust = {
        name: customer?.name ?? localOrder?.customer?.name,
        phone: customer?.phone ?? localOrder?.customer?.phone,
        address: customer?.address ?? localOrder?.customer?.address ?? localOrder?.shipping_address,
      };

      const items = Array.isArray(localOrder?.items) ? localOrder.items : null;

      // Optional raw payload (for your server logs)
      const rawPayloadForServer: any = {
        user_id: userId,
        amount: amountInPaise,
        currency: "INR",
        items,
        notes: notes ?? localOrder?.notes ?? null,
        customer: cust,
        shipping_address: cust.address ?? null,
      };

      // --- 1) CREATE ORDER ---
      const createOrderResp = await fetch(`${base}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt,
          notes: notes ?? localOrder?.notes ?? {},
          raw_payload: rawPayloadForServer,
        }),
      });

      let order: any;
      try {
        order = await createOrderResp.json();
      } catch {
        const t = await createOrderResp.text().catch(() => "<no-body>");
        throw new Error(`create-order returned non-JSON (status ${createOrderResp.status}): ${t}`);
      }
      if (!createOrderResp.ok || !order?.id) {
        throw new Error(order?.error || "create-order failed");
      }

      // --- 2) WEB CHECKOUT (popup) ---
      if (isWeb) {
        const popup = window.open("about:blank", "_blank", "width=600,height=700");
        if (!popup) {
          const e = { ok: false, error: "Popup blocked" };
          onError?.(e);
          Alert.alert("Popup blocked", "Please allow popups for this site.");
          return;
        }

        const listener = async (ev: MessageEvent) => {
          try {
            if (!ev?.data) return;
            let msg: any;
            try {
              msg = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
            } catch {
              msg = ev.data;
            }

            if (msg?.type === "razorpay_success" && msg?.payload) {
              const localReceipt = localOrder?.clientReference ?? localOrder?.id ?? order?.id ?? receipt;

              // Build verify body with all customer fields
              const verifyBody: any = {
                razorpay_order_id: msg.payload?.razorpay_order_id ?? msg.payload?.order_id,
                razorpay_payment_id: msg.payload?.razorpay_payment_id ?? msg.payload?.payment_id,
                razorpay_signature: msg.payload?.razorpay_signature ?? msg.payload?.signature,
                local_receipt: localReceipt,

                user_id: userId,
                customer_name: cust.name,
                phone: cust.phone,
                shipping_address: cust.address,
                items,
                notes: notes ?? localOrder?.notes ?? {},
              };

              let headers: Record<string, string> = { "Content-Type": "application/json" };
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
              } catch {}

              const verifyResp = await fetch(`${base}/verify-payment`, {
                method: "POST",
                headers,
                body: JSON.stringify(verifyBody),
              });

              let verifyJson: any;
              try {
                verifyJson = await verifyResp.json();
              } catch {
                const t = await verifyResp.text().catch(() => "<no-body>");
                verifyJson = { ok: verifyResp.ok, status: verifyResp.status, text: t };
              }

              window.removeEventListener("message", listener);
              try { popup?.close(); } catch {}

              if (verifyResp.ok && verifyJson?.ok) {
                onPaid?.(verifyJson); // { ok:true, orderId, order_number }
              } else {
                onError?.(verifyJson);
                Alert.alert("Verification failed", JSON.stringify(verifyJson));
              }
            } else if (msg?.type === "razorpay_dismiss") {
              window.removeEventListener("message", listener);
              try { popup?.close(); } catch {}
              const e = { ok: false, error: "Checkout dismissed" };
              onError?.(e);
              Alert.alert("Checkout closed", "You closed the payment window.");
            } else if (msg?.type === "razorpay_error") {
              window.removeEventListener("message", listener);
              try { popup?.close(); } catch {}
              const e = { ok: false, error: msg?.payload || "Checkout error" };
              onError?.(e);
              Alert.alert("Payment error", String(msg?.payload || "Unknown error"));
            }
          } catch (err) {
            console.error("[PlaceOrderButton] message handler error", err);
            window.removeEventListener("message", listener);
            try { (popup as any)?.close?.(); } catch {}
            onError?.({ ok: false, error: String(err) });
          }
        };

        window.addEventListener("message", listener);

        // Inject Razorpay checkout into popup
        const safeName = (cust.name || "Candle App").replace(/"/g, '\\"');
        const html = `
<!doctype html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
<script>
(function(){
  try {
    const options = {
      key: "${order.key_id}",
      amount: "${order.amount}",
      currency: "${order.currency}",
      name: "${safeName}",
      description: "Order Payment",
      order_id: "${order.id}",
      handler: function(response){
        window.opener && window.opener.postMessage(JSON.stringify({ type: 'razorpay_success', payload: response }), '*');
        document.body.innerHTML = '<div style="font-family: system-ui, Arial; padding: 20px;">Payment successful. You can close this window.</div>';
      },
      modal: { ondismiss: function(){ window.opener && window.opener.postMessage(JSON.stringify({ type: 'razorpay_dismiss' }), '*'); } }
    };
    var rzp = new Razorpay(options);
    rzp.open();
  } catch (e) {
    window.opener && window.opener.postMessage(JSON.stringify({ type: 'razorpay_error', payload: String(e) }), '*');
    document.body.innerHTML = '<pre style="color:red">' + String(e) + '</pre>';
  }
})();
</script>
</body>
</html>`.trim();

        popup.document.open();
        popup.document.write(html);
        popup.document.close();
        return;
      }

      // --- 3) NATIVE path (replace this block with real Razorpay SDK) ---
      // Simulate a success and then verify on server so details are saved
      const simulatedRzpResponse = {
        razorpay_order_id: order.id,
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_signature: "dummy_signature", // Replace with SDK value
      };

      const verifyBody: any = {
        ...simulatedRzpResponse,
        local_receipt: receipt,
        user_id: userId,
        customer_name: cust.name,
        phone: cust.phone,
        shipping_address: cust.address,
        items,
        notes: notes ?? localOrder?.notes ?? {},
      };

      let headers: Record<string, string> = { "Content-Type": "application/json" };
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
      } catch {}

      const verifyResp = await fetch(`${base}/verify-payment`, {
        method: "POST",
        headers,
        body: JSON.stringify(verifyBody),
      });

      const verifyJson = await verifyResp.json().catch(() => ({}));
      if (verifyResp.ok && verifyJson?.ok) {
        onPaid?.(verifyJson);
      } else {
        onError?.(verifyJson);
        Alert.alert("Verification failed", JSON.stringify(verifyJson));
      }
    } catch (err: any) {
      console.error("[PlaceOrderButton] payment error", err);
      onError?.(err);
      Alert.alert("Payment error", err?.message || String(err));
    }
  };

  const amountPaiseForUI = getAmountInPaise();
  const rupeesLabel = paiseToRupeesStr(amountPaiseForUI ?? 0);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={{
        backgroundColor: "#111",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        ...(Platform.OS === "web" ? { cursor: "pointer" as any } : null),
        ...(style || {}),
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700" }}>Pay ₹{rupeesLabel}</Text>
    </TouchableOpacity>
  );
}
