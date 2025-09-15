// app/product/index.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { homeStyles as styles } from "@/styles";

// sample product data — replace with your API call or store selector
const EXAMPLE_PRODUCTS = [
  { id: "1", title: "Lavender Bliss", price: 499, image: require("../../assets/images/candles/product2.jpg") },
  { id: "2", title: "Citrus Burst", price: 599, image: require("../../assets/images/candles/product3.jpg") },
  { id: "3", title: "Vanilla Dream", price: 549, image: require("../../assets/images/candles/product1.jpg") },
  { id: "4", title: "Earthy Woods", price: 699, image: require("../../assets/images/candles/product2.jpg") },
  { id: "5", title: "Ocean Breeze", price: 649, image: require("../../assets/images/candles/product2.jpg") },
  { id: "6", title: "Spiced Cinnamon", price: 529, image: require("../../assets/images/candles/product2.jpg") },
];

export default function ProductListPage() {
  const { width } = useWindowDimensions();

  // determine responsive columns
  let cols = 1;
  if (width >= 1400) cols = 5;
  else if (width >= 1200) cols = 4;
  else if (width >= 900) cols = 3;
  else if (width >= 600) cols = 2;
  else cols = 1;

  // map cols -> style
  const colStyle = cols === 5 ? styles.col5 : cols === 4 ? styles.col4 : cols === 3 ? styles.col3 : cols === 2 ? styles.col2 : styles.col1;

  const products = useMemo(() => EXAMPLE_PRODUCTS, []);

  return (
    <ScrollView contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 28, paddingBottom: 80 }}>
      <Text style={styles.shopHeading}>Aromatic Candles</Text>

      <View style={styles.filtersRow}>
        <Pressable style={styles.filterPill}><Text>Scent ▾</Text></Pressable>
        <Pressable style={styles.filterPill}><Text>Size ▾</Text></Pressable>
        <Pressable style={styles.filterPill}><Text>Price Range ▾</Text></Pressable>
      </View>

      <View style={[styles.productGrid, styles.gridColWrapper]}>
        {products.map((p) => (
          <View key={p.id} style={colStyle}>
            <Link href={`/product/${p.id}`} asChild>
              <Pressable style={[styles.productCard]}>
                <Image source={p.image} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle}>{p.title}</Text>
                  <Text style={styles.productPrice}>₹{p.price}</Text>
                </View>
              </Pressable>
            </Link>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
