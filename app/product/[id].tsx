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
// import { getProductById, getProducts, Product } from "@/features/products/api";

// function formatPriceFromCents(cents?: number | null) {
//   if (!cents && cents !== 0) return "0.00";
//   return (cents! / 100).toFixed(2);
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

//   // product state
//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [related, setRelated] = useState<Product[]>([]);
//   const [relatedLoading, setRelatedLoading] = useState<boolean>(false);

//   // toast state
//   const [toastVisible, setToastVisible] = useState(false);
//   const toastOpacity = React.useRef(new Animated.Value(0)).current;
//   const showToast = useCallback(
//     (message = "Added to cart") => {
//       setToastVisible(true);
//       Animated.timing(toastOpacity, {
//         toValue: 1,
//         duration: 180,
//         useNativeDriver: true,
//       }).start();
//       setTimeout(() => {
//         Animated.timing(toastOpacity, {
//           toValue: 0,
//           duration: 200,
//           useNativeDriver: true,
//         }).start(() => setToastVisible(false));
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
//         const data = await getProductById(id);
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

//   // fetch related products (after product loads)
//   useEffect(() => {
//     if (!product) {
//       setRelated([]);
//       return;
//     }

//     let mounted = true;
//     setRelatedLoading(true);

//     (async () => {
//       try {
//         // If product has a product_type or scent you can filter; otherwise just fetch recent
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

//         // remove current product and limit to 4
//         setRelated(rows.filter((r) => r.id !== product.id).slice(0, 4));
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

//   const handleAddToCart = useCallback(() => {
//     if (!product) return;

//     const payload = {
//       id: product.id,
//       name: product.name,
//       // Keep both: price_cents for accuracy, and price (string) for display if needed
//       price_cents: product.price_cents ?? 0,
//       price: Number(((product.price_cents ?? 0) / 100).toFixed(2)),
//       image: product.image_urls?.[0]?.url ?? null,
//     };

//     if (cartHook && typeof cartHook.addToCart === "function") {
//       try {
//         cartHook.addToCart(payload, 1);
//         showToast(`${product.name} added`);
//       } catch (err) {
//         console.error("addToCart failed", err);
//         Alert.alert("Error", "Could not add to cart.");
//       }
//       return;
//     }

//     if (cartHook && typeof cartHook.addItem === "function") {
//       try {
//         cartHook.addItem({ ...payload, qty: 1 });
//         showToast(`${product.name} added`);
//       } catch (err) {
//         console.error("addItem failed", err);
//         Alert.alert("Error", "Could not add to cart.");
//       }
//       return;
//     }

//     if (cartHook && typeof cartHook.dispatch === "function") {
//       try {
//         cartHook.dispatch({
//           type: "cart/addItem",
//           payload: { ...payload, qty: 1 },
//         });
//         showToast(`${product.name} added`);
//       } catch (err) {
//         console.error("dispatch addItem failed", err);
//         Alert.alert("Error", "Could not add to cart.");
//       }
//       return;
//     }

//     // fallback
//     console.warn("No suitable add-to-cart method found on useCart().");
//     Alert.alert("Info", "Added to cart (debug only). Check console.");
//     showToast(`${product.name} added`);
//   }, [product, cartHook, showToast]);

//   if (loading) {
//     return (
//       <View style={{ padding: contentPadding, minHeight: 200, justifyContent: "center" }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   if (!product) {
//     return (
//       <View style={{ padding: contentPadding }}>
//         <Text>Product not found</Text>
//         <Link href="/product">
//           <Text style={{ color: "#0a84ff", marginTop: 12 }}>Back to products</Text>
//         </Link>
//       </View>
//     );
//   }

//   const imageUri = product.image_urls?.[0]?.url ?? null;
//   const displayPrice = `₹${formatPriceFromCents(product.price_cents)}`;

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
//               source={imageUri ? { uri: imageUri } : require("../../assets/images/logo.png")}
//               style={productDetailStyles.productImage}
//               resizeMode="cover"
//               onError={(e) => {
//                 console.warn("Product main image failed to load:", imageUri, e.nativeEvent || e);
//               }}
//             />
//           </View>

