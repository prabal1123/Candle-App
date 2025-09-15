// // app/product/[id].tsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   Pressable,
//   ScrollView,
//   FlatList,
//   TouchableOpacity,
//   Animated,
//   StyleSheet,
// } from "react-native";
// import { useLocalSearchParams, Link, useRouter } from "expo-router";

// // keep imports consistent with your working files (same pattern as app/index.tsx)
// import { productDetailStyles as styles } from "@/styles";
// import { useCart } from "@/features/cart/useCart";

// // types
// type Product = {
//   id: string;
//   title: string;
//   price: number;
//   description: string;
//   image: any;
//   category?: string;
// };

// const PRODUCTS: Product[] = [
//   {
//     id: "1",
//     title: "Vanilla Bean Candle",
//     price: 12.99,
//     description:
//       "Warm and cozy vanilla scent with soy wax. Burns clean for 40+ hours.",
//     image: require("../../assets/images/candles/product1.jpg"),
//     category: "classic",
//   },
//   {
//     id: "2",
//     title: "Lavender Dreams",
//     price: 14.5,
//     description: "Relaxing lavender blend perfect for evening wind-downs.",
//     image: require("../../assets/images/candles/product2.jpg"),
//     category: "relax",
//   },
//   {
//     id: "3",
//     title: "Citrus Zest",
//     price: 11.0,
//     description: "Bright citrus notes — great for kitchens and daytime energy.",
//     image: require("../../assets/images/candles/product3.jpg"),
//     category: "fresh",
//   },
//   {
//     id: "4",
//     title: "Rose & Amber",
//     price: 16.25,
//     description: "Romantic rose with a warm amber base.",
//     image: require("../../assets/images/candles/product3.jpg"),
//     category: "classic",
//   },
//   {
//     id: "5",
//     title: "Eucalyptus Mint",
//     price: 13.75,
//     description: "Clearing eucalyptus with a cooling mint touch.",
//     image: require("../../assets/images/candles/product2.jpg"),
//     category: "relax",
//   },
// ];

// export default function ProductDetail() {
//   const params = useLocalSearchParams<{ id: string }>();
//   const productId = params.id;
//   const [product, setProduct] = useState<Product | undefined>(undefined);

//   // cart hook from your features
//   const { addToCart } = useCart();
//   const router = useRouter();

//   // toast state (simple)
//   const [toastMsg, setToastMsg] = useState<string | null>(null);
//   const [toastAnim] = useState(() => new Animated.Value(0));

//   useEffect(() => {
//     if (!productId) return;
//     const found = PRODUCTS.find((p) => p.id === String(productId));
//     setProduct(found);
//   }, [productId]);

//   const related = useMemo(() => {
//     if (!product) return PRODUCTS.filter((p) => p.id !== productId).slice(0, 3);
//     const sameCat = PRODUCTS.filter(
//       (p) => p.id !== product.id && p.category === product.category
//     );
//     if (sameCat.length >= 2) return sameCat.slice(0, 3);
//     return PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);
//   }, [product, productId]);

//   if (!product) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.notFound}>Product not found.</Text>
//       </View>
//     );
//   }

//   const showToast = (message: string, duration = 900) => {
//     setToastMsg(message);
//     toastAnim.setValue(0);
//     Animated.timing(toastAnim, {
//       toValue: 1,
//       duration: 220,
//       useNativeDriver: true,
//     }).start();

//     setTimeout(() => {
//       Animated.timing(toastAnim, {
//         toValue: 0,
//         duration: 220,
//         useNativeDriver: true,
//       }).start(() => {
//         setToastMsg(null);
//       });
//     }, duration);
//   };

//   const handleAddToCart = () => {
//     try {
//       // ensure payload shape matches your cart slice (use `name` instead of `title`)
//       addToCart({
//         id: product.id,
//         name: product.title,
//         price: product.price,
//         image: product.image,
//       });

//       // show toast
//       showToast(`${product.title} added to cart`);

//       // navigate to cart after a short delay so user sees toast
//       setTimeout(() => {
//         router.push("/cart");
//       }, 700);
//     } catch (err) {
//       showToast("Could not add item");
//       // eslint-disable-next-line no-console
//       console.error("Add to cart failed:", err);
//     }
//   };

//   const renderRelatedItem = ({ item }: { item: Product }) => (
//     <Link href={`/product/${item.id}`} asChild>
//       <TouchableOpacity style={styles.relatedCard} activeOpacity={0.8}>
//         <Image source={item.image} style={styles.relatedImage} />
//         <Text style={styles.relatedTitle}>{item.title}</Text>
//         <Text style={styles.relatedPrice}>${item.price.toFixed(2)}</Text>
//       </TouchableOpacity>
//     </Link>
//   );

