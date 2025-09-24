// app/product/index.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { productListStyles as styles } from "@/styles/productList";
import { getProducts, Product } from "@/features/products/api";

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const pageSize = 9;
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  async function load() {
    setLoading(true);
    try {
      const { products: rows, total: count } = await getProducts({ page, pageSize });
      setProducts(rows);
      setTotal(count);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  

  if (loading) {
    return (
      <View style={{ flex: 1, height: 300, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading products...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.shopHeading}>Aromatic Candles</Text>

      <View style={styles.gridColWrapper}>
        {products.map((p) => (
          <View key={p.id} style={styles.col3}>
            <Link href={`/product/${p.id}`} asChild>
              <Pressable style={styles.productCard}>
                <Image
                  source={{ uri: p.image_urls?.[0]?.url ?? undefined }}
                  style={styles.productImage}
                  // onError fallback handled by RN, you can add placeholder logic if needed
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle}>{p.name}</Text>
                  <Text style={styles.productPrice}>₹{((p.price_cents ?? 0) / 100).toFixed(2)}</Text>
                </View>
              </Pressable>
            </Link>
          </View>
        ))}
      </View>

      {/* Simple pagination */}
      <View style={styles.pagination}>
        <Pressable style={styles.pageBtn} onPress={() => setPage((s) => Math.max(1, s - 1))} disabled={page === 1}>
          <Text>◀</Text>
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ marginHorizontal: 8 }}>{page}</Text>
          <Text style={{ color: "#666" }}> / {totalPages}</Text>
        </View>

        <Pressable style={styles.pageBtn} onPress={() => setPage((s) => Math.min(totalPages, s + 1))} disabled={page === totalPages}>
          <Text>▶</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
