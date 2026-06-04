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
import HeroAnimation from '@/components/HeroAnimation';


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