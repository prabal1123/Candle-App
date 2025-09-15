// // app/index.tsx
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
// } from "react-native";
// import { Link } from "expo-router";
// import { homeStyles as styles } from "@/styles";

// const PRODUCTS = [
//   {
//     id: "1",
//     name: "Scented Candle",
//     desc: "Made with essential oils.",
//     img: require("../assets/images/candles/product1.jpg"),
//   },
//   {
//     id: "2",
//     name: "Aromatherapy Candle",
//     desc: "Calming scents.",
//     img: require("../assets/images/candles/product2.jpg"),
//   },
//   {
//     id: "3",
//     name: "Luxury Soy Candle",
//     desc: "Eco-friendly soy wax.",
//     img: require("../assets/images/candles/product3.jpg"),
//   },
// ];

// export default function IndexPage() {
//   const { width } = useWindowDimensions();
//   const numColumns = width >= 1200 ? 3 : width >= 800 ? 2 : 1;

//   return (
//     <View style={styles.root}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.brand}>
//           <Image
//             source={require("../assets/images/logo.png")}
//             style={styles.logo}
//           />
//           <Text style={styles.brandText}>Candle Co.</Text>
//         </View>

//         <View style={styles.navDesktop}>
//           <Link href="/product" asChild>
//             <Pressable>
//               <Text style={styles.navLink}>Shop</Text>
//             </Pressable>
//           </Link>
//           <Link href="/about" asChild>
//             <Pressable>
//               <Text style={styles.navLink}>About</Text>
//             </Pressable>
//           </Link>
//           <Link href="/contact" asChild>
//             <Pressable>
//               <Text style={styles.navLink}>Contact</Text>
//             </Pressable>
//           </Link>
//         </View>

//         <View style={styles.headerActions}>
//           <Pressable style={styles.iconBtn} accessibilityLabel="Search">
//             <Text>🔍</Text>
//           </Pressable>

//           <Link href="/cart" asChild>
//             <Pressable style={styles.iconBtn} accessibilityLabel="Cart">
//               <Text>🛒</Text>
//             </Pressable>
//           </Link>
//         </View>
//       </View>

//       <ScrollView contentContainerStyle={styles.container}>
//         {/* Hero */}
//         <ImageBackground
//           source={require("../assets/images/candles/product1.jpg")}
//           style={styles.heroFull}
//           imageStyle={styles.heroImage}
//           resizeMode="cover"
//         >
//           <View style={styles.heroOverlay} />
//           <View style={styles.heroContent}>
//             <Text style={styles.heroTitle}>Illuminate Your Moments</Text>
//             <Text style={styles.heroSubtitle}>
//               Discover our exquisite collection of handcrafted aromatic candles,
//               designed to elevate your space.
//             </Text>

//             <Link href="/product" asChild>
//               <Pressable style={styles.cta}>
//                 <Text style={styles.ctaText}>Browse Collection</Text>
//               </Pressable>
//             </Link>
//           </View>
//         </ImageBackground>

//         {/* Product cards */}
//         <View style={styles.content}>
//           <Text style={styles.sectionTitle}>Crafted with Care</Text>
//           <Text style={styles.sectionLead}>
//             Our candles are meticulously crafted using premium natural waxes and
//             essential oils.
//           </Text>

//           <FlatList
//             data={PRODUCTS}
//             keyExtractor={(i) => i.id}
//             numColumns={numColumns}
//             columnWrapperStyle={
//               numColumns > 1 ? styles.columnWrapper : undefined
//             }
//             renderItem={({ item }) => (
//               <Link href={`/product/${item.id}`} asChild>
//                 <Pressable style={styles.card}>
//                   <Image source={item.img} style={styles.cardImage} />
//                   <Text style={styles.cardTitle}>{item.name}</Text>
//                   <Text style={styles.cardDesc}>{item.desc}</Text>
//                 </Pressable>
//               </Link>
//             )}
//             contentContainerStyle={{ paddingVertical: 8 }}
//             scrollEnabled={false}
//           />
//         </View>

