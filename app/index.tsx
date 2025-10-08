// // app/index.tsx
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Pressable,
//   ScrollView,
//   Image,
//   ImageBackground,
//   FlatList,
//   useWindowDimensions,
//   ActivityIndicator,
//   StyleSheet,
//   Platform,
// } from "react-native";
// import { Link } from "expo-router";
// import { homeStyles } from "@/styles/home";
// import { getProducts, Product } from "@/features/products/api";

// const HERO = {
//   title: "Illuminate Your Moments",
//   subtitle:
//     "Discover our exquisite collection of handcrafted aromatic candles, designed to elevate your space.",
//   img: "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/sign/productImages/cozy_rustic_candle_arrangement.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hODJlNzVlZC1jMzk3LTRhZTYtODY3YS1jNDRjYmVkOGI5MmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0SW1hZ2VzL2NvenlfcnVzdGljX2NhbmRsZV9hcnJhbmdlbWVudC5qcGciLCJpYXQiOjE3NTg0NTQ5NjcsImV4cCI6MjA3MzgxNDk2N30.PEH0vNDbnfgrE_nCA6AUPT-fNvGhybcYdS6rNekOeNE",
// };

// function getHeroSource(hero: any) {
//   if (!hero?.img) return require("../assets/images/candles/product1.jpg");
//   if (typeof hero.img === "number") return hero.img;
//   return { uri: hero.img };
// }

// function getNumColumns(width: number) {
//   if (width >= 1200) return 3;
//   if (width >= 800) return 2;
//   return 1;
// }

// // Helper: safely merge styles for web (returns plain object) and keep array for native
// const mergeForWeb = (...styles: any[]) => {
//   if (Platform.OS === "web") {
//     // flatten arrays/StyleSheet objects into a plain object
//     return Object.assign(
//       {},
//       ...styles
//         .filter(Boolean)
//         .map((s) => (Array.isArray(s) ? Object.assign({}, ...s.filter(Boolean)) : s))
//     );
//   }
//   // native can accept array; return array to preserve RN optimizations
//   return styles.length === 1 ? styles[0] : styles;
// };

// export default function IndexPage() {
//   const { width } = useWindowDimensions();
//   const numColumns = getNumColumns(width);

//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);

//   const heroSource = getHeroSource(HERO);

//   useEffect(() => {
//     async function load() {
//       setLoading(true);
//       try {
//         const { products: rows } = await getProducts({
//           page: 1,
//           pageSize: 3,
//           orderBy: { column: "created_at", ascending: false },
//         });
//         setProducts(rows);
//       } catch (err) {
//         console.error("Failed to load products:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, []);

//   const isNarrow = width < 700;
//   const CONTENT_MAX_WIDTH = 1100;

//   return (
//     <View style={homeStyles.root}>
//       <ScrollView
//         contentContainerStyle={mergeForWeb(homeStyles.container, { flexGrow: 1 })}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={mergeForWeb(styles.pageInner, { maxWidth: CONTENT_MAX_WIDTH, width: "100%" })}>
//           {/* Hero */}
//           <ImageBackground
//             source={heroSource}
//             style={homeStyles.heroFull}
//             imageStyle={homeStyles.heroImage}
//             resizeMode="cover"
//           >
//             <View style={homeStyles.heroOverlay} />
//             <View style={homeStyles.heroContent}>
//               <Text style={homeStyles.heroTitle}>{HERO.title}</Text>
//               <Text style={homeStyles.heroSubtitle}>{HERO.subtitle}</Text>

//               <Link href="/product" asChild>
//                 <Pressable style={homeStyles.cta}>
//                   <Text style={homeStyles.ctaText}>Browse Collection</Text>
//                 </Pressable>
//               </Link>
//             </View>
//           </ImageBackground>

//           {/* Product cards */}
//           <View style={homeStyles.content}>
//             <Text style={homeStyles.sectionTitle}>Crafted with Care</Text>
//             <Text style={homeStyles.sectionLead}>
//               Our candles are meticulously crafted using premium natural waxes and
//               essential oils.
//             </Text>