//   return (
//     <View style={{ flex: 1 }}>
//       <ScrollView style={styles.container}>
//         <Image source={product.image} style={styles.productImage} />

//         <View style={styles.infoBlock}>
//           <Text style={styles.title}>{product.title}</Text>
//           <Text style={styles.price}>${product.price.toFixed(2)}</Text>
//           <Text style={styles.description}>{product.description}</Text>
//         </View>

//         <Pressable onPress={handleAddToCart} style={styles.addButton}>
//           <Text style={styles.addButtonText}>Add to cart</Text>
//         </Pressable>

//         {/* Related products section */}
//         <View style={styles.relatedSection}>
//           <Text style={styles.relatedHeader}>Related Products</Text>

//           <FlatList
//             data={related}
//             keyExtractor={(i) => i.id}
//             renderItem={renderRelatedItem}
//             numColumns={2}
//             columnWrapperStyle={{ justifyContent: "space-between" }}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <Text style={styles.noRelated}>No related products found.</Text>
//             }
//           />
//         </View>

//         <View style={{ height: 40 }} />
//       </ScrollView>

//       {/* Toast / Snackbar */}
//       {toastMsg && (
//         <Animated.View
//           pointerEvents="none"
//           style={[
//             toastStyles.container,
//             {
//               opacity: toastAnim,
//               transform: [
//                 {
//                   translateY: toastAnim.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: [18, 0],
//                   }),
//                 },
//               ],
//             },
//           ]}
//         >
//           <Text style={toastStyles.text}>{toastMsg}</Text>
//         </Animated.View>
//       )}
//     </View>
//   );
// }

// const toastStyles = StyleSheet.create({
//   container: {
//     position: "absolute",
//     bottom: 36,
//     left: 24,
//     right: 24,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     backgroundColor: "rgba(0,0,0,0.85)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   text: { color: "#fff", fontWeight: "600" },
// });



// // app/product/[id].tsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   Pressable,
//   ScrollView,
//   FlatList,
//   TouchableOpacity,
//   Animated,
//   StyleSheet,
// } from "react-native";
// import { useLocalSearchParams, Link, useRouter } from "expo-router";

// // keep imports consistent with your working files (same pattern as app/index.tsx)
// import { productDetailStyles as styles } from "@/styles";
// import { useCart } from "@/features/cart/useCart";
// import { Theme } from "@/styles/theme";
// import Button from "../../components/Button";

// // types
// type Product = {
//   id: string;
//   title: string;
//   price: number;
//   description: string;
//   image: any;
//   category?: string;
// };

// const PRODUCTS: Product[] = [
//   {
//     id: "1",
//     title: "Vanilla Bean Candle",
//     price: 12.99,
//     description: "Warm and cozy vanilla scent with soy wax. Burns clean for 40+ hours.",
//     image: require("../../assets/images/candles/product1.jpg"),
//     category: "classic",
//   },
//   {
//     id: "2",
//     title: "Lavender Dreams",
//     price: 14.5,
//     description: "Relaxing lavender blend perfect for evening wind-downs.",
//     image: require("../../assets/images/candles/product2.jpg"),
//     category: "relax",
//   },
//   {
//     id: "3",
//     title: "Citrus Zest",
//     price: 11.0,
//     description: "Bright citrus notes — great for kitchens and daytime energy.",
//     image: require("../../assets/images/candles/product3.jpg"),
//     category: "fresh",
//   },
//   {
//     id: "4",
//     title: "Rose & Amber",
//     price: 16.25,
//     description: "Romantic rose with a warm amber base.",
//     image: require("../../assets/images/candles/product3.jpg"),
//     category: "classic",
//   },
//   {
//     id: "5",
//     title: "Eucalyptus Mint",
//     price: 13.75,
//     description: "Clearing eucalyptus with a cooling mint touch.",
//     image: require("../../assets/images/candles/product2.jpg"),
//     category: "relax",
//   },
// ];

// export default function ProductDetail() {
//   const params = useLocalSearchParams<{ id: string }>();
//   const productId = params.id;
//   const [product, setProduct] = useState<Product | undefined>(undefined);

//   // cart hook from your features
//   const { addToCart } = useCart();
//   const router = useRouter();

//   // toast state (simple)
//   const [toastMsg, setToastMsg] = useState<string | null>(null);
//   const [toastAnim] = useState(() => new Animated.Value(0));

//   useEffect(() => {
//     if (!productId) return;
//     const found = PRODUCTS.find((p) => p.id === String(productId));
//     setProduct(found);
//   }, [productId]);

//   const related = useMemo(() => {
//     if (!product) return PRODUCTS.filter((p) => p.id !== productId).slice(0, 3);
//     const sameCat = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category);
//     if (sameCat.length >= 2) return sameCat.slice(0, 3);
//     return PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);
//   }, [product, productId]);

