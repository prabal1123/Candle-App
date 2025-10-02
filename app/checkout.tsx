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
// import { useAppSelector, useAppDispatch } from "../store";
// import PlaceOrderButton from "@/components/PlaceOrderButton";

// /** Helpers **/
// const toPaise = (rupees: number) => Math.round(rupees * 100);
// const paiseToRupees = (paise: number) => Math.round(paise) / 100;

// export default function CheckoutScreen() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   const items = useAppSelector((s) => s.cart?.items ?? []);
//   const dispatch = useAppDispatch();

//   // compute subtotal from cart items
//   const subtotalPaise = items.reduce((sum, it: any) => {
//     const qty = Number(it.quantity ?? it.qty ?? 1);
//     const cents =
//       typeof it.price_cents === "number"
//         ? Math.round(it.price_cents)
//         : typeof it.price === "number"
//         ? Math.round(it.price * 100)
//         : toPaise(Number(it.price ?? 0));
//     return sum + cents * Math.max(1, qty);
//   }, 0);
//   const subtotal = paiseToRupees(subtotalPaise);

//   // form state
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [deliveryNotes, setDeliveryNotes] = useState(""); // optional
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

//   /** Build the local order that PlaceOrderButton will use */
//   const prepareOrder = async () => {
//     const err = validate();
//     if (err) {
//       Alert.alert("Missing information", err);
//       return;
//     }

//     setPlacing(true);
//     try {
//       const orderItems = items.map((it: any) => {
//         const qty = Number(it.quantity ?? it.qty ?? 1);
//         const priceCents =
//           typeof it.price_cents === "number"
//             ? Math.round(it.price_cents)
//             : typeof it.price === "number"
//             ? Math.round(it.price * 100)
//             : toPaise(Number(it.price ?? 0));

//         return {
//           product_id: it.id ?? it.productId,
//           name: it.name ?? it.title,
//           qty,
//           price_cents: priceCents,
//           price: paiseToRupees(priceCents), // human-friendly rupees
//         };
//       });

//       const subtotalPaiseLocal = orderItems.reduce(
//         (sum: number, it: any) => sum + (it.price_cents ?? 0) * (it.qty ?? 1),
//         0
//       );
//       const shippingPaise = 0; // adjust if you add shipping
//       const totalPaise = subtotalPaiseLocal + shippingPaise;

//       const order = {
//         clientReference: `CANDLE-${Date.now()}`,
//         userId: user?.id ?? null,
//         items: orderItems,
//         subtotal: paiseToRupees(subtotalPaiseLocal),
//         subtotal_paise: subtotalPaiseLocal,
//         shipping: paiseToRupees(shippingPaise),
//         shipping_paise: shippingPaise,
//         total: paiseToRupees(totalPaise),
//         total_paise: totalPaise,
//         customer: { name, phone, address },
//         notes: deliveryNotes ? { delivery: deliveryNotes } : {},
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

//   /** Called after PlaceOrderButton verifies payment on the server */
//   const handlePaymentSuccess = async (verifyResponse: any) => {
//     setProcessingPayment(true);
//     try {
//       if (!verifyResponse?.ok || !verifyResponse?.orderId) {
//         throw new Error("Payment verified but no orderId returned");
//       }
//       const orderId = String(verifyResponse.orderId);

//       // Clear cart now that order is saved
//       dispatch(clearCart());

//       // Go to confirmation
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
//           autoCapitalize="words"
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

//       <View style={{ marginTop: 12 }}>
//         <Text style={{ fontWeight: "600" }}>Delivery notes (optional)</Text>
//         <TextInput
//           value={deliveryNotes}
//           onChangeText={setDeliveryNotes}
//           placeholder="e.g. Ring the bell, leave at door"
//           multiline
//           style={{
//             borderWidth: 1,
//             borderColor: "#ddd",
//             padding: 10,
//             borderRadius: 8,
//             marginTop: 6,
//             height: 70,
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
//               customer={{ name, phone, address }}   // 👈 passes into verify payload
//               userId={user?.id ?? null}             // 👈 saves to orders.user_id
//               notes={localOrder?.notes}             // 👈 saves to orders.notes (jsonb)
//               onPaid={handlePaymentSuccess}
//               onError={handlePaymentError}
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
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { clearCart } from "@/features/cart/cartSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:3000";
const RZP_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
type CartItem = {
  id: string;
  title: string;
  price: number; // in INR (rupees)
  quantity: number;
};

