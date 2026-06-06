// import React, { useEffect, useState, useCallback, useRef } from "react";
// import {
//   View,
//   Text,
//   Image,
//   Pressable,
//   ScrollView,
//   Alert,
//   Animated,
//   Platform,
//   useWindowDimensions,
//   ActivityIndicator,
//   StyleSheet
// } from "react-native";
// import { useLocalSearchParams, Link } from "expo-router";
// import { productListStyles as listStyles } from "@/styles/productList";
// import productDetailStyles from "@/styles/productDetail";
// import { useCart } from "@/features/cart/useCart";
// import { getProductById, getProducts, Product as BaseProduct } from "@/features/products/api";
// import {
//   VariantSelector,
//   VariantSelectorValue,
//   Variant as UISelectorVariant,
// } from "@/components/VariantSelector";

// // ── Types ──────────────────────────────────────────────────────────────────────
// export type Product = BaseProduct & {
//   variants?: never;
//   size?: string | null;
// };

// // ── Helpers ────────────────────────────────────────────────────────────────────
// function formatPriceFromCents(cents?: number | null) {
//   if (!cents && cents !== 0) return "0.00";
//   return (cents! / 100).toFixed(2);
// }

// function getColor(p: any): string | null {
//   const m = p?.metadata;
//   const metaColor = (m && (m.color ?? m.colour)) ?? (typeof m === "object" ? (m?.color ?? m?.colour) : null);
//   if (metaColor) return String(metaColor);
//   const name: string = p?.name ?? "";
//   const m1 = name.match(/colour\s*:\s*([A-Za-z]+)\s*$/i);
//   if (m1) return m1[1];
//   const m2 = name.match(/\(([A-Za-z]+)\)\s*$/);
//   if (m2) return m2[1];
//   return null;
// }

// function normalizeNameForGrouping(name?: string | null): string {
//   if (!name) return "";
//   let n = name.replace(/colour\s*:\s*[A-Za-z]+\s*$/i, "");
//   n = n.replace(/\([A-Za-z]+\)\s*$/, "");
//   return n.trim().toLowerCase();
// }

// const flattenStyle = (...styles: any[]) => {
//   if (Platform.OS === "web") {
//     return Object.assign({}, ...styles.map(s => StyleSheet.flatten(s)).filter(Boolean));
//   }
//   return styles.filter(Boolean);
// };

// // ── Component ──────────────────────────────────────────────────────────────────
// export default function ProductDetail() {
//   const params = useLocalSearchParams();
//   const id = String(params.id || params.productId || "");
//   const { width: screenWidth } = useWindowDimensions();

//   const isLaptop = screenWidth >= 1024;
//   const contentPadding = screenWidth < 420 ? 16 : isLaptop ? 40 : 28;
//   const contentMaxWidth = isLaptop ? 1200 : 980;
//   const cardMaxWidth = screenWidth < 480 ? screenWidth - contentPadding * 2 : 360;

//   let cartHook: any;
//   try { cartHook = useCart(); } catch { cartHook = null; }

//   const [product, setProduct]               = useState<Product | null>(null);
//   const [loading, setLoading]               = useState(true);
//   const [related, setRelated]               = useState<Product[]>([]);
//   const [relatedLoading, setRelatedLoading] = useState(false);
//   const [selectorVariants, setSelectorVariants] = useState<UISelectorVariant[]>([]);
//   const [variantState, setVariantState]     = useState<VariantSelectorValue>({
//     fragrance: null,
//     jarType: null,   // NEW
//     color: null,
//     size: null,
//     variant: null,
//   });
//   const [familyById, setFamilyById]         = useState<Record<string, Product>>({});

//   const [toastVisible, setToastVisible]     = useState(false);
//   const toastOpacity                        = useRef(new Animated.Value(0)).current;

//   const showToast = useCallback(() => {
//     setToastVisible(true);
//     Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
//     setTimeout(() => {
//       Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(
//         () => setToastVisible(false)
//       );
//     }, 1400);
//   }, [toastOpacity]);

