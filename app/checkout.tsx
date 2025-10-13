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
// import * as Linking from "expo-linking";
// import { useRouter } from "expo-router";
// import { useAuth } from "@/features/auth/AuthProvider";
// import { useAppSelector, useAppDispatch } from "../store";
// import { checkoutStyles as styles } from "@/styles/checkout"; // 👈 import styles

// const toPaise = (rupees: number) => Math.round(rupees * 100);
// const paiseToRupees = (paise: number) => Math.round(paise) / 100;

// function getApiBase() {
//   const fromEnv =
//     (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined)?.replace(/\/$/, "");
//   if (fromEnv) return fromEnv;
//   if (typeof window !== "undefined") return window.location.origin;
//   return "https://candle-app-lac.vercel.app";
// }
// const API_BASE = getApiBase();

// export default function CheckoutScreen() {
//   const { user, loading } = useAuth();
//   const router = useRouter();
//   const items = useAppSelector((s) => s.cart?.items ?? []);
//   const dispatch = useAppDispatch();

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

//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [deliveryNotes, setDeliveryNotes] = useState("");
//   const [placing, setPlacing] = useState(false);
//   const [localOrder, setLocalOrder] = useState<any | null>(null);

//   useEffect(() => {
//     if (!loading && !user) {
//       router.replace({ pathname: "/auth/login" as any, params: { redirectTo: "/checkout" } } as any);
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
//         <Text style={{ fontSize: 18, fontWeight: "600" }}>Your cart is empty.</Text>
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
//         return { product_id: it.id ?? it.productId, name: it.name ?? it.title, qty, price_cents: priceCents, price: paiseToRupees(priceCents) };
//       });

//       const subtotalPaiseLocal = orderItems.reduce(
//         (sum: number, it: any) => sum + (it.price_cents ?? 0) * (it.qty ?? 1),
//         0
//       );
//       const totalPaise = subtotalPaiseLocal;

//       setLocalOrder({
//         clientReference: `CANDLE-${Date.now()}`,
//         userId: user?.id ?? null,
//         items: orderItems,
//         subtotal: paiseToRupees(subtotalPaiseLocal),
//         subtotal_paise: subtotalPaiseLocal,
//         total: paiseToRupees(totalPaise),
//         total_paise: totalPaise,
//         customer: { name, phone, address },
//         notes: deliveryNotes ? { delivery: deliveryNotes } : {},
//         createdAt: new Date().toISOString(),
//       });
//     } catch (e: any) {
//       console.error("Prepare order failed:", e);
//       Alert.alert("Order error", e?.message ?? String(e));
//     } finally {
//       setPlacing(false);
//     }
//   };

//   const startPayment = async () => {
//     try {
//       if (!localOrder) {
//         Alert.alert("Missing order", "Please place the order first.");
//         return;
//       }
//       const res = await fetch(`${API_BASE}/api/create-order`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           amount: localOrder.total_paise,
//           currency: "INR",
//           receipt: localOrder.clientReference,
//           notes: {
//             user_id: user?.id ?? null,
//             customer_name: name,
//             phone,
//             shipping_address: address,
//             items: localOrder.items || [],
//             ...localOrder.notes,
//           },
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok || !data?.id) throw new Error(data?.error || "Failed to create order");
//       await Linking.openURL(`${API_BASE}/api/pay?order_id=${encodeURIComponent(data.id)}`);
//     } catch (e: any) {
//       console.error("Payment start error:", e);
//       Alert.alert("Payment error", e?.message || String(e));
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Checkout</Text>

//       <View style={{ marginTop: 12 }}>
//         <Text style={styles.label}>Name</Text>
//         <TextInput value={name} onChangeText={setName} placeholder="Full name" autoCapitalize="words" style={styles.input} />
//       </View>

//       <View style={{ marginTop: 12 }}>
//         <Text style={styles.label}>Phone</Text>
//         <TextInput value={phone} onChangeText={setPhone} placeholder="Mobile number" keyboardType="phone-pad" style={styles.input} />
//       </View>

//       <View style={{ marginTop: 12 }}>
//         <Text style={styles.label}>Address</Text>
//         <TextInput value={address} onChangeText={setAddress} placeholder="Delivery address" multiline style={[styles.input, styles.inputLarge]} />
//       </View>

//       <View style={{ marginTop: 12 }}>
//         <Text style={styles.label}>Delivery notes (optional)</Text>
//         <TextInput value={deliveryNotes} onChangeText={setDeliveryNotes} placeholder="e.g. Ring the bell, leave at door" multiline style={[styles.input, styles.notesInput]} />
//       </View>

//       <View style={styles.summaryBox}>
//         <Text style={styles.summaryLabel}>Summary</Text>
//         <Text>Items: {items.length}</Text>
//         <Text>Subtotal: ₹{subtotal.toFixed(2)}</Text>
//         <Text>Total: ₹{subtotal.toFixed(2)}</Text>
//       </View>

//       <View style={{ marginTop: 18 }}>
//         {!localOrder ? (
//           <Pressable onPress={prepareOrder} disabled={placing} style={[styles.placeOrderBtn, placing && styles.placeOrderBtnDisabled]}>
//             <Text style={styles.placeOrderBtnText}>{placing ? "Preparing order..." : "Place order"}</Text>
//           </Pressable>
//         ) : (
//           <View>
//             <Text style={styles.proceedText}>Proceed to payment</Text>
//             <Pressable onPress={startPayment} style={styles.payBtn}>
//               <Text style={styles.payBtnText}>Pay ₹{subtotal.toFixed(2)}</Text>
//             </Pressable>
//             <Pressable onPress={() => setLocalOrder(null)} style={styles.cancelBtn}>
//               <Text style={styles.cancelBtnText}>Cancel / Edit order</Text>
//             </Pressable>
//           </View>
//         )}
//       </View>
//     </ScrollView>
//   );
// }