//           {/* info */}
//           <View style={productDetailStyles.infoBlock}>
//             <Text style={productDetailStyles.title}>{product.name}</Text>
//             <Text style={productDetailStyles.price}>{displayPrice}</Text>
//             {product.description ? (
//               <Text style={productDetailStyles.description}>{product.description}</Text>
//             ) : null}
//           </View>

//           {/* add to cart */}
//           <View style={productDetailStyles.addButtonWrapper}>
//             <View style={productDetailStyles.addButtonContainer}>
//               <Pressable
//                 style={productDetailStyles.addButton}
//                 onPress={handleAddToCart}
//                 accessibilityRole="button"
//                 accessibilityLabel={`Add ${product.name} to cart`}
//               >
//                 <Text style={productDetailStyles.addButtonText}>Add to cart</Text>
//               </Pressable>
//             </View>
//           </View>

//           <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 26, marginBottom: 12 }}>
//             Related Products
//           </Text>

//           <View style={[listStyles.gridColWrapper, { flexDirection: "row", flexWrap: "wrap" }]}>
//             {relatedLoading ? (
//               <ActivityIndicator />
//             ) : related.length === 0 ? (
//               <Text style={{ color: "#666" }}>No related products found.</Text>
//             ) : (
//               related.map((p) => (
//                 <View
//                   key={p.id}
//                   style={[
//                     listStyles.col3,
//                     screenWidth < 480 && relatedCardWidth ? { width: relatedCardWidth, marginRight: 8 } : undefined,
//                     { marginBottom: 12 },
//                   ]}
//                 >
//                   <Link href={`/product/${p.id}`} asChild>
//                     <Pressable style={listStyles.productCard}>
//                       <Image
//                         source={p.image_urls?.[0]?.url ? { uri: p.image_urls[0].url } : require("../../assets/images/logo.png")}
//                         style={listStyles.productImage}
//                         resizeMode="cover"
//                       />
//                       <View style={listStyles.productInfo}>
//                         <Text style={listStyles.productTitle} numberOfLines={2}>
//                           {p.name}
//                         </Text>
//                         <Text style={listStyles.productPrice}>₹{formatPriceFromCents(p.price_cents)}</Text>
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
//             <Text style={{ color: "#fff", fontWeight: "700" }}>{product.name} added</Text>
//           </View>
//         </Animated.View>
//       )}
//     </View>
//   );
// }



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
//   // your table already has: id, name, price_cents, inventory_count, image_urls, scent, product_type, metadata
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
//         return;
//       }

//       try {
//         const baseFilters: any = {};
//         if (product.scent) baseFilters.scent = product.scent;
//         // If your API doesn't support filtering by name, we'll filter in-memory below.

//         const { products: rows } = await getProducts({
//           page: 1,
//           pageSize: 200,
//           filters: Object.keys(baseFilters).length ? baseFilters : undefined,
//           orderBy: { column: "created_at", ascending: false },
//         });

//         // Build a "family" to choose from
//         let family: any[] = [];

//         if (product.scent) {
//           // family = products that share scent
//           family = [product, ...rows.filter((r: any) => r.id !== product.id)];
//         } else {
//           // fallback: group by cleaned name (remove "Colour : X" or "(X)")
//           const key = normalizeNameForGrouping(product.name);
//           const more = rows.filter(
//             (r: any) =>
//               r.id !== product.id &&
//               normalizeNameForGrouping(r.name) === key
//           );
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

//         if (!cancelled) setSelectorVariants(deduped);
//       } catch (e) {
//         console.warn("Could not build variants from siblings:", e);
//         if (!cancelled) setSelectorVariants([]);
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

