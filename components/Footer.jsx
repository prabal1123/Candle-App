// import React from "react";
// import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions } from "react-native";
// import { Link } from "expo-router";
// import * as Linking from "expo-linking";

// // Helper: safely merge styles for web (returns plain object) and keep array for native
// const mergeForWeb = (...styles) => {
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

// export default function Footer() {
//   const { width } = useWindowDimensions();
//   const isMobile = width < 520;
//   const CONTENT_MAX_WIDTH = isMobile ? 520 : 1100;
//   const year = new Date().getFullYear();

//   const openExternal = (url) => {
//     try {
//       Linking.openURL(url);
//     } catch (e) {
//       console.error("Failed to open url:", url, e);
//     }
//   };

//   return (
//     <View style={[styles.wrapper, isMobile && styles.wrapperMobile]}>
//       <View style={mergeForWeb(styles.inner, { maxWidth: CONTENT_MAX_WIDTH, width: "100%" })}>
//         {/* Brand */}
//         <View style={styles.centerBlock}>
//           <Text style={[styles.brand, isMobile && styles.brandMobile]}>The Happy Candles.    </Text>
//           <Text style={styles.tagline}>Handcrafted candles for every moment.</Text>
//         </View>

//         {/* Compact Links */}
//         <View style={[styles.centerBlock, styles.linkRow]}>
//           <Link href="/privacy" asChild>
//             <Pressable accessibilityRole="link"><Text style={styles.link}>Privacy</Text></Pressable>
//           </Link>
//           <Text style={styles.dot}>•</Text>
//           <Link href="/terms" asChild>
//             <Pressable accessibilityRole="link"><Text style={styles.link}>Terms</Text></Pressable>
//           </Link>
//           <Text style={styles.dot}>•</Text>
//           <Link href="/faq" asChild>
//             <Pressable accessibilityRole="link"><Text style={styles.link}>FAQ</Text></Pressable>
//           </Link>
//           <Text style={styles.dot}>•</Text>
//           <Link href="/contact" asChild>
//             <Pressable accessibilityRole="link"><Text style={styles.link}>Contact</Text></Pressable>
//           </Link>
//         </View>

//         {/* Social */}
//         <View style={[styles.centerBlock, styles.linkRow]}>
//           <Pressable accessibilityRole="link" onPress={() => openExternal("https://instagram.com/")}> 
//             <Text style={styles.link}>Instagram</Text>
//           </Pressable>
//           <Text style={styles.dot}>•</Text>
//           <Pressable accessibilityRole="link" onPress={() => openExternal("https://twitter.com/")}> 
//             <Text style={styles.link}>Twitter/X</Text>
//           </Pressable>
//           <Text style={styles.dot}>•</Text>
//           <Pressable accessibilityRole="link" onPress={() => openExternal("https://facebook.com/")}> 
//             <Text style={styles.link}>Facebook</Text>
//           </Pressable>
//         </View>
//       </View>

//       <Text style={[styles.copy, isMobile && styles.copyMobile]}>© {year} The Happy Candles. All rights reserved.</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     marginTop: 24,
//     paddingVertical: 22,
//     paddingHorizontal: 20,
//     backgroundColor: "#0f1720",
//     alignItems: "center",
//     width: "100%",
//   },
//   wrapperMobile: {
//     paddingVertical: 14,
//     paddingHorizontal: 14,
//   },
//   inner: {
//     width: "100%",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   centerBlock: {
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginBottom: 8,
//   },
//   brand: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 18,
//     marginBottom: 4,
//   },
//   brandMobile: {
//     fontSize: 16,
//   },
//   tagline: {
//     color: "#c7ccd1",
//     fontSize: 13,
//     textAlign: "center",
//   },
//   linkRow: {
//     marginTop: 6,
//   },
//   link: {
//     color: "#c7ccd1",
//     fontSize: 14,
//     marginVertical: 4,
//     marginHorizontal: 6,
//   },
//   dot: {
//     color: "#6b7280",
//     marginHorizontal: 4,
//   },
//   copy: {
//     marginTop: 10,
//     color: "#9aa0a6",
//     fontSize: 12,
//     textAlign: "center",
//   },
//   copyMobile: {
//     fontSize: 11,
//   },
// });