//             {loading ? (
//               <View style={{ padding: 24, alignItems: "center" }}>
//                 <ActivityIndicator size="large" />
//                 <Text style={{ marginTop: 8 }}>Loading products…</Text>
//               </View>
//             ) : (
//               <FlatList
//                 data={products}
//                 keyExtractor={(i) => i.id}
//                 numColumns={numColumns}
//                 columnWrapperStyle={numColumns > 1 ? homeStyles.columnWrapper : undefined}
//                 renderItem={({ item }) => (
//                   <Link href={`/product/${item.id}`} asChild>
//                     <Pressable
//                       // merge style safely for web
//                       style={mergeForWeb(
//                         homeStyles.card,
//                         isNarrow ? { width: "100%" } : undefined
//                       )}
//                     >
//                       <Image
//                         source={
//                           item.image_urls?.[0]?.url
//                             ? { uri: item.image_urls[0].url }
//                             : require("../assets/images/logo.png")
//                         }
//                         style={homeStyles.cardImage}
//                       />
//                       <Text style={homeStyles.cardTitle}>{item.name}</Text>
//                       <Text style={homeStyles.cardDesc}>{item.description ?? ""}</Text>
//                     </Pressable>
//                   </Link>
//                 )}
//                 contentContainerStyle={{ paddingVertical: 8 }}
//                 scrollEnabled={false}
//               />
//             )}
//           </View>
//         </View>

//         {/* Footer */}
//         <View style={styles.footerWrapper}>
//           <View
//             style={mergeForWeb(
//               styles.footerInner,
//               isNarrow ? styles.footerInnerColumn : styles.footerInnerRow,
//               { maxWidth: CONTENT_MAX_WIDTH, width: "100%" }
//             )}
//           >
//             <View style={styles.footerLeft}>
//               <Text style={styles.footerBrand}>Candle Co.</Text>
//               <Text style={styles.footerText}>Handcrafted candles for every moment.</Text>
//             </View>

//             <View style={styles.footerLinks}>
//               {/* replaced `gap` with margin to avoid unsupported properties */}
//               <Text style={styles.footerLink}>Facebook</Text>
//               <Text style={styles.footerLink}>Instagram</Text>
//               <Text style={styles.footerLink}>Twitter</Text>
//             </View>
//           </View>

//           <Text style={styles.footerCopyright}>
//             © {new Date().getFullYear()} Candle Co. All rights reserved.
//           </Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   pageInner: {
//     alignSelf: "center",
//     width: "100%",
//   },
//   footerWrapper: {
//     marginTop: 24,
//     paddingVertical: 28,
//     paddingHorizontal: 20,
//     backgroundColor: "#0f1720",
//     alignItems: "center",
//     width: "100%",
//   },
//   footerInner: {
//     width: "100%",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//   },
//   footerInnerRow: {
//     flexDirection: "row",
//   },
//   footerInnerColumn: {
//     flexDirection: "column",
//   },
//   footerLeft: {
//     flex: 1,
//     alignItems: "flex-start",
//   },
//   footerLinks: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     // removed 'gap' which sometimes causes issues on web; use margins below
//     alignItems: "center",
//     flexWrap: "wrap",
//   },
//   footerBrand: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 18,
//   },
//   footerText: {
//     color: "#c7ccd1",
//     marginTop: 6,
//   },
//   footerLink: {
//     color: "#c7ccd1",
//     marginLeft: 12, // spacing instead of gap
//     marginRight: 12,
//     fontSize: 14,
//   },
//   footerCopyright: {
//     marginTop: 14,
//     color: "#9aa0a6",
//   },
// });


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ImageBackground,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { homeStyles } from "@/styles/home";
import { getProducts, Product } from "@/features/products/api";
import Footer from "@/components/Footer";

