
// // app/product/[id].tsx
// import React, { useEffect, useState, useCallback } from "react";
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

// // ---- Types (extend your API Product a bit, but *not* required in DB)
// export type Product = BaseProduct & {
//   variants?: never; // keep TS quiet if any older code references this
// };

// function formatPriceFromCents(cents?: number | null) {
//   if (!cents && cents !== 0) return "0.00";
//   return (cents! / 100).toFixed(2);
// }

// // Pull color from metadata or name patterns
// function getColor(p: any): string | null {
//   const m = p?.metadata;
//   const metaColor =
//     (m && (m.color ?? m.colour)) ??
//     (typeof m === "object" ? (m?.color ?? m?.colour) : null);
//   if (metaColor) return String(metaColor);

//   // fallback: parse from name like "Colour : Green" or "(Green)"
//   const name: string = p?.name ?? "";
//   const m1 = name.match(/colour\s*:\s*([A-Za-z]+)\s*$/i);
//   if (m1) return m1[1];
//   const m2 = name.match(/\(([A-Za-z]+)\)\s*$/);
//   if (m2) return m2[1];

//   return null;
// }

// // Normalize name to group siblings if scent is missing
// function normalizeNameForGrouping(name?: string | null): string {
//   if (!name) return "";
//   // remove trailing "Colour : X" or "(X)"
//   let n = name.replace(/colour\s*:\s*[A-Za-z]+\s*$/i, "");
//   n = n.replace(/\([A-Za-z]+\)\s*$/, "");
//   return n.trim().toLowerCase();
// }

// export default function ProductDetail() {
//   const params = useLocalSearchParams();
//   const id = String(params.id || params.productId || "");

//   const { width: screenWidth } = useWindowDimensions();
//   const contentPadding = screenWidth < 420 ? 16 : 28;
//   const contentMaxWidth = screenWidth < 480 ? screenWidth - contentPadding * 2 : 980;
//   const cardMaxWidth = screenWidth < 480 ? screenWidth - contentPadding * 2 : 360;
//   const relatedGap = 12;
//   const relatedCardWidth =
//     screenWidth < 480 ? Math.round((cardMaxWidth - relatedGap) / 2) : undefined;

//   // cart hook safe wiring
//   let cartHook: any;
//   try {
//     cartHook = useCart();
//   } catch (err) {
//     cartHook = null;
//     console.warn("useCart hook not available or threw:", err);
//   }

//   // core state
//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [related, setRelated] = useState<Product[]>([]);
//   const [relatedLoading, setRelatedLoading] = useState<boolean>(false);

//   // variant selector state
//   const [selectorVariants, setSelectorVariants] = useState<UISelectorVariant[]>([]);
//   const [variantState, setVariantState] = useState<VariantSelectorValue>({
//     fragrance: null,
//     color: null,
//     variant: null,
//   });

//   // keep a map of the whole family so we can show details of the selected sibling
//   const [familyById, setFamilyById] = useState<Record<string, Product>>({});

//   // toast
//   const [toastVisible, setToastVisible] = useState(false);
//   const toastOpacity = React.useRef(new Animated.Value(0)).current;
//   const showToast = useCallback(
//     (message = "Added to cart") => {
//       setToastVisible(true);
//       Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
//       setTimeout(() => {
//         Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(
//           () => setToastVisible(false)
//         );
//       }, 1400);
//     },
//     [toastOpacity]
//   );

//   // fetch product
//   useEffect(() => {
//     if (!id) {
//       setProduct(null);
//       setLoading(false);
//       return;
//     }
//     let mounted = true;
//     setLoading(true);
//     (async () => {
//       try {
//         const data = (await getProductById(id)) as unknown as Product;
//         if (!mounted) return;
//         setProduct(data ?? null);
//       } catch (err) {
//         console.error("getProductById error:", err);
//         if (mounted) setProduct(null);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, [id]);