//   // ── Load product ─────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!id) { setProduct(null); setLoading(false); return; }
//     let mounted = true;
//     setLoading(true);
//     (async () => {
//       try {
//         const data = (await getProductById(id)) as unknown as Product;
//         if (mounted) setProduct(data ?? null);
//       } catch { if (mounted) setProduct(null); }
//       finally   { if (mounted) setLoading(false); }
//     })();
//     return () => { mounted = false; };
//   }, [id]);

//   // ── Build variant selector data ───────────────────────────────────────────────
//   //
//   // Grouping logic:
//   //   - Same scent  → same family (regardless of product_type / jar type)
//   //   - No scent    → fall back to normalised name matching (unchanged)
//   //
//   // Each row in the family becomes ONE selector variant with:
//   //   fragrance = scent
//   //   jarType   = product_type   ← NEW
//   //   color     = metadata.color
//   //   size      = size
//   //
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       if (!product) { setSelectorVariants([]); setFamilyById({}); return; }
//       try {
//         const { products: rows } = await getProducts({ page: 1, pageSize: 200 });

//         // Build the family: all rows sharing the same scent (or same base name)
//         let family: Product[];
//         if (product.scent) {
//           family = [
//             product,
//             ...rows.filter((r: any) => r.id !== product.id && r.scent === product.scent),
//           ] as Product[];
//         } else {
//           const key = normalizeNameForGrouping(product.name);
//           family = [
//             product,
//             ...rows.filter((r: any) => r.id !== product.id && normalizeNameForGrouping(r.name) === key),
//           ] as Product[];
//         }

//         // Map every family member to a UISelectorVariant
//         // A member is usable if it has at least a color OR a jar type
//         const mapped = family.map((p: any): UISelectorVariant | null => {
//           const color   = getColor(p) ?? "Default";
//           // const jarType = p.product_type ?? "jar"; // fallback so it always has a type
//           const jarType = p.jar_type ?? null;
//           return {
//             id:        p.id,
//             fragrance: p.scent ?? "Handcrafted",
//             jarType,                                // ← NEW field
//             color,
//             size:     p.size ?? null,
//             price:    (p.price_cents ?? 0) / 100,
//             stock:    p.inventory_count ?? 0,
//             imageUrl: p.image_urls?.[0]?.url,
//           };
//         }).filter(Boolean) as UISelectorVariant[];

//         const map: Record<string, Product> = {};
//         family.forEach(p => { map[p.id] = p; });

//         if (!cancelled) {
//           setSelectorVariants(mapped);
//           setFamilyById(map);
//         }
//       } catch {
//         if (!cancelled) setSelectorVariants([]);
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [product]);

//   // ── Related products (completely unchanged) ───────────────────────────────────
//   useEffect(() => {
//     if (!product) return;
//     setRelatedLoading(true);
//     (async () => {
//       try {
//         const { products: rows } = await getProducts({ page: 1, pageSize: 5 });
//         const filtered = (rows as any[]).filter((r: any) => r.id !== product.id).slice(0, 4);
//         setRelated(filtered as Product[]);
//       } catch { setRelated([]); }
//       finally   { setRelatedLoading(false); }
//     })();
//   }, [product]);

//   // ── Derived display values ────────────────────────────────────────────────────
//   const selectedVariant = variantState.variant;
//   const activeProduct   = selectedVariant ? (familyById[selectedVariant.id] ?? product) : product;
//   const baseImageUri    = activeProduct?.image_urls?.[0]?.url ?? null;
//   const imageUri        = baseImageUri
//     ? `${baseImageUri}${baseImageUri.includes("?") ? "&" : "?"}v=${activeProduct?.id}`
//     : null;
//   const displayPrice    = `₹${formatPriceFromCents(activeProduct?.price_cents)}`;

//   // ── Add to cart ───────────────────────────────────────────────────────────────
//   const handleAddToCart = useCallback(() => {
//     if (!activeProduct) return;

