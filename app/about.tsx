// app/about.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ImageBackground,
  Image,
} from "react-native";
import { Stack, Link } from "expo-router";
import { aboutStyles as styles } from "../styles/aboutStyles";

// Local assets
const imgStory = require("../assets/images/our_story1.jpg");
const imgMission = require("../assets/images/candles/our_products.jpg");
const imgValues = require("../assets/images/candles/our_values.jpeg");

const teamSarahImg = require("../assets/images/team/product4.png");
const teamMarkImg = require("../assets/images/team/product4.png");

const TEAM = [
  { name: "Sarah", role: "Co-Founder & Creative Director", img: teamSarahImg },
  { name: "Mark", role: "Co-Founder & Operations Manager", img: teamMarkImg },
];

export default function About(): JSX.Element {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* set page title in the native stack header (your layout provides the global navbar) */}
      <Stack.Screen options={{ title: "About Candle Co" }} />

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