async function createRazorpayOrderOnBackend(amountInPaise: number, receipt?: string) {
  const res = await fetch(`${BACKEND_URL}/api/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountInPaise, receipt }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Failed to create order: ${res.status} ${msg}`);
  }
  return (await res.json()) as { id: string; amount: number; currency: string };
}

async function verifyPaymentOnBackend(payload: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) {
  // Optional but strongly recommended:
  // Your backend should verify signature using your Razorpay secret
  // Return { ok: true } if valid
  try {
    const res = await fetch(`${BACKEND_URL}/api/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    return Boolean((data as any).ok ?? true);
  } catch {
    // If you haven't built /verify-payment yet, allow success to proceed.
    return true;
  }
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  // ----- Grab cart from Redux -----
  const items = useAppSelector((s) => s.cart.items) as CartItem[];
  const [name, setName] = useState(user?.user_metadata?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");

  const [placing, setPlacing] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items]
  );
  const amountInPaise = Math.max(Math.round(subtotal * 100), 0);

  const canPay =
    items.length > 0 &&
    amountInPaise > 0 &&
    !!RZP_KEY_ID &&
    !!name.trim() &&
    !!email.trim();

  // ---------------------------------------------------------------------------
  // Payment Handler
  // ---------------------------------------------------------------------------
  const onPayPress = async () => {
    if (!canPay) {
      if (!RZP_KEY_ID) {
        Alert.alert("Config missing", "Razorpay key is not set in env.");
      } else if (items.length === 0) {
        Alert.alert("Cart is empty", "Add items to your cart before paying.");
      } else if (!name || !email) {
        Alert.alert("Details required", "Please enter your name and email.");
      } else {
        Alert.alert("Invalid amount", "Order amount must be greater than zero.");
      }
      return;
    }

    setPlacing(true);
    try {
      // 1) Create order on your backend
      const receipt = `CANDLE-${Date.now()}`;
      const order = await createRazorpayOrderOnBackend(amountInPaise, receipt);

      // 2) Open checkout (native on iOS/Android, web popup on web)
      if (Platform.OS === "web") {
        await payWithWeb(order);
      } else {
        await payWithNative(order);
      }

      // 3) If we reach here, payment + (optional) verification passed
      dispatch(clearCart());
      router.replace({
        pathname: "/confirmation",
        params: {
          amount: String(order.amount / 100),
          currency: order.currency,
          orderId: order.id,
        },
      });
    } catch (err: any) {
      const msg = err?.message || "Payment failed. Please try again.";
      Alert.alert("Payment Error", msg);
      console.warn("[Checkout] error:", err);
    } finally {
      setPlacing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Native (React Native) flow
  // ---------------------------------------------------------------------------
  const payWithNative = async (order: { id: string; amount: number; currency: string }) => {
    // Lazy require so web bundlers don’t choke
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RazorpayCheckout = require("react-native-razorpay").default;

    const options = {
      key: RZP_KEY_ID,
      amount: order.amount, // in paise
      currency: order.currency,
      name: "Candle App",
      description: "Order Payment",
      order_id: order.id,
      prefill: {
        name: name || user?.user_metadata?.name || "",
        email: email || user?.email || "",
        contact: phone || "",
      },
      theme: { color: "#111827" }, // slate-900
      image:
        "https://raw.githubusercontent.com/simple-icons/simple-icons/master/icons/candle.svg",
      notes: {
        app: "Candle App",
        user_id: user?.id ?? "guest",
      },
    } as const;

    const data = await RazorpayCheckout.open(options); // throws on cancel/fail

    // data has: razorpay_payment_id, razorpay_order_id, razorpay_signature
    const verified = await verifyPaymentOnBackend({
      razorpay_payment_id: data.razorpay_payment_id,
      razorpay_order_id: data.razorpay_order_id,
      razorpay_signature: data.razorpay_signature,
    });
    if (!verified) {
      throw new Error("Payment could not be verified. Please contact support.");
    }
  };

  // ---------------------------------------------------------------------------
  // Web (browser) flow
  // ---------------------------------------------------------------------------
  const payWithWeb = async (order: { id: string; amount: number; currency: string }) => {
    // Ensure checkout.js is loaded
    await ensureRzpScript();

    // @ts-expect-error Razorpay is injected globally by checkout.js
    const rzp = new window.Razorpay({
      key: RZP_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Candle App",
      description: "Order Payment",
      order_id: order.id,
      prefill: {
        name: name || user?.user_metadata?.name || "",
        email: email || user?.email || "",
        contact: phone || "",
      },
      theme: { color: "#111827" },
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        const ok = await verifyPaymentOnBackend(response);
        if (!ok) throw new Error("Payment verification failed");
      },
      modal: {
        ondismiss: () => {
          // Throw to trigger the catch and show user-friendly error
          throw new Error("Payment cancelled by user");
        },
      },
    });

    rzp.open();
    // Optional: return a promise that resolves on success by listening to events
    await new Promise<void>((resolve, reject) => {
      // Razorpay doesn’t provide direct promise on web; we resolve in handler or reject in ondismiss
      // We’ll use a small timeout guard so the function doesn’t hang forever if something goes wrong.
      let settled = false;
      const done = (fn: () => void) => {
        if (!settled) {
          settled = true;
          fn();
        }
      };
      // After handler runs, ensure we resolve
      (rzp as any).on("payment.success", () => done(() => resolve()));
      (rzp as any).on("payment.error", (e: any) =>
        done(() => reject(new Error(e?.error?.description || "Payment failed")))
      );
      // Fallback timeout (in case events don’t fire)
      setTimeout(() => done(() => resolve()), 4000);
    });
  };

  async function ensureRzpScript() {
    if (Platform.OS !== "web") return;
    // @ts-expect-error global
    if (window.Razorpay) return;
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay script"));
      document.body.appendChild(script);
    });
  }

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Checkout</Text>

      {/* Order Summary */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 16,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 8,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
          Order Summary
        </Text>
        {items.map((it) => (
          <View
            key={it.id}
            style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 4 }}
          >
            <Text style={{ flex: 1 }}>{it.title} × {it.quantity}</Text>
            <Text>₹ {(it.price * it.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View
          style={{
            height: 1,
            backgroundColor: "#e5e7eb",
            marginVertical: 8,
          }}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "700" }}>Total</Text>
          <Text style={{ fontWeight: "700" }}>₹ {(subtotal).toFixed(2)}</Text>
        </View>
      </View>

      {/* Contact / Billing */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 16,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 8,
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Billing Details</Text>

        <Text>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          autoCapitalize="words"
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 10,
            padding: 12,
          }}
        />

        <Text>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 10,
            padding: 12,
          }}
        />

        <Text>Phone (optional)</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="98765 43210"
          keyboardType="phone-pad"
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 10,
            padding: 12,
          }}
        />
      </View>

      {/* Pay Button */}
      <Pressable
        onPress={onPayPress}
        disabled={!canPay || placing}
        style={{
          backgroundColor: !canPay || placing ? "#9ca3af" : "#111827",
          borderRadius: 999,
          paddingVertical: 16,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {placing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            Pay ₹ {(subtotal).toFixed(2)}
          </Text>
        )}
      </Pressable>

      {/* Dev helpers */}
      {!RZP_KEY_ID ? (
        <Text style={{ color: "#b91c1c" }}>
          Missing EXPO_PUBLIC_RAZORPAY_KEY_ID — set it in your env to enable payments.
        </Text>
      ) : null}
      {Platform.OS !== "web" ? (
        <Text style={{ color: "#6b7280", fontSize: 12 }}>
          Using native Razorpay SDK on {Platform.OS}.
        </Text>
      ) : (
        <Text style={{ color: "#6b7280", fontSize: 12 }}>
          Using Razorpay web popup (checkout.js).
        </Text>
      )}
    </ScrollView>
  );
}
