// // app/product/index.tsx
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   Pressable,
//   ScrollView,
//   ActivityIndicator,
//   useWindowDimensions,
// } from "react-native";
// import { Link } from "expo-router";
// import { productListStyles as styles } from "@/styles/productList";
// import { getProducts, Product } from "@/features/products/api";

// export default function ProductListPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [page, setPage] = useState<number>(1);
//   const pageSize = 9;
//   const [total, setTotal] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(true);

//   const { width: screenWidth } = useWindowDimensions();

//   // determine columns based on screen width
//   const columns = (() => {
//     if (screenWidth <= 420) return 2; // mobile: 2 columns (wider cards)
//     if (screenWidth <= 900) return 3; // tablet: 3 columns
//     return 4; // desktop: 4 columns
//   })();

//   // computed column width (accounting for horizontal padding in styles.root and card padding)
//   // styles.root paddingHorizontal default is 28; we use the same math for consistency
//   const horizontalPadding = 28 * 2; // left + right from root
//   const gapBetween = 12; // approximate padding between cards (productListStyles.padding used)
//   const columnWidth = Math.floor((screenWidth - horizontalPadding - gapBetween * (columns - 1)) / columns);

//   async function load() {
//     setLoading(true);
//     try {
//       const { products: rows, total: count } = await getProducts({ page, pageSize });
//       setProducts(rows);
//       setTotal(count);
//     } catch (err) {
//       console.error("Failed to load products", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//   }, [page]);

//   const totalPages = Math.max(1, Math.ceil(total / pageSize));

//   if (loading) {
//     return (
//       <View style={{ flex: 1, height: 300, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" />
//         <Text style={{ marginTop: 8 }}>Loading products...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.root}>
//       <Text style={styles.shopHeading}>Aromatic Candles</Text>

//       <View style={styles.gridColWrapper}>
//         {products.map((p) => (
//           <View
//             key={p.id}
//             // use computed width so layout is precise on mobile web and native
//             style={[
//               { width: columnWidth, padding: 6 },
//               // small alignment fix for last column
//             ]}
//           >
//             <Link href={`/product/${p.id}`} asChild>
//               <Pressable style={styles.productCard}>
//                 <Image
//                   source={p.image_urls?.[0]?.url ? { uri: p.image_urls[0].url } : require("../../assets/images/logo.png")}
//                   // dynamic image size: keep a consistent card height on mobile
//                   style={[
//                     styles.productImage,
//                     screenWidth <= 420 ? { height: 140 } : { height: 180 },
//                   ]}
//                 />
//                 <View style={styles.productInfo}>
//                   <Text
//                     style={styles.productTitle}
//                     numberOfLines={2}
//                     ellipsizeMode="tail"
//                   >
//                     {p.name}
//                   </Text>
//                   <Text style={styles.productPrice}>₹{((p.price_cents ?? 0) / 100).toFixed(2)}</Text>
//                 </View>
//               </Pressable>
//             </Link>
//           </View>
//         ))}
//       </View>

//       {/* Simple pagination */}
//       <View style={styles.pagination}>
//         <Pressable style={styles.pageBtn} onPress={() => setPage((s) => Math.max(1, s - 1))} disabled={page === 1}>
//           <Text>◀</Text>
//         </Pressable>

//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <Text style={{ marginHorizontal: 8 }}>{page}</Text>
//           <Text style={{ color: "#666" }}> / {totalPages}</Text>
//         </View>

//         <Pressable style={styles.pageBtn} onPress={() => setPage((s) => Math.min(totalPages, s + 1))} disabled={page === totalPages}>
//           <Text>▶</Text>
//         </Pressable>
//       </View>
//     </ScrollView>
//   );
// }



// app/product/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { productListStyles as styles } from "@/styles/productList";
import { getProducts, Product } from "@/features/products/api";

const CATEGORY_LABELS: Record<string, string> = {
  jar: "Jar & Container",
  "gift-set": "Gift Set",
  decorative: "Decorative",
};

// URL -> DB value for product_type
const CATEGORY_TO_DB: Record<string, string> = {
  jar: "jar",
  "gift-set": "gift-set",
  decorative: "decorative",
};

export default function ProductListPage() {
  // e.g. /product?category=jar
  const { category } = useLocalSearchParams<{ category?: string }>();
  const activeCategory = (category ?? "").toString().trim();
  const dbValue = CATEGORY_TO_DB[activeCategory]; // undefined if no/unknown category
  const isFiltered = Boolean(dbValue);

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const basePageSize = 9;
  // When filtering client-side, fetch a bigger chunk so we can filter in memory
  const effectivePageSize = isFiltered ? 200 : basePageSize;

  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const { width: screenWidth } = useWindowDimensions();

  // columns based on screen width
  const columns = (() => {
    if (screenWidth <= 420) return 2;   // mobile
    if (screenWidth <= 900) return 3;   // tablet
    return 4;                           // desktop
  })();

  // card width calculation
  const horizontalPadding = 28 * 2; // from styles.root
  const gapBetween = 12;
  const columnWidth = Math.floor(
    (screenWidth - horizontalPadding - gapBetween * (columns - 1)) / columns
  );

  // reset to page 1 when the category changes
  useEffect(() => {
    setPage(1);
  }, [dbValue]);

  async function load() {
    setLoading(true);
    try {
      const { products: rows, total: count } = await getProducts({
        page,
        pageSize: effectivePageSize,
        orderBy: { column: "created_at", ascending: false },
      });

      // ✅ filter using DB column product_type
      const filtered = isFiltered
        ? rows.filter((p: any) => p.product_type === dbValue)
        : rows;

      setProducts(filtered);
      setTotal(isFiltered ? filtered.length : count);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, dbValue]);

  const totalPages = Math.max(1, Math.ceil(total / basePageSize));
  const heading =
    dbValue && CATEGORY_LABELS[activeCategory]
      ? CATEGORY_LABELS[activeCategory]
      : "Aromatic Candles";

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
      <Text style={styles.shopHeading}>{heading}</Text>

      <View style={styles.gridColWrapper}>
        {products.map((p) => (
          <View key={p.id} style={[{ width: columnWidth, padding: 6 }]}>
            <Link href={`/product/${p.id}`} asChild>
              <Pressable style={styles.productCard}>
                <Image
                  source={
                    p.image_urls?.[0]?.url
                      ? { uri: p.image_urls[0].url }
                      : require("../../assets/images/logo.png")
                  }
                  style={[
                    styles.productImage,
                    screenWidth <= 420 ? { height: 140 } : { height: 180 },
                  ]}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={2} ellipsizeMode="tail">
                    {p.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    ₹{((p.price_cents ?? 0) / 100).toFixed(2)}
                  </Text>
                </View>
              </Pressable>
            </Link>
          </View>
        ))}
      </View>

      {/* Pagination is only meaningful when not filtering on the client */}
      {!isFiltered && (
        <View style={styles.pagination}>
          <Pressable
            style={styles.pageBtn}
            onPress={() => setPage((s) => Math.max(1, s - 1))}
            disabled={page === 1}
          >
            <Text>◀</Text>
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ marginHorizontal: 8 }}>{page}</Text>
            <Text style={{ color: "#666" }}> / {totalPages}</Text>
          </View>

          <Pressable
            style={styles.pageBtn}
            onPress={() => setPage((s) => Math.min(totalPages, s + 1))}
            disabled={page === totalPages}
          >
            <Text>▶</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