//   // build "synthetic variants" from siblings (same scent, else same normalized name)
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       if (!product) {
//         setSelectorVariants([]);
//         setFamilyById({});
//         return;
//       }

//       try {
//         const baseFilters: any = {};
//         if (product.scent) baseFilters.scent = product.scent;

//         const { products: rows } = await getProducts({
//           page: 1,
//           pageSize: 200,
//           filters: Object.keys(baseFilters).length ? baseFilters : undefined,
//           orderBy: { column: "created_at", ascending: false },
//         });

//         // Build a "family" to choose from
//         let family: Product[] = [];

//         if (product.scent) {
//           family = [product, ...rows.filter((r: any) => r.id !== product.id)];
//         } else {
//           const key = normalizeNameForGrouping(product.name);
//           const more = rows.filter(
//             (r: any) =>
//               r.id !== product.id &&
//               normalizeNameForGrouping(r.name) === key
//           ) as Product[];
//           family = [product, ...more];
//         }

//         // Map family to selector variants
//         const mapped: UISelectorVariant[] = family
//           .map((p: any) => {
//             const color = getColor(p);
//             if (!color) return null;
//             return {
//               id: p.id, // sibling product id acts as variant id
//               fragrance: p.scent ?? "Unknown",
//               color,
//               price: (p.price_cents ?? 0) / 100, // selector expects display price in ₹
//               stock: p.inventory_count ?? 0,
//               imageUrl: p.image_urls?.[0]?.url,
//             };
//           })
//           .filter(Boolean) as UISelectorVariant[];

//         // de-duplicate by fragrance+color
//         const seen = new Set<string>();
//         const deduped = mapped.filter((v) => {
//           const k = `${(v.fragrance || "").toLowerCase()}::${v.color.toLowerCase()}`;
//           if (seen.has(k)) return false;
//           seen.add(k);
//           return true;
//         });

//         // build id → product map for quick lookup when a variant is chosen
//         const map: Record<string, Product> = {};
//         for (const p of family) map[p.id] = p;

//         if (!cancelled) {
//           setSelectorVariants(deduped);
//           setFamilyById(map);
//         }
//       } catch (e) {
//         console.warn("Could not build variants from siblings:", e);
//         if (!cancelled) {
//           setSelectorVariants([]);
//           setFamilyById({});
//         }
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [product]);

//   // fetch related products (unchanged)
//   useEffect(() => {
//     if (!product) {
//       setRelated([]);
//       return;
//     }
//     let mounted = true;
//     setRelatedLoading(true);
//     (async () => {
//       try {
//         const filters: any = {};
//         if (product.product_type) filters.product_type = product.product_type;
//         else if (product.scent) filters.scent = product.scent;

//         const { products: rows } = await getProducts({
//           page: 1,
//           pageSize: 4,
//           filters: Object.keys(filters).length ? filters : undefined,
//           orderBy: { column: "created_at", ascending: false },
//         });

//         if (!mounted) return;
//         setRelated(rows.filter((r: Product) => r.id !== product.id).slice(0, 4));
//       } catch (err) {
//         console.error("Failed to load related products:", err);
//         if (mounted) setRelated([]);
//       } finally {
//         if (mounted) setRelatedLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, [product]);

//   // ---------- Active product derived from selection ----------
//   const hasVariants = selectorVariants.length > 1; // only show when there are choices
//   const selectedVariant = variantState.variant;

//   // If a variant is selected, show that sibling's info everywhere
//   const activeProduct: Product | null = selectedVariant
//     ? (familyById[selectedVariant.id] ?? product)
//     : product;

//   // Image URI with cache-busting + force remount on product switch
//   const baseImageUri = activeProduct?.image_urls?.[0]?.url ?? null;
//   const imageUri = baseImageUri
//     ? `${baseImageUri}${baseImageUri.includes("?") ? "&" : "?"}v=${selectedVariant?.id ?? activeProduct?.id}`
//     : null;

//   const effectivePriceCents = activeProduct?.price_cents ?? 0;
//   const displayPrice = `₹${formatPriceFromCents(effectivePriceCents)}`;

//   // optional: scroll to top on change so user sees image/title update
//   useEffect(() => {
//     if (selectedVariant) {
//       setTimeout(() => {
//         if (Platform.OS === "web") window?.scrollTo?.({ top: 0, behavior: "smooth" });
//       }, 0);
//     }
//   }, [selectedVariant?.id]);
//   // -----------------------------------------------------------

//   // add to cart (uses active product + selection)
//   const handleAddToCart = useCallback(() => {
//     if (!activeProduct) return;

//     if (hasVariants) {
//       if (!selectedVariant) {
//         Alert.alert("Select a variant", "Choose fragrance and color.");
//         return;
//       }
//       if (selectedVariant.stock <= 0) {
//         Alert.alert("Out of stock", "Please pick another color.");
//         return;
//       }
//     }

//     const priceCents = activeProduct.price_cents ?? 0;
//     const payload: any = {
//       id: activeProduct.id,
//       name: activeProduct.name,
//       price_cents: priceCents,
//       price: Number((priceCents / 100).toFixed(2)),
//       image: activeProduct.image_urls?.[0]?.url ?? null,
//     };

