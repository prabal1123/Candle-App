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
// //import { useAppSelector, useAppDispatch } from "../store/hooks"; // keep if this resolves in your project
// import { clearCart } from "@/features/cart/cartSlice";
// import { useAppSelector, useAppDispatch } from "../store";

// export default function CheckoutScreen() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   // SAFE selector: guard if s.cart is undefined
//   const items = useAppSelector((s) => s.cart?.items ?? []);
//   const dispatch = useAppDispatch();

//   const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

//   // form
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [placing, setPlacing] = useState(false);

//   // auth guard + redirect to login (with redirectTo param)
//   useEffect(() => {
//     if (!loading && !user) {
//       // cast pathname to any to avoid expo-router route-union typing issues
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

//   if (!user) return null; // redirect is in progress

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

//   const placeOrder = async () => {
//     const err = validate();
//     if (err) {
//       Alert.alert("Missing information", err);
//       return;
//     }

//     setPlacing(true);
//     try {
//       const order = {
//         id: `CANDLE-${Date.now()}`,
//         userId: user?.id ?? null,
//         items,
//         subtotal,
//         shipping: 0,
//         total: subtotal,
//         customer: { name, phone, address },
//         createdAt: new Date().toISOString(),
//       };

//       // optionally persist to Supabase here

//       dispatch(clearCart());

//       const encoded = encodeURIComponent(JSON.stringify(order));
//       router.replace({ pathname: "/confirmation", params: { order: encoded } } as any);
//     } catch (e: any) {
//       console.error("Place order failed:", e);
//       Alert.alert("Order error", e?.message ?? String(e));
//       setPlacing(false);
//     }
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

//       <View style={{ marginTop: 18, padding: 12, backgroundColor: "#fafafa", borderRadius: 8 }}>
//         <Text style={{ fontWeight: "600" }}>Summary</Text>
//         <Text>Items: {items.length}</Text>
//         <Text>Subtotal: ₹{subtotal.toFixed(2)}</Text>
//         <Text>Total: ₹{subtotal.toFixed(2)}</Text>
//       </View>

//       <View style={{ marginTop: 18 }}>
//         <Pressable
//           onPress={placeOrder}
//           disabled={placing}
//           style={{
//             backgroundColor: placing ? "#ccc" : "#111",
//             paddingVertical: 12,
//             borderRadius: 8,
//             alignItems: "center",
//           }}
//         >
//           <Text style={{ color: "#fff", fontWeight: "700" }}>
//             {placing ? "Placing order..." : "Place order"}
//           </Text>
//         </Pressable>
//       </View>
//     </ScrollView>
//   );
// }




// app/checkout.tsx
import React, { useEffect, useState } from "react";
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
//import { useAppSelector, useAppDispatch } from "../store/hooks"; // keep if this resolves in your project
import { clearCart } from "@/features/cart/cartSlice";
import { useAppSelector, useAppDispatch } from "../store";

// Payment button (web-only). Keep the file at app/components/PlaceOrderButton.tsx
import PlaceOrderButton from "../components/PlaceOrderButton";

export default function CheckoutScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // SAFE selector: guard if s.cart is undefined
  const items = useAppSelector((s) => s.cart?.items ?? []);
  const dispatch = useAppDispatch();

  const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

  // form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);

  // local order state: create order object and pass to PlaceOrderButton
  const [localOrder, setLocalOrder] = useState<any | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // auth guard + redirect to login (with redirectTo param)
  useEffect(() => {
    if (!loading && !user) {
      // cast pathname to any to avoid expo-router route-union typing issues
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

  if (!user) return null; // redirect is in progress

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

  // prepare order locally (do NOT clear cart here)
  const prepareOrder = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Missing information", err);
      return;
    }

    setPlacing(true);
    try {
      const order = {
        id: `CANDLE-${Date.now()}`,
        userId: user?.id ?? null,
        items,
        subtotal,
        shipping: 0,
        total: subtotal,
        customer: { name, phone, address },
        createdAt: new Date().toISOString(),
      };

      // set local order - the PlaceOrderButton will call backend /place-order and then open Razorpay
      setLocalOrder(order);
    } catch (e: any) {
      console.error("Prepare order failed:", e);
      Alert.alert("Order error", e?.message ?? String(e));
    } finally {
      setPlacing(false);
    }
  };

  // called when /verify-payment returns verified: true (via PlaceOrderButton.onPaid)
  const handlePaymentSuccess = async (verifyPayload: any) => {
    try {
      setProcessingPayment(true);
      // Now it's safe to clear the cart and navigate to confirmation
      dispatch(clearCart());

      const encoded = encodeURIComponent(JSON.stringify({ ...localOrder, payment: verifyPayload }));
      router.replace({ pathname: "/confirmation", params: { order: encoded } } as any);
    } catch (e: any) {
      console.error("Post-payment handling failed", e);
      Alert.alert("Error", String(e?.message ?? e));
    } finally {
      setProcessingPayment(false);
    }
  };

  // called if payment fails / verification fails
  const handlePaymentError = (err: any) => {
    console.warn("Payment error", err);
    Alert.alert("Payment error", typeof err === "string" ? err : JSON.stringify(err));
    // keep cart intact so user can retry
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Checkout</Text>

      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: "600" }}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            padding: 10,
            borderRadius: 8,
            marginTop: 6,
          }}
        />
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: "600" }}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Mobile number"
          keyboardType="phone-pad"
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            padding: 10,
            borderRadius: 8,
            marginTop: 6,
          }}
        />
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: "600" }}>Address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Delivery address"
          multiline
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            padding: 10,
            borderRadius: 8,
            marginTop: 6,
            height: 110,
            textAlignVertical: "top",
          }}
        />
      </View>

      <View style={{ marginTop: 18, padding: 12, backgroundColor: "#fafafa", borderRadius: 8 }}>
        <Text style={{ fontWeight: "600" }}>Summary</Text>
        <Text>Items: {items.length}</Text>
        <Text>Subtotal: ₹{subtotal.toFixed(2)}</Text>
        <Text>Total: ₹{subtotal.toFixed(2)}</Text>
      </View>

      <View style={{ marginTop: 18 }}>
        {/* If localOrder is not created yet, show the prepare button (keeps original look) */}
        {!localOrder ? (
          <Pressable
            onPress={prepareOrder}
            disabled={placing}
            style={{
              backgroundColor: placing ? "#ccc" : "#111",
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {placing ? "Preparing order..." : "Place order"}
            </Text>
          </Pressable>
        ) : (
          // Once localOrder exists, show the web payment button (PlaceOrderButton)
          <View>
            <Text style={{ marginBottom: 8 }}>Proceed to payment (web checkout)</Text>

            {/* PlaceOrderButton will call your /place-order endpoint and open Razorpay */}
            <PlaceOrderButton
              localOrder={localOrder}
              backendUrl={process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:4242"}
              onPaid={(verifyPayload: any) => handlePaymentSuccess(verifyPayload)}
              onError={(err: any) => handlePaymentError(err)}
            />

            <View style={{ marginTop: 12 }}>
              <Pressable
                onPress={() => {
                  // allow user to cancel payment attempt and edit order
                  setLocalOrder(null);
                }}
                style={{
                  paddingVertical: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666" }}>Cancel / Edit order</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