//     if (selectorVariants.length > 1) {
//       if (!selectedVariant) {
//         Alert.alert("Select a variant", "Choose fragrance, type, color, and size.");
//         return;
//       }
//       if (selectedVariant.stock <= 0) {
//         Alert.alert("Out of stock", "Please pick another option.");
//         return;
//       }
//     }

//     const priceCents = activeProduct.price_cents ?? 0;
//     const payload: any = {
//       id:          activeProduct.id,
//       name:        activeProduct.name,
//       price_cents: priceCents,
//       price:       Number((priceCents / 100).toFixed(2)),
//       image:       activeProduct.image_urls?.[0]?.url ?? null,
//     };

//     if (selectedVariant) {
//       payload.variantId = selectedVariant.id;
//       payload.variant   = {
//         fragrance: variantState.fragrance,
//         jarType:   variantState.jarType,   // NEW — persisted to cart
//         color:     variantState.color,
//         size:      variantState.size,
//       };
//     }

//     const tryCalls = [
//       () => cartHook?.addToCart?.(payload, 1),
//       () => cartHook?.addItem?.({ ...payload, qty: 1 }),
//       () => cartHook?.dispatch?.({ type: "cart/addItem", payload: { ...payload, qty: 1 } }),
//     ];

//     let ok = false;
//     for (const call of tryCalls) {
//       try { call(); ok = true; break; } catch {}
//     }

//     if (ok) showToast();
//     else Alert.alert("Info", "Unable to sync with cart. Check console.");
//   }, [activeProduct, selectorVariants, selectedVariant, variantState, cartHook, showToast]);

//   // ── Render ────────────────────────────────────────────────────────────────────
//   if (loading)
//     return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator size="large" color="#111" /></View>;
//   if (!activeProduct)
//     return <View style={{ padding: 40 }}><Text>Product not found</Text></View>;

//   return (
//     <View style={{ flex: 1, backgroundColor: "#fff" }}>
//       <ScrollView
//         contentContainerStyle={{
//           paddingHorizontal: contentPadding,
//           paddingTop: isLaptop ? 60 : 20,
//           paddingBottom: 60,
//         }}
//       >
//         <View style={{ width: "100%", maxWidth: contentMaxWidth, alignSelf: "center" }}>

//           <View style={{ flexDirection: isLaptop ? "row" : "column", gap: isLaptop ? 80 : 0 }}>

//             {/* Image */}
//             <View style={{ flex: isLaptop ? 1.2 : undefined, width: "100%" }}>
//               <View
//                 style={flattenStyle(
//                   productDetailStyles.imageWrapper,
//                   { alignSelf: isLaptop ? "flex-start" : "center", maxWidth: isLaptop ? "100%" : cardMaxWidth }
//                 )}
//               >
//                 <Image
//                   key={activeProduct.id}
//                   source={imageUri ? { uri: imageUri } : require("../../assets/images/logo.png")}
//                   style={flattenStyle(
//                     productDetailStyles.productImage,
//                     isLaptop && { aspectRatio: 1, height: "auto", borderRadius: 12 }
//                   )}
//                   resizeMode="cover"
//                 />
//               </View>
//             </View>

//             {/* Info */}
//             <View style={{ flex: isLaptop ? 1 : undefined, width: "100%", marginTop: isLaptop ? 0 : 24 }}>
//               <View style={productDetailStyles.infoBlock}>
//                 <Text
//                   style={flattenStyle(productDetailStyles.title, isLaptop && { fontSize: 40, lineHeight: 48 })}
//                 >
//                   {activeProduct.name}
//                 </Text>

//                 {activeProduct.size && (
//                   <Text style={{ fontSize: 15, color: "#777", marginTop: 6, fontWeight: "600" }}>
//                     Capacity: {activeProduct.size}
//                   </Text>
//                 )}

//                 <Text
//                   style={flattenStyle(productDetailStyles.price, isLaptop && { fontSize: 32, marginTop: 16 })}
//                 >
//                   {displayPrice}
//                 </Text>