//     if (selectedVariant) {
//       payload.variantId = selectedVariant.id; // keep for analytics/line item attrs
//       payload.variant = {
//         fragrance: variantState.fragrance,
//         color: variantState.color,
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
//     if (!ok) {
//       console.warn("No suitable add-to-cart method found on useCart().");
//       Alert.alert("Info", "Added to cart (debug only). Check console.");
//     }
//     showToast(`${activeProduct.name} added`);
//   }, [activeProduct, hasVariants, selectedVariant, variantState, cartHook, showToast]);

//   if (loading) {
//     return (
//       <View style={{ padding: contentPadding, minHeight: 200, justifyContent: "center" }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   if (!activeProduct) {
//     return (
//       <View style={{ padding: contentPadding }}>
//         <Text>Product not found</Text>
//         <Link href="/product">
//           <Text style={{ color: "#0a84ff", marginTop: 12 }}>Back to products</Text>
//         </Link>
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <ScrollView contentContainerStyle={{ paddingHorizontal: contentPadding, paddingTop: 20 }}>
//         <View style={{ width: "100%", maxWidth: contentMaxWidth, alignSelf: "center" }}>
//           {/* product image */}
//           <View
//             style={[
//               productDetailStyles.imageWrapper,
//               { maxWidth: cardMaxWidth, width: "100%", alignSelf: "center" },
//             ]}
//           >
//             <Image
//               key={activeProduct.id} // force remount on product switch
//               source={imageUri ? { uri: imageUri } : require("../../assets/images/logo.png")}
//               style={productDetailStyles.productImage}
//               resizeMode="cover"
//               onError={(e) => {
//                 console.warn("Product main image failed to load:", imageUri, e.nativeEvent || e);
//               }}
//             />
//           </View>

//           {/* info (from activeProduct) */}
//           <View style={productDetailStyles.infoBlock}>
//             <Text style={productDetailStyles.title}>{activeProduct.name}</Text>

//             {variantState.color ? (
//               <Text style={{ marginTop: 4, fontWeight: "600" }}>Colour: {variantState.color}</Text>
//             ) : null}

//             <Text style={productDetailStyles.price}>{displayPrice}</Text>
//             {activeProduct.description ? (
//               <Text style={productDetailStyles.description}>{activeProduct.description}</Text>
//             ) : null}
//           </View>

//           {/* variant selector */}
//           {selectorVariants.length > 1 && (
//             <View style={{ marginTop: 6, marginBottom: 10 }}>
//               <VariantSelector variants={selectorVariants} onChange={setVariantState} />
//               {selectedVariant && selectedVariant.stock <= 0 ? (
//                 <Text style={{ color: "#c00", marginTop: 6 }}>This variant is out of stock</Text>
//               ) : null}
//             </View>
//           )}

//           {/* add to cart */}
//           <View style={productDetailStyles.addButtonWrapper}>
//             <View style={productDetailStyles.addButtonContainer}>
//               <Pressable
//                 style={productDetailStyles.addButton}
//                 onPress={handleAddToCart}
//                 accessibilityRole="button"
//                 accessibilityLabel={`Add ${activeProduct.name} to cart`}
//                 disabled={selectorVariants.length > 1 && (!selectedVariant || selectedVariant.stock <= 0)}
//               >
//                 <Text style={productDetailStyles.addButtonText}>
//                   {selectorVariants.length > 1
//                     ? !selectedVariant
//                       ? "Select variant"
//                       : selectedVariant.stock <= 0
//                         ? "Out of stock"
//                         : "Add to cart"
//                     : "Add to cart"}
//                 </Text>
//               </Pressable>
//             </View>
//           </View>

//           {/* related */}
//           <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 26, marginBottom: 12 }}>
//             Related Products
//           </Text>
//           <View
//             style={{flexDirection: "row",flexWrap: "wrap",justifyContent: "space-between",
//             }}>

//             {relatedLoading ? (
//               <ActivityIndicator />
//             ) : related.length === 0 ? (
//               <Text style={{ color: "#666" }}>No related products found.</Text>
//             ) : (
//               related.map((p) => (
//                 <View
//   key={p.id}
//   style={{
//     width: screenWidth < 480 ? "48%" : 240,
//     marginBottom: 16,
//   }}
// >