const HERO = {
  title: "Illuminate Your Moments",
  subtitle:
    "Discover our exquisite collection of handcrafted aromatic candles, designed to elevate your space.",
  img: "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/sign/productImages/cozy_rustic_candle_arrangement.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hODJlNzVlZC1jMzk3LTRhZTYtODY3YS1jNDRjYmVkOGI5MmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0SW1hZ2VzL2NvenlfcnVzdGljX2NhbmRsZV9hcnJhbmdlbWVudC5qcGciLCJpYXQiOjE3NTg0NTQ5NjcsImV4cCI6MjA3MzgxNDk2N30.PEH0vNDbnfgrE_nCA6AUPT-fNvGhybcYdS6rNekOeNE",
};

function getHeroSource(hero: any) {
  if (!hero?.img) return require("../assets/images/candles/product1.jpg");
  if (typeof hero.img === "number") return hero.img;
  return { uri: hero.img };
}

function getNumColumns(width: number) {
  if (width >= 1200) return 3;
  if (width >= 800) return 2;
  return 1;
}

// Helper: safely merge styles for web (returns plain object) and keep array for native
const mergeForWeb = (...styles: any[]) => {
  if (Platform.OS === "web") {
    return Object.assign(
      {},
      ...styles
        .filter(Boolean)
        .map((s) => (Array.isArray(s) ? Object.assign({}, ...s.filter(Boolean)) : s))
    );
  }
  return styles.length === 1 ? styles[0] : styles;
};

export default function IndexPage() {
  const { width } = useWindowDimensions();
  const numColumns = getNumColumns(width);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const heroSource = getHeroSource(HERO);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { products: rows } = await getProducts({
          page: 1,
          pageSize: 3,
          orderBy: { column: "created_at", ascending: false },
        });
        setProducts(rows);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isNarrow = width < 700;
  const CONTENT_MAX_WIDTH = 1100;

  return (
    <View style={homeStyles.root}>
      <ScrollView
        contentContainerStyle={mergeForWeb(homeStyles.container, { flexGrow: 1 })}
        showsVerticalScrollIndicator={false}
      >
        <View style={mergeForWeb({ alignSelf: "center", maxWidth: CONTENT_MAX_WIDTH, width: "100%" })}>
          {/* Hero */}
          <ImageBackground
            source={heroSource}
            style={homeStyles.heroFull}
            imageStyle={homeStyles.heroImage}
            resizeMode="cover"
          >
            <View style={homeStyles.heroOverlay} />
            <View style={homeStyles.heroContent}>
              <Text style={homeStyles.heroTitle}>{HERO.title}</Text>
              <Text style={homeStyles.heroSubtitle}>{HERO.subtitle}</Text>

              <Link href="/product" asChild>
                <Pressable style={homeStyles.cta}>
                  <Text style={homeStyles.ctaText}>Browse Collection</Text>
                </Pressable>
              </Link>
            </View>
          </ImageBackground>

          {/* Product cards */}
          <View style={homeStyles.content}>
            <Text style={homeStyles.sectionTitle}>Crafted with Care</Text>
            <Text style={homeStyles.sectionLead}>
              Our candles are meticulously crafted using premium natural waxes and
              essential oils.
            </Text>

            {loading ? (
              <View style={{ padding: 24, alignItems: "center" }}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 8 }}>Loading products…</Text>
              </View>
            ) : (
              <FlatList
                data={products}
                keyExtractor={(i) => i.id}
                numColumns={numColumns}
                columnWrapperStyle={numColumns > 1 ? homeStyles.columnWrapper : undefined}
                renderItem={({ item }) => (
                  <Link href={`/product/${item.id}`} asChild>
                    <Pressable
                      style={mergeForWeb(
                        homeStyles.card,
                        isNarrow ? { width: "100%" } : undefined
                      )}
                    >
                      <Image
                        source={
                          item.image_urls?.[0]?.url
                            ? { uri: item.image_urls[0].url }
                            : require("../assets/images/logo.png")
                        }
                        style={homeStyles.cardImage}
                      />
                      <Text style={homeStyles.cardTitle}>{item.name}</Text>
                      <Text style={homeStyles.cardDesc}>{item.description ?? ""}</Text>
                    </Pressable>
                  </Link>
                )}
                contentContainerStyle={{ paddingVertical: 8 }}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>

        {/* Footer */}
        <Footer />
      </ScrollView>
    </View>
  );
}
