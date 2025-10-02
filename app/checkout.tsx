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
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { clearCart } from "@/features/cart/cartSlice";
import { useAppSelector, useAppDispatch } from "../store";
import PlaceOrderButton from "@/components/PlaceOrderButton";

/** Helpers **/
const toPaise = (rupees: number) => Math.round(rupees * 100);
const paiseToRupees = (paise: number) => Math.round(paise) / 100;

export default function CheckoutScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const items = useAppSelector((s) => s.cart?.items ?? []);
  const dispatch = useAppDispatch();

  // compute subtotal from cart items
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

  // form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState(""); // optional
  const [placing, setPlacing] = useState(false);

  const [localOrder, setLocalOrder] = useState<any | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.replace({
        pathname: "/auth/login" as any,
        params: { redirectTo: "/checkout" },
      } as any);
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
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          Your cart is empty.
        </Text>
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

  /** Build the local order that PlaceOrderButton will use */
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
          price: paiseToRupees(priceCents), // human-friendly rupees
        };
      });

      const subtotalPaiseLocal = orderItems.reduce(
        (sum: number, it: any) => sum + (it.price_cents ?? 0) * (it.qty ?? 1),
        0
      );
      const shippingPaise = 0; // adjust if you add shipping
      const totalPaise = subtotalPaiseLocal + shippingPaise;

      const order = {
        clientReference: `CANDLE-${Date.now()}`,
        userId: user?.id ?? null,
        items: orderItems,
        subtotal: paiseToRupees(subtotalPaiseLocal),
        subtotal_paise: subtotalPaiseLocal,
        shipping: paiseToRupees(shippingPaise),
        shipping_paise: shippingPaise,
        total: paiseToRupees(totalPaise),
        total_paise: totalPaise,
        customer: { name, phone, address },
        notes: deliveryNotes ? { delivery: deliveryNotes } : {},
        createdAt: new Date().toISOString(),
      };

      setLocalOrder(order);
    } catch (e: any) {
      console.error("Prepare order failed:", e);
      Alert.alert("Order error", e?.message ?? String(e));
    } finally {
      setPlacing(false);
    }
  };

  /** Called after PlaceOrderButton verifies payment on the server */
  const handlePaymentSuccess = async (verifyResponse: any) => {
    setProcessingPayment(true);
    try {
      if (!verifyResponse?.ok || !verifyResponse?.orderId) {
        throw new Error("Payment verified but no orderId returned");
      }
      const orderId = String(verifyResponse.orderId);

      // Clear cart now that order is saved
      dispatch(clearCart());

      // Go to confirmation
      router.replace({ pathname: "/confirmation", params: { orderId } } as any);
    } catch (e: any) {
      console.error("Post-payment handling failed", e);
      Alert.alert("Error", e?.message ?? String(e));
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentError = (err: any) => {
    console.warn("Payment error", err);
    Alert.alert("Payment error", typeof err === "string" ? err : JSON.stringify(err));
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
          autoCapitalize="words"
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

      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: "600" }}>Delivery notes (optional)</Text>
        <TextInput
          value={deliveryNotes}
          onChangeText={setDeliveryNotes}
          placeholder="e.g. Ring the bell, leave at door"
          multiline
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            padding: 10,
            borderRadius: 8,
            marginTop: 6,
            height: 70,
            textAlignVertical: "top",
          }}
        />
      </View>

      <View
        style={{
          marginTop: 18,
          padding: 12,
          backgroundColor: "#fafafa",
          borderRadius: 8,
        }}
      >
        <Text style={{ fontWeight: "600" }}>Summary</Text>
        <Text>Items: {items.length}</Text>
        <Text>Subtotal: ₹{subtotal.toFixed(2)}</Text>
        <Text>Total: ₹{subtotal.toFixed(2)}</Text>
      </View>

      <View style={{ marginTop: 18 }}>
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
          <View>
            <Text style={{ marginBottom: 8 }}>Proceed to payment</Text>

            <PlaceOrderButton
              localOrder={localOrder}
              customer={{ name, phone, address }}   // 👈 passes into verify payload
              userId={user?.id ?? null}             // 👈 saves to orders.user_id
              notes={localOrder?.notes}             // 👈 saves to orders.notes (jsonb)
              onPaid={handlePaymentSuccess}
              onError={handlePaymentError}
            />

            <View style={{ marginTop: 12 }}>
              <Pressable
                onPress={() => setLocalOrder(null)}
                style={{ paddingVertical: 8, alignItems: "center" }}
              >
                <Text style={{ color: "#666" }}>Cancel / Edit order</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {processingPayment && (
        <View style={{ marginTop: 12 }}>
          <ActivityIndicator />
          <Text style={{ textAlign: "center", marginTop: 8 }}>
            Processing payment & saving order...
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