//                   <Link href={`/product/${p.id}`} asChild>
//                     <Pressable style={listStyles.productCard}>
//                       <Image
//                         source={
//                           p.image_urls?.[0]?.url
//                             ? { uri: p.image_urls[0].url }
//                             : require("../../assets/images/logo.png")
//                         }
//                         style={listStyles.productImage}
//                         resizeMode="cover"
//                       />
//                       <View style={listStyles.productInfo}>
//                         <Text style={listStyles.productTitle} numberOfLines={2}>
//                           {p.name}
//                         </Text>
//                         <Text style={listStyles.productPrice}>
//                           ₹{formatPriceFromCents(p.price_cents)}
//                         </Text>
//                       </View>
//                     </Pressable>
//                   </Link>
//                 </View>
//               ))
//             )}
//           </View>
//         </View>
//       </ScrollView>

//       {/* toast */}
//       {toastVisible && (
//         <Animated.View
//           pointerEvents="none"
//           style={{
//             position: "fixed" as any,
//             left: 0,
//             right: 0,
//             bottom: Platform.OS === "web" ? 28 : 18,
//             alignItems: "center",
//             opacity: toastOpacity,
//             zIndex: 9999,
//           }}
//         >
//           <View
//             style={{
//               backgroundColor: "rgba(15,23,32,0.95)",
//               paddingHorizontal: 18,
//               paddingVertical: 10,
//               borderRadius: 999,
//               shadowColor: "#000",
//               shadowOpacity: 0.12,
//               shadowRadius: 8,
//             }}
//           >
//             <Text style={{ color: "#fff", fontWeight: "700" }}>{activeProduct.name} added</Text>
//           </View>
//         </Animated.View>
//       )}
//     </View>
//   );
// }





// // app/product/[id].tsx
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

// // ---- Types
// export type Product = BaseProduct & {
//   variants?: never;
// };

// // ---- Helpers
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

// /**
//  * Robust style merger to prevent "Indexed property setter" errors on Web
//  */
// const flattenStyle = (...styles: any[]) => {
//   if (Platform.OS === 'web') {
//     return Object.assign({}, ...styles.map(s => StyleSheet.flatten(s)).filter(Boolean));
//   }
//   return styles.filter(Boolean);
// };

// export default function ProductDetail() {
//   const params = useLocalSearchParams();
//   const id = String(params.id || params.productId || "");
//   const { width: screenWidth } = useWindowDimensions();

//   // Layout logic
//   const isLaptop = screenWidth >= 1024;
//   const contentPadding = screenWidth < 420 ? 16 : isLaptop ? 40 : 28;
//   const contentMaxWidth = isLaptop ? 1200 : 980;
//   const cardMaxWidth = screenWidth < 480 ? screenWidth - contentPadding * 2 : 360;

//   let cartHook: any;
//   try { cartHook = useCart(); } catch (err) { cartHook = null; }

//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [related, setRelated] = useState<Product[]>([]);
//   const [relatedLoading, setRelatedLoading] = useState<boolean>(false);
//   const [selectorVariants, setSelectorVariants] = useState<UISelectorVariant[]>([]);
//   const [variantState, setVariantState] = useState<VariantSelectorValue>({ fragrance: null, color: null, variant: null });
//   const [familyById, setFamilyById] = useState<Record<string, Product>>({});
  
//   const [toastVisible, setToastVisible] = useState(false);
//   const toastOpacity = useRef(new Animated.Value(0)).current;

//   const showToast = useCallback(() => {
//     setToastVisible(true);
//     Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: Platform.OS !== 'web' }).start();
//     setTimeout(() => {
//       Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }).start(() => setToastVisible(false));
//     }, 1400);
//   }, [toastOpacity]);

//   useEffect(() => {
//     if (!id) { setProduct(null); setLoading(false); return; }
//     let mounted = true;
//     setLoading(true);
//     (async () => {
//       try {
//         const data = (await getProductById(id)) as unknown as Product;
//         if (mounted) setProduct(data ?? null);
//       } catch (err) { if (mounted) setProduct(null); }
//       finally { if (mounted) setLoading(false); }
//     })();
//     return () => { mounted = false; };
//   }, [id]);

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       if (!product) { setSelectorVariants([]); setFamilyById({}); return; }
//       try {
//         const { products: rows } = await getProducts({ page: 1, pageSize: 200 });
//         let family: Product[] = [];
//         if (product.scent) {
//           family = [product, ...rows.filter((r: any) => r.id !== product.id && r.scent === product.scent)];
//         } else {
//           const key = normalizeNameForGrouping(product.name);
//           family = [product, ...rows.filter((r: any) => r.id !== product.id && normalizeNameForGrouping(r.name) === key)];
//         }
//         const mapped = family.map((p: any) => {
//           const color = getColor(p);
//           if (!color) return null;
//           return { id: p.id, fragrance: p.scent ?? "Handcrafted", color, price: (p.price_cents ?? 0) / 100, stock: p.inventory_count ?? 0, imageUrl: p.image_urls?.[0]?.url };
//         }).filter(Boolean) as UISelectorVariant[];
//         const map: Record<string, Product> = {};
//         family.forEach(p => map[p.id] = p);
//         if (!cancelled) { setSelectorVariants(mapped); setFamilyById(map); }
//       } catch (e) { if (!cancelled) setSelectorVariants([]); }
//     })();
//     return () => { cancelled = true; };
//   }, [product]);

