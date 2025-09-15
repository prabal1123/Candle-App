// // app/product/index.tsx
// import React, { useMemo } from "react";
// import {
//   View,
//   Text,
//   Image,
//   Pressable,
//   useWindowDimensions,
//   ScrollView,
// } from "react-native";
// import { Link } from "expo-router";
// import { productListStyles as styles } from "@/styles/productList";
// import { PRODUCTS } from "@/data/products";

// export default function ProductListPage() {
//   const { width } = useWindowDimensions();

//   // responsive columns
//   let colStyle = styles.col1;
//   if (width >= 1600) colStyle = styles.col5;
//   else if (width >= 1400) colStyle = styles.col4;
//   else if (width >= 1000) colStyle = styles.col3;
//   else if (width >= 640) colStyle = styles.col2;

//   const products = useMemo(() => PRODUCTS, []);

//   return (
//     <ScrollView contentContainerStyle={styles.root}>
//       <Text style={styles.shopHeading}>Aromatic Candles</Text>

//       <View style={styles.filtersRow}>
//         <Pressable style={styles.filterPill}>
//           <Text style={{ fontWeight: "600" }}>Scent ▾</Text>
//         </Pressable>
//         <Pressable style={styles.filterPill}>
//           <Text style={{ fontWeight: "600" }}>Size ▾</Text>
//         </Pressable>
//         <Pressable style={styles.filterPill}>
//           <Text style={{ fontWeight: "600" }}>Price Range ▾</Text>
//         </Pressable>
//       </View>

//       <View style={styles.gridColWrapper}>
//         {products.map((p) => (
//           <View key={p.id} style={colStyle}>
//             <Link href={`/product/${p.id}`} asChild>
//               <Pressable style={styles.productCard}>
//                 {/* handle both require() (number) and uri strings */}
//                 <Image
//                   source={typeof p.img === "number" ? p.img : { uri: p.img as any }}
//                   style={styles.productImage}
//                 />
//                 <View style={styles.productInfo}>
//                   <Text style={styles.productTitle}>{p.name}</Text>
//                   <Text style={styles.productPrice}>₹{p.price}</Text>
//                 </View>
//               </Pressable>
//             </Link>
//           </View>
//         ))}
//       </View>

//       <View style={styles.pagination}>
//         <Pressable style={styles.pageBtn}>
//           <Text>◀</Text>
//         </Pressable>
//         <Pressable style={[styles.pageBtn, styles.pageBtnActive]}>
//           <Text style={{ fontWeight: "700" }}>1</Text>
//         </Pressable>
//         <Pressable style={styles.pageBtn}>
//           <Text>2</Text>
//         </Pressable>
//         <Pressable style={styles.pageBtn}>
//           <Text>3</Text>
//         </Pressable>
//         <Pressable style={styles.pageBtn}>
//           <Text>▶</Text>
//         </Pressable>
//       </View>
//     </ScrollView>
//   );
// }




// app/product/index.tsx
import React, { useMemo } from "react";
import { View, Text, Image, Pressable, useWindowDimensions, ScrollView } from "react-native";
import { Link } from "expo-router";
import { productListStyles as styles } from "@/styles/productList";
import { PRODUCTS } from "@/data/products";

export default function ProductListPage() {
  const { width } = useWindowDimensions();

  let colStyle = styles.col1;
  if (width >= 1600) colStyle = styles.col5;
  else if (width >= 1400) colStyle = styles.col4;
  else if (width >= 1000) colStyle = styles.col3;
  else if (width >= 640) colStyle = styles.col2;

  const products = useMemo(() => PRODUCTS, []);

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.shopHeading}>Aromatic Candles</Text>

      <View style={styles.filtersRow}>
        <Pressable style={styles.filterPill}><Text style={{ fontWeight: "600" }}>Scent ▾</Text></Pressable>
        <Pressable style={styles.filterPill}><Text style={{ fontWeight: "600" }}>Size ▾</Text></Pressable>
        <Pressable style={styles.filterPill}><Text style={{ fontWeight: "600" }}>Price Range ▾</Text></Pressable>
      </View>

      <View style={styles.gridColWrapper}>
        {products.map((p) => (
          <View key={p.id} style={colStyle}>
            <Link href={`/product/${p.id}`} asChild>
              <Pressable style={styles.productCard}>
                <Image
                  source={typeof p.img === "number" ? p.img : ({ uri: p.img } as any)}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle}>{p.name}</Text>
                  <Text style={styles.productPrice}>₹{p.price}</Text>
                </View>
              </Pressable>
            </Link>
          </View>
        ))}
      </View>

      <View style={styles.pagination}>
        <Pressable style={styles.pageBtn}><Text>◀</Text></Pressable>
        <Pressable style={[styles.pageBtn, styles.pageBtnActive]}><Text style={{ fontWeight: "700" }}>1</Text></Pressable>
        <Pressable style={styles.pageBtn}><Text>2</Text></Pressable>
        <Pressable style={styles.pageBtn}><Text>3</Text></Pressable>
        <Pressable style={styles.pageBtn}><Text>▶</Text></Pressable>
      </View>
    </ScrollView>
  );
}
