// app/about.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ImageBackground,
  Image,
  Dimensions,
} from "react-native";
import { Stack, Link } from "expo-router";
import { Theme } from "@/styles/theme";
// relative import (your styles file)
import { aboutStyles as styles } from "../styles/aboutStyles";

// Local assets (relative to app/about.tsx)
// Put your images at these paths (or update paths below to match your project)
const imgStory = require("../assets/images/candles/our_story.jpg"); // Our Story
const imgMission = require("../assets/images/candles/our_products.jpg"); // Our Mission
const imgValues = require("../assets/images/candles/our_values.jpeg"); // Our Values

// Team images (two separate files)
const teamSarahImg = require("../assets/images/team/product4.png");
const teamMarkImg = require("../assets/images/team/product4.png");

// TEAM data (uses two separate images)
const TEAM = [
  { name: "Sarah", role: "Co-Founder & Creative Director", img: teamSarahImg },
  { name: "Mark", role: "Co-Founder & Operations Manager", img: teamMarkImg },
];

export default function About(): JSX.Element {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: "About Candle Co" }} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBox} accessibilityElementsHidden>
            {/* Simple square logo placeholder */}
            <View style={styles.logoSquare} />
          </View>
          <Text style={styles.brandTitle}>Candle Co</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.navLinks}>
            <Link href="/" asChild>
              <Pressable style={styles.navItem}>
                <Text style={styles.navText}>Shop</Text>
              </Pressable>
            </Link>
            <Link href="/about" asChild>
              <Pressable style={styles.navItem}>
                <Text style={styles.navText}>About</Text>
              </Pressable>
            </Link>
            <Link href="/contact" asChild>
              <Pressable style={styles.navItem}>
                <Text style={styles.navText}>Contact</Text>
              </Pressable>
            </Link>
          </View>

          <View style={styles.iconButtons}>
            <Pressable style={styles.iconButton} accessibilityLabel="Search">
              <Text style={styles.iconLabel}>🔍</Text>
            </Pressable>
            <Pressable style={styles.iconButton} accessibilityLabel="Account">
              <Text style={styles.iconLabel}>👤</Text>
            </Pressable>
            <Link href="/cart" asChild>
              <Pressable style={styles.iconButton} accessibilityLabel="Cart">
                <Text style={styles.iconLabel}>🛍️</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentWrap}>
        <View style={styles.content}>
          {/* Our Story */}
          <View style={styles.titleRow}>
            <Text style={styles.pageTitle}>Our Story</Text>
          </View>

          <Text style={styles.lead}>
            At Candle Co, our journey began with a simple desire: to create candles that
            not only illuminate spaces but also evoke emotions and memories. Founded in
            2018 by Sarah and Mark, our company is built on a passion for craftsmanship,
            quality ingredients, and sustainable practices. We believe in the power of scent
            to transform environments and enhance well-being, and we strive to deliver
            products that embody these principles.
          </Text>

          <ImageBackground
            source={imgStory}
            style={styles.heroBlock}
            imageStyle={styles.heroImage}
            accessible
            accessibilityLabel="Our Story image"
          />

          {/* Our Mission */}
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.paragraph}>
            Our mission is to craft exceptional candles that bring warmth, comfort, and joy
            into people's lives. We are committed to using natural, ethically sourced materials
            and employing traditional techniques to ensure the highest quality. We aim to inspire
            moments of relaxation and connection through our thoughtfully designed scents and
            sustainable practices.
          </Text>

          <ImageBackground
            source={imgMission}
            style={styles.heroBlock}
            imageStyle={styles.heroImage}
            accessible
            accessibilityLabel="Our Mission image"
          />

          {/* Our Values */}
          <Text style={styles.sectionTitle}>Our Values</Text>
          <Text style={styles.paragraph}>
            At Candle Co, our values guide everything we do. We are dedicated to:
            {"\n\n"}
            <Text style={styles.strong}>Quality:</Text> We use only the finest natural ingredients and meticulous craftsmanship to create candles that meet our high standards.
            {"\n\n"}
            <Text style={styles.strong}>Sustainability:</Text> We are committed to eco-friendly practices, from sourcing materials to packaging, to minimize our environmental impact.
            {"\n\n"}
            <Text style={styles.strong}>Community:</Text> We foster a supportive and inclusive environment for our team and engage with our customers to build lasting relationships.
            {"\n\n"}
            <Text style={styles.strong}>Creativity:</Text> We continuously explore new scents and designs, pushing the boundaries of candle making to offer unique and inspiring products.
          </Text>

          <ImageBackground
            source={imgValues}
            style={styles.heroBlock}
            imageStyle={styles.heroImage}
            accessible
            accessibilityLabel="Our Values image"
          />

          {/* Meet the Team */}
          <Text style={styles.sectionTitle}>Meet the Team</Text>

          <View style={styles.teamGrid}>
            {TEAM.map((member) => (
              <View key={member.name} style={styles.teamCard}>
                <View style={styles.avatarWrap}>
                  <Image source={member.img} style={styles.avatar} accessibilityLabel={member.name} />
                </View>

                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{member.name}</Text>
                  <Text style={styles.teamRole}>{member.role}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