//   // computed UI based on selected variant
//   const hasVariants = selectorVariants.length > 1; // only show when there are choices
//   const selectedVariant = variantState.variant;
//   const baseImage = product?.image_urls?.[0]?.url ?? null;
//   const imageUri = selectedVariant?.imageUrl ?? baseImage;
//   const effectivePriceCents = selectedVariant
//     ? Math.round((selectedVariant.price ?? 0) * 100)
//     : product?.price_cents ?? 0;
//   const displayPrice = `₹${formatPriceFromCents(effectivePriceCents)}`;

//   // add to cart (uses variant when present)
//   const handleAddToCart = useCallback(() => {
//     if (!product) return;

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

//     const priceCents = effectivePriceCents;
//     const payload: any = {
//       id: product.id, // keep product id for grouping
//       name: product.name,
//       price_cents: priceCents,
//       price: Number((priceCents / 100).toFixed(2)),
//       image: imageUri,
//     };

//     if (selectedVariant) {
//       payload.variantId = selectedVariant.id; // sibling product id
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
//       try {
//         call();
//         ok = true;
//         break;
//       } catch {
//         // keep trying
//       }
//     }
//     if (!ok) {
//       console.warn("No suitable add-to-cart method found on useCart().");
//       Alert.alert("Info", "Added to cart (debug only). Check console.");
//     }
//     showToast(`${product.name} added`);
//   }, [product, hasVariants, selectedVariant, variantState, imageUri, effectivePriceCents, cartHook, showToast]);

//   if (loading) {
//     return (
//       <View style={{ padding: contentPadding, minHeight: 200, justifyContent: "center" }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   if (!product) {
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
//               source={imageUri ? { uri: imageUri } : require("../../assets/images/logo.png")}
//               style={productDetailStyles.productImage}
//               resizeMode="cover"
//               onError={(e) => {
//                 console.warn("Product main image failed to load:", imageUri, e.nativeEvent || e);
//               }}
//             />
//           </View>

//           {/* info */}
//           <View style={productDetailStyles.infoBlock}>
//             <Text style={productDetailStyles.title}>{product.name}</Text>
//             <Text style={productDetailStyles.price}>{displayPrice}</Text>
//             {product.description ? (
//               <Text style={productDetailStyles.description}>{product.description}</Text>
//             ) : null}
//           </View>

//           {/* variant selector */}
//           {hasVariants && (
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
//                 accessibilityLabel={`Add ${product.name} to cart`}
//                 disabled={hasVariants && (!selectedVariant || selectedVariant.stock <= 0)}
//               >
//                 <Text style={productDetailStyles.addButtonText}>
//                   {hasVariants
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
//           <View style={[listStyles.gridColWrapper, { flexDirection: "row", flexWrap: "wrap" }]}>
//             {relatedLoading ? (
//               <ActivityIndicator />
//             ) : related.length === 0 ? (
//               <Text style={{ color: "#666" }}>No related products found.</Text>
//             ) : (
//               related.map((p) => (
//                 <View
//                   key={p.id}
//                   style={[
//                     listStyles.col3,
//                     screenWidth < 480 && relatedCardWidth
//                       ? { width: relatedCardWidth, marginRight: 8 }
//                       : undefined,
//                     { marginBottom: 12 },
//                   ]}
//                 >
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
//             <Text style={{ color: "#fff", fontWeight: "700" }}>{product.name} added</Text>
//           </View>
//         </Animated.View>
//       )}
//     </View>
//   );
// }


// app/product/[id].tsx
import React, { useEffect, useState, useCallback } from "react";
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

// ---- Types (extend your API Product a bit, but *not* required in DB)
export type Product = BaseProduct & {
  variants?: never; // keep TS quiet if any older code references this
};

function formatPriceFromCents(cents?: number | null) {
  if (!cents && cents !== 0) return "0.00";
  return (cents! / 100).toFixed(2);
}

