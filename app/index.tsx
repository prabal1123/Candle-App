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
//   Platform,
// } from "react-native";
// import { Link } from "expo-router";
// import { homeStyles } from "@/styles/home";
// import { getProducts, Product } from "@/features/products/api";
// import Footer from "@/components/Footer";

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
//     return Object.assign(
//       {},
//       ...styles
//         .filter(Boolean)
//         .map((s) => (Array.isArray(s) ? Object.assign({}, ...s.filter(Boolean)) : s))
//     );
//   }
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
//         <View style={mergeForWeb({ alignSelf: "center", maxWidth: CONTENT_MAX_WIDTH, width: "100%" })}>
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
//                       style={mergeForWeb(
//                         homeStyles.card,
//                         isNarrow ? { width: "100%" } : undefined,
//                         { touchAction: "pan-y" } // ✅ allow vertical scrolling when swiping on card (web/PWA)
//                       )}
//                       hitSlop={10}
//                     >
//                       <Image
//                         // ✅ prevent the image from capturing drag/select/long-press
//                         pointerEvents="none"
//                         // @ts-ignore: forwarded to <img> on web
//                         draggable={false}
//                         style={mergeForWeb(
//                           homeStyles.cardImage,
//                           { userSelect: "none" } // ✅ avoid text/image selection on web
//                         )}
//                         source={
//                           item.image_urls?.[0]?.url
//                             ? { uri: item.image_urls[0].url }
//                             : require("../assets/images/logo.png")
//                         }
//                       />
//                       <Text style={homeStyles.cardTitle}>{item.name}</Text>
//                       <Text style={homeStyles.cardDesc}>{item.description ?? ""}</Text>
//                     </Pressable>
//                   </Link>
//                 )}
//                 contentContainerStyle={{ paddingVertical: 8 }}
//                 scrollEnabled={false} // outer ScrollView handles scrolling
//               />
//             )}
//           </View>
//         </View>

//         {/* Footer */}
//         <Footer />
//       </ScrollView>
//     </View>
//   );
// }

import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ImageBackground,
  FlatList,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { homeStyles } from "@/styles/home";
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

// ▶️ New: hard-coded categories to replace the 3 product cards
const CATEGORIES = [
  {
    title: "Jar & Container",
    slug: "jar",
    // Use your own images or local assets here
    image:
      "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/public/Product%20List/nordy2.jpg",
    subtitle: "All jar / tin / container candles",
  },
  {
    title: "Gift Set",
    slug: "gift-set",
    image:
      "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/public/Product%20List/vanilla_gift.jpg",
    subtitle: "Curated bundles perfect for gifting",
  },
  {
    title: "Decorative",
    slug: "decorative",
    image:
      "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/public/Product%20List/hd_floating_candles_with_flowers.jpg",
    subtitle: "Aesthetic & artisanal pieces",
  },
] as const;

export default function IndexPage() {
  const { width } = useWindowDimensions();
  const numColumns = getNumColumns(width);
  const heroSource = getHeroSource(HERO);
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

          {/* Shop by Category (replaces the 3 latest products) */}
          <View style={homeStyles.content}>
            <Text style={homeStyles.sectionTitle}>Shop by Category</Text>
            <Text style={homeStyles.sectionLead}>
              Explore our range by type. Tap a card to see all products in that category.
            </Text>

            <FlatList
              data={CATEGORIES}
              keyExtractor={(i) => i.slug}
              numColumns={numColumns}
              columnWrapperStyle={numColumns > 1 ? homeStyles.columnWrapper : undefined}
              renderItem={({ item }) => (
                <Link href={{ pathname: "/product", params: { category: item.slug } }} asChild>
                  <Pressable
                    style={mergeForWeb(
                      homeStyles.card,
                      isNarrow ? { width: "100%" } : undefined,
                      { touchAction: "pan-y" }
                    )}
                    hitSlop={10}
                  >
                    <Image
                      pointerEvents="none"
                      // @ts-ignore: forwarded to <img> on web
                      draggable={false}
                      style={mergeForWeb(homeStyles.cardImage, { userSelect: "none" })}
                      source={typeof item.image === "string" ? { uri: item.image } : item.image}
                    />
                    <Text style={homeStyles.cardTitle}>{item.title}</Text>
                    <Text style={homeStyles.cardDesc}>{item.subtitle}</Text>
                  </Pressable>
                </Link>
              )}
              contentContainerStyle={{ paddingVertical: 8 }}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* Footer */}
        <Footer />
      </ScrollView>
    </View>
  );
}
