// app/cart.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  Alert,
  ImageSourcePropType,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppSelector, useAppDispatch } from "@/store";
import { clearCart, loadCart } from "@/features/cart/cartSlice";
import { syncUpdateQuantity, syncRemoveItem } from "@/lib/cartSync";
import supabase from "@/lib/supabaseClient"; // default import (guarded client)
import { cartStyles as styles } from "@/styles/cartStyles";




/**
 * Small helper: pick a reasonable image source from common product shapes.
 * Supports bundler numbers (require(...)) or remote url strings.
 */
function pickImageSource(item: any): ImageSourcePropType | null {
  if (!item) return null;
  const candidates = [
    item.thumbnail,
    item.image,
    Array.isArray(item.images) ? item.images[0] : undefined,
    item.img,
    item.picture,
  ];

  for (const cand of candidates) {
    if (!cand) continue;
    if (typeof cand === "number") return cand; // bundler asset require(...)
    const str = String(cand).trim();
    if (!str) continue;
    return { uri: str };
  }

  return null;
}

/**
 * CartItem - isolated component so it can manage `onError` state for images.
 */
function CartItem({
  item,
  onInc,
  onDec,
  onRemove,
}: {
  item: any;
  onInc: (id: string) => Promise<void>;
  onDec: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const source = !imgFailed ? pickImageSource(item) : null;

  return (
    <View style={styles.row}>
      {source ? (
        <Image
          source={source as ImageSourcePropType}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.title ?? item.name ?? "Product"}
        </Text>

        <Text style={styles.price}>₹{((Number(item.price) || 0)).toFixed(2)}</Text>

        <View style={styles.qtyRow}>
          <Pressable onPress={() => onDec(item.id)} style={styles.qtyBtn}>
            <Text>-</Text>
          </Pressable>

          <Text style={styles.qtyText}>{item.quantity ?? item.qty ?? 1}</Text>

          <Pressable onPress={() => onInc(item.id)} style={styles.qtyBtn}>
            <Text>+</Text>
          </Pressable>

          <Pressable onPress={() => onRemove(item.id)} style={styles.remove}>
            <Text style={{ color: "red" }}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart?.items ?? []);
  // **Important**: restore cartId selector so we can sync guest carts
  const cartId = useAppSelector((s) => s.cart?.cartId ?? null);
  const router = useRouter();

  // Load cart from Supabase when screen opens — done safely (supabase may be null)
  useEffect(() => {
    (async () => {
      if (!supabase || !supabase.auth) {
        console.warn(
          "[supabase] client not available; skipping auth-based cart load."
        );
        return;
      }

      try {
        if (typeof supabase.auth.getUser === "function") {
          const { data, error } = await supabase.auth.getUser();
          if (error) {
            console.warn("[supabase] getUser error:", error);
          }
          const user = data?.user ?? null;
          if (user) {
            dispatch(loadCart(user.id));
          }
        } else if (typeof supabase.auth.getSession === "function") {
          const res = await supabase.auth.getSession();
          const user = res?.data?.session?.user ?? null;
          if (user) {
            dispatch(loadCart(user.id));
          }
        } else if (typeof (supabase.auth as any).user === "function") {
          const user = (supabase.auth as any).user();
          if (user) {
            dispatch(loadCart(user.id));
          }
        } else {
          console.warn(
            "[supabase] auth API shape not recognized; skipping"
          );
        }
      } catch (err) {
        console.error("[cart] supabase auth check failed:", err);
      }
    })();
  }, [dispatch]);

  const subtotal = items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  );

  async function onCheckout() {
    if (items.length === 0) {
      Alert.alert("Your cart is empty", "Add something before checking out.");
      return;
    }
    router.push("/checkout");
  }

  // helper to get current user id, safely — FALLBACK to cartId for guest carts
  async function getUserId(): Promise<string | null> {
    if (!supabase || !supabase.auth) {
      // If supabase isn't configured, return cartId (guest cart) if present
      return cartId ?? null;
    }

    try {
      if (typeof supabase.auth.getUser === "function") {
        const { data } = await supabase.auth.getUser();
        return data?.user?.id ?? cartId ?? null;
      } else if (typeof supabase.auth.getSession === "function") {
        const res = await supabase.auth.getSession();
        return res?.data?.session?.user?.id ?? cartId ?? null;
      } else if (typeof (supabase.auth as any).user === "function") {
        const user = (supabase.auth as any).user();
        return user?.id ?? cartId ?? null;
      }
    } catch (err) {
      console.warn("[cart] getUserId failed:", err);
    }
    return cartId ?? null;
  }

  async function onInc(id: string) {
    const userId = await getUserId();
    if (!userId) {
      // still log, but we attempt to call sync helper with cartId fallback already
      console.warn("Can't sync increase: no user id and no cartId");
      return;
    }
    const it = items.find((i) => i.id === id);
    if (it) {
      const newQty = (Number(it.quantity) || 1) + 1;
      await syncUpdateQuantity(dispatch, userId, id, newQty);
    }
  }

  async function onDec(id: string) {
    const userId = await getUserId();
    if (!userId) {
      console.warn("Can't sync decrease: no user id and no cartId");
      return;
    }
    const it = items.find((i) => i.id === id);
    if (!it) return;

    const newQty = (Number(it.quantity) || 1) - 1;
    if (newQty <= 0) {
      Alert.alert("Remove item", "Remove this item from cart?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await syncRemoveItem(dispatch, userId, id);
          },
        },
      ]);
    } else {
      await syncUpdateQuantity(dispatch, userId, id, newQty);
    }
  }

  async function onRemove(id: string) {
    const userId = await getUserId();
    if (!userId) {
      console.warn("Can't remove item: no user id and no cartId");
      return;
    }
    await syncRemoveItem(dispatch, userId, id);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <CartItem item={item} onInc={onInc} onDec={onDec} onRemove={onRemove} />
        )}
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
              {
                text: "Clear",
                style: "destructive",
                onPress: () => dispatch(clearCart()),
              },
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