//   if (!product) {
//     return (
//       <View style={localStyles.center}>
//         <Text style={localStyles.notFound}>Product not found.</Text>
//       </View>
//     );
//   }

//   const showToast = (message: string, duration = 900) => {
//     setToastMsg(message);
//     toastAnim.setValue(0);
//     Animated.timing(toastAnim, {
//       toValue: 1,
//       duration: 220,
//       useNativeDriver: true,
//     }).start();

//     setTimeout(() => {
//       Animated.timing(toastAnim, {
//         toValue: 0,
//         duration: 220,
//         useNativeDriver: true,
//       }).start(() => {
//         setToastMsg(null);
//       });
//     }, duration);
//   };

//   const handleAddToCart = () => {
//     try {
//       // ensure payload shape matches your cart slice (use `name` instead of `title` if your cart expects that)
//       addToCart({
//         id: product.id,
//         name: product.title,
//         price: product.price,
//         image: product.image,
//       });

//       // show toast
//       showToast(`${product.title} added to cart`);

//       // navigate to cart after a short delay so user sees toast
//       setTimeout(() => {
//         router.push("/cart");
//       }, 700);
//     } catch (err) {
//       showToast("Could not add item");
//       // eslint-disable-next-line no-console
//       console.error("Add to cart failed:", err);
//     }
//   };

//   const renderRelatedItem = ({ item }: { item: Product }) => (
//     <Link href={`/product/${item.id}`} asChild>
//       <TouchableOpacity style={styles.relatedCard} activeOpacity={0.8}>
//         <Image source={item.image} style={styles.relatedImage} />
//         <Text style={styles.relatedTitle}>{item.title}</Text>
//         <Text style={styles.relatedPrice}>${item.price.toFixed(2)}</Text>
//       </TouchableOpacity>
//     </Link>
//   );

//   return (
//     <View style={{ flex: 1 }}>
//       <ScrollView style={styles.container}>
//         <Image source={product.image} style={styles.productImage} />

//         <View style={styles.infoBlock}>
//           <Text style={styles.title}>{product.title}</Text>
//           <Text style={styles.price}>${product.price.toFixed(2)}</Text>
//           <Text style={styles.description}>{product.description}</Text>
//         </View>

//         <View style={{ paddingHorizontal: Theme.spacing.lg }}>
//           <Button onPress={handleAddToCart} testID="add-to-cart">
//             Add to cart
//           </Button>
//         </View>

//         {/* Related products section */}
//         <View style={styles.relatedSection}>
//           <Text style={styles.relatedHeader}>Related Products</Text>

//           <FlatList
//             data={related}
//             keyExtractor={(i) => i.id}
//             renderItem={renderRelatedItem}
//             numColumns={2}
//             columnWrapperStyle={{ justifyContent: "space-between" }}
//             scrollEnabled={false}
//             ListEmptyComponent={<Text style={styles.noRelated}>No related products found.</Text>}
//           />
//         </View>

//         <View style={{ height: 40 }} />
//       </ScrollView>

//       {/* Toast / Snackbar */}
//       {toastMsg && (
//         <Animated.View
//           pointerEvents="none"
//           style={[
//             toastStyles.container,
//             {
//               opacity: toastAnim,
//               transform: [
//                 {
//                   translateY: toastAnim.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: [18, 0],
//                   }),
//                 },
//               ],
//             },
//           ]}
//         >
//           <Text style={toastStyles.text}>{toastMsg}</Text>
//         </Animated.View>
//       )}
//     </View>
//   );
// }

// const toastStyles = StyleSheet.create({
//   container: {
//     position: "absolute",
//     bottom: 36,
//     left: 24,
//     right: 24,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     backgroundColor: "rgba(0,0,0,0.85)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   text: { color: "#fff", fontWeight: "600" },
// });

// const localStyles = StyleSheet.create({
//   center: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: Theme.spacing.lg,
//   },
//   notFound: {
//     fontSize: Theme.fontSize.base,
//     color: Theme.colors.muted,
//     marginBottom: Theme.spacing.md,
//   },
// });

// app/product/[id].tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Alert,
  Animated,
  Platform,
} from "react-native";
import { useLocalSearchParams, Link, useRouter } from "expo-router";
import { PRODUCTS, PRODUCTS_MAP } from "@/data/products";
import { productListStyles as listStyles } from "@/styles/productList";
import productDetailStyles from "@/styles/productDetail";

// adjust import path if your hook lives elsewhere
import { useCart } from "@/features/cart/useCart";

