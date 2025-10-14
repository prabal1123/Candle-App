// // app/cart.tsx
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   Pressable,
//   Image,
//   Alert,
//   ImageSourcePropType,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { useAppSelector, useAppDispatch } from "@/store";
// import { clearCart, loadCart } from "@/features/cart/cartSlice";
// import { syncUpdateQuantity, syncRemoveItem } from "@/lib/cartSync";
// import supabase from "@/lib/supabase";
// import { cartStyles as styles } from "@/styles/cartStyles";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// /** helper: generate/persist guestId */
// async function getOrCreateGuestId(): Promise<string> {
//   let guestId = await AsyncStorage.getItem("guest_id");
//   if (!guestId) {
//     guestId = crypto.randomUUID();
//     await AsyncStorage.setItem("guest_id", guestId);
//   }
//   return guestId;
// }

// /** resolve user id OR guest id */
// async function getUserOrGuestId(): Promise<string | null> {
//   try {
//     if (supabase?.auth?.getUser) {
//       const { data } = await supabase.auth.getUser();
//       if (data?.user?.id) return data.user.id;
//     }
//     if (supabase?.auth?.getSession) {
//       const res = await supabase.auth.getSession();
//       if (res?.data?.session?.user?.id) return res.data.session.user.id;
//     }
//     if ((supabase.auth as any)?.user) {
//       const user = (supabase.auth as any).user();
//       if (user?.id) return user.id;
//     }
//   } catch (err) {
//     console.warn("[cart] getUserOrGuestId failed:", err);
//   }

//   // fallback to guestId
//   return await getOrCreateGuestId();
// }

// /** helper to pick image source */
// function pickImageSource(item: any): ImageSourcePropType | null {
//   if (!item) return null;
//   const candidates = [
//     item.thumbnail,
//     item.image,
//     Array.isArray(item.images) ? item.images[0] : undefined,
//     item.img,
//     item.picture,
//   ];
//   for (const cand of candidates) {
//     if (!cand) continue;
//     if (typeof cand === "number") return cand;
//     const str = String(cand).trim();
//     if (str) return { uri: str };
//   }
//   return null;
// }

// function CartItem({
//   item,
//   onInc,
//   onDec,
//   onRemove,
// }: {
//   item: any;
//   onInc: (id: string) => Promise<void>;
//   onDec: (id: string) => Promise<void>;
//   onRemove: (id: string) => Promise<void>;
// }) {
//   const [imgFailed, setImgFailed] = useState(false);
//   const source = !imgFailed ? pickImageSource(item) : null;

//   return (
//     <View style={styles.row}>
//       {source ? (
//         <Image
//           source={source as ImageSourcePropType}
//           style={styles.image}
//           resizeMode="cover"
//           onError={() => setImgFailed(true)}
//         />
//       ) : (
//         <View style={[styles.image, styles.placeholder]}>
//           <Text style={styles.placeholderText}>No Image</Text>
//         </View>
//       )}
//       <View style={styles.info}>
//         <Text style={styles.name} numberOfLines={1}>
//           {item.title ?? item.name ?? "Product"}
//         </Text>
//         <Text style={styles.price}>₹{((Number(item.price) || 0)).toFixed(2)}</Text>
//         <View style={styles.qtyRow}>
//           <Pressable onPress={() => onDec(item.id)} style={styles.qtyBtn}>
//             <Text>-</Text>
//           </Pressable>
//           <Text style={styles.qtyText}>{item.quantity ?? item.qty ?? 1}</Text>
//           <Pressable onPress={() => onInc(item.id)} style={styles.qtyBtn}>
//             <Text>+</Text>
//           </Pressable>
//           <Pressable onPress={() => onRemove(item.id)} style={styles.remove}>
//             <Text style={{ color: "red" }}>Remove</Text>
//           </Pressable>
//         </View>
//       </View>
//     </View>
//   );
// }

// export default function CartScreen() {
//   const dispatch = useAppDispatch();
//   const items = useAppSelector((s) => s.cart?.items ?? []);
//   const router = useRouter();

//   // load cart on mount
//   useEffect(() => {
//     (async () => {
//       const userOrGuestId = await getUserOrGuestId();
//       if (userOrGuestId) {
//         dispatch(loadCart(userOrGuestId));
//       }
//     })();
//   }, [dispatch]);

//   const subtotal = items.reduce(
//     (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1),
//     0
//   );

//   async function onCheckout() {
//     if (items.length === 0) {
//       Alert.alert("Your cart is empty", "Add something before checking out.");
//       return;
//     }
//     router.push("/checkout");
//   }

//   async function onInc(id: string) {
//     const userOrGuestId = await getUserOrGuestId();
//     if (!userOrGuestId) return console.warn("no user/guest id");
//     const it = items.find((i) => i.id === id);
//     if (it) {
//       const newQty = (Number(it.quantity) || 1) + 1;
//       await syncUpdateQuantity(dispatch, userOrGuestId, id, newQty);
//     }
//   }

//   async function onDec(id: string) {
//     const userOrGuestId = await getUserOrGuestId();
//     if (!userOrGuestId) return console.warn("no user/guest id");
//     const it = items.find((i) => i.id === id);
//     if (!it) return;
//     const newQty = (Number(it.quantity) || 1) - 1;
//     if (newQty <= 0) {
//       Alert.alert("Remove item", "Remove this item from cart?", [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Remove",
//           style: "destructive",
//           onPress: async () => {
//             await syncRemoveItem(dispatch, userOrGuestId, id);
//           },
//         },
//       ]);
//     } else {
//       await syncUpdateQuantity(dispatch, userOrGuestId, id, newQty);
//     }
//   }