// Pull color from metadata or name patterns
function getColor(p: any): string | null {
  const m = p?.metadata;
  const metaColor =
    (m && (m.color ?? m.colour)) ??
    (typeof m === "object" ? (m?.color ?? m?.colour) : null);
  if (metaColor) return String(metaColor);

  // fallback: parse from name like "Colour : Green" or "(Green)"
  const name: string = p?.name ?? "";
  const m1 = name.match(/colour\s*:\s*([A-Za-z]+)\s*$/i);
  if (m1) return m1[1];
  const m2 = name.match(/\(([A-Za-z]+)\)\s*$/);
  if (m2) return m2[1];

  return null;
}

// Normalize name to group siblings if scent is missing
function normalizeNameForGrouping(name?: string | null): string {
  if (!name) return "";
  // remove trailing "Colour : X" or "(X)"
  let n = name.replace(/colour\s*:\s*[A-Za-z]+\s*$/i, "");
  n = n.replace(/\([A-Za-z]+\)\s*$/, "");
  return n.trim().toLowerCase();
}

export default function ProductDetail() {
  const params = useLocalSearchParams();
  const id = String(params.id || params.productId || "");

  const { width: screenWidth } = useWindowDimensions();
  const contentPadding = screenWidth < 420 ? 16 : 28;
  const contentMaxWidth = screenWidth < 480 ? screenWidth - contentPadding * 2 : 980;
  const cardMaxWidth = screenWidth < 480 ? screenWidth - contentPadding * 2 : 360;
  const relatedGap = 12;
  const relatedCardWidth =
    screenWidth < 480 ? Math.round((cardMaxWidth - relatedGap) / 2) : undefined;

  // cart hook safe wiring
  let cartHook: any;
  try {
    cartHook = useCart();
  } catch (err) {
    cartHook = null;
    console.warn("useCart hook not available or threw:", err);
  }

  // core state
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [related, setRelated] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState<boolean>(false);

  // variant selector state
  const [selectorVariants, setSelectorVariants] = useState<UISelectorVariant[]>([]);
  const [variantState, setVariantState] = useState<VariantSelectorValue>({
    fragrance: null,
    color: null,
    variant: null,
  });

  // keep a map of the whole family so we can show details of the selected sibling
  const [familyById, setFamilyById] = useState<Record<string, Product>>({});

  // toast
  const [toastVisible, setToastVisible] = useState(false);
  const toastOpacity = React.useRef(new Animated.Value(0)).current;
  const showToast = useCallback(
    (message = "Added to cart") => {
      setToastVisible(true);
      Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      setTimeout(() => {
        Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(
          () => setToastVisible(false)
        );
      }, 1400);
    },
    [toastOpacity]
  );

  // fetch product
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
        if (!mounted) return;
        setProduct(data ?? null);
      } catch (err) {
        console.error("getProductById error:", err);
        if (mounted) setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // build "synthetic variants" from siblings (same scent, else same normalized name)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!product) {
        setSelectorVariants([]);
        setFamilyById({});
        return;
      }

      try {
        const baseFilters: any = {};
        if (product.scent) baseFilters.scent = product.scent;

        const { products: rows } = await getProducts({
          page: 1,
          pageSize: 200,
          filters: Object.keys(baseFilters).length ? baseFilters : undefined,
          orderBy: { column: "created_at", ascending: false },
        });

        // Build a "family" to choose from
        let family: Product[] = [];

        if (product.scent) {
          family = [product, ...rows.filter((r: any) => r.id !== product.id)];
        } else {
          const key = normalizeNameForGrouping(product.name);
          const more = rows.filter(
            (r: any) =>
              r.id !== product.id &&
              normalizeNameForGrouping(r.name) === key
          ) as Product[];
          family = [product, ...more];
        }

        // Map family to selector variants
        const mapped: UISelectorVariant[] = family
          .map((p: any) => {
            const color = getColor(p);
            if (!color) return null;
            return {
              id: p.id, // sibling product id acts as variant id
              fragrance: p.scent ?? "Unknown",
              color,
              price: (p.price_cents ?? 0) / 100, // selector expects display price in ₹
              stock: p.inventory_count ?? 0,
              imageUrl: p.image_urls?.[0]?.url,
            };
          })
          .filter(Boolean) as UISelectorVariant[];

        // de-duplicate by fragrance+color
        const seen = new Set<string>();
        const deduped = mapped.filter((v) => {
          const k = `${(v.fragrance || "").toLowerCase()}::${v.color.toLowerCase()}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });

        // build id → product map for quick lookup when a variant is chosen
        const map: Record<string, Product> = {};
        for (const p of family) map[p.id] = p;

        if (!cancelled) {
          setSelectorVariants(deduped);
          setFamilyById(map);
        }
      } catch (e) {
        console.warn("Could not build variants from siblings:", e);
        if (!cancelled) {
          setSelectorVariants([]);
          setFamilyById({});
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product]);

  // fetch related products (unchanged)
  useEffect(() => {
    if (!product) {
      setRelated([]);
      return;
    }
    let mounted = true;
    setRelatedLoading(true);
    (async () => {
      try {
        const filters: any = {};
        if (product.product_type) filters.product_type = product.product_type;
        else if (product.scent) filters.scent = product.scent;

        const { products: rows } = await getProducts({
          page: 1,
          pageSize: 4,
          filters: Object.keys(filters).length ? filters : undefined,
          orderBy: { column: "created_at", ascending: false },
        });

        if (!mounted) return;
        setRelated(rows.filter((r: Product) => r.id !== product.id).slice(0, 4));
      } catch (err) {
        console.error("Failed to load related products:", err);
        if (mounted) setRelated([]);
      } finally {
        if (mounted) setRelatedLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [product]);

  // ---------- Active product derived from selection ----------
  const hasVariants = selectorVariants.length > 1; // only show when there are choices
  const selectedVariant = variantState.variant;

  // If a variant is selected, show that sibling's info everywhere
  const activeProduct: Product | null = selectedVariant
    ? (familyById[selectedVariant.id] ?? product)
    : product;

  // Image URI with cache-busting + force remount on product switch
  const baseImageUri = activeProduct?.image_urls?.[0]?.url ?? null;
  const imageUri = baseImageUri
    ? `${baseImageUri}${baseImageUri.includes("?") ? "&" : "?"}v=${selectedVariant?.id ?? activeProduct?.id}`
    : null;

  const effectivePriceCents = activeProduct?.price_cents ?? 0;
  const displayPrice = `₹${formatPriceFromCents(effectivePriceCents)}`;

  // optional: scroll to top on change so user sees image/title update
  useEffect(() => {
    if (selectedVariant) {
      setTimeout(() => {
        if (Platform.OS === "web") window?.scrollTo?.({ top: 0, behavior: "smooth" });
      }, 0);
    }
  }, [selectedVariant?.id]);
  // -----------------------------------------------------------

  // add to cart (uses active product + selection)
  const handleAddToCart = useCallback(() => {
    if (!activeProduct) return;

    if (hasVariants) {
      if (!selectedVariant) {
        Alert.alert("Select a variant", "Choose fragrance and color.");
        return;
      }
      if (selectedVariant.stock <= 0) {
        Alert.alert("Out of stock", "Please pick another color.");
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
      payload.variantId = selectedVariant.id; // keep for analytics/line item attrs
      payload.variant = {
        fragrance: variantState.fragrance,
        color: variantState.color,
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
    if (!ok) {
      console.warn("No suitable add-to-cart method found on useCart().");
      Alert.alert("Info", "Added to cart (debug only). Check console.");
    }
    showToast(`${activeProduct.name} added`);
  }, [activeProduct, hasVariants, selectedVariant, variantState, cartHook, showToast]);

  if (loading) {
    return (
      <View style={{ padding: contentPadding, minHeight: 200, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!activeProduct) {
    return (
      <View style={{ padding: contentPadding }}>
        <Text>Product not found</Text>
        <Link href="/product">
          <Text style={{ color: "#0a84ff", marginTop: 12 }}>Back to products</Text>
        </Link>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: contentPadding, paddingTop: 20 }}>
        <View style={{ width: "100%", maxWidth: contentMaxWidth, alignSelf: "center" }}>
          {/* product image */}
          <View
            style={[
              productDetailStyles.imageWrapper,
              { maxWidth: cardMaxWidth, width: "100%", alignSelf: "center" },
            ]}
          >
            <Image
              key={activeProduct.id} // force remount on product switch
              source={imageUri ? { uri: imageUri } : require("../../assets/images/logo.png")}
              style={productDetailStyles.productImage}
              resizeMode="cover"
              onError={(e) => {
                console.warn("Product main image failed to load:", imageUri, e.nativeEvent || e);
              }}
            />
          </View>

          {/* info (from activeProduct) */}
          <View style={productDetailStyles.infoBlock}>
            <Text style={productDetailStyles.title}>{activeProduct.name}</Text>

            {variantState.color ? (
              <Text style={{ marginTop: 4, fontWeight: "600" }}>Colour: {variantState.color}</Text>
            ) : null}

            <Text style={productDetailStyles.price}>{displayPrice}</Text>
            {activeProduct.description ? (
              <Text style={productDetailStyles.description}>{activeProduct.description}</Text>
            ) : null}
          </View>

          {/* variant selector */}
          {selectorVariants.length > 1 && (
            <View style={{ marginTop: 6, marginBottom: 10 }}>
              <VariantSelector variants={selectorVariants} onChange={setVariantState} />
              {selectedVariant && selectedVariant.stock <= 0 ? (
                <Text style={{ color: "#c00", marginTop: 6 }}>This variant is out of stock</Text>
              ) : null}
            </View>
          )}

          {/* add to cart */}
          <View style={productDetailStyles.addButtonWrapper}>
            <View style={productDetailStyles.addButtonContainer}>
              <Pressable
                style={productDetailStyles.addButton}
                onPress={handleAddToCart}
                accessibilityRole="button"
                accessibilityLabel={`Add ${activeProduct.name} to cart`}
                disabled={selectorVariants.length > 1 && (!selectedVariant || selectedVariant.stock <= 0)}
              >
                <Text style={productDetailStyles.addButtonText}>
                  {selectorVariants.length > 1
                    ? !selectedVariant
                      ? "Select variant"
                      : selectedVariant.stock <= 0
                        ? "Out of stock"
                        : "Add to cart"
                    : "Add to cart"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* related */}
          <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 26, marginBottom: 12 }}>
            Related Products
          </Text>
          <View style={[listStyles.gridColWrapper, { flexDirection: "row", flexWrap: "wrap" }]}>
            {relatedLoading ? (
              <ActivityIndicator />
            ) : related.length === 0 ? (
              <Text style={{ color: "#666" }}>No related products found.</Text>
            ) : (
              related.map((p) => (
                <View
                  key={p.id}
                  style={[
                    listStyles.col3,
                    screenWidth < 480 && relatedCardWidth
                      ? { width: relatedCardWidth, marginRight: 8 }
                      : undefined,
                    { marginBottom: 12 },
                  ]}
                >
                  <Link href={`/product/${p.id}`} asChild>
                    <Pressable style={listStyles.productCard}>
                      <Image
                        source={
                          p.image_urls?.[0]?.url
                            ? { uri: p.image_urls[0].url }
                            : require("../../assets/images/logo.png")
                        }
                        style={listStyles.productImage}
                        resizeMode="cover"
                      />
                      <View style={listStyles.productInfo}>
                        <Text style={listStyles.productTitle} numberOfLines={2}>
                          {p.name}
                        </Text>
                        <Text style={listStyles.productPrice}>
                          ₹{formatPriceFromCents(p.price_cents)}
                        </Text>
                      </View>
                    </Pressable>
                  </Link>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* toast */}
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
            <Text style={{ color: "#fff", fontWeight: "700" }}>{activeProduct.name} added</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