//   useEffect(() => {
//     if (!product) return;
//     setRelatedLoading(true);
//     (async () => {
//       try {
//         const { products: rows } = await getProducts({ page: 1, pageSize: 5 });
//         setRelated(rows.filter((r: Product) => r.id !== product.id).slice(0, 4));
//       } catch (err) { setRelated([]); }
//       finally { setRelatedLoading(false); }
//     })();
//   }, [product]);

//   const selectedVariant = variantState.variant;
//   const activeProduct = selectedVariant ? (familyById[selectedVariant.id] ?? product) : product;
//   const baseImageUri = activeProduct?.image_urls?.[0]?.url ?? null;
//   const imageUri = baseImageUri ? `${baseImageUri}${baseImageUri.includes("?") ? "&" : "?"}v=${activeProduct?.id}` : null;
//   const displayPrice = `₹${formatPriceFromCents(activeProduct?.price_cents)}`;

//   const handleAddToCart = useCallback(() => {
//     if (!activeProduct) return;
//     cartHook?.addItem?.({
//       id: activeProduct.id,
//       name: activeProduct.name,
//       price_cents: activeProduct.price_cents,
//       image: activeProduct.image_urls?.[0]?.url,
//       qty: 1
//     });
//     showToast();
//   }, [activeProduct, cartHook, showToast]);

//   if (loading) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator size="large" color="#111" /></View>;
//   if (!activeProduct) return <View style={{ padding: 40 }}><Text>Product not found</Text></View>;

//   return (
//     <View style={{ flex: 1, backgroundColor: "#fff" }}>
//       <ScrollView contentContainerStyle={{ paddingHorizontal: contentPadding, paddingTop: isLaptop ? 60 : 20, paddingBottom: 60 }}>
//         <View style={{ width: "100%", maxWidth: contentMaxWidth, alignSelf: "center" }}>
          
//           <View style={{ flexDirection: isLaptop ? "row" : "column", gap: isLaptop ? 80 : 0 }}>
            
//             {/* Left: Image */}
//             <View style={{ flex: isLaptop ? 1.2 : undefined, width: "100%" }}>
//               <View style={flattenStyle(productDetailStyles.imageWrapper, { alignSelf: isLaptop ? "flex-start" : "center", maxWidth: isLaptop ? '100%' : cardMaxWidth })}>
//                 <Image
//                   key={activeProduct.id}
//                   source={imageUri ? { uri: imageUri } : require("../../assets/images/logo.png")}
//                   style={flattenStyle(productDetailStyles.productImage, isLaptop && { aspectRatio: 1, height: 'auto', borderRadius: 12 })}
//                   resizeMode="cover"
//                 />
//               </View>
//             </View>

//             {/* Right: Info */}
//             <View style={{ flex: isLaptop ? 1 : undefined, width: "100%", marginTop: isLaptop ? 0 : 24 }}>
//               <View style={productDetailStyles.infoBlock}>
//                 <Text style={flattenStyle(productDetailStyles.title, isLaptop && { fontSize: 40, lineHeight: 48 })}>{activeProduct.name}</Text>
                
//                 {variantState.color && (
//                   <Text style={{ marginTop: 8, fontSize: 16, color: "#666", fontWeight: "500" }}>
//                     Color: <Text style={{ color: "#111" }}>{variantState.color}</Text>
//                   </Text>
//                 )}

//                 <Text style={flattenStyle(productDetailStyles.price, isLaptop && { fontSize: 32, marginTop: 16 })}>{displayPrice}</Text>
//                 <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 24 }} />
//                 {activeProduct.description && (
//                   <Text style={flattenStyle(productDetailStyles.description, isLaptop && { fontSize: 17, lineHeight: 26, color: "#444" })}>
//                     {activeProduct.description}
//                   </Text>
//                 )}
//               </View>