//   async function onRemove(id: string) {
//     const userOrGuestId = await getUserOrGuestId();
//     if (!userOrGuestId) return console.warn("no user/guest id");
//     await syncRemoveItem(dispatch, userOrGuestId, id);
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Cart</Text>
//       <FlatList
//         data={items}
//         keyExtractor={(i) => String(i.id)}
//         renderItem={({ item }) => (
//           <CartItem item={item} onInc={onInc} onDec={onDec} onRemove={onRemove} />
//         )}
//         ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
//       />
//       <View style={styles.footer}>
//         <Text style={styles.subtotal}>Subtotal: ₹{subtotal.toFixed(2)}</Text>
//         <Pressable style={styles.checkoutBtn} onPress={onCheckout}>
//           <Text style={styles.checkoutText}>Proceed to Checkout</Text>
//         </Pressable>
//         <Pressable
//           onPress={() =>
//             Alert.alert("Clear cart", "Remove all items from cart?", [
//               { text: "Cancel", style: "cancel" },
//               {
//                 text: "Clear",
//                 style: "destructive",
//                 onPress: () => dispatch(clearCart()),
//               },
//             ])
//           }
//           style={{ marginTop: 8 }}
//         >
//           <Text style={{ color: "red", textAlign: "center" }}>Clear cart</Text>
//         </Pressable>
//       </View>
//     </View>
//   );
// }



import React, { useEffect } from "react";
import { View, Text, FlatList, Pressable, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import supabase from "@/lib/supabase";
import { useAppSelector, useAppDispatch } from "@/store";
import { clearCart, loadCart } from "@/features/cart/cartSlice";
import { syncUpdateQuantity, syncRemoveItem, syncClearCart } from "@/lib/cartSync";
import { storage } from "@/lib/storage";
import { cartStyles as styles } from "@/styles/cartStyles";

/** UUID generator */
function makeUUID(): string {
  return (global as any).crypto?.randomUUID?.() ??
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
}

/** Ensure guest UUID persisted */
async function getOrCreateGuestId(): Promise<string> {
  const existing = await storage.getItem("guest_id");
  if (existing) return existing;
  const newId = makeUUID();
  await storage.setItem("guest_id", newId);
  return newId;
}

/** Get logged-in userId or persistent guestId */
async function getUserOrGuestIds() {
  try {
    const { data } = await supabase.auth.getSession();
    const userId = data?.session?.user?.id ?? null;
    const guestId = userId ? null : await getOrCreateGuestId();
    return { userId, guestId };
  } catch {
    const guestId = await getOrCreateGuestId();
    return { userId: null, guestId };
  }
}

export default function CartScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector((s) => s.cart.items);

  useEffect(() => {
    (async () => {
      const ids = await getUserOrGuestIds();
      dispatch(loadCart(ids));
    })();
  }, [dispatch]);

  const subtotal = items.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  );

  async function onCheckout() {
    if (items.length === 0) {
      Alert.alert("Your cart is empty", "Add something before checking out.");
      return;
    }
    router.push("/checkout");
  }

  async function onInc(productId: string) {
    const ids = await getUserOrGuestIds();
    const cartId = useAppSelector((s) => s.cart.cartId);
    const it = items.find((i) => i.id === productId);
    if (it) await syncUpdateQuantity(dispatch, ids, cartId, productId, it.quantity + 1);
  }

  async function onDec(productId: string) {
    const ids = await getUserOrGuestIds();
    const cartId = useAppSelector((s) => s.cart.cartId);
    const it = items.find((i) => i.id === productId);
    if (!it) return;
    const newQty = it.quantity - 1;
    if (newQty <= 0) {
      Alert.alert("Remove item", "Remove this item from cart?", [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => syncRemoveItem(dispatch, ids, cartId, productId) },
      ]);
    } else {
      await syncUpdateQuantity(dispatch, ids, cartId, productId, newQty);
    }
  }

  async function onRemove(productId: string) {
    const ids = await getUserOrGuestIds();
    const cartId = useAppSelector((s) => s.cart.cartId);
    await syncRemoveItem(dispatch, ids, cartId, productId);
  }

  async function onClearCart() {
    const ids = await getUserOrGuestIds();
    const cartId = useAppSelector((s) => s.cart.cartId);
    Alert.alert("Clear cart", "Remove all items from cart?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => syncClearCart(dispatch, ids, cartId) },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.title}</Text>
              <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
              <View style={styles.qtyRow}>
                <Pressable onPress={() => onDec(item.id)} style={styles.qtyBtn}><Text>-</Text></Pressable>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <Pressable onPress={() => onInc(item.id)} style={styles.qtyBtn}><Text>+</Text></Pressable>
                <Pressable onPress={() => onRemove(item.id)} style={styles.remove}><Text style={{ color: "red" }}>Remove</Text></Pressable>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
      />

      <View style={styles.footer}>
        <Text style={styles.subtotal}>Subtotal: ₹{subtotal.toFixed(2)}</Text>
        <Pressable style={styles.checkoutBtn} onPress={onCheckout}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </Pressable>
        <Pressable onPress={onClearCart} style={{ marginTop: 8 }}>
          <Text style={{ color: "red", textAlign: "center" }}>Clear cart</Text>
        </Pressable>
      </View>
    </View>
  );
}