import React from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { Link } from "expo-router";
import * as Linking from "expo-linking";

export default function Footer() {
  const { width } = useWindowDimensions();
  const isMobile = width < 520;
  const CONTENT_MAX_WIDTH = isMobile ? 520 : 1100;
  const year = new Date().getFullYear();

  const openExternal = (url) => {

    try {
      Linking.openURL(url);
    } catch (e) {
      console.error("Failed to open url:", url, e);
    }
  };

  return (
    <View style={[styles.wrapper, isMobile && styles.wrapperMobile]}>
      <View style={[styles.inner, { maxWidth: CONTENT_MAX_WIDTH, width: "100%" }]}>
        {/* Brand + Tagline (stacked) */}
        <View style={styles.brandBlock}>
          <Text style={[styles.brand, isMobile && styles.brandMobile]}>
            The Happy Candles.
          </Text>
          <Text style={styles.tagline}>Handcrafted candles for every moment.</Text>
        </View>

        {/* Compact Links */}
        <View style={[styles.rowCenter, styles.linkRow]}>
          <Link href="/privacy" asChild>
            <Pressable accessibilityRole="link">
              <Text style={styles.link}>Privacy</Text>
            </Pressable>
          </Link>
          <Text style={styles.dot}>•</Text>
          <Link href="/terms" asChild>
            <Pressable accessibilityRole="link">
              <Text style={styles.link}>Terms</Text>
            </Pressable>
          </Link>
          <Text style={styles.dot}>•</Text>
          <Link href="/faq" asChild>
            <Pressable accessibilityRole="link">
              <Text style={styles.link}>FAQ</Text>
            </Pressable>
          </Link>
          <Text style={styles.dot}>•</Text>
          <Link href="/contact" asChild>
            <Pressable accessibilityRole="link">
              <Text style={styles.link}>Contact</Text>
            </Pressable>
          </Link>
        </View>

        {/* Social */}
        <View style={[styles.rowCenter, styles.linkRow]}>
          <Pressable accessibilityRole="link" onPress={() => openExternal("https://instagram.com/")}>
            <Text style={styles.link}>Instagram</Text>
          </Pressable>
          <Text style={styles.dot}>•</Text>
          <Pressable accessibilityRole="link" onPress={() => openExternal("https://twitter.com/")}>
            <Text style={styles.link}>Twitter/X</Text>
          </Pressable>
          <Text style={styles.dot}>•</Text>
          <Pressable accessibilityRole="link" onPress={() => openExternal("https://facebook.com/")}>
            <Text style={styles.link}>Facebook</Text>
          </Pressable>
        </View>
      </View>

      <Text style={[styles.copy, isMobile && styles.copyMobile]}>
        © {year} The Happy Candles. All rights reserved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
    paddingVertical: 22,
    paddingHorizontal: 20,
    backgroundColor: "#0f1720",
    alignItems: "center",
    width: "100%",
  },
  wrapperMobile: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  inner: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  // Brand block stacked vertically so tagline is below the title
  brandBlock: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  brand: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 4,
    textAlign: "center",
  },
  brandMobile: {
    fontSize: 16,
  },
  tagline: {
    color: "#c7ccd1",
    fontSize: 13,
    textAlign: "center",
  },

  // Generic horizontal row used for link groups
  rowCenter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  linkRow: {
    marginTop: 6,
  },
  link: {
    color: "#c7ccd1",
    fontSize: 14,
    marginVertical: 4,
    marginHorizontal: 6,
  },
  dot: {
    color: "#6b7280",
    marginHorizontal: 4,
  },
  copy: {
    marginTop: 10,
    color: "#9aa0a6",
    fontSize: 12,
    textAlign: "center",
  },
  copyMobile: {
    fontSize: 11,
  },
});