export default function ProductDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = String(params.id || params.productId || "");
  const product = (PRODUCTS_MAP && PRODUCTS_MAP[id]) || PRODUCTS.find((p) => p.id === id);

  // graceful guard if hook doesn't exist or has different API
  let cartHook: any;
  try {
    cartHook = useCart();
  } catch (err) {
    cartHook = null;
    console.warn("useCart hook not available or threw:", err);
  }

  // extract addToCart if present
  const addToCartFn = cartHook && (cartHook.addToCart || cartHook.addItem || cartHook.dispatch ? cartHook.addToCart : undefined);

  // local toast state
  const [toastVisible, setToastVisible] = useState(false);
  const toastOpacity = React.useRef(new Animated.Value(0)).current;

  const showToast = useCallback((message = "Added to cart") => {
    setToastVisible(true);
    // animate in
    Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    // auto-hide
    setTimeout(() => {
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setToastVisible(false));
    }, 1400);
  }, [toastOpacity]);

  if (!product) {
    return (
      <View style={{ padding: 28 }}>
        <Text>Product not found</Text>
        <Link href="/product">
          <Text style={{ color: "#0a84ff", marginTop: 12 }}>Back to products</Text>
        </Link>
      </View>
    );
  }

  const { width } = useWindowDimensions();
  const dynamicHeight = Math.min(420, Math.round(width * 0.4));

  const handleAddToCart = () => {
    const payload = {
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
    };

    // 1) If the hook exposes addToCart, use it.
    if (cartHook && typeof cartHook.addToCart === "function") {
      try {
        cartHook.addToCart(payload, 1);
        showToast(`${product.name} added`);
      } catch (err) {
        console.error("addToCart failed", err);
        Alert.alert("Error", "Could not add to cart.");
      }
      return;
    }

    // 2) If hook exposes addItem, try that.
    if (cartHook && typeof cartHook.addItem === "function") {
      try {
        cartHook.addItem({ ...payload, qty: 1 });
        showToast(`${product.name} added`);
      } catch (err) {
        console.error("addItem failed", err);
        Alert.alert("Error", "Could not add to cart.");
      }
      return;
    }

    // 3) If hook exposes dispatch (redux-style), try a safe dispatch fallback.
    if (cartHook && typeof cartHook.dispatch === "function") {
      try {
        // common redux action type — adjust if your slice uses a different type
        cartHook.dispatch({ type: "cart/addItem", payload: { ...payload, qty: 1 } });
        showToast(`${product.name} added`);
      } catch (err) {
        console.error("dispatch addItem failed", err);
        Alert.alert("Error", "Could not add to cart.");
      }
      return;
    }

    // 4) Nothing matched — fallback: open alert and console so you can wire it correctly
    console.warn("No suitable addToCart function found on useCart(). Please adapt the ProductDetail handler to your cart API.");
    Alert.alert("Info", "Added to cart (debug) — but cart hook not wired. Check console.");
    showToast(`${product.name} added`);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 28 }}>
        <Image
          source={typeof product.img === "number" ? product.img : ({ uri: String(product.img) } as any)}
          style={[productDetailStyles.productImage, { height: dynamicHeight }]}
        />

        <Text style={productDetailStyles.title}>{product.name}</Text>
        <Text style={productDetailStyles.price}>₹{product.price}</Text>
        {product.desc ? <Text style={productDetailStyles.description}>{product.desc}</Text> : null}

        {/* Add to cart wrapped so styles apply */}
        <View style={productDetailStyles.addButtonWrapper}>
          <View style={productDetailStyles.addButtonContainer}>
            <Pressable
              style={productDetailStyles.addButton}
              onPress={handleAddToCart}
              accessibilityRole="button"
              accessibilityLabel={`Add ${product.name} to cart`}
            >
              <Text style={productDetailStyles.addButtonText}>Add to cart</Text>
            </Pressable>
          </View>
        </View>

        <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 26, marginBottom: 12 }}>Related Products</Text>

        <View style={listStyles.gridColWrapper}>
          {PRODUCTS.filter((p) => p.id !== id)
            .slice(0, 4)
            .map((p) => (
              <View key={p.id} style={listStyles.col3}>
                <Link href={`/product/${p.id}`} asChild>
                  <Pressable style={listStyles.productCard}>
                    <Image
                      source={typeof p.img === "number" ? p.img : ({ uri: String(p.img) } as any)}
                      style={listStyles.productImage}
                    />
                    <View style={listStyles.productInfo}>
                      <Text style={listStyles.productTitle}>{p.name}</Text>
                      <Text style={listStyles.productPrice}>₹{p.price}</Text>
                    </View>
                  </Pressable>
                </Link>
              </View>
            ))}
        </View>
      </ScrollView>

      {/* Toast / small feedback overlay */}
      {toastVisible && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "fixed" as any,
            left: 0,
            right: 0,
            bottom: Platform.OS === "web" ? 28 : 18,
            alignItems: "center",
            opacity: toastOpacity,
            zIndex: 9999,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(15,23,32,0.95)",
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 999,
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>{product.name} added</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