//                 <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 24 }} />

//                 {activeProduct.description && (
//                   <Text
//                     style={flattenStyle(
//                       productDetailStyles.description,
//                       isLaptop && { fontSize: 17, lineHeight: 26, color: "#444" }
//                     )}
//                   >
//                     {activeProduct.description}
//                   </Text>
//                 )}
//               </View>

//               <View style={{ marginTop: 10 }}>
//                 {selectorVariants.length > 1 && (
//                   <VariantSelector
//                     variants={selectorVariants}
//                     onChange={setVariantState}
//                     // @ts-ignore
//                     showSize={true}
//                   />
//                 )}
//                 <View style={[productDetailStyles.addButtonWrapper, { marginTop: 32 }]}>
//                   <Pressable
//                     style={({ pressed }) =>
//                       flattenStyle(
//                         productDetailStyles.addButton,
//                         { height: 58, backgroundColor: pressed ? "#333" : "#111" }
//                       )
//                     }
//                     onPress={handleAddToCart}
//                   >
//                     <Text
//                       style={flattenStyle(productDetailStyles.addButtonText, { fontSize: 18, letterSpacing: 1 })}
//                     >
//                       {selectorVariants.length > 1 && !selectedVariant ? "Select Option" : "Add to cart"}
//                     </Text>
//                   </Pressable>
//                 </View>
//               </View>
//             </View>
//           </View>

//           {/* ── Related Products (unchanged logic) ─────────────────────────── */}
//           <View style={{ marginTop: isLaptop ? 100 : 40 }}>
//             <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 24, color: "#111" }}>
//               Related Products
//             </Text>
//             <View
//               style={{
//                 flexDirection: "row",
//                 flexWrap: "wrap",
//                 justifyContent: "space-between",
//                 gap: isLaptop ? 24 : 0,
//               }}
//             >
//               {related.map(p => (
//                 <View key={p.id} style={{ width: isLaptop ? "23%" : "48%", marginBottom: 20 }}>
//                   <Link href={`/product/${p.id}`} asChild>
//                     <Pressable
//                       style={{
//                         backgroundColor: "#fff",
//                         borderRadius: 12,
//                         overflow: "hidden",
//                         borderWidth: 1,
//                         borderColor: "#f2f2f2",
//                         elevation: 3,
//                         shadowOpacity: 0.1,
//                         shadowRadius: 4,
//                       }}
//                     >
//                       <Image
//                         source={
//                           p.image_urls?.[0]?.url
//                             ? { uri: p.image_urls[0].url }
//                             : require("../../assets/images/logo.png")
//                         }
//                         style={{ width: "100%", height: isLaptop ? 280 : 160, backgroundColor: "#f9f9f9" }}
//                         resizeMode="cover"
//                       />
//                       <View style={{ padding: 12, minHeight: 75, justifyContent: "center" }}>
//                         <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }} numberOfLines={2}>
//                           {p.name}
//                         </Text>
//                         <Text style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
//                           ₹{formatPriceFromCents(p.price_cents)}
//                         </Text>
//                       </View>
//                     </Pressable>
//                   </Link>
//                 </View>
//               ))}
//             </View>
//           </View>

//         </View>
//       </ScrollView>

//       {/* Toast */}
//       {toastVisible && (
//         <Animated.View
//           pointerEvents="none"
//           style={flattenStyle({
//             position: "absolute",
//             left: 0, right: 0, bottom: 40,
//             alignItems: "center",
//             opacity: toastOpacity,
//             zIndex: 99,
//           })}
//         >
//           <View style={{ backgroundColor: "#111", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}>
//             <Text style={{ color: "#fff", fontWeight: "600" }}>{activeProduct.name} added</Text>
//           </View>
//         </Animated.View>
//       )}
//     </View>
//   );
// }


// app/product/[id].tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Alert,
  Animated,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { productListStyles as listStyles } from "@/styles/productList";
