// app/cart.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useAppSelector, useAppDispatch } from "@/store"; // we exported hooks from store/index.ts
import { removeFromCart, updateQuantity, clearCart } from "@/features/cart/cartSlice";

export default function CartScreen() {
  const dispatch = useAppDispatch();
  // SAFELY get the items array (fallback to empty array)
  const items = useAppSelector((s) => s.cart?.items ?? []);
  const router = useRouter();

  const subtotal = items.reduce(
    (s, it) => s + (it.price || 0) * (it.quantity || 1),
    0
  );

  function onCheckout() {
    if (items.length === 0) {
      Alert.alert("Your cart is empty", "Add something before checking out.");
      return;
    }
    router.push("/checkout");
  }

  function onInc(id: string) {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    dispatch(updateQuantity({ id, qty: it.quantity + 1 }));
  }

  function onDec(id: string) {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    const newQty = it.quantity - 1;
    if (newQty <= 0) {
      // ask confirm remove
      Alert.alert("Remove item", "Remove this item from cart?", [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => dispatch(removeFromCart(id)) },
      ]);
      return;
    }
    dispatch(updateQuantity({ id, qty: newQty }));
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      {item.image ? (
        <Image source={item.image} style={styles.image} />
      ) : (
        <View style={[styles.image, { backgroundColor: "#eee" }]} />
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{item.title ?? item.name}</Text>
        <Text style={styles.price}>₹{(item.price || 0).toFixed(2)}</Text>

        <View style={styles.qtyRow}>
          <Pressable onPress={() => onDec(item.id)} style={styles.qtyBtn}>
            <Text>-</Text>
          </Pressable>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <Pressable onPress={() => onInc(item.id)} style={styles.qtyBtn}>
            <Text>+</Text>
          </Pressable>

          <Pressable onPress={() => dispatch(removeFromCart(item.id))} style={styles.remove}>
            <Text style={{ color: "red" }}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
      />

      <View style={styles.footer}>
        <Text style={styles.subtotal}>Subtotal: ₹{subtotal.toFixed(2)}</Text>

        <Pressable style={styles.checkoutBtn} onPress={onCheckout}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </Pressable>

        <Pressable
          onPress={() =>
            Alert.alert("Clear cart", "Remove all items from cart?", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: () => dispatch(clearCart()) },
            ])
          }
          style={{ marginTop: 8 }}
        >
          <Text style={{ color: "red", textAlign: "center" }}>Clear cart</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  row: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderColor: "#eee" },
  image: { width: 84, height: 84, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  name: { fontWeight: "600" },
  price: { marginTop: 6, color: "#333" },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#ddd", borderRadius: 6 },
  qtyText: { marginHorizontal: 8 },
  remove: { marginLeft: 16 },
  footer: { paddingVertical: 12, borderTopWidth: 1, borderColor: "#eee" },
  subtotal: { fontWeight: "700", fontSize: 16, marginBottom: 8 },
  checkoutBtn: { backgroundColor: "#111", paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  checkoutText: { color: "#fff", fontWeight: "700" },
  empty: { textAlign: "center", padding: 16, color: "#666" },
});
