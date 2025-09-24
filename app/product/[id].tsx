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
import { getProductById, getProducts, Product } from "@/features/products/api";

function formatPriceFromCents(cents?: number | null) {
  if (!cents && cents !== 0) return "0.00";
  return (cents! / 100).toFixed(2);
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

  // product state
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [related, setRelated] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState<boolean>(false);

  // toast state
  const [toastVisible, setToastVisible] = useState(false);
  const toastOpacity = React.useRef(new Animated.Value(0)).current;
  const showToast = useCallback(
    (message = "Added to cart") => {
      setToastVisible(true);
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setToastVisible(false));
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
        const data = await getProductById(id);
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

  // fetch related products (after product loads)
  useEffect(() => {
    if (!product) {
      setRelated([]);
      return;
    }

    let mounted = true;
    setRelatedLoading(true);

    (async () => {
      try {
        // If product has a product_type or scent you can filter; otherwise just fetch recent
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

        // remove current product and limit to 4
        setRelated(rows.filter((r) => r.id !== product.id).slice(0, 4));
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

  const handleAddToCart = useCallback(() => {
    if (!product) return;

    const payload = {
      id: product.id,
      name: product.name,
      // Keep both: price_cents for accuracy, and price (string) for display if needed
      price_cents: product.price_cents ?? 0,
      price: Number(((product.price_cents ?? 0) / 100).toFixed(2)),
      image: product.image_urls?.[0]?.url ?? null,
    };

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

    if (cartHook && typeof cartHook.dispatch === "function") {
      try {
        cartHook.dispatch({
          type: "cart/addItem",
          payload: { ...payload, qty: 1 },
        });
        showToast(`${product.name} added`);
      } catch (err) {
        console.error("dispatch addItem failed", err);
        Alert.alert("Error", "Could not add to cart.");
      }
      return;
    }

    // fallback
    console.warn("No suitable add-to-cart method found on useCart().");
    Alert.alert("Info", "Added to cart (debug only). Check console.");
    showToast(`${product.name} added`);
  }, [product, cartHook, showToast]);

  if (loading) {
    return (
      <View style={{ padding: contentPadding, minHeight: 200, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ padding: contentPadding }}>
        <Text>Product not found</Text>
        <Link href="/product">
          <Text style={{ color: "#0a84ff", marginTop: 12 }}>Back to products</Text>
        </Link>
      </View>
    );
  }

  const imageUri = product.image_urls?.[0]?.url ?? null;
  const displayPrice = `₹${formatPriceFromCents(product.price_cents)}`;

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
              source={imageUri ? { uri: imageUri } : require("../../assets/images/logo.png")}
              style={productDetailStyles.productImage}
              resizeMode="cover"
              onError={(e) => {
                console.warn("Product main image failed to load:", imageUri, e.nativeEvent || e);
              }}
            />
          </View>

          {/* info */}
          <View style={productDetailStyles.infoBlock}>
            <Text style={productDetailStyles.title}>{product.name}</Text>
            <Text style={productDetailStyles.price}>{displayPrice}</Text>
            {product.description ? (
              <Text style={productDetailStyles.description}>{product.description}</Text>
            ) : null}
          </View>

          {/* add to cart */}
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
                    screenWidth < 480 && relatedCardWidth ? { width: relatedCardWidth, marginRight: 8 } : undefined,
                    { marginBottom: 12 },
                  ]}
                >
                  <Link href={`/product/${p.id}`} asChild>
                    <Pressable style={listStyles.productCard}>
                      <Image
                        source={p.image_urls?.[0]?.url ? { uri: p.image_urls[0].url } : require("../../assets/images/logo.png")}
                        style={listStyles.productImage}
                        resizeMode="cover"
                      />
                      <View style={listStyles.productInfo}>
                        <Text style={listStyles.productTitle} numberOfLines={2}>
                          {p.name}
                        </Text>
                        <Text style={listStyles.productPrice}>₹{formatPriceFromCents(p.price_cents)}</Text>
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
            <Text style={{ color: "#fff", fontWeight: "700" }}>{product.name} added</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