//         {/* Footer */}
//         <View style={styles.footer}>
//           <View style={styles.footerInner}>
//             <View style={styles.footerLeft}>
//               <Text style={styles.footerBrand}>Candle Co.</Text>
//               <Text style={styles.footerText}>
//                 Handcrafted candles for every moment.
//               </Text>
//             </View>

//             <View style={styles.footerLinks}>
//               <Text style={styles.footerLink}>Facebook</Text>
//               <Text style={styles.footerLink}>Instagram</Text>
//               <Text style={styles.footerLink}>Twitter</Text>
//             </View>
//           </View>

//           <Text style={styles.footerCopyright}>
//             © 2025 Candle Co. All rights reserved.
//           </Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }



// app/index.tsx
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
} from "react-native";
import { Link } from "expo-router";
import { homeStyles as styles } from "@/styles";
import { PRODUCTS } from "@/data/products"; // <- use shared data source

export default function IndexPage() {
  const { width } = useWindowDimensions();
  const numColumns = width >= 1200 ? 3 : width >= 800 ? 2 : 1;

  // pick a hero product (first product) so hero uses the same data/images
  const hero = PRODUCTS.length > 0 ? PRODUCTS[0] : null;
  const heroSource =
    hero && typeof hero.img === "number" ? hero.img : hero ? { uri: (hero.img as any) } : require("../assets/images/candles/product1.jpg");

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.brandText}>Candle Co.</Text>
        </View>

        <View style={styles.navDesktop}>
          <Link href="/product" asChild>
            <Pressable>
              <Text style={styles.navLink}>Shop</Text>
            </Pressable>
          </Link>
          <Link href="/about" asChild>
            <Pressable>
              <Text style={styles.navLink}>About</Text>
            </Pressable>
          </Link>
          <Link href="/contact" asChild>
            <Pressable>
              <Text style={styles.navLink}>Contact</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.headerActions}>
          <Pressable style={styles.iconBtn} accessibilityLabel="Search">
            <Text>🔍</Text>
          </Pressable>

          <Link href="/cart" asChild>
            <Pressable style={styles.iconBtn} accessibilityLabel="Cart">
              <Text>🛒</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Hero */}
        <ImageBackground
          source={heroSource}
          style={styles.heroFull}
          imageStyle={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Illuminate Your Moments</Text>
            <Text style={styles.heroSubtitle}>
              Discover our exquisite collection of handcrafted aromatic candles,
              designed to elevate your space.
            </Text>

            <Link href="/product" asChild>
              <Pressable style={styles.cta}>
                <Text style={styles.ctaText}>Browse Collection</Text>
              </Pressable>
            </Link>
          </View>
        </ImageBackground>

        {/* Product cards */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Crafted with Care</Text>
          <Text style={styles.sectionLead}>
            Our candles are meticulously crafted using premium natural waxes and
            essential oils.
          </Text>

          <FlatList
            data={PRODUCTS}
            keyExtractor={(i) => i.id}
            numColumns={numColumns}
            columnWrapperStyle={
              numColumns > 1 ? styles.columnWrapper : undefined
            }
            renderItem={({ item }) => (
              <Link href={`/product/${item.id}`} asChild>
                <Pressable style={styles.card}>
                  <Image
                    source={typeof item.img === "number" ? item.img : ({ uri: item.img } as any)}
                    style={styles.cardImage}
                  />
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardDesc}>{item.desc}</Text>
                </Pressable>
              </Link>
            )}
            contentContainerStyle={{ paddingVertical: 8 }}
            scrollEnabled={false}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerInner}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerBrand}>Candle Co.</Text>
              <Text style={styles.footerText}>
                Handcrafted candles for every moment.
              </Text>
            </View>

            <View style={styles.footerLinks}>
              <Text style={styles.footerLink}>Facebook</Text>
              <Text style={styles.footerLink}>Instagram</Text>
              <Text style={styles.footerLink}>Twitter</Text>
            </View>
          </View>

          <Text style={styles.footerCopyright}>
            © 2025 Candle Co. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