//               <View style={{ marginTop: 10 }}>
//                 {selectorVariants.length > 1 && (
//                   <VariantSelector variants={selectorVariants} onChange={setVariantState} />
//                 )}
//                 <View style={[productDetailStyles.addButtonWrapper, { marginTop: 32 }]}>
//                    <Pressable
//                     style={({ pressed }) => flattenStyle(productDetailStyles.addButton, { height: 58, backgroundColor: pressed ? "#333" : "#111" })}
//                     onPress={handleAddToCart}
//                   >
//                     <Text style={flattenStyle(productDetailStyles.addButtonText, { fontSize: 18, letterSpacing: 1 })}>
//                       {selectorVariants.length > 1 && !selectedVariant ? "Select Variant" : "Add to cart"}
//                     </Text>
//                   </Pressable>
//                 </View>
//               </View>
//             </View>
//           </View>

//           {/* Related Section */}
//           {/* Related Section - Optimized for both Web and Mobile visibility */}
//           <View style={{ marginTop: isLaptop ? 100 : 40 }}>
//             <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 24, color: "#111" }}>
//               Related Products
//             </Text>
//             <View style={{ 
//               flexDirection: "row", 
//               flexWrap: "wrap", 
//               justifyContent: "space-between", 
//               gap: isLaptop ? 24 : 0 
//             }}>
//               {related.map((p) => (
//                 <View 
//                   key={p.id} 
//                   style={{ 
//                     width: isLaptop ? "23%" : "48%", // Forces 2 columns on mobile
//                     marginBottom: 20 
//                   }}
//                 >
//                   <Link href={`/product/${p.id}`} asChild>
//                     <Pressable style={{ 
//                       backgroundColor: '#fff', 
//                       borderRadius: 12, 
//                       overflow: 'hidden',
//                       borderWidth: 1,
//                       borderColor: '#f2f2f2',
//                       elevation: 3, // Shadow for Android
//                       shadowColor: "#000", // Shadow for iOS/Web
//                       shadowOffset: { width: 0, height: 2 },
//                       shadowOpacity: 0.1,
//                       shadowRadius: 4,
//                     }}>
//                       <Image
//                         source={p.image_urls?.[0]?.url ? { uri: p.image_urls[0].url } : require("../../assets/images/logo.png")}
//                         style={{ 
//                           width: '100%',
//                           height: isLaptop ? 280 : 160, 
//                           backgroundColor: '#f9f9f9'
//                         }}
//                         resizeMode="cover"
//                       />
//                       {/* Explicitly defined padding and height to prevent text clipping */}
//                       <View style={{ padding: 12, minHeight: 70, justifyContent: 'center' }}>
//                         <Text 
//                           style={{ fontSize: 14, fontWeight: "700", color: "#111", lineHeight: 18 }} 
//                           numberOfLines={2}
//                         >
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

//       {/* Toast Notification */}
//       {toastVisible && (
//         <Animated.View pointerEvents="none" style={flattenStyle({ position: "absolute", left: 0, right: 0, bottom: 40, alignItems: "center", opacity: toastOpacity, zIndex: 99 })}>
//           <View style={{ backgroundColor: "#111", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}>
//             <Text style={{ color: "#fff", fontWeight: "600" }}>{activeProduct.name} added to cart</Text>
//           </View>
//         </Animated.View>
//       )}
//     </View>
//   );
// }

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

// ---- Types
export type Product = BaseProduct & {
  variants?: never;
  size?: string | null; 
};

// ---- Helpers
function formatPriceFromCents(cents?: number | null) {
  if (!cents && cents !== 0) return "0.00";
  return (cents! / 100).toFixed(2);
}

function getColor(p: any): string | null {
  const m = p?.metadata;
  const metaColor = (m && (m.color ?? m.colour)) ?? (typeof m === "object" ? (m?.color ?? m?.colour) : null);
  if (metaColor) return String(metaColor);
  const name: string = p?.name ?? "";
  const m1 = name.match(/colour\s*:\s*([A-Za-z]+)\s*$/i);
  if (m1) return m1[1];
  const m2 = name.match(/\(([A-Za-z]+)\)\s*$/);
  if (m2) return m2[1];
  return null;
}

function normalizeNameForGrouping(name?: string | null): string {
  if (!name) return "";
  let n = name.replace(/colour\s*:\s*[A-Za-z]+\s*$/i, "");
  n = n.replace(/\([A-Za-z]+\)\s*$/, "");
  return n.trim().toLowerCase();
}

const flattenStyle = (...styles: any[]) => {
  if (Platform.OS === 'web') {
    return Object.assign({}, ...styles.map(s => StyleSheet.flatten(s)).filter(Boolean));
  }
  return styles.filter(Boolean);
};

