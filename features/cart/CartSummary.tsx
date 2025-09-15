// features/cart/CartSummary.tsx
import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useCart } from "./useCart"; // adjust path if needed

export default function CartSummary() {
  // use the shape your hook exposes: { cart: CartState, addToCart, removeFromCart, updateQuantity, clearCart }
  const cartHook = useCart();
  const { cart, removeFromCart, updateQuantity } = cartHook as any;

  // guard: cart might be undefined early
  const items = cart && Array.isArray(cart.items) ? cart.items : [];

  if (!items || items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {items.map((item: any) => (
        <View key={item.id} style={styles.row}>
          {/* Handle both bundler require() numbers and URL strings */}
          <Image
            source={typeof item.img === "number" ? item.img : { uri: String(item.img) }}
            style={styles.thumb}
            resizeMode="cover"
          />

          <View style={styles.meta}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.price}>₹{Number(item.price).toFixed(2)}</Text>

            <View style={styles.controlsRow}>
              <Pressable
                onPress={() => {
                  const newQty = Math.max(0, (item.qty || 1) - 1);
                  // if qty becomes 0, you might prefer to remove the item — adjust as desired
                  updateQuantity && updateQuantity(item.id, newQty);
                }}
                style={styles.qtyBtn}
              >
                <Text>-</Text>
              </Pressable>

              <Text style={styles.qtyText}>{item.qty ?? 1}</Text>

              <Pressable
                onPress={() => updateQuantity && updateQuantity(item.id, (item.qty || 1) + 1)}
                style={styles.qtyBtn}
              >
                <Text>+</Text>
              </Pressable>

              <Pressable onPress={() => removeFromCart && removeFromCart(item.id)} style={styles.removeBtn}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { padding: 12 },
  empty: { padding: 24 },
  emptyText: { color: "#666", fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  thumb: { width: 80, height: 80, borderRadius: 10, backgroundColor: "#eee", marginRight: 12 },
  meta: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700" },
  price: { color: "#666", marginTop: 6 },
  controlsRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
  },
  qtyText: { marginHorizontal: 10, fontWeight: "700" },
  removeBtn: { marginLeft: 12 },
  removeText: { color: "#d04646", fontWeight: "600" },
});