import productDetailStyles from "@/styles/productDetail";
import { useCart } from "@/features/cart/useCart";
import { getProductById, getProducts, Product as BaseProduct } from "@/features/products/api";
import {
  VariantSelector,
  VariantSelectorValue,
  Variant as UISelectorVariant,
} from "@/components/VariantSelector";

// ── Types ──────────────────────────────────────────────────────────────────────
export type Product = BaseProduct & {
  variants?: never;
  size?: string | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatPriceFromCents(cents?: number | null) {
  if (!cents && cents !== 0) return "0.00";
  return (cents! / 100).toFixed(2);
}

function getColor(p: any): string | null {
  const m = p?.metadata;
  const metaColor =
    (m && (m.color ?? m.colour)) ??
    (typeof m === "object" ? (m?.color ?? m?.colour) : null);
  if (metaColor) return String(metaColor);
  const name: string = p?.name ?? "";
  const m1 = name.match(/colour\s*:\s*([A-Za-z]+)\s*$/i);
  if (m1) return m1[1];
  const m2 = name.match(/\(([A-Za-z]+)\)\s*$/);
  if (m2) return m2[1];
  return null;
}

const flattenStyle = (...styles: any[]) => {
  if (Platform.OS === "web") {
    return Object.assign({}, ...styles.map((s) => StyleSheet.flatten(s)).filter(Boolean));
  }
  return styles.filter(Boolean);
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const params = useLocalSearchParams();
  const id = String(params.id || params.productId || "");
  const { width: screenWidth } = useWindowDimensions();

  const isLaptop = screenWidth >= 1024;
  const contentPadding = screenWidth < 420 ? 16 : isLaptop ? 40 : 28;
  const contentMaxWidth = isLaptop ? 1200 : 980;
  const cardMaxWidth = screenWidth < 480 ? screenWidth - contentPadding * 2 : 360;

  let cartHook: any;
  try {
    cartHook = useCart();
  } catch {
    cartHook = null;
  }

  const [product, setProduct]                   = useState<Product | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [related, setRelated]                   = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading]     = useState(false);
  const [selectorVariants, setSelectorVariants] = useState<UISelectorVariant[]>([]);
  const [variantState, setVariantState]         = useState<VariantSelectorValue>({
    fragrance: null,
    jarType: null,
    color: null,
    size: null,
    variant: null,
  });
  const [familyById, setFamilyById] = useState<Record<string, Product>>({});

  const [toastVisible, setToastVisible] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = useCallback(() => {
    setToastVisible(true);
    Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(
        () => setToastVisible(false)
      );
    }, 1400);
  }, [toastOpacity]);

  // ── Load product ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const data = (await getProductById(id)) as unknown as Product;
        if (mounted) setProduct(data ?? null);
      } catch {
        if (mounted) setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // ── Build variant selector data ───────────────────────────────────────────────
  //
  // ✅ Now uses variant_group_id as the authoritative grouping key.
  // Products sharing the same variant_group_id → same family.
  // Products with no variant_group_id → solo, no variants shown.
  //
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!product) {
        setSelectorVariants([]);
        setFamilyById({});
        return;
      }
      try {
        const { products: rows } = await getProducts({ page: 1, pageSize: 500 });

        // ✅ Group by variant_group_id — no more name/scent guessing
        let family: Product[];
        if (product.variant_group_id) {
          family = [
            product,
            ...rows.filter(
              (r: any) =>
                r.id !== product.id &&
                r.variant_group_id === product.variant_group_id
            ),
          ] as Product[];
        } else {
          // Solo product — no siblings
          family = [product] as Product[];
        }

        // Map every family member to a UISelectorVariant
        const mapped = family
          .map((p: any): UISelectorVariant | null => {
            const color = getColor(p) ?? "Default";
            const jarType = p.jar_type ?? null;
            return {
              id:        p.id,
              fragrance: p.scent ?? "Handcrafted",
              jarType,
              color,
              size:      p.size ?? null,
              price:     (p.price_cents ?? 0) / 100,
              stock:     p.inventory_count ?? 0,
              imageUrl:  p.image_urls?.[0]?.url,
            };
          })
          .filter(Boolean) as UISelectorVariant[];

        const map: Record<string, Product> = {};
        family.forEach((p) => {
          map[p.id] = p;
        });

        if (!cancelled) {
          setSelectorVariants(mapped);
          setFamilyById(map);
        }
      } catch {
        if (!cancelled) setSelectorVariants([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product]);

  // ── Related products ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!product) return;
    setRelatedLoading(true);
    (async () => {
      try {
        const { products: rows } = await getProducts({ page: 1, pageSize: 5 });
        const filtered = (rows as any[]).filter((r: any) => r.id !== product.id).slice(0, 4);
        setRelated(filtered as Product[]);
      } catch {
        setRelated([]);
      } finally {
        setRelatedLoading(false);
      }
    })();
  }, [product]);

  // ── Derived display values ────────────────────────────────────────────────────
  const selectedVariant = variantState.variant;
  const activeProduct   = selectedVariant ? (familyById[selectedVariant.id] ?? product) : product;
  const baseImageUri    = activeProduct?.image_urls?.[0]?.url ?? null;
  const imageUri        = baseImageUri
    ? `${baseImageUri}${baseImageUri.includes("?") ? "&" : "?"}v=${activeProduct?.id}`
    : null;
  const displayPrice = `₹${formatPriceFromCents(activeProduct?.price_cents)}`;

  // ── Add to cart ───────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    if (!activeProduct) return;

    if (selectorVariants.length > 1) {
      if (!selectedVariant) {
        Alert.alert("Select a variant", "Choose fragrance, type, color, and size.");
        return;
      }
      if (selectedVariant.stock <= 0) {
        Alert.alert("Out of stock", "Please pick another option.");
        return;
      }
    }

    const priceCents = activeProduct.price_cents ?? 0;
    const payload: any = {
      id:          activeProduct.id,
      name:        activeProduct.name,
      price_cents: priceCents,
      price:       Number((priceCents / 100).toFixed(2)),
      image:       activeProduct.image_urls?.[0]?.url ?? null,
    };

    if (selectedVariant) {
      payload.variantId = selectedVariant.id;
      payload.variant   = {
        fragrance: variantState.fragrance,
        jarType:   variantState.jarType,
        color:     variantState.color,
        size:      variantState.size,
      };
    }

    const tryCalls = [
      () => cartHook?.addToCart?.(payload, 1),
      () => cartHook?.addItem?.({ ...payload, qty: 1 }),
      () => cartHook?.dispatch?.({ type: "cart/addItem", payload: { ...payload, qty: 1 } }),
    ];

    let ok = false;
    for (const call of tryCalls) {
      try {
        call();
        ok = true;
        break;
      } catch {}
    }

    if (ok) showToast();
    else Alert.alert("Info", "Unable to sync with cart. Check console.");
  }, [activeProduct, selectorVariants, selectedVariant, variantState, cartHook, showToast]);

  // ── Render ────────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  if (!activeProduct)
    return (
      <View style={{ padding: 40 }}>
        <Text>Product not found</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: contentPadding,
          paddingTop: isLaptop ? 60 : 20,
          paddingBottom: 60,
        }}
      >
        <View style={{ width: "100%", maxWidth: contentMaxWidth, alignSelf: "center" }}>

          <View style={{ flexDirection: isLaptop ? "row" : "column", gap: isLaptop ? 80 : 0 }}>

            {/* Image */}
            <View style={{ flex: isLaptop ? 1.2 : undefined, width: "100%" }}>
              <View
                style={flattenStyle(productDetailStyles.imageWrapper, {
                  alignSelf: isLaptop ? "flex-start" : "center",
                  maxWidth: isLaptop ? "100%" : cardMaxWidth,
                })}
              >
                <Image
                  key={activeProduct.id}
                  source={imageUri ? { uri: imageUri } : require("../../assets/images/logo.png")}
                  style={flattenStyle(
                    productDetailStyles.productImage,
                    isLaptop && { aspectRatio: 1, height: "auto", borderRadius: 12 }
                  )}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Info */}
            <View style={{ flex: isLaptop ? 1 : undefined, width: "100%", marginTop: isLaptop ? 0 : 24 }}>
              <View style={productDetailStyles.infoBlock}>
                <Text
                  style={flattenStyle(
                    productDetailStyles.title,
                    isLaptop && { fontSize: 40, lineHeight: 48 }
                  )}
                >
                  {activeProduct.name}
                </Text>

                {activeProduct.size && (
                  <Text style={{ fontSize: 15, color: "#777", marginTop: 6, fontWeight: "600" }}>
                    Capacity: {activeProduct.size}
                  </Text>
                )}

                <Text
                  style={flattenStyle(
                    productDetailStyles.price,
                    isLaptop && { fontSize: 32, marginTop: 16 }
                  )}
                >
                  {displayPrice}
                </Text>

                <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 24 }} />

                {activeProduct.description && (
                  <Text
                    style={flattenStyle(
                      productDetailStyles.description,
                      isLaptop && { fontSize: 17, lineHeight: 26, color: "#444" }
                    )}
                  >
                    {activeProduct.description}
                  </Text>
                )}
              </View>

              <View style={{ marginTop: 10 }}>
                {selectorVariants.length > 1 && (
                  <VariantSelector
                    variants={selectorVariants}
                    onChange={setVariantState}
                    // @ts-ignore
                    showSize={true}
                  />
                )}
                <View style={[productDetailStyles.addButtonWrapper, { marginTop: 32 }]}>
                  <Pressable
                    style={({ pressed }) =>
                      flattenStyle(productDetailStyles.addButton, {
                        height: 58,
                        backgroundColor: pressed ? "#333" : "#111",
                      })
                    }
                    onPress={handleAddToCart}
                  >
                    <Text
                      style={flattenStyle(productDetailStyles.addButtonText, {
                        fontSize: 18,
                        letterSpacing: 1,
                      })}
                    >
                      {selectorVariants.length > 1 && !selectedVariant
                        ? "Select Option"
                        : "Add to cart"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* Related Products */}
          <View style={{ marginTop: isLaptop ? 100 : 40 }}>
            <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 24, color: "#111" }}>
              Related Products
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: isLaptop ? 24 : 0,
              }}
            >
              {related.map((p) => (
                <View key={p.id} style={{ width: isLaptop ? "23%" : "48%", marginBottom: 20 }}>
                  <Link href={`/product/${p.id}`} asChild>
                    <Pressable
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 12,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: "#f2f2f2",
                        elevation: 3,
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                      }}
                    >
                      <Image
                        source={
                          p.image_urls?.[0]?.url
                            ? { uri: p.image_urls[0].url }
                            : require("../../assets/images/logo.png")
                        }
                        style={{
                          width: "100%",
                          height: isLaptop ? 280 : 160,
                          backgroundColor: "#f9f9f9",
                        }}
                        resizeMode="cover"
                      />
                      <View style={{ padding: 12, minHeight: 75, justifyContent: "center" }}>
                        <Text
                          style={{ fontSize: 14, fontWeight: "700", color: "#111" }}
                          numberOfLines={2}
                        >
                          {p.name}
                        </Text>
                        <Text style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                          ₹{formatPriceFromCents(p.price_cents)}
                        </Text>
                      </View>
                    </Pressable>
                  </Link>
                </View>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Toast */}
      {toastVisible && (
        <Animated.View
          pointerEvents="none"
          style={flattenStyle({
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 40,
            alignItems: "center",
            opacity: toastOpacity,
            zIndex: 99,
          })}
        >
          <View
            style={{
              backgroundColor: "#111",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>{activeProduct.name} added</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}