export default function ProductDetail() {
  const params = useLocalSearchParams();
  const id = String(params.id || params.productId || "");
  const { width: screenWidth } = useWindowDimensions();

  const isLaptop = screenWidth >= 1024;
  const contentPadding = screenWidth < 420 ? 16 : isLaptop ? 40 : 28;
  const contentMaxWidth = isLaptop ? 1200 : 980;
  const cardMaxWidth = screenWidth < 480 ? screenWidth - contentPadding * 2 : 360;

  // Cart hook
  let cartHook: any;
  try { cartHook = useCart(); } catch (err) { cartHook = null; }

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [related, setRelated] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState<boolean>(false);
  const [selectorVariants, setSelectorVariants] = useState<UISelectorVariant[]>([]);
  const [variantState, setVariantState] = useState<VariantSelectorValue>({ fragrance: null, color: null, size: null, variant: null });
  const [familyById, setFamilyById] = useState<Record<string, Product>>({});
  
  const [toastVisible, setToastVisible] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = useCallback(() => {
    setToastVisible(true);
    Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setToastVisible(false));
    }, 1400);
  }, [toastOpacity]);

  useEffect(() => {
    if (!id) { setProduct(null); setLoading(false); return; }
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const data = (await getProductById(id)) as unknown as Product;
        if (mounted) setProduct(data ?? null);
      } catch (err) { if (mounted) setProduct(null); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!product) { setSelectorVariants([]); setFamilyById({}); return; }
      try {
        const { products: rows } = await getProducts({ page: 1, pageSize: 200 });
        let family: Product[] = [];
        if (product.scent) {
          family = [product, ...rows.filter((r: any) => r.id !== product.id && r.scent === product.scent)] as Product[];
        } else {
          const key = normalizeNameForGrouping(product.name);
          family = [product, ...rows.filter((r: any) => r.id !== product.id && normalizeNameForGrouping(r.name) === key)] as Product[];
        }
        const mapped = family.map((p: any) => {
          const color = getColor(p);
          if (!color) return null;
          return { id: p.id, fragrance: p.scent ?? "Handcrafted", color, size: p.size, price: (p.price_cents ?? 0) / 100, stock: p.inventory_count ?? 0, imageUrl: p.image_urls?.[0]?.url };
        }).filter(Boolean) as any[];
        const map: Record<string, Product> = {};
        family.forEach(p => map[p.id] = p);
        if (!cancelled) { setSelectorVariants(mapped); setFamilyById(map); }
      } catch (e) { if (!cancelled) setSelectorVariants([]); }
    })();
    return () => { cancelled = true; };
  }, [product]);

  useEffect(() => {
    if (!product) return;
    setRelatedLoading(true);
    (async () => {
      try {
        const { products: rows } = await getProducts({ page: 1, pageSize: 5 });
        const filtered = (rows as any[]).filter((r: any) => r.id !== product.id).slice(0, 4);
        setRelated(filtered as Product[]);
      } catch (err) { setRelated([]); }
      finally { setRelatedLoading(false); }
    })();
  }, [product]);

  const selectedVariant = variantState.variant;
  const activeProduct = selectedVariant ? (familyById[selectedVariant.id] ?? product) : product;
  const baseImageUri = activeProduct?.image_urls?.[0]?.url ?? null;
  const imageUri = baseImageUri ? `${baseImageUri}${baseImageUri.includes("?") ? "&" : "?"}v=${activeProduct?.id}` : null;
  const displayPrice = `₹${formatPriceFromCents(activeProduct?.price_cents)}`;

  // --- RESTORED WORKING ADD TO CART LOGIC ---
  const handleAddToCart = useCallback(() => {
    if (!activeProduct) return;

    if (selectorVariants.length > 1) {
      if (!selectedVariant) {
        Alert.alert("Select a variant", "Choose fragrance, color, and size.");
        return;
      }
      if (selectedVariant.stock <= 0) {
        Alert.alert("Out of stock", "Please pick another option.");
        return;
      }
    }

    const priceCents = activeProduct.price_cents ?? 0;
    const payload: any = {
      id: activeProduct.id,
      name: activeProduct.name,
      price_cents: priceCents,
      price: Number((priceCents / 100).toFixed(2)),
      image: activeProduct.image_urls?.[0]?.url ?? null,
    };

    if (selectedVariant) {
      payload.variantId = selectedVariant.id;
      payload.variant = {
        fragrance: variantState.fragrance,
        color: variantState.color,
        size: variantState.size,
      };
    }

    const tryCalls = [
      () => cartHook?.addToCart?.(payload, 1),
      () => cartHook?.addItem?.({ ...payload, qty: 1 }),
      () => cartHook?.dispatch?.({ type: "cart/addItem", payload: { ...payload, qty: 1 } }),
    ];

    let ok = false;
    for (const call of tryCalls) {
      try { call(); ok = true; break; } catch {}
    }
    
    if (ok) {
      showToast();
    } else {
      Alert.alert("Info", "Unable to sync with cart. Check console.");
    }
  }, [activeProduct, selectorVariants, selectedVariant, variantState, cartHook, showToast]);

  if (loading) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator size="large" color="#111" /></View>;
  if (!activeProduct) return <View style={{ padding: 40 }}><Text>Product not found</Text></View>;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: contentPadding, paddingTop: isLaptop ? 60 : 20, paddingBottom: 60 }}>
        <View style={{ width: "100%", maxWidth: contentMaxWidth, alignSelf: "center" }}>
          
          <View style={{ flexDirection: isLaptop ? "row" : "column", gap: isLaptop ? 80 : 0 }}>
            {/* Image Section */}
            <View style={{ flex: isLaptop ? 1.2 : undefined, width: "100%" }}>
              <View style={flattenStyle(productDetailStyles.imageWrapper, { alignSelf: isLaptop ? "flex-start" : "center", maxWidth: isLaptop ? '100%' : cardMaxWidth })}>
                <Image
                  key={activeProduct.id}
                  source={imageUri ? { uri: imageUri } : require("../../assets/images/logo.png")}
                  style={flattenStyle(productDetailStyles.productImage, isLaptop && { aspectRatio: 1, height: 'auto', borderRadius: 12 })}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Content Section */}
            <View style={{ flex: isLaptop ? 1 : undefined, width: "100%", marginTop: isLaptop ? 0 : 24 }}>
              <View style={productDetailStyles.infoBlock}>
                <Text style={flattenStyle(productDetailStyles.title, isLaptop && { fontSize: 40, lineHeight: 48 })}>{activeProduct.name}</Text>
                
                {activeProduct.size && (
                    <Text style={{ fontSize: 15, color: "#777", marginTop: 6, fontWeight: "600" }}>
                        Capacity: {activeProduct.size}
                    </Text>
                )}

                <Text style={flattenStyle(productDetailStyles.price, isLaptop && { fontSize: 32, marginTop: 16 })}>{displayPrice}</Text>
                <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 24 }} />
                {activeProduct.description && (
                  <Text style={flattenStyle(productDetailStyles.description, isLaptop && { fontSize: 17, lineHeight: 26, color: "#444" })}>
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
                    style={({ pressed }) => flattenStyle(productDetailStyles.addButton, { height: 58, backgroundColor: pressed ? "#333" : "#111" })}
                    onPress={handleAddToCart}
                  >
                    <Text style={flattenStyle(productDetailStyles.addButtonText, { fontSize: 18, letterSpacing: 1 })}>
                      {selectorVariants.length > 1 && !selectedVariant ? "Select Option" : "Add to cart"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* Related Products: Fixed Mobile Visibility */}
          <View style={{ marginTop: isLaptop ? 100 : 40 }}>
            <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 24, color: "#111" }}>Related Products</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: isLaptop ? 24 : 0 }}>
              {related.map((p) => (
                <View key={p.id} style={{ width: isLaptop ? "23%" : "48%", marginBottom: 20 }}>
                  <Link href={`/product/${p.id}`} asChild>
                    <Pressable style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#f2f2f2', elevation: 3, shadowOpacity: 0.1, shadowRadius: 4 }}>
                      <Image source={p.image_urls?.[0]?.url ? { uri: p.image_urls[0].url } : require("../../assets/images/logo.png")} style={{ width: '100%', height: isLaptop ? 280 : 160, backgroundColor: '#f9f9f9' }} resizeMode="cover" />
                      <View style={{ padding: 12, minHeight: 75, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }} numberOfLines={2}>{p.name}</Text>
                        <Text style={{ fontSize: 13, color: "#666", marginTop: 4 }}>₹{formatPriceFromCents(p.price_cents)}</Text>
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
        <Animated.View pointerEvents="none" style={flattenStyle({ position: "absolute", left: 0, right: 0, bottom: 40, alignItems: "center", opacity: toastOpacity, zIndex: 99 })}>
          <View style={{ backgroundColor: "#111", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>{activeProduct.name} added</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}