// app/checkout.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { useAppSelector } from "../store";
import { checkoutStyles as styles } from "@/styles/checkout";
import PlaceOrderButton2 from "@/components/PlaceOrderButton2";

const toPaise = (rupees: number) => Math.round(rupees * 100);
const paiseToRupees = (paise: number) => Math.round(paise) / 100;

function getApiBase() {
  const fromEnv = (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined)?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;                          // e.g. https://candle-app-lac.vercel.app
  if (typeof window !== "undefined") return window.location.origin;
  return "https://candle-app-lac.vercel.app";
}
const API_BASE = getApiBase();

export default function CheckoutScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const items = useAppSelector((s) => s.cart?.items ?? []);

  const subtotalPaise = items.reduce((sum, it: any) => {
    const qty = Number(it.quantity ?? it.qty ?? 1);
    const cents =
      typeof it.price_cents === "number"
        ? Math.round(it.price_cents)
        : typeof it.price === "number"
        ? Math.round(it.price * 100)
        : toPaise(Number(it.price ?? 0));
    return sum + cents * Math.max(1, qty);
  }, 0);
  const subtotal = paiseToRupees(subtotalPaise);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [localOrder, setLocalOrder] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace({ pathname: "/auth/login" as any, params: { redirectTo: "/checkout" } } as any);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Checking authentication...</Text>
      </View>
    );
  }
  if (!user) return null;

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Your cart is empty.</Text>
        <Pressable onPress={() => router.replace("/")} style={{ marginTop: 12 }}>
          <Text style={{ color: "#111" }}>Go shopping</Text>
        </Pressable>
      </View>
    );
  }

  const validate = () => {
    if (!name.trim()) return "Please enter your name";
    if (!phone.trim()) return "Please enter a phone number";
    if (!address.trim()) return "Please enter delivery address";
    if (items.length === 0) return "Your cart is empty";
    return null;
  };

  const prepareOrder = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Missing information", err);
      return;
    }
    setPlacing(true);
    try {
      const orderItems = items.map((it: any) => {
        const qty = Number(it.quantity ?? it.qty ?? 1);
        const priceCents =
          typeof it.price_cents === "number"
            ? Math.round(it.price_cents)
            : typeof it.price === "number"
            ? Math.round(it.price * 100)
            : toPaise(Number(it.price ?? 0));
        return {
          product_id: it.id ?? it.productId,
          name: it.name ?? it.title,
          qty,
          price_cents: priceCents,
          price: paiseToRupees(priceCents),
        };
      });

      const subtotalPaiseLocal = orderItems.reduce(
        (sum: number, it: any) => sum + (it.price_cents ?? 0) * (it.qty ?? 1),
        0
      );
      const totalPaise = subtotalPaiseLocal;

      setLocalOrder({
        clientReference: `CANDLE-${Date.now()}`,
        userId: user?.id ?? null,
        items: orderItems,
        subtotal: paiseToRupees(subtotalPaiseLocal),
        subtotal_paise: subtotalPaiseLocal,
        total: paiseToRupees(totalPaise),
        total_paise: totalPaise,
        customer: { name, phone, address },
        notes: deliveryNotes ? { delivery: deliveryNotes } : {},
        createdAt: new Date().toISOString(),
      });
    } catch (e: any) {
      console.error("Prepare order failed:", e);
      Alert.alert("Order error", e?.message ?? String(e));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      <View style={{ marginTop: 12 }}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          autoCapitalize="words"
          style={styles.input}
        />
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={styles.label}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Mobile number"
          keyboardType="phone-pad"
          style={styles.input}
        />
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Delivery address"
          multiline
          style={[styles.input, styles.inputLarge]}
        />
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={styles.label}>Delivery notes (optional)</Text>
        <TextInput
          value={deliveryNotes}
          onChangeText={setDeliveryNotes}
          placeholder="e.g. Ring the bell, leave at door"
          multiline
          style={[styles.input, styles.notesInput]}
        />
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Summary</Text>
        <Text>Items: {items.length}</Text>
        <Text>Subtotal: ₹{subtotal.toFixed(2)}</Text>
        <Text>Total: ₹{subtotal.toFixed(2)}</Text>
      </View>

      <View style={{ marginTop: 18 }}>
        {!localOrder ? (
          <Pressable
            onPress={prepareOrder}
            disabled={placing}
            style={[styles.placeOrderBtn, placing && styles.placeOrderBtnDisabled]}
          >
            <Text style={styles.placeOrderBtnText}>
              {placing ? "Preparing order..." : "Place order"}
            </Text>
          </Pressable>
        ) : (
          <View>
            <Text style={styles.proceedText}>Proceed to payment</Text>

            {/* 🔌 Razorpay flow + verify handled inside this component */}
            <PlaceOrderButton2
              localOrder={localOrder}
              backendUrl={`${API_BASE}/api`}
              onPaid={() => {
                // order_number is saved in sessionStorage by the component (web)
                router.replace("/confirmation");
              }}
              onError={(err) => {
                console.error("Payment error:", err);
                Alert.alert("Payment", err?.message || String(err));
              }}
              style={styles.payBtn}
            />

            <Pressable onPress={() => setLocalOrder(null)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel / Edit order</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
