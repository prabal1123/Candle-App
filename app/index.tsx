
// import React from "react";
// import {
//   View,
//   Text,
//   Pressable,
//   ScrollView,
//   Image,
//   ImageBackground,
//   FlatList,
//   useWindowDimensions,
//   Platform,
// } from "react-native";
// import { Link } from "expo-router";
// import { homeStyles } from "@/styles/home";
// import Footer from "@/components/Footer";

// const HERO = {
//   title: "Illuminate Your Moments",
//   subtitle:
//     "Discover our exquisite collection of handcrafted aromatic candles, designed to elevate your space.",
//   img: "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/public/Product%20List/cover.jpeg",
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

// // ▶️ New: hard-coded categories to replace the 3 product cards
// const CATEGORIES = [
//   {
//     title: "Jar & Container",
//     slug: "jar",
//     // Use your own images or local assets here
//     image:
//       "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/public/Product%20List/nordy2.jpg",
//     subtitle: "Jars, tins & containers",
//   },
//   {
//     title: "Decor & Gifts ",
//     slug: "gift-set",
//     image:
//       "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/public/Product%20List/vanilla_gift.jpg",
//     subtitle: "Curated bundles perfect for gifting",
//   },
//   // {
//   //   title: "Decorative",
//   //   slug: "decorative",
//   //   image:
//   //     "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/public/Product%20List/hd_floating_candles_with_flowers.jpg",
//   //   subtitle: "Aesthetic & artisanal pieces",
//   // },
// ] as const;

// export default function IndexPage() {
//   const { width } = useWindowDimensions();
//   const numColumns = getNumColumns(width);
//   const heroSource = getHeroSource(HERO);
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

//           {/* Shop by Category (replaces the 3 latest products) */}
//           <View style={homeStyles.content}>
//             <Text style={homeStyles.sectionTitle}>Shop by Category</Text>
//             <Text style={homeStyles.sectionLead}>
//               Explore our range by type. Tap a card to see all products in that category.
//             </Text>

//             <FlatList
//               data={CATEGORIES}
//               keyExtractor={(i) => i.slug}
//               numColumns={numColumns}
//               columnWrapperStyle={numColumns > 1 ? homeStyles.columnWrapper : undefined}
//               renderItem={({ item }) => (
//                 <Link href={{ pathname: "/product", params: { category: item.slug } }} asChild>
//                   <Pressable
//                     style={mergeForWeb(
//                       homeStyles.card,
//                       isNarrow ? { width: "100%" } : undefined,
//                       { touchAction: "pan-y" }
//                     )}
//                     hitSlop={10}
//                   >
//                     <Image
//                       pointerEvents="none"
//                       // @ts-ignore: forwarded to <img> on web
//                       draggable={false}
//                       style={mergeForWeb(homeStyles.cardImage, { userSelect: "none" })}
//                       source={typeof item.image === "string" ? { uri: item.image } : item.image}
//                     />
//                     <Text style={homeStyles.cardTitle}>{item.title}</Text>
//                     <Text style={homeStyles.cardDesc}>{item.subtitle}</Text>
//                   </Pressable>
//                 </Link>
//               )}
//               contentContainerStyle={{ paddingVertical: 8 }}
//               scrollEnabled={false}
//             />
//           </View>
//         </View>

//         {/* Footer */}
//         <Footer />
//       </ScrollView>
//     </View>
//   );
// }


import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Animated,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { homeStyles } from "@/styles/home";
import Footer from "@/components/Footer";

// 1. Updated Image Array with 3 images
const HERO_IMAGES = [
  "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/public/Product%20List/cover.jpeg",
  "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/public/Product%20List/cover_image_2.jpeg",
  "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/public/Product%20List/cover_3.jpeg"
];

const HERO_TEXT = {
  title: "Illuminate Your Moments",
  subtitle: "Discover our exquisite collection of handcrafted aromatic candles, designed to elevate your space.",
};

const CATEGORIES = [
  {
    title: "Jar & Container",
    slug: "jar",
    image: "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/public/Product%20List/nordy2.jpg",
    subtitle: "Jars, tins & containers",
  },
  {
    title: "Decor & Gifts",
    slug: "gift-set",
    image: "https://bybxickqlfiirrjkvuoq.supabase.co/storage/v1/object/public/Product%20List/vanilla_gift.jpg",
    subtitle: "Curated bundles perfect for gifting",
  },
] as const;

function getNumColumns(width: number) {
  if (width >= 1200) return 2; // Adjusted for your 2-category layout
  if (width >= 800) return 2;
  return 1;
}

const mergeForWeb = (...styles: any[]) => {
  if (Platform.OS === "web") {
    return Object.assign(
      {},
      ...styles.filter(Boolean).map((s) => (Array.isArray(s) ? Object.assign({}, ...s.filter(Boolean)) : s))
    );
  }
  return styles.length === 1 ? styles[0] : styles;
};

export default function IndexPage() {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Initial opacity 1

  const numColumns = getNumColumns(width);
  const isNarrow = width < 700;
  const CONTENT_MAX_WIDTH = 1100;

  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Start Fade Out
      Animated.timing(fadeAnim, {
        toValue: 0.7, // Subtle dip in opacity
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // 2. Change Image
        setIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        
        // 3. Start Fade In
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      });
    }, 3000); // 3 seconds interval

    return () => clearInterval(timer);
  }, [fadeAnim]);

  return (
    <View style={homeStyles.root}>
      <ScrollView
        contentContainerStyle={mergeForWeb(homeStyles.container, { flexGrow: 1 })}
        showsVerticalScrollIndicator={false}
      >
        <View style={mergeForWeb({ alignSelf: "center", maxWidth: CONTENT_MAX_WIDTH, width: "100%" })}>
          
          {/* Animated Hero Section */}
          <View style={homeStyles.heroFull}>
            <Animated.Image
              source={{ uri: HERO_IMAGES[index] }}
              style={[
                homeStyles.heroImage, 
                { 
                  opacity: fadeAnim,
                  position: 'absolute',
                  width: '100%',
                  height: '100%'
                }
              ]}
              resizeMode="cover"
            />
            
            {/* Overlay and Content stays static so text is always readable */}
            <View style={homeStyles.heroOverlay} />
            <View style={homeStyles.heroContent}>
              <Text style={homeStyles.heroTitle}>{HERO_TEXT.title}</Text>
              <Text style={homeStyles.heroSubtitle}>{HERO_TEXT.subtitle}</Text>

              <Link href="/product" asChild>
                <Pressable style={homeStyles.cta}>
                  <Text style={homeStyles.ctaText}>Browse Collection</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          {/* Shop by Category */}
          <View style={homeStyles.content}>
            <Text style={homeStyles.sectionTitle}>Shop by Category</Text>
            <Text style={homeStyles.sectionLead}>
              Explore our range by type. Tap a card to see all products in that category.
            </Text>

            <View style={{ flexDirection: numColumns > 1 ? 'row' : 'column', gap: 20, paddingVertical: 10 }}>
              {CATEGORIES.map((item) => (
                <Link key={item.slug} href={{ pathname: "/product", params: { category: item.slug } }} asChild>
                  <Pressable
                    style={mergeForWeb(
                      homeStyles.card,
                      { flex: numColumns > 1 ? 1 : undefined, width: "100%", touchAction: "pan-y" }
                    )}
                  >
                    <Image
                      style={homeStyles.cardImage}
                      source={{ uri: item.image }}
                    />
                    <Text style={homeStyles.cardTitle}>{item.title}</Text>
                    <Text style={homeStyles.cardDesc}>{item.subtitle}</Